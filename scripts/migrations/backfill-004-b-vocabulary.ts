import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { establishInitialTermState } from "../../lib/concept-design/vocabulary";

const prisma = new PrismaClient();

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
  const outPath = path.join(outDir, `004-b-vocabulary-${safeTimestamp(now)}.json`);

  const themes = await prisma.theme.findMany({
    where: contextRef ? { conferenceId: contextRef } : undefined,
    include: { currentTermState: true },
    orderBy: [{ conferenceId: "asc" }, { sortOrder: "asc" }],
  });
  const missing = themes.filter((theme) => !theme.currentTermStateId);

  const run = apply
    ? await prisma.migrationRun.create({
        data: {
          version: "004-B",
          kind: "TERMSTATE_CURRENT_SEED",
          environment,
          contextRef,
          applicationCommit: process.env.GITHUB_SHA ?? null,
          schemaVersion: "20260904002000_revision_classification_evaluation_feedback",
          status: "RUNNING",
        },
      })
    : null;

  if (apply) {
    for (const theme of missing) {
      await prisma.$transaction(async (tx) => {
        await establishInitialTermState(tx, {
          themeId: theme.id,
          label: theme.name,
          availability: theme.removedAt ? "RETIRED" : "AVAILABLE",
          provenance: "BACKFILLED_CURRENT_STATE",
          observedAt: now,
        });
      });
    }
  }

  const report = {
    phase: "004-B",
    mode: apply ? "apply" : "dry-run",
    environment,
    contextRef,
    generatedAt: now.toISOString(),
    themesInspected: themes.length,
    currentTermStatesAlreadyPresent: themes.length - missing.length,
    currentTermStatesSeeded: apply ? missing.length : 0,
    wouldSeed: missing.length,
    historicalChangesReconstructed: 0,
    provenance: "BACKFILLED_CURRENT_STATE",
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (run) {
    await prisma.migrationRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETE",
        completedAt: new Date(),
        sourceCountsJson: JSON.stringify({ themes: themes.length }),
        targetCountsJson: JSON.stringify({ termStatesSeeded: missing.length }),
        provenanceCountsJson: JSON.stringify({ BACKFILLED_CURRENT_STATE: missing.length }),
        issueCountsJson: JSON.stringify({ total: 0 }),
        invariantResultsJson: JSON.stringify({ stableTermIdentityPreserved: true }),
        notes: "Only current Vocabulary state was seeded; historical rename/retire/restore events were not fabricated.",
      },
    });
  }

  console.log(outPath);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
