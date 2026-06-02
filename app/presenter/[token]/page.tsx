import { notFound } from "next/navigation";
import { PresenterPortal } from "@/components/PresenterPortal";
import { getSelectableThemes, themeOptionFromRow } from "@/lib/themes";
import { getSubmissionByPresenterToken } from "@/lib/presenter-auth";
import {
  canPresenterEditSubmission,
  themeIdsFromJoin,
} from "@/lib/submission-revision";

export default async function PresenterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const submission = await getSubmissionByPresenterToken(token);
  if (!submission) notFound();

  const themes = await getSelectableThemes(submission.conferenceId);
  const latestDeck = submission.deckFiles[0];

  return (
    <PresenterPortal
      token={token}
      conferenceSlug={submission.conference.slug}
      submissionId={submission.id}
      themes={themes.map(themeOptionFromRow)}
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
