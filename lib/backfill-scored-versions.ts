import { prisma } from "@/lib/db";

/** Set scoredAbstractVersion from submission.abstractVersion when missing (idempotent). */
export async function backfillScoredAbstractVersions() {
  const scores = await prisma.score.findMany({
    where: { scoredAbstractVersion: null },
    include: { submission: { select: { abstractVersion: true } } },
  });
  for (const score of scores) {
    await prisma.score.update({
      where: { id: score.id },
      data: { scoredAbstractVersion: score.submission.abstractVersion },
    });
  }
}
