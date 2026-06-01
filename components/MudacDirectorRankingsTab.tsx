"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MudacPanelAggregateMode } from "@prisma/client";
import {
  buildRankingsFromAggregates,
  type PresentationAggregate,
  type RankingNormalization,
} from "@/lib/mudac/aggregation";
import { MUDAC_DIVISION_LABELS, MUDAC_DIVISIONS } from "@/lib/mudac/constants";
import type { MudacDivision } from "@prisma/client";

type Props = {
  token: string;
  panelAggregateMode: MudacPanelAggregateMode;
  aggregates: PresentationAggregate[];
};

const NORMALIZATION_LABELS: Record<RankingNormalization, string> = {
  PANEL: "Panel aggregate score",
  JUDGE_NORMALIZED: "Judge-normalized (% of max)",
  Z_SCORE: "Z-score within division",
};

export function MudacDirectorRankingsTab({
  token,
  panelAggregateMode: initialMode,
  aggregates,
}: Props) {
  const router = useRouter();
  const [normalization, setNormalization] = useState<RankingNormalization>("PANEL");
  const [panelAggregateMode, setPanelAggregateMode] =
    useState<MudacPanelAggregateMode>(initialMode);
  const [loading, setLoading] = useState<string | null>(null);

  const rankings = useMemo(
    () => buildRankingsFromAggregates(aggregates, normalization, MUDAC_DIVISIONS),
    [aggregates, normalization]
  );

  async function patchAggregateMode(mode: MudacPanelAggregateMode) {
    setLoading("mode");
    const res = await fetch("/api/mudac/director/event", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, panelAggregateMode: mode }),
    });
    setLoading(null);
    if (res.ok) {
      setPanelAggregateMode(mode);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Update failed");
    }
  }

  return (
    <section className="mt-6 space-y-6">
      <div className="card p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-minne-navy">Rankings</h2>
            <p className="mt-1 text-sm text-gray-600">
              Teams ranked within each division. Incomplete panels (not all judges submitted)
              are still listed with partial scores.
            </p>
          </div>
          <a
            href={`/api/mudac/director/export?token=${encodeURIComponent(token)}`}
            className="btn-secondary"
          >
            Export CSV
          </a>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Panel aggregate (across judges)
            <select
              value={panelAggregateMode}
              disabled={loading === "mode"}
              onChange={(e) =>
                patchAggregateMode(e.target.value as MudacPanelAggregateMode)
              }
              className="form-input mt-1 w-full"
            >
              <option value="MEAN">Mean of judge subtotals</option>
              <option value="SUM">Sum of judge subtotals</option>
            </select>
          </label>
          <label className="text-sm">
            Ranking display
            <select
              value={normalization}
              onChange={(e) =>
                setNormalization(e.target.value as RankingNormalization)
              }
              className="form-input mt-1 w-full"
            >
              {(Object.keys(NORMALIZATION_LABELS) as RankingNormalization[]).map((key) => (
                <option key={key} value={key}>
                  {NORMALIZATION_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {aggregates.length === 0 ? (
        <p className="text-sm text-gray-500">No presentations to rank yet.</p>
      ) : (
        rankings.map((block) => (
          <div key={block.division} className="card p-4">
            <h3 className="text-lg font-semibold text-minne-navy">
              {MUDAC_DIVISION_LABELS[block.division as MudacDivision]}
            </h3>
            {block.rows.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">No teams in this division.</p>
            ) : (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-2 pr-2">Rank</th>
                    <th className="py-2 pr-2">Team</th>
                    <th className="py-2 pr-2">Panel</th>
                    <th className="py-2 pr-2">Score</th>
                    <th className="py-2 pr-2">Judges</th>
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.presentationId} className="border-b border-gray-100">
                      <td className="py-2 pr-2 font-semibold">{row.rank}</td>
                      <td className="py-2 pr-2 font-mono text-minne-navy">
                        {row.teamDisplayId}
                      </td>
                      <td className="py-2 pr-2">{row.panelLabel}</td>
                      <td className="py-2 pr-2 font-medium">
                        {row.displayScore}
                        {normalization === "Z_SCORE" && (
                          <span className="ml-1 text-xs text-gray-500">z</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {row.judgesSubmitted}/{row.judgesExpected}
                        {!row.complete && (
                          <span className="ml-1 text-amber-700">partial</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </section>
  );
}
