---
type: Synchronization Execution Target
title: MinneAnalytics v0 Synchronization, Transaction & Recovery Target
description: Canonical execution semantics for atomic coordination, source-authoritative convergence, compatibility projections, and cross-boundary effects in the v0 reconciliation architecture.
tags: [concept-design, implementation-reconciliation, synchronization, transaction, recovery, idempotency, v0]
status: stable
authority: canonical
phase: 003-C
sources:
  - { id: phase, resource: ../../003-C-synchronization-transaction-idempotency-and-recovery-architecture.md, title: 003-C Synchronization Transaction Idempotency & Recovery Architecture }
  - { id: execution-matrix, resource: ../../evidence/003-C-synchronization-execution-matrix.md, title: 003-C Synchronization Execution Matrix }
  - { id: composition, resource: ../synchronizations/minneanalytics-v0.md, title: MinneAnalytics v0 Synchronization & Composition Contract }
  - { id: persistence, resource: persistence-identity-history-target.md, title: MinneAnalytics v0 Persistence Identity & History Target }
---
# Purpose

Define how the accepted v0 synchronizations are executed without allowing orchestration mechanics to become new domain authority.

The application may use transactions, durable work records, retries, and provider-specific adapters as implementation infrastructure. None is a new Concept Design concept.

# Execution classes

Every coordinated mutation belongs to one of four execution classes.

## TX-A — Atomic authoritative bundle

Use one database transaction when all required authoritative state is local and the initiating action is not truthful unless every hard invariant/effect is established.

Failure means **none of the authoritative bundle commits**.

Primary v0 uses:

- initial Proposal + Revision + exact Classification establishment;
- accepted Revision + complete exact Classification set + current-Revision projection;
- Evaluation + policy-triggered Controlled Disclosure reveal when both are local;
- Selection entry that first creates effective participation + required Capacity Allocation + required Deliverable Requirement;
- canonical write + compatibility projection when the projection is stored in the same database.

## TX-B — Source-authoritative commit + convergent follow-up

Use when the initiating action remains independently true even if downstream cleanup temporarily fails.

The source transaction commits:

1. the authoritative source record;
2. any compatibility projection whose immediate consistency is required;
3. durable synchronization work for every required follow-up.

Follow-up effects execute after commit and retry idempotently.

Primary v0 uses:

- Withdrawal;
- Selection changes/clears that end effective participation;
- other eligibility-loss events that require Capacity release, Schedule unplacement, or Publication unpublish.

The source fact must never be erased to make failed cleanup appear consistent.

## TX-C — Independent notification / external-effect follow-up

Use when a domain action may motivate an external operation but that operation is not part of the source concept truth.

Examples:

- Feedback followed by notification Dispatch;
- Selection approval followed by an operational notification;
- Deliverable reminder Dispatch.

Commit the source truth first. External communication failure must not undo Feedback, Selection, Deliverable state, or another authoritative source record.

## TX-D — Non-transactional resource boundary

Use when a database transaction cannot atomically include the external resource/provider operation.

Examples:

- file/object storage;
- email/provider handoff;
- future third-party APIs.

The implementation must use a durable prepare/commit/reconcile pattern rather than pretending a database transaction spans the external system.

# Required synchronization execution

## SYNC-001 — Offer → initial Revision + Classification

**Class:** TX-A.

One transaction should:

1. create/reuse the Proposal aggregate identity;
2. create its initial exact Revision;
3. establish the complete exact Revision↔Term Classification set;
4. set the exact current Revision reference;
5. update any legacy current-content/current-theme projections.

The operation succeeds only when the initial version is complete. A Proposal must not become visible as successfully offered while its canonical Revision/Classification representation is missing.

## SYNC-002 — Revise → exact Classification + current projection

**Class:** TX-A.

One transaction should:

1. create the successor Revision with the expected current Revision as predecessor;
2. create the complete desired Revision↔Term set;
3. atomically move the current Revision pointer;
4. refresh controlled compatibility projections such as `abstractVersion`, current content fields, `SubmissionTheme`, and relevant review-work projections.

A concurrent edit must not create two accepted successors from the same current head without an explicit future branching design.

## SYNC-003 — Evaluation → eligible reveal

**Class:** TX-A when Evaluation and Controlled Disclosure share the local database.

After recording/revising the Evaluation for the exact current Revision, the transaction may conditionally reveal the staged peer/aggregate information relation.

The reveal must be conditional (`still concealed`) and therefore retry-safe. Evaluation does not absorb reveal state.

If the disclosure effect ever moves outside the local transactional boundary, it becomes TX-B with the Evaluation authoritative and reveal convergent.

## SYNC-004 / SYNC-005 — Effective-participation entry

**Class:** TX-A.

A Selection command that changes a Proposal from not effectively participating to effectively participating must not commit unless the required Capacity Allocation can be established.

The same transaction should normally include:

- the immutable Selection Decision;
- Capacity Allocation;
- first Deliverable Requirement when required and absent;
- compatibility `programStatus`/approval projection;
- any local projection refresh that must be exact at commit.

Capacity is a hard precondition, not cleanup work.

Coverage Target warnings and confirmation remain policy checks before this transaction and never substitute for Capacity.

## SYNC-006 / SYNC-007 / SYNC-008 — Effective-participation exit and eligibility loss

**Class:** TX-B.

The source transaction records the Withdrawal or Selection Decision first and establishes durable follow-up work for applicable effects:

- release active Capacity Allocation;
- unplace Schedule activity;
- unpublish ineligible Publication(s);
- other explicitly accepted cleanup.

User-facing effective-participation projections must reflect the source truth immediately, even if stale downstream records remain temporarily.

A stale active allocation may conservatively reduce apparent available Capacity until release converges; it must never cause the application to pretend a withdrawn Proposal is still participating.

# Durable synchronization work

Source-authoritative follow-up requires a persistent implementation work record (name intentionally unspecified).

Minimum semantics:

- stable `syncId` such as `SYNC-006`;
- stable source event/reference;
- semantic effect key identifying the intended target effect;
- state such as pending / processing / completed / blocked;
- attempt count and last-attempt time;
- diagnostic failure detail suitable for operations;
- creation/completion timestamps.

A unique key over `(syncId, sourceRef, effectKey)` must prevent duplicate work from representing the same required effect.

This work ledger is infrastructure. It does not become a `Workflow`, `SynchronizationManager`, or cross-concept Audit Trail concept.

# Follow-up effect idempotency

Every convergent effect must be defined so processing it repeatedly reaches the same target state.

Examples:

- Capacity release: if the mapped allocation is already released or no active allocation remains, success/no-op;
- Schedule unplace: if the Proposal is already unplaced, success/no-op;
- Publication unpublish: if the applicable Publication is already unpublished, success/no-op;
- Deliverable requirement establishment: if the unique requirement already exists, return it rather than duplicate it;
- Controlled Disclosure reveal: if already revealed, preserve original reveal provenance rather than overwrite it.

Retries must not create synthetic second domain events merely because an implementation attempt was repeated.

# Compatibility-projection transaction rule

Once a canonical owner becomes write-authoritative, stored legacy fields are projections.

Where canonical and compatibility state share the same database, update them in the same transaction when practical.

Examples:

- Selection/Withdrawal → `programStatus`, `approvedAt`, `withdrawnAt` projection;
- Revision → current Submission fields and `abstractVersion`;
- Classification → `SubmissionTheme` current mirror;
- Deliverable Assessment → `deckStatus`;
- Vocabulary TermState → `Theme.name` / `removedAt`;
- Archive → `archivedAt` compatibility view.

Do not implement steady-state bidirectional repair in which either side may silently win. Before cutover, legacy→canonical shadow/backfill may exist; after canonical write authority, direction is canonical→compatibility.

# Concurrency and invariant enforcement

Correctness must ultimately rely on transactional conditions and database constraints, not only pre-read checks in route code.

Required patterns include:

- Revision successor creation uses an expected current-head check;
- Evaluation uniqueness is evaluator + exact Revision;
- Controlled Disclosure staging has unique participant/context/information identity and reveal is conditional on unrevealed state;
- Selection decision append observes the expected current Decision/head;
- only one active Capacity Allocation may exist for a Pool+commitment and committed units may never exceed Pool limit;
- Deliverable and Publication state-chain appends observe the expected current head;
- Vocabulary state-chain appends observe the expected current TermState;
- Dispatch semantic dedupe is enforced by stable recipient + context/key/round constraints.

The current SQLite implementation may serialize many writes, but the architecture must not depend on application-level check-then-write races being impossible forever.

# Schedule generation

Schedule generation is a suggestion computation, not authoritative mutation.

Target sequence:

1. read an explicit base placement version/snapshot;
2. compute a proposed assignment set without clearing authoritative placements;
3. present/accept the proposal according to 003-E interaction design;
4. apply the accepted complete placement delta in one transaction using an expected-base check;
5. reject/recompute when the Schedule changed since the proposal was generated.

The current clear-then-loop update pattern must not be the target because failure midway can leave a partially generated schedule and the generator silently becomes authority.

# External provider / Dispatch boundary

A database transaction cannot guarantee exactly-once external delivery.

Before provider handoff, the application must durably preserve:

- semantic recipient identity;
- endpoint;
- exact rendered message;
- context/key/round;
- an idempotency/attempt identity.

A provider handoff must then be reconciled according to outcome:

- known success → establish/confirm canonical performed SendRecord;
- known failure before handoff → retry is safe;
- timeout/unknown outcome → do not blindly send again unless provider idempotency makes replay safe; mark as uncertain/blocked for reconciliation.

If a provider supports idempotency keys, use the semantic send identity or a stable derivative.

Implementation attempt state is not the same as canonical Dispatch SendRecord: a SendRecord means the application considers the handoff performed.

# File/artifact storage boundary

Artifact bytes and database metadata cannot currently be committed atomically.

Target upload behavior must therefore be recoverable:

1. validate and stage/store bytes under a collision-safe immutable location;
2. create the canonical ArtifactVersion and related compatibility projection transactionally;
3. if the database commit fails, mark/remove the unreferenced staged object through cleanup;
4. if storage succeeds but the client retries, semantic/idempotency checks must avoid creating unintended duplicate logical versions;
5. never point an ArtifactVersion at bytes that were not successfully persisted.

Content hashes or stable upload-operation IDs may be used as implementation aids; the Concept Design model does not require a particular storage provider.

# Recovery observability

Required synchronization work must be inspectable operationally.

At minimum, operators must be able to determine:

- pending/blocked work count by `SYNC-*` family;
- oldest outstanding work age;
- source and intended target effect;
- last error/attempt;
- whether authoritative source state is already safe for user-facing projections;
- whether manual intervention is required.

This is operational visibility, not a new user-facing Audit Trail concept.

# User-visible success rule

Return success according to the execution class:

- TX-A: only after the complete authoritative bundle commits;
- TX-B: after the source transaction and durable follow-up work commit; cleanup may still be pending;
- TX-C: after the source/domain action commits; notification failure is separately surfaced/retried as appropriate;
- TX-D: only after the application has the durable state needed to truthfully describe the external-resource outcome according to that operation's contract.

003-E owns how pending cleanup or external uncertainty is presented in UI/API responses.

# Non-goals

This architecture does not require:

- Kafka, a message broker, or distributed saga framework for v0;
- one worker/service per concept;
- global event sourcing;
- a generic Workflow concept;
- exactly-once external provider semantics when the provider cannot supply them.

A relational durable-work/outbox pattern inside the existing application boundary is sufficient for v0 if it meets these contracts.

# Handoff

The detailed retry/operation-key contract is owned by [003-C Idempotency & Recovery Baseline](idempotency-recovery-baseline.md).

003-D must finalize authority/lifecycle/disclosure policy; 003-E must finalize API/UI compatibility and schedule-acceptance interaction; 003-F must convert these contracts into an executable migration/deployment/recovery plan.