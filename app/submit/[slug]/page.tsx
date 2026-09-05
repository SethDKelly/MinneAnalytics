import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/SubmissionForm";
import { SubmitClosed } from "@/components/SubmitClosed";
import { getSelectableThemes, themeOptionFromRow } from "@/lib/themes";
import { prisma } from "@/lib/db";
import { getProposalOfferAvailability } from "@/lib/submission-window";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const conference = await prisma.conference.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!conference) notFound();

  const availability = await getProposalOfferAvailability(conference.id);
  if (!availability) notFound();
  if (!availability.state.open) {
    return (
      <SubmitClosed
        conferenceName={conference.name}
        message={availability.state.message}
      />
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
