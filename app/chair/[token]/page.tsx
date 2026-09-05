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
  computeScoreVersionSummary,
  parseChangedFields,
} from "@/lib/revision-history";
import {
  canAccessCommitteeDashboard,
  canScore,
  canViewHistoricalCommittee,
  committeeDashboardTitle,
  getReviewerByToken,
  roleDisplayName,
} from "@/lib/reviewer";
import {
  computeTechnicalityThemeHeatmap,
  computeThemeStatusHeatmap,
} from "@/lib/chair-heatmaps";
import { computeThemeStats } from "@/lib/theme-stats";
import { sortByAggregate, toListItem } from "@/lib/submissions";
import {
  buildChairProgramItem,
  isBlindReviewEnabled,
  partitionChairProgramByOwnScore,
} from "@/lib/review-blind";
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
  if (!reviewer || !canAccessCommitteeDashboard(reviewer.role)) notFound();

  let viewConferenceId = reviewer.conferenceId;
  let viewConferenceName = reviewer.conference.name;
  let readOnly =
    Boolean(reviewer.conference.archiveRecord) || reviewer.conference.status !== "ACTIVE";

  if (archiveSlug && canViewHistoricalCommittee(reviewer.role)) {
    const archived = await prisma.conference.findFirst({
      where: { slug: archiveSlug, archiveRecord: { isNot: null } },
    });
    if (archived) {
      viewConferenceId = archived.id;
      viewConferenceName = archived.name;
      readOnly = true;
    }
  }

  const [submissions, capacity, deckQueue, themes, archivedList, viewConference] =
    await Promise.all([
      getConferenceSubmissions(viewConferenceId),
      getCapacityForConference(viewConferenceId),
      getDeckQueue(viewConferenceId),
      getConferenceThemesForAdmin(viewConferenceId),
      canViewHistoricalCommittee(reviewer.role)
        ? getArchivedConferences()
        : Promise.resolve([]),
      prisma.conference.findUniqueOrThrow({ where: { id: viewConferenceId } }),
    ]);
  const blindReviewEnabled = isBlindReviewEnabled(viewConference);

  const accessList = await prisma.reviewerAccess.findMany({
    where: { conferenceId: viewConferenceId },
    select: { id: true, label: true, role: true },
  });
  const committeeSize = accessList.filter((access) => canScore(access.role)).length;
  const active = submissions.filter((submission) => !submission.semantic.withdrawal.withdrawn);
  const listItems = active.map((submission) => toListItem(submission, reviewer.id));

  const buildItem = (item: (typeof listItems)[0]) => {
    const full = submissions.find((submission) => submission.id === item.id)!;
    const latestRevision = full.revisions[0];
    const revisionSummary = computeScoreVersionSummary(
      full,
      full.evaluationHistory,
      committeeSize,
      latestRevision ? parseChangedFields(latestRevision.changedFields) : []
    );
    return buildChairProgramItem(
      item,
      full,
      themeNamesForSubmission(full.themes),
      full.themes.map((theme) => theme.themeId),
      blindReviewEnabled,
      revisionSummary
    );
  };

  let programNeedsScore: ReturnType<typeof buildItem>[] = [];
  let programScoredByMe: ReturnType<typeof buildItem>[] = [];
  if (blindReviewEnabled) {
    const { needsMyScore, scoredByMe } = partitionChairProgramByOwnScore(listItems);
    programNeedsScore = needsMyScore.map(buildItem);
    programScoredByMe = scoredByMe.map(buildItem);
  } else {
    programScoredByMe = sortByAggregate(listItems).map(buildItem);
  }

  const themeStats = computeThemeStats(
    themes,
    submissions.map((submission) => ({
      programStatus: submission.programStatus,
      themes: submission.themes.map((theme) => ({ themeId: theme.themeId })),
    }))
  );
  const participating = submissions.filter(
    (submission) => submission.semantic.participation.effective
  );
  const technicalityRows = computeTechnicalityBalance(participating);
  const heatmapSubmissions = active.map((submission) => ({
    programStatus: submission.programStatus,
    technicalLevel: submission.technicalLevel,
    themes: submission.themes.map((theme) => ({ themeId: theme.themeId })),
  }));
  const themeStatusHeatmap = computeThemeStatusHeatmap(themes, heatmapSubmissions);
  const technicalityThemeHeatmap = computeTechnicalityThemeHeatmap(
    themes,
    heatmapSubmissions.filter((submission) => submission.programStatus === "APPROVED")
  );

  const labelById = Object.fromEntries(
    accessList.map((access) => [access.id, access.label ?? access.role])
  );
  const allScores: Record<
    string,
    { reviewer: string; value: number; notes: string | null }[]
  > = {};
  for (const submission of submissions) {
    allScores[submission.id] = submission.scores.map((score) => ({
      reviewer: labelById[score.reviewerAccessId] ?? "Reviewer",
      value: score.value,
      notes: score.notes,
    }));
  }

  const ownConference = await prisma.conference.findUniqueOrThrow({
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
      programNeedsScore={programNeedsScore}
      programScoredByMe={programScoredByMe}
      blindReviewEnabled={blindReviewEnabled}
      capacity={capacity}
      allScores={allScores}
      deckQueue={deckQueue}
      conferenceSlug={ownConference.slug}
      conferenceName={viewConferenceName}
      conferenceStatus={reviewer.conference.status}
      decksPublished={ownConference.decksPublished}
      decksPublishedAt={ownConference.decksPublishedAt?.toISOString() ?? null}
      themeStats={themeStats}
      themeStatusHeatmap={themeStatusHeatmap}
      technicalityThemeHeatmap={technicalityThemeHeatmap}
      technicalityRows={technicalityRows}
      approvedCount={participating.length}
      readOnly={readOnly}
      archivedConferences={archivedList.map((conference) => ({
        slug: conference.slug,
        name: conference.name,
        submissionCount: conference._count.submissions,
      }))}
      viewingArchiveSlug={archiveSlug ?? null}
      themes={themes.map((theme) => ({
        id: theme.id,
        name: formatThemeDisplayName(theme),
      }))}
    />
  );
}
