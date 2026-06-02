import type { HeatmapMatrix } from "@/lib/chair-heatmaps";
import { HeatmapGrid } from "./HeatmapGrid";

type Props = {
  data: HeatmapMatrix;
  approvedCount: number;
};

export function TechnicalityHeatmap({ data, approvedCount }: Props) {
  if (approvedCount === 0) {
    return (
      <div className="card border-minne-navy/15">
        <h3 className="text-base font-bold text-minne-navy">Technicality heatmap</h3>
        <p className="mt-2 text-sm italic text-gray-600">No approved talks yet.</p>
      </div>
    );
  }

  return (
    <div className="card border-minne-navy/15">
      <h3 className="text-base font-bold text-minne-navy">Technicality heatmap</h3>
      <p className="mt-1 text-sm text-gray-600">
        Approved talks by technical level (rows) and theme (columns). Darker cells mean
        more talks in that bucket.
      </p>
      <div className="mt-4">
        <HeatmapGrid
          data={data}
          ariaLabel="Technicality by theme heatmap for approved talks"
          tooltipForCell={(row, col, value) =>
            `${row} · ${col}: ${value} approved talk${value === 1 ? "" : "s"}`
          }
        />
      </div>
    </div>
  );
}
