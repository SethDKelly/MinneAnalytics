import { PrismaClient } from "@prisma/client";
import {
  appendCanonicalRevision,
  establishInitialRevision,
  recordCanonicalEvaluation,
  StaleRevisionHeadError,
} from "../../lib/concept-design/revision-evaluation";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`004-B verification failed: ${message}`);
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const conference = await prisma.conference.create({
    data: {
      slug: `004-b-${suffix}`,
      name: "004-B verification",
      submissionsOpen: true,
    },
  });
  const [termA, termB] = await Promise.all([
    prisma.theme.create({
      data: {
        conferenceId: conference.id,
        slug: `term-a-${suffix}`,
        name: "Term A",
      },
    }),
    prisma.theme.create({
      data: {
        conferenceId: conference.id,
        slug: `term-b-${suffix}`,
        name: "Term B",
      },
    }),
  ]);
  const reviewer = await prisma.reviewerAccess.create({
    data: {
      conferenceId: conference.id,
      tokenHash: `reviewer-${suffix}`,
      role: "BOARD",
    },
  });

  const submission = await prisma.$transaction(async (tx) => {
    const created = await tx.submission.create({
      data: {
        conferenceId: conference.id,
        presenterTokenHash: `presenter-${suffix}`,
        firstName: "Test",
        lastName: "Presenter",
        degrees: JSON.stringify(["None"]),
        jobTitle: "Engineer",
        organization: "Test Org",
        title: "Initial title",
        abstract: "A sufficiently long verification abstract used to exercise canonical revision behavior.",
        technicalLevel: 3,
        bio: "A sufficiently long verification biography.",
        email: `test-${suffix}@example.com`,
        zipCode: "55401",
        phone: "5555555555",
        linkedinUrl: "https://example.com/test",
        linkedinHasPhoto: false,
        themes: { create: [{ themeId: termA.id }] },
      },
    });
    const revision = await establishInitialRevision(tx, {
      submissionId: created.id,
      snapshot: {
        title: created.title,
        abstract: created.abstract,
        bio: created.bio,
        technicalLevel: created.technicalLevel,
        themeIds: [termA.id],
      },
    });
    return { ...created, currentRevisionId: revision.id };
  });

  const v1 = await prisma.submissionRevision.findUniqueOrThrow({
    where: { id: submission.currentRevisionId },
    include: { revisionTerms: true },
  });
  assert(v1.version === 1, "initial exact Revision should be v1");
  assert(v1.revisionTerms.length === 1 && v1.revisionTerms[0].themeId === termA.id, "initial exact Classification should be recorded");

  const commandKey = `revision-${suffix}`;
  const v2Result = await appendCanonicalRevision({
    submissionId: submission.id,
    expectedRevisionId: v1.id,
    commandKey,
    requireExpectedHead: true,
    snapshot: {
      title: "Revised title",
      abstract: "A second sufficiently long verification abstract used to exercise exact revision behavior.",
      bio: "A sufficiently long revised verification biography.",
      technicalLevel: 4,
      themeIds: [termA.id, termB.id],
    },
    changedFields: ["title", "abstract", "bio", "technicalLevel", "themes"],
    changeNote: "004-B verifier",
  });
  assert(v2Result.revision.version === 2, "successor Revision should increment the exact head");
  assert(!v2Result.replayed, "first command should not be a replay");

  const replay = await appendCanonicalRevision({
    submissionId: submission.id,
    expectedRevisionId: v1.id,
    commandKey,
    requireExpectedHead: true,
    snapshot: {
      title: "Revised title",
      abstract: "A second sufficiently long verification abstract used to exercise exact revision behavior.",
      bio: "A sufficiently long revised verification biography.",
      technicalLevel: 4,
      themeIds: [termA.id, termB.id],
    },
    changedFields: ["title"],
  });
  assert(replay.replayed && replay.revision.id === v2Result.revision.id, "same command key should return the original Revision");

  let staleRejected = false;
  try {
    await appendCanonicalRevision({
      submissionId: submission.id,
      expectedRevisionId: v1.id,
      commandKey: `stale-${suffix}`,
      requireExpectedHead: true,
      snapshot: {
        title: "Stale update",
        abstract: "A stale sufficiently long verification abstract that must not create a branch.",
        bio: "A sufficiently long stale verification biography.",
        technicalLevel: 2,
        themeIds: [termA.id],
      },
      changedFields: ["title"],
    });
  } catch (error) {
    staleRejected = error instanceof StaleRevisionHeadError;
  }
  assert(staleRejected, "stale expected head should be rejected");

  await recordCanonicalEvaluation({
    submissionId: submission.id,
    reviewerAccessId: reviewer.id,
    value: 0.6,
    notes: "v2 first judgment",
  });
  await recordCanonicalEvaluation({
    submissionId: submission.id,
    reviewerAccessId: reviewer.id,
    value: 0.7,
    notes: "v2 revised judgment",
  });
  let evaluations = await prisma.score.findMany({
    where: { submissionId: submission.id, reviewerAccessId: reviewer.id },
    orderBy: { createdAt: "asc" },
  });
  assert(evaluations.length === 1, "revising the same exact Evaluation should not create a second record");
  assert(evaluations[0].submissionRevisionId === v2Result.revision.id && evaluations[0].value === 0.7, "same-Revision Evaluation should update in place");

  const v3 = await appendCanonicalRevision({
    submissionId: submission.id,
    expectedRevisionId: v2Result.revision.id,
    commandKey: `revision-v3-${suffix}`,
    requireExpectedHead: true,
    snapshot: {
      title: "Third title",
      abstract: "A third sufficiently long verification abstract used to prove prior evaluations survive rescoring.",
      bio: "A sufficiently long third verification biography.",
      technicalLevel: 4,
      themeIds: [termB.id],
    },
    changedFields: ["title", "abstract", "themes"],
  });
  await recordCanonicalEvaluation({
    submissionId: submission.id,
    reviewerAccessId: reviewer.id,
    value: 0.9,
    notes: "v3 judgment",
  });

  evaluations = await prisma.score.findMany({
    where: { submissionId: submission.id, reviewerAccessId: reviewer.id },
    orderBy: { scoredAbstractVersion: "asc" },
  });
  assert(evaluations.length === 2, "later Revision evaluation must preserve the prior Evaluation");
  assert(evaluations[0].submissionRevisionId === v2Result.revision.id, "first Evaluation should remain bound to v2");
  assert(evaluations[1].submissionRevisionId === v3.revision.id, "second Evaluation should bind to v3");

  const current = await prisma.submission.findUniqueOrThrow({
    where: { id: submission.id },
    include: { themes: true, currentRevision: { include: { revisionTerms: true } } },
  });
  assert(current.currentRevisionId === v3.revision.id, "Submission currentRevisionId should point to v3");
  assert(current.abstractVersion === 3 && current.title === "Third title", "legacy current-content/version should be a canonical compatibility projection");
  assert(current.themes.length === 1 && current.themes[0].themeId === termB.id, "SubmissionTheme should mirror current exact Classification");
  assert(current.currentRevision?.revisionTerms.length === 1 && current.currentRevision.revisionTerms[0].themeId === termB.id, "v3 exact Classification should be complete");

  const feedback = await prisma.presenterFeedback.create({
    data: {
      submissionId: submission.id,
      reviewerAccessId: reviewer.id,
      kind: "ABSTRACT",
      body: "Exact revision feedback",
      abstractVersion: current.abstractVersion,
      submissionRevisionId: current.currentRevisionId,
    },
  });
  assert(feedback.submissionRevisionId === v3.revision.id, "ABSTRACT Feedback should retain exact Revision subject identity");

  console.log("004-B canonical Revision/Classification/Evaluation/Feedback verification passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
