import type { TechnicalityRow } from "@/lib/program-balance";
import { TECHNICAL_LABELS } from "@/lib/constants";

type Props = {
  rows: TechnicalityRow[];
  approvedCount: number;
};

export function TechnicalityBalance({ rows, approvedCount }: Props) {
  if (approvedCount === 0) {
    return (
      <div className="card border-minne-navy/15">
        <h2 className="text-lg font-bold text-minne-navy">Technicality balance</h2>
        <p className="mt-2 text-sm text-gray-600 italic">No approved talks yet.</p>
      </div>
    );
  }

  return (
    <div className="card border-minne-navy/15">
      <h2 className="text-lg font-bold text-minne-navy">Technicality balance</h2>
      <p className="mt-1 text-sm text-gray-600">
        Distribution of {approvedCount} approved talk{approvedCount === 1 ? "" : "s"} vs
        planning targets (before schedule build).
      </p>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => {
          const pct = Math.round(row.actualPct * 100);
          const target = Math.round(row.targetPct * 100);
          const delta = row.deltaPct;
          const barColor =
            Math.abs(delta) > 0.08 ? "bg-amber-400" : "bg-minne-navy";
          return (
            <li key={row.level}>
              <div className="flex justify-between text-sm">
                <span>
                  Level {row.level}: {TECHNICAL_LABELS[row.level]}
                </span>
                <span className="text-gray-600">
                  {row.count} ({pct}% vs {target}% target)
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded bg-gray-200">
                <div
                  className={`h-full ${barColor}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
