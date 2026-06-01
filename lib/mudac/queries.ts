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

export async function getNextPanelSortOrder(eventId: string): Promise<number> {
  const last = await prisma.mudacJudgePanel.findFirst({
    where: { eventId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? 0) + 1;
}

export async function getMudacJudges(eventId: string) {
  return prisma.mudacJudge.findMany({
    where: { eventId },
    orderBy: { registeredAt: "desc" },
    include: {
      assignments: {
        include: { panel: { select: { id: true, label: true } } },
      },
    },
  });
}

export async function getMudacPanels(eventId: string) {
  return prisma.mudacJudgePanel.findMany({
    where: { eventId },
    orderBy: { sortOrder: "asc" },
    include: {
      slotRequirements: { orderBy: { slotIndex: "asc" } },
      assignments: {
        include: {
          judge: {
            select: {
              id: true,
              name: true,
              email: true,
              judgeType: true,
              revokedAt: true,
            },
          },
        },
        orderBy: { slotIndex: "asc" },
      },
    },
  });
}

export async function getMudacPresentations(eventId: string) {
  return prisma.mudacPresentation.findMany({
    where: { eventId },
    include: {
      team: true,
      panel: { select: { id: true, label: true } },
      scorecards: {
        include: {
          judge: { select: { id: true, name: true } },
          scores: true,
        },
      },
    },
    orderBy: [{ panel: { sortOrder: "asc" } }, { team: { displayId: "asc" } }],
  });
}

export async function getJudgeScoringContext(
  eventId: string,
  panelId: string,
  judgeId: string
) {
  const [criteria, presentations] = await Promise.all([
    prisma.mudacScoringCriterion.findMany({
      where: { eventId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.mudacPresentation.findMany({
      where: { panelId },
      include: {
        team: true,
        scorecards: {
          where: { judgeId },
          include: { scores: true },
        },
      },
      orderBy: { team: { displayId: "asc" } },
    }),
  ]);

  return { criteria, presentations };
}

export async function getPresentationForJudgeScore(
  presentationId: string,
  judgeId: string
) {
  return prisma.mudacPresentation.findFirst({
    where: {
      id: presentationId,
      panel: { assignments: { some: { judgeId } } },
    },
    include: {
      team: true,
      panel: { select: { label: true } },
      event: true,
      scorecards: {
        where: { judgeId },
        include: {
          scores: {
            include: { criterion: true },
          },
        },
      },
    },
  });
}
