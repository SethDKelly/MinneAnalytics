export type CriterionForScoring = {
  id: string;
  maxPoints: number;
  weight: number;
};

export function canJudgeSubmitScores(event: {
  scoringLocked: boolean;
  status: string;
}): { ok: true } | { ok: false; message: string } {
  if (event.scoringLocked) {
    return { ok: false, message: "Scoring is locked for this event." };
  }
  if (event.status === "LOCKED" || event.status === "ARCHIVED") {
    return { ok: false, message: "This event is not accepting scores." };
  }
  return { ok: true };
}

export function validateCriterionValue(
  value: number,
  maxPoints: number
): { ok: true } | { ok: false; message: string } {
  if (Number.isNaN(value)) {
    return { ok: false, message: "Score must be a number" };
  }
  if (value < 0 || value > maxPoints) {
    return { ok: false, message: `Score must be between 0 and ${maxPoints}` };
  }
  const scaled = Math.round(value * 10);
  if (Math.abs(value * 10 - scaled) > 1e-6) {
    return { ok: false, message: "Score must use 0.1 increments" };
  }
  return { ok: true };
}

export function computeJudgeSubtotal(
  scores: Array<{ value: number; weight: number }>
): number {
  const sum = scores.reduce((acc, s) => acc + s.value * s.weight, 0);
  return Math.round(sum * 100) / 100;
}

export function maxPossibleSubtotal(criteria: CriterionForScoring[]): number {
  return computeJudgeSubtotal(
    criteria.map((c) => ({ value: c.maxPoints, weight: c.weight }))
  );
}
