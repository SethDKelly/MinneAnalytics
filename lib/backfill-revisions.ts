import { prisma } from "@/lib/db";
import { revisionSnapshotFromSubmission, themeIdsFromJoin } from "@/lib/submission-revision";

/** Ensure every submission has abstract v1 revision row (idempotent). */
export async function backfillSubmissionRevisionsV1() {
  const submissions = await prisma.submission.findMany({
    include: { themes: true, revisions: { where: { version: 1 }, take: 1 } },
  });

  for (const sub of submissions) {
    if (sub.revisions.length > 0) continue;
    const themeIds = themeIdsFromJoin(sub.themes);
    await prisma.submissionRevision.create({
      data: {
        submissionId: sub.id,
        version: 1,
        ...revisionSnapshotFromSubmission(sub, themeIds),
      },
    });
    if (sub.abstractVersion < 1) {
      await prisma.submission.update({
        where: { id: sub.id },
        data: { abstractVersion: 1, abstractReviewStatus: "CURRENT" },
      });
    }
  }
}
