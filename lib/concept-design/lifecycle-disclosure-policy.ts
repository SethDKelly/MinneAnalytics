import type {
  ConferenceStatus,
  Prisma,
  ReviewerRole,
  SelectionDisposition,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export const PROPOSAL_OFFER_WINDOW_KEY = "proposal-offer";
export const PRESENTER_IDENTITY_INFORMATION_KEY = "review.presenter-identity";
export const PEER_AGGREGATE_INFORMATION_KEY = "review.peer-aggregate";

export type ApplicationCapability =
  | "MANAGE_CONTEXT_SETTINGS"
  | "MANAGE_AVAILABILITY"
  | "MANAGE_VOCABULARY"
  | "MANAGE_COVERAGE_TARGETS"
  | "ARCHIVE_CONTEXT"
  | "RECORD_EVALUATION"
  | "GIVE_FEEDBACK"
  | "DECIDE_SELECTION"
  | "REVIEW_DELIVERABLE"
  | "SET_PUBLIC_SHARING_POLICY"
  | "PUBLISH_MATERIAL"
  | "UNPUBLISH_MATERIAL"
  | "MANAGE_SCHEDULE"
  | "DISPATCH_OPERATIONAL"
  | "EXPORT_CONTEXT_DATA"
  | "VIEW_HISTORICAL_CONTEXT";

const ROLE_CAPABILITIES: Record<ReviewerRole, ReadonlySet<ApplicationCapability>> = {
  ADMIN: new Set([
    "MANAGE_CONTEXT_SETTINGS",
    "MANAGE_AVAILABILITY",
    "MANAGE_VOCABULARY",
    "MANAGE_COVERAGE_TARGETS",
    "ARCHIVE_CONTEXT",
    "VIEW_HISTORICAL_CONTEXT",
  ]),
  BOARD: new Set([
    "RECORD_EVALUATION",
    "GIVE_FEEDBACK",
    "DECIDE_SELECTION",
    "REVIEW_DELIVERABLE",
    "SET_PUBLIC_SHARING_POLICY",
    "PUBLISH_MATERIAL",
    "UNPUBLISH_MATERIAL",
    "MANAGE_SCHEDULE",
    "DISPATCH_OPERATIONAL",
    "EXPORT_CONTEXT_DATA",
    "VIEW_HISTORICAL_CONTEXT",
  ]),
  CHAIR: new Set([
    "RECORD_EVALUATION",
    "GIVE_FEEDBACK",
    "REVIEW_DELIVERABLE",
    "EXPORT_CONTEXT_DATA",
  ]),
};

export class ApplicationPolicyError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApplicationPolicyError";
    this.code = code;
  }
}

export function hasApplicationCapability(
  role: ReviewerRole,
  capability: ApplicationCapability
): boolean {
  return ROLE_CAPABILITIES[role].has(capability);
}

export function reviewerActorRef(reviewerAccessId: string): string {
  return `reviewer:${reviewerAccessId}`;
}

export type AvailabilityState = {
  configured: boolean;
  open: boolean;
  phase: "unconfigured" | "upcoming" | "open" | "closed";
  suspended: boolean;
  code:
    | "AVAILABLE"
    | "CONTEXT_SETUP"
    | "CONTEXT_ARCHIVED"
    | "WINDOW_UNCONFIGURED"
    | "WINDOW_UPCOMING"
    | "WINDOW_CLOSED"
    | "OFFER_SUSPENDED";
  message: string;
};

type AvailabilityConference = {
  status: ConferenceStatus;
  submissionsOpen: boolean;
  timezone: string;
  archiveRecord?: { id: string } | null;
};

type AvailabilityWindowShape = { opensAt: Date; closesAt: Date } | null;

export function observeOfferAvailability(
  conference: AvailabilityConference,
  window: AvailabilityWindowShape,
  now = new Date()
): AvailabilityState {
  const phase = !window
    ? "unconfigured"
    : now < window.opensAt
      ? "upcoming"
      : now < window.closesAt
        ? "open"
        : "closed";

  if (conference.archiveRecord || conference.status === "ARCHIVED") {
    return {
      configured: Boolean(window),
      open: false,
      phase,
      suspended: !conference.submissionsOpen,
      code: "CONTEXT_ARCHIVED",
      message: "This conference has been archived. Submissions are closed.",
    };
  }
  if (conference.status !== "ACTIVE") {
    return {
      configured: Boolean(window),
      open: false,
      phase,
      suspended: !conference.submissionsOpen,
      code: "CONTEXT_SETUP",
      message: "This conference is not open for submissions yet.",
    };
  }
  if (!window) {
    return {
      configured: false,
      open: false,
      phase: "unconfigured",
      suspended: !conference.submissionsOpen,
      code: "WINDOW_UNCONFIGURED",
      message: "The submission window has not been configured.",
    };
  }
  if (now < window.opensAt) {
    return {
      configured: true,
      open: false,
      phase: "upcoming",
      suspended: !conference.submissionsOpen,
      code: "WINDOW_UPCOMING",
      message: `Submissions open ${window.opensAt.toLocaleString("en-US", {
        timeZone: conference.timezone,
      })}.`,
    };
  }
  if (now >= window.closesAt) {
    return {
      configured: true,
      open: false,
      phase: "closed",
      suspended: !conference.submissionsOpen,
      code: "WINDOW_CLOSED",
      message: `Submissions closed ${window.closesAt.toLocaleString("en-US", {
        timeZone: conference.timezone,
      })}.`,
    };
  }
  if (!conference.submissionsOpen) {
    return {
      configured: true,
      open: false,
      phase: "open",
      suspended: true,
      code: "OFFER_SUSPENDED",
      message: "Submissions are temporarily suspended by the site administrator.",
    };
  }
  return {
    configured: true,
    open: true,
    phase: "open",
    suspended: false,
    code: "AVAILABLE",
    message: "",
  };
}

export function assertLiveOperationalContext(input: {
  status: ConferenceStatus;
  archiveRecord?: { id: string } | null;
}) {
  if (input.archiveRecord || input.status === "ARCHIVED") {
    throw new ApplicationPolicyError(
      "CONTEXT_ARCHIVED",
      "This operation is not available after archive closure"
    );
  }
  if (input.status !== "ACTIVE") {
    throw new ApplicationPolicyError(
      "CONTEXT_NOT_LIVE",
      "This operation is only available while the conference is live"
    );
  }
}

export async function applyConferencePolicyPatch(input: {
  conferenceId: string;
  actorRef: string;
  patch: {
    submissionsOpen?: boolean;
    submissionsOpenAt?: Date | null;
    submissionsCloseAt?: Date | null;
    timezone?: string;
    blindReviewEnabled?: boolean;
    status?: ConferenceStatus;
  };
}) {
  return prisma.$transaction(async (tx) => {
    const conference = await tx.conference.findUnique({
      where: { id: input.conferenceId },
      include: {
        archiveRecord: true,
        availabilityWindows: {
          where: { opportunityKey: PROPOSAL_OFFER_WINDOW_KEY },
          take: 1,
        },
      },
    });
    if (!conference) {
      throw new ApplicationPolicyError("CONTEXT_NOT_FOUND", "Conference not found");
    }

    const data: Prisma.ConferenceUpdateInput = {};
    const currentWindow = conference.availabilityWindows[0] ?? null;

    if (
      input.patch.submissionsOpenAt !== undefined ||
      input.patch.submissionsCloseAt !== undefined
    ) {
      const opensAt =
        input.patch.submissionsOpenAt !== undefined
          ? input.patch.submissionsOpenAt
          : currentWindow?.opensAt ?? conference.submissionsOpenAt;
      const closesAt =
        input.patch.submissionsCloseAt !== undefined
          ? input.patch.submissionsCloseAt
          : currentWindow?.closesAt ?? conference.submissionsCloseAt;

      if (!opensAt || !closesAt) {
        throw new ApplicationPolicyError(
          "AVAILABILITY_WINDOW_INCOMPLETE",
          "Both submission-window bounds are required"
        );
      }
      if (opensAt >= closesAt) {
        throw new ApplicationPolicyError(
          "AVAILABILITY_WINDOW_INVALID",
          "Submission window must open before it closes"
        );
      }

      await tx.availabilityWindow.upsert({
        where: {
          conferenceId_opportunityKey: {
            conferenceId: conference.id,
            opportunityKey: PROPOSAL_OFFER_WINDOW_KEY,
          },
        },
        update: { opensAt, closesAt },
        create: {
          conferenceId: conference.id,
          opportunityKey: PROPOSAL_OFFER_WINDOW_KEY,
          opensAt,
          closesAt,
        },
      });
      data.submissionsOpenAt = opensAt;
      data.submissionsCloseAt = closesAt;
    }

    if (input.patch.submissionsOpen !== undefined) {
      data.submissionsOpen = input.patch.submissionsOpen;
    }
    if (input.patch.timezone !== undefined) {
      data.timezone = input.patch.timezone.slice(0, 64);
    }

    if (
      input.patch.blindReviewEnabled !== undefined &&
      input.patch.blindReviewEnabled !== conference.blindReviewEnabled
    ) {
      const [evaluationCount, disclosureCount] = await Promise.all([
        tx.score.count({ where: { submission: { conferenceId: conference.id } } }),
        tx.controlledDisclosure.count({ where: { conferenceId: conference.id } }),
      ]);
      if (evaluationCount > 0 || disclosureCount > 0) {
        throw new ApplicationPolicyError(
          "BLIND_REVIEW_MODE_LOCKED",
          "Blind-review mode cannot be changed after protected review activity has begun"
        );
      }
      data.blindReviewEnabled = input.patch.blindReviewEnabled;
    }

    if (input.patch.status !== undefined && input.patch.status !== conference.status) {
      if (conference.archiveRecord) {
        throw new ApplicationPolicyError(
          "ARCHIVE_ROLLBACK_FORBIDDEN",
          "An archived conference cannot be reopened"
        );
      }

      if (input.patch.status === "ACTIVE") {
        if (conference.status !== "DRAFT") {
          throw new ApplicationPolicyError(
            "LIFECYCLE_REGRESSION_FORBIDDEN",
            "Only a setup conference can enter live operation"
          );
        }
        data.status = "ACTIVE";
      } else if (input.patch.status === "ARCHIVED") {
        if (conference.status !== "ACTIVE") {
          throw new ApplicationPolicyError(
            "ARCHIVE_REQUIRES_LIVE_CONTEXT",
            "Only a live conference can be archived"
          );
        }
        const at = new Date();
        await tx.archiveRecord.create({
          data: {
            conferenceId: conference.id,
            archivedByRef: input.actorRef,
            archivedAt: at,
          },
        });
        data.status = "ARCHIVED";
        data.archivedAt = at;
      } else {
        throw new ApplicationPolicyError(
          "LIFECYCLE_REGRESSION_FORBIDDEN",
          "Returning a live conference to setup is not supported"
        );
      }
    }

    return tx.conference.update({
      where: { id: conference.id },
      data,
      include: {
        archiveRecord: true,
        availabilityWindows: {
          where: { opportunityKey: PROPOSAL_OFFER_WINDOW_KEY },
          take: 1,
        },
      },
    });
  });
}

type RevisionExceptionRow = {
  submission_id: string;
  revision_id: string;
  granted_by_ref: string;
  granted_at: Date | string;
};

type DisclosureCutoverRow = {
  disclosure_cutover_at: Date | string;
};

async function getRevisionExceptionRow(
  client: Prisma.TransactionClient | typeof prisma,
  submissionId: string
): Promise<RevisionExceptionRow | null> {
  const rows = await client.$queryRawUnsafe<RevisionExceptionRow[]>(
    'SELECT submission_id, revision_id, granted_by_ref, granted_at FROM "RevisionExceptionPolicy" WHERE submission_id = ? LIMIT 1',
    submissionId
  );
  return rows[0] ?? null;
}

async function getDisclosureCutoverAt(
  client: Prisma.TransactionClient | typeof prisma,
  conferenceId: string
): Promise<Date | null> {
  const rows = await client.$queryRawUnsafe<DisclosureCutoverRow[]>(
    'SELECT disclosure_cutover_at FROM "ConferencePolicyCutover" WHERE conference_id = ? LIMIT 1',
    conferenceId
  );
  if (!rows[0]) return null;
  return new Date(rows[0].disclosure_cutover_at);
}

export async function consumeRevisionException(
  tx: Prisma.TransactionClient,
  submissionId: string,
  revisionId: string
) {
  await tx.$executeRawUnsafe(
    'DELETE FROM "RevisionExceptionPolicy" WHERE submission_id = ? AND revision_id = ?',
    submissionId,
    revisionId
  );
}

type RevisionEligibilityInput = {
  conference: {
    status: ConferenceStatus;
    archiveRecord?: { id: string } | null;
    availabilityWindows?: Array<{ opensAt: Date; closesAt: Date }>;
  };
  id: string;
  currentRevisionId: string | null;
  withdrawal?: { id: string } | null;
  currentSelectionDecision?: { disposition: SelectionDisposition | null } | null;
};

export async function getRevisionEligibility(
  submission: RevisionEligibilityInput,
  now = new Date()
): Promise<{ allowed: boolean; exceptional: boolean; code: string; message: string }> {
  if (submission.conference.archiveRecord || submission.conference.status === "ARCHIVED") {
    return {
      allowed: false,
      exceptional: false,
      code: "CONTEXT_ARCHIVED",
      message: "Archived submissions cannot be revised",
    };
  }
  if (submission.conference.status !== "ACTIVE") {
    return {
      allowed: false,
      exceptional: false,
      code: "CONTEXT_NOT_LIVE",
      message: "Submission revisions are only available while the conference is live",
    };
  }
  if (submission.withdrawal) {
    return {
      allowed: false,
      exceptional: false,
      code: "PARTICIPATION_WITHDRAWN",
      message: "A withdrawn submission cannot be revised",
    };
  }

  const exception = await getRevisionExceptionRow(prisma, submission.id);
  if (
    exception &&
    submission.currentRevisionId &&
    exception.revision_id === submission.currentRevisionId
  ) {
    return { allowed: true, exceptional: true, code: "REVISION_EXCEPTION", message: "" };
  }

  const disposition = submission.currentSelectionDecision?.disposition ?? null;
  if (disposition === "SELECTED" || disposition === "NOT_SELECTED") {
    return {
      allowed: false,
      exceptional: false,
      code: "REVISION_DECISION_LOCKED",
      message: "This submission is locked by the current organizer decision",
    };
  }

  const window = submission.conference.availabilityWindows?.[0] ?? null;
  if (!window) {
    return {
      allowed: false,
      exceptional: false,
      code: "AVAILABILITY_WINDOW_UNCONFIGURED",
      message: "The submission window is not configured",
    };
  }
  if (now < window.opensAt || now >= window.closesAt) {
    return {
      allowed: false,
      exceptional: false,
      code: "REVISION_WINDOW_CLOSED",
      message: "The ordinary submission revision window is closed",
    };
  }
  return { allowed: true, exceptional: false, code: "REVISION_ALLOWED", message: "" };
}

export async function grantRevisionException(input: {
  conferenceId: string;
  submissionId: string;
  reviewerAccessId: string;
}) {
  const submission = await prisma.submission.findFirst({
    where: { id: input.submissionId, conferenceId: input.conferenceId },
    include: { conference: { include: { archiveRecord: true } }, withdrawal: true },
  });
  if (!submission) {
    throw new ApplicationPolicyError("SUBMISSION_NOT_FOUND", "Submission not found");
  }
  assertLiveOperationalContext(submission.conference);
  if (submission.withdrawal) {
    throw new ApplicationPolicyError(
      "PARTICIPATION_WITHDRAWN",
      "A withdrawn submission cannot receive a revision exception"
    );
  }
  if (!submission.currentRevisionId) {
    throw new ApplicationPolicyError(
      "CANONICAL_REVISION_REQUIRED",
      "An exact current revision is required"
    );
  }

  const at = new Date();
  const actorRef = reviewerActorRef(input.reviewerAccessId);
  await prisma.$executeRawUnsafe(
    'INSERT INTO "RevisionExceptionPolicy" (submission_id, revision_id, granted_by_ref, granted_at) VALUES (?, ?, ?, ?) ON CONFLICT(submission_id) DO UPDATE SET revision_id = excluded.revision_id, granted_by_ref = excluded.granted_by_ref, granted_at = excluded.granted_at',
    submission.id,
    submission.currentRevisionId,
    actorRef,
    at
  );
  return { submissionId: submission.id, revisionId: submission.currentRevisionId, actorRef, grantedAt: at };
}

export async function revokeRevisionException(input: {
  conferenceId: string;
  submissionId: string;
}) {
  const submission = await prisma.submission.findFirst({
    where: { id: input.submissionId, conferenceId: input.conferenceId },
    include: { conference: { include: { archiveRecord: true } } },
  });
  if (!submission) {
    throw new ApplicationPolicyError("SUBMISSION_NOT_FOUND", "Submission not found");
  }
  assertLiveOperationalContext(submission.conference);
  await prisma.$executeRawUnsafe(
    'DELETE FROM "RevisionExceptionPolicy" WHERE submission_id = ?',
    submission.id
  );
  return { submissionId: submission.id, revoked: true };
}

function isLegacyIdentityCohort(input: {
  cutoverAt: Date | null;
  reviewerCreatedAt: Date;
  submissionCreatedAt: Date;
}): boolean {
  return Boolean(
    input.cutoverAt &&
      input.reviewerCreatedAt < input.cutoverAt &&
      input.submissionCreatedAt < input.cutoverAt
  );
}

function isLegacyAggregateCohort(input: {
  cutoverAt: Date | null;
  reviewerCreatedAt: Date;
  revisionCreatedAt: Date;
}): boolean {
  return Boolean(
    input.cutoverAt &&
      input.reviewerCreatedAt < input.cutoverAt &&
      input.revisionCreatedAt < input.cutoverAt
  );
}

export async function revealPresenterIdentity(input: {
  conferenceId: string;
  reviewerAccessId: string;
  submissionId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const [conference, reviewer, submission, cutoverAt] = await Promise.all([
      tx.conference.findUnique({
        where: { id: input.conferenceId },
        include: { archiveRecord: true },
      }),
      tx.reviewerAccess.findUnique({ where: { id: input.reviewerAccessId } }),
      tx.submission.findUnique({
        where: { id: input.submissionId },
        include: { withdrawal: true },
      }),
      getDisclosureCutoverAt(tx, input.conferenceId),
    ]);
    if (!conference || !reviewer || !submission) {
      throw new ApplicationPolicyError("REVIEW_CONTEXT_NOT_FOUND", "Review context not found");
    }
    assertLiveOperationalContext(conference);
    if (reviewer.conferenceId !== conference.id || submission.conferenceId !== conference.id) {
      throw new ApplicationPolicyError("REVIEW_SCOPE_MISMATCH", "Review context is out of scope");
    }
    if (submission.withdrawal) {
      throw new ApplicationPolicyError(
        "PARTICIPATION_WITHDRAWN",
        "Withdrawn submissions are not eligible for ordinary review"
      );
    }
    if (!conference.blindReviewEnabled) {
      return { mode: "ordinary-visible" as const, disclosure: null };
    }

    const subjectKey = `proposal:${submission.id}`;
    const existing = await tx.controlledDisclosure.findUnique({
      where: {
        reviewerAccessId_submissionId_informationKey_subjectKey: {
          reviewerAccessId: reviewer.id,
          submissionId: submission.id,
          informationKey: PRESENTER_IDENTITY_INFORMATION_KEY,
          subjectKey,
        },
      },
    });
    if (existing?.revealedAt) {
      return { mode: "revealed" as const, disclosure: existing };
    }
    if (
      !existing &&
      isLegacyIdentityCohort({
        cutoverAt,
        reviewerCreatedAt: reviewer.createdAt,
        submissionCreatedAt: submission.createdAt,
      })
    ) {
      return { mode: "legacy-unknown" as const, disclosure: null };
    }

    const staged =
      existing ??
      (await tx.controlledDisclosure.create({
        data: {
          conferenceId: conference.id,
          reviewerAccessId: reviewer.id,
          submissionId: submission.id,
          informationKey: PRESENTER_IDENTITY_INFORMATION_KEY,
          subjectKey,
          stagedAt: new Date(),
        },
      }));

    const revealed = staged.revealedAt
      ? staged
      : await tx.controlledDisclosure.update({
          where: { id: staged.id },
          data: {
            revealedByRef: reviewerActorRef(reviewer.id),
            revealedAt: new Date(),
          },
        });

    return { mode: "revealed" as const, disclosure: revealed };
  });
}

export async function revealPeerAggregateForEvaluation(
  tx: Prisma.TransactionClient,
  input: {
    conference: { id: string; blindReviewEnabled: boolean };
    reviewer: { id: string; createdAt: Date };
    submissionId: string;
    revision: { id: string; createdAt: Date };
  }
) {
  if (!input.conference.blindReviewEnabled) {
    return { mode: "ordinary-visible" as const, disclosure: null };
  }
  const cutoverAt = await getDisclosureCutoverAt(tx, input.conference.id);
  const subjectKey = `revision:${input.revision.id}`;
  const existing = await tx.controlledDisclosure.findUnique({
    where: {
      reviewerAccessId_submissionId_informationKey_subjectKey: {
        reviewerAccessId: input.reviewer.id,
        submissionId: input.submissionId,
        informationKey: PEER_AGGREGATE_INFORMATION_KEY,
        subjectKey,
      },
    },
  });
  if (existing?.revealedAt) {
    return { mode: "revealed" as const, disclosure: existing };
  }
  if (
    !existing &&
    isLegacyAggregateCohort({
      cutoverAt,
      reviewerCreatedAt: input.reviewer.createdAt,
      revisionCreatedAt: input.revision.createdAt,
    })
  ) {
    return { mode: "legacy-unknown" as const, disclosure: null };
  }

  const staged =
    existing ??
    (await tx.controlledDisclosure.create({
      data: {
        conferenceId: input.conference.id,
        reviewerAccessId: input.reviewer.id,
        submissionId: input.submissionId,
        submissionRevisionId: input.revision.id,
        informationKey: PEER_AGGREGATE_INFORMATION_KEY,
        subjectKey,
        stagedAt: new Date(),
      },
    }));

  const revealed = staged.revealedAt
    ? staged
    : await tx.controlledDisclosure.update({
        where: { id: staged.id },
        data: {
          revealedByRef: reviewerActorRef(input.reviewer.id),
          revealedAt: new Date(),
        },
      });

  return { mode: "revealed" as const, disclosure: revealed };
}
