---
type: Interface Compatibility Baseline
title: MinneAnalytics v0 Interface Compatibility & Cutover Baseline
description: Canonical coexistence rules for legacy API/UI fields, additive semantic read models, command-boundary migration, parity checks, and eventual compatibility retirement.
tags: [concept-design, implementation-reconciliation, compatibility, api, ui, migration, v0]
status: stable
authority: canonical
phase: 003-E
sources:
  - { id: phase, resource: ../../003-E-derived-views-api-ui-state-and-compatibility-reconciliation.md, title: 003-E Derived Views API UI State & Compatibility Reconciliation }
  - { id: matrix, resource: ../../evidence/003-E-compatibility-field-and-api-cutover-matrix.md, title: 003-E Compatibility Field & API Cutover Matrix }
  - { id: views, resource: derived-view-api-ui-target.md, title: MinneAnalytics v0 Derived View API & UI State Target }
  - { id: migration, resource: migration-target-baseline.md, title: MinneAnalytics v0 Migration Target Baseline }
---
# Purpose

Define how MinneAnalytics can introduce the accepted semantic interface without forcing an all-at-once API/UI rewrite and without allowing transitional compatibility fields to remain indefinite competing authority.

# Compatibility principle

Compatibility is a **temporary projection service**, not a second model.

During coexistence:

```text
canonical writes
      ↓
canonical state/history
      ↓
semantic read model
      ↓
legacy compatibility projection
```

Legacy consumers may temporarily continue reading old fields. After write cutover, they must not independently mutate them.

# Additive-first API strategy

The preferred v0 transition is additive within the existing Next.js application boundary.

Before removing old fields, add explicit semantic fields/read-model groups alongside them. Existing screens can then migrate one consumer at a time.

A new framework-wide `/v2` API namespace is not required merely for naming cleanliness. Introduce route versioning only when an externally supported compatibility contract actually requires it.

# Compatibility field dispositions

## `programStatus`

Disposition: **project, then retire as authority**.

Canonical inputs:

- current Selection disposition;
- Withdrawal existence.

Projection:

- Withdrawal -> `WITHDRAWN`;
- selected -> `APPROVED`;
- reserve -> `BACKUP`;
- not-selected -> `DECLINED`;
- none -> `PENDING`.

New writes target Selection or Withdrawal commands only.

## `abstractVersion`

Disposition: **retain as ordinal compatibility projection**.

Canonical identity is exact current Revision reference. Integer version remains useful for display, URLs where compatibility demands it, ordering, and human-readable history.

It must not be used as the only durable cross-concept reference after cutover.

## current Submission title/abstract/bio/technical level

Disposition: **retainable denormalized current-Revision projection**.

Canonical current content is the current Revision. Current-row fields may remain for efficient queries/UI if they are transactionally projected and repairable.

## `SubmissionTheme`

Disposition: **retainable current-Classification projection**.

Canonical version-sensitive Classification binds exact Revision -> Term. The current Submission join may remain as a convenient projection of the current Revision's Classification set.

## `abstractReviewStatus`

Disposition: **legacy-only, no canonical replacement enum**.

Target consumers use Revision, Evaluation applicability, Feedback, explicit revision-exception policy, and edit-eligibility projections.

Existing values may be preserved during coexistence for old screens but must not gate target-native commands.

No new Concept Design state is invented to justify `ACKNOWLEDGED` or `FEEDBACK_PENDING`.

## `deckStatus`

Disposition: **project for target-native states; preserve unsupported legacy residue until migrated**.

Target-native projection:

- no artifact -> null;
- artifact, no final assessment -> `SUBMITTED`;
- concern -> `CONCERN`;
- ready -> `APPROVED`.

Legacy `REVIEWED` has no independent canonical meaning. Migrated records may retain a legacy compatibility marker until another native assessment occurs; new target commands do not create `REVIEWED` merely for enum symmetry.

## `deckShareable`

Disposition: **compatibility representation of current share-eligibility input**.

New target-native changes require provenance. Legacy true/false may remain as current-state input with legacy provenance classification.

## `decksPublished`

Disposition: **public-surface compatibility/control input, not exact Publication truth**.

Exact Publication records determine which MaterialRefs are intentionally exposed. A collection-level switch may remain for UI continuity but cannot authorize an individual file by itself.

## `ConferenceStatus`

Disposition: **compatibility application mode plus Archive projection**.

- no Archive + setup -> `DRAFT`;
- no Archive + live -> `ACTIVE`;
- Archive exists -> `ARCHIVED`.

Post-Archive action eligibility is not inferred solely from this field.

## `submissionsOpen`

Disposition: **manual-suspension compatibility input**.

It no longer owns whether the canonical Availability Window is temporally open.

# Compatibility read-model rule

When returning both semantic and compatibility fields, semantic fields should be grouped/name-spaced so consumers can distinguish them from legacy values.

Illustrative shape:

```text
{
  id,
  title,
  semantic: {
    revision,
    selection,
    withdrawal,
    participation,
    editEligibility,
    evaluation,
    deliverable,
    publication
  },
  compatibility: {
    programStatus,
    abstractVersion,
    abstractReviewStatus,
    deckStatus
  }
}
```

The exact JSON nesting may adapt to existing route ergonomics. The invariant is that compatibility fields are visibly identified and documented as projections.

# Command cutover

Mutation surfaces migrate before compatibility fields are deleted.

## Phase C1 — additive semantic commands

Introduce action-oriented command handlers/services alongside legacy endpoints where needed.

## Phase C2 — legacy endpoint adapters

Legacy mutation endpoints may temporarily translate a supported old command into exactly one semantic action where the mapping is unambiguous.

For example, legacy `APPROVED` may adapt to a Selection `selected` Decision if no Withdrawal command is being implied.

Adapters must reject ambiguous combinations instead of silently recreating the old collapsed semantics.

## Phase C3 — canonical-only writes

All first-party UI uses semantic commands. Compatibility fields become read-only projections.

## Phase C4 — compatibility retirement

After parity and consumer inventory show no supported dependencies, remove legacy mutation contracts first, then legacy read fields that no longer provide justified compatibility value.

# `programStatus` legacy-write rule

A generic old endpoint that accepts arbitrary status values must not survive as an independent writer after Selection/Withdrawal cutover.

During adapter coexistence:

- `APPROVED` -> append selected Selection Decision;
- `BACKUP` -> append reserve Selection Decision;
- `DECLINED` -> append not-selected Selection Decision;
- `PENDING` -> append/represent an explicit Selection clear only when the caller's intent is known and permitted;
- `WITHDRAWN` must **not** be accepted as an organizer Selection value; Withdrawal remains originator-authoritative through the Withdrawal command.

This prevents an organizer compatibility endpoint from fabricating or reversing Withdrawal history.

# Presenter UI target

The presenter portal should migrate from three compound labels toward separate semantic summaries:

- Program decision;
- Participation/withdrawal;
- current Revision and edit availability;
- Feedback;
- Deliverable current artifact/readiness;
- public-sharing/publication state where relevant.

The portal must use server-derived `editEligibility` and Deliverable provision eligibility instead of reconstructing them from `programStatus`.

# Reviewer UI target

The reviewer experience may preserve familiar queue names such as:

- Needs your score;
- Needs rescore;
- Scored at current version.

But queue membership derives from exact Revision/Evaluation relationships.

Blind-review UI consumes explicit protected-information state and does not infer concealment from empty identity fields.

# Organizer UI target

The organizer dashboard should progressively replace generic Status controls with action-specific state and controls:

- Selection decision + history;
- Withdrawal indicator that cannot be overwritten;
- Capacity hard constraint;
- Coverage advisory warning;
- exact Deliverable readiness;
- sharing eligibility;
- exact Publication state;
- Schedule proposal/apply state;
- recovery/convergence attention where actionable.

A combined compatibility badge may remain during transition but must be visually subordinate to semantic owners once both are displayed.

# Public UI/API target

Public listing endpoints return only exact currently published and currently eligible MaterialRefs.

Public file resolution repeats the exact-material Publication/eligibility check; it does not trust that an item appeared in a prior listing response and does not authorize from parent current state alone.

# Operation-state compatibility

During TX-B convergence, APIs may expose a small projection such as:

```text
operations:
  state: stable | converging | attention-required
  issues: [...]
```

This is an operator-facing view over durable work/recovery state, not a domain lifecycle.

For source-authoritative exits, participant-facing fields reflect the source fact immediately even while operator cleanup is converging.

# Parity and shadow comparison

Before switching a first-party read surface to semantic projections, 003-F should define shadow comparisons between old and new outcomes.

Parity does not mean raw fields are identical. It means differences are either:

- intentionally corrected semantics;
- known legacy-unknown/provenance differences;
- defects to fix before cutover.

Examples:

- compatibility `programStatus` should match the projection rule from Selection + Withdrawal;
- current Submission content should match current Revision projection;
- current `SubmissionTheme` should match current Revision Classification;
- target deck readiness should explain the legacy `deckStatus`, with `REVIEWED` explicitly classified as legacy-only;
- public listing differences caused by blocking historical un-published MaterialRefs are intentional security/correctness improvements.

# Consumer inventory rule

Compatibility retirement requires a concrete inventory of:

- server routes;
- server-rendered pages;
- client components;
- export builders;
- tests/fixtures;
- seed/demo tools;
- external or documented clients, if any.

A field is not safe to remove merely because no current React component references it.

# Error compatibility

Legacy endpoints may continue returning existing HTTP status families during transition, but semantic command services should produce stable machine-readable application reason codes.

Adapters translate these codes to legacy response shapes only where necessary.

First-party UI should migrate to reason codes before English error text changes.

# Security and concealment compatibility

Compatibility must never justify returning concealed data and asking old UI to hide it.

If an old consumer cannot represent protected-information state safely, keep the protected values absent and adapt the UI before cutover.

Likewise, compatibility cannot preserve historical public-file access that violates the exact Publication target.

# Removal gate

A compatibility field/endpoint may be removed only when:

1. canonical target state is populated for supported records;
2. first-party writes no longer depend on it;
3. first-party reads no longer require it or have an explicit adapter;
4. shadow/parity checks meet the accepted threshold;
5. legacy-unknown records have defined behavior;
6. rollback does not require destructive deletion of canonical history;
7. documentation and tests no longer describe the legacy field as authority.

# Anti-bloat constraints

Compatibility does not require:

- permanent dual schemas;
- permanent dual-write;
- a second API application;
- one endpoint per database table;
- a generic status translation framework.

Adapters should be narrow and temporary.

# Gap disposition

003-E has now supplied the interface/compatibility target for all gaps whose implementation currently surfaces through combined statuses, queues, or public/API views. They remain implementation-open until 003-F defines and validates the migration/cutover sequence.

# Handoff

003-F should use this baseline to build an executable migration order, including additive schema/read-model work, compatibility adapters, consumer migration order, shadow verification, write cutover, rollback points, and eventual legacy cleanup.