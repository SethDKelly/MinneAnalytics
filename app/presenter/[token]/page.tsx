import { notFound } from "next/navigation";
import { PresenterPortal } from "@/components/PresenterPortal";
import { getSubmissionByPresenterToken } from "@/lib/presenter-auth";
import {
  canPresenterEditSubmission,
  themeIdsFromJoin,
} from "@/lib/submission-revision";
import { getSelectableThemes, themeOptionFromRow } from "@/lib/themes";
import { prisma } from "@/lib/db";

export default async function PresenterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const submission = await getSubmissionByPresenterToken(token);
  if (!submission) notFound();

  const [themes, feedbackRows] = await Promise.all([
    getSelectableThemes(submission.conferenceId),
    prisma.presenterFeedback.findMany({
      where: { submissionId: submission.id },
      orderBy: { createdAt: "desc" },
      include: {
        reviewerAccess: { select: { label: true, role: true } },
      },
    }),
  ]);

  const latestDeck = submission.deckFiles[0];

  const feedback = feedbackRows.map((f) => ({
    id: f.id,
    kind: f.kind,
    body: f.body,
    reviewerLabel:
      f.reviewerAccess.label ?? f.reviewerAccess.role.replace("_", " "),
    abstractVersion: f.abstractVersion,
    createdAt: f.createdAt.toISOString(),
  }));

  return (
    <PresenterPortal
      token={token}
      conferenceSlug={submission.conference.slug}
      submissionId={submission.id}
      themes={themes.map(themeOptionFromRow)}
      feedback={feedback}
      submission={{
        title: submission.title,
        abstract: submission.abstract,
        bio: submission.bio,
        technicalLevel: submission.technicalLevel,
        themeIds: themeIdsFromJoin(submission.themes),
        abstractVersion: submission.abstractVersion,
        abstractReviewStatus: submission.abstractReviewStatus,
        programStatus: submission.programStatus,
        deckStatus: submission.deckStatus,
        degrees: submission.degrees,
        conferenceName: submission.conference.name,
        deckFilename: latestDeck?.filename ?? null,
        deckVersion: latestDeck?.version ?? null,
        canEdit: canPresenterEditSubmission(submission),
      }}
    />
  );
}
