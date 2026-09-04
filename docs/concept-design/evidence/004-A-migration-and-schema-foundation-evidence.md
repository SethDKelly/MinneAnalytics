# 004-A — Migration & Additive Schema Foundation Evidence

Status: **Implementation evidence**  
Authority: supporting evidence; canonical semantics remain in the Phase 003 OKF nodes.

## Branch provenance

| Item | Value |
|---|---|
| immutable design/reconciliation baseline | `concept-design/v0-discovery` |
| baseline commit | `e50bcea4e70e26e9b9f1a9560ea68b99f0d798bb` |
| implementation branch | `concept-design/v0-implementation` |
| branch creation | exact 003-G baseline commit |

## Migration artifacts

| Artifact | Role |
|---|---|
| `prisma/migrations/migration_lock.toml` | locks Prisma migration provider to SQLite |
| `20260904000000_baseline/migration.sql` | complete pre-004-A schema for fresh DBs and resolve-based adoption of existing DBs |
| `20260904001000_add_reconciliation_foundation/migration.sql` | additive target-history/reference/recovery/migration-evidence schema |
| `prisma/migrations/README.md` | existing-database baseline resolve and fresh-database deployment instructions |

## Additive schema surface

New history/state tables:

- `AvailabilityWindow`
- `SelectionDecision`
- `WithdrawalRecord`
- `CapacityPool`
- `CapacityClassRate`
- `CapacityAllocation`
- `CoverageTarget`
- `TermState`
- `RevisionTerm`
- `DeliverableRequirement`
- `DeliverableAssessment`
- `ControlledDisclosure`
- `Publication`
- `PublicationState`
- `ShareEligibilityChange`
- `ArchiveRecord`

New implementation-infrastructure/evidence tables:

- `SynchronizationWork`
- `DispatchAttempt`
- `MigrationRun`
- `MigrationIssue`

Additive legacy-row references/evidence:

- `Submission.currentRevisionId`
- `Submission.currentSelectionDecisionId`
- `Submission.currentShareEligibilityChangeId`
- `SubmissionRevision.predecessorRevisionId`
- `Score.submissionRevisionId`
- `PresenterFeedback.submissionRevisionId`
- `Theme.currentTermStateId`
- `DeckFile.deliverableId`
- `DeckFile.predecessorArtifactId`
- `DeckFile.currentAssessmentId`
- exact message snapshot fields on `EmailSendRecord`

All fields that require later legacy backfill are nullable at 004-A.

## No-authority-move evidence

004-A changes no existing application route/helper to read or write the new semantic tables.

The only new runtime library surface is `lib/concept-design/implementation-gates.ts`, whose gates default false and are not yet consumed by existing application mutation/read paths.

Existing compatibility fields and writers therefore remain operational during this foundation package. That coexistence is temporary and will be narrowed package-by-package beginning in 004-B.

## Migration/recovery tooling

| Tool | Evidence purpose |
|---|---|
| `scripts/migrations/verify-foundation.mjs` | static baseline/additive/schema/command/gate verification |
| `scripts/migrations/report-baseline.ts` | machine-readable source/target count and gate snapshot |
| `scripts/migrations/sqlite-backup.mjs` | quiesced SQLite copy with size/SHA-256 manifest verification |
| `scripts/migrations/sqlite-restore-rehearsal.mjs` | isolated restore plus `PRAGMA integrity_check` and `foreign_key_check` |

Generated local reports/backups are ignored under `artifacts/migrations/`.

## CI contract

Implementation-branch CI now executes:

```text
npm ci
npm run docs:validate
npm run db:migration:verify
npx prisma validate
npm run lint
npm run build
```

The push trigger includes `concept-design/v0-implementation` so Phase 004 receives continuous verification on its own execution branch.

## Rollback classification

004-A changes are classified as:

- **additive persistent change** — new tables/nullable references may remain safely if application code is rolled back;
- **reversible behavior switch** — none enabled yet;
- **history-bearing irreversible truth** — none yet, because no semantic writer uses the new histories in 004-A;
- **security rollback floor** — none newly activated in 004-A;
- **destructive cleanup** — none.

This makes application-code rollback from 004-A straightforward: the additive schema may remain unused without deleting anything.

## Handoff to 004-B

004-B may begin only after the 004-A CI gate passes. Its first semantic slice will use the exact-reference foundation to backfill/activate:

- `Submission.currentRevisionId`;
- `SubmissionRevision.predecessorRevisionId`;
- `RevisionTerm`;
- `Score.submissionRevisionId` with later uniqueness migration;
- `PresenterFeedback.submissionRevisionId`;
- canonical Revision/Classification/Evaluation write behavior and current compatibility projections.
