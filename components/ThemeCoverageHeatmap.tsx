import { heatmapTooltip, type HeatmapMatrix } from "@/lib/chair-heatmaps";
import { HeatmapGrid } from "./HeatmapGrid";

type Props = {
  data: HeatmapMatrix;
  themeFilterActive?: boolean;
};

export function ThemeCoverageHeatmap({ data, themeFilterActive }: Props) {
  if (data.grandTotal === 0) {
    return (
      <div className="card border-minne-navy/15">
        <h3 className="text-base font-bold text-minne-navy">Theme coverage heatmap</h3>
        <p className="mt-2 text-sm italic text-gray-600">No submissions to chart yet.</p>
      </div>
    );
  }

  return (
    <div className="card border-minne-navy/15">
      <h3 className="text-base font-bold text-minne-navy">Theme coverage heatmap</h3>
      <p className="mt-1 text-sm text-gray-600">
        Submission volume by theme and program status (multi-theme talks count toward each
        tag).
      </p>
      {themeFilterActive && (
        <p className="mt-2 text-xs text-amber-800">
          Program list is filtered by theme; this heatmap shows the full conference.
        </p>
      )}
      <div className="mt-4">
        <HeatmapGrid
          data={data}
          ariaLabel="Theme coverage heatmap by program status"
          tooltipForCell={(row, col, value) => heatmapTooltip(row, col, value)}
        />
      </div>
    </div>
  );
}
