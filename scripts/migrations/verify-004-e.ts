import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  DispatchPolicyError,
  sendCanonicalTemplateBatch,
} from "../../lib/concept-design/dispatch-authority";
import {
  applyConferencePolicyPatch,
  reviewerActorRef,
} from "../../lib/concept-design/lifecycle-disclosure-policy";
import {
  loadExactDeckFileForPublic,
  processPublicationCleanupForSource,
  recordShareEligibilityChange,
  setDeckArchivePublication,
} from "../../lib/concept-design/publication-public-access";
import {
  applyCanonicalManualPlacement,
  applyCanonicalScheduleProposal,
  generateCanonicalScheduleProposal,
  ScheduleBaseConflictError,
} from "../../lib/concept-design/schedule-authority";
import {
  recordCanonicalDeckAssessment,
  recordCanonicalSelection,
  recordProvidedDeckArtifact,
} from "../../lib/concept-design/selection-participation-deliverable";
import { DEFAULT_EMAIL_TEMPLATES } from "../../lib/email-templates";
import { ensureScheduleGrid } from "../../lib/schedule/grid";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`004-E verification failed: ${message}`);
}

async function createSubmission(conferenceId: string, suffix: string, label: string) {
  return prisma.submission.create({
    data: {
      conferenceId,
      presenterTokenHash: `004-e-presenter-${label}-${suffix}`,
      firstName: label,
      lastName: "Presenter",
      degrees: JSON.stringify([]),
      jobTitle: "Engineer",
      organization: "Verification Org",
      title: `${label} 004-E proposal`,
      abstract: `A sufficiently long ${label} abstract for 004-E verification.`,
      technicalLevel: label === "Alpha" ? 2 : 4,
      bio: `A sufficiently long ${label} presenter biography for 004-E verification.`,
      email: `${label.toLowerCase()}-${suffix}@example.com`,
      zipCode: "55401",
      phone: "5555555555",
      linkedinUrl: `https://example.com/${label.toLowerCase()}-${suffix}`,
      linkedinHasPhoto: false,
    },
  });
}

function semanticDispatchAttemptKey(input: {
  conferenceId: string;
  templateKey: string;
  round: number;
  submissionId: string;
}) {
  const digest = createHash("sha256")
    .update(
      `${input.conferenceId}:${input.templateKey}:${input.round}:submission:${input.submissionId}`
    )
    .digest("hex");
  return `dispatch_${digest}`;
}

async function currentPublication(deckFileId: string) {
  return prisma.publication.findUnique({
    where: {
      deckFileId_publicSurfaceKey: {
        deckFileId,
        publicSurfaceKey: "deck-archive",
      },
    },
    include: { currentState: true, states: true },
  });
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const conference = await prisma.conference.create({
    data: {
      slug: `004-e-${suffix}`,
      name: "004-E verification",
      status: "ACTIVE",
      rooms: 2,
      sessionsPerRoom: 2,
      eodTrim: 0,
      graemeSlots: 0,
      submissionsOpen: false,
    },
  });
  const reviewer = await prisma.reviewerAccess.create({
    data: {
      conferenceId: conference.id,
      tokenHash: `004-e-board-${suffix}`,
      role: "BOARD",
      label: "004-E board verifier",
    },
  });
  for (const template of DEFAULT_EMAIL_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { templateKey: template.templateKey },
      create: template,
      update: {
        name: template.name,
        description: template.description,
        subjectTemplate: template.subjectTemplate,
        bodyTemplate: template.bodyTemplate,
      },
    });
  }

  const [alpha, beta] = await Promise.all([
    createSubmission(conference.id, suffix, "Alpha"),
    createSubmission(conference.id, suffix, "Beta"),
  ]);
  const actorRef = reviewerActorRef(reviewer.id);

  const selectedAlpha = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: alpha.id,
    disposition: "SELECTED",
    actorRef,
    commandKey: `004-e-select-alpha-${suffix}`,
  });
  const selectedBeta = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: beta.id,
    disposition: "SELECTED",
    actorRef,
    commandKey: `004-e-select-beta-${suffix}`,
  });
  assert(selectedAlpha.decision && selectedBeta.decision, "both proposals should be selected");

  const alphaV1 = await recordProvidedDeckArtifact({
    submissionId: alpha.id,
    filename: "alpha-v1.pdf",
    storagePath: `verification/${suffix}/alpha-v1.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 101,
  });
  const betaV1 = await recordProvidedDeckArtifact({
    submissionId: beta.id,
    filename: "beta-v1.pdf",
    storagePath: `verification/${suffix}/beta-v1.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 102,
  });
  await recordCanonicalDeckAssessment({
    conferenceId: conference.id,
    submissionId: alpha.id,
    disposition: "READY",
    reviewerRef: actorRef,
    commandKey: `004-e-ready-alpha-v1-${suffix}`,
  });
  await recordCanonicalDeckAssessment({
    conferenceId: conference.id,
    submissionId: beta.id,
    disposition: "READY",
    reviewerRef: actorRef,
    commandKey: `004-e-ready-beta-v1-${suffix}`,
  });

  const alphaShare = await recordShareEligibilityChange({
    conferenceId: conference.id,
    submissionId: alpha.id,
    eligible: true,
    actorRef,
  });
  await recordShareEligibilityChange({
    conferenceId: conference.id,
    submissionId: beta.id,
    eligible: true,
    actorRef,
  });
  assert(alphaShare.change?.changedByRef === actorRef, "native share policy must preserve actor provenance");
  assert(alphaShare.change?.changedAt, "native share policy must preserve change time");

  const publishInitial = await setDeckArchivePublication({
    conferenceId: conference.id,
    publish: true,
    actorRef,
  });
  assert(publishInitial.transitioned === 2, "initial archive publish should expose both exact ready artifacts");

  const exactAlphaV1 = await loadExactDeckFileForPublic(alphaV1.publicId);
  assert(exactAlphaV1.exactMode && exactAlphaV1.file?.id === alphaV1.id, "exact current Alpha artifact should resolve publicly");
  const exactBetaV1 = await loadExactDeckFileForPublic(betaV1.publicId);
  assert(exactBetaV1.exactMode && exactBetaV1.file?.id === betaV1.id, "exact current Beta artifact should resolve publicly");

  const alphaV2 = await recordProvidedDeckArtifact({
    submissionId: alpha.id,
    filename: "alpha-v2.pdf",
    storagePath: `verification/${suffix}/alpha-v2.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 201,
  });
  const oldBeforeCleanup = await loadExactDeckFileForPublic(alphaV1.publicId);
  assert(oldBeforeCleanup.exactMode && !oldBeforeCleanup.file, "superseded publicId must be denied immediately from exact eligibility");
  const replacementWork = await prisma.synchronizationWork.findUnique({
    where: {
      syncId_sourceRef_effectKey: {
        syncId: "SYNC-008",
        sourceRef: alphaV2.id,
        effectKey: `publication-unpublish-artifact:${alphaV1.id}`,
      },
    },
  });
  assert(replacementWork, "artifact replacement must enqueue durable SYNC-008 work in the source transaction");
  await processPublicationCleanupForSource(alphaV2.id, `presenter:${alpha.id}`);
  const alphaV1Publication = await currentPublication(alphaV1.id);
  assert(alphaV1Publication?.currentState?.availability === "UNPUBLISHED", "superseded exact Publication should converge to unpublished");

  const unreadyV2 = await setDeckArchivePublication({
    conferenceId: conference.id,
    publish: true,
    actorRef,
  });
  assert(unreadyV2.transitioned === 0, "replacement artifact must not inherit prior readiness/publication");
  const alphaV2BeforeReady = await loadExactDeckFileForPublic(alphaV2.publicId);
  assert(!alphaV2BeforeReady.file, "unassessed replacement must remain private");

  await recordCanonicalDeckAssessment({
    conferenceId: conference.id,
    submissionId: alpha.id,
    disposition: "READY",
    reviewerRef: actorRef,
    commandKey: `004-e-ready-alpha-v2-${suffix}`,
  });
  const republishV2 = await setDeckArchivePublication({
    conferenceId: conference.id,
    publish: true,
    actorRef,
  });
  assert(republishV2.transitioned === 1, "ready replacement requires its own Publication transition");
  const alphaV2Public = await loadExactDeckFileForPublic(alphaV2.publicId);
  assert(alphaV2Public.file?.id === alphaV2.id, "new exact artifact should resolve after explicit publication");
  const alphaV1StillPrivate = await loadExactDeckFileForPublic(alphaV1.publicId);
  assert(!alphaV1StillPrivate.file, "publishing the replacement must never repoint the old Publication");

  const revoked = await recordShareEligibilityChange({
    conferenceId: conference.id,
    submissionId: alpha.id,
    eligible: false,
    actorRef,
  });
  assert(revoked.cleanupPending === 0, "share revocation should converge local Publication cleanup");
  assert(!(await loadExactDeckFileForPublic(alphaV2.publicId)).file, "share revocation must remove public eligibility immediately");
  assert((await currentPublication(alphaV2.id))?.currentState?.availability === "UNPUBLISHED", "share revocation must append UNPUBLISHED state");

  await recordShareEligibilityChange({
    conferenceId: conference.id,
    submissionId: alpha.id,
    eligible: true,
    actorRef,
  });
  await setDeckArchivePublication({ conferenceId: conference.id, publish: true, actorRef });

  await ensureScheduleGrid(conference.id);
  const beforeProposal = await prisma.schedulePlacement.findMany({
    where: { conferenceId: conference.id, slot: { slotType: "SESSION" } },
    orderBy: { id: "asc" },
  });
  const proposal = await generateCanonicalScheduleProposal(conference.id);
  const afterProposal = await prisma.schedulePlacement.findMany({
    where: { conferenceId: conference.id, slot: { slotType: "SESSION" } },
    orderBy: { id: "asc" },
  });
  assert(
    JSON.stringify(beforeProposal.map((row) => [row.id, row.submissionId])) ===
      JSON.stringify(afterProposal.map((row) => [row.id, row.submissionId])),
    "schedule generation must not mutate authoritative placements"
  );
  assert(proposal.assignments.length === 2, "schedule proposal should contain both effective participants");

  await applyCanonicalManualPlacement({
    conferenceId: conference.id,
    placementId: proposal.assignments[0].placementId,
    submissionId: proposal.assignments[0].submissionId,
  });
  const manualState = await prisma.schedulePlacement.findMany({
    where: { conferenceId: conference.id, slot: { slotType: "SESSION" } },
    orderBy: { id: "asc" },
  });
  let staleRejected = false;
  try {
    await applyCanonicalScheduleProposal({
      conferenceId: conference.id,
      expectedBaseFingerprint: proposal.baseFingerprint,
      assignments: proposal.assignments,
    });
  } catch (error) {
    staleRejected = error instanceof ScheduleBaseConflictError;
  }
  assert(staleRejected, "accepted Schedule proposal must reject a stale base");
  const afterStale = await prisma.schedulePlacement.findMany({
    where: { conferenceId: conference.id, slot: { slotType: "SESSION" } },
    orderBy: { id: "asc" },
  });
  assert(
    JSON.stringify(manualState.map((row) => [row.id, row.submissionId])) ===
      JSON.stringify(afterStale.map((row) => [row.id, row.submissionId])),
    "stale Schedule rejection must not partially rewrite placements"
  );

  const freshProposal = await generateCanonicalScheduleProposal(conference.id);
  const applied = await applyCanonicalScheduleProposal({
    conferenceId: conference.id,
    expectedBaseFingerprint: freshProposal.baseFingerprint,
    assignments: freshProposal.assignments,
  });
  assert(applied.applied === 2, "fresh Schedule proposal should apply atomically");
  assert(
    (await prisma.schedulePlacement.count({
      where: { conferenceId: conference.id, submissionId: { not: null } },
    })) === 2,
    "accepted Schedule should have exactly one placement for each effective participant"
  );

  const dispatchRound1 = await sendCanonicalTemplateBatch({
    conferenceId: conference.id,
    templateKey: "CALL_FOR_DECK",
    round: 1,
    sentByReviewerAccessId: reviewer.id,
  });
  assert(dispatchRound1.recipientCount === 2, "round 1 should perform one send per eligible stable recipient");
  assert(dispatchRound1.failedCount === 0 && dispatchRound1.blockedCount === 0, "round 1 should resolve successfully with the local provider stub");
  const round1Records = await prisma.emailSendRecord.findMany({
    where: { conferenceId: conference.id, templateKey: "CALL_FOR_DECK", round: 1 },
  });
  assert(round1Records.length === 2, "round 1 must create two canonical SendRecords");
  assert(
    round1Records.every((record) => record.renderedSubject && record.renderedBody && record.contentHash),
    "canonical SendRecords must preserve exact rendered message evidence"
  );
  const round1Attempts = await prisma.dispatchAttempt.findMany({
    where: { conferenceId: conference.id, templateKey: "CALL_FOR_DECK", round: 1 },
  });
  assert(
    round1Attempts.length === 2 && round1Attempts.every((attempt) => attempt.state === "SUCCEEDED" && attempt.sendRecordId),
    "provider attempts should link successful handoff to canonical SendRecords"
  );

  const sameRound = await sendCanonicalTemplateBatch({
    conferenceId: conference.id,
    templateKey: "CALL_FOR_DECK",
    round: 1,
    sentByReviewerAccessId: reviewer.id,
  });
  assert(sameRound.recipientCount === 0, "same-round repeat must be idempotent rather than resend");
  assert(
    (await prisma.emailSendRecord.count({
      where: { conferenceId: conference.id, templateKey: "CALL_FOR_DECK", round: 1 },
    })) === 2,
    "same-round retry must not create duplicate SendRecords"
  );

  const round2 = await sendCanonicalTemplateBatch({
    conferenceId: conference.id,
    templateKey: "CALL_FOR_DECK",
    round: 2,
    sentByReviewerAccessId: reviewer.id,
    recipientSubmissionIds: [alpha.id],
  });
  assert(round2.recipientCount === 1, "new semantic round should permit intentional repeat contact");
  assert(
    (await prisma.emailSendRecord.count({
      where: { conferenceId: conference.id, templateKey: "CALL_FOR_DECK", round: 2, submissionId: alpha.id },
    })) === 1,
    "new round must create a distinct canonical SendRecord"
  );

  const uncertainBatch = await prisma.conferenceEmailBatch.create({
    data: {
      conferenceId: conference.id,
      templateKey: "CALL_FOR_DECK",
      round: 3,
      sentByReviewerAccessId: reviewer.id,
      recipientCount: 0,
    },
  });
  await prisma.dispatchAttempt.create({
    data: {
      batchId: uncertainBatch.id,
      conferenceId: conference.id,
      templateKey: "CALL_FOR_DECK",
      round: 3,
      submissionId: alpha.id,
      email: alpha.email,
      renderedSubject: "Prepared uncertain subject",
      renderedBody: "Prepared uncertain body",
      contentHash: "prepared-uncertain-hash",
      providerAttemptKey: semanticDispatchAttemptKey({
        conferenceId: conference.id,
        templateKey: "CALL_FOR_DECK",
        round: 3,
        submissionId: alpha.id,
      }),
      state: "UNCERTAIN",
    },
  });
  const uncertainRetry = await sendCanonicalTemplateBatch({
    conferenceId: conference.id,
    templateKey: "CALL_FOR_DECK",
    round: 3,
    sentByReviewerAccessId: reviewer.id,
    recipientSubmissionIds: [alpha.id],
  });
  assert(uncertainRetry.blockedCount === 1 && uncertainRetry.recipientCount === 0, "uncertain provider outcome must block blind resend");
  assert(
    (await prisma.emailSendRecord.count({
      where: { conferenceId: conference.id, templateKey: "CALL_FOR_DECK", round: 3, submissionId: alpha.id },
    })) === 0,
    "uncertain provider outcome must not fabricate a performed SendRecord"
  );

  const betaExit = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: beta.id,
    disposition: "RESERVE",
    actorRef,
    commandKey: `004-e-reserve-beta-${suffix}`,
  });
  assert(betaExit.decision, "Beta exit should append a Selection Decision");
  const betaPublicationWork = await prisma.synchronizationWork.findUnique({
    where: {
      syncId_sourceRef_effectKey: {
        syncId: "SYNC-008",
        sourceRef: betaExit.decision.id,
        effectKey: `publication-unpublish-submission:${beta.id}`,
      },
    },
  });
  assert(betaPublicationWork, "participation exit must enqueue Publication cleanup in the source transaction");
  await processPublicationCleanupForSource(betaExit.decision.id, actorRef);
  assert((await currentPublication(betaV1.id))?.currentState?.availability === "UNPUBLISHED", "participation exit must converge exact Publication to unpublished");
  assert(!(await loadExactDeckFileForPublic(betaV1.publicId)).file, "participation exit must deny exact public access immediately");
  assert(
    (await prisma.schedulePlacement.count({ where: { conferenceId: conference.id, submissionId: beta.id } })) === 0,
    "existing 004-C Schedule cleanup should remain composed with Publication cleanup"
  );

  await setDeckArchivePublication({ conferenceId: conference.id, publish: false, actorRef });
  await applyConferencePolicyPatch({
    conferenceId: conference.id,
    actorRef,
    patch: { status: "ARCHIVED" },
  });
  const postArchivePublish = await setDeckArchivePublication({
    conferenceId: conference.id,
    publish: true,
    actorRef,
  });
  assert(postArchivePublish.transitioned === 1, "post-Archive publish should expose the one remaining exact eligible deck without reopening the context");
  assert((await loadExactDeckFileForPublic(alphaV2.publicId)).file?.id === alphaV2.id, "post-Archive exact publication should resolve");

  let archivedOperationalBlocked = false;
  try {
    await sendCanonicalTemplateBatch({
      conferenceId: conference.id,
      templateKey: "CALL_FOR_DECK",
      round: 4,
      sentByReviewerAccessId: reviewer.id,
    });
  } catch (error) {
    archivedOperationalBlocked =
      error instanceof DispatchPolicyError &&
      error.code === "DISPATCH_NOT_POST_CLOSURE_SAFE";
  }
  assert(archivedOperationalBlocked, "ordinary operational Dispatch must be blocked after Archive");

  const postArchiveFeedback = await sendCanonicalTemplateBatch({
    conferenceId: conference.id,
    templateKey: "CALL_FOR_FEEDBACK",
    round: 1,
    sentByReviewerAccessId: reviewer.id,
  });
  assert(postArchiveFeedback.recipientCount === 1, "explicit post-closure-safe feedback Dispatch should remain available for the selected participant");

  const alphaPublication = await currentPublication(alphaV2.id);
  assert(alphaPublication && alphaPublication.states.length >= 3, "Publication history should retain publish/unpublish/republish transitions instead of overwriting current state");

  console.log(
    JSON.stringify(
      {
        ok: true,
        conferenceId: conference.id,
        alphaPublicationId: alphaPublication.id,
        publicationStates: alphaPublication.states.length,
        scheduleAssignments: applied.applied,
        dispatchRound1: round1Records.length,
        dispatchRound2: round2.recipientCount,
        postArchiveFeedback: postArchiveFeedback.recipientCount,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
