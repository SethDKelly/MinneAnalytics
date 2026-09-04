import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function resolveSqlitePath(databaseUrl) {
  if (!databaseUrl?.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a SQLite file: URL for this backup command.");
  }

  const raw = decodeURIComponent(databaseUrl.slice("file:".length));
  if (path.isAbsolute(raw)) return raw;
  return path.resolve(process.cwd(), "prisma", raw);
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

const source = resolveSqlitePath(process.env.DATABASE_URL);
const sourceStat = await stat(source);
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.resolve(arg("--out-dir") ?? "artifacts/migrations/backups");
const backup = path.join(outDir, `${path.basename(source)}.${timestamp}.bak`);
const manifest = `${backup}.json`;

await mkdir(outDir, { recursive: true });
await copyFile(source, backup);

const copiedStat = await stat(backup);
const sourceHash = await sha256(source);
const backupHash = await sha256(backup);

if (sourceStat.size !== copiedStat.size || sourceHash !== backupHash) {
  throw new Error("Backup copy verification failed; source and backup differ.");
}

await writeFile(
  manifest,
  `${JSON.stringify(
    {
      backupVersion: "004-A.v1",
      createdAt: new Date().toISOString(),
      source,
      backup,
      bytes: copiedStat.size,
      sha256: backupHash,
      applicationCommit: process.env.GITHUB_SHA ?? process.env.APP_COMMIT ?? null,
      note:
        "Capture this backup while writes are quiesced or under a deployment-specific SQLite-safe backup procedure.",
    },
    null,
    2
  )}\n`,
  "utf8"
);

console.log(manifest);
