# 004-G — Cross-Environment Migration & Rollback Evidence

Status: **Verified**  
Branch: **`concept-design/v0-implementation`**  
Runtime verification head: **`35201c666beacd85f0bc7093a457c506aa05d743`**  
GitHub Actions run: **`33939176607`**

## 1. Evidence purpose

This artifact records the executable evidence used by 004-G to decide whether the Phase 004 migration/cutover architecture is safe enough to retire legacy semantic authority and whether any physical compatibility cleanup is justified.

It is evidence, not a replacement for the canonical migration, compatibility, reversibility, or implementation-closure contracts under `docs/concept-design/knowledge/reconciliation/`.

## 2. Persistent-schema authority

004-G verified that persistent runtime startup no longer uses `prisma db push`.

The container entrypoint executes `scripts/migrations/deploy-bootstrap.mjs`, which:

1. identifies a fresh, migration-managed, or recognized pre-004-A SQLite database;
2. fails closed for unrecognized non-empty databases;
3. applies checked-in Prisma migrations with `prisma migrate deploy`;
4. performs the dependency-ordered 004-B through 004-E semantic backfills;
5. permits seed only for a truly fresh database;
6. emits deployment/bootstrap state explaining what occurred.

This makes the checked-in migration history the persistent-environment schema authority established by 004-A.

## 3. Fresh-database deployment path

CI rehearsed the same deployment bootstrap used by the container against an empty database.

Observed result:

- all six checked-in migrations applied successfully;
- migration history was present afterward;
- semantic backfills ran successfully in dependency order;
- no baseline adoption was reported;
- no seed was required for verification.

The bootstrap is therefore valid for a newly provisioned persistent database without using `db push`.

## 4. Existing pre-004-A database adoption

CI also rehearsed the deployment bootstrap against the checked-in pre-004-A SQLite fixture.

The path required explicit legacy-adoption authorization and then executed:

```text
recognize legacy structural baseline
        ↓
create SQLite backup
        ↓
restore backup to rehearsal copy and verify integrity
        ↓
resolve 20260904000000_baseline as applied
        ↓
prisma migrate deploy
        ↓
004-B Vocabulary backfill
        ↓
004-B Revision / Classification / Evaluation / Feedback backfill
        ↓
004-C Selection / Withdrawal / Capacity / Deliverable backfill
        ↓
004-D Availability / Archive / Disclosure backfill
        ↓
004-E Publication / Schedule / Dispatch backfill
        ↓
prisma migrate status
```

The final migration status reported the database schema up to date.

The bootstrap refuses this adoption path when `MINNE_ALLOW_LEGACY_BASELINE_ADOPTION` is false. AWS dev therefore defaults to fail-closed behavior; a recognized legacy EFS database requires an explicit one-time manually dispatched adoption deployment.

## 5. Backup and restore rehearsal

Legacy baseline adoption is coupled to backup evidence rather than a documentation-only instruction.

Before `migrate resolve`, the bootstrap invokes the existing SQLite backup tooling and then the restore-rehearsal tool against the created backup. CI observed a successful restored-database report before baseline resolution was allowed to continue.

This verifies that adoption does not begin from an unrehearsed backup assumption.

It does **not** mean a backup of the current live AWS EFS database has been taken in this phase; 004-G did not mutate or inspect the live AWS data volume.

## 6. Seed safety

`SEED_ON_START=true` is now allowed only when the bootstrap observed a genuinely fresh database before migration deployment.

A non-empty existing database plus `SEED_ON_START=true` fails closed rather than executing the destructive demo seed against persistent data.

This converts seeding from a general startup side effect into an explicit fresh-environment operation.

## 7. Canonical-to-compatibility projection repair

004-G introduced `repairConferenceCompatibilityProjections()` and the bounded operator command:

```bash
npm run db:004-g:repair-compatibility -- --apply --conference-id <id>
```

or, after deliberate scope review:

```bash
npm run db:004-g:repair-compatibility -- --apply --all
```

The repair reads canonical owners and rewrites only retained compatibility projections:

- current Submission title/abstract/bio/technical level from the exact current Revision;
- `abstractVersion` from the current Revision ordinal;
- `SubmissionTheme` from exact current Revision Classification;
- `programStatus` from current Selection plus Withdrawal;
- `deckStatus` from current ArtifactVersion plus Assessment;
- `deckShareable` from current ShareEligibilityChange.

It never reconstructs canonical history from those compatibility values.

CI executed the operator CLI successfully after the dedicated 004-G verifier.

## 8. Adversarial rollback rehearsal

`scripts/migrations/verify-004-g.ts` established canonical state and then deliberately corrupted compatibility state, including:

- current mutable Submission content;
- technical level;
- `abstractVersion`;
- `programStatus`;
- `deckStatus` with the non-canonical `REVIEWED` residue;
- `deckShareable`;
- `SubmissionTheme`.

The verifier then ran canonical-to-compatibility repair and proved:

- current compatibility content again matched the exact current Revision;
- `abstractVersion` matched the current Revision ordinal;
- `programStatus` again projected Selection + Withdrawal;
- `deckStatus` again projected exact current ArtifactVersion readiness;
- `deckShareable` again projected current sharing eligibility;
- current `SubmissionTheme` again projected exact current Revision Classification.

## 9. Canonical history preservation under repair

The same verifier captured canonical history counts before and after projection repair.

Verified unchanged:

- Revision history: **2** rows;
- Selection Decision history: **1** row;
- Deliverable Assessment history for the exact artifact: **1** row;
- ShareEligibilityChange history: **1** row.

It also repeated the repair and verified that neither the current Revision head nor current ArtifactVersion head moved.

Therefore repair is one-way projection reconciliation, not disguised history rewriting.

## 10. Read rollback rehearsal

After repair, the verifier explicitly set:

```text
MINNE_V0_SEMANTIC_READS=false
```

and reloaded the shared semantic read composition.

The read source changed to `compatibility-fallback`, while the repaired compatibility surface still represented the same current:

- Revision content;
- Selection projection;
- effective participation;
- Deliverable readiness;
- sharing eligibility;
- Classification.

This establishes the supported rollback model:

```text
canonical writers stay authoritative
        ↓
repair canonical → compatibility
        ↓
verify parity
        ↓
optionally disable semantic reads
```

Read rollback is therefore not authority rollback.

## 11. Writer rollback floors

The verifier set every historical Phase 004 write feature environment variable to `false` and proved canonical write gates remain logically enabled.

The following gates are no longer rollback switches:

- Revision/Evaluation;
- Selection/Participation;
- Lifecycle/Disclosure;
- Publication;
- Schedule;
- Dispatch.

This prevents configuration drift from reactivating direct legacy mutation paths after history-bearing canonical cutover.

## 12. Public authorization floor

The verifier also proved exact Publication authorization remains active while semantic reads are intentionally rolled back.

A read rollback therefore cannot restore mutable parent-state authorization for public deck access after the 004-E Publication cutover floor.

## 13. SQLite deployment quiescence

AWS dev persists SQLite on shared EFS with one desired ECS task.

004-G changed replacement behavior to:

```text
deployment_minimum_healthy_percent = 0
deployment_maximum_percent         = 100
```

For this single-task dev topology, the old task stops before the replacement task begins its migration/bootstrap sequence.

This deliberately accepts a brief deployment outage so migrations and semantic backfills do not run while the previous application task is still writing the same SQLite database.

This is **not** authorization for horizontally scaled multi-writer SQLite deployment.

## 14. Deployment workflow validation

The dev deployment workflow now:

- initializes Terraform;
- ensures the ECR repository exists without temporarily replacing the application service;
- builds and pushes the actual application image;
- passes the real image to Terraform;
- uses explicit deployment inputs for fresh-only seed and one-time legacy baseline adoption;
- waits for ECS service stability.

CI runs `terraform fmt -check`, `terraform init -backend=false`, and `terraform validate` against this configuration.

## 15. Production image evidence

The Docker build is part of the 004-G CI gate.

The builder creates a disposable SQLite build database, applies the full checked-in migration chain to it, builds Next.js against that schema, and removes the build database before the runner image is assembled.

The final successful Docker build also verified:

- the migration/backfill source needed by runtime is actually present in the image;
- Node/Prisma/tsx dependencies needed by bootstrap are present;
- an optional empty `public/` directory does not break image assembly;
- nested Terraform working state is excluded from the build context;
- the final image can be assembled after the application production build succeeds.

No build-time SQLite data is promoted to the runtime data volume.

## 16. Complete CI result

GitHub Actions run **33939176607** at head
`35201c666beacd85f0bc7093a457c506aa05d743` completed successfully.

The gate passed:

1. dependency installation;
2. OKF validation;
3. Terraform formatting/init/validation;
4. migration-foundation verification;
5. Prisma schema validation;
6. complete fresh six-migration deployment;
7. migration reporting;
8. all 004-B semantic verifiers;
9. 004-C verification;
10. 004-D verification;
11. 004-E verification;
12. 004-F adversarial semantic-read verification;
13. 004-G projection-repair/read-rollback/writer-floor verification;
14. the bounded compatibility-repair CLI;
15. fresh deployment-bootstrap rehearsal;
16. recognized legacy-database backup/restore/baseline-adoption/backfill rehearsal;
17. final migration-status validation;
18. lint without warnings/errors;
19. optimized production application build;
20. production Docker image build.

## 17. Environment scope and limitation

This evidence validates the migration and deployment machinery using fresh and checked-in legacy database states in CI.

004-G did **not** deploy `concept-design/v0-implementation` to AWS dev and did not inspect or mutate the current live EFS database. Consequently its current migration-history state remains unknown from this phase's evidence.

When this runtime is first deployed:

- a migration-managed database follows ordinary `migrate deploy` + semantic backfill;
- a truly fresh database follows the fresh bootstrap path;
- a recognized pre-004-A database without `_prisma_migrations` fails closed until a one-time deployment explicitly authorizes baseline adoption.

That limitation is intentional and must not be rewritten as evidence of a live migration that did not occur.
