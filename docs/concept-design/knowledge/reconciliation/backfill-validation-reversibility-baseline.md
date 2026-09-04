---
type: Backfill Validation & Reversibility Baseline
title: MinneAnalytics v0 Backfill, Validation & Reversibility Baseline
description: Canonical acceptance criteria for migration provenance, deterministic backfill, quarantine, parity, rollback safety, and destructive-cleanup readiness.
tags: [concept-design, implementation-reconciliation, migration, backfill, validation, rollback, reversibility, v0]
status: stable
authority: canonical
phase: 003-F
sources:
  - { id: phase, resource: ../../003-F-data-migration-backfill-rollout-and-reversibility-plan.md, title: 003-F Data Migration Backfill Rollout & Reversibility Plan }
  - { id: matrix, resource: ../../evidence/003-F-backfill-provenance-validation-and-rollback-matrix.md, title: 003-F Backfill Provenance Validation & Rollback Matrix }
  - { id: rollout, resource: migration-rollout-execution-plan.md, title: MinneAnalytics v0 Migration Backfill & Rollout Execution Plan }
  - { id: prior, resource: migration-target-baseline.md, title: MinneAnalytics v0 Migration Target Baseline }
---
# Purpose

Define the quality gates by which migration/backfill is judged safe enough to advance from additive schema to canonical writes, semantic reads, and eventual legacy cleanup.

The core rule is:

> **Migration completeness is not measured by making every target field non-null. It is measured by preserving every supported truth, explicitly classifying unknowns, and blocking cutover where missing evidence would make behavior unsafe.**

# Provenance requirements

Every migrated target fact that did not originate natively in the target architecture must be attributable to one of the canonical migration provenance classes:

- `backfilled-historical`;
- `backfilled-current-state`;
- `legacy-unknown` where the missing detail itself must remain visible to migration logic.

Native post-cutover records are `native`.

Implementation may encode provenance in per-record columns, migration metadata tables, manifests, or a combination. The chosen representation must make it possible to distinguish a true native event from a current-state seed during validation and debugging.

# Backfill execution requirements

Backfills must be:

- **idempotent** — rerunning does not duplicate semantic records;
- **bounded** — runnable by Conference/context or deterministic batch boundary;
- **restartable** — a failed run resumes without rewriting accepted history;
- **observable** — emits machine-readable counts and issue classifications;
- **non-destructive** — does not delete legacy evidence while cutover is incomplete;
- **deterministic where claiming historical reconstruction** — the same source evidence yields the same target reference/history;
- **explicit when current-state seeding** — no implied historical timestamp or actor is invented.

# Migration run manifest

Each execution should record or emit at minimum:

- migration/backfill version;
- application/schema commit/version;
- target environment/context;
- start/completion time of the migration run itself;
- source row counts by relevant model;
- target created/linked/skipped counts;
- provenance counts;
- warning/defect/quarantine counts;
- invariant validation results;
- shadow/parity result summary;
- operator decisions required or applied.

Migration-run time is never substituted for an unknown domain event time.

# Quarantine model

Quarantine means **do not pretend the row is safely canonical for the affected semantic slice**.

A quarantined item may remain available through an explicitly supported compatibility read path while resolution is pending.

Quarantine categories:

- `reference-missing` — expected stable target identity cannot be resolved;
- `history-gap` — historical chain is incomplete and cannot be truthfully reconstructed;
- `subject-ambiguous` — a legacy Evaluation/Feedback/etc. cannot be tied to one exact Revision;
- `invalid-invariant` — ordering/bounds/uniqueness violate target semantics;
- `capacity-conflict` — migrated effective participation exceeds accepted Pool;
- `public-exposure-ambiguous` — exact currently public material cannot be established safely;
- `legacy-exposure-unknown` — disclosure history is unknowable by design;
- `unsupported-legacy-state` — e.g. Deliverable `REVIEWED` with no canonical Assessment equivalent.

`legacy-exposure-unknown` and some unsupported residues are expected compatibility conditions rather than defects, but they still need a defined cutover disposition.

# Blocking vs non-blocking rules

## Always blocking for the affected canonical-write/read slice

- no exact current Revision for an active Proposal;
- broken/cyclic Revision predecessor relation;
- active Classification references a missing Term;
- Capacity Pool invalid or active allocations exceed limit;
- a security-sensitive public resolver cannot identify exact currently published material;
- target command uniqueness/idempotency constraints cannot be enforced;
- current archive/public/disclosure state would be represented with fabricated certainty;
- schema migration or backfill is not reproducible from version-controlled artifacts.

## Potentially non-blocking with explicit compatibility behavior

- historical overwritten Evaluations that no longer exist;
- legacy exact-message Dispatch content that was never stored;
- prior Selection/Withdrawal transitions already erased;
- older Vocabulary labels not recoverable;
- `REVIEWED` Deliverable compatibility residue;
- legacy blind-review relationships whose prior identity exposure is unknown.

These unknowns may not block all application cutover if target behavior clearly starts native history from the cutover boundary and the UI/API does not misrepresent them.

# Structural validation gates

Before F5 canonical-write cutover for an in-scope context, validate:

## Revision

- every active Proposal has exactly one current RevisionRef;
- current Revision belongs to that Proposal;
- exact current Revision content matches the accepted current Submission projection;
- predecessor chain is acyclic;
- reconstructed predecessor order agrees with validated legacy version order;
- any current-state baseline Revision created because history was missing is explicitly marked as such.

## Classification/Vocabulary

- every Revision↔Term relation references an extant Term;
- current Revision Classification equals the intended current `SubmissionTheme` projection after classified differences are resolved;
- one current TermState exists per Term in target-native state;
- retired Terms remain referable by historical Classification.

## Evaluation

- every exact migrated Evaluation points to exactly one Revision and evaluator;
- uniqueness is enforceable by evaluator + Revision;
- ambiguous legacy Scores are excluded from false exact attribution;
- recording a new Evaluation for a later Revision cannot overwrite an older Revision Evaluation.

## Selection/Withdrawal

- migrated current Selection disposition matches supported legacy evidence;
- Withdrawal remains independent from Selection;
- compatibility `programStatus` produced from canonical state matches the defined projection for every non-ambiguous row;
- no organizer compatibility path can create or erase Withdrawal after cutover.

## Capacity

- Pool limit is valid and operator-accepted;
- every active Allocation belongs to an effectively participating Proposal;
- no duplicate active allocation exists for the same required commitment;
- committed units do not exceed limit;
- releases are idempotent.

## Deliverable

- each applicable Proposal has at most the intended active Requirement for the deck kind;
- each ArtifactVersion is associated with the correct Proposal/Deliverable;
- ready/concern Assessments reference exact ArtifactVersions;
- replacement current artifact does not inherit the previous artifact's Assessment;
- legacy `REVIEWED` does not masquerade as a native Assessment.

## Availability

- every context entering canonical Offer policy has one valid Window with `opensAt < closesAt`;
- the half-open phase calculation is testable at both boundary instants;
- manual suspension does not mutate Window phase.

## Archive

- an archived target context has immutable closure identity;
- migration-recorded time is not displayed as historical archive time when the latter is unknown;
- routine status changes cannot delete closure after cutover.

## Publication

- every seeded Publication points to one exact MaterialRef;
- public listing is derivable from current Publication + eligibility;
- public token resolution validates that exact Publication rather than parent mutable status;
- ineligible material is suppressed even while unpublish cleanup is converging.

## Controlled Disclosure

- native relations are unique by participant/context/information;
- Reveal is monotonic;
- peer aggregate information is exact-Revision scoped;
- legacy in-flight cohort absence of Reveal history is never interpreted as concealed/unseen certainty.

## Dispatch

- new SendRecords preserve exact immutable message evidence;
- recipient + semantic round uniqueness is enforceable;
- same-round retry does not produce a second semantic send;
- uncertain provider outcomes remain blocked rather than blindly retried.

# Interface parity gates

Parity compares **meaning**, not raw schema identity.

For each migrated first-party surface, produce row-level or item-level classifications for differences.

Acceptable categories:

- `equal-projection` — semantic state projects to current legacy display/behavior;
- `intentional-correction` — target deliberately fixes a known semantic/security defect;
- `legacy-unknown` — target refuses unsupported historical certainty;
- `defect` — target or adapter does not match accepted design.

No first-party read cutover occurs with unexplained `defect` differences in scope.

Security-sensitive comparisons—public material authorization and protected-information visibility—require zero unexplained differences and must prefer the safer target interpretation where legacy behavior was known to be over-broad.

# Required scenario validation

In addition to data parity, execution must exercise scenario-level behavior for at least:

- Offer before/open/at-close/after Window boundaries;
- Revision with current Classification projection;
- Evaluation on R1 followed by Revision R2 and new independent Evaluation;
- blind identity explicit reveal and retry;
- peer aggregate concealment followed by applicable Evaluation reveal;
- selected → Withdrawal with cleanup failure/retry;
- concurrent Selection attempts near Capacity limit;
- new deck replacement after ready prior version;
- public-sharing revocation while Publication is live;
- old historical `publicId` request after exact Publication cutover;
- Archive followed by allowed Unpublish/export and denied ordinary mutation;
- stale Schedule generation proposal apply;
- Dispatch provider timeout with uncertain outcome;
- same-round Dispatch retry and new-round intentional repeat.

These scenarios should be automated where practical before execution handoff is considered complete.

# Rollback verification

Every slice must document which rollback level applies.

## Read rollback test

Demonstrate that semantic reads can be disabled while compatibility projections still explain the current state **without disabling canonical write capture**.

## Writer rollback test

Before canonical native writes are enabled, demonstrate full writer rollback.

After native writes begin, the test becomes: can legacy clients be supported through adapters/projections without re-enabling raw legacy authority? If not, the safe rollback is maintenance/read-only mode for that command slice.

## Projection repair test

Deliberately corrupt or alter a compatibility projection in a test copy and demonstrate repair from canonical owners without mutating canonical history.

## Durable-work recovery test

Demonstrate that a source-authoritative action with failed follow-up converges after retry and does not duplicate the effect.

## Backup/restore test

Demonstrate restoration of the pre-migration snapshot in an isolated environment and verify the associated application/schema version can read it.

This test validates disaster recovery; it does not authorize deleting post-cutover canonical history in a live rollback.

# Rollback safety categories

Each implementation change should be classified:

- **reversible behavior switch** — semantic vs compatibility read, feature/UI exposure;
- **additive persistent change** — new nullable field/table/history; may remain safely after application rollback;
- **history-bearing irreversible truth** — once used natively, cannot be deleted merely to restore legacy behavior;
- **security rollback floor** — exact public authorization/protected-data handling must not regress;
- **destructive cleanup** — only after removal gate and reverse/forward-repair plan.

# Cutover acceptance record

Before each semantic slice moves from shadow to authoritative use, record:

- scope/context;
- migration/backfill run IDs;
- unresolved expected legacy-unknowns;
- zero blocking defects statement;
- invariant validation result;
- parity result;
- rollback level and rollback procedure;
- operator/maintainer approval required by the implementation process.

This is operational migration evidence, not a new product approval concept.

# Legacy-retirement gate

A legacy field, enum, endpoint, helper, or query path may be retired only when:

1. target state exists for all supported active records;
2. canonical writes have been authoritative for the relevant slice;
3. first-party reads/writes no longer depend on the legacy surface;
4. external/documented consumers are migrated or formally unsupported;
5. parity/intentional-correction reports contain no unexplained defect;
6. legacy-unknown rows have a terminal compatibility disposition;
7. backup/restore and projection-repair procedures have been rehearsed;
8. no rollback procedure requires independent legacy writes;
9. tests/docs no longer describe the legacy surface as authority;
10. destructive migration can be executed without deleting required history.

# Cleanup candidates vs retainable projections

The architecture does not require physical removal of every legacy-shaped column.

Likely retirement candidates once gates pass:

- independent `programStatus` writes;
- `abstractReviewStatus` as command/policy authority;
- `REVIEWED` as a newly writable Deliverable state;
- mutable-latest public-file authorization;
- direct unarchive behavior;
- direct schedule clear-and-regenerate behavior;
- same-round resend controls that bypass semantic dedupe.

Potentially retainable projections when useful and repairable:

- integer `abstractVersion`;
- denormalized current Submission content;
- current `SubmissionTheme` mirror;
- projected `programStatus` for legacy export/display;
- projected `deckStatus` for supported native states;
- event-level public-surface visibility switch;
- current Term label/availability columns.

# Gap closure rule

No SG-* or SG-P* item becomes `implemented/closed` merely because its backfill completed.

A gap closes only after:

- target persistence/policy is active;
- canonical write path is active;
- required read/UI path is active or compatibility-safe;
- migration validation passes;
- runtime tests cover the accepted semantics;
- legacy competing authority is disabled for the supported scope.

003-G may use this rule to define the implementation execution handoff and future closure reporting.

# Non-goals

003-F does not require:

- zero-downtime migration if the deployment scale does not justify it;
- a distributed migration orchestrator;
- event sourcing;
- migration of unknowable history;
- removing all denormalized columns;
- immediate database-engine replacement.

The plan is designed to work with the current SQLite/Prisma architecture while establishing disciplined schema migration and reversibility.