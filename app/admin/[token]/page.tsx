import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { getArchivedConferences } from "@/lib/conference-queries";
import { getConferenceThemesForAdmin } from "@/lib/themes";
import { canAccessAdmin, getReviewerByToken } from "@/lib/reviewer";
import { getSubmissionWindowState } from "@/lib/submission-window";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canAccessAdmin(reviewer.role)) {
    notFound();
  }

  const [themes, archivedConferences] = await Promise.all([
    getConferenceThemesForAdmin(reviewer.conferenceId),
    getArchivedConferences(),
  ]);

  const window = getSubmissionWindowState(reviewer.conference);

  return (
    <AdminDashboard
      token={token}
      label={reviewer.label ?? "Site administrator"}
      conference={{
        id: reviewer.conference.id,
        slug: reviewer.conference.slug,
        name: reviewer.conference.name,
        status: reviewer.conference.status,
        submissionsOpen: reviewer.conference.submissionsOpen,
        submissionsOpenAt: reviewer.conference.submissionsOpenAt?.toISOString() ?? null,
        submissionsCloseAt: reviewer.conference.submissionsCloseAt?.toISOString() ?? null,
        timezone: reviewer.conference.timezone,
        archivedAt: reviewer.conference.archivedAt?.toISOString() ?? null,
      }}
      submissionWindowMessage={window.open ? "" : window.message}
      themes={themes.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        source: t.source,
        targetMin: t.targetMin,
        targetMax: t.targetMax,
        removedAt: t.removedAt?.toISOString() ?? null,
        usageCount: t._count.submissions,
      }))}
      archivedConferences={archivedConferences.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        archivedAt: c.archivedAt?.toISOString() ?? null,
        submissionCount: c._count.submissions,
      }))}
    />
  );
}
