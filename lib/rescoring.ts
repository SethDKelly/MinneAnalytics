import type { Score } from "@prisma/client";
import { aggregateScores } from "./scoring";
import type { SubmissionListItem } from "./submissions";

export type MyScore = {
  value: number;
  notes: string | null;
  scoredAbstractVersion: number | null;
};

export function isScoreAtCurrentVersion(
  scoredAbstractVersion: number | null | undefined,
  abstractVersion: number
): boolean {
  return scoredAbstractVersion === abstractVersion;
}

export function scoreNeedsRescore(
  myScore: MyScore | null | undefined,
  abstractVersion: number
): boolean {
  if (!myScore) return false;
  return !isScoreAtCurrentVersion(myScore.scoredAbstractVersion, abstractVersion);
}

export function viewerHasCurrentScore(item: {
  myScore: MyScore | null;
  abstractVersion: number;
}): boolean {
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
    .filter((s) => isScoreAtCurrentVersion(s.scoredAbstractVersion, abstractVersion))
    .map((s) => s.value);
}

export function countScoresAtCurrentVersion(
  scores: Pick<Score, "scoredAbstractVersion">[],
  abstractVersion: number
): number {
  return scores.filter((s) =>
    isScoreAtCurrentVersion(s.scoredAbstractVersion, abstractVersion)
  ).length;
}

export function countStaleScoresByVersion(
  scores: Pick<Score, "scoredAbstractVersion">[],
  abstractVersion: number
): number {
  return scores.filter(
    (s) => !isScoreAtCurrentVersion(s.scoredAbstractVersion, abstractVersion)
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

/** Review queue: never scored, outdated score, then current score. */
export function partitionReviewerQueue(items: SubmissionListItem[]): {
  needsScore: SubmissionListItem[];
  needsRescore: SubmissionListItem[];
  scored: SubmissionListItem[];
} {
  const needsScore: SubmissionListItem[] = [];
  const needsRescore: SubmissionListItem[] = [];
  const scored: SubmissionListItem[] = [];
  for (const item of items) {
    if (!item.myScore) {
      needsScore.push(item);
    } else if (scoreNeedsRescore(item.myScore, item.abstractVersion)) {
      needsRescore.push(item);
    } else {
      scored.push(item);
    }
  }
  needsScore.sort(bySubmittedNewestFirst);
  needsRescore.sort(bySubmittedNewestFirst);
  scored.sort(bySubmittedNewestFirst);
  return { needsScore, needsRescore, scored };
}
