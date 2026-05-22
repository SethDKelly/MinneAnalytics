import { notFound } from "next/navigation";
import { ReviewPanel } from "@/components/ReviewPanel";
import { canScore, getReviewerByToken, roleDisplayName } from "@/lib/reviewer";
import { getReviewerQueue } from "@/lib/conference-data";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canScore(reviewer.role)) notFound();

  const queue = await getReviewerQueue(reviewer.conferenceId, reviewer.id);

  return (
    <ReviewPanel
      token={token}
      label={reviewer.label ?? roleDisplayName(reviewer.role)}
      role={reviewer.role}
      needsScore={queue.needsScore}
      scored={queue.scored}
    />
  );
}
