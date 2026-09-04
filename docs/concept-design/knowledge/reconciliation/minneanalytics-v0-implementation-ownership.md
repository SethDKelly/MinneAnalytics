---
type: Implementation Ownership Map
title: MinneAnalytics v0 Implementation Ownership Map
description: Canonical semantic ownership map from the accepted 17-concept model to current MinneAnalytics implementation structures.
tags: [concept-design, implementation-reconciliation, ownership, architecture-mapping, v0]
status: stable
authority: canonical
phase: 003-A
sources:
  - { id: phase, resource: ../../003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md, title: 003-A Concept-to-Implementation Ownership Map & Semantic Gap Register }
  - { id: matrix, resource: ../../evidence/003-A-concept-to-implementation-ownership-matrix.md, title: 003-A Concept-to-Implementation Ownership Matrix }
  - { id: synchronization, resource: ../synchronizations/minneanalytics-v0.md, title: MinneAnalytics v0 Synchronization & Composition Contract }
---
# Purpose

Identify which current implementation structures realize each canonical concept, policy, synchronization, or derived projection without allowing physical code organization to redefine semantic ownership.

This map is a reconciliation contract, not a target schema. A current table or module may continue serving several semantic owners when the eventual architecture preserves their independent histories and invariants.

# Mapping status vocabulary

* **Strong** — the current structure substantially realizes the accepted semantics; later work may mainly clarify references or boundaries.
* **Partial** — useful state/behavior exists, but required history, identity precision, or independence is missing.
* **Conflicting** — current behavior can erase, overwrite, or contradict independently authoritative conceptual state.
* **Derived-only** — current code computes a useful projection but does not realize the concept's authoritative state.
* **Policy** — the implementation surface belongs to application eligibility/authority rather than concept state.

# Concept ownership map

| Concept | Primary current realization | Status | Canonical ownership consequence |
|---|---|---|---|
| [Proposal](../concepts/proposal.md) | `Submission.id` plus originator/current-content fields | Partial | `Submission.id` is a viable durable Proposal identity, but Proposal ownership must be separated semantically from mutable Revision content and downstream status fields. |
| [Revision](../concepts/revision.md) | `SubmissionRevision`; `Submission.abstractVersion`; current mutable content projection | Partial/strong | Existing revision rows preserve version snapshots, but exact Revision identity must become the reference for version-sensitive Evaluation and Classification rather than relying only on integer versions. |
| [Availability Window](../concepts/availability-window.md) | `Conference.submissionsOpenAt/submissionsCloseAt`, manual `submissionsOpen`, `getSubmissionWindowState` | Partial | timestamps align with the window; the boolean and broad conference status act as policy/override inputs and must not become duplicate canonical open-state. |
| [Evaluation](../concepts/evaluation.md) | `Score` and current-version scoring helpers | Conflicting | one `Score` row per submission/evaluator is overwritten when rescored against a newer version, so historical judgment about the prior Revision is not independently preserved. |
| [Controlled Disclosure](../concepts/controlled-disclosure.md) | `blindReviewEnabled`, masking helpers, identity reveal endpoint, score-gated aggregate visibility | Conflicting | visibility behavior exists, but persistent participant/context/information staging and monotonic reveal history do not. |
| [Feedback](../concepts/feedback.md) | `PresenterFeedback` | Partial/strong | immutable directed-response records align well; abstract-version integers should reconcile to exact Revision references, while workflow/status and email effects remain composition. |
| [Selection](../concepts/selection.md) | `Submission.programStatus`, `approvedAt`, program-status route | Conflicting | current disposition exists, but immutable Decision history is absent and the same field also represents Withdrawal. |
| [Withdrawal](../concepts/withdrawal.md) | `programStatus=WITHDRAWN`, `withdrawnAt` | Conflicting | source action is implemented, but it overwrites Selection and can later be erased when organizer status changes. |
| [Capacity](../concepts/capacity.md) | Conference capacity configuration + `computeCapacity` snapshot | Derived-only | current code estimates scarcity but has no authoritative Pool/Allocation/Release ledger or hard synchronized allocation invariant. |
| [Coverage Target](../concepts/coverage-target.md) | `Theme.targetMin/targetMax` + theme statistics/warnings | Partial | desired bounds are persisted but co-located with Vocabulary and lack independent target identity/history; observed counts and warnings are correctly projection-like. |
| [Vocabulary](../concepts/vocabulary.md) | `Theme` rows and theme administration helpers/routes | Partial/conflicting | stable IDs and retirement/restoration exist, but wording/availability changes overwrite history and unused terms may be physically deleted. |
| [Classification](../concepts/classification.md) | `SubmissionTheme` current join + `SubmissionRevision.themeIds` snapshots | Partial/conflicting | current classification is Proposal/submission-level; historical term sets are embedded in revision snapshots rather than represented as exact Revision↔Term relations. |
| [Deliverable](../concepts/deliverable.md) | `DeckFile` versions + `Submission.deckStatus` | Conflicting | artifact versions are strong evidence, but readiness is detached from the exact DeckFile/ArtifactVersion and assessment history is not preserved. |
| [Schedule](../concepts/schedule.md) | `ScheduleRoom`, `ScheduleSlot`, `SchedulePlacement`; manual placement and generation routes | Partial/strong | opportunity/placement semantics and human move/swap behavior are close; generated assignments currently overwrite authoritative placements directly. |
| [Publication](../concepts/publication.md) | `Conference.decksPublished`, `Submission.deckShareable`, deck eligibility queries, public IDs | Conflicting | public eligibility is implemented, but there is no explicit Publication identity/history bound to an exact MaterialRef; access can follow mutable current state. |
| [Dispatch](../concepts/dispatch.md) | `ConferenceEmailBatch`, `EmailSendRecord`, email template/send helpers | Partial/strong | batch/recipient/round history aligns well; exact rendered MessageRef is missing and same-round resend API semantics conflict with persistent uniqueness. |
| [Archive](../concepts/archive.md) | `Conference.status=ARCHIVED`, `archivedAt`, active-conference mutation guard | Conflicting | closure gating exists, but archive provenance can be erased by moving status away from ARCHIVED; current status enum is broader than Archive. |

# Physical aggregate decisions carried forward

## `Submission`

`Submission` is **not rejected as a physical aggregate**. It can remain useful as a read/write aggregate or compatibility structure if later architecture makes semantic ownership explicit.

Its current fields span at least:

- Proposal identity and participant/contact data;
- current Revision projection and version metadata;
- Selection/Withdrawal projection;
- Deliverable readiness projection;
- Classification current association;
- Publication/share policy inputs;
- Capacity accounting class (`isSponsorSession`);
- deferred Registration signal (`vipRegistered`).

Phase 003 must not infer that this requires immediate table decomposition. It does require eliminating cases where one aggregate field is the only source of truth for multiple independent histories.

## `Theme`

`Theme` currently co-locates Vocabulary term state and Coverage Target bounds, while `SubmissionTheme` supplies current Classification. Physical co-location may remain possible, but the semantic owners are distinct and their histories must not overwrite one another.

## `Conference`

`Conference` is an application/context aggregate, not a newly accepted concept. It currently carries Availability Window inputs, Archive/lifecycle state, Capacity configuration, Publication gate state, disclosure policy, and scheduling configuration. These fields must be mapped to concepts or application policy rather than promoted collectively into a `Conference` concept.

# Application-policy ownership

The following current implementation surfaces are primarily **policy mechanisms**, not missing concepts:

* `ReviewerRole`, `ReviewerAccess`, `lib/roles.ts`, and route capability checks → application authority policy;
* `assertConferenceAcceptsMutations` → broad lifecycle/mutation policy, later reconciled with Archive and explicit exceptions;
* `canPresenterEditSubmission` → edit-eligibility policy composed from Selection/Withdrawal/review state today;
* submission-window helper → Availability Window observation plus current manual/lifecycle policy;
* deck shareability → publication rights/share-policy input;
* sponsor-session label → Capacity accounting-class input;
* template definitions/merge rendering → Dispatch message-preparation input.

No Authorization, Workflow, ProgramStatus, or Communication concept is introduced by these mechanisms.

# Derived-projection ownership

The following current helpers/views are valuable but should remain reconstructible projections:

* current score aggregates and rescore queues;
* `SubmissionListItem.programStatus`-based active/program views until replaced by Selection + Withdrawal projection;
* theme/status heatmaps and theme gap labels;
* capacity snapshots based on room/session configuration;
* Deliverable work queues derived from current deck/artifact readiness;
* public deck listings;
* Dispatch eligible/already-sent recipient views.

Materializing a projection for performance or compatibility is permitted if its canonical inputs and refresh/reconciliation behavior are explicit.

# Reconciliation direction

The current implementation is **not a rewrite candidate by default**. Later Phase 003 work should prefer, in order:

1. reinterpret existing IDs/rows as canonical references where semantics already fit;
2. add missing history/reference precision alongside current structures;
3. derive compatibility fields/views from canonical owners where practical;
4. migrate only those structures whose present mutation semantics inherently erase independent truth;
5. split physical aggregates only when semantic correctness, migration safety, operability, or maintainability actually requires it.

Priorities and concrete semantic-loss cases are owned by the [003-A Semantic Gap Baseline](semantic-gap-baseline.md).
