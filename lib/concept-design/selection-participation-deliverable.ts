import { createHash } from "node:crypto";
import type {
  DeliverableAssessmentDisposition,
  Prisma,
  ProgramStatus,
  SelectionDisposition,
} from "@prisma/client";
import { prisma } from "@/lib/db";

const PROGRAM_CAPACITY_KEY = "program-slots";
const STANDARD_CAPACITY_CLASS = "standard";
const DECK_DELIVERABLE_KIND = "deck";
const CAPACITY_RELEASE_EFFECT = "capacity-release:";
const SCHEDULE_UNPLACE_EFFECT = "schedule-unplace:";

export class CapacityUnavailableError extends Error {
  readonly code = "CAPACITY_UNAVAILABLE";

  constructor(message = "No remaining program capacity is available") {
    super(message);
    this.name = "CapacityUnavailableError";
  }
}

export class CapacityConfigurationError extends Error {
  readonly code = "CAPACITY_CONFIGURATION_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "CapacityConfigurationError";
  }
}

export class SelectionHeadConflictError extends Error {
  readonly code = "SELECTION_STALE_HEAD";

  constructor(message = "The organizer decision changed before this command committed") {
    super(message);
    this.name = "SelectionHeadConflictError";
  }
}

export class DeliverableHeadConflictError extends Error {
  readonly code = "DELIVERABLE_STALE_HEAD";

  constructor(message = "The deliverable changed before this command committed") {
    super(message);
    this.name = "DeliverableHeadConflictError";
  }
}

export class DeliverableUnavailableError extends Error {
  readonly code = "DELIVERABLE_UNAVAILABLE";

  constructor(message = "A current deck deliverable is required for this operation") {
    super(message);
    this.name = "DeliverableUnavailableError";
  }
}

export class LegacyDeckStatusUnsupportedError extends Error {
  readonly code = "LEGACY_DECK_STATUS_UNREPRESENTABLE";

  constructor(message = "REVIEWED has no canonical Deliverable assessment meaning") {
    super(message);
    this.name = "LegacyDeckStatusUnsupportedError";
  }
}

type ConferenceCapacityShape = {
  id: string;
  rooms: number;
  sessionsPerRoom: number;
  eodTrim: number;
  graemeSlots: number;
};

export function presenterActorRef(submissionId: string): string {
  return `presenter:${submissionId}`;
}

export function capacityLimitFromConference(
  conference: ConferenceCapacityShape
): number {
  return (
    conference.rooms * conference.sessionsPerRoom -
    conference.eodTrim -
    conference.graemeSlots
  );
}

export function programStatusFromCanonical(input: {
  disposition: SelectionDisposition | null;
  withdrawn: boolean;
}): ProgramStatus {
  if (input.withdrawn) return "WITHDRAWN";
  if (input.disposition === "SELECTED") return "APPROVED";
  if (input.disposition === "RESERVE") return "BACKUP";
  if (input.disposition === "NOT_SELECTED") return "DECLINED";
  return "PENDING";
}

export function selectionDispositionFromProgramStatus(
  status: ProgramStatus
): SelectionDisposition | null {
  if (status === "APPROVED") return "SELECTED";
  if (status === "BACKUP") return "RESERVE";
  if (status === "DECLINED") return "NOT_SELECTED";
  if (status === "PENDING") return null;
  throw new Error("WITHDRAWN is not a Selection disposition");
}

function semanticId(prefix: string, subject: string, commandKey: string): string {
  const digest = createHash("sha256")
    .update(`${prefix}:${subject}:${commandKey}`)
    .digest("hex")
    .slice(0, 40);
  return `${prefix}_${digest}`;
}

async function ensureProgramCapacityPool(
  tx: Prisma.TransactionClient,
  conference: ConferenceCapacityShape
) {
  const limit = capacityLimitFromConference(conference);
  if (limit < 0) {
    throw new CapacityConfigurationError(
      `Program capacity formula produced a negative limit (${limit})`
    );
  }

  let pool = await tx.capacityPool.findUnique({
    where: {
      conferenceId_key: {
        conferenceId: conference.id,
        key: PROGRAM_CAPACITY_KEY,
      },
    },
  });

  if (!pool) {
    pool = await tx.capacityPool.create({
      data: {
        conferenceId: conference.id,
        key: PROGRAM_CAPACITY_KEY,
        limitUnits: limit,
      },
    });
  }

  const rate = await tx.capacityClassRate.findUnique({
    where: {
      poolId_classRef: {
        poolId: pool.id,
        classRef: STANDARD_CAPACITY_CLASS,
      },
    },
  });

  if (!rate) {
    await tx.capacityClassRate.create({
      data: {
        poolId: pool.id,
        classRef: STANDARD_CAPACITY_CLASS,
        units: 1,
      },
    });
  } else if (rate.units !== 1) {
    throw new CapacityConfigurationError(
      `The v0 standard Capacity class must consume exactly one unit; found ${rate.units}`
    );
  }

  return pool;
}

async function allocateProgramCapacity(
  tx: Prisma.TransactionClient,
  input: {
    conference: ConferenceCapacityShape;
    submissionId: string;
    actorRef: string;
    at: Date;
  }
) {
  const pool = await ensureProgramCapacityPool(tx, input.conference);
  const existing = await tx.capacityAllocation.findFirst({
    where: {
      poolId: pool.id,
      submissionId: input.submissionId,
      releasedAt: null,
    },
  });
  if (existing) return existing;

  const aggregate = await tx.capacityAllocation.aggregate({
    where: { poolId: pool.id, releasedAt: null },
    _sum: { unitsApplied: true },
  });
  const committed = aggregate._sum.unitsApplied ?? 0;
  if (committed + 1 > pool.limitUnits) {
    throw new CapacityUnavailableError();
  }

  return tx.capacityAllocation.create({
    data: {
      poolId: pool.id,
      submissionId: input.submissionId,
      classRef: STANDARD_CAPACITY_CLASS,
      unitsApplied: 1,
      allocatedByRef: input.actorRef,
      allocatedAt: input.at,
    },
  });
}

export async function ensureDeckDeliverable(
  tx: Prisma.TransactionClient,
  submissionId: string
) {
  const existing = await tx.deliverableRequirement.findUnique({
    where: {
      submissionId_kindKey: {
        submissionId,
        kindKey: DECK_DELIVERABLE_KIND,
      },
    },
  });
  if (existing) return existing;

  return tx.deliverableRequirement.create({
    data: {
      submissionId,
      responsibleRef: presenterActorRef(submissionId),
      kindKey: DECK_DELIVERABLE_KIND,
    },
  });
}

async function createParticipationExitWork(
  tx: Prisma.TransactionClient,
  input: { sourceRef: string; submissionId: string }
) {
  await tx.synchronizationWork.createMany({
    data: [
      {
        syncId: "SYNC-006",
        sourceRef: input.sourceRef,
        effectKey: `${CAPACITY_RELEASE_EFFECT}${input.submissionId}`,
      },
      {
        syncId: "SYNC-007",
        sourceRef: input.sourceRef,
        effectKey: `${SCHEDULE_UNPLACE_EFFECT}${input.submissionId}`,
      },
    ],
    skipDuplicates: true,
  });
}

async function completeCleanupWork(
  workId: string,
  effect: (tx: Prisma.TransactionClient) => Promise<void>
) {
  await prisma.$transaction(async (tx) => {
    const work = await tx.synchronizationWork.findUnique({ where: { id: workId } });
    if (!work || work.state === "COMPLETED") return;

    try {
      await effect(tx);
      await tx.synchronizationWork.update({
        where: { id: work.id },
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
        where: { id: work.id },
        data: {
          state: "BLOCKED",
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          lastError: error instanceof Error ? error.message : "Unknown cleanup error",
        },
      });
      throw error;
    }
  });
}

export async function processParticipationCleanupForSource(
  sourceRef: string,
  actorRef: string
): Promise<{ pending: number }> {
  const work = await prisma.synchronizationWork.findMany({
    where: {
      sourceRef,
      state: { in: ["PENDING", "BLOCKED"] },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const item of work) {
    if (item.effectKey.startsWith(CAPACITY_RELEASE_EFFECT)) {
      const submissionId = item.effectKey.slice(CAPACITY_RELEASE_EFFECT.length);
      await completeCleanupWork(item.id, async (tx) => {
        await tx.capacityAllocation.updateMany({
          where: { submissionId, releasedAt: null },
          data: { releasedByRef: actorRef, releasedAt: new Date() },
        });
      });
      continue;
    }

    if (item.effectKey.startsWith(SCHEDULE_UNPLACE_EFFECT)) {
      const submissionId = item.effectKey.slice(SCHEDULE_UNPLACE_EFFECT.length);
      await completeCleanupWork(item.id, async (tx) => {
        await tx.schedulePlacement.updateMany({
          where: { submissionId },
          data: { submissionId: null },
        });
      });
    }
  }

  return {
    pending: await prisma.synchronizationWork.count({
      where: { sourceRef, state: { not: "COMPLETED" } },
    }),
  };
}

export async function getCanonicalParticipation(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      currentSelectionDecision: true,
      withdrawal: true,
    },
  });
  if (!submission) return null;

  const disposition = submission.currentSelectionDecision?.disposition ?? null;
  const withdrawn = Boolean(submission.withdrawal);
  return {
    submission,
    disposition,
    withdrawn,
    effectivelyParticipating: disposition === "SELECTED" && !withdrawn,
    compatibilityStatus: programStatusFromCanonical({ disposition, withdrawn }),
  };
}

export async function recordCanonicalSelection(input: {
  conferenceId: string;
  submissionId: string;
  disposition: SelectionDisposition | null;
  actorRef: string;
  commandKey?: string | null;
}) {
  const at = new Date();
  const decisionId = input.commandKey
    ? semanticId("sel", input.submissionId, input.commandKey)
    : undefined;

  if (decisionId) {
    const replay = await prisma.selectionDecision.findUnique({ where: { id: decisionId } });
    if (replay) {
      const cleanup = await processParticipationCleanupForSource(replay.id, input.actorRef).catch(
        () => ({ pending: 1 })
      );
      return { decision: replay, replayed: true, cleanupPending: cleanup.pending };
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const submission = await tx.submission.findFirst({
      where: { id: input.submissionId, conferenceId: input.conferenceId },
      include: {
        currentSelectionDecision: true,
        withdrawal: true,
        conference: true,
      },
    });
    if (!submission) throw new Error("Submission not found");

    const current = submission.currentSelectionDecision;
    const currentDisposition = current?.disposition ?? null;
    const withdrawn = Boolean(submission.withdrawal);

    if (!current && input.disposition === null) {
      await tx.submission.update({
        where: { id: submission.id },
        data: {
          programStatus: programStatusFromCanonical({
            disposition: null,
            withdrawn,
          }),
          approvedAt: null,
        },
      });
      return { decision: null, replayed: false, cleanupSourceRef: null };
    }

    if (current && currentDisposition === input.disposition) {
      await tx.submission.update({
        where: { id: submission.id },
        data: {
          programStatus: programStatusFromCanonical({
            disposition: currentDisposition,
            withdrawn,
          }),
          approvedAt:
            currentDisposition === "SELECTED"
              ? current.decidedAt ?? submission.approvedAt
              : null,
        },
      });
      return { decision: current, replayed: true, cleanupSourceRef: null };
    }

    const effectiveBefore = currentDisposition === "SELECTED" && !withdrawn;
    const effectiveAfter = input.disposition === "SELECTED" && !withdrawn;

    if (!effectiveBefore && effectiveAfter) {
      await allocateProgramCapacity(tx, {
        conference: submission.conference,
        submissionId: submission.id,
        actorRef: input.actorRef,
        at,
      });
      await ensureDeckDeliverable(tx, submission.id);
    }

    const decision = await tx.selectionDecision.create({
      data: {
        ...(decisionId ? { id: decisionId } : {}),
        conferenceId: submission.conferenceId,
        submissionId: submission.id,
        disposition: input.disposition,
        decidedByRef: input.actorRef,
        decidedAt: at,
        predecessorDecisionId: current?.id ?? null,
      },
    });

    const updated = await tx.submission.updateMany({
      where: {
        id: submission.id,
        currentSelectionDecisionId: current?.id ?? null,
      },
      data: {
        currentSelectionDecisionId: decision.id,
        programStatus: programStatusFromCanonical({
          disposition: input.disposition,
          withdrawn,
        }),
        approvedAt: input.disposition === "SELECTED" ? at : null,
      },
    });
    if (updated.count !== 1) throw new SelectionHeadConflictError();

    if (effectiveBefore && !effectiveAfter) {
      await createParticipationExitWork(tx, {
        sourceRef: decision.id,
        submissionId: submission.id,
      });
    }

    return {
      decision,
      replayed: false,
      cleanupSourceRef: effectiveBefore && !effectiveAfter ? decision.id : null,
    };
  });

  const cleanup = result.cleanupSourceRef
    ? await processParticipationCleanupForSource(
        result.cleanupSourceRef,
        input.actorRef
      ).catch(() => ({ pending: 1 }))
    : { pending: 0 };

  return {
    decision: result.decision,
    replayed: result.replayed,
    cleanupPending: cleanup.pending,
  };
}

export async function recordCanonicalWithdrawal(input: {
  submissionId: string;
  actorRef: string;
}) {
  const at = new Date();
  const existing = await prisma.withdrawalRecord.findUnique({
    where: { submissionId: input.submissionId },
  });
  if (existing) {
    const cleanup = await processParticipationCleanupForSource(existing.id, input.actorRef).catch(
      () => ({ pending: 1 })
    );
    return { withdrawal: existing, replayed: true, cleanupPending: cleanup.pending };
  }

  const result = await prisma.$transaction(async (tx) => {
    const submission = await tx.submission.findUnique({
      where: { id: input.submissionId },
      include: { currentSelectionDecision: true, withdrawal: true },
    });
    if (!submission) throw new Error("Submission not found");
    if (submission.withdrawal) {
      return {
        withdrawal: submission.withdrawal,
        replayed: true,
        cleanupSourceRef: submission.withdrawal.id,
      };
    }

    const withdrawal = await tx.withdrawalRecord.create({
      data: {
        id: semanticId("wd", submission.id, "withdraw"),
        submissionId: submission.id,
        withdrawnByRef: input.actorRef,
        withdrawnAt: at,
      },
    });

    await tx.submission.update({
      where: { id: submission.id },
      data: {
        programStatus: "WITHDRAWN",
        withdrawnAt: at,
      },
    });

    if (submission.currentSelectionDecision?.disposition === "SELECTED") {
      await createParticipationExitWork(tx, {
        sourceRef: withdrawal.id,
        submissionId: submission.id,
      });
    }

    return {
      withdrawal,
      replayed: false,
      cleanupSourceRef:
        submission.currentSelectionDecision?.disposition === "SELECTED"
          ? withdrawal.id
          : null,
    };
  });

  const cleanup = result.cleanupSourceRef
    ? await processParticipationCleanupForSource(
        result.cleanupSourceRef,
        input.actorRef
      ).catch(() => ({ pending: 1 }))
    : { pending: 0 };

  return {
    withdrawal: result.withdrawal,
    replayed: result.replayed,
    cleanupPending: cleanup.pending,
  };
}

export async function recordProvidedDeckArtifact(input: {
  submissionId: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
}) {
  return prisma.$transaction(async (tx) => {
    const deliverable = await ensureDeckDeliverable(tx, input.submissionId);
    const current = deliverable.currentArtifactId
      ? await tx.deckFile.findUnique({ where: { id: deliverable.currentArtifactId } })
      : null;
    const latest = await tx.deckFile.findFirst({
      where: { submissionId: input.submissionId },
      orderBy: { version: "desc" },
    });

    const artifact = await tx.deckFile.create({
      data: {
        submissionId: input.submissionId,
        deliverableId: deliverable.id,
        predecessorArtifactId: current?.id ?? null,
        version: (latest?.version ?? 0) + 1,
        filename: input.filename,
        storagePath: input.storagePath,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
      },
    });

    const advanced = await tx.deliverableRequirement.updateMany({
      where: {
        id: deliverable.id,
        currentArtifactId: current?.id ?? null,
      },
      data: { currentArtifactId: artifact.id },
    });
    if (advanced.count !== 1) throw new DeliverableHeadConflictError();

    await tx.submission.update({
      where: { id: input.submissionId },
      data: { deckStatus: "SUBMITTED" },
    });

    return artifact;
  });
}

export async function recordCanonicalDeckAssessment(input: {
  conferenceId: string;
  submissionId: string;
  disposition: DeliverableAssessmentDisposition;
  reviewerRef: string;
  detail?: string | null;
  commandKey?: string | null;
}) {
  const assessmentId = input.commandKey
    ? semanticId("assess", input.submissionId, input.commandKey)
    : undefined;

  if (assessmentId) {
    const replay = await prisma.deliverableAssessment.findUnique({
      where: { id: assessmentId },
    });
    if (replay) return { assessment: replay, replayed: true };
  }

  return prisma.$transaction(async (tx) => {
    const deliverable = await tx.deliverableRequirement.findFirst({
      where: {
        submissionId: input.submissionId,
        kindKey: DECK_DELIVERABLE_KIND,
        submission: { conferenceId: input.conferenceId },
      },
      include: { currentArtifact: { include: { currentAssessment: true } } },
    });
    const artifact = deliverable?.currentArtifact;
    if (!deliverable || !artifact) throw new DeliverableUnavailableError();

    const current = artifact.currentAssessment;
    const normalizedDetail = input.detail?.trim() || null;
    if (
      current &&
      current.disposition === input.disposition &&
      (current.detail ?? null) === normalizedDetail
    ) {
      return { assessment: current, replayed: true };
    }

    const assessment = await tx.deliverableAssessment.create({
      data: {
        ...(assessmentId ? { id: assessmentId } : {}),
        artifactVersionId: artifact.id,
        disposition: input.disposition,
        detail: normalizedDetail,
        reviewedByRef: input.reviewerRef,
        reviewedAt: new Date(),
        predecessorAssessmentId: current?.id ?? null,
      },
    });

    const advanced = await tx.deckFile.updateMany({
      where: {
        id: artifact.id,
        currentAssessmentId: current?.id ?? null,
      },
      data: { currentAssessmentId: assessment.id },
    });
    if (advanced.count !== 1) throw new DeliverableHeadConflictError();

    await tx.submission.update({
      where: { id: input.submissionId },
      data: {
        deckStatus: input.disposition === "READY" ? "APPROVED" : "CONCERN",
      },
    });

    return { assessment, replayed: false };
  });
}

export async function projectCurrentDeckStatus(submissionId: string) {
  const deliverable = await prisma.deliverableRequirement.findUnique({
    where: {
      submissionId_kindKey: {
        submissionId,
        kindKey: DECK_DELIVERABLE_KIND,
      },
    },
    include: { currentArtifact: { include: { currentAssessment: true } } },
  });

  if (!deliverable?.currentArtifact) return null;
  if (!deliverable.currentArtifact.currentAssessment) return "SUBMITTED" as const;
  return deliverable.currentArtifact.currentAssessment.disposition === "READY"
    ? ("APPROVED" as const)
    : ("CONCERN" as const);
}
