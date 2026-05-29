import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function getDirectorByToken(token: string) {
  const access = await prisma.mudacDirectorAccess.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { event: true },
  });
  return access;
}

export async function getJudgeByToken(token: string) {
  const judge = await prisma.mudacJudge.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      event: true,
      assignments: {
        include: {
          panel: {
            include: {
              slotRequirements: { orderBy: { slotIndex: "asc" } },
            },
          },
        },
      },
    },
  });
  if (!judge || judge.revokedAt) return null;
  return judge;
}

export async function requireDirector(token: string) {
  const director = await getDirectorByToken(token);
  if (!director) return null;
  return director;
}

export function canRegisterForEvent(event: {
  registrationOpen: boolean;
  status: string;
}): { ok: true } | { ok: false; message: string } {
  if (!event.registrationOpen) {
    return { ok: false, message: "Judge registration is not open for this event." };
  }
  if (event.status === "LOCKED" || event.status === "ARCHIVED") {
    return { ok: false, message: "This event is no longer accepting judge registrations." };
  }
  return { ok: true };
}
