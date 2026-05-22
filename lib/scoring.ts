export type ScoreAggregate = {
  count: number;
  sum: number;
  average: number;
};

export const EMPTY_AGGREGATE: ScoreAggregate = { count: 0, sum: 0, average: 0 };

export function aggregateScores(values: number[]): ScoreAggregate {
  const valid = values.filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (valid.length === 0) {
    return { ...EMPTY_AGGREGATE };
  }
  const sum = valid.reduce((a, b) => a + b, 0);
  return {
    count: valid.length,
    sum: Math.round(sum * 100) / 100,
    average: Math.round((sum / valid.length) * 100) / 100,
  };
}
