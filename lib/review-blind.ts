import type { ScoreVersionSummary } from "./revision-history";
import type { SubmissionListItem } from "./submissions";
import { EMPTY_AGGREGATE } from "./scoring";

export type PresenterIdentity = {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
};

export type ReviewSubmissionItem = Omit<SubmissionListItem, "aggregate"> & {
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
  if (!blindEnabled) {
    return {
      ...item,
      identity: {
        firstName: item.firstName,
        lastName: item.lastName,
        organization: item.organization,
        email: (item as SubmissionListItem & { email?: string }).email ?? "",
      },
      aggregate: item.aggregate,
    };
  }

  return {
    ...item,
    firstName: "",
    lastName: "",
    organization: "",
    identity: null,
    aggregate: item.myScore != null ? item.aggregate : null,
  };
}

export function partitionChairProgramByOwnScore(items: SubmissionListItem[]): {
  needsMyScore: SubmissionListItem[];
  scoredByMe: SubmissionListItem[];
} {
  const needsMyScore: SubmissionListItem[] = [];
  const scoredByMe: SubmissionListItem[] = [];
  for (const item of items) {
    if (item.myScore != null) scoredByMe.push(item);
    else needsMyScore.push(item);
  }
  const byNewest = (a: SubmissionListItem, b: SubmissionListItem) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  needsMyScore.sort(byNewest);
  scoredByMe.sort((a, b) => {
    const aggA = a.aggregate ?? EMPTY_AGGREGATE;
    const aggB = b.aggregate ?? EMPTY_AGGREGATE;
    if (aggB.average !== aggA.average) return aggB.average - aggA.average;
    if (aggB.sum !== aggA.sum) return aggB.sum - aggA.sum;
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
  const committeeScoresVisible = !blindEnabled || item.myScore != null;
  let presenterSubtitle: string;
  if (committeeScoresVisible) {
    presenterSubtitle = `${full.firstName} ${full.lastName} · ${full.organization} · ${full.email}`;
  } else if (blindEnabled) {
    presenterSubtitle =
      "Presenter contact hidden — score this talk on the review page to see committee scores and presenter email.";
  } else {
    presenterSubtitle = `${full.firstName} ${full.lastName} · ${full.organization} · ${full.email}`;
  }

  return {
    ...item,
    abstract: full.abstract,
    email: committeeScoresVisible ? full.email : null,
    deckShareable: full.deckShareable,
    vipRegistered: full.vipRegistered,
    themeNames,
    themeIds,
    committeeScoresVisible,
    presenterSubtitle,
    revisionSummary,
  };
}

export function logIdentityReveal(
  reviewerAccessId: string,
  submissionId: string
): void {
  console.log(
    `[MinneAnalytics blind review] Identity revealed submission=${submissionId} by reviewer=${reviewerAccessId}`
  );
}
