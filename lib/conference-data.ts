import { prisma } from "./db";
import { computeCapacity } from "./capacity";
import { toListItem, sortByAggregate, partitionReviewerQueue } from "./submissions";

export async function getConferenceSubmissions(conferenceId: string) {
  const submissions = await prisma.submission.findMany({
    where: { conferenceId },
    include: {
      scores: true,
      revisions: { orderBy: { version: "desc" }, take: 1 },
      themes: {
        select: { themeId: true, theme: { select: { name: true, removedAt: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return submissions;
}

export async function getSortedListItems(
  conferenceId: string,
  reviewerAccessId?: string,
  excludeWithdrawn = true
) {
  const subs = await getConferenceSubmissions(conferenceId);
  const filtered = excludeWithdrawn
    ? subs.filter((s) => s.programStatus !== "WITHDRAWN")
    : subs;
  return sortByAggregate(
    filtered.map((s) => toListItem(s, reviewerAccessId))
  );
}

export async function getReviewerQueue(
  conferenceId: string,
  reviewerAccessId: string
) {
  const subs = await getConferenceSubmissions(conferenceId);
  const filtered = subs.filter((s) => s.programStatus !== "WITHDRAWN");
  const items = filtered.map((s) => toListItem(s, reviewerAccessId));
  return partitionReviewerQueue(items);
}

export async function getCapacityForConference(conferenceId: string) {
  const conference = await prisma.conference.findUniqueOrThrow({
    where: { id: conferenceId },
  });
  const subs = await prisma.submission.findMany({
    where: { conferenceId },
    select: { programStatus: true, isSponsorSession: true },
  });
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
      approved: subs.filter(
        (s) => s.programStatus === "APPROVED" && !s.isSponsorSession
      ).length,
      backup: subs.filter((s) => s.programStatus === "BACKUP").length,
      pending: subs.filter((s) => s.programStatus === "PENDING").length,
      sponsorSessions: subs.filter((s) => s.isSponsorSession).length,
    }
  );
}
