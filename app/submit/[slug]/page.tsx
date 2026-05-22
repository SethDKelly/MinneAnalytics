import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SubmissionForm } from "@/components/SubmissionForm";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const conference = await prisma.conference.findUnique({ where: { slug } });
  if (!conference) notFound();

  return <SubmissionForm conferenceSlug={slug} conferenceName={conference.name} />;
}
