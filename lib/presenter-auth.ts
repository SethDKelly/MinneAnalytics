import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function getSubmissionByPresenterToken(token: string) {
  return prisma.submission.findUnique({
    where: { presenterTokenHash: hashToken(token) },
    include: {
      conference: true,
      themes: true,
      deckFiles: { orderBy: { version: "desc" }, take: 1 },
    },
  });
}
