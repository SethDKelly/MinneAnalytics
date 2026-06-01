import Link from "next/link";
import { notFound } from "next/navigation";
import { getJudgeByToken, getJudgePanelId } from "@/lib/mudac/auth";
import { MUDAC_DIVISION_LABELS, MUDAC_JUDGE_TYPE_LABELS } from "@/lib/mudac/constants";
import { getJudgeScoringContext } from "@/lib/mudac/queries";
import { canJudgeSubmitScores } from "@/lib/mudac/scoring";

export default async function MudacJudgePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const judge = await getJudgeByToken(token);
  if (!judge) notFound();

  const panelId = getJudgePanelId(judge);
  const assignment = judge.assignments[0];
  const scoring = canJudgeSubmitScores(judge.event);

  let presentations: Awaited<ReturnType<typeof getJudgeScoringContext>>["presentations"] =
    [];
  if (panelId) {
    const ctx = await getJudgeScoringContext(judge.eventId, panelId, judge.id);
    presentations = ctx.presentations;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm text-gray-600">
        <Link href="/mudac" className="text-minne-navy underline">
          MinneMUDAC demo
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold text-minne-navy">Judge portal</h1>
      <p className="mt-2 text-gray-700">
        {judge.name} · {judge.event.name}
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Judge type: {MUDAC_JUDGE_TYPE_LABELS[judge.judgeType]}
      </p>

      {!scoring.ok && (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {scoring.message}
        </p>
      )}

      <div className="card mt-6">
        <h2 className="font-semibold text-minne-navy">Panel assignment</h2>
        {assignment ? (
          <p className="mt-2 text-sm text-gray-700">
            You are assigned to <strong>{assignment.panel.label}</strong>, slot{" "}
            {assignment.slotIndex + 1}.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            You are not yet assigned to a panel. Tournament directors will place you before
            judging begins.
          </p>
        )}
      </div>

      {panelId && (
        <div className="card mt-6">
          <h2 className="font-semibold text-minne-navy">Teams to score</h2>
          {presentations.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No teams are scheduled for your panel yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {presentations.map((p) => {
                const card = p.scorecards[0];
                const done = Boolean(card?.submittedAt);
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <span className="font-mono text-lg font-bold text-minne-navy">
                        Team {p.team.displayId}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {MUDAC_DIVISION_LABELS[p.team.division]}
                      </span>
                      {done ? (
                        <span className="ml-2 text-xs font-medium text-green-700">
                          Submitted
                        </span>
                      ) : card ? (
                        <span className="ml-2 text-xs text-gray-500">Draft saved</span>
                      ) : null}
                    </div>
                    <Link
                      href={`/mudac/judge/${token}/presentation/${p.id}`}
                      className="btn-primary text-sm"
                    >
                      {done ? "View / edit" : "Score"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
