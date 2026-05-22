import { getReviewerByToken } from "@/lib/reviewer";
import type { ReviewerRole } from "@prisma/client";

const ALLOWED: ReviewerRole[] = ["CHAIR", "CORE"];

export async function getSchedulePlanner(token: string) {
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !ALLOWED.includes(reviewer.role)) {
    return null;
  }
  return reviewer;
}
