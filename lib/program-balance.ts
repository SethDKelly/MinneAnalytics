/** Default share of approved talks per technical level (1–5). */
export const DEFAULT_TECH_TARGETS: Record<number, number> = {
  1: 0.1,
  2: 0.1,
  3: 0.6,
  4: 0.1,
  5: 0.1,
};

export type TechnicalityRow = {
  level: number;
  count: number;
  actualPct: number;
  targetPct: number;
  deltaPct: number;
};

export function computeTechnicalityBalance(
  approved: { technicalLevel: number }[],
  targets: Record<number, number> = DEFAULT_TECH_TARGETS
): TechnicalityRow[] {
  const total = approved.length;
  const levels = [1, 2, 3, 4, 5];
  return levels.map((level) => {
    const count = approved.filter((s) => s.technicalLevel === level).length;
    const actualPct = total === 0 ? 0 : count / total;
    const targetPct = targets[level] ?? 0;
    return {
      level,
      count,
      actualPct,
      targetPct,
      deltaPct: actualPct - targetPct,
    };
  });
}
