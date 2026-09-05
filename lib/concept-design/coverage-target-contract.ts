export const THEME_COVERAGE_DIMENSION = "theme";
export const EFFECTIVE_PARTICIPATION_COUNT_MEASURE = "effective-participation-count";
export const UNTARGETED_THEME_ADVISORY_THRESHOLD = 3;

export class CoverageTargetValidationError extends Error {
  readonly code = "COVERAGE_TARGET_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "CoverageTargetValidationError";
  }
}

export type ThemeCoverageBounds = {
  lowerBound: number | null;
  upperBound: number | null;
};

export function normalizeThemeCoverageBounds(
  rawMin: unknown,
  rawMax: unknown
): ThemeCoverageBounds | null {
  const min = Math.max(0, Number(rawMin) || 0);
  const max = Math.max(0, Number(rawMax) || 0);

  // Compatibility 0/0 means no explicit Coverage Target. It is not a zero-width target.
  if (min === 0 && max === 0) return null;
  if (max === 0) {
    throw new CoverageTargetValidationError(
      "A coverage target with a lower bound requires an explicit upper bound"
    );
  }
  if (min > max) {
    throw new CoverageTargetValidationError(
      "Coverage target minimum cannot exceed its maximum"
    );
  }
  return { lowerBound: min, upperBound: max };
}
