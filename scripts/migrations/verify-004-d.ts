import { PrismaClient } from "@prisma/client";
import {
  ApplicationPolicyError,
  getRevisionEligibility,
  grantRevisionException,
  hasApplicationCapability,
  observeOfferAvailability,
  PROPOSAL_OFFER_WINDOW_KEY,
  revealPresenterIdentity,
  applyConferencePolicyPatch,
} from "../../lib/concept-design/lifecycle-disclosure-policy";
import {
  appendCanonicalRevision,
  establishInitialRevision,
  recordCanonicalEvaluation,
} from "../../lib/concept-design/revision-evaluation";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`004-D verification failed: ${message}`);
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const now = new Date();
  const past = new Date(now.getTime() - 60 * 60 * 1000);
  const future = new Date(now.getTime() + 60 * 60 * 1000);
  const old = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  assert(
    hasApplicationCapability("ADMIN", "MANAGE_AVAILABILITY"),
    "ADMIN should resolve MANAGE_AVAILABILITY"
  );
  assert(
    hasApplicationCapability("ADMIN", "ARCHIVE_CONTEXT"),
    "ADMIN should resolve ARCHIVE_CONTEXT"
  );
  assert(
    !hasApplicationCapability("ADMIN", "RECORD_EVALUATION"),
    "ADMIN should not inherit review authority merely from administrator role"
  );
  assert(
    hasApplicationCapability("BOARD", "DECIDE_SELECTION"),
    "BOARD should resolve DECIDE_SELECTION"
  );
  assert(
    !hasApplicationCapability("CHAIR", "DECIDE_SELECTION"),
    "CHAIR should not resolve DECIDE_SELECTION"
  );
  assert(
    hasApplicationCapability("CHAIR", "GIVE_FEEDBACK"),
    "CHAIR should resolve GIVE_FEEDBACK"
  );

  const conference = await prisma.conference.create({
    data: {
      slug: `004-d-${suffix}`,
      name: "004-D verification",
      status: "DRAFT",
      submissionsOpen: true,
      blindReviewEnabled: true,
    },
  });

  const window = await prisma.availabilityWindow.create({
    data: {
      conferenceId: conference.id,
      opportunityKey: PROPOSAL_OFFER_WINDOW_KEY,
      opensAt: past,
      closesAt: future,
    },
  });

  const setupAvailability = observeOfferAvailability(
    { ...conference, archiveRecord: null },
    window,
    now
  );
  assert(
    !setupAvailability.open && setupAvailability.code === "CONTEXT_SETUP",
    "setup mode must override an otherwise-open Window"
  );

  const activated = await applyConferencePolicyPatch({
    conferenceId: conference.id,
    actorRef: `reviewer:admin-${suffix}`,
    patch: { status: "ACTIVE" },
  });
  const openAvailability = observeOfferAvailability(
    activated,
    activated.availabilityWindows[0] ?? null,
    now
  );
  assert(openAvailability.open, "live context with open Window should accept offers");

  const suspended = await applyConferencePolicyPatch({
    conferenceId: conference.id,
    actorRef: `reviewer:admin-${suffix}`,
    patch: { submissionsOpen: false },
  });
  const suspendedAvailability = observeOfferAvailability(
    suspended,
    suspended.availabilityWindows[0] ?? null,
    now
  );
  assert(
    !suspendedAvailability.open && suspendedAvailability.code === "OFFER_SUSPENDED",
    "manual compatibility flag should suspend but not redefine the Window"
  );

  const resumed = await applyConferencePolicyPatch({
    conferenceId: conference.id,
    actorRef: `reviewer:admin-${suffix}`,
    patch: { submissionsOpen: true },
  });
  assert(
    observeOfferAvailability(resumed, resumed.availabilityWindows[0] ?? null, now).open,
    "clearing manual suspension should restore an otherwise-open Window"
  );
  assert(
    observeOfferAvailability(resumed, resumed.availabilityWindows[0] ?? null, future).code ===
      "WINDOW_CLOSED",
    "Availability Window must use half-open [opensAt, closesAt) semantics"
  );

  const cutoverAt = new Date();
  await prisma.$executeRawUnsafe(
    'INSERT INTO "ConferencePolicyCutover" (conference_id, disclosure_cutover_at) VALUES (?, ?)',
    conference.id,
    cutoverAt
  );

  const reviewer = await prisma.reviewerAccess.create({
    data: {
      conferenceId: conference.id,
      tokenHash: `004-d-reviewer-${suffix}`,
      role: "BOARD",
      label: "004-D verifier",
      createdAt: old,
    },
  });

  const submission = await prisma.submission.create({
    data: {
      conferenceId: conference.id,
      presenterTokenHash: `004-d-presenter-${suffix}`,
      firstName: "Legacy",
      lastName: "Presenter",
      degrees: JSON.stringify([]),
      jobTitle: "Engineer",
      organization: "Verification Org",
      title: "004-D policy verification",
      abstract:
        "A sufficiently long abstract used to verify policy, disclosure, and revision behavior.",
      technicalLevel: 3,
      bio: "A sufficiently long presenter biography used by the 004-D verification fixture.",
      email: `legacy-${suffix}@example.com`,
      zipCode: "55401",
      phone: "5555555555",
      linkedinUrl: "https://example.com/legacy",
      linkedinHasPhoto: false,
      createdAt: old,
    },
  });

  const revision1 = await prisma.$transaction((tx) =>
    establishInitialRevision(tx, {
      submissionId: submission.id,
      snapshot: {
        title: submission.title,
        abstract: submission.abstract,
        bio: submission.bio,
        technicalLevel: submission.technicalLevel,
        themeIds: [],
      },
    })
  );
  assert(
    revision1.createdAt >= cutoverAt,
    "verification fixture must create the exact Revision after disclosure cutover"
  );

  const identity = await revealPresenterIdentity({
    conferenceId: conference.id,
    reviewerAccessId: reviewer.id,
    submissionId: submission.id,
  });
  assert(
    identity.mode === "legacy-unknown",
    "pre-cutover reviewer/Proposal identity exposure must remain legacy-unknown"
  );
  assert(
    (await prisma.controlledDisclosure.count({
      where: {
        reviewerAccessId: reviewer.id,
        submissionId: submission.id,
        informationKey: "review.presenter-identity",
      },
    })) === 0,
    "legacy-unknown identity must not fabricate a staged or revealed relationship"
  );

  const evaluation = await recordCanonicalEvaluation({
    submissionId: submission.id,
    reviewerAccessId: reviewer.id,
    value: 4,
    notes: "Exact-revision review",
    revealPeerAggregate: true,
  });
  assert(
    evaluation.disclosureMode === "revealed",
    "post-cutover exact Revision aggregate should reveal atomically with Evaluation"
  );
  const aggregateDisclosure = await prisma.controlledDisclosure.findFirst({
    where: {
      reviewerAccessId: reviewer.id,
      submissionId: submission.id,
      submissionRevisionId: revision1.id,
      informationKey: "review.peer-aggregate",
    },
  });
  assert(
    aggregateDisclosure?.revealedAt,
    "peer aggregate disclosure should retain reveal provenance"
  );
  const firstRevealAt = aggregateDisclosure.revealedAt.getTime();

  const evaluationReplay = await recordCanonicalEvaluation({
    submissionId: submission.id,
    reviewerAccessId: reviewer.id,
    value: 4.5,
    notes: "Revised exact-revision judgment",
    revealPeerAggregate: true,
  });
  assert(
    evaluationReplay.evaluation.id === evaluation.evaluation.id,
    "revising judgment for the same exact Revision should keep one Evaluation identity"
  );
  const aggregateAfterReplay = await prisma.controlledDisclosure.findUniqueOrThrow({
    where: {
      reviewerAccessId_submissionId_informationKey_subjectKey: {
        reviewerAccessId: reviewer.id,
        submissionId: submission.id,
        informationKey: "review.peer-aggregate",
        subjectKey: `revision:${revision1.id}`,
      },
    },
  });
  assert(
    aggregateAfterReplay.revealedAt?.getTime() === firstRevealAt,
    "repeated reveal must preserve original reveal provenance"
  );

  let blindModeLocked = false;
  try {
    await applyConferencePolicyPatch({
      conferenceId: conference.id,
      actorRef: `reviewer:admin-${suffix}`,
      patch: { blindReviewEnabled: false },
    });
  } catch (error) {
    blindModeLocked =
      error instanceof ApplicationPolicyError &&
      error.code === "BLIND_REVIEW_MODE_LOCKED";
  }
  assert(
    blindModeLocked,
    "blind-review configuration must lock after protected review activity"
  );

  await applyConferencePolicyPatch({
    conferenceId: conference.id,
    actorRef: `reviewer:admin-${suffix}`,
    patch: {
      submissionsOpenAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      submissionsCloseAt: new Date(now.getTime() - 60 * 60 * 1000),
    },
  });

  const closedSubmission = await prisma.submission.findUniqueOrThrow({
    where: { id: submission.id },
    include: {
      withdrawal: true,
      currentSelectionDecision: true,
      conference: {
        include: {
          archiveRecord: true,
          availabilityWindows: {
            where: { opportunityKey: PROPOSAL_OFFER_WINDOW_KEY },
            take: 1,
          },
        },
      },
    },
  });
  const ordinaryEdit = await getRevisionEligibility(closedSubmission, now);
  assert(
    !ordinaryEdit.allowed && ordinaryEdit.code === "REVISION_WINDOW_CLOSED",
    "closed Window should deny ordinary Revision"
  );

  const exception = await grantRevisionException({
    conferenceId: conference.id,
    submissionId: submission.id,
    reviewerAccessId: reviewer.id,
  });
  assert(
    exception.revisionId === revision1.id,
    "revision exception must bind to the exact current Revision"
  );
  const exceptionalEdit = await getRevisionEligibility(closedSubmission, now);
  assert(
    exceptionalEdit.allowed && exceptionalEdit.exceptional,
    "explicit exception should permit one scoped Revision despite ordinary Window closure"
  );

  const revision2Result = await appendCanonicalRevision({
    submissionId: submission.id,
    expectedRevisionId: revision1.id,
    requireExpectedHead: true,
    commandKey: `004-d-revision-${suffix}`,
    snapshot: {
      title: `${submission.title} revised`,
      abstract: `${submission.abstract} Updated by explicit review exception.`,
      bio: submission.bio,
      technicalLevel: submission.technicalLevel,
      themeIds: [],
    },
    changedFields: ["title", "abstract"],
    changeNote: "Requested follow-up revision",
  });
  assert(
    revision2Result.revision.predecessorRevisionId === revision1.id,
    "accepted exceptional Revision should advance exact Revision history"
  );
  const exceptionRows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    'SELECT COUNT(*) AS count FROM "RevisionExceptionPolicy" WHERE submission_id = ?',
    submission.id
  );
  assert(
    Number(exceptionRows[0]?.count ?? 0) === 0,
    "successful Revision should consume the exception scoped to its predecessor"
  );

  const afterRevision = await prisma.submission.findUniqueOrThrow({
    where: { id: submission.id },
    include: {
      withdrawal: true,
      currentSelectionDecision: true,
      conference: {
        include: {
          archiveRecord: true,
          availabilityWindows: {
            where: { opportunityKey: PROPOSAL_OFFER_WINDOW_KEY },
            take: 1,
          },
        },
      },
    },
  });
  const editAfterUse = await getRevisionEligibility(afterRevision, now);
  assert(
    !editAfterUse.allowed && !editAfterUse.exceptional,
    "revision exception must not survive the exact Revision it authorized"
  );

  const archived = await applyConferencePolicyPatch({
    conferenceId: conference.id,
    actorRef: `reviewer:admin-${suffix}`,
    patch: { status: "ARCHIVED" },
  });
  assert(
    archived.archiveRecord && archived.status === "ARCHIVED",
    "Archive action should create durable closure and project compatibility status"
  );
  assert(
    archived.archiveRecord.archivedByRef === `reviewer:admin-${suffix}`,
    "Archive should retain actor provenance"
  );

  let reopenRejected = false;
  try {
    await applyConferencePolicyPatch({
      conferenceId: conference.id,
      actorRef: `reviewer:admin-${suffix}`,
      patch: { status: "ACTIVE" },
    });
  } catch (error) {
    reopenRejected =
      error instanceof ApplicationPolicyError &&
      error.code === "ARCHIVE_ROLLBACK_FORBIDDEN";
  }
  assert(reopenRejected, "durable Archive closure must not be reopened");

  const archiveAvailability = observeOfferAvailability(
    archived,
    archived.availabilityWindows[0] ?? null,
    now
  );
  assert(
    !archiveAvailability.open && archiveAvailability.code === "CONTEXT_ARCHIVED",
    "Archive must dominate Window and manual suspension state"
  );

  console.log("004-D lifecycle/authority/disclosure verification passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
