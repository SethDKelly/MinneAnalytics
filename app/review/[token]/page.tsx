import { notFound } from "next/navigation";
import { ReviewPanel } from "@/components/ReviewPanel";
import { getReviewerByToken } from "@/lib/reviewer";
import { getReviewerQueue } from "@/lib/conference-data";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const reviewer = await getReviewerByToken(token);
  if (!reviewer) notFound();

  const queue = await getReviewerQueue(reviewer.conferenceId, reviewer.id);

  return (
    <ReviewPanel
      token={token}
      label={reviewer.label ?? reviewer.role}
      needsScore={queue.needsScore}
      scored={queue.scored}
    />
  );
}
