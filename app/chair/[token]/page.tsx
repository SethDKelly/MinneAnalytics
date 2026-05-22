import { notFound } from "next/navigation";
import { ChairDashboard } from "@/components/ChairDashboard";
import { getCapacityForConference, getConferenceSubmissions } from "@/lib/conference-data";
import { getDeckQueue } from "@/lib/decks";
import {
  canAccessCommitteeDashboard,
  committeeDashboardTitle,
  getReviewerByToken,
  roleDisplayName,
} from "@/lib/reviewer";
import { sortByAggregate, toListItem } from "@/lib/submissions";
import { prisma } from "@/lib/db";

export default async function ChairPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canAccessCommitteeDashboard(reviewer.role)) {
    notFound();
  }

  const [subs, capacity, deckQueue, conference] = await Promise.all([
    getConferenceSubmissions(reviewer.conferenceId),
    getCapacityForConference(reviewer.conferenceId),
    getDeckQueue(reviewer.conferenceId),
    prisma.conference.findUniqueOrThrow({
      where: { id: reviewer.conferenceId },
      select: {
        slug: true,
        name: true,
        decksPublished: true,
        decksPublishedAt: true,
      },
    }),
  ]);

  const active = subs.filter((s) => s.programStatus !== "WITHDRAWN");
  const items = sortByAggregate(active.map((s) => toListItem(s))).map((item) => {
    const full = subs.find((s) => s.id === item.id)!;
    return {
      ...item,
      abstract: full.abstract,
      email: full.email,
      deckShareable: full.deckShareable,
      vipRegistered: full.vipRegistered,
    };
  });

  const accessList = await prisma.reviewerAccess.findMany({
    where: { conferenceId: reviewer.conferenceId },
    select: { id: true, label: true, role: true },
  });
  const labelById = Object.fromEntries(
    accessList.map((a) => [a.id, a.label ?? a.role])
  );

  const allScores: Record<
    string,
    { reviewer: string; value: number; notes: string | null }[]
  > = {};
  for (const sub of subs) {
    allScores[sub.id] = sub.scores.map((sc) => ({
      reviewer: labelById[sc.reviewerAccessId] ?? "Reviewer",
      value: sc.value,
      notes: sc.notes,
    }));
  }

  return (
    <ChairDashboard
      token={token}
      role={reviewer.role}
      label={reviewer.label ?? roleDisplayName(reviewer.role)}
      dashboardTitle={committeeDashboardTitle(reviewer.role)}
      items={items}
      capacity={capacity}
      allScores={allScores}
      deckQueue={deckQueue}
      conferenceSlug={conference.slug}
      conferenceName={conference.name}
      decksPublished={conference.decksPublished}
      decksPublishedAt={conference.decksPublishedAt?.toISOString() ?? null}
    />
  );
}
