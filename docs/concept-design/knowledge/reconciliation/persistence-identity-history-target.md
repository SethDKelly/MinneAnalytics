---
type: Persistence & Identity Target
title: MinneAnalytics v0 Persistence, Identity & History Target
description: Canonical target for stable references, durable histories, and compatibility projections required to reconcile the current implementation with the accepted v0 Concept Design model.
tags: [concept-design, implementation-reconciliation, persistence, identity, history, migration, v0]
status: stable
authority: canonical
phase: 003-B
sources:
  - { id: phase, resource: ../../003-B-persistence-identity-history-and-migration-target-design.md, title: 003-B Persistence, Identity, History & Migration Target Design }
  - { id: matrix, resource: ../../evidence/003-B-persistence-identity-history-target-matrix.md, title: 003-B Persistence Identity & History Target Matrix }
  - { id: ownership, resource: minneanalytics-v0-implementation-ownership.md, title: MinneAnalytics v0 Implementation Ownership Map }
  - { id: gaps, resource: semantic-gap-baseline.md, title: 003-A Semantic Gap Baseline }
  - { id: synchronization, resource: ../synchronizations/minneanalytics-v0.md, title: MinneAnalytics v0 Synchronization & Composition Contract }
---
# Purpose

Define which current MinneAnalytics identities remain authoritative implementation references, where new durable records are required, and which legacy aggregate fields may survive only as compatibility projections.

This target governs **semantic persistence**, not physical module boundaries. It does not require one table, service, route, or API per Concept Design concept.

# Governing persistence rules

1. **Reuse stable identities when their semantics already fit.** Do not create parallel IDs merely to make names match the concept catalog.
2. **Exact historical references beat mutable correlation fields.** Version-sensitive relationships should reference `SubmissionRevision.id`, `DeckFile.id`, or another exact stable row rather than only an integer version or mutable latest pointer.
3. **Create durable history where the accepted concept requires it.** A mutable compatibility field may not remain the sole source of truth when it can erase an independently meaningful event/state.
4. **Do not append history without evidence.** Mutable configuration that has no accepted history requirement may remain mutable.
5. **Compatibility projections are allowed but subordinate.** They must be reconstructible or verifiable against a named canonical owner and must not receive uncontrolled independent writes.
6. **Backfill is evidence, not time travel.** A migrated current-state seed is not an invented historical event.
7. **Physical aggregates may remain.** `Submission`, `Conference`, and `Theme` may continue co-locating several concerns where semantic ownership remains explicit.

# Stable identities retained

The following current IDs are accepted as the target references for their semantic objects:

| Target reference | Existing identity retained |
|---|---|
| ProposalRef | `Submission.id` |
| RevisionRef | `SubmissionRevision.id` |
| EvaluationRef | `Score.id` |
| FeedbackRef | `PresenterFeedback.id` |
| TermRef | `Theme.id` |
| ArtifactVersionRef | `DeckFile.id` |
| Schedule room/opportunity/placement references | existing Schedule IDs |
| Dispatch BatchRef | `ConferenceEmailBatch.id` |
| Dispatch SendRecord/MessageRef carrier | `EmailSendRecord.id` |
| current reviewer/participant reference where applicable | `ReviewerAccess.id` |

Renaming a physical model is optional and is not required for semantic correctness.

# New durable identities required

No current row can truthfully represent these accepted histories, so 003-B requires new persistent records or an equivalently strong representation:

- Availability Window identity;
- Controlled Disclosure relationship identity;
- Selection Decision identity/history;
- Withdrawal identity;
- Capacity Pool and Allocation identity;
- Coverage Target identity;
- Deliverable Requirement and Assessment identity;
- Publication and PublicationState identity/history;
- Archive closure identity;
- Vocabulary TermState identity/history.

These requirements arise from missing semantic state/history, not from a preference for one-table-per-concept.

# Exact reference decisions

## Revision as the version-sensitive anchor

`SubmissionRevision.id` is the canonical implementation reference for exact mutable-content state.

Target persistence should establish:

- an exact current-Revision reference from the Proposal/Submission aggregate;
- an exact predecessor relationship between successive Revision records;
- Evaluation subjects by Revision ID;
- Classification subjects by Revision ID;
- abstract Feedback by Revision ID when the feedback concerns an exact abstract state.

Existing integer `version` and `Submission.abstractVersion` may remain display/compatibility ordinals. They are not the preferred cross-concept foreign key.

Existing current mutable Submission fields may remain denormalized current-Revision projections if they are verified against the exact current Revision.

# Target realization by semantic area

## Offer/change/availability

### Proposal

Reuse `Submission.id`; no parallel Proposal table is required for v0.

### Revision

Reuse `SubmissionRevision`. Add exact predecessor/current-reference semantics while retaining the existing snapshots. The predecessor chain is authoritative for identity continuity; integer version remains a compatibility/order projection.

### Availability Window

Introduce a distinct persistent Window record for the current proposal-submission opportunity. It must have:

- stable Window identity;
- application context/opportunity reference;
- non-null `opensAt` and `closesAt`;
- `opensAt < closesAt`.

Legacy `Conference.submissionsOpenAt/submissionsCloseAt` may mirror the Window during rollout. `Conference.submissionsOpen` remains application policy/override, not Window state.

# Evaluation/disclosure/feedback

## Evaluation

Reuse `Score.id` as Evaluation identity.

The target subject relation is exact `SubmissionRevision.id`, with uniqueness by evaluator + exact Revision. Revising judgment for the same Revision updates the same Evaluation; judging a later Revision creates another Evaluation.

`submissionId` and `scoredAbstractVersion` may remain denormalized compatibility fields during migration, but cannot remain the only exact-subject representation.

## Controlled Disclosure

Introduce durable participant/context/information exposure records with stage and reveal provenance. The concrete v0 implementation may use `ReviewerAccess.id` for the participant and Proposal/Revision references for review context/information identity.

The target must preserve the uniqueness and monotonic reveal properties defined by [Controlled Disclosure](../concepts/controlled-disclosure.md). 003-D owns the exact information-key and reveal-authority policy.

## Feedback

Reuse `PresenterFeedback.id`. Abstract feedback should reference the exact Revision; general feedback may remain associated only with the durable Proposal/application context where no exact Revision is intended.

# Choice/participation/scarcity/representation

## Selection

Introduce immutable Decision records per selection context + Proposal, with predecessor links and optional outcome for explicit clearing. Current Selection is the terminal Decision or no disposition after a clear.

`ProgramStatus` becomes a compatibility projection only.

## Withdrawal

Introduce one immutable Withdrawal record per current v0 Proposal/participation identity with actor/time provenance. It is independent from Selection and cannot be removed because an organizer later changes Selection.

## Capacity

Introduce durable:

- Pool identity/current finite limit;
- class-rate configuration;
- Allocation records with immutable applied units and allocation provenance;
- one-time release provenance on each Allocation.

The initial v0 implementation should not invent sponsor-specific unit rates. Current evidence shows sponsor/community labels affecting planning counts, not different scarce-unit consumption. A one-unit standard class is sufficient unless later evidence establishes a different rate.

Current room/session configuration may help establish or resize the Pool but is not the allocation ledger.

## Coverage Target

Introduce a generic Target identity over:

- collection/context;
- dimension;
- bucket/value;
- measure;
- optional lower/upper bounds.

This supports both Theme-based targets and, if validated, sponsor/session-kind representation targets without encoding them as Capacity rates.

Legacy `0/0` values are not automatically a zero-width target; absent target must remain distinguishable from numeric zero.

# Vocabulary/classification

## Vocabulary

Reuse `Theme.id` as TermRef and add immutable TermState history for label + availability changes. Current `Theme.name` and `removedAt` may remain current projections.

`slug`, `source`, and `sortOrder` remain application metadata. Coverage Target bounds do not belong to TermState.

Once a Theme/Term has durable historical references, hard deletion is incompatible with the accepted Vocabulary semantics.

## Classification

Introduce an exact set-like `RevisionRef × TermRef` relation, concretely exact `SubmissionRevision.id × Theme.id` for v0.

Existing `SubmissionRevision.themeIds` is migration evidence/legacy snapshot. Existing `SubmissionTheme` may remain a current-Revision compatibility mirror, but neither remains canonical once the exact relation is established.

# Deliverable/schedule

## Deliverable

Introduce a durable Deliverable Requirement identity for Proposal + responsible party + artifact kind.

Reuse `DeckFile.id` as ArtifactVersionRef and attach each file to its Deliverable. Preserve exact artifact predecessor/current relationships.

Introduce immutable version-specific Assessment records (`concern` or `ready`) with reviewer/time/detail and predecessor history.

`Submission.deckStatus` becomes a compatibility projection. `REVIEWED` has no accepted intrinsic Deliverable equivalent and must not be promoted into the target history solely to preserve the old enum.

## Schedule

The existing Room/Slot/Placement persistence is acceptable as the v0 target substrate. 003-B does not add a Schedule history hierarchy. Generator acceptance and placement mutation authority belong to 003-C/003-E.

# Publication/dispatch/archive

## Publication

Introduce:

- Publication identity bound to one exact MaterialRef and PublicSurfaceRef;
- immutable PublicationState records representing published/unpublished transitions.

For the current deck use case, `DeckFile.id` is the MaterialRef. `DeckFile.publicId` remains a delivery/address token, not Publication identity.

An existing Publication never silently repoints when a later DeckFile becomes current.

## Dispatch

Retain existing Batch and SendRecord IDs and strengthen SendRecord as exact performed-send evidence.

New sends must persist the exact rendered subject/body (or an immutable equivalent MessageRef) together with the stable recipient identity and endpoint used. Mutable template identity alone is insufficient.

Current submission/attendee foreign keys can provide stable RecipientRef semantics; implementation may add an explicit recipient kind if useful for enforcing invariants.

## Archive

Introduce an immutable Archive closure record keyed to the Conference/application context, including actor/time provenance.

`Conference.status` may continue representing broader lifecycle policy, but a later status transition cannot delete the Archive record. `archivedAt` becomes compatibility/current-view data rather than the only closure authority.

# Compatibility projection contract

During migration, these current surfaces may remain only as controlled projections or policy inputs:

| Compatibility surface | Canonical owner / interpretation |
|---|---|
| `programStatus` | current Selection + Withdrawal projection |
| `approvedAt` | current/latest selected Decision compatibility |
| `withdrawnAt` | Withdrawal |
| `abstractVersion` | current exact Revision ordinal |
| current title/abstract/bio/technical level | current Revision projection |
| `abstractReviewStatus` | application workflow/view policy, not canonical concept state |
| `SubmissionTheme` | current Revision Classification mirror |
| `deckStatus` | current ArtifactVersion Assessment projection |
| submission-window timestamp columns | Availability Window mirror |
| `submissionsOpen` | manual availability policy override |
| `Theme.name` / `removedAt` | current TermState projection |
| Theme/sponsor target columns | Coverage Target compatibility |
| `decksPublished` | publication collection/policy compatibility, not exact Publication state |
| `deckShareable` | Publication rights/share policy input |
| `status` / `archivedAt` | broader lifecycle compatibility + Archive projection |
| Dispatch recipient count | cached projection from SendRecords |

A compatibility surface must not receive independent writes once canonical write ownership has moved.

# Persistence/deletion posture

Historical records whose semantics require retained truth must not disappear as an accidental consequence of deleting a convenience aggregate.

Before implementing new history tables, later phases must define whether application deletion is:

- prohibited/restricted after durable history exists;
- transformed into retention/Archive behavior; or
- explicitly designed with reference-preserving deletion semantics.

Do not automatically copy the current broad `onDelete: Cascade` pattern into new Selection, Withdrawal, Evaluation, Disclosure, Vocabulary, Deliverable Assessment, Publication, or Archive histories.

# Gap disposition

003-B assigns a target representation to the structural aspects of SG-001 through SG-018. The gaps are **designed but not implemented**; they remain open until the runtime architecture/migration phases execute and verify them.

The authoritative recoverability and rollout posture is in [003-B Migration Target Baseline](migration-target-baseline.md).

# Implementation boundary

This target does not authorize a Prisma migration or product code change.

003-C must define transaction/idempotency/recovery behavior before coordinated writes are implemented. 003-D must finalize authority/disclosure/lifecycle policy, 003-E must decide compatibility API/UI projections, and 003-F must produce the executable migration/backfill/rollback plan.