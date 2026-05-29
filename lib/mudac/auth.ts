import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function getDirectorByToken(token: string) {
  const access = await prisma.mudacDirectorAccess.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { event: true },
  });
  return access;
}

export async function requireDirector(token: string) {
  const director = await getDirectorByToken(token);
  if (!director) return null;
  return director;
}
