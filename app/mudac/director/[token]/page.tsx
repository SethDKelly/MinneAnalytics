import { notFound } from "next/navigation";
import { MudacDirectorDashboard } from "@/components/MudacDirectorDashboard";
import { getDirectorByToken } from "@/lib/mudac/auth";
import { getMudacCriteria, getMudacTeams } from "@/lib/mudac/queries";

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

  const [criteria, teams] = await Promise.all([
    getMudacCriteria(director.eventId),
    getMudacTeams(director.eventId),
  ]);

  const event = director.event;

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
    />
  );
}
