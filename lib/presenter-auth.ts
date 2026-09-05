import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import { PROPOSAL_OFFER_WINDOW_KEY } from "@/lib/concept-design/lifecycle-disclosure-policy";

export async function getSubmissionByPresenterToken(token: string) {
  return prisma.submission.findUnique({
    where: { presenterTokenHash: hashToken(token) },
    include: {
      conference: {
        include: {
          archiveRecord: true,
          availabilityWindows: {
            where: { opportunityKey: PROPOSAL_OFFER_WINDOW_KEY },
            take: 1,
          },
        },
      },
      currentSelectionDecision: true,
      withdrawal: true,
      themes: true,
      deckFiles: { orderBy: { version: "desc" }, take: 1 },
    },
  });
}
