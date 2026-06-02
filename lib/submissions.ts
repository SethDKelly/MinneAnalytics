import type { DeckStatus, ProgramStatus, Score, Submission } from "@prisma/client";
import {
  aggregateCurrentVersion,
  partitionReviewerQueue as partitionReviewerQueueRescoring,
  type MyScore,
} from "./rescoring";
import { EMPTY_AGGREGATE } from "./scoring";
import { parseDegreesJson } from "./degrees";

export type { MyScore };
export { partitionReviewerQueueRescoring as partitionReviewerQueue };

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
  myScore: MyScore | null;
  abstractVersion: number;
  abstractReviewStatus: string;
  isSponsorSession: boolean;
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
    aggregate: aggregateCurrentVersion(sub.scores ?? [], sub.abstractVersion),
    myScore: my
      ? {
          value: my.value,
          notes: my.notes,
          scoredAbstractVersion: my.scoredAbstractVersion,
        }
      : null,
    abstractVersion: sub.abstractVersion,
    abstractReviewStatus: sub.abstractReviewStatus,
    isSponsorSession: sub.isSponsorSession,
    createdAt: sub.createdAt.toISOString(),
  };
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
