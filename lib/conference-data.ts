import { prisma } from "./db";
import { computeCapacity } from "./capacity";
import { toListItem, sortByAggregate, partitionReviewerQueue } from "./submissions";
import {
  getSemanticConferenceSubmissions,
  evaluationApplicabilityForReviewer,
} from "./concept-design/semantic-reads";

export async function getConferenceSubmissions(conferenceId: string) {
  return getSemanticConferenceSubmissions(conferenceId);
}

export async function getSortedListItems(
  conferenceId: string,
  reviewerAccessId?: string,
  excludeWithdrawn = true
) {
  const subs = await getConferenceSubmissions(conferenceId);
  const filtered = excludeWithdrawn
    ? subs.filter((submission) => !submission.semantic.withdrawal.withdrawn)
    : subs;
  return sortByAggregate(
    filtered.map((submission) => toListItem(submission, reviewerAccessId))
  );
}

export async function getReviewerQueue(
  conferenceId: string,
  reviewerAccessId: string
) {
  const subs = await getConferenceSubmissions(conferenceId);
  const active = subs.filter((submission) => !submission.semantic.withdrawal.withdrawn);
  const items = active.map((submission) => toListItem(submission, reviewerAccessId));
  return partitionReviewerQueue(items);
}

export async function getCapacityForConference(conferenceId: string) {
  const [conference, pool, subs] = await Promise.all([
    prisma.conference.findUniqueOrThrow({ where: { id: conferenceId } }),
    prisma.capacityPool.findUnique({
      where: { conferenceId_key: { conferenceId, key: "program-slots" } },
      include: { allocations: { where: { releasedAt: null } } },
    }),
    getConferenceSubmissions(conferenceId),
  ]);

  const configuredLimit =
    conference.rooms * conference.sessionsPerRoom - conference.eodTrim - conference.graemeSlots;
  if (pool && pool.limitUnits !== configuredLimit) {
    throw new Error(
      `Canonical Capacity pool ${pool.limitUnits} conflicts with configured program limit ${configuredLimit}`
    );
  }

  const effective = subs.filter((submission) => submission.semantic.participation.effective);
  const activeAllocations = pool?.allocations ?? [];
  if (pool) {
    const allocationIds = new Set(activeAllocations.map((allocation) => allocation.submissionId));
    const missing = effective.filter((submission) => !allocationIds.has(submission.id));
    if (missing.length > 0) {
      throw new Error(
        `Canonical Capacity ledger is missing ${missing.length} effective participation allocation(s)`
      );
    }
  }

  return computeCapacity(
    {
      rooms: conference.rooms,
      sessionsPerRoom: conference.sessionsPerRoom,
      eodTrim: conference.eodTrim,
      graemeSlots: conference.graemeSlots,
      sponsorMin: conference.sponsorMin,
      sponsorMax: conference.sponsorMax,
    },
    {
      approved: effective.filter((submission) => !submission.isSponsorSession).length,
      backup: subs.filter(
        (submission) => submission.semantic.selection.disposition === "RESERVE"
      ).length,
      pending: subs.filter(
        (submission) =>
          submission.semantic.selection.disposition === null &&
          !submission.semantic.withdrawal.withdrawn
      ).length,
      sponsorSessions: effective.filter((submission) => submission.isSponsorSession).length,
    }
  );
}

export async function getReviewerEvaluationApplicability(
  conferenceId: string,
  reviewerAccessId: string
) {
  const submissions = await getConferenceSubmissions(conferenceId);
  return Object.fromEntries(
    submissions.map((submission) => [
      submission.id,
      evaluationApplicabilityForReviewer(submission, reviewerAccessId),
    ])
  );
}
