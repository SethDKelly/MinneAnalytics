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

These remain application-policy reconciliation issues rather than new concepts:

* **SG-P01 — Edit eligibility:** compose ownership/capability, Availability Window, Archive/lifecycle, decision lock, and explicit revision exception rather than `ProgramStatus`/`AbstractReviewStatus`.
* **SG-P02 — Authority naming/capability:** retain current roles as assignment mechanism while command boundaries consume explicit capabilities.
* **SG-P03 — Archive/post-event operations:** replace broad active-only mutation gating with action-specific post-Archive policy.
* **SG-P04 — Publication share/rights:** treat `deckShareable` as a migration-era share-eligibility input with provenance, not Publication state or inferred consent.

# Current target-design and migration status

**003-B through 003-F now provide a complete design + migration path for every SG-* and SG-P* item. None is yet marked implemented/closed.**

Key dispositions:

* **SG-001 / SG-006 / SG-012** — exact Revision anchoring is backfilled first; ambiguous legacy Evaluation history remains unknown; native Revision/Classification/Evaluation writes are the first semantic write cutover.
* **SG-002 / SG-003 / SG-004 / SG-007** — current state is seeded truthfully; canonical selected-entry uses Capacity/Deliverable atomicity and Withdrawal uses source-authoritative convergent cleanup; `programStatus`/`deckStatus` become projections.
* **SG-005** — existing blind-review exposure becomes a legacy in-flight unknown cohort rather than fabricated concealed/revealed history; native staging/reveal begins only in a truthful post-cutover scope.
* **SG-008 / SG-009** — only exact current public MaterialRefs are seeded; exact Publication + eligibility becomes public authorization, and the historical-`publicId` hardening is a rollback floor.
* **SG-010** — currently archived contexts receive current-state closure seeds where supported; erased archive/reopen history stays unknown; native Archive cannot be cleared.
* **SG-011 / SG-018** — current TermState and explicit coherent Coverage Targets can be seeded; historical Vocabulary changes and ambiguous `0/0` targets are not invented.
* **SG-013** — only valid bounded Windows enter canonical Offer policy; missing/invalid bounds require normalization; legacy boolean remains suspension-only.
* **SG-014** — Schedule generation migrates to proposal + expected-base apply after authoritative current placements are validated.
* **SG-015 / SG-016** — old exact Dispatch message content remains unknown; new sends capture immutable message evidence, semantic rounds, idempotency, and uncertain-outcome handling.
* **SG-017** — `abstractReviewStatus` has no canonical replacement; migration retires it as command/edit authority after semantic read/write consumers move.
* **SG-P01 through SG-P04** — 003-D defines policy, 003-E defines interface representation, and 003-F defines command/read cutover and rollback treatment.

The canonical execution sequence is [v0 Migration, Backfill & Rollout Execution Plan](migration-rollout-execution-plan.md). The acceptance/rollback gate is [v0 Backfill, Validation & Reversibility Baseline](backfill-validation-reversibility-baseline.md).

# Closure semantics

A gap becomes **implemented/closed** only after all applicable conditions hold:

1. target persistence/policy exists in runtime;
2. canonical write path is active;
3. required semantic read/UI path is active or compatibility-safe;
4. backfill/validation passes for supported scope;
5. runtime tests exercise accepted semantics/failure cases;
6. legacy competing authority is disabled;
7. any retained compatibility projection is canonical→compatibility and repairable.

A completed design document or successful backfill alone does not close a gap.

# Deferred signals retained

The accepted model still does not promote:

* Authorization/Delegation as a user-managed concept;
* Registration/Enrollment as one coherent concept;
* cross-concept Audit Trail;
* saved/versioned Export or Report definitions.

Existing role helpers, attendee/VIP fields, logs, exports, migration manifests, compatibility statuses, and UI work queues must not silently promote these during implementation.

# Phase ownership

* **003-B** owns persistence/reference/history target decisions.
* **003-C** owns synchronization, transaction, idempotency, and recovery.
* **003-D** owns authority/lifecycle/disclosure/publication application policy.
* **003-E** owns semantic read/API/UI and compatibility projections.
* **003-F** owns migration tooling discipline, backfill provenance/quarantine, canonical write/read cutover, rollback, and cleanup gates.
* **003-G** must consolidate these owners into the explicit implementation execution handoff and future gap-closure reporting discipline.

No gap in this baseline independently authorizes runtime refactoring before the 003-G execution-handoff gate.