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

Phase 003 architecture has now supplied target designs for several gaps without closing their implementation obligations:

* **SG-005** — persistence target established in 003-B; staging/reveal, exact information-key, blind-mode transition, and legacy-cohort policy are defined by [003-D Disclosure, Sharing & Publication Policy Baseline](disclosure-publication-policy-baseline.md). Runtime/migration verification remains open.
* **SG-008 / SG-009** — exact-material Publication persistence was designed in 003-B and exact eligibility/public-token policy was designed in 003-D. Runtime/public-access migration remains open.
* **SG-013** — distinct Window persistence was designed in 003-B; manual suspension and lifecycle/edit policy were designed in 003-D. API/UI compatibility and migration remain open.
* **SG-017** — 003-C separates Feedback from notification Dispatch; 003-D separates Feedback from edit permission by requiring an explicit scoped revision exception. Legacy `abstractReviewStatus` compatibility remains 003-E work.
* **SG-P01 through SG-P04** — target policy is now defined by [003-D Authority, Lifecycle & Operational Policy Target](authority-lifecycle-operational-policy-target.md) and the disclosure/publication baseline. These gaps remain implementation-open until route/API/UI cutover and migration verification.

A gap is not considered closed merely because its target architecture or policy has been documented.

# Deferred signals retained

The accepted model still does not promote:

* Authorization/Delegation as a user-managed concept;
* Registration/Enrollment as one coherent concept;
* cross-concept Audit Trail;
* saved/versioned Export or Report definitions.

Existing role helpers, attendee/VIP fields, logs, and export endpoints must not silently promote these during reconciliation.

# Phase ownership

* **003-B** owns persistence/reference/history target decisions for SG-001–SG-013 where structural state is involved.
* **003-C** owns synchronization, transaction, idempotency, and recovery consequences, especially SG-003, SG-004, SG-014, SG-016, and publication/withdrawal cleanup.
* **003-D** has now target-designed SG-005 and SG-P01–SG-P04 policy/lifecycle/disclosure implications plus policy portions of SG-008, SG-009, SG-013, and SG-017.
* **003-E** owns compatibility projections and API/UI interpretation of combined current statuses/queues/policy outcomes.
* **003-F** owns migration/backfill/rollout treatment and runtime verification for accepted target changes.

No gap in this baseline independently authorizes runtime refactoring before its target and migration implications are designed.
