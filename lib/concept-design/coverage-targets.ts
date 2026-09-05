import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSemanticConferenceSubmissions } from "@/lib/concept-design/semantic-reads";

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

export async function setThemeCoverageTarget(
  tx: Prisma.TransactionClient,
  input: {
    conferenceId: string;
    themeId: string;
    targetMin: unknown;
    targetMax: unknown;
    provenance?: "NATIVE" | "BACKFILLED_CURRENT_STATE";
  }
) {
  const bounds = normalizeThemeCoverageBounds(input.targetMin, input.targetMax);
  const identity = {
    conferenceId: input.conferenceId,
    dimensionKey: THEME_COVERAGE_DIMENSION,
    bucketRef: input.themeId,
    measureKey: EFFECTIVE_PARTICIPATION_COUNT_MEASURE,
  };

  if (!bounds) {
    await tx.coverageTarget.deleteMany({ where: identity });
    await tx.theme.update({
      where: { id: input.themeId },
      data: { targetMin: 0, targetMax: 0 },
    });
    return null;
  }

  const target = await tx.coverageTarget.upsert({
    where: {
      conferenceId_dimensionKey_bucketRef_measureKey: identity,
    },
    create: {
      ...identity,
      lowerBound: bounds.lowerBound,
      upperBound: bounds.upperBound,
      provenance: input.provenance ?? "NATIVE",
    },
    update: {
      lowerBound: bounds.lowerBound,
      upperBound: bounds.upperBound,
    },
  });

  // Theme bounds remain a compatibility/read-rollback projection only.
  await tx.theme.update({
    where: { id: input.themeId },
    data: {
      targetMin: bounds.lowerBound ?? 0,
      targetMax: bounds.upperBound ?? 0,
    },
  });
  return target;
}

export async function getThemeCoverageTargets(conferenceId: string) {
  return prisma.coverageTarget.findMany({
    where: {
      conferenceId,
      dimensionKey: THEME_COVERAGE_DIMENSION,
      measureKey: EFFECTIVE_PARTICIPATION_COUNT_MEASURE,
    },
  });
}

export type ThemeCoverageAdvisory = {
  message: string;
  basis: "coverage-target" | "untargeted-advisory";
  themeId: string;
  observed: number;
  upperBound: number | null;
};

export async function themeSelectionCoverageAdvisory(
  conferenceId: string,
  candidateThemeIds: string[]
): Promise<ThemeCoverageAdvisory | null> {
  const [targets, submissions, themes] = await Promise.all([
    getThemeCoverageTargets(conferenceId),
    getSemanticConferenceSubmissions(conferenceId),
    prisma.theme.findMany({
      where: { conferenceId, id: { in: candidateThemeIds } },
      select: { id: true, name: true },
    }),
  ]);
  const targetByTheme = new Map(targets.map((target) => [target.bucketRef, target]));
  const nameByTheme = new Map(themes.map((theme) => [theme.id, theme.name]));

  for (const themeId of candidateThemeIds) {
    const observed = submissions.filter(
      (submission) =>
        submission.semantic.participation.effective &&
        submission.themes.some((theme) => theme.themeId === themeId)
    ).length;
    const target = targetByTheme.get(themeId);
    const name = nameByTheme.get(themeId) ?? "Theme";

    if (target?.upperBound != null && observed >= target.upperBound) {
      return {
        message: `"${name}" already has ${observed} participating talks (coverage target max ${target.upperBound}).`,
        basis: "coverage-target",
        themeId,
        observed,
        upperBound: target.upperBound,
      };
    }

    // This is intentionally separate from Coverage Target authority. No target exists here.
    if (!target && observed >= UNTARGETED_THEME_ADVISORY_THRESHOLD) {
      return {
        message: `"${name}" already has ${observed} participating talks (untargeted diversity advisory).`,
        basis: "untargeted-advisory",
        themeId,
        observed,
        upperBound: null,
      };
    }
  }
  return null;
}
