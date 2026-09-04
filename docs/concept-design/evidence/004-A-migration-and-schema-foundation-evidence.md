# 004-A — Migration & Additive Schema Foundation Evidence

Status: **Implementation evidence — gate passed**  
Authority: supporting evidence; canonical semantics remain in the Phase 003 OKF nodes.

## Branch provenance

| Item | Value |
|---|---|
| immutable design/reconciliation baseline | `concept-design/v0-discovery` |
| baseline commit | `e50bcea4e70e26e9b9f1a9560ea68b99f0d798bb` |
| implementation branch | `concept-design/v0-implementation` |
| branch creation | exact 003-G baseline commit |
| discovery baseline recheck | unchanged at `e50bcea4e70e26e9b9f1a9560ea68b99f0d798bb` |

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

## CI gate evidence

GitHub Actions run **33839632346** is the substantive 004-A acceptance run.

The run passed, on one implementation head:

```text
npm ci                                      PASS
npm run docs:validate                       PASS
npm run db:migration:verify                 PASS
npx prisma validate                         PASS
fresh: prisma migrate deploy                PASS
fresh: migration baseline report            PASS
existing DB: migrate resolve baseline       PASS
existing DB: additive migrate deploy        PASS
existing DB: migration baseline report      PASS
npm run lint                                PASS (one pre-existing warning)
npm run build                               PASS
```

The existing-database rehearsal copied `prisma/prisma/dev.db` to an isolated CI database, marked only the pre-004-A baseline as applied, then successfully deployed the additive reconciliation migration. This verifies the documented adoption path as well as the fresh-database path.

An earlier implementation-branch run usefully failed `docs:validate` because two nested OKF indexes still carried frontmatter despite the validator's established convention. Those index files were corrected before the acceptance run.

Another pre-acceptance run exposed that the production build had been pointed at a different empty CI database than the one migrated in the preceding step. CI was corrected to build against the migrated database; the acceptance run then passed the production build.

The remaining lint warning in `lib/schedule/grid.ts` (`_` unused) predates 004-A and does not fail the existing lint contract.

CI also uses branch-scoped concurrency with stale-run cancellation so later implementation packages produce a cleaner newest-head validation trail.

## Rollback classification

004-A changes are classified as:

- **additive persistent change** — new tables/nullable references may remain safely if application code is rolled back;
- **reversible behavior switch** — none enabled yet;
- **history-bearing irreversible truth** — none yet, because no semantic writer uses the new histories in 004-A;
- **security rollback floor** — none newly activated in 004-A;
- **destructive cleanup** — none.

This makes application-code rollback from 004-A straightforward: the additive schema may remain unused without deleting anything.

## Gap closure disposition

No `SG-001`–`SG-018` or `SG-P01`–`SG-P04` item is closed by 004-A. The package supplies implementation infrastructure only; semantic closure still requires the writer/read/backfill/compatibility/runtime evidence defined by each later package.

## Handoff to 004-B

The 004-A CI gate passed. 004-B may now use the exact-reference foundation to backfill/activate:

- `Submission.currentRevisionId`;
- `SubmissionRevision.predecessorRevisionId`;
- `RevisionTerm`;
- `Score.submissionRevisionId` with later exact-subject uniqueness semantics;
- `PresenterFeedback.submissionRevisionId`;
- canonical Revision/Classification/Evaluation write behavior and current compatibility projections.
