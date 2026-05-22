import type { ThemeCountRow } from "@/lib/theme-stats";
import { themeGapLabel } from "@/lib/theme-stats";

type Props = {
  rows: ThemeCountRow[];
};

export function ThemeGapPanel({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="card border-minne-navy/15">
      <h2 className="text-lg font-bold text-minne-navy">Theme coverage</h2>
      <p className="mt-1 text-sm text-gray-600">
        Approved count vs targets — use when balancing program diversity.
      </p>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => {
          const gap = themeGapLabel(row);
          const under =
            row.targetMax > 0 && row.approved < row.targetMin;
          const over = row.targetMax > 0 && row.approved >= row.targetMax;
          return (
            <li
              key={row.themeId}
              className={`flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-sm ${
                under
                  ? "border-amber-300 bg-amber-50"
                  : over
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-gray-50"
              }`}
            >
              <span className="font-semibold text-minne-navy">{row.name}</span>
              <span className="text-gray-700">
                {row.approved} approved · {row.pending} pending · {row.declined}{" "}
                declined
                {row.targetMax > 0 && (
                  <span className="text-gray-500">
                    {" "}
                    (target {row.targetMin}–{row.targetMax})
                  </span>
                )}
              </span>
              {gap && <span className="text-xs font-medium">{gap}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
