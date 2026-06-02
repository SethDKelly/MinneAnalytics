import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/SubmissionForm";
import { SubmitClosed } from "@/components/SubmitClosed";
import { getSelectableThemes, themeOptionFromRow } from "@/lib/themes";
import { prisma } from "@/lib/db";
import { getSubmissionWindowState } from "@/lib/submission-window";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const conference = await prisma.conference.findUnique({ where: { slug } });
  if (!conference) notFound();

  const window = getSubmissionWindowState(conference);
  if (!window.open) {
    return (
      <SubmitClosed conferenceName={conference.name} message={window.message} />
    );
  }

  const themes = await getSelectableThemes(conference.id);

  return (
    <SubmissionForm
      conferenceSlug={slug}
      conferenceName={conference.name}
      themes={themes.map(themeOptionFromRow)}
    />
  );
}
