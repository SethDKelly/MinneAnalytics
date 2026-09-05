import { access, mkdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const BASELINE = "20260904000000_baseline";
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function enabled(name, defaultValue = false) {
  const raw = process.env[name];
  return raw == null ? defaultValue : TRUE_VALUES.has(raw.trim().toLowerCase());
}

function resolveSqlitePath(databaseUrl) {
  if (!databaseUrl?.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a SQLite file: URL for deployment bootstrap.");
  }
  const raw = decodeURIComponent(databaseUrl.slice("file:".length));
  if (path.isAbsolute(raw)) return raw;
  return path.resolve(process.cwd(), "prisma", raw);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stdout ?? "");
      process.stderr.write(result.stderr ?? "");
    }
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
  return (result.stdout ?? "").trim();
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function inspectDatabase(databasePath) {
  if (!(await fileExists(databasePath))) {
    return { fresh: true, tables: [], hasMigrationTable: false };
  }
  const info = await stat(databasePath);
  if (info.size === 0) {
    return { fresh: true, tables: [], hasMigrationTable: false };
  }

  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    const tables = rows.map((row) => String(row.name));
    const userTables = tables.filter(
      (name) => name !== "sqlite_sequence" && !name.startsWith("sqlite_")
    );
    return {
      fresh: userTables.length === 0,
      tables,
      hasMigrationTable: tables.includes("_prisma_migrations"),
    };
  } finally {
    await prisma.$disconnect();
  }
}

function assertRecognizedLegacyBaseline(tables) {
  const required = [
    "Conference",
    "Submission",
    "SubmissionRevision",
    "Score",
    "Theme",
    "DeckFile",
  ];
  const missing = required.filter((table) => !tables.includes(table));
  if (missing.length > 0) {
    throw new Error(
      `Existing database has no Prisma migration history and does not match the recognized pre-004-A baseline; missing tables: ${missing.join(", ")}`
    );
  }
}

function runBackupAndRestoreRehearsal(outDir) {
  const manifest = run(
    "node",
    ["scripts/migrations/sqlite-backup.mjs", "--out-dir", outDir],
    { capture: true }
  )
    .split(/\r?\n/)
    .filter(Boolean)
    .at(-1);
  if (!manifest?.endsWith(".json")) {
    throw new Error("Backup command did not return a manifest path.");
  }
  const backup = manifest.slice(0, -".json".length);
  run("node", ["scripts/migrations/sqlite-restore-rehearsal.mjs", "--backup", backup, "--out-dir", outDir]);
  return { manifest, backup };
}

function deployMigrations() {
  run("npx", ["prisma", "migrate", "deploy"]);
}

function runSemanticBackfills(outDir) {
  const environment = process.env.MIGRATION_ENVIRONMENT ?? process.env.DEPLOYMENT_MODE ?? "deployment";
  const scripts = [
    "scripts/migrations/backfill-004-b-vocabulary.ts",
    "scripts/migrations/backfill-004-b.ts",
    "scripts/migrations/backfill-004-c.ts",
    "scripts/migrations/backfill-004-d.ts",
    "scripts/migrations/backfill-004-e.ts",
  ];
  for (const script of scripts) {
    run("npx", ["tsx", script, "--apply", "--environment", environment, "--out-dir", outDir]);
  }
}

async function main() {
  const databasePath = resolveSqlitePath(process.env.DATABASE_URL);
  const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.dirname(databasePath);
  const reportDir = path.join(dataDir, "migration-reports", "004-g");
  await mkdir(path.dirname(databasePath), { recursive: true });
  await mkdir(reportDir, { recursive: true });

  const before = await inspectDatabase(databasePath);
  let adoptedLegacyBaseline = false;

  if (!before.fresh && !before.hasMigrationTable) {
    assertRecognizedLegacyBaseline(before.tables);
    if (!enabled("MINNE_ALLOW_LEGACY_BASELINE_ADOPTION")) {
      throw new Error(
        "Existing pre-004-A database detected without Prisma migration history. Set MINNE_ALLOW_LEGACY_BASELINE_ADOPTION=true only for the controlled one-time adoption path after reviewing the 004-G evidence."
      );
    }

    console.log("Existing pre-004-A database detected; creating and rehearsing a restorable backup before baseline adoption...");
    runBackupAndRestoreRehearsal(reportDir);
    run("npx", ["prisma", "migrate", "resolve", "--applied", BASELINE]);
    adoptedLegacyBaseline = true;
  }

  console.log("Applying checked-in Prisma migrations...");
  deployMigrations();

  if (enabled("SEED_ON_START")) {
    console.log("Seeding database before semantic reconciliation...");
    run("npx", ["tsx", "prisma/seed.ts"]);
  }

  if (enabled("MINNE_RUN_SEMANTIC_BACKFILLS", true)) {
    console.log("Running idempotent semantic backfills...");
    runSemanticBackfills(reportDir);
  }

  const after = await inspectDatabase(databasePath);
  if (!after.hasMigrationTable) {
    throw new Error("Deployment bootstrap completed without Prisma migration history.");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        databasePath,
        adoptedLegacyBaseline,
        migrationHistoryPresent: after.hasMigrationTable,
        semanticBackfillsRun: enabled("MINNE_RUN_SEMANTIC_BACKFILLS", true),
      },
      null,
      2
    )
  );
}

await main();
