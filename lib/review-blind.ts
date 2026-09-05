import type { ScoreVersionSummary } from "./revision-history";
import { viewerHasCurrentScore } from "./rescoring";
import type { SubmissionListItem } from "./submissions";
import { EMPTY_AGGREGATE } from "./scoring";
import {
  deliverableReadinessLabel,
  participationLabel,
  selectionLabel,
} from "./concept-design/semantic-reads";

export type PresenterIdentity = {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
};

export type ProtectedIdentityState =
  | { state: "visible"; value: PresenterIdentity }
  | { state: "concealed"; reason: "blind-review" };

export type ProtectedAggregateState =
  | {
      state: "visible";
      value: { count: number; sum: number; average: number };
    }
  | {
      state: "concealed";
      reason: "evaluation-required-for-current-revision";
    };

export type ReviewSubmissionItem = Omit<SubmissionListItem, "aggregate"> & {
  identityState: ProtectedIdentityState;
  aggregateState: ProtectedAggregateState;
  // Transitional aliases for components not yet consuming the discriminated states.
  identity: PresenterIdentity | null;
  aggregate: { count: number; sum: number; average: number } | null;
};

export type ChairProgramItem = SubmissionListItem & {
  abstract: string;
  email: string | null;
  deckShareable: boolean;
  vipRegistered: boolean;
  themeNames: string[];
  themeIds: string[];
  committeeScoresVisible: boolean;
  presenterSubtitle: string;
  revisionSummary: ScoreVersionSummary;
  semanticLabels: {
    selection: string;
    participation: string;
    deliverable: string;
  };
};

export function isBlindReviewEnabled(
  conference: { blindReviewEnabled: boolean } | null | undefined
): boolean {
  return conference?.blindReviewEnabled !== false;
}

export function maskReviewSubmissionItem(
  item: SubmissionListItem,
  blindEnabled: boolean
): ReviewSubmissionItem {
  const presenter: PresenterIdentity = {
    firstName: item.firstName,
    lastName: item.lastName,
    organization: item.organization,
    email: "",
  };
  const identityState: ProtectedIdentityState = blindEnabled
    ? { state: "concealed", reason: "blind-review" }
    : { state: "visible", value: presenter };
  const aggregateState: ProtectedAggregateState =
    !blindEnabled || viewerHasCurrentScore(item)
      ? { state: "visible", value: item.aggregate }
      : {
          state: "concealed",
          reason: "evaluation-required-for-current-revision",
        };

  return {
    ...item,
    identityState,
    aggregateState,
    identity: identityState.state === "visible" ? identityState.value : null,
    aggregate: aggregateState.state === "visible" ? aggregateState.value : null,
  };
}

export function partitionChairProgramByOwnScore(items: SubmissionListItem[]): {
  needsMyScore: SubmissionListItem[];
  scoredByMe: SubmissionListItem[];
} {
  const needsMyScore: SubmissionListItem[] = [];
  const scoredByMe: SubmissionListItem[] = [];
  for (const item of items) {
    if (viewerHasCurrentScore(item)) scoredByMe.push(item);
    else needsMyScore.push(item);
  }
  const byNewest = (a: SubmissionListItem, b: SubmissionListItem) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  needsMyScore.sort(byNewest);
  scoredByMe.sort((a, b) => {
    const aggregateA = a.aggregate ?? EMPTY_AGGREGATE;
    const aggregateB = b.aggregate ?? EMPTY_AGGREGATE;
    if (aggregateB.average !== aggregateA.average) {
      return aggregateB.average - aggregateA.average;
    }
    if (aggregateB.sum !== aggregateA.sum) return aggregateB.sum - aggregateA.sum;
    return a.title.localeCompare(b.title);
  });
  return { needsMyScore, scoredByMe };
}

export function buildChairProgramItem(
  item: SubmissionListItem,
  full: {
    abstract: string;
    email: string;
    firstName: string;
    lastName: string;
    organization: string;
    deckShareable: boolean;
    vipRegistered: boolean;
  },
  themeNames: string[],
  themeIds: string[],
  blindEnabled: boolean,
  revisionSummary: ScoreVersionSummary
): ChairProgramItem {
  const committeeScoresVisible = !blindEnabled || viewerHasCurrentScore(item);
  const presenterSubtitle = committeeScoresVisible
    ? `${full.firstName} ${full.lastName} · ${full.organization} · ${full.email}`
    : "Presenter contact concealed by blind-review policy.";

  return {
    ...item,
    abstract: full.abstract,
    email: committeeScoresVisible ? full.email : null,
    deckShareable: item.semantic.sharing.eligible,
    vipRegistered: full.vipRegistered,
    themeNames,
    themeIds,
    committeeScoresVisible,
    presenterSubtitle,
    revisionSummary,
    semanticLabels: {
      selection: selectionLabel(item.semantic.selection.disposition),
      participation: participationLabel(item.semantic.participation),
      deliverable: deliverableReadinessLabel(item.semantic.deliverable.readiness),
    },
  };
}

/** @deprecated 004-D replaced console-only reveal evidence with ControlledDisclosure. */
export function logIdentityReveal(
  reviewerAccessId: string,
  submissionId: string
): void {
  console.log(
    `[MinneAnalytics blind review compatibility] reveal request submission=${submissionId} reviewer=${reviewerAccessId}`
  );
}
