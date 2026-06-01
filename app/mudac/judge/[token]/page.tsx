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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <p className="text-sm text-gray-600">
        <Link href="/mudac" className="text-minne-navy underline">
          MinneMUDAC demo
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-bold text-minne-navy sm:text-3xl">Judge portal</h1>
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
            <ul className="mt-4 space-y-3">
              {presentations.map((p) => {
                const card = p.scorecards[0];
                const done = Boolean(card?.submittedAt);
                return (
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="font-mono text-2xl font-bold text-minne-navy sm:text-lg">
                        Team {p.team.displayId}
                      </span>
                      <p className="mt-1 text-sm text-gray-600">
                        {MUDAC_DIVISION_LABELS[p.team.division]}
                        {done ? (
                          <span className="ml-2 font-medium text-green-700">· Submitted</span>
                        ) : card ? (
                          <span className="ml-2 text-gray-500">· Draft saved</span>
                        ) : null}
                      </p>
                    </div>
                    <Link
                      href={`/mudac/judge/${token}/presentation/${p.id}`}
                      className="btn-primary min-h-12 w-full text-center text-base no-underline sm:w-auto sm:min-h-0 sm:text-sm"
                    >
                      {done ? "View / edit" : "Score team"}
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
