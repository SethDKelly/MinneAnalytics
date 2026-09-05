# 004-G — Migration Validation, Rollback Rehearsal & Legacy Cleanup Gate

Status: **Complete**  
Concept model maturity: **v0 specified; implementation execution nearing Phase 004 exit**  
Branch: **`concept-design/v0-implementation`**

## 1. Purpose

004-G is the removal and reversibility gate between semantic cutover and final Phase 004 closure.

004-A through 004-F established:

- checked-in migration history;
- canonical write-side persistence and history;
- authority/lifecycle/disclosure policy;
- Publication, Schedule and Dispatch hardening;
- first-party semantic read cutover.

004-G must prove those results can be deployed and operated safely across fresh and legacy persistent database states, establish a truthful rollback procedure, lock irreversible authority/security floors, and decide whether remaining compatibility structures should be physically deleted.

The package is governed by the existing canonical reconciliation contracts, especially:

- `knowledge/reconciliation/migration-rollout-execution-plan.md`;
- `knowledge/reconciliation/backfill-validation-reversibility-baseline.md`;
- `knowledge/reconciliation/interface-compatibility-baseline.md`;
- `knowledge/reconciliation/implementation-closure-evidence-baseline.md`.

004-G found no runtime evidence requiring amendment of those canonical targets.

## 2. Central decision

004-G accepts the following distinction as the implementation gate result:

> **Legacy semantic authority is retired; physical compatibility is intentionally retained.**

No destructive Prisma migration or schema contraction is introduced in this package.

This is deliberate rather than incomplete cleanup. Retained compatibility projections now have two bounded purposes:

1. controlled semantic-read rollback after canonical-to-compatibility repair;
2. compatibility for external or historical consumers whose absence cannot be proven from repository evidence alone.

Those uses do not make the projections co-authoritative.

## 3. Deployment defect: persistent startup still used `prisma db push`

The initial 004-G audit found that the production container entrypoint still invoked `prisma db push`.

That contradicted the 004-A migration discipline because persistent schema evolution could bypass the checked-in migration chain and make migration/rollback evidence non-reproducible.

004-G removes `db push` from runtime startup and introduces `scripts/migrations/deploy-bootstrap.mjs` as the persistent deployment path.

`npm run db:push` remains available only for explicitly disposable/local experiments.

## 4. Deployment bootstrap classification

The bootstrap classifies the SQLite database before changing it.

### Fresh database

- apply the complete checked-in migration chain;
- optionally seed only when explicitly requested;
- run dependency-ordered semantic backfills.

### Migration-managed database

- run `prisma migrate deploy`;
- run idempotent semantic backfills.

### Recognized pre-004-A database without migration history

- require explicit legacy-baseline-adoption authorization;
- take and rehearse a restorable backup;
- mark only the exact baseline migration as already applied;
- apply subsequent checked-in migrations;
- run all semantic backfills.

### Unrecognized non-empty database

- fail closed.

The bootstrap does not guess which schema generation an unknown database represents.

## 5. Legacy baseline adoption is exceptional

Existing pre-004-A databases require:

```text
MINNE_ALLOW_LEGACY_BASELINE_ADOPTION=true
```

The AWS dev Terraform variable and manual workflow input default to `false`.

This means ordinary deployments cannot silently normalize baseline adoption. If the current EFS database predates migration history, the first migration-safe deployment intentionally fails until the operator explicitly authorizes the one-time adoption path.

After `_prisma_migrations` exists, the exception is no longer needed.

## 6. Backup/restore before adoption

A recognized legacy database is not baselined merely because its table names look familiar.

Before `prisma migrate resolve`, the deployment bootstrap:

1. creates a SQLite backup;
2. restores that backup to a rehearsal database;
3. verifies the restored copy;
4. only then permits baseline resolution and forward migration.

This converts the Phase 003-F recovery requirement into executable deployment behavior.

## 7. Fresh-only seed rule

The previous deployment mechanism could request seed on container startup without an explicit database-freshness invariant.

004-G changes that rule:

- `SEED_ON_START=true` on a truly fresh database is permitted;
- the same setting on a non-empty database fails closed.

The demo seed cannot therefore become an accidental destructive migration mechanism for a persistent environment.

## 8. Deployment artifact contains migration capability

The runner image now includes the source and dependencies required by migration/bootstrap execution:

- Prisma schema and migrations;
- semantic migration/backfill scripts;
- required `lib/` implementation modules;
- TypeScript runtime configuration;
- Node dependencies needed by Prisma/tsx/backfills.

The Docker build itself is part of CI so image packaging cannot silently diverge from host-based tests.

## 9. Disposable build database

Next.js static generation contains database-backed routes such as `/upcoming`.

A Docker build must therefore compile against a schema compatible with the current application without depending on a checked-in legacy fixture or the future runtime database.

004-G makes the builder:

1. create a disposable SQLite build database;
2. apply the full checked-in migration chain;
3. run the production Next.js build;
4. delete the disposable database before runner-image assembly.

No build-time state is promoted into `/data` or the runtime EFS volume.

## 10. Docker context discipline

Terraform validation creates nested `.terraform` working directories containing provider binaries.

004-G discovered these directories could enter the Docker context because only a top-level Terraform path had previously been excluded.

`.dockerignore` now excludes nested Terraform working state and Terraform state files. The validated Docker context fell from hundreds of megabytes during the failed packaging attempt to a few megabytes on the corrected build path.

This is deployment hygiene, not semantic cleanup, but it removes accidental infrastructure artifacts from the application image boundary.

## 11. SQLite quiescence during deployment

The current AWS dev topology uses one ECS task with SQLite persisted on shared EFS.

A normal rolling replacement could start the new task and its migration bootstrap while the old task was still accepting writes.

004-G changes the service deployment limits to stop the old task before starting the replacement task.

For the current single-task dev topology:

```text
old task stops
    ↓
shared SQLite is quiescent
    ↓
new task mounts EFS
    ↓
migration/bootstrap/backfill
    ↓
application starts
```

This deliberately trades brief dev downtime for database correctness.

The design does not authorize multi-writer horizontally scaled SQLite.

## 12. Dev workflow no longer stages nginx

The prior dev deploy workflow temporarily applied Terraform with the default nginx image simply to ensure infrastructure/ECR existed before the real application image was built.

That behavior could unnecessarily replace application state during every deployment and obscured the actual quiescence contract.

004-G changes the workflow to target only the ECR repository before image creation, then performs the real full Terraform apply with the actual application image.

## 13. Canonical writer rollback floors

The Phase 004 implementation gates were useful while canonical writers were being introduced, but after history-bearing cutover they were unsafe as rollback switches.

Setting a write flag to false could otherwise reactivate legacy mutation code that:

- overwrites Evaluation history;
- collapses Selection and Withdrawal into status;
- bypasses Publication security/history;
- directly rewrites Schedule placements;
- weakens Dispatch idempotency/evidence.

004-G changes central gate semantics so all canonical writer gates remain logically enabled regardless of environment values.

The old environment names may remain for deployment compatibility, but they can no longer restore legacy writer authority.

## 14. Semantic reads remain deliberately reversible

`MINNE_V0_SEMANTIC_READS` remains the one intentional Phase 004 rollback switch.

It defaults to enabled after 004-F but may be explicitly disabled for a controlled read rollback.

A read rollback is valid only after compatibility projections are repaired from canonical truth and parity has been checked.

It never disables canonical writers.

## 15. Canonical-to-compatibility repair

004-G introduces `lib/concept-design/compatibility-repair.ts`.

The repair function projects canonical state into retained compatibility surfaces:

- current Revision → mutable current Submission content + ordinal;
- current Revision Classification → `SubmissionTheme`;
- Selection + Withdrawal → `programStatus`;
- exact current ArtifactVersion + Assessment → `deckStatus`;
- ShareEligibilityChange → `deckShareable`.

It does not modify canonical owners or create missing history.

Submissions without a canonical Revision are reported/skipped rather than fabricated.

## 16. Operator rollback procedure

The bounded operational command is:

```bash
npm run db:004-g:repair-compatibility -- --apply --conference-id <id>
```

or, with deliberate all-environment scope:

```bash
npm run db:004-g:repair-compatibility -- --apply --all
```

Supported read rollback procedure:

1. take an appropriate operational backup when working on persistent data;
2. run canonical-to-compatibility repair;
3. validate parity/legacy-unknown classifications;
4. set only `MINNE_V0_SEMANTIC_READS=false`;
5. leave canonical writers and exact Publication authorization enabled.

Re-enabling semantic reads requires no reverse reconstruction because canonical history never stopped being authoritative.

## 17. Adversarial rollback verification

`scripts/migrations/verify-004-g.ts` deliberately corrupted:

- current Submission content;
- technical level;
- current ordinal;
- `programStatus`;
- `deckStatus`;
- `deckShareable`;
- current `SubmissionTheme`.

After repair it proved compatibility again matched canonical state.

It also proved the repair did not change:

- Revision history count or head;
- Selection Decision history count;
- exact ArtifactVersion Assessment history;
- ShareEligibilityChange history;
- current ArtifactVersion head.

The repair was then repeated successfully to demonstrate operational idempotency.

## 18. Read rollback verification

The same verifier disabled semantic reads after repair and proved the compatibility fallback still represented the same current:

- Revision content;
- Selection/effective participation;
- Deliverable readiness;
- sharing eligibility;
- Classification.

This is the concrete evidence that retained compatibility storage still has useful rollback value.

## 19. Irreversible public-authorization floor

004-E established a Publication cutover after which exact Publication state—not mutable parent status—authorizes public deck access.

004-G verifies that disabling semantic reads does not weaken this rule.

Exact Publication authorization remains active across read rollback.

This security floor has no compatibility rollback path.

## 20. Cleanup inventory result

Detailed disposition is recorded in:

- `evidence/004-G-legacy-consumer-and-removal-decision-matrix.md`.

The matrix separates:

- dangerous authority mechanics that should be retired now;
- compatibility projections worth retaining;
- compatibility endpoints that should remain canonical adapters;
- historical/migration residue that should remain until a later explicit compatibility window closes.

## 21. Cleanup approved in 004-G

004-G authorizes and implements retirement of:

- production `prisma db push`;
- writer feature flags as rollback authority;
- destructive seed against existing persistent data;
- automatic/unreviewed legacy baseline adoption;
- concurrent old/new ECS application writers during SQLite migration;
- placeholder nginx application replacement in the deploy workflow;
- Docker builds that depend on an unmigrated or checked-in runtime fixture;
- Terraform working state entering the Docker image context.

These are authority/deployment hazards, not useful compatibility surfaces.

## 22. Cleanup explicitly not approved

004-G does not authorize physical deletion of:

- `programStatus`;
- `abstractVersion`;
- mutable current Submission content projections;
- `SubmissionTheme`;
- `deckStatus`;
- `deckShareable`;
- `abstractReviewStatus`;
- historical ordinal migration fields;
- `DeckStatus.REVIEWED`;
- compatibility API routes such as `program-status` or `deck-status`;
- migration/backfill scripts;
- the legacy migration rehearsal fixture;
- semantic read rollback support.

There is no positive evidence that deleting these now creates more value than the rollback, audit, and external-compatibility options they preserve.

## 23. Compatibility routes become adapters, not authority

The first-party UI no longer depends on generic `program-status` or `deck-status` commands.

However, repository evidence cannot prove that no external caller uses those URLs.

Their correct 004-G disposition is therefore:

```text
legacy-shaped API
    ↓
canonical adapter
    ↓
canonical history-bearing writer
```

not URL deletion and not independent legacy mutation.

Historical fallback branches behind writer gates are configuration-unreachable after 004-G and can be removed later as ordinary dead-code maintenance without changing semantic authority.

## 24. No destructive migration required

The 004-F→004-G implementation delta contains no new Prisma migration and no `schema.prisma` contraction.

This is an accepted outcome of the cleanup gate.

The schema may contain compatibility and historical residue while still having one semantic authority model. Concept Design does not require physical persistence minimalism when retained projections have bounded operational value.

## 25. CI evidence

Runtime verification completed successfully on GitHub Actions run **33939176607** at head:

`35201c666beacd85f0bc7093a457c506aa05d743`

The run passed:

1. OKF validation;
2. Terraform formatting/init/validation;
3. migration-foundation verification;
4. Prisma validation;
5. fresh six-migration deployment;
6. migration reporting;
7. all 004-B through 004-F semantic verification;
8. 004-G rollback/projection/writer-floor verification;
9. bounded compatibility repair CLI execution;
10. fresh deployment bootstrap;
11. legacy-database backup/restore/baseline-adoption/backfill rehearsal;
12. migration-status validation;
13. lint;
14. optimized production application build;
15. production Docker image build.

Detailed evidence is in:

- `evidence/004-G-cross-environment-migration-and-rollback-evidence.md`.

## 26. Live AWS limitation

004-G validates the code, deployment topology, migration bootstrap, legacy fixture, and image in CI.

It does **not** deploy this branch to the current AWS dev environment and does not inspect or mutate the current EFS database.

Therefore this phase does not claim:

- that the live EFS database already has `_prisma_migrations`;
- that a live EFS backup was taken;
- that the one-time legacy adoption path has been executed against AWS.

The first real deployment will classify the database and fail closed if an explicit legacy baseline adoption is required.

## 27. Phase 003 gap effect

004-G supplies cross-environment migration, rollback-floor, residual-consumer, and cleanup evidence needed before final closure accounting.

It materially closes the implementation evidence dependency for:

- truthful backfill and unknown handling;
- one-way compatibility after canonical write cutover;
- semantic read rollback;
- writer rollback prohibition;
- exact Publication security floor preservation;
- destructive cleanup gating;
- deployment migration authority;
- residual compatibility disposition.

Individual SG/SG-P items are not globally marked `verified-closed` here because 004-H owns the final consolidated closure register and Phase 004 exit decision.

## 28. Exit decision

004-G passes because:

- fresh and recognized legacy database deployment paths are executable and verified;
- legacy adoption is backup/recovery-gated and explicit;
- persistent startup uses checked-in migrations rather than `db push`;
- semantic backfills execute in dependency order;
- writer authority cannot be rolled back by configuration;
- semantic-read rollback is executable and proven without canonical-history mutation;
- exact Publication authorization survives rollback;
- SQLite migration deployment is quiesced for the current single-task dev topology;
- the production application and deployment image both build successfully;
- compatibility surfaces have explicit retain/remove decisions;
- no destructive schema cleanup is justified or required.

Next package:

> **004-H — Phase 004 Consolidation & v0 Implementation Exit Review**
