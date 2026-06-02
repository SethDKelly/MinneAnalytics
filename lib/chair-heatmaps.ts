import type { ProgramStatus, Theme } from "@prisma/client";
import { TECHNICAL_LABELS } from "@/lib/constants";
import { formatThemeDisplayName } from "@/lib/themes";

export const THEME_STATUS_COLUMNS: ProgramStatus[] = [
  "PENDING",
  "APPROVED",
  "DECLINED",
  "BACKUP",
];

export const THEME_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DECLINED: "Declined",
  BACKUP: "Backup",
};

export type HeatmapMatrix = {
  rowLabels: string[];
  colLabels: string[];
  values: number[][];
  rowTotals: number[];
  colTotals: number[];
  grandTotal: number;
};

type SubmissionForHeatmap = {
  programStatus: ProgramStatus;
  technicalLevel: number;
  themes: { themeId: string }[];
};

function sortedThemes(themes: Theme[]): Theme[] {
  return [...themes].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function computeThemeStatusHeatmap(
  themes: Theme[],
  submissions: SubmissionForHeatmap[]
): HeatmapMatrix {
  const ordered = sortedThemes(themes);
  const rowLabels = ordered.map((t) => formatThemeDisplayName(t));
  const colLabels = THEME_STATUS_COLUMNS.map((s) => THEME_STATUS_LABELS[s] ?? s);

  const values = ordered.map((theme) =>
    THEME_STATUS_COLUMNS.map((status) => {
      return submissions.filter(
        (s) =>
          s.programStatus === status &&
          s.themes.some((t) => t.themeId === theme.id)
      ).length;
    })
  );

  const rowTotals = values.map((row) => row.reduce((a, b) => a + b, 0));
  const colTotals = THEME_STATUS_COLUMNS.map((_, colIdx) =>
    values.reduce((sum, row) => sum + row[colIdx]!, 0)
  );
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  return { rowLabels, colLabels, values, rowTotals, colTotals, grandTotal };
}

export function computeTechnicalityThemeHeatmap(
  themes: Theme[],
  approved: SubmissionForHeatmap[]
): HeatmapMatrix {
  const ordered = sortedThemes(themes);
  const rowLabels = [1, 2, 3, 4, 5].map(
    (level) => `L${level}: ${TECHNICAL_LABELS[level]}`
  );
  const colLabels = ordered.map((t) => formatThemeDisplayName(t));

  const values = [1, 2, 3, 4, 5].map((level) =>
    ordered.map((theme) =>
      approved.filter(
        (s) =>
          s.technicalLevel === level &&
          s.themes.some((t) => t.themeId === theme.id)
      ).length
    )
  );

  const rowTotals = values.map((row) => row.reduce((a, b) => a + b, 0));
  const colTotals = ordered.map((_, colIdx) =>
    values.reduce((sum, row) => sum + row[colIdx]!, 0)
  );
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  return { rowLabels, colLabels, values, rowTotals, colTotals, grandTotal };
}

/** Column-wise max for color scaling (0 stays neutral). */
export function columnMaxes(values: number[][]): number[] {
  if (values.length === 0) return [];
  const cols = values[0]!.length;
  return Array.from({ length: cols }, (_, c) =>
    Math.max(0, ...values.map((row) => row[c] ?? 0))
  );
}

export function heatmapCellColor(value: number, columnMax: number): string {
  if (value === 0) return "rgb(249 250 251)";
  const max = columnMax > 0 ? columnMax : value;
  const ratio = Math.min(1, value / max);
  const alpha = 0.12 + ratio * 0.88;
  return `rgba(30, 58, 95, ${alpha.toFixed(3)})`;
}

export function heatmapTooltip(
  rowLabel: string,
  colLabel: string,
  value: number
): string {
  return `${rowLabel}: ${value} ${colLabel.toLowerCase()}`;
}
