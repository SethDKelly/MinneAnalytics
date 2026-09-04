import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

const backup = arg("--backup");
if (!backup) {
  throw new Error("Usage: npm run db:restore:rehearse -- --backup <backup-file>");
}

const backupPath = path.resolve(backup);
const manifestPath = `${backupPath}.json`;
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const backupHash = await sha256(backupPath);

if (manifest.sha256 !== backupHash) {
  throw new Error("Backup hash does not match its manifest.");
}

const outDir = path.resolve(arg("--out-dir") ?? "artifacts/migrations/restore-rehearsal");
const restoredPath = path.join(outDir, `${path.basename(backupPath)}.restored.db`);
const reportPath = `${restoredPath}.report.json`;
await mkdir(outDir, { recursive: true });
await copyFile(backupPath, restoredPath);

process.env.DATABASE_URL = `file:${restoredPath}`;
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

let integrityResult;
let foreignKeyResult;
let passed = false;

try {
  integrityResult = await prisma.$queryRawUnsafe("PRAGMA integrity_check");
  foreignKeyResult = await prisma.$queryRawUnsafe("PRAGMA foreign_key_check");
  const integrityText = JSON.stringify(integrityResult).toLowerCase();
  passed = integrityText.includes("ok") && Array.isArray(foreignKeyResult) && foreignKeyResult.length === 0;
} finally {
  await prisma.$disconnect();
}

await writeFile(
  reportPath,
  `${JSON.stringify(
    {
      rehearsalVersion: "004-A.v1",
      rehearsedAt: new Date().toISOString(),
      backup: backupPath,
      restoredPath,
      sha256: backupHash,
      integrityResult,
      foreignKeyResult,
      passed,
    },
    null,
    2
  )}\n`,
  "utf8"
);

if (!process.argv.includes("--keep")) {
  await rm(restoredPath, { force: true });
}

if (!passed) {
  console.error(reportPath);
  process.exit(1);
}

console.log(reportPath);
