# Prisma migration discipline

Phase 004-A establishes checked-in Prisma migrations as the persistent-environment schema authority.

## Existing databases

A database created before 004-A already contains the schema represented by `20260904000000_baseline`. Do **not** replay that baseline DDL against the existing database.

After taking and rehearsing a restorable backup, mark the baseline as applied:

```bash
npx prisma migrate resolve --applied 20260904000000_baseline
```

Then inspect status and apply the additive foundation migration:

```bash
npm run db:migrate:status
npm run db:migrate:deploy
```

The additive migration adds nullable target references and new target-history/infrastructure tables. It does not backfill them and does not move semantic write authority.

## Fresh databases

Fresh persistent/test databases can apply the full checked-in history:

```bash
npm run db:migrate:deploy
npm run db:seed
```

## Local disposable databases

`npm run db:push` remains available only as a convenience for disposable/local experiments. It is not the persistent-environment migration path and must not replace committed migration artifacts.

## Baseline boundary

The baseline DDL reflects the exact pre-004-A schema at the Phase 003-G implementation handoff. Later migrations must remain additive until the explicit legacy-cleanup gate authorizes a destructive change.
