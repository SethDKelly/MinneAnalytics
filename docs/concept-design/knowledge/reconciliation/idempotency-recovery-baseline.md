---
type: Idempotency & Recovery Baseline
title: MinneAnalytics v0 Idempotency & Recovery Baseline
description: Canonical retry, command-key, synchronization-work, uncertainty, and recovery rules for Phase 003 implementation reconciliation.
tags: [concept-design, implementation-reconciliation, idempotency, recovery, retry, operations, v0]
status: stable
authority: canonical
phase: 003-C
sources:
  - { id: phase, resource: ../../003-C-synchronization-transaction-idempotency-and-recovery-architecture.md, title: 003-C Synchronization Transaction Idempotency & Recovery Architecture }
  - { id: recovery-matrix, resource: ../../evidence/003-C-failure-idempotency-and-recovery-matrix.md, title: 003-C Failure Idempotency & Recovery Matrix }
  - { id: execution, resource: synchronization-transaction-recovery-target.md, title: MinneAnalytics v0 Synchronization Transaction & Recovery Target }
  - { id: migration, resource: migration-target-baseline.md, title: MinneAnalytics v0 Migration Target Baseline }
---
# Purpose

Ensure that user retries, platform retries, process crashes, and partial external failures do not manufacture duplicate domain events, erase source truth, or make uncertain side effects look certain.

# Idempotency rule

> **Retry the operation, not the story.**

An implementation retry must converge on the domain result intended by the original command. It must not create another Revision, Selection Decision, Withdrawal, Publication transition, SendRecord, or other history event solely because transport/application execution was repeated.

# Idempotency mechanisms

Use the narrowest mechanism that preserves the accepted semantics.

## Semantic uniqueness

Prefer intrinsic unique keys where the domain result itself is naturally unique:

- one Withdrawal per v0 participation;
- one staged Controlled Disclosure per participant/context/information;
- one active Capacity Allocation per pool/commitment;
- one Dispatch SendRecord per context/key/round/recipient;
- one Deliverable Requirement per application-defined subject/kind where the policy says it is singular.

## Expected-head / compare-and-append

Use an expected current head for append-style histories where a duplicate or stale write would otherwise create another meaningful event:

- Revision successor;
- Selection Decision;
- Vocabulary TermState;
- Deliverable Assessment;
- PublicationState.

A command based on a stale expected head must fail/reload rather than silently append to a history the actor did not see.

## Command idempotency key

For retryable commands that legitimately create a new append event, the target API should support a stable operation/command key.

The key may be stored on the created event or in a narrow command-receipt infrastructure record. Repeating the same command key returns/reuses the original committed result.

Recommended for:

- Proposal offer;
- Revision submit;
- Selection decide/clear;
- Deliverable provision/assessment;
- Publication publish/unpublish/republish;
- Schedule accepted-apply;
- performed Dispatch initiation.

This infrastructure does not become a user-facing command-history concept.

# Synchronization work keys

Convergent follow-up work must be uniquely keyed by:

`(syncId, sourceRef, effectKey)`.

Examples:

- `SYNC-006 + Withdrawal#W + CapacityAllocation#A`;
- `SYNC-007 + Withdrawal#W + Proposal#P/Schedule`;
- `SYNC-008 + SelectionDecision#D + Publication#PUB`.

A duplicate enqueue attempt returns/reuses the existing work item.

# Retry classes

## Safe automatic retry

Automatic retry is appropriate when:

- the target operation is intrinsically idempotent or guarded by a unique key;
- outcome is known to have failed before any non-idempotent external effect;
- the operation uses provider idempotency capable of safely replaying an uncertain request.

## Retry after read/reconciliation

Retry only after checking current target state when:

- a transaction may have committed but the response was lost;
- a state-chain append may already exist;
- a synchronization effect can be recognized semantically from current state.

The recovery path should adopt the already-established result rather than append another event.

## Manual/blocked reconciliation

Do not automatically retry when an external effect may have happened but cannot be queried or replayed idempotently.

Examples include provider timeouts where the system cannot tell whether an email/message was accepted.

Such work becomes blocked/uncertain until:

- provider evidence resolves the outcome;
- an operator explicitly chooses a safe resolution;
- a later provider-specific idempotency mechanism makes replay safe.

# Crash boundaries

The architecture must remain truthful under these crash points.

## Before source transaction commits

No source truth or follow-up work is visible. Normal retry may start again subject to command idempotency.

## After source commit but before response

The client may retry. Command idempotency/semantic state must return the already committed result rather than duplicate it.

## After source commit but before follow-up execution

Durable synchronization work remains pending and can be drained independently. Source truth remains user-visible.

## During follow-up effect

The processor re-reads authoritative target state and applies the effect conditionally. On crash, the work item remains/reverts retryable unless outcome is externally uncertain.

## After effect but before work completion marker

A retry re-observes that the semantic target effect already exists and marks the work complete without duplicating domain history.

# Capacity-specific concurrency

Selection entry cannot rely on a precomputed `remaining` value outside the transaction.

The target must serialize/guard Pool allocation so two simultaneous approvals cannot both observe enough remaining units and over-allocate.

Acceptable implementations include a transaction/locking strategy plus database invariant/unique enforcement appropriate to the production database.

If Capacity cannot be allocated, the Selection entry transaction fails without committing the newly-effective Selection Decision.

# Withdrawal-specific recovery

Withdrawal is source-authoritative.

The source transaction must be idempotent:

- if the same participation is already withdrawn, return the existing Withdrawal;
- do not replace the original withdrawal actor/time on retry;
- ensure required cleanup work exists exactly once.

If Capacity release, Schedule unplacement, or Publication cleanup is blocked, `isWithdrawn` and effective participation remain based on the Withdrawal record, not cleanup completion.

# Selection-exit recovery

A deliberate later Selection Decision that ends effective participation is also durable source truth once committed.

Downstream cleanup follows the same convergence pattern as Withdrawal. A cleanup failure must not restore the earlier Selection disposition merely to make projections line up.

# Controlled Disclosure recovery

`Reveal` is monotonic.

A retry must preserve the first successful reveal actor/time. If the relationship is already revealed, processing is successful/no-op for synchronization purposes.

Do not rewrite reveal provenance with the later retrying process identity.

# Schedule apply recovery

An accepted generated/manual batch placement change must have:

- a stable command key;
- expected base/schedule version or equivalent concurrency token;
- one transaction for the complete accepted delta.

If the response is lost after commit, retry with the same command key returns the committed result.

A stale base causes conflict/review rather than partial overwrite.

# Dispatch/provider recovery

Exactly-once external delivery cannot be assumed.

The target separates:

1. prepared immutable delivery intent/evidence;
2. provider attempt state;
3. canonical performed SendRecord once handoff is known/accepted.

Required behavior:

- never generate a new semantic recipient/round identity merely because a provider call is retried;
- use provider idempotency keys where available;
- known failure before handoff can retry automatically;
- unknown provider outcome becomes uncertain/blocked when replay could duplicate delivery;
- known handoff success creates/confirms exactly one canonical SendRecord;
- an intentional repeat communication uses a new semantic round, not a resend override that defeats dedupe.

# File-storage recovery

A stored file object without a committed ArtifactVersion is an orphan, not a Deliverable version.

Recovery must support:

- orphan detection/cleanup;
- idempotent recognition of a retried upload operation when possible;
- no ArtifactVersion creation until storage is known durable;
- no silent reuse of partial/failed bytes;
- immutable artifact storage for committed ArtifactVersions.

The exact storage reconciliation mechanism remains implementation-specific.

# Projection-repair recovery

Compatibility projection repair is allowed but one-directional after canonical cutover.

A repair process may recompute:

- `programStatus` from Selection + Withdrawal;
- current Submission content/version from current Revision;
- current `SubmissionTheme` from current Revision Classification;
- `deckStatus` from current ArtifactVersion Assessment;
- Theme current fields from current TermState;
- current Archive/public compatibility flags where defined.

Projection repair must never infer missing canonical history from the projection after canonical authority has moved.

# Poison / permanently blocked work

Repeated technical failure must not cause infinite invisible retries.

The implementation should support a bounded retry/backoff policy and a blocked state containing enough diagnostics for operator action.

A blocked synchronization is an operational defect to surface, but its existence does not create a new business lifecycle state.

# Recovery invariants

1. A retry cannot create a second semantic event for the same command key.
2. A synchronization retry cannot duplicate an already-established target effect.
3. Source-authoritative facts survive downstream recovery failure.
4. Unknown external outcomes remain explicitly uncertain; they are not converted into success or safe-to-retry without evidence.
5. Compatibility repair flows canonical→legacy after canonical cutover.
6. Retry metadata/attempt counts are infrastructure and do not replace concept-local provenance.
7. Recovery never fabricates historical actor/time/value information absent from source evidence.

# Handoff

003-E must define API/UI conflict and pending/uncertain representations. 003-F must define concrete retry schedules, operational drain mechanisms, database migration constraints, provider reconciliation procedures, and failure-injection validation.