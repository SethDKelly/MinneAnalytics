import { VARIETY_LABELS } from "@/lib/constants";

export type SchedulableTalk = {
  id: string;
  technicalLevel: number;
  isSoftSkill: boolean;
};

/** Lower score = better balance for a time row. */
export function slotBalanceScore(levels: number[]): number {
  if (levels.length === 0) return 0;

  const mean = levels.reduce((a, b) => a + b, 0) / levels.length;
  const variance =
    levels.reduce((sum, l) => sum + (l - mean) ** 2, 0) / levels.length;

  const uniqueBands = new Set(levels).size;
  const spreadPenalty = (5 - uniqueBands) * 1.25;

  const range = Math.max(...levels) - Math.min(...levels);
  const rangePenalty = range > 3 ? (range - 3) * 0.75 : 0;

  return variance + spreadPenalty + rangePenalty;
}

export function pickBestTalk(
  pool: SchedulableTalk[],
  levelsInSlot: number[]
): SchedulableTalk | null {
  if (pool.length === 0) return null;

  const bandsPresent = new Set(levelsInSlot);
  let best: { talk: SchedulableTalk; score: number } | null = null;

  for (const talk of pool) {
    const next = [...levelsInSlot, talk.technicalLevel];
    let score = slotBalanceScore(next);

    if (!bandsPresent.has(talk.technicalLevel)) {
      score -= 2.5;
    }

    if (talk.isSoftSkill && levelsInSlot.every((l) => l >= 4)) {
      score -= 1;
    }

    if (!best || score < best.score) {
      best = { talk, score };
    }
  }

  return best?.talk ?? null;
}

export function varietyLabel(level: number): string {
  return VARIETY_LABELS[level] ?? `Level ${level}`;
}
