/** Committee score range (0.0 = lowest, 1.0 = highest). */
export const SCORE_MIN = 0;
export const SCORE_MAX = 1;
export const SCORE_STEP = 0.1;

export function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function isValidScore(value: number): boolean {
  if (value < SCORE_MIN || value > SCORE_MAX) return false;
  const rounded = roundScore(value);
  return Math.abs(value - rounded) < 0.001;
}

export function formatScore(value: number): string {
  return roundScore(value).toFixed(1);
}
