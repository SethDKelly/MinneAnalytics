import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/SubmissionForm";
import { SubmitClosed } from "@/components/SubmitClosed";
import { getConferenceThemes } from "@/lib/conference-queries";
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

  const themes = await getConferenceThemes(conference.id);

  return (
    <SubmissionForm
      conferenceSlug={slug}
      conferenceName={conference.name}
      themes={themes.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}
