import { prisma } from "@/lib/db";
import {
  buildDivisionRankings,
  type RankingNormalization,
} from "@/lib/mudac/aggregation";
import { MUDAC_DIVISIONS } from "@/lib/mudac/constants";
import { getMudacCriteria } from "@/lib/mudac/queries";

export async function getMudacAggregationBundle(eventId: string) {
  const [event, criteria, presentations] = await Promise.all([
    prisma.mudacEvent.findUnique({ where: { id: eventId } }),
    getMudacCriteria(eventId),
    prisma.mudacPresentation.findMany({
      where: { eventId },
      include: {
        team: true,
        panel: { select: { id: true, label: true } },
        scorecards: {
          include: {
            judge: { select: { id: true, name: true } },
            scores: {
              include: {
                criterion: {
                  select: {
                    id: true,
                    name: true,
                    maxPoints: true,
                    weight: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ panel: { sortOrder: "asc" } }, { team: { displayId: "asc" } }],
    }),
  ]);

  if (!event) return null;

  const criteriaForScoring = criteria.map((c) => ({
    id: c.id,
    maxPoints: c.maxPoints,
    weight: c.weight,
  }));

  return { event, criteria, presentations, criteriaForScoring };
}

export function buildRankingsForEvent(
  bundle: NonNullable<Awaited<ReturnType<typeof getMudacAggregationBundle>>>,
  normalization: RankingNormalization = "PANEL"
) {
  return buildDivisionRankings(
    bundle.presentations,
    bundle.criteriaForScoring,
    bundle.event.panelAggregateMode,
    bundle.event.judgesPerPanel,
    normalization,
    MUDAC_DIVISIONS
  );
}
