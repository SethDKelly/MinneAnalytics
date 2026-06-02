import { notFound } from "next/navigation";
import { ReviewPanel } from "@/components/ReviewPanel";
import { getReviewerQueue } from "@/lib/conference-data";
import {
  isBlindReviewEnabled,
  maskReviewSubmissionItem,
} from "@/lib/review-blind";
import { canScore, getReviewerByToken, roleDisplayName } from "@/lib/reviewer";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canScore(reviewer.role)) notFound();

  const queue = await getReviewerQueue(reviewer.conferenceId, reviewer.id);
  const blindReviewEnabled = isBlindReviewEnabled(reviewer.conference);

  return (
    <ReviewPanel
      token={token}
      label={reviewer.label ?? roleDisplayName(reviewer.role)}
      role={reviewer.role}
      blindReviewEnabled={blindReviewEnabled}
      needsScore={queue.needsScore.map((item) =>
        maskReviewSubmissionItem(item, blindReviewEnabled)
      )}
      scored={queue.scored.map((item) =>
        maskReviewSubmissionItem(item, blindReviewEnabled)
      )}
    />
  );
}
