import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "prisma/migrations/migration_lock.toml",
  "prisma/migrations/20260904000000_baseline/migration.sql",
  "prisma/migrations/20260904001000_add_reconciliation_foundation/migration.sql",
  "prisma/migrations/README.md",
  "lib/concept-design/implementation-gates.ts",
];

const requiredSchemaTokens = [
  "model AvailabilityWindow",
  "model SelectionDecision",
  "model WithdrawalRecord",
  "model CapacityPool",
  "model CapacityAllocation",
  "model CoverageTarget",
  "model TermState",
  "model RevisionTerm",
  "model DeliverableRequirement",
  "model DeliverableAssessment",
  "model ControlledDisclosure",
  "model Publication",
  "model PublicationState",
  "model ArchiveRecord",
  "model SynchronizationWork",
  "model DispatchAttempt",
  "model MigrationRun",
  "model MigrationIssue",
  "currentRevisionId String?",
  "submissionRevisionId String?",
];

const requiredPackageScripts = [
  "db:migrate:dev",
  "db:migrate:deploy",
  "db:migrate:status",
  "db:migrate:baseline:resolve",
  "db:migration:verify",
  "db:migration:report",
  "db:backup",
  "db:restore:rehearse",
];

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

const failures = [];

for (const file of requiredFiles) {
  try {
    await text(file);
  } catch {
    failures.push(`missing required file: ${file}`);
  }
}

const schema = await text("prisma/schema.prisma");
for (const token of requiredSchemaTokens) {
  if (!schema.includes(token)) {
    failures.push(`schema is missing required 004-A token: ${token}`);
  }
}

const packageJson = JSON.parse(await text("package.json"));
for (const script of requiredPackageScripts) {
  if (!packageJson.scripts?.[script]) {
    failures.push(`package.json is missing required script: ${script}`);
  }
}

const migrationLock = await text("prisma/migrations/migration_lock.toml");
if (!migrationLock.includes('provider = "sqlite"')) {
  failures.push("migration_lock.toml must lock the sqlite provider");
}

const baseline = await text(
  "prisma/migrations/20260904000000_baseline/migration.sql"
);
for (const targetTable of [
  "SelectionDecision",
  "ControlledDisclosure",
  "PublicationState",
  "SynchronizationWork",
]) {
  if (baseline.includes(`CREATE TABLE \"${targetTable}\"`)) {
    failures.push(
      `baseline must represent the pre-004-A schema and must not create ${targetTable}`
    );
  }
}

const additive = await text(
  "prisma/migrations/20260904001000_add_reconciliation_foundation/migration.sql"
);
for (const targetTable of [
  "SelectionDecision",
  "ControlledDisclosure",
  "PublicationState",
  "SynchronizationWork",
]) {
  if (!additive.includes(`CREATE TABLE \"${targetTable}\"`)) {
    failures.push(`additive migration does not create ${targetTable}`);
  }
}

const gates = await text("lib/concept-design/implementation-gates.ts");
for (const gate of [
  "MINNE_V0_WRITE_REVISION_EVALUATION",
  "MINNE_V0_WRITE_SELECTION_PARTICIPATION",
  "MINNE_V0_WRITE_LIFECYCLE_DISCLOSURE",
  "MINNE_V0_WRITE_PUBLICATION",
  "MINNE_V0_WRITE_SCHEDULE",
  "MINNE_V0_WRITE_DISPATCH",
  "MINNE_V0_SEMANTIC_READS",
]) {
  if (!gates.includes(gate)) {
    failures.push(`implementation gate is missing: ${gate}`);
  }
}

if (failures.length > 0) {
  console.error("004-A migration foundation verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("004-A migration foundation verification passed.");
