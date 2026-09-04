---
type: Semantic Gap Baseline
title: 003-A Semantic Gap Baseline
description: Prioritized canonical register of semantic mismatches between the accepted v0 Concept Design model and the existing MinneAnalytics implementation.
tags: [concept-design, implementation-reconciliation, semantic-gap, migration, v0]
status: stable
authority: canonical
phase: 003-A
sources:
  - { id: phase, resource: ../../003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md, title: 003-A Concept-to-Implementation Ownership Map & Semantic Gap Register }
  - { id: evidence, resource: ../../evidence/003-A-semantic-gap-register.md, title: 003-A Semantic Gap Register }
  - { id: prior, resource: ../../evidence/002-G-implementation-reconciliation-register.md, title: 002-G Implementation Reconciliation Register }
---
# Purpose

Provide stable gap IDs and priority for Phase 003. Detailed source-path evidence belongs in the historical [003-A Semantic Gap Register](../../evidence/003-A-semantic-gap-register.md); this node owns the current compact disposition.

Priority is semantic/data-loss risk, not implementation effort.

# High-priority semantic gaps

| ID | Area | Gap | Required reconciliation outcome |
|---|---|---|---|
| SG-001 | Evaluation history | rescoring updates one `Score` row and moves its version marker, losing the prior Revision-specific Evaluation | preserve one independently referable Evaluation per evaluator + exact Revision subject; later edits to the same Evaluation may remain mutable per concept spec |
| SG-002 | Selection history | `programStatus` stores only current organizer outcome | preserve immutable Selection Decision history while supporting a current-disposition compatibility projection |
| SG-003 | Withdrawal independence | Withdrawal overwrites `programStatus`, and later organizer changes clear `withdrawnAt` | preserve monotonic Withdrawal independently from Selection and make downstream cleanup convergent |
| SG-004 | Capacity authority | only derived capacity snapshots/configuration exist | define durable Pool/Allocation/Release realization and enforce Capacity before newly effective participation succeeds |
| SG-005 | Controlled Disclosure history | identity/aggregate disclosure is computed or console-logged rather than persistently staged/revealed per participant/context/information | establish durable disclosure relationships and monotonic reveal semantics without turning them into RBAC |
| SG-006 | Revision Classification | current `SubmissionTheme` associations are submission-level; revision term sets live only in JSON snapshots | realize exact Revision↔Term Classification and preserve historical sets; determine compatibility projection for current submission themes |
| SG-007 | Deliverable readiness | `deckStatus` is detached from versioned `DeckFile` and prior assessment changes are overwritten | bind readiness/concern assessment history to exact ArtifactVersion |
| SG-008 | Publication identity/history | public state is a mutable conference gate plus dynamically derived latest eligible decks | establish explicit exact MaterialRef Publication identity/current exposure/history or an equivalently precise realization |
| SG-009 | Historical public artifact access | a known old deck `publicId` can be authorized from current parent state | decide intended historical-public behavior and ensure only explicitly intended MaterialRefs remain exposed |
| SG-010 | Archive provenance | changing away from `ARCHIVED` clears closure provenance | preserve immutable Archive closure; if reopen is required, design it without erasing prior closure |
| SG-011 | Vocabulary history | term rename/availability changes overwrite `Theme` state and unused terms can be deleted | preserve stable Term identity plus wording/availability history where canonical behavior requires it |

# Medium-high priority gaps

| ID | Area | Gap | Required reconciliation outcome |
|---|---|---|---|
| SG-012 | Proposal/Revision projection | current mutable content is duplicated on `Submission` while snapshots are stored in `SubmissionRevision` | choose canonical persistence/reference ownership and make any current-row copy an explicit projection/denormalization |
| SG-013 | Availability Window | timestamps coexist with a manual boolean and broad Conference status; boundary semantics differ from canonical half-open interval | define the authoritative interval plus explicit override/lifecycle policy and remove ambiguous duplicate open-state authority |
| SG-014 | Schedule generation | generated assignments clear and directly rewrite authoritative placements | preserve explicit planner authority through preview/apply or another auditable acceptance boundary |
| SG-015 | Dispatch message evidence | send history lacks immutable exact rendered message content/reference | retain exact per-recipient MessageRef efficiently while preserving existing Batch/SendRecord strengths |
| SG-016 | Dispatch resend semantics | `includeAlreadyEmailed` can conflict with same-round uniqueness | make same-round attempts idempotent and use a new semantic round for intentional repeat contact |
| SG-017 | Feedback coupling | creating Feedback also mutates `abstractReviewStatus` and sends email directly | separate Feedback record from edit-opportunity/workflow projection and notification Dispatch |
| SG-018 | Coverage/Vocabulary co-location | `Theme` mixes target bounds with term state and helper fallback thresholds blend target absence with warning policy | preserve Coverage Target authority separately even if physically co-located; make no-target/default-warning semantics explicit |

# Cross-cutting policy gaps

These remain policy-reconciliation questions rather than new concepts:

* **SG-P01 — Edit eligibility:** presenter editing currently depends on `ProgramStatus`/`AbstractReviewStatus` and active Conference, while the canonical contract composes authority, Availability Window, Archive/lifecycle, and explicit exceptions.
* **SG-P02 — Authority naming/capability:** current `ADMIN`/`BOARD`/`CHAIR` helpers are a viable policy implementation, but routes should eventually consume explicit capabilities consistently rather than make role names semantic concept state.
* **SG-P03 — Archive/post-event operations:** current `assertConferenceAcceptsMutations` is a broad active-only gate; permitted post-closure Publication, Dispatch, export, or correction behavior must be explicit.
* **SG-P04 — Publication share/rights:** `deckShareable` is an implementation input to Publication eligibility; its authority, provenance, and change semantics must be made explicit during policy reconciliation.

# Current target-design status

Phase 003 architecture has now supplied target designs without closing implementation obligations.

* **SG-001** — exact Revision-specific Evaluation persistence was designed in 003-B; 003-E preserves `Needs score`/`Needs rescore` only as derived queues over exact Evaluation applicability.
* **SG-002 / SG-003** — Selection/Withdrawal history and execution were designed in 003-B/003-C; 003-E defines the lossy `programStatus` compatibility projection and requires semantic UI/API separation.
* **SG-004** — durable Capacity authority and atomic entry were designed in 003-B/003-C; 003-E requires Capacity to present as a hard constraint distinct from advisory Coverage views.
* **SG-005** — persistence and staging/reveal policy were designed in 003-B/003-D; 003-E defines explicit protected-information read states instead of blank/null concealment signals.
* **SG-006** — exact Revision↔Term Classification was designed in 003-B; 003-E permits `SubmissionTheme` only as a current-Revision compatibility projection.
* **SG-007** — exact ArtifactVersion Assessment persistence was designed in 003-B; 003-E replaces native `deckStatus` authority with exact-artifact readiness and keeps `REVIEWED` only as legacy residue.
* **SG-008 / SG-009** — exact Publication persistence and eligibility/public-token policy were designed in 003-B/003-D; 003-E defines exact-material public listing/fetch semantics and immediate suppression during cleanup convergence.
* **SG-010** — monotonic Archive target was designed in 003-B/003-D; 003-E makes `ConferenceStatus` a compatibility mode/projection and avoids using `readOnly` as authorization.
* **SG-011** — Vocabulary state history was designed in 003-B; 003-E requires UI/API to consume current term state without making legacy Theme fields new authority.
* **SG-012** — current Revision ownership was designed in 003-B; 003-E permits current Submission content as repairable denormalized projection and keeps integer version as display ordinal.
* **SG-013** — distinct Window persistence plus suspension/lifecycle policy were designed in 003-B/003-D; 003-E defines Window phase + suspension + reasoned availability views.
* **SG-014** — 003-C defined non-mutating generation + accepted apply; 003-E defines the generated-proposal/current-Schedule interface split and stale-base conflict behavior.
* **SG-015 / SG-016** — 003-B/003-C defined exact message evidence, rounds, and uncertainty; 003-E defines the preview/round/already-sent/blocked interface semantics and rejects same-round resend overrides as target behavior.
* **SG-017** — 003-C separates Feedback from Dispatch and 003-D separates Feedback from edit authority; 003-E makes `abstractReviewStatus` legacy-only with no invented replacement lifecycle.
* **SG-018** — target Coverage authority was designed earlier; 003-E requires advisory Coverage presentation to remain distinct from hard Capacity enforcement.
* **SG-P01 through SG-P04** — target policy was defined in 003-D and target interface/error/action representation is now defined in 003-E.

All of these gaps remain **implementation-open** until 003-F defines migration/backfill/cutover and runtime verification. A documented target is not the same as a completed implementation.

# Deferred signals retained

The accepted model still does not promote:

* Authorization/Delegation as a user-managed concept;
* Registration/Enrollment as one coherent concept;
* cross-concept Audit Trail;
* saved/versioned Export or Report definitions.

Existing role helpers, attendee/VIP fields, logs, exports, compatibility statuses, and UI work queues must not silently promote these during reconciliation.

# Phase ownership

* **003-B** owns persistence/reference/history target decisions for SG-001–SG-013 where structural state is involved.
* **003-C** owns synchronization, transaction, idempotency, and recovery consequences, especially SG-003, SG-004, SG-014, SG-016, and publication/withdrawal cleanup.
* **003-D** owns authority/lifecycle/disclosure/publication policy and target-designed SG-005/SG-P01–SG-P04 plus policy portions of SG-008, SG-009, SG-013, and SG-017.
* **003-E** now owns compatibility projections and API/UI interpretation of combined statuses, queues, protected information, exact public material, and operation state.
* **003-F** owns executable migration/backfill/rollout treatment, parity validation, write/read cutover, rollback, and runtime verification for accepted target changes.

No gap in this baseline independently authorizes runtime refactoring before the Phase 003 migration and execution-handoff gates are complete.
