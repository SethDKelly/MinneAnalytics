import { canAccessSchedule, getReviewerByToken } from "@/lib/reviewer";

export async function getSchedulePlanner(token: string) {
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canAccessSchedule(reviewer.role)) {
    return null;
  }
  return reviewer;
}
