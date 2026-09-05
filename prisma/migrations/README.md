# Prisma migration discipline

Phase 004-A establishes checked-in Prisma migrations as the persistent-environment schema authority. Later Phase 004 packages extend that history with bounded semantic-slice migrations and explicit data backfills.

## Existing databases

A database created before 004-A already contains the schema represented by `20260904000000_baseline`. Do **not** replay that baseline DDL against the existing database.

After taking and rehearsing a restorable backup, mark the baseline as applied:

```bash
npx prisma migrate resolve --applied 20260904000000_baseline
```

Then inspect status and apply the checked-in migration chain:

```bash
npm run db:migrate:status
npm run db:migrate:deploy
```

Current ordered history:

1. `20260904000000_baseline` — exact pre-004-A schema baseline;
2. `20260904001000_add_reconciliation_foundation` — additive target structures and references;
3. `20260904002000_revision_classification_evaluation_feedback` — 004-B exact Revision/Evaluation write constraints and metadata;
4. `20260904003000_selection_withdrawal_capacity_deliverable` — 004-C active Capacity and ArtifactVersion concurrency constraints;
5. `20260904004000_availability_archive_authority_disclosure` — 004-D application-policy cutover boundary and current explicit Revision-exception storage.

The 004-D policy tables are implementation state, not new Concept Design concepts. `ConferencePolicyCutover` classifies legacy disclosure relationships conservatively, and `RevisionExceptionPolicy` stores only a current explicit exception rather than an invented edit-permission history.

Schema deployment does not by itself fabricate or reconstruct target history.

## Semantic backfill order

After schema deployment, data transformation proceeds in dependency order:

```bash
npm run db:004-b:vocabulary-backfill -- --apply --environment <env>
npm run db:004-b:backfill -- --apply --environment <env>
npm run db:004-c:backfill -- --apply --environment <env>
npm run db:004-d:backfill -- --apply --environment <env>
```

These backfills emit migration evidence and follow the reconciliation no-fabrication rules. Expected historical unknowns are retained explicitly; blocking defects prevent the affected semantic slice from being treated as cutover-ready.

004-D specifically:

- seeds a canonical Proposal-offer Availability Window only when both durable legacy bounds are valid;
- seeds current Archive closure without substituting migration time for an unknown historical event time;
- creates the disclosure cutover boundary only before native Controlled Disclosure history exists;
- never derives a Revision exception merely from `FEEDBACK_PENDING`;
- reports missing Window bounds for operator definition rather than inventing sentinels.

The CI existing-database rehearsal runs the complete migration chain and these backfills in the order above.

## Fresh databases

Fresh persistent/test databases can apply the full checked-in history:

```bash
npm run db:migrate:deploy
npm run db:seed
```

Dedicated 004-B/004-C/004-D verification commands exercise target-native semantics independently of application seed data.

## Local disposable databases

`npm run db:push` remains available only as a convenience for disposable/local experiments. It is not the persistent-environment migration path and must not replace committed migration artifacts.

## Baseline and cleanup boundary

The baseline DDL reflects the exact pre-004-A schema at the Phase 003-G implementation handoff. Subsequent 004-B/004-C/004-D migrations remain non-destructive with respect to legacy compatibility fields and retained history.

Destructive removal of compatibility columns, enums, routes, or historical migration evidence remains prohibited until the explicit 004-G legacy-cleanup gate passes.
