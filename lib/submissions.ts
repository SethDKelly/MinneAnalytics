import type { DeckStatus, ProgramStatus } from "@prisma/client";
import {
  evaluationApplicabilityForReviewer,
  type EvaluationApplicability,
  type SemanticConferenceSubmission,
  type SemanticSubmissionState,
} from "./concept-design/semantic-reads";
import { partitionReviewerQueue as partitionReviewerQueueRescoring } from "./rescoring";
import { EMPTY_AGGREGATE } from "./scoring";
import { parseDegreesJson } from "./degrees";

export type MyScore = {
  evaluationRef: string | null;
  value: number;
  notes: string | null;
  submissionRevisionId: string | null;
  scoredAbstractVersion: number | null;
};

export { partitionReviewerQueueRescoring as partitionReviewerQueue };

export type SubmissionWithScores = SemanticConferenceSubmission;

export type SubmissionListItem = {
  id: string;
  title: string;
  abstract?: string;
  firstName: string;
  lastName: string;
  organization: string;
  technicalLevel: number;
  degrees: string[];
  aggregate: { count: number; sum: number; average: number };
  myScore: MyScore | null;
  myEvaluationState: EvaluationApplicability;
  semantic: SemanticSubmissionState;
  compatibility: {
    programStatus: ProgramStatus;
    deckStatus: DeckStatus | null;
    abstractReviewStatus: string;
  };
  // Transitional display aliases. These are canonical-derived projections, not read authority.
  programStatus: ProgramStatus;
  deckStatus: DeckStatus | null;
  abstractVersion: number;
  abstractReviewStatus: string;
  isSponsorSession: boolean;
  createdAt: string;
};

export function toListItem(
  submission: SubmissionWithScores,
  reviewerAccessId?: string
): SubmissionListItem {
  const applicability = reviewerAccessId
    ? evaluationApplicabilityForReviewer(submission, reviewerAccessId)
    : {
        state: "never-evaluated" as const,
        evaluationRef: null,
        subjectRevisionRef: null,
        value: null,
        notes: null,
      };
  const exactScore = applicability.evaluationRef
    ? submission.scores.find((score) => score.id === applicability.evaluationRef)
    : undefined;
  const compatibility = {
    programStatus: submission.programStatus,
    deckStatus: submission.deckStatus,
    abstractReviewStatus: submission.abstractReviewStatus,
  };

  return {
    id: submission.id,
    title: submission.title,
    abstract: submission.abstract,
    firstName: submission.firstName,
    lastName: submission.lastName,
    organization: submission.organization,
    technicalLevel: submission.technicalLevel,
    programStatus: compatibility.programStatus,
    deckStatus: compatibility.deckStatus,
    degrees: parseDegreesJson(submission.degrees),
    aggregate: submission.semantic.evaluation.aggregate ?? EMPTY_AGGREGATE,
    myScore:
      applicability.value != null
        ? {
            evaluationRef: applicability.evaluationRef,
            value: applicability.value,
            notes: applicability.notes,
            submissionRevisionId: applicability.subjectRevisionRef,
            scoredAbstractVersion: exactScore?.scoredAbstractVersion ?? null,
          }
        : null,
    myEvaluationState: applicability.state,
    semantic: submission.semantic,
    compatibility,
    abstractVersion: submission.semantic.revision.ordinal,
    abstractReviewStatus: compatibility.abstractReviewStatus,
    isSponsorSession: submission.isSponsorSession,
    createdAt: submission.createdAt.toISOString(),
  };
}

export function sortByAggregate(
  items: SubmissionListItem[]
): SubmissionListItem[] {
  return [...items].sort((a, b) => {
    const aggregateA = a.aggregate ?? EMPTY_AGGREGATE;
    const aggregateB = b.aggregate ?? EMPTY_AGGREGATE;
    if (aggregateB.average !== aggregateA.average) {
      return aggregateB.average - aggregateA.average;
    }
    if (aggregateB.sum !== aggregateA.sum) {
      return aggregateB.sum - aggregateA.sum;
    }
    return a.title.localeCompare(b.title);
  });
}
