import { notFound } from "next/navigation";
import { ChairDashboard } from "@/components/ChairDashboard";
import { getCapacityForConference, getConferenceSubmissions } from "@/lib/conference-data";
import {
  getArchivedConferences,
  themeNamesForSubmission,
} from "@/lib/conference-queries";
import { formatThemeDisplayName, getConferenceThemesForAdmin } from "@/lib/themes";
import { getDeckQueue } from "@/lib/decks";
import { computeTechnicalityBalance } from "@/lib/program-balance";
import {
  canAccessCommitteeDashboard,
  canViewHistoricalCommittee,
  committeeDashboardTitle,
  getReviewerByToken,
  roleDisplayName,
} from "@/lib/reviewer";
import { computeThemeStats } from "@/lib/theme-stats";
import { sortByAggregate, toListItem } from "@/lib/submissions";
import { prisma } from "@/lib/db";

export default async function ChairPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ archive?: string }>;
}) {
  const { token } = await params;
  const { archive: archiveSlug } = await searchParams;

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canAccessCommitteeDashboard(reviewer.role)) {
    notFound();
  }

  let viewConferenceId = reviewer.conferenceId;
  let viewConferenceName = reviewer.conference.name;
  let readOnly = reviewer.conference.status !== "ACTIVE";

  if (archiveSlug && canViewHistoricalCommittee(reviewer.role)) {
    const archived = await prisma.conference.findFirst({
      where: { slug: archiveSlug, status: "ARCHIVED" },
    });
    if (archived) {
      viewConferenceId = archived.id;
      viewConferenceName = archived.name;
      readOnly = true;
    }
  } else if (reviewer.conference.status !== "ACTIVE") {
    readOnly = true;
  }

  const [subs, capacity, deckQueue, themes, archivedList] = await Promise.all([
    getConferenceSubmissions(viewConferenceId),
    getCapacityForConference(viewConferenceId),
    getDeckQueue(viewConferenceId),
    getConferenceThemesForAdmin(viewConferenceId),
    canViewHistoricalCommittee(reviewer.role)
      ? getArchivedConferences()
      : Promise.resolve([]),
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
      themeNames: themeNamesForSubmission(full.themes),
      themeIds: full.themes.map((t) => t.themeId),
    };
  });

  const themeStats = computeThemeStats(
    themes,
    subs.map((s) => ({
      programStatus: s.programStatus,
      themes: s.themes.map((t) => ({ themeId: t.themeId })),
    }))
  );

  const approved = subs.filter((s) => s.programStatus === "APPROVED");
  const technicalityRows = computeTechnicalityBalance(approved);

  const accessList = await prisma.reviewerAccess.findMany({
    where: { conferenceId: viewConferenceId },
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

  const conf = await prisma.conference.findUniqueOrThrow({
    where: { id: reviewer.conferenceId },
  });

  return (
    <ChairDashboard
      token={token}
      role={reviewer.role}
      label={reviewer.label ?? roleDisplayName(reviewer.role)}
      dashboardTitle={
        readOnly && archiveSlug
          ? `Historical review — ${viewConferenceName}`
          : committeeDashboardTitle(reviewer.role)
      }
      items={items}
      capacity={capacity}
      allScores={allScores}
      deckQueue={deckQueue}
      conferenceSlug={conf.slug}
      conferenceName={viewConferenceName}
      conferenceStatus={reviewer.conference.status}
      decksPublished={conf.decksPublished}
      decksPublishedAt={conf.decksPublishedAt?.toISOString() ?? null}
      themeStats={themeStats}
      technicalityRows={technicalityRows}
      approvedCount={approved.length}
      readOnly={readOnly}
      archivedConferences={archivedList.map((c) => ({
        slug: c.slug,
        name: c.name,
        submissionCount: c._count.submissions,
      }))}
      viewingArchiveSlug={archiveSlug ?? null}
      themes={themes.map((t) => ({ id: t.id, name: formatThemeDisplayName(t) }))}
    />
  );
}
