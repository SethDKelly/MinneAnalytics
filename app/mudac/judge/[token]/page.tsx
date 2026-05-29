import Link from "next/link";
import { notFound } from "next/navigation";
import { getJudgeByToken } from "@/lib/mudac/auth";
import { MUDAC_JUDGE_TYPE_LABELS } from "@/lib/mudac/constants";

export default async function MudacJudgePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const judge = await getJudgeByToken(token);
  if (!judge) notFound();

  const assignment = judge.assignments[0];

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

      <p className="mt-6 rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        Team scoring arrives in Phase 3. Once presentations are scheduled, you will score
        assigned teams on each criterion from this portal.
      </p>
    </div>
  );
}
