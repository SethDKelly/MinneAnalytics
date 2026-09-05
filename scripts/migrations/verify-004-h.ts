import { PrismaClient } from "@prisma/client";
import {
  normalizeThemeCoverageBounds,
  setThemeCoverageTarget,
  themeSelectionCoverageAdvisory,
} from "../../lib/concept-design/coverage-targets";
import { hasApplicationCapability } from "../../lib/concept-design/lifecycle-disclosure-policy";
import { establishInitialRevision } from "../../lib/concept-design/revision-evaluation";
import { establishInitialTermState } from "../../lib/concept-design/vocabulary";
import { getConferenceThemesForAdmin } from "../../lib/themes";
import { generateToken, hashToken } from "../../lib/tokens";
import { POST as recordFeedback } from "../../app/api/review/feedback/route";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`004-H verification failed: ${message}`);
}

async function createSubmission(input: {
  conferenceId: string;
  suffix: string;
  label: string;
  themeId: string;
}) {
  const submission = await prisma.submission.create({
    data: {
      conferenceId: input.conferenceId,
      presenterTokenHash: `004-h-presenter-${input.label}-${input.suffix}`,
      firstName: input.label,
      lastName: "Presenter",
      degrees: JSON.stringify([]),
      jobTitle: "Engineer",
      organization: "004-H Verification",
      title: `${input.label} closure verification`,
      abstract:
        "A sufficiently long abstract used to verify final Feedback and Coverage Target separation behavior.",
      technicalLevel: 3,
      bio: "A sufficiently long presenter biography used by the 004-H verification fixture.",
      email: `${input.label.toLowerCase()}-${input.suffix}@example.com`,
      zipCode: "55401",
      phone: "5555555555",
      linkedinUrl: "https://www.linkedin.com/in/example",
      linkedinHasPhoto: true,
      themes: { create: [{ themeId: input.themeId }] },
    },
  });
  const revision = await prisma.$transaction((tx) =>
    establishInitialRevision(tx, {
      submissionId: submission.id,
      snapshot: {
        title: submission.title,
        abstract: submission.abstract,
        bio: submission.bio,
        technicalLevel: submission.technicalLevel,
        themeIds: [input.themeId],
      },
    })
  );
  return { submission, revision };
}

async function main() {
  process.env.MINNE_V0_SEMANTIC_READS = "true";
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  assert(
    hasApplicationCapability("ADMIN", "MANAGE_VOCABULARY"),
    "Vocabulary authority must be an explicit capability"
  );
  assert(
    hasApplicationCapability("ADMIN", "MANAGE_COVERAGE_TARGETS"),
    "Coverage Target authority must be an explicit capability"
  );
  assert(
    normalizeThemeCoverageBounds(0, 0) === null,
    "legacy 0/0 bounds must mean no explicit Coverage Target"
  );

  const conference = await prisma.conference.create({
    data: {
      slug: `004-h-${suffix}`,
      name: "004-H closure verification",
      status: "ACTIVE",
      submissionsOpen: true,
    },
  });
  const theme = await prisma.theme.create({
    data: {
      conferenceId: conference.id,
      slug: `closure-${suffix}`,
      name: "Closure Theme",
      targetMin: 0,
      targetMax: 0,
    },
  });
  await prisma.$transaction(async (tx) => {
    await establishInitialTermState(tx, {
      themeId: theme.id,
      label: theme.name,
      recordedByRef: `reviewer:004-h-admin-${suffix}`,
    });
    await setThemeCoverageTarget(tx, {
      conferenceId: conference.id,
      themeId: theme.id,
      targetMin: 0,
      targetMax: 1,
    });
  });

  const selected = await createSubmission({
    conferenceId: conference.id,
    suffix,
    label: "Selected",
    themeId: theme.id,
  });
  const candidate = await createSubmission({
    conferenceId: conference.id,
    suffix,
    label: "Candidate",
    themeId: theme.id,
  });
  const decision = await prisma.selectionDecision.create({
    data: {
      conferenceId: conference.id,
      submissionId: selected.submission.id,
      disposition: "SELECTED",
      decidedByRef: `reviewer:004-h-board-${suffix}`,
      decidedAt: new Date(),
    },
  });
  await prisma.submission.update({
    where: { id: selected.submission.id },
    data: {
      currentSelectionDecisionId: decision.id,
      programStatus: "APPROVED",
    },
  });

  // Deliberately drift the compatibility projection. Coverage reads must still use CoverageTarget.
  await prisma.theme.update({
    where: { id: theme.id },
    data: { targetMin: 0, targetMax: 0 },
  });
  const advisory = await themeSelectionCoverageAdvisory(conference.id, [theme.id]);
  assert(advisory?.basis === "coverage-target", "Coverage warning must use canonical CoverageTarget");
  assert(advisory?.upperBound === 1, "Coverage upper bound must survive compatibility drift");
  assert(advisory?.observed === 1, "Coverage observation must use effective participation");
  const organizerThemes = await getConferenceThemesForAdmin(conference.id);
  const organizerTheme = organizerThemes.find((row) => row.id === theme.id);
  assert(organizerTheme?.targetMax === 1, "organizer theme view must overlay canonical CoverageTarget bounds");
  assert(
    organizerTheme?.currentTermState?.availability === "AVAILABLE",
    "organizer Vocabulary view must use current TermState"
  );

  const reviewerToken = generateToken();
  const reviewer = await prisma.reviewerAccess.create({
    data: {
      conferenceId: conference.id,
      tokenHash: hashToken(reviewerToken),
      role: "CHAIR",
      label: "004-H feedback verifier",
    },
  });
  assert(
    hasApplicationCapability(reviewer.role, "GIVE_FEEDBACK"),
    "Feedback verifier requires GIVE_FEEDBACK capability"
  );

  const before = await prisma.submission.findUniqueOrThrow({
    where: { id: candidate.submission.id },
  });
  const sendCountBefore = await prisma.emailSendRecord.count({
    where: { submissionId: candidate.submission.id },
  });
  const response = await recordFeedback(
    new Request("http://localhost/api/review/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: reviewerToken,
        submissionId: candidate.submission.id,
        kind: "ABSTRACT",
        body: "Please clarify the evidence boundary in the final section.",
      }),
    })
  );
  assert(response.status === 200, `Feedback route returned ${response.status}`);
  const body = (await response.json()) as {
    feedbackId?: string;
    submissionRevisionId?: string | null;
    notificationDispatchCreated?: boolean;
  };
  assert(Boolean(body.feedbackId), "Feedback record must be created");
  assert(
    body.submissionRevisionId === candidate.revision.id,
    "abstract Feedback must bind the exact current Revision"
  );
  assert(
    body.notificationDispatchCreated === false,
    "Feedback action must not disguise a direct email side effect as Dispatch"
  );

  const after = await prisma.submission.findUniqueOrThrow({
    where: { id: candidate.submission.id },
  });
  assert(
    after.abstractReviewStatus === before.abstractReviewStatus,
    "Feedback must not mutate abstractReviewStatus/workflow projection"
  );
  const sendCountAfter = await prisma.emailSendRecord.count({
    where: { submissionId: candidate.submission.id },
  });
  assert(
    sendCountAfter === sendCountBefore,
    "Feedback creation must not synchronously create notification send evidence"
  );

  const feedback = await prisma.presenterFeedback.findUniqueOrThrow({
    where: { id: body.feedbackId! },
  });
  assert(
    feedback.submissionRevisionId === candidate.revision.id,
    "stored Feedback must retain exact Revision subject"
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        conferenceId: conference.id,
        coverageAuthority: {
          targetRef: advisory ? theme.id : null,
          basis: advisory?.basis ?? null,
          observed: advisory?.observed ?? null,
          upperBound: advisory?.upperBound ?? null,
          organizerViewUsesCanonicalTarget: organizerTheme?.targetMax === 1,
          compatibilityProjectionDeliberatelyDrifted: true,
        },
        feedbackSeparation: {
          feedbackRef: feedback.id,
          revisionRef: feedback.submissionRevisionId,
          workflowProjectionUnchanged: true,
          directNotificationSideEffectAbsent: true,
        },
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
