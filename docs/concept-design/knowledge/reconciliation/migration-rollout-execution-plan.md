---
type: Migration Rollout Execution Plan
title: MinneAnalytics v0 Migration, Backfill & Rollout Execution Plan
description: Canonical staged execution plan for additive schema expansion, truthful backfill, canonical write/read cutover, compatibility retirement, and non-destructive rollback.
tags: [concept-design, implementation-reconciliation, migration, backfill, rollout, cutover, rollback, v0]
status: stable
authority: canonical
phase: 003-F
sources:
  - { id: phase, resource: ../../003-F-data-migration-backfill-rollout-and-reversibility-plan.md, title: 003-F Data Migration Backfill Rollout & Reversibility Plan }
  - { id: waves, resource: ../../evidence/003-F-migration-wave-and-cutover-matrix.md, title: 003-F Migration Wave & Cutover Matrix }
  - { id: baseline, resource: migration-target-baseline.md, title: MinneAnalytics v0 Migration Target Baseline }
  - { id: persistence, resource: persistence-identity-history-target.md, title: MinneAnalytics v0 Persistence Identity & History Target }
  - { id: execution, resource: synchronization-transaction-recovery-target.md, title: MinneAnalytics v0 Synchronization Transaction & Recovery Target }
  - { id: interfaces, resource: interface-compatibility-baseline.md, title: MinneAnalytics v0 Interface Compatibility & Cutover Baseline }
---
# Purpose

Turn the accepted Phase 003 target architecture into an ordered implementation program without performing the migration in 003-F itself.

This plan owns **execution order and gates**. Concept semantics remain in the Concept Catalog, persistence semantics remain in the 003-B target, transaction/recovery semantics remain in 003-C, policy remains in 003-D, and API/UI compatibility remains in 003-E.

# Governing rollout principles

1. **Expand before contract.** Add target structures and compatibility services before removing legacy fields or behavior.
2. **Backfill only supported truth.** Every migrated row carries or inherits a provenance class; unknown history stays unknown.
3. **Canonical writes precede canonical read authority.** New history must be captured correctly before interfaces depend on it.
4. **Compatibility is one-way after write cutover.** Canonical owners project to legacy fields; legacy fields do not win conflicts.
5. **Security/correctness fixes may establish a rollback floor.** Exact public-material authorization and protected-information non-disclosure must not be weakened merely to restore legacy behavior.
6. **Read rollback is different from authority rollback.** A UI can temporarily read compatibility projections while canonical writes continue; re-enabling independent legacy writers after canonical history exists is not a safe rollback.
7. **Destructive schema cleanup is last.** Removal follows consumer inventory, parity, rollback, and provenance gates.
8. **No big-bang requirement.** Migration proceeds by bounded semantic slices inside the existing Next.js/Prisma application.

# Production migration discipline

The repository currently exposes `prisma db push` and has no checked-in migration history. Target execution therefore establishes a versioned migration discipline before any target schema is deployed to a persistent environment.

Required posture:

- checked-in `prisma/migrations/...` history becomes the deployable schema history;
- developers may use `prisma migrate dev` to create/rehearse migrations in appropriate local environments;
- deployment applies committed migrations with `prisma migrate deploy` or an equivalently controlled deployment step;
- `prisma db push` may remain a local throwaway-database convenience, but it is not the production reconciliation mechanism;
- CI must fail when `schema.prisma` changes without the required committed migration artifacts once migration execution begins;
- backfill code is versioned separately from schema DDL when data transformation cannot be expressed safely in generated SQL;
- every destructive migration has a prerequisite validation/consumer-removal gate rather than being bundled into the first expansion migration.

The checked-in development SQLite database under `prisma/prisma/dev.db` must never be treated as the production migration baseline. If retained as a fixture/demo artifact, its role must be explicit and it must not replace repeatable migrations plus seed/backfill logic.

# Environment and backup prerequisite

Before the first persistent-environment migration:

- identify the authoritative database file/environment;
- establish a restorable snapshot/backup procedure appropriate to SQLite and the deployment host;
- rehearse restore against a copy;
- record schema version and application commit associated with the backup;
- quiesce writes or use a database-safe backup mechanism while capturing the snapshot;
- verify that file/object storage referenced by DeckFile can also be reconciled independently of the database.

A backup that has never been restored in rehearsal does not satisfy the rollback prerequisite.

# Migration execution waves

## F0 — Migration infrastructure and baseline capture

No semantic write cutover occurs in F0.

Required work:

- introduce checked-in Prisma migration history from the accepted current schema baseline;
- add migration/backfill command entrypoints that are idempotent and environment-scoped;
- establish machine-readable migration-run reporting;
- snapshot current row counts and key invariants by Conference;
- establish backup/restore rehearsal;
- capture consumer inventory from 003-E;
- define per-slice feature/configuration gates for semantic writes and semantic reads;
- establish a staging/clone rehearsal using production-shaped data where available.

The initial baseline migration must represent the current schema honestly rather than mixing all target changes into an unreviewable first migration.

## F1 — Additive target schema expansion

Add target structures while legacy readers and writers still function.

The expansion includes, or provides equivalently strong realizations for:

- exact current Revision reference and predecessor relation;
- exact Evaluation→Revision and abstract Feedback→Revision references;
- exact Revision↔Term Classification relation;
- Availability Window;
- Selection Decision history;
- Withdrawal;
- Capacity Pool/Allocation/Release state;
- Coverage Target;
- Vocabulary TermState history;
- Deliverable Requirement and version-specific Assessment;
- ArtifactVersion predecessor/deliverable references where required;
- Controlled Disclosure state/reveal provenance;
- Publication + PublicationState;
- Archive closure;
- durable synchronization work required by 003-C;
- exact Dispatch message/attempt evidence needed for new sends;
- migration provenance/support fields required to distinguish native, backfilled-historical, backfilled-current-state, and legacy-unknown data.

Expansion columns/relations should be nullable or otherwise backward-compatible until their backfill gates pass. Do not drop `programStatus`, `abstractReviewStatus`, `deckStatus`, current Submission fields, legacy Theme target columns, Conference flags, or legacy public fields in F1.

## F2 — Deterministic history and reference backfill

Backfill the strongest evidence first because later current-state seeds depend on exact references.

### F2.1 Revision identity/currentness

For each Proposal/Submission:

1. validate existing `SubmissionRevision` uniqueness/order;
2. establish predecessor relations for reconstructible contiguous history;
3. resolve the exact current Revision matching `Submission.abstractVersion` where durable evidence exists;
4. if no matching current snapshot exists, create only a **backfilled-current-state baseline Revision** from the durable current Submission fields, with no fabricated actor/event time or predecessor history;
5. preserve legacy revision artifacts that cannot join a truthful chain as migration evidence rather than inventing intermediate revisions.

A Proposal cannot enter canonical-write cutover without one exact current Revision.

### F2.2 Revision Classification

For each reconstructible Revision:

- parse/validate `themeIds`;
- create exact Revision↔Term associations only for extant stable Term IDs;
- classify missing Term references as migration defects requiring reconciliation;
- verify the current Revision's Classification against `SubmissionTheme` and record intentional/defect differences.

### F2.3 Evaluation exact-subject links

For each surviving Score:

- if `scoredAbstractVersion` resolves unambiguously to a Revision, bind the Evaluation to that Revision;
- if the version provenance is ambiguous or no Revision can be established truthfully, retain the legacy Score for compatibility/history but mark the exact-subject migration disposition as ambiguous/legacy-unknown;
- do not create missing prior Evaluations that were overwritten by legacy rescoring.

Ambiguous legacy scores may remain visible through compatibility read paths but cannot be treated as exact canonical Evaluations for a different Revision.

### F2.4 Feedback exact-subject links

ABSTRACT Feedback with a trustworthy `(submissionId, abstractVersion)` maps to the matching Revision. GENERAL Feedback remains Proposal/context-level when no exact Revision was intended.

## F3 — Current-state seed backfills

After exact reference groundwork is validated, seed current state without pretending to reconstruct lost histories.

### F3.1 Selection and Withdrawal

Apply the 003-B decomposition table:

- `APPROVED` → selected current-state Decision seed;
- `BACKUP` → reserve current-state Decision seed;
- `DECLINED` → not-selected current-state Decision seed;
- `PENDING` → no Selection seed;
- `WITHDRAWN` → Withdrawal seed, plus a selected seed only where surviving `approvedAt` or equivalent durable evidence supports it.

Do not infer reserve/not-selected/clear history behind a Withdrawal.

### F3.2 Capacity

Establish the initial finite Pool from the accepted current slot formula/configuration after operator validation. Current code computes `rooms * sessionsPerRoom - eodTrim - graemeSlots`; sponsor min/max remain representation targets, not Capacity rates.

Create one-unit active Allocations only for Proposals that are effectively participating under the migrated Selection + Withdrawal state.

If active migrated Allocations exceed the accepted Pool limit, **block Capacity/Selection canonical cutover** and require explicit operator reconciliation. Never silently enlarge the Pool to make migration pass.

### F3.3 Deliverable

For each migrated effectively participating Proposal, establish the expected deck Deliverable Requirement when that obligation applies.

For the latest DeckFile:

- `APPROVED` → backfilled-current-state `ready` Assessment;
- `CONCERN` → backfilled-current-state `concern` Assessment;
- `SUBMITTED` → no final Assessment; derived readiness is awaiting-review;
- `REVIEWED` → preserve as legacy compatibility residue only; do not invent a canonical Assessment.

Prior DeckFiles remain ArtifactVersion history without fabricated assessments.

### F3.4 Vocabulary and Coverage Target

For each Theme/Term:

- create a current TermState from current name/availability with backfilled-current-state provenance;
- do not invent historical rename/retire/restore events;
- migrate nonzero coherent Theme bounds to Coverage Target when they represent explicit targets;
- treat `0/0` as absent target by default;
- migrate sponsor/session-kind bounds only after the accepted product-policy interpretation is confirmed.

### F3.5 Availability Window

- both valid bounds → create the canonical Window current-state seed;
- missing one/both bounds → do not invent sentinel dates; keep the Conference in compatibility mode until an operator defines a valid Window;
- invalid ordering → migration defect that blocks Offer-policy cutover for that context.

`submissionsOpen` is retained as manual suspension policy only.

### F3.6 Archive

If the context is currently archived, create an Archive current-state seed using surviving trustworthy provenance where available.

If legacy data lacks an actual closure actor/time, record the migration observation time separately from the unknown historical occurrence; do not present migration time as the archive event time.

Contexts whose prior archive/reopen history was erased do not receive fabricated historical closures.

### F3.7 Publication

For each currently public legacy deck at cutover:

- resolve the **exact latest DeckFile** actually returned by the legacy listing;
- require current legacy eligibility to pass;
- create a backfilled-current-state Publication for that exact MaterialRef and surface;
- do not infer earlier DeckFiles were published;
- do not infer the current file was public since `decksPublishedAt`.

After this seed, exact MaterialRef publication becomes the target authority for public resolution.

### F3.8 Sharing-policy provenance

Legacy `deckShareable` values may seed the current sharing-policy input with `backfilled-current-state`/legacy provenance.

An untouched legacy `true` must not be labeled presenter consent or an affirmative historical actor decision.

### F3.9 Controlled Disclosure

Do **not** create concealed target records for existing reviewer/Proposal relationships whose prior identity exposure is unknown.

Use a **legacy in-flight review cohort**:

- preserve legacy visibility behavior only for already-existing protected review relationships where history is unknowable;
- create native Controlled Disclosure relationships for new review contexts established after cutover;
- create native exact-Revision peer-aggregate disclosure state for new Revisions reviewed after cutover;
- never interpret absence of a target Reveal row for the legacy cohort as proof that information was unseen.

The cohort is a migration compatibility classification, not a new concept state.

### F3.10 Dispatch

Existing SendRecords retain their stable identity and recipient evidence, but exact rendered historical messages remain legacy-unknown where not stored.

Do not backfill mutable current template contents as if they were the exact historical message.

Only new target-native sends are required to have exact immutable message evidence and provider-attempt semantics.

## F4 — Backfill validation and quarantine gate

Backfill scripts must be idempotent and re-runnable. They must produce a machine-readable report keyed by context and gap area.

Classify findings as:

- `pass` — target fact is supported;
- `expected-legacy-unknown` — missing history is known and explicitly accommodated;
- `operator-normalization-required` — current state must be corrected/defined before cutover;
- `blocking-defect` — invariants or references do not support safe cutover.

Canonical write/read cutover for a context is blocked by unresolved blocking defects in the relevant slice.

No migration script may silently skip a row and still report the slice as complete.

# Write cutover waves

Canonical write ownership should move by semantic slice rather than by table.

## F5-W1 — Revision, Classification, Evaluation, Feedback references

First write slice because current Evaluation behavior can overwrite version-specific judgment.

Required before enabling:

- exact current Revision for every in-scope Proposal;
- Revision↔Classification backfill validation;
- semantic Revision command with expected-head/idempotency behavior;
- new Evaluation uniqueness by evaluator + exact Revision;
- compatibility projection to current Submission fields/version/themes;
- Feedback exact Revision reference when applicable.

Legacy read surfaces may remain during this wave.

## F5-W2 — Selection, Withdrawal, Capacity, Deliverable

Enable the 003-C TX-A/TX-B rules:

- new effective participation atomically creates/adjusts Capacity and required Deliverable state;
- Withdrawal commits independently with durable cleanup work;
- `programStatus` becomes canonical→compatibility projection;
- legacy organizer `WITHDRAWN` mutation is disabled;
- current Deliverable readiness is exact ArtifactVersion Assessment; `deckStatus` is projected where representable.

Capacity backfill must fit the Pool before this write cutover.

## F5-W3 — Availability, Archive, capability/lifecycle policy

Move command gating to the 003-D policy target:

- Window + suspension determine Offer availability;
- Revision edit uses explicit policy/revision exceptions;
- Archive becomes monotonic closure;
- broad `ACTIVE` mutation gating is replaced at migrated command boundaries with action-specific lifecycle/capability policy.

Do not permit routine unarchive after this slice becomes authoritative.

## F5-W4 — Controlled Disclosure and review visibility

Enable native staging/reveal for post-cutover review relationships/Revisions.

Legacy in-flight cohorts remain explicitly compatibility-scoped until their migration disposition ends; they are not silently rewritten as concealed or revealed.

## F5-W5 — Sharing and exact Publication

Move target-native sharing-policy changes to provenance-retaining commands and exact Publication actions.

Public token/file resolution must switch to exact MaterialRef + Publication + eligibility before or at the same release as exact Publication write authority.

This public authorization hardening is a rollback floor: a later compatibility rollback must not restore authorization of arbitrary historical DeckFiles from mutable parent state.

## F5-W6 — Schedule generation acceptance

Replace clear-and-rewrite generation with non-mutating proposal + expected-base atomic apply. Existing manual placements remain authoritative.

## F5-W7 — Dispatch exact-message/provider semantics

New sends record exact message instances and stable recipient/round identity before external handoff. Same-round behavior is idempotent; intentional repeats use a new round.

Existing historical sends remain readable even where exact message content is unknown.

# Read and interface cutover

## F6 — Shadow semantic reads

Before changing a first-party screen/API, compute semantic and legacy views side by side in non-authoritative comparison mode.

Every difference must be classified as:

1. **expected semantic correction**;
2. **expected legacy-unknown/provenance difference**;
3. **defect**.

Security-sensitive surfaces require zero unexplained differences before cutover. For the current scale, the preferred gate is zero unexplained differences for all supported in-scope rows rather than a statistical percentage threshold.

Required comparisons include:

- Selection + Withdrawal → legacy `programStatus` projection;
- current Revision → current Submission content/ordinal;
- current Revision Classification → `SubmissionTheme`;
- exact Evaluation applicability → needs-score/rescore queues;
- exact ArtifactVersion Assessment → supported `deckStatus` projection;
- Capacity ledger → current slot/count expectations;
- Coverage Target/observed composition → existing advisory views;
- exact Publication/public eligibility → public listing/file resolver;
- Archive + mode → compatibility ConferenceStatus/read-only presentation.

## F7 — First-party read/UI cutover

Migrate consumers one bounded surface at a time.

Recommended order prioritizes correctness/security dependencies:

1. public listing and public file resolver;
2. reviewer blind/disclosure + Evaluation queues;
3. presenter portal/edit/Deliverable views;
4. organizer Selection/Withdrawal/Capacity/Coverage/Deliverable controls;
5. Publication/sharing controls;
6. Schedule proposal/apply experience;
7. Dispatch/communication operational state;
8. historical/export projections.

A screen may temporarily display both semantic and subordinate compatibility summaries for diagnostics, but users must not receive two competing mutation controls for the same outcome.

# Legacy mutation retirement

## F8 — Canonical-only first-party writes

When all first-party consumers for a slice use semantic commands:

- compatibility fields become read-only projections or legacy residue;
- legacy endpoints become narrow adapters only where an external/supported consumer still requires them;
- ambiguous generic status writes are rejected;
- direct database writes to compatibility fields from application paths are prohibited.

Examples:

- `programStatus` mutation maps only unambiguous Selection values; `WITHDRAWN` is rejected as an organizer decision;
- `abstractReviewStatus` no longer gates target-native commands;
- `deckStatus=REVIEWED` cannot be produced by native Assessment commands;
- `submissionsOpen=true` cannot override Window timing/Archive;
- Conference status changes cannot erase Archive;
- `decksPublished` cannot authorize individual MaterialRefs.

# Rollback model

Rollback is classified by what authority has already moved.

## R0 — Before canonical native writes

Safe options:

- revert application code;
- leave additive unused tables/columns in place;
- rerun/revert backfill in a clone as needed;
- restore the pre-migration backup if no post-backup production truth must be retained.

No destructive target cleanup should have occurred yet.

## R1 — Canonical writes active, legacy reads still primary

Safe rollback:

- return read/UI behavior to legacy compatibility projections;
- disable a new semantic read surface;
- keep canonical writes and compatibility projection active.

Unsafe rollback:

- re-enable independent legacy writers that can contradict newly captured Selection/Withdrawal/Evaluation/etc. history;
- delete canonical history to make old fields look authoritative again.

## R2 — Canonical reads and writes active

Safe rollback is **behavioral**, not historical:

- switch selected reads back to compatibility projections if those projections remain maintained;
- disable nonessential target UI features;
- place affected commands in maintenance/read-only mode when a safe compatibility adapter does not exist;
- continue processing source-authoritative cleanup/recovery work.

Do not return to last-writer-wins dual authority.

## R3 — After compatibility field removal

A destructive schema rollback is not assumed safe. Recovery must use a forward fix or a deliberately engineered reverse migration that preserves all canonical history and can reconstruct the required compatibility representation.

This is why destructive cleanup is deferred until after the full removal gate.

# Rollback floors

The following correctness/security properties must not be weakened during rollback:

- a recorded Withdrawal remains true;
- Archive history is not erased;
- explicit Controlled Disclosure Reveal history is not erased/reconcealed;
- public file resolution does not revert to authorizing arbitrary historical DeckFiles from mutable parent state;
- new exact-Revision Evaluations are not collapsed back into one overwritable row;
- exact Publication history is not deleted;
- uncertain external Dispatch outcomes are not blindly retried merely because legacy UI expects a button.

If restoring old behavior would violate one of these floors, prefer temporary maintenance/read-only operation for that slice.

# Destructive cleanup / contract phase

Legacy schema removal is not part of initial implementation cutover.

A field/table/enum value may be removed only after all conditions in the 003-E removal gate pass and 003-F additionally confirms:

- canonical/native records exist for all supported active contexts;
- all backfill defects are resolved or explicitly quarantined outside the supported cutover scope;
- no first-party or documented external writer uses the legacy contract;
- rollback no longer depends on the field being independently writable;
- parity reports show no unexplained difference;
- legacy-unknown cohorts have reached a defined terminal compatibility state;
- backup/restore and forward-repair procedures have been rehearsed;
- documentation/tests no longer call the field authoritative.

Some compatibility projections may remain indefinitely when they are cheap, unambiguous, and useful—for example integer `abstractVersion` or denormalized current content. The target requires removal of **competing authority**, not gratuitous physical normalization.

# Execution artifacts expected from implementation

When Phase 004/runtime work begins, each migration slice should produce:

- committed Prisma migration(s);
- idempotent backfill script(s);
- a migration manifest/run report;
- pre/post invariant report;
- shadow/parity report;
- consumer/write-path inventory update;
- rollback/disable procedure;
- tests for native semantics and compatibility projection;
- explicit list of legacy-unknown records/cohorts.

These artifacts are implementation evidence, not new canonical concept specifications.

# Exit gate for 003-F

003-F is complete when the design provides:

- migration tooling discipline;
- additive schema order;
- truthful per-area backfill rules;
- quarantine/blocking criteria;
- semantic write cutover order;
- shadow/read cutover order;
- compatibility retirement rules;
- non-destructive rollback classes and rollback floors;
- destructive cleanup gates.

003-F itself does **not** authorize runtime/schema changes. The final Phase 003 consolidation/handoff gate in 003-G determines implementation authorization and execution slicing.