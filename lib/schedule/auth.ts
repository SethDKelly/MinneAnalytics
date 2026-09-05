import { hasApplicationCapability } from "@/lib/concept-design/lifecycle-disclosure-policy";
import { getReviewerByToken } from "@/lib/reviewer";

export async function getSchedulePlanner(token: string) {
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !hasApplicationCapability(reviewer.role, "MANAGE_SCHEDULE")) {
    return null;
  }
  return reviewer;
}
