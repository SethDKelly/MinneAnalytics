import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { getArchivedConferences } from "@/lib/conference-queries";
import { getConferenceThemesForAdmin } from "@/lib/themes";
import { canAccessAdmin, getReviewerByToken } from "@/lib/reviewer";
import { getProposalOfferAvailability } from "@/lib/submission-window";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canAccessAdmin(reviewer.role)) notFound();

  const [themes, archivedConferences, availability] = await Promise.all([
    getConferenceThemesForAdmin(reviewer.conferenceId),
    getArchivedConferences(),
    getProposalOfferAvailability(reviewer.conferenceId),
  ]);
  if (!availability) notFound();
  const canonicalWindow = availability.window;
  const archive = availability.conference.archiveRecord;

  return (
    <AdminDashboard
      token={token}
      label={reviewer.label ?? "Site administrator"}
      conference={{
        id: reviewer.conference.id,
        slug: reviewer.conference.slug,
        name: reviewer.conference.name,
        status: archive ? "ARCHIVED" : reviewer.conference.status,
        submissionsOpen: reviewer.conference.submissionsOpen,
        submissionsOpenAt: canonicalWindow?.opensAt.toISOString() ?? null,
        submissionsCloseAt: canonicalWindow?.closesAt.toISOString() ?? null,
        timezone: reviewer.conference.timezone,
        archivedAt: archive?.archivedAt?.toISOString() ?? null,
        blindReviewEnabled: reviewer.conference.blindReviewEnabled,
      }}
      submissionWindowMessage={availability.state.open ? "" : availability.state.message}
      themes={themes.map((theme) => ({
        id: theme.id,
        name: theme.name,
        slug: theme.slug,
        source: theme.source,
        targetMin: theme.targetMin,
        targetMax: theme.targetMax,
        removedAt: theme.removedAt?.toISOString() ?? null,
        usageCount: theme._count.submissions,
      }))}
      archivedConferences={archivedConferences.map((conference) => ({
        id: conference.id,
        slug: conference.slug,
        name: conference.name,
        archivedAt: conference.archiveRecord?.archivedAt?.toISOString() ?? null,
        submissionCount: conference._count.submissions,
      }))}
    />
  );
}
