---
type: Migration Target Baseline
title: MinneAnalytics v0 Migration Target Baseline
description: Canonical recoverability, compatibility, provenance, expand-first, and rollback constraints for moving the current implementation toward the 003-B persistence target.
tags: [concept-design, implementation-reconciliation, migration, backfill, compatibility, rollback, v0]
status: stable
authority: canonical
phase: 003-B
sources:
  - { id: phase, resource: ../../003-B-persistence-identity-history-and-migration-target-design.md, title: 003-B Persistence, Identity, History & Migration Target Design }
  - { id: matrix, resource: ../../evidence/003-B-backfill-compatibility-and-reversibility-matrix.md, title: 003-B Backfill, Compatibility & Reversibility Matrix }
  - { id: persistence, resource: persistence-identity-history-target.md, title: MinneAnalytics v0 Persistence, Identity & History Target }
  - { id: gaps, resource: semantic-gap-baseline.md, title: 003-A Semantic Gap Baseline }
---
# Purpose

Define what migration may claim, what it must preserve, and how the target can be introduced reversibly before 003-F turns this design into an executable rollout plan.

# Migration truth rule

> **Do not fabricate historical certainty to make the new model look complete.**

A target record may be created from legacy data only at the confidence actually supported by that data.

# Migration provenance classes

Implementation may encode these classes with fields, metadata, or migration manifests; the semantics are canonical:

- **native** — created by the target behavior with real event/reference provenance;
- **backfilled-historical** — reconstructed deterministically from durable historical evidence;
- **backfilled-current-state** — represents a state observed at cutover, without asserting when/how it originally arose;
- **legacy-unknown** — required historical detail cannot be reconstructed and must remain unknown.

This metadata is migration/provenance support, not a new global Audit Trail concept.

# Recoverability baseline

## Deterministically recoverable

The following are expected to be reconstructible from existing durable data, subject to validation:

- ProposalRef from `Submission.id`;
- RevisionRef from `SubmissionRevision.id`;
- Revision predecessor chains from `(submissionId, version)`;
- current Revision pointer from `Submission.abstractVersion` + matching revision row;
- most historical Revision↔Term Classification from `SubmissionRevision.themeIds`;
- abstract Feedback→Revision links from `(submissionId, abstractVersion)`;
- DeckFile artifact predecessor order from per-Submission versions;
- existing Schedule current topology/placements;
- existing Dispatch Batch/SendRecord identities and recipient endpoint evidence.

## Recoverable only as current-state seeds

The current database can seed, but not fully reconstruct history for:

- latest Selection disposition;
- current Withdrawal when `WITHDRAWN`/`withdrawnAt` still survives;
- current Vocabulary label/availability;
- current explicit Coverage bounds;
- current Deliverable readiness/concern for the latest artifact;
- current public exposure of an exact latest eligible artifact at cutover;
- current Archive closure when the Conference is presently archived.

Such seeds must be marked as current-state/backfilled where actor/time/history is incomplete.

## Forward-only or legacy-unknown history

Do not synthesize:

- Evaluation judgments overwritten by later rescoring;
- identity/aggregate reveal events that were never durably recorded;
- Selection decisions overwritten before cutover;
- Withdrawals erased by later organizer status changes;
- earlier Vocabulary labels or retire/restore transitions;
- prior Deliverable assessment transitions/reviewer attribution not stored;
- past Publication material identities/exposure intervals not reconstructible from exact evidence;
- exact rendered content of historical Dispatch sends when only mutable template references remain;
- Archive→reopen history whose archive provenance was cleared.

# Legacy state interpretation

## ProgramStatus

Migration must decompose the legacy combined status rather than copy it into a new lifecycle.

| Legacy status | Selection seed | Withdrawal seed |
|---|---|---|
| `PENDING` | none | none |
| `APPROVED` | selected current-state/history seed where `approvedAt` is trustworthy | none |
| `BACKUP` | reserve current-state seed | none |
| `DECLINED` | notSelected current-state seed | none |
| `WITHDRAWN` with surviving evidence of prior approval | selected seed only when supported | Withdrawal seed |
| `WITHDRAWN` without prior-selection evidence | none assumed | Withdrawal seed |

`PENDING` must not become an invented Selection Clear event. A legacy Withdrawal must not be used to guess whether the prior organizer outcome was reserve, declined, or undecided.

## Score version provenance

A surviving Score with a trustworthy `scoredAbstractVersion` can be linked to the matching exact Revision.

Rows whose version marker was populated only by a legacy repair from the Submission's then-current version may have lower subject-confidence. Migration tooling must record/quarantine ambiguity rather than silently assert perfect historical attribution.

## Availability Window

Canonical Window requires an explicit valid bounded interval.

- both bounds present and `open < close` → safe seed;
- missing bound(s) → legacy compatibility, operator normalization required before full cutover;
- invalid ordering → data defect;
- `submissionsOpen=true` with missing bounds does not justify synthetic extreme timestamps.

## Coverage Target

Legacy zero values are ambiguous.

- theme `targetMin=0` and `targetMax=0` should normally mean **no explicit target**, not a canonical zero-width target;
- nonzero bounds must be validated for coherent lower/upper ordering;
- Conference sponsor min/max may become a session-kind Coverage Target only after product-policy confirmation;
- sponsor min/max must not be converted to Capacity class rates absent evidence that sponsor commitments consume different units.

# Controlled Disclosure cutover rule

The target must not claim an unrevealed legacy participant never saw information when the legacy application did not persist reveal history.

Therefore 003-D/003-F must choose a compatibility strategy such as:

- canonical disclosure records only for newly established review contexts/information after cutover; or
- an explicit legacy in-flight cohort whose prior exposure remains unknown until closure.

Where current visibility is objectively observable at cutover, a seed may represent that **current observed visibility**, never a fabricated historical reveal instant.

# Current-public cutover rule

Current public behavior can seed an exact Publication only from cutover forward.

If the legacy application currently exposes a specific latest DeckFile and all current eligibility checks pass, migration may establish a published Publication for that exact `DeckFile.id` with backfilled-current-state provenance.

Do not infer that:

- the file was public since `Conference.decksPublishedAt`;
- earlier DeckFiles were or were not published;
- the current exact file was the one exposed when the event-wide flag was first set.

# Compatibility projection policy

The following legacy surfaces may remain during transition, but only as projections or policy inputs whose owner is defined by [Persistence, Identity & History Target](persistence-identity-history-target.md):

- `Submission.programStatus` / `approvedAt` / `withdrawnAt`;
- `abstractVersion` and current mutable Revision fields;
- `abstractReviewStatus`;
- `SubmissionTheme` and `SubmissionRevision.themeIds`;
- `deckStatus`;
- Conference submission-window fields and manual `submissionsOpen` override;
- `Theme.name`, `removedAt`, and legacy target fields;
- sponsor target settings;
- `decksPublished`, `deckShareable` policy state;
- `Conference.status` / `archivedAt`;
- cached Dispatch recipient count.

During coexistence, every projected field must have a defined reconciliation direction:

1. **canonical → compatibility** after canonical writes become authoritative; or
2. temporary **legacy → canonical** during an earlier shadow/backfill stage.

Uncontrolled bidirectional authority is not an acceptable steady state.

# Expand-first target

003-B requires a migration shape that can be implemented as an expansion before destructive cleanup:

1. add target IDs/relations/history structures alongside existing schema;
2. backfill only supportable data with explicit provenance/confidence;
3. verify canonical structures against existing current behavior;
4. introduce controlled canonical writes while projecting to legacy fields as needed;
5. shadow/read-compare before changing user-facing read authority;
6. cut reads to canonical owners only after verification;
7. retire legacy independent writes;
8. remove redundant compatibility fields only after 003-E/003-F exit gates.

003-C owns transactional ordering/idempotency for steps involving coordinated writes. 003-F owns the executable rollout sequence and rollback procedures.

# Rollback constraint

Rollback may switch application behavior back to legacy reads/writes, but it must not erase truthful new history captured while the target model was active.

For example, a rollback should preserve newly recorded:

- Selection Decisions;
- Withdrawals;
- exact-Revision Evaluations;
- Controlled Disclosure reveals;
- Capacity Allocations/Releases;
- Deliverable Assessments;
- Publication states;
- Archive closure;
- exact Dispatch messages.

Ignoring those records temporarily is safer than deleting them and destroying actor/history truth.

# Validation gates carried to 003-F

Before canonical cutover, the eventual migration tooling must be able to demonstrate:

1. each non-quarantined Proposal has one exact current Revision;
2. predecessor/current Revision relations are acyclic and match validated legacy order;
3. every migrated Revision↔Term pair references an extant stable Term;
4. each migrated Evaluation has an exact Revision or an explicit ambiguity disposition;
5. current Selection + Withdrawal reproduces the intended legacy program view for non-ambiguous rows;
6. active Capacity allocations fit within the accepted finite Pool;
7. current Deliverable readiness matches supported legacy current deck behavior;
8. public listing after cutover equals the intended set of exact published MaterialRefs;
9. all new Dispatch SendRecords retain immutable exact message evidence;
10. archived contexts retain immutable Archive closure records;
11. no backfill asserts an event actor/time/value absent from the source evidence.

# Schema-tooling constraint

The repository currently uses Prisma with SQLite and `prisma db push`, not a checked-in migration history. The implementation plan must therefore explicitly establish a production-safe migration mechanism before destructive schema evolution; `db push` alone is not an acceptable enterprise migration/rollback story for this reconciliation.

This is a rollout/tooling requirement, not authorization to change database tooling in 003-B.

# Exit condition

003-B considers the migration target sufficiently defined when every structural semantic gap has:

- a target identity/state owner;
- a recoverability classification;
- a compatibility posture;
- an expand-first path;
- an explicit no-fabrication constraint where history is lost.

Runtime/schema implementation remains unauthorized until later Phase 003 work completes.