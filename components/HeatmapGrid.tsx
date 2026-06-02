import { columnMaxes, heatmapCellColor } from "@/lib/chair-heatmaps";
import type { HeatmapMatrix } from "@/lib/chair-heatmaps";

type Props = {
  data: HeatmapMatrix;
  ariaLabel: string;
  tooltipForCell: (rowLabel: string, colLabel: string, value: number) => string;
  showTotals?: boolean;
};

export function HeatmapGrid({
  data,
  ariaLabel,
  tooltipForCell,
  showTotals = true,
}: Props) {
  const colMax = columnMaxes(data.values);

  if (data.rowLabels.length === 0) {
    return <p className="text-sm italic text-gray-500">No data to display.</p>;
  }

  return (
    <div className="overflow-x-auto" role="img" aria-label={ariaLabel}>
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-2 py-1 text-left font-semibold text-gray-700" />
            {data.colLabels.map((col) => (
              <th
                key={col}
                className="px-2 py-1 text-center font-semibold text-minne-navy whitespace-nowrap"
              >
                {col}
              </th>
            ))}
            {showTotals && (
              <th className="px-2 py-1 text-center font-semibold text-gray-500">Row Σ</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.values.map((row, rowIdx) => (
            <tr key={data.rowLabels[rowIdx]}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-2 py-1 text-left font-medium text-gray-800 whitespace-nowrap max-w-[10rem] truncate"
                title={data.rowLabels[rowIdx]}
              >
                {data.rowLabels[rowIdx]}
              </th>
              {row.map((value, colIdx) => (
                <td key={colIdx} className="p-0.5">
                  <div
                    className="flex min-h-[2rem] min-w-[2.5rem] items-center justify-center rounded font-semibold tabular-nums"
                    style={{
                      backgroundColor: heatmapCellColor(value, colMax[colIdx] ?? 0),
                      color: value > 0 && (colMax[colIdx] ?? 0) > 0 && value / (colMax[colIdx] ?? 1) > 0.55
                        ? "#fff"
                        : "#1e3a5f",
                    }}
                    title={tooltipForCell(
                      data.rowLabels[rowIdx]!,
                      data.colLabels[colIdx]!,
                      value
                    )}
                  >
                    {value}
                  </div>
                </td>
              ))}
              {showTotals && (
                <td className="px-2 py-1 text-center font-medium text-gray-600">
                  {data.rowTotals[rowIdx]}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {showTotals && (
          <tfoot>
            <tr>
              <th className="sticky left-0 bg-gray-50 px-2 py-1 text-left text-gray-600">
                Col Σ
              </th>
              {data.colTotals.map((total, i) => (
                <td key={i} className="px-2 py-1 text-center font-medium text-gray-600">
                  {total}
                </td>
              ))}
              <td className="px-2 py-1 text-center font-bold text-minne-navy">
                {data.grandTotal}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
