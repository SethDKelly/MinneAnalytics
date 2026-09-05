import type {
  Prisma,
  PublicationAvailability,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";

export const DECK_ARCHIVE_SURFACE_KEY = "deck-archive";
export const PUBLICATION_UNPUBLISH_SUBMISSION_EFFECT = "publication-unpublish-submission:";
export const PUBLICATION_UNPUBLISH_ARTIFACT_EFFECT = "publication-unpublish-artifact:";

export class PublicationPolicyError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PublicationPolicyError";
    this.code = code;
  }
}

export class PublicationHeadConflictError extends Error {
  readonly code = "PUBLICATION_STALE_HEAD";

  constructor(message = "Publication state changed before this command committed") {
    super(message);
    this.name = "PublicationHeadConflictError";
  }
}

type CutoverRow = { cutover_at: Date | string };

async function hasPublicationCutover(
  client: Prisma.TransactionClient | typeof prisma,
  conferenceId: string
): Promise<boolean> {
  const rows = await client.$queryRawUnsafe<CutoverRow[]>(
    'SELECT cutover_at FROM "PublicationPolicyCutover" WHERE conference_id = ? LIMIT 1',
    conferenceId
  );
  return Boolean(rows[0]);
}

async function ensurePublicationCutover(
  tx: Prisma.TransactionClient,
  conferenceId: string,
  at = new Date()
) {
  await tx.$executeRawUnsafe(
    'INSERT INTO "PublicationPolicyCutover" (conference_id, cutover_at) VALUES (?, ?) ON CONFLICT(conference_id) DO NOTHING',
    conferenceId,
    at
  );
}

export async function usesExactPublicationAuthorization(conferenceId: string) {
  if (isImplementationGateEnabled("publicationWrites")) return true;
  return hasPublicationCutover(prisma, conferenceId);
}

type EligibilityShape = {
  id: string;
  currentAssessment: { disposition: "CONCERN" | "READY" } | null;
  deliverable: { currentArtifactId: string | null } | null;
  submission: {
    currentSelectionDecision: { disposition: "SELECTED" | "RESERVE" | "NOT_SELECTED" | null } | null;
    withdrawal: { id: string } | null;
    currentShareEligibilityChange: { eligible: boolean } | null;
  };
};

export function exactDeckPublicationEligibility(file: EligibilityShape): {
  eligible: boolean;
  code: string;
  message: string;
} {
  if (!file.deliverable || file.deliverable.currentArtifactId !== file.id) {
    return {
      eligible: false,
      code: "PUBLICATION_NOT_CURRENT_ARTIFACT",
      message: "Only the exact current deliverable artifact can be published on the deck archive surface",
    };
  }
  if (file.currentAssessment?.disposition !== "READY") {
    return {
      eligible: false,
      code: "PUBLICATION_ARTIFACT_NOT_READY",
      message: "The exact artifact is not ready for publication",
    };
  }
  if (file.submission.currentShareEligibilityChange?.eligible !== true) {
    return {
      eligible: false,
      code: "PUBLICATION_SHARING_NOT_ALLOWED",
      message: "Current public-sharing policy does not allow this material to be published",
    };
  }
  if (
    file.submission.currentSelectionDecision?.disposition !== "SELECTED" ||
    file.submission.withdrawal
  ) {
    return {
      eligible: false,
      code: "PUBLICATION_PARTICIPATION_INELIGIBLE",
      message: "Current participation does not permit this material to be published",
    };
  }
  return { eligible: true, code: "PUBLICATION_ELIGIBLE", message: "" };
}

async function appendPublicationStateTx(
  tx: Prisma.TransactionClient,
  input: {
    conferenceId: string;
    deckFileId: string;
    availability: PublicationAvailability;
    actorRef: string;
    requireEligibility?: boolean;
  }
) {
  if (input.requireEligibility && input.availability === "PUBLISHED") {
    const file = await tx.deckFile.findFirst({
      where: {
        id: input.deckFileId,
        submission: { conferenceId: input.conferenceId },
      },
      include: {
        currentAssessment: true,
        deliverable: true,
        submission: {
          include: {
            currentSelectionDecision: true,
            withdrawal: true,
            currentShareEligibilityChange: true,
          },
        },
      },
    });
    if (!file) {
      throw new PublicationPolicyError("PUBLICATION_MATERIAL_NOT_FOUND", "Material not found");
    }
    const eligibility = exactDeckPublicationEligibility(file);
    if (!eligibility.eligible) {
      throw new PublicationPolicyError(eligibility.code, eligibility.message);
    }
  }

  let publication = await tx.publication.findUnique({
    where: {
      deckFileId_publicSurfaceKey: {
        deckFileId: input.deckFileId,
        publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY,
      },
    },
    include: { currentState: true },
  });

  if (!publication && input.availability === "UNPUBLISHED") {
    return { publication: null, state: null, replayed: true };
  }

  if (!publication) {
    publication = await tx.publication.create({
      data: {
        conferenceId: input.conferenceId,
        deckFileId: input.deckFileId,
        publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY,
      },
      include: { currentState: true },
    });
  }

  if (publication.currentState?.availability === input.availability) {
    return {
      publication,
      state: publication.currentState,
      replayed: true,
    };
  }

  const at = new Date();
  const state = await tx.publicationState.create({
    data: {
      publicationId: publication.id,
      availability: input.availability,
      recordedByRef: input.actorRef,
      recordedAt: at,
      predecessorStateId: publication.currentState?.id ?? null,
    },
  });

  const advanced = await tx.publication.updateMany({
    where: {
      id: publication.id,
      currentStateId: publication.currentState?.id ?? null,
    },
    data: { currentStateId: state.id },
  });
  if (advanced.count !== 1) throw new PublicationHeadConflictError();

  return {
    publication: { ...publication, currentStateId: state.id },
    state,
    replayed: false,
  };
}

export async function enqueuePublicationCleanupTx(
  tx: Prisma.TransactionClient,
  input:
    | { sourceRef: string; submissionId: string }
    | { sourceRef: string; artifactId: string }
) {
  const effectKey =
    "submissionId" in input
      ? `${PUBLICATION_UNPUBLISH_SUBMISSION_EFFECT}${input.submissionId}`
      : `${PUBLICATION_UNPUBLISH_ARTIFACT_EFFECT}${input.artifactId}`;

  return tx.synchronizationWork.upsert({
    where: {
      syncId_sourceRef_effectKey: {
        syncId: "SYNC-008",
        sourceRef: input.sourceRef,
        effectKey,
      },
    },
    create: {
      syncId: "SYNC-008",
      sourceRef: input.sourceRef,
      effectKey,
    },
    update: {},
  });
}

async function unpublishSubmissionPublicationsTx(
  tx: Prisma.TransactionClient,
  submissionId: string,
  actorRef: string
) {
  const publications = await tx.publication.findMany({
    where: {
      publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY,
      deckFile: { submissionId },
    },
    include: { currentState: true },
  });
  for (const publication of publications) {
    if (publication.currentState?.availability !== "PUBLISHED") continue;
    await appendPublicationStateTx(tx, {
      conferenceId: publication.conferenceId,
      deckFileId: publication.deckFileId,
      availability: "UNPUBLISHED",
      actorRef,
    });
  }
}

async function unpublishArtifactPublicationTx(
  tx: Prisma.TransactionClient,
  artifactId: string,
  actorRef: string
) {
  const publication = await tx.publication.findUnique({
    where: {
      deckFileId_publicSurfaceKey: {
        deckFileId: artifactId,
        publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY,
      },
    },
    include: { currentState: true },
  });
  if (!publication || publication.currentState?.availability !== "PUBLISHED") return;
  await appendPublicationStateTx(tx, {
    conferenceId: publication.conferenceId,
    deckFileId: publication.deckFileId,
    availability: "UNPUBLISHED",
    actorRef,
  });
}

export async function processPublicationCleanupForSource(
  sourceRef: string,
  actorRef: string
): Promise<{ pending: number }> {
  const work = await prisma.synchronizationWork.findMany({
    where: {
      syncId: "SYNC-008",
      sourceRef,
      state: { in: ["PENDING", "BLOCKED"] },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const item of work) {
    await prisma.$transaction(async (tx) => {
      const current = await tx.synchronizationWork.findUnique({ where: { id: item.id } });
      if (!current || current.state === "COMPLETED") return;

      try {
        if (current.effectKey.startsWith(PUBLICATION_UNPUBLISH_SUBMISSION_EFFECT)) {
          const submissionId = current.effectKey.slice(
            PUBLICATION_UNPUBLISH_SUBMISSION_EFFECT.length
          );
          await unpublishSubmissionPublicationsTx(tx, submissionId, actorRef);
        } else if (current.effectKey.startsWith(PUBLICATION_UNPUBLISH_ARTIFACT_EFFECT)) {
          const artifactId = current.effectKey.slice(
            PUBLICATION_UNPUBLISH_ARTIFACT_EFFECT.length
          );
          await unpublishArtifactPublicationTx(tx, artifactId, actorRef);
        } else {
          throw new Error(`Unsupported SYNC-008 effect ${current.effectKey}`);
        }

        await tx.synchronizationWork.update({
          where: { id: current.id },
          data: {
            state: "COMPLETED",
            attempts: { increment: 1 },
            lastAttemptAt: new Date(),
            lastError: null,
            completedAt: new Date(),
          },
        });
      } catch (error) {
        await tx.synchronizationWork.update({
          where: { id: current.id },
          data: {
            state: "BLOCKED",
            attempts: { increment: 1 },
            lastAttemptAt: new Date(),
            lastError: error instanceof Error ? error.message : "Unknown publication cleanup error",
          },
        });
      }
    });
  }

  return {
    pending: await prisma.synchronizationWork.count({
      where: {
        syncId: "SYNC-008",
        sourceRef,
        state: { not: "COMPLETED" },
      },
    }),
  };
}

export async function recordShareEligibilityChange(input: {
  conferenceId: string;
  submissionId: string;
  eligible: boolean;
  actorRef: string;
}) {
  const result = await prisma.$transaction(async (tx) => {
    const conference = await tx.conference.findUnique({
      where: { id: input.conferenceId },
      include: { archiveRecord: true },
    });
    if (!conference) {
      throw new PublicationPolicyError("CONTEXT_NOT_FOUND", "Conference not found");
    }
    if (conference.status === "DRAFT" && !conference.archiveRecord) {
      throw new PublicationPolicyError(
        "CONTEXT_NOT_OPERATIONAL",
        "Public-sharing policy is unavailable while the conference is in setup"
      );
    }

    const submission = await tx.submission.findFirst({
      where: { id: input.submissionId, conferenceId: input.conferenceId },
      include: { currentShareEligibilityChange: true },
    });
    if (!submission) {
      throw new PublicationPolicyError("SUBMISSION_NOT_FOUND", "Submission not found");
    }

    await ensurePublicationCutover(tx, conference.id);

    const current = submission.currentShareEligibilityChange;
    if (current?.eligible === input.eligible) {
      if (submission.deckShareable !== input.eligible) {
        await tx.submission.update({
          where: { id: submission.id },
          data: { deckShareable: input.eligible },
        });
      }
      return { change: current, replayed: true, cleanupSourceRef: null };
    }

    const change = await tx.shareEligibilityChange.create({
      data: {
        submissionId: submission.id,
        eligible: input.eligible,
        changedByRef: input.actorRef,
        changedAt: new Date(),
        predecessorChangeId: current?.id ?? null,
      },
    });
    const advanced = await tx.submission.updateMany({
      where: {
        id: submission.id,
        currentShareEligibilityChangeId: current?.id ?? null,
      },
      data: {
        currentShareEligibilityChangeId: change.id,
        deckShareable: input.eligible,
      },
    });
    if (advanced.count !== 1) {
      throw new PublicationPolicyError(
        "SHARE_POLICY_STALE_HEAD",
        "Public-sharing policy changed before this command committed"
      );
    }

    if (!input.eligible) {
      await enqueuePublicationCleanupTx(tx, {
        sourceRef: change.id,
        submissionId: submission.id,
      });
    }

    return {
      change,
      replayed: false,
      cleanupSourceRef: !input.eligible ? change.id : null,
    };
  });

  const cleanup = result.cleanupSourceRef
    ? await processPublicationCleanupForSource(result.cleanupSourceRef, input.actorRef)
    : { pending: 0 };

  return {
    change: result.change,
    replayed: result.replayed,
    cleanupPending: cleanup.pending,
  };
}

export async function setDeckArchivePublication(input: {
  conferenceId: string;
  publish: boolean;
  actorRef: string;
}) {
  return prisma.$transaction(async (tx) => {
    const conference = await tx.conference.findUnique({
      where: { id: input.conferenceId },
      include: { archiveRecord: true },
    });
    if (!conference) {
      throw new PublicationPolicyError("CONTEXT_NOT_FOUND", "Conference not found");
    }
    if (input.publish && conference.status === "DRAFT" && !conference.archiveRecord) {
      throw new PublicationPolicyError(
        "PUBLICATION_CONTEXT_NOT_READY",
        "The deck archive cannot be published while the conference is in setup"
      );
    }

    await ensurePublicationCutover(tx, conference.id);
    let transitioned = 0;

    if (input.publish) {
      const deliverables = await tx.deliverableRequirement.findMany({
        where: {
          kindKey: "deck",
          submission: { conferenceId: conference.id },
        },
        include: {
          currentArtifact: {
            include: {
              currentAssessment: true,
              deliverable: true,
              submission: {
                include: {
                  currentSelectionDecision: true,
                  withdrawal: true,
                  currentShareEligibilityChange: true,
                },
              },
            },
          },
        },
      });

      for (const deliverable of deliverables) {
        const artifact = deliverable.currentArtifact;
        if (!artifact) continue;
        const eligibility = exactDeckPublicationEligibility(artifact);
        if (!eligibility.eligible) continue;
        const result = await appendPublicationStateTx(tx, {
          conferenceId: conference.id,
          deckFileId: artifact.id,
          availability: "PUBLISHED",
          actorRef: input.actorRef,
        });
        if (!result.replayed) transitioned += 1;
      }

      await tx.conference.update({
        where: { id: conference.id },
        data: { decksPublished: true, decksPublishedAt: new Date() },
      });
    } else {
      const publications = await tx.publication.findMany({
        where: {
          conferenceId: conference.id,
          publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY,
        },
        include: { currentState: true },
      });
      for (const publication of publications) {
        if (publication.currentState?.availability !== "PUBLISHED") continue;
        const result = await appendPublicationStateTx(tx, {
          conferenceId: conference.id,
          deckFileId: publication.deckFileId,
          availability: "UNPUBLISHED",
          actorRef: input.actorRef,
        });
        if (!result.replayed) transitioned += 1;
      }
      await tx.conference.update({
        where: { id: conference.id },
        data: { decksPublished: false, decksPublishedAt: null },
      });
    }

    return {
      publish: input.publish,
      transitioned,
      decksPublished: input.publish,
    };
  });
}

function eligibleFromLoadedPublication(publication: {
  currentState: { availability: PublicationAvailability } | null;
  deckFile: EligibilityShape;
}) {
  if (publication.currentState?.availability !== "PUBLISHED") return false;
  return exactDeckPublicationEligibility(publication.deckFile).eligible;
}

export async function loadExactDeckFileForPublic(publicId: string) {
  const file = await prisma.deckFile.findUnique({
    where: { publicId },
    include: {
      currentAssessment: true,
      deliverable: true,
      submission: {
        include: {
          conference: true,
          currentSelectionDecision: true,
          withdrawal: true,
          currentShareEligibilityChange: true,
        },
      },
      publications: {
        where: { publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY },
        include: { currentState: true },
      },
    },
  });
  if (!file) return { exactMode: false, file: null };

  const exactMode = await usesExactPublicationAuthorization(file.submission.conferenceId);
  if (!exactMode) return { exactMode: false, file };
  if (!file.submission.conference.decksPublished) {
    return { exactMode: true, file: null };
  }

  const publication = file.publications[0] ?? null;
  if (!publication) return { exactMode: true, file: null };
  if (
    !eligibleFromLoadedPublication({
      currentState: publication.currentState,
      deckFile: file,
    })
  ) {
    return { exactMode: true, file: null };
  }
  return { exactMode: true, file };
}

export async function getExactPublicDeckArchive(conferenceSlug: string) {
  const conference = await prisma.conference.findUnique({
    where: { slug: conferenceSlug },
  });
  if (!conference) return { exactMode: false, conference: null, decks: [] as never[] };

  const exactMode = await usesExactPublicationAuthorization(conference.id);
  if (!exactMode) return { exactMode: false, conference, decks: [] as never[] };
  if (!conference.decksPublished) {
    return { exactMode: true, conference: null, decks: [] as never[] };
  }

  const publications = await prisma.publication.findMany({
    where: {
      conferenceId: conference.id,
      publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY,
    },
    include: {
      currentState: true,
      deckFile: {
        include: {
          currentAssessment: true,
          deliverable: true,
          submission: {
            include: {
              currentSelectionDecision: true,
              withdrawal: true,
              currentShareEligibilityChange: true,
            },
          },
        },
      },
    },
  });

  const decks = publications
    .filter((publication) => eligibleFromLoadedPublication(publication))
    .map((publication) => {
      const file = publication.deckFile;
      const submission = file.submission;
      const presenters =
        submission.hasCoPresenter && submission.coPresenterName
          ? `${submission.firstName} ${submission.lastName} & ${submission.coPresenterName}`
          : `${submission.firstName} ${submission.lastName}`;
      return {
        publicId: file.publicId,
        title: submission.title,
        presenters,
        organization: submission.organization,
        filename: file.filename,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt.toISOString(),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return { exactMode: true, conference, decks };
}
