import { notFound } from "next/navigation";
import { MudacDirectorDashboard } from "@/components/MudacDirectorDashboard";
import { buildPresentationAggregate } from "@/lib/mudac/aggregation";
import { getMudacAggregationBundle } from "@/lib/mudac/aggregation-data";
import { getDirectorByToken } from "@/lib/mudac/auth";
import {
  getMudacCriteria,
  getMudacJudges,
  getMudacPanels,
  getMudacPresentations,
  getMudacTeams,
} from "@/lib/mudac/queries";

export default async function MudacDirectorPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const director = await getDirectorByToken(token);
  if (!director) {
    notFound();
  }

  const [criteria, teams, panels, judges, presentations, bundle] = await Promise.all([
    getMudacCriteria(director.eventId),
    getMudacTeams(director.eventId),
    getMudacPanels(director.eventId),
    getMudacJudges(director.eventId),
    getMudacPresentations(director.eventId),
    getMudacAggregationBundle(director.eventId),
  ]);

  const event = director.event;

  const aggregates =
    bundle?.presentations.map((p) =>
      buildPresentationAggregate(
        p,
        bundle.criteriaForScoring,
        bundle.event.panelAggregateMode,
        bundle.event.judgesPerPanel
      )
    ) ?? [];

  const scorecardPanels = panels.map((panel) => ({
    panelId: panel.id,
    panelLabel: panel.label,
    rows: aggregates.filter((a) => a.panelId === panel.id),
  }));

  return (
    <MudacDirectorDashboard
      token={token}
      label={director.label}
      event={{
        id: event.id,
        slug: event.slug,
        name: event.name,
        status: event.status,
        registrationOpen: event.registrationOpen,
        hasRegistrationCode: Boolean(event.registrationCodeHash),
        scoringLocked: event.scoringLocked,
        judgesPerPanel: event.judgesPerPanel,
        panelAggregateMode: event.panelAggregateMode,
        idGenerationMode: event.idGenerationMode,
        teamIdStart: event.teamIdStart,
        teamIdEnd: event.teamIdEnd,
        teamIdIncrement: event.teamIdIncrement,
        teamIdPadWidth: event.teamIdPadWidth,
      }}
      criteria={criteria}
      teams={teams}
      panels={panels.map((p) => ({
        id: p.id,
        label: p.label,
        sortOrder: p.sortOrder,
        slotRequirements: p.slotRequirements,
        assignments: p.assignments.map((a) => ({
          slotIndex: a.slotIndex,
          judge: {
            ...a.judge,
            revokedAt: a.judge.revokedAt?.toISOString() ?? null,
          },
        })),
      }))}
      judges={judges.map((j) => ({
        id: j.id,
        name: j.name,
        email: j.email,
        judgeType: j.judgeType,
        revokedAt: j.revokedAt?.toISOString() ?? null,
        assignments: j.assignments,
      }))}
      presentations={presentations.map((p) => ({
        id: p.id,
        panelId: p.panelId,
        team: {
          id: p.team.id,
          displayId: p.team.displayId,
          division: p.team.division,
          name: p.team.name,
        },
        panel: p.panel,
        scorecards: p.scorecards.map((sc) => ({
          id: sc.id,
          submittedAt: sc.submittedAt?.toISOString() ?? null,
          judge: sc.judge,
        })),
      }))}
      aggregates={aggregates}
      scorecardPanels={scorecardPanels}
    />
  );
}
