import { notFound } from "next/navigation";
import { PresenterPortal } from "@/components/PresenterPortal";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export default async function PresenterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const submission = await prisma.submission.findUnique({
    where: { presenterTokenHash: hashToken(token) },
    include: {
      conference: true,
      deckFiles: { orderBy: { version: "desc" }, take: 1 },
    },
  });
  if (!submission) notFound();

  const latestDeck = submission.deckFiles[0];

  return (
    <PresenterPortal
      token={token}
      submission={{
        title: submission.title,
        programStatus: submission.programStatus,
        deckStatus: submission.deckStatus,
        degrees: submission.degrees,
        conferenceName: submission.conference.name,
        deckFilename: latestDeck?.filename ?? null,
        deckVersion: latestDeck?.version ?? null,
      }}
    />
  );
}
