import type { ProgramStatus, Theme } from "@prisma/client";

export type ThemeCountRow = {
  themeId: string;
  name: string;
  slug: string;
  targetMin: number;
  targetMax: number;
  pending: number;
  approved: number;
  declined: number;
  backup: number;
  total: number;
};

type SubmissionWithThemes = {
  programStatus: ProgramStatus;
  themes: { themeId: string }[];
};

export function computeThemeStats(
  themes: Theme[],
  submissions: SubmissionWithThemes[]
): ThemeCountRow[] {
  return themes.map((theme) => {
    const matching = submissions.filter((s) =>
      s.themes.some((t) => t.themeId === theme.id)
    );
    const pending = matching.filter((s) => s.programStatus === "PENDING").length;
    const approved = matching.filter((s) => s.programStatus === "APPROVED").length;
    const declined = matching.filter((s) => s.programStatus === "DECLINED").length;
    const backup = matching.filter((s) => s.programStatus === "BACKUP").length;
    return {
      themeId: theme.id,
      name: theme.name,
      slug: theme.slug,
      targetMin: theme.targetMin,
      targetMax: theme.targetMax,
      pending,
      approved,
      declined,
      backup,
      total: matching.length,
    };
  });
}

export function themeGapLabel(row: ThemeCountRow): string | null {
  if (row.targetMax <= 0) return null;
  if (row.approved < row.targetMin) {
    return `Under target (${row.approved} approved, target ${row.targetMin}–${row.targetMax})`;
  }
  if (row.approved >= row.targetMax) {
    return `At or above target (${row.approved} approved, target ${row.targetMin}–${row.targetMax})`;
  }
  return null;
}

export function approvedThemeSaturationWarning(
  themeStats: ThemeCountRow[],
  themeIds: string[],
  threshold = 3
): string | null {
  for (const id of themeIds) {
    const row = themeStats.find((r) => r.themeId === id);
    if (row && row.targetMax > 0 && row.approved >= row.targetMax) {
      return `"${row.name}" already has ${row.approved} approved talks (target max ${row.targetMax}).`;
    }
    if (row && row.targetMax === 0 && row.approved >= threshold) {
      return `"${row.name}" already has ${row.approved} approved talks.`;
    }
  }
  return null;
}
