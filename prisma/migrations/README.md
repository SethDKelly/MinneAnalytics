# Prisma migration discipline

Phase 004-A establishes checked-in Prisma migrations as the persistent-environment schema authority. Later Phase 004 packages extend that history with bounded semantic-slice migrations and explicit data backfills/reconciliation.

## Persistent deployment bootstrap

Persistent runtime startup uses:

```bash
npm run db:migration:deploy-bootstrap
```

The container entrypoint invokes this command before starting Next.js. Persistent environments must not use `prisma db push` as a schema-deployment substitute.

The bootstrap classifies the SQLite database before mutation:

- **fresh database** — apply the full checked-in migration chain, optionally seed only if explicitly requested, then run semantic backfills;
- **migration-managed database** — apply pending checked-in migrations and run semantic backfills;
- **recognized pre-004-A database without `_prisma_migrations`** — require explicit legacy-baseline-adoption authorization, take and rehearse a restorable backup, resolve the exact baseline as applied, deploy later migrations, then run semantic backfills;
- **unrecognized non-empty database** — fail closed.

`MINNE_ALLOW_LEGACY_BASELINE_ADOPTION=true` is an exceptional one-time authorization, not a normal deployment default. AWS dev defaults it to false and exposes it only as an explicit manual deployment input.

`SEED_ON_START=true` is permitted only when the bootstrap observed a truly fresh database. It fails closed for an existing persistent database.

## Existing databases

A database created before 004-A already contains the schema represented by `20260904000000_baseline`. Do **not** replay that baseline DDL against the existing database.

The preferred persistent adoption path is the deployment bootstrap above because it couples baseline adoption to backup/restore rehearsal and structural recognition.

For controlled manual recovery/inspection, after taking and rehearsing a restorable backup, the equivalent baseline operation is:

```bash
npx prisma migrate resolve --applied 20260904000000_baseline
```

Then inspect status and apply the checked-in migration chain:

```bash
npm run db:migrate:status
npm run db:migrate:deploy
```

Current ordered schema history:

1. `20260904000000_baseline` — exact pre-004-A schema baseline;
2. `20260904001000_add_reconciliation_foundation` — additive target structures and references;
3. `20260904002000_revision_classification_evaluation_feedback` — 004-B exact Revision/Evaluation write constraints and metadata;
4. `20260904003000_selection_withdrawal_capacity_deliverable` — 004-C active Capacity and ArtifactVersion concurrency constraints;
5. `20260904004000_availability_archive_authority_disclosure` — 004-D application-policy cutover boundary and current explicit Revision-exception storage;
6. `20260904005000_publication_schedule_dispatch_hardening` — 004-E exact-publication rollback floor, SYNC-008 source-transaction enqueue bridges, and Dispatch same-round semantic uniqueness.

004-H required no new schema migration because the additive Phase 004 foundation already contained `CoverageTarget`; the exit review corrected its runtime authority and added a final data reconciliation pass.

The 004-D/004-E cutover tables are implementation policy/infrastructure rather than new Concept Design concepts. `PublicationPolicyCutover` marks the point after which a Conference may no longer fall back to mutable parent-state authorization for public deck tokens.

Schema deployment does not by itself fabricate or reconstruct target history.

## Semantic backfill/reconciliation order

After schema deployment, data transformation proceeds in dependency order:

```bash
npm run db:004-b:vocabulary-backfill -- --apply --environment <env>
npm run db:004-b:backfill -- --apply --environment <env>
npm run db:004-c:backfill -- --apply --environment <env>
npm run db:004-d:backfill -- --apply --environment <env>
npm run db:004-e:backfill -- --apply --environment <env>
npm run db:004-h:backfill -- --apply --environment <env>
```

The deployment bootstrap runs these same idempotent reconciliation steps by default after migration deployment.

These commands emit migration evidence and follow the reconciliation no-fabrication rules. Expected historical unknowns are retained explicitly; blocking defects prevent the affected semantic slice from being treated as cutover-ready.

004-D specifically seeds only truthful Window/Archive state and establishes the disclosure cohort boundary without fabricating edit exceptions or protected-information history.

004-E specifically:

- seeds `ShareEligibilityChange` only as a current policy observation from legacy `deckShareable`; actor/time and presenter consent are not invented;
- when the legacy collection is currently published, seeds only the exact current ArtifactVersions whose canonical participation, sharing and READY evidence support present exposure;
- never creates exact Publication history for superseded deck versions merely because their `publicId` exists;
- leaves historical rendered Dispatch messages unknown when legacy SendRecords do not contain their exact content;
- validates existing Schedule placements against canonical effective participation without fabricating generator acceptance history;
- records Publication cutover only after current-state reconciliation so public-token authorization cannot later fall back to mutable parent state.

004-H specifically reconciles Coverage Target authority:

- an existing canonical `CoverageTarget` wins over compatibility Theme bounds and repairs that projection if needed;
- legacy `targetMin=0,targetMax=0` means no explicit target and does not create a zero-width target;
- coherent nonzero legacy bounds may seed one `BACKFILLED_CURRENT_STATE` target;
- incoherent bounds are blocking defects rather than guessed policy;
- historical target transitions are not fabricated.

CI rehearses both a fresh deployment bootstrap and the complete recognized legacy-database backup/adoption/migration/reconciliation path.

## Fresh databases

Fresh persistent/test databases can apply the full checked-in schema history directly:

```bash
npm run db:migrate:deploy
```

For a fresh deployed runtime, prefer `db:migration:deploy-bootstrap`; it owns the same migration chain and optional fresh-only seed behavior plus the full semantic reconciliation sequence.

Dedicated 004-B/004-C/004-D/004-E/004-F/004-G/004-H verification commands exercise target-native semantics independently of application seed data.

## Controlled semantic-read rollback

Canonical writers are no longer rollback switches after 004-G. Historical `MINNE_V0_WRITE_*` variables cannot reactivate legacy writer authority.

If semantic reads must be rolled back temporarily:

1. take the operational backup appropriate to the environment;
2. repair retained compatibility projections from canonical truth:

   ```bash
   npm run db:004-g:repair-compatibility -- --apply --conference-id <id>
   ```

   or, after explicit all-scope review:

   ```bash
   npm run db:004-g:repair-compatibility -- --apply --all
   ```

3. validate parity and investigate defects/legacy-unknowns;
4. set only:

   ```text
   MINNE_V0_SEMANTIC_READS=false
   ```

5. leave canonical writers enabled and exact Publication authorization intact.

Projection repair is one-way canonical → compatibility. It must never reconstruct or overwrite canonical history from compatibility fields.

## AWS dev SQLite deployment rule

AWS dev currently runs a single ECS task with SQLite stored on EFS.

The ECS replacement policy intentionally stops the old task before the replacement task begins bootstrap/migration. This accepts a brief deployment outage so schema/backfill work runs against a quiesced SQLite database.

This migration posture does not authorize horizontally scaled multi-writer SQLite operation.

## Local disposable databases

`npm run db:push` remains available only as a convenience for disposable/local experiments. It is not the persistent-environment migration path and must not replace committed migration artifacts.

## Phase 004 exit and cleanup boundary

The baseline DDL reflects the exact pre-004-A schema at the Phase 003-G implementation handoff. Subsequent Phase 004 migrations remain non-destructive with respect to legacy compatibility fields and retained history.

004-G passed the legacy-authority cleanup gate **without** authorizing destructive schema contraction. 004-H subsequently closed all SG/SG-P items without changing that decision.

Retained compatibility projections remain subordinate, repairable rollback/external-compatibility surfaces rather than semantic authorities.

Physical removal of retained columns, enum residue, API compatibility routes, or migration evidence requires a later explicit compatibility/deprecation decision with evidence that their rollback and external-consumer value has expired.

Phase 004 semantic implementation closure does not itself assert that the current live AWS EFS database has already executed the migration/bootstrap path.