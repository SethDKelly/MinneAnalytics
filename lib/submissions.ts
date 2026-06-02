import type { DeckStatus, ProgramStatus, Score, Submission } from "@prisma/client";
import { aggregateScores, EMPTY_AGGREGATE } from "./scoring";
import { parseDegreesJson } from "./degrees";

export type SubmissionWithScores = Submission & { scores: Score[] };

export type SubmissionListItem = {
  id: string;
  title: string;
  abstract?: string;
  firstName: string;
  lastName: string;
  organization: string;
  technicalLevel: number;
  programStatus: ProgramStatus;
  deckStatus: DeckStatus | null;
  degrees: string[];
  aggregate: { count: number; sum: number; average: number };
  myScore: { value: number; notes: string | null } | null;
  abstractVersion: number;
  abstractReviewStatus: string;
  createdAt: string;
};

export function toListItem(
  sub: SubmissionWithScores,
  reviewerAccessId?: string
): SubmissionListItem {
  const my = reviewerAccessId
    ? sub.scores.find((s) => s.reviewerAccessId === reviewerAccessId)
    : undefined;
  return {
    id: sub.id,
    title: sub.title,
    abstract: sub.abstract,
    firstName: sub.firstName,
    lastName: sub.lastName,
    organization: sub.organization,
    technicalLevel: sub.technicalLevel,
    programStatus: sub.programStatus,
    deckStatus: sub.deckStatus,
    degrees: parseDegreesJson(sub.degrees),
    aggregate: aggregateScores((sub.scores ?? []).map((s) => s.value)),
    myScore: my ? { value: my.value, notes: my.notes } : null,
    abstractVersion: sub.abstractVersion,
    abstractReviewStatus: sub.abstractReviewStatus,
    createdAt: sub.createdAt.toISOString(),
  };
}

function bySubmittedNewestFirst(a: SubmissionListItem, b: SubmissionListItem): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

/** Review queue: unscored first (newest submissions on top), then your scored talks. */
export function partitionReviewerQueue(items: SubmissionListItem[]): {
  needsScore: SubmissionListItem[];
  scored: SubmissionListItem[];
} {
  const needsScore: SubmissionListItem[] = [];
  const scored: SubmissionListItem[] = [];
  for (const item of items) {
    if (item.myScore != null) scored.push(item);
    else needsScore.push(item);
  }
  needsScore.sort(bySubmittedNewestFirst);
  scored.sort(bySubmittedNewestFirst);
  return { needsScore, scored };
}

export function sortByAggregate(
  items: SubmissionListItem[]
): SubmissionListItem[] {
  return [...items].sort((a, b) => {
    const aggA = a.aggregate ?? EMPTY_AGGREGATE;
    const aggB = b.aggregate ?? EMPTY_AGGREGATE;
    if (aggB.average !== aggA.average) {
      return aggB.average - aggA.average;
    }
    if (aggB.sum !== aggA.sum) {
      return aggB.sum - aggA.sum;
    }
    return a.title.localeCompare(b.title);
  });
}
