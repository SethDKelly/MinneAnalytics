import type { ProgramStatus } from "@prisma/client";
import { isImplementationGateEnabled } from "./concept-design/implementation-gates";
import { recordCanonicalEvaluation } from "./concept-design/revision-evaluation";
import { prisma } from "./db";
import { roundScore, SCORE_STEP } from "./scoring-scale";

/** Random committee score on 0.1 steps within [min, max]. */
export function randomDemoScore(min: number, max: number): number {
  const steps = Math.round((max - min) / SCORE_STEP);
  const idx = Math.floor(Math.random() * (steps + 1));
  return roundScore(min + idx * SCORE_STEP);
}

export function demoScoreRange(
  programStatus: ProgramStatus
): { min: number; max: number } | null {
  if (programStatus === "APPROVED") return { min: 0.8, max: 1.0 };
  if (programStatus === "DECLINED") return { min: 0.0, max: 0.3 };
  return null;
}

/** Seed scores from every reviewer so chair/review demos show consistent aggregates. */
export async function autoPopulateDemoScores(
  submissionId: string,
  conferenceId: string,
  programStatus: ProgramStatus
): Promise<void> {
  const range = demoScoreRange(programStatus);
  if (!range) return;

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    select: { abstractVersion: true },
  });

  const reviewers = await prisma.reviewerAccess.findMany({
    where: { conferenceId },
    select: { id: true },
  });

  const canonicalWrites = isImplementationGateEnabled("revisionEvaluationWrites");
  for (const { id: reviewerAccessId } of reviewers) {
    const value = randomDemoScore(range.min, range.max);
    if (canonicalWrites) {
      await recordCanonicalEvaluation({
        submissionId,
        reviewerAccessId,
        value,
      });
      continue;
    }

    const existing = await prisma.score.findFirst({
      where: { submissionId, reviewerAccessId },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) {
      await prisma.score.update({
        where: { id: existing.id },
        data: { value, scoredAbstractVersion: submission.abstractVersion },
      });
    } else {
      await prisma.score.create({
        data: {
          submissionId,
          reviewerAccessId,
          value,
          scoredAbstractVersion: submission.abstractVersion,
        },
      });
    }
  }
}
