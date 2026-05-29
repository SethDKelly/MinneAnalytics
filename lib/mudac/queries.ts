import { prisma } from "@/lib/db";

export async function getMudacEventBySlug(slug: string) {
  return prisma.mudacEvent.findUnique({ where: { slug } });
}

export async function getMudacCriteria(eventId: string) {
  return prisma.mudacScoringCriterion.findMany({
    where: { eventId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getMudacTeams(eventId: string) {
  return prisma.mudacTeam.findMany({
    where: { eventId },
    orderBy: [{ division: "asc" }, { displayId: "asc" }],
  });
}

export async function getExistingTeamDisplayIds(eventId: string): Promise<Set<string>> {
  const teams = await prisma.mudacTeam.findMany({
    where: { eventId },
    select: { displayId: true },
  });
  return new Set(teams.map((t) => t.displayId));
}

export async function getNextCriterionSortOrder(eventId: string): Promise<number> {
  const last = await prisma.mudacScoringCriterion.findFirst({
    where: { eventId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? 0) + 1;
}
