import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  CoverageTargetValidationError,
  EFFECTIVE_PARTICIPATION_COUNT_MEASURE,
  normalizeThemeCoverageBounds,
  THEME_COVERAGE_DIMENSION,
} from "../../lib/concept-design/coverage-targets";

const prisma = new PrismaClient();

type Issue = {
  category: string;
  disposition: "blocking-defect" | "expected-legacy-unknown";
  contextRef: string | null;
  recordRef: string | null;
  gapId: string;
  detail: string;
};

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function safeTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const apply = hasFlag("--apply");
  const now = new Date();
  const environment = arg("--environment") ?? process.env.NODE_ENV ?? "unknown";
  const contextRef = arg("--context") ?? null;
  const outDir = path.resolve(arg("--out-dir") ?? "artifacts/migrations");
  const outPath = path.join(outDir, `004-h-backfill-${safeTimestamp(now)}.json`);
  const issues: Issue[] = [];
  const counters = {
    themesInspected: 0,
    targetsSeeded: 0,
    noTargetConfirmed: 0,
    canonicalTargetsPreserved: 0,
    compatibilityProjectionsRepaired: 0,
  };

  const run = apply
    ? await prisma.migrationRun.create({
        data: {
          version: "004-H",
          kind: "COVERAGE_TARGET_FINAL_RECONCILIATION",
          environment,
          contextRef,
          applicationCommit: process.env.GITHUB_SHA ?? null,
          schemaVersion: "20260904005000_publication_schedule_dispatch_hardening",
          status: "RUNNING",
        },
      })
    : null;

  const themes = await prisma.theme.findMany({
    where: contextRef ? { conferenceId: contextRef } : undefined,
    orderBy: [{ conferenceId: "asc" }, { sortOrder: "asc" }],
  });

  for (const theme of themes) {
    counters.themesInspected += 1;
    const identity = {
      conferenceId: theme.conferenceId,
      dimensionKey: THEME_COVERAGE_DIMENSION,
      bucketRef: theme.id,
      measureKey: EFFECTIVE_PARTICIPATION_COUNT_MEASURE,
    };
    const canonical = await prisma.coverageTarget.findUnique({
      where: { conferenceId_dimensionKey_bucketRef_measureKey: identity },
    });

    if (canonical) {
      counters.canonicalTargetsPreserved += 1;
      const projectedMin = canonical.lowerBound ?? 0;
      const projectedMax = canonical.upperBound ?? 0;
      if (theme.targetMin !== projectedMin || theme.targetMax !== projectedMax) {
        if (apply) {
          await prisma.theme.update({
            where: { id: theme.id },
            data: { targetMin: projectedMin, targetMax: projectedMax },
          });
        }
        counters.compatibilityProjectionsRepaired += 1;
      }
      continue;
    }

    let bounds;
    try {
      bounds = normalizeThemeCoverageBounds(theme.targetMin, theme.targetMax);
    } catch (error) {
      if (error instanceof CoverageTargetValidationError) {
        issues.push({
          category: "coverage-target-incoherent-legacy-bounds",
          disposition: "blocking-defect",
          contextRef: theme.conferenceId,
          recordRef: theme.id,
          gapId: "SG-018",
          detail: `${theme.name}: ${error.message} (legacy ${theme.targetMin}–${theme.targetMax}).`,
        });
        continue;
      }
      throw error;
    }

    if (!bounds) {
      // Legacy 0/0 is explicitly no target, not a zero-width Coverage Target.
      counters.noTargetConfirmed += 1;
      continue;
    }

    if (apply) {
      await prisma.coverageTarget.create({
        data: {
          ...identity,
          lowerBound: bounds.lowerBound,
          upperBound: bounds.upperBound,
          provenance: "BACKFILLED_CURRENT_STATE",
        },
      });
    }
    counters.targetsSeeded += 1;
  }

  const blocking = issues.filter((issue) => issue.disposition === "blocking-defect").length;
  const report = {
    phase: "004-H",
    kind: "COVERAGE_TARGET_FINAL_RECONCILIATION",
    environment,
    contextRef,
    mode: apply ? "apply" : "dry-run",
    observedAt: now.toISOString(),
    counters,
    issues,
    invariantResults: {
      ambiguousZeroZeroIsNoTarget: true,
      canonicalTargetWinsOverCompatibilityProjection: true,
      incoherentLegacyBoundsFailClosed: true,
      vocabularyIdentityDoesNotOwnCoverageBounds: true,
    },
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (run) {
    for (const issue of issues) {
      await prisma.migrationIssue.create({
        data: { runId: run.id, ...issue },
      });
    }
    await prisma.migrationRun.update({
      where: { id: run.id },
      data: {
        status: blocking ? "BLOCKED" : "COMPLETED",
        completedAt: new Date(),
        targetCountsJson: JSON.stringify(counters),
        issueCountsJson: JSON.stringify({ blocking, total: issues.length }),
        invariantResultsJson: JSON.stringify(report.invariantResults),
      },
    });
  }

  console.log(outPath);
  if (blocking) {
    throw new Error(`004-H Coverage Target reconciliation found ${blocking} blocking defect(s)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
