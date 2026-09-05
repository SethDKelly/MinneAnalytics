import { PrismaClient } from "@prisma/client";
import { isImplementationGateEnabled } from "../../lib/concept-design/implementation-gates";
import {
  appendCanonicalRevision,
  establishInitialRevision,
  recordCanonicalEvaluation,
} from "../../lib/concept-design/revision-evaluation";
import {
  recordCanonicalDeckAssessment,
  recordCanonicalSelection,
  recordProvidedDeckArtifact,
} from "../../lib/concept-design/selection-participation-deliverable";
import { recordShareEligibilityChange } from "../../lib/concept-design/publication-public-access";
import {
  getSemanticConferenceSubmissions,
  evaluationApplicabilityForReviewer,
} from "../../lib/concept-design/semantic-reads";
import {
  getCapacityForConference,
  getReviewerQueue,
} from "../../lib/conference-data";
import { getDeckQueue } from "../../lib/decks";
import { loadScheduleState } from "../../lib/schedule/grid";
import { resolveCanonicalDispatchRecipients } from "../../lib/concept-design/dispatch-authority";
import { getProposalOfferAvailability } from "../../lib/submission-window";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`004-F verification failed: ${message}`);
}

async function main() {
  assert(
    isImplementationGateEnabled("semanticReads"),
    "MINNE_V0_SEMANTIC_READS must be enabled for the 004-F cutover verifier"
  );

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const now = new Date();
  const conference = await prisma.conference.create({
    data: {
      slug: `004-f-${suffix}`,
      name: "004-F semantic-read verification",
      status: "ACTIVE",
      rooms: 2,
      sessionsPerRoom: 2,
      eodTrim: 0,
      graemeSlots: 0,
      submissionsOpen: true,
      // Deliberately incompatible legacy mirrors. Canonical AvailabilityWindow below must win.
      submissionsOpenAt: new Date(now.getTime() + 86_400_000),
      submissionsCloseAt: new Date(now.getTime() + 172_800_000),
    },
  });
  await prisma.availabilityWindow.create({
    data: {
      conferenceId: conference.id,
      opportunityKey: "proposal-offer",
      opensAt: new Date(now.getTime() - 3_600_000),
      closesAt: new Date(now.getTime() + 3_600_000),
    },
  });

  const reviewer = await prisma.reviewerAccess.create({
    data: {
      conferenceId: conference.id,
      tokenHash: `004-f-reviewer-${suffix}`,
      role: "BOARD",
      label: "004-F semantic verifier",
    },
  });
  const themeA = await prisma.theme.create({
    data: {
      conferenceId: conference.id,
      slug: `legacy-${suffix}`,
      name: "Legacy Theme",
    },
  });
  const themeB = await prisma.theme.create({
    data: {
      conferenceId: conference.id,
      slug: `canonical-${suffix}`,
      name: "Canonical Theme",
    },
  });
  const submission = await prisma.submission.create({
    data: {
      conferenceId: conference.id,
      presenterTokenHash: `004-f-presenter-${suffix}`,
      firstName: "Semantic",
      lastName: "Presenter",
      degrees: JSON.stringify([]),
      jobTitle: "Engineer",
      organization: "Verification Org",
      title: "Revision one title",
      abstract: "Revision one abstract has enough content for semantic read verification.",
      technicalLevel: 2,
      bio: "Revision one biography has enough content for semantic read verification.",
      email: `semantic-${suffix}@example.com`,
      zipCode: "55401",
      phone: "5555555555",
      linkedinUrl: `https://example.com/semantic-${suffix}`,
      linkedinHasPhoto: false,
      themes: { create: [{ themeId: themeA.id }] },
    },
  });

  const revision1 = await prisma.$transaction((tx) =>
    establishInitialRevision(tx, {
      submissionId: submission.id,
      snapshot: {
        title: "Revision one title",
        abstract: "Revision one abstract has enough content for semantic read verification.",
        bio: "Revision one biography has enough content for semantic read verification.",
        technicalLevel: 2,
        themeIds: [themeA.id],
      },
    })
  );
  await recordCanonicalEvaluation({
    submissionId: submission.id,
    reviewerAccessId: reviewer.id,
    value: 0.7,
    notes: "Evaluation of exact revision one",
  });

  const revision2Result = await appendCanonicalRevision({
    submissionId: submission.id,
    expectedRevisionId: revision1.id,
    requireExpectedHead: true,
    commandKey: `004-f-revise-${suffix}`,
    snapshot: {
      title: "Revision two canonical title",
      abstract: "Revision two canonical abstract is the exact current content.",
      bio: "Revision two canonical biography is the exact current biography.",
      technicalLevel: 4,
      themeIds: [themeB.id],
    },
    changedFields: ["title", "abstract", "bio", "technicalLevel", "themes"],
  });
  const revision2 = revision2Result.revision;

  const selection = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: submission.id,
    disposition: "SELECTED",
    actorRef: `reviewer:${reviewer.id}`,
    commandKey: `004-f-select-${suffix}`,
  });
  assert(selection.decision, "native Selection decision should be created");

  const artifact = await recordProvidedDeckArtifact({
    submissionId: submission.id,
    filename: "004-f.pdf",
    storagePath: `verification/${suffix}/004-f.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 404,
  });
  const assessment = await recordCanonicalDeckAssessment({
    conferenceId: conference.id,
    submissionId: submission.id,
    disposition: "READY",
    reviewerRef: `reviewer:${reviewer.id}`,
    commandKey: `004-f-ready-${suffix}`,
  });
  assert(
    assessment.assessment.artifactVersionId === artifact.id,
    "READY Assessment should bind the exact current ArtifactVersion"
  );
  await recordShareEligibilityChange({
    conferenceId: conference.id,
    submissionId: submission.id,
    eligible: true,
    actorRef: `reviewer:${reviewer.id}`,
  });

  // Intentionally corrupt compatibility/current-projection surfaces after canonical truth exists.
  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      programStatus: "PENDING",
      title: "STALE LEGACY TITLE",
      abstract: "STALE LEGACY ABSTRACT",
      bio: "STALE LEGACY BIO",
      technicalLevel: 1,
      abstractVersion: 999,
      abstractReviewStatus: "FEEDBACK_PENDING",
      deckStatus: "CONCERN",
      deckShareable: false,
    },
  });
  await prisma.submissionTheme.deleteMany({ where: { submissionId: submission.id } });
  await prisma.submissionTheme.create({
    data: { submissionId: submission.id, themeId: themeA.id },
  });

  const availability = await getProposalOfferAvailability(conference.id, now);
  assert(availability?.state.open, "canonical AvailabilityWindow should override drifted timestamp mirrors");

  const semanticRows = await getSemanticConferenceSubmissions(conference.id);
  const semantic = semanticRows.find((row) => row.id === submission.id);
  assert(semantic, "semantic Proposal read should exist");
  assert(semantic.semantic.readSource === "canonical", "semantic read source should be canonical");
  assert(
    semantic.semantic.revision.currentRevisionRef === revision2.id &&
      semantic.semantic.revision.ordinal === 2,
    "exact current RevisionRef and ordinal should ignore abstractVersion drift"
  );
  assert(
    semantic.title === "Revision two canonical title" && semantic.technicalLevel === 4,
    "current content should come from exact current Revision rather than Submission projection"
  );
  assert(
    semantic.themes.length === 1 && semantic.themes[0]?.themeId === themeB.id,
    "current Classification should come from exact RevisionTerm rather than SubmissionTheme"
  );
  assert(
    semantic.semantic.selection.disposition === "SELECTED" &&
      semantic.semantic.participation.effective,
    "Selection and effective participation should ignore programStatus drift"
  );
  assert(
    semantic.semantic.deliverable.readiness === "ready" &&
      semantic.semantic.deliverable.currentArtifactVersionRef === artifact.id,
    "Deliverable readiness should ignore deckStatus drift"
  );
  assert(
    semantic.semantic.sharing.eligible,
    "ShareEligibilityChange should ignore deckShareable drift"
  );
  assert(
    !semantic.compatibility.programStatusMatches &&
      !semantic.compatibility.abstractVersionMatches &&
      !semantic.compatibility.deckShareableMatches,
    "parity metadata should expose deliberate compatibility drift"
  );

  const applicabilityBefore = evaluationApplicabilityForReviewer(semantic, reviewer.id);
  assert(
    applicabilityBefore.state === "revision-changed" &&
      applicabilityBefore.subjectRevisionRef === revision1.id,
    "prior Revision Evaluation must be retained and classified as rescore work"
  );
  const queueBefore = await getReviewerQueue(conference.id, reviewer.id);
  assert(
    queueBefore.needsRescore.some((item) => item.id === submission.id),
    "reviewer queue should place prior-Revision Evaluation in Needs rescore"
  );

  await recordCanonicalEvaluation({
    submissionId: submission.id,
    reviewerAccessId: reviewer.id,
    value: 0.9,
    notes: "Evaluation of exact revision two",
  });
  const queueAfter = await getReviewerQueue(conference.id, reviewer.id);
  assert(
    queueAfter.scored.some((item) => item.id === submission.id) &&
      !queueAfter.needsRescore.some((item) => item.id === submission.id),
    "exact current Revision Evaluation should move the reviewer queue to current"
  );

  const capacity = await getCapacityForConference(conference.id);
  assert(
    capacity.approvedCount === 1,
    "Capacity display should count canonical effective participation despite programStatus=PENDING"
  );

  const deckQueue = await getDeckQueue(conference.id);
  const deckItem = deckQueue.find((item) => item.submissionId === submission.id);
  assert(
    deckItem?.readiness === "ready" && deckItem.shareEligible,
    "deck queue should use exact Deliverable and sharing state despite compatibility drift"
  );

  const scheduleState = await loadScheduleState(conference.id);
  const scheduleTalk = scheduleState.unscheduled.find((item) => item.id === submission.id);
  assert(scheduleTalk, "Schedule pool should include canonical effective participant");
  assert(
    scheduleTalk.title === "Revision two canonical title" && scheduleTalk.technicalLevel === 4,
    "Schedule read should use exact current Revision content"
  );

  const dispatch = await resolveCanonicalDispatchRecipients({
    conferenceId: conference.id,
    templateKey: "CALL_FOR_DECK",
    round: 1,
  });
  const recipient = dispatch.recipients.find(
    (item) => item.kind === "submission" && item.submissionId === submission.id
  );
  assert(recipient, "Dispatch audience should include canonical effective participant");
  assert(
    recipient.context.title === "Revision two canonical title",
    "Dispatch message context should use exact current Revision title"
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        conferenceId: conference.id,
        proposalRef: submission.id,
        currentRevisionRef: revision2.id,
        priorEvaluationClassified: applicabilityBefore.state,
        compatibilityDriftDetected: {
          programStatus: !semantic.compatibility.programStatusMatches,
          abstractVersion: !semantic.compatibility.abstractVersionMatches,
          deckShareable: !semantic.compatibility.deckShareableMatches,
        },
        capacityApprovedCount: capacity.approvedCount,
        scheduleTitle: scheduleTalk.title,
        dispatchTitle: recipient.context.title,
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
