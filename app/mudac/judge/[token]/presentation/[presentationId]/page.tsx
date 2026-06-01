import { notFound } from "next/navigation";
import { MudacJudgeScorecardForm } from "@/components/MudacJudgeScorecardForm";
import { getJudgeByToken } from "@/lib/mudac/auth";
import { MUDAC_DIVISION_LABELS } from "@/lib/mudac/constants";
import { getMudacCriteria, getPresentationForJudgeScore } from "@/lib/mudac/queries";

export default async function MudacJudgeScorePage({
  params,
}: {
  params: Promise<{ token: string; presentationId: string }>;
}) {
  const { token, presentationId } = await params;
  const judge = await getJudgeByToken(token);
  if (!judge) notFound();

  const presentation = await getPresentationForJudgeScore(presentationId, judge.id);
  if (!presentation) notFound();

  const criteria = await getMudacCriteria(judge.eventId);
  const scorecard = presentation.scorecards[0];

  const initialScores: Record<string, number> = {};
  for (const c of criteria) {
    const existing = scorecard?.scores.find((s) => s.criterionId === c.id);
    initialScores[c.id] = existing?.value ?? 0;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <MudacJudgeScorecardForm
        token={token}
        presentationId={presentation.id}
        teamDisplayId={presentation.team.displayId}
        divisionLabel={MUDAC_DIVISION_LABELS[presentation.team.division]}
        panelLabel={presentation.panel.label}
        scoringLocked={judge.event.scoringLocked}
        criteria={criteria}
        initialScores={initialScores}
        initialNotes={scorecard?.notes ?? ""}
        initialSubmitted={Boolean(scorecard?.submittedAt)}
      />
    </div>
  );
}
