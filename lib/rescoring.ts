import type { Score } from "@prisma/client";
import { aggregateScores } from "./scoring";
import type { SubmissionListItem } from "./submissions";

export type MyScore = {
  value: number;
  notes: string | null;
  scoredAbstractVersion: number | null;
  submissionRevisionId?: string | null;
};

/**
 * Legacy ordinal helper retained for migration/backfill evidence only.
 * First-party reviewer queue logic uses exact RevisionRef applicability below.
 */
export function isScoreAtCurrentVersion(
  scoredAbstractVersion: number | null | undefined,
  abstractVersion: number
): boolean {
  return scoredAbstractVersion === abstractVersion;
}

export function scoreNeedsRescore(
  myScore: MyScore | null | undefined,
  abstractVersion: number,
  currentRevisionId?: string | null
): boolean {
  if (!myScore) return false;
  if (currentRevisionId && myScore.submissionRevisionId) {
    return myScore.submissionRevisionId !== currentRevisionId;
  }
  return !isScoreAtCurrentVersion(myScore.scoredAbstractVersion, abstractVersion);
}

export function viewerHasCurrentScore(item: {
  myScore: { submissionRevisionId?: string | null; scoredAbstractVersion: number | null } | null;
  abstractVersion: number;
  myEvaluationState?: string;
  semantic?: { revision: { currentRevisionRef: string | null } };
}): boolean {
  if (item.myEvaluationState) return item.myEvaluationState === "current-revision";
  const currentRevisionRef = item.semantic?.revision.currentRevisionRef ?? null;
  if (currentRevisionRef && item.myScore?.submissionRevisionId) {
    return item.myScore.submissionRevisionId === currentRevisionRef;
  }
  return (
    item.myScore != null &&
    isScoreAtCurrentVersion(item.myScore.scoredAbstractVersion, item.abstractVersion)
  );
}

export function scoresAtCurrentVersion(
  scores: Pick<Score, "value" | "scoredAbstractVersion">[],
  abstractVersion: number
): number[] {
  return scores
    .filter((score) => isScoreAtCurrentVersion(score.scoredAbstractVersion, abstractVersion))
    .map((score) => score.value);
}

export function countScoresAtCurrentVersion(
  scores: Pick<Score, "scoredAbstractVersion">[],
  abstractVersion: number
): number {
  return scores.filter((score) =>
    isScoreAtCurrentVersion(score.scoredAbstractVersion, abstractVersion)
  ).length;
}

export function countStaleScoresByVersion(
  scores: Pick<Score, "scoredAbstractVersion">[],
  abstractVersion: number
): number {
  return scores.filter(
    (score) => !isScoreAtCurrentVersion(score.scoredAbstractVersion, abstractVersion)
  ).length;
}

export function aggregateCurrentVersion(
  scores: Pick<Score, "value" | "scoredAbstractVersion">[],
  abstractVersion: number
) {
  return aggregateScores(scoresAtCurrentVersion(scores, abstractVersion));
}

function bySubmittedNewestFirst(a: SubmissionListItem, b: SubmissionListItem): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

/**
 * Semantic review queue: exact Evaluation subject versus exact current Revision.
 * Legacy subject-unknown Evaluations are surfaced as rescore work rather than silently
 * treated as current merely because an integer ordinal happens to match.
 */
export function partitionReviewerQueue(items: SubmissionListItem[]): {
  needsScore: SubmissionListItem[];
  needsRescore: SubmissionListItem[];
  scored: SubmissionListItem[];
} {
  const needsScore: SubmissionListItem[] = [];
  const needsRescore: SubmissionListItem[] = [];
  const scored: SubmissionListItem[] = [];

  for (const item of items) {
    if (item.myEvaluationState === "never-evaluated") {
      needsScore.push(item);
    } else if (item.myEvaluationState === "current-revision") {
      scored.push(item);
    } else {
      needsRescore.push(item);
    }
  }
  needsScore.sort(bySubmittedNewestFirst);
  needsRescore.sort(bySubmittedNewestFirst);
  scored.sort(bySubmittedNewestFirst);
  return { needsScore, needsRescore, scored };
}
