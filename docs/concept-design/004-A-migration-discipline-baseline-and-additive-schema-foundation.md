# 004-A — Migration Discipline, Baseline & Additive Schema Foundation

Status: **Complete**  
Concept model maturity: **v0 specified; implementation execution in progress**  
Branch: **`concept-design/v0-implementation`**  
Design baseline: `concept-design/v0-discovery` at 003-G commit `e50bcea4e70e26e9b9f1a9560ea68b99f0d798bb`

## 1. Purpose

004-A is the first bounded runtime implementation package authorized by the [003-G Implementation Reconciliation Gate](knowledge/decisions/003-g-implementation-reconciliation-gate.md).

It establishes the migration and schema substrate required by later semantic cutovers. It does **not** move Proposal/Revision/Evaluation/Selection/Withdrawal/Publication or any other concept's write/read authority.

Canonical execution requirements remain in:

- [v0 Implementation Execution Handoff](knowledge/reconciliation/implementation-execution-handoff.md);
- [v0 Migration, Backfill & Rollout Execution Plan](knowledge/reconciliation/migration-rollout-execution-plan.md);
- [v0 Backfill, Validation & Reversibility Baseline](knowledge/reconciliation/backfill-validation-reversibility-baseline.md).

## 2. Branch boundary

A dedicated branch was created from the exact 003-G gate commit:

```text
concept-design/v0-discovery @ e50bcea...
              |
              +--> concept-design/v0-implementation
```

The discovery branch remains the immutable v0 design/specification/reconciliation baseline. Runtime implementation proceeds only on the implementation branch.

## 3. Migration discipline implemented

The repository now contains checked-in Prisma migration history:

```text
prisma/migrations/
├── migration_lock.toml
├── 20260904000000_baseline/
│   └── migration.sql
├── 20260904001000_add_reconciliation_foundation/
│   └── migration.sql
└── README.md
```

### Baseline migration

`20260904000000_baseline` represents the exact pre-004-A Prisma schema from the Phase 003-G handoff.

Existing databases that already contain that schema are adopted with:

```bash
npm run db:migrate:baseline:resolve
```

before applying later committed migrations.

Fresh databases can apply the full migration chain normally.

### Additive foundation migration

`20260904001000_add_reconciliation_foundation` adds only new nullable references, new target-history/state tables, migration evidence infrastructure, and supporting indexes/checks.

It intentionally does not drop or reinterpret existing compatibility fields.

## 4. Additive target schema implemented

Existing stable identities remain in place while the schema gains the structures required by 003-B/003-C/003-D/F1.

### Exact-reference foundation

Added nullable foundation references for later backfill/cutover:

- `Submission.currentRevisionId`;
- `SubmissionRevision.predecessorRevisionId`;
- `Score.submissionRevisionId`;
- `PresenterFeedback.submissionRevisionId`;
- exact `RevisionTerm` relation;
- Deliverable/ArtifactVersion linkage and predecessor/current-assessment references;
- current Selection and share-eligibility compatibility pointers.

All remain unpopulated until the applicable backfill package validates legacy evidence.

### New durable semantic-history/state structures

Added persistence foundations for:

- `AvailabilityWindow`;
- `SelectionDecision`;
- `WithdrawalRecord`;
- `CapacityPool`, `CapacityClassRate`, and `CapacityAllocation`;
- `CoverageTarget`;
- `TermState`;
- `RevisionTerm`;
- `DeliverableRequirement` and `DeliverableAssessment`;
- `ControlledDisclosure`;
- `Publication` and `PublicationState`;
- `ShareEligibilityChange`;
- `ArchiveRecord`.

These tables exist structurally only in 004-A. No application route/service writes them yet.

### Recovery/provider infrastructure

Added implementation infrastructure required by 003-C:

- `SynchronizationWork` with semantic `(syncId, sourceRef, effectKey)` uniqueness;
- `DispatchAttempt` for prepared/provider-attempt state;
- optional exact rendered subject/body/content hash on `EmailSendRecord`.

This infrastructure is not a Workflow or domain concept.

### Migration evidence infrastructure

Added:

- `MigrationRun`;
- `MigrationIssue`;
- canonical `MigrationProvenance` values: `NATIVE`, `BACKFILLED_HISTORICAL`, `BACKFILLED_CURRENT_STATE`, `LEGACY_UNKNOWN`.

Backfill implementation in later packages may use database rows, generated JSON manifests, or both. Migration-run timestamps remain distinct from unknown historical domain event times.

## 5. Invariants introduced at the database boundary

The additive migration enforces foundational constraints where safe before data exists, including:

- Availability Window `opensAt < closesAt`;
- nonnegative Capacity Pool limit;
- positive Capacity class/allocation units;
- coherent nonnegative Coverage Target bounds with at least one bound;
- predecessor pointers unique where histories are linear;
- exact stable identity uniqueness for Window, Withdrawal, Publication material/surface, Archive, synchronization work, and provider attempt keys.

Later packages still own transactional invariants that cannot be represented sufficiently by static SQLite constraints alone, such as total committed Capacity never exceeding the Pool under concurrency.

## 6. Migration and recovery commands

`package.json` now exposes:

```text
db:migrate:dev
db:migrate:deploy
db:migrate:status
db:migrate:baseline:resolve
db:migration:verify
db:migration:report
db:backup
db:restore:rehearse
```

`db:push` remains only for disposable/local use and is no longer the intended persistent-environment migration authority.

## 7. Migration evidence tooling

### Foundation verification

`scripts/migrations/verify-foundation.mjs` checks that:

- the migration lock/baseline/additive migration exist;
- the baseline does not contain new reconciliation tables;
- the additive migration contains required target tables;
- the Prisma schema contains required target structures;
- required migration/recovery commands exist;
- rollout gate names are present.

### Baseline report

`scripts/migrations/report-baseline.ts` emits a machine-readable JSON snapshot of legacy source counts, additive target-table counts, branch/application identity when available, and rollout-gate state. Output is intentionally ignored under `artifacts/migrations/`.

### SQLite backup/rehearsal

`scripts/migrations/sqlite-backup.mjs` produces a byte/hash-verified SQLite backup plus manifest when used under a quiesced/deployment-safe write posture.

`scripts/migrations/sqlite-restore-rehearsal.mjs` restores a copy and checks SQLite integrity plus foreign-key consistency without overwriting the original database.

These commands provide rehearsal support; a production deployment still owns the actual quiesce/backup mechanics for its host.

## 8. Staged rollout gates

`lib/concept-design/implementation-gates.ts` defines explicit environment-driven gates for later packages:

- Revision/Evaluation writes;
- Selection/participation writes;
- lifecycle/disclosure writes;
- Publication writes;
- Schedule writes;
- Dispatch writes;
- semantic reads.

All gates default to **false** when absent.

004-A does not import these gates into current application routes, so current behavior remains unchanged.

## 9. CI enforcement and exit evidence

CI runs on pushes to `concept-design/v0-implementation` with stale runs cancelled in favor of the newest branch head.

The 004-A substantive gate passed in GitHub Actions run **33839632346**. On the same implementation head, CI successfully completed:

1. dependency installation;
2. OKF documentation validation;
3. 004-A migration foundation verification;
4. `prisma validate`;
5. a **fresh-database** `prisma migrate deploy` applying both the pre-004-A baseline and additive reconciliation migration;
6. machine-readable baseline report generation against the fresh migrated database;
7. an **existing-database adoption rehearsal** by copying the checked-in pre-004-A SQLite fixture, marking the baseline applied with `prisma migrate resolve`, applying the additive migration, and generating the migration report;
8. lint;
9. the optimized Next.js production build using the migrated CI database.

The first implementation-branch CI run also exposed two pre-existing OKF index/frontmatter inconsistencies. `reconciliation/index.md` and `synchronizations/index.md` were corrected to the validator's established nested-index convention before the final gate was accepted.

This turns the implementation branch into a continuously checked execution branch rather than postponing schema validation until a future merge.

## 10. Gap-state effect

004-A does not close any `SG-*` or `SG-P*` semantic/policy gap.

The relevant change in governance state is infrastructure only:

```text
target-designed
    -> implementation foundation available
```

A gap moves to `implementation-in-progress` only when its actual semantic slice begins implementation, and it moves beyond that only under the [Implementation Closure & Evidence Baseline](knowledge/reconciliation/implementation-closure-evidence-baseline.md).

## 11. Non-goals preserved

004-A does not:

- backfill target history;
- enable canonical semantic writers;
- change API/UI reads;
- reinterpret `programStatus`, `abstractReviewStatus`, `deckStatus`, or Conference flags;
- authorize destructive cleanup;
- introduce one table/service/route per concept;
- introduce event sourcing, CQRS, Kafka, or a workflow engine;
- replace SQLite.

## 12. Exit criteria

004-A passes because:

- the implementation branch is rooted at the exact 003-G baseline;
- the discovery branch remains unchanged at that baseline;
- checked-in baseline/additive Prisma migrations exist;
- persistent migration commands and adoption instructions exist;
- additive target schema matches the accepted Phase 003 persistence/recovery foundations;
- migration provenance/reporting support exists;
- backup/restore rehearsal tooling exists;
- semantic rollout gates exist and default off;
- CI validates OKF, migration structure, Prisma schema, fresh migration, existing-database adoption, migration reports, lint, and the production build;
- no semantic authority has moved.

Next package:

> **004-B — Revision, Classification, Evaluation & Feedback Canonicalization**
