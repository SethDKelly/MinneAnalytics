---
type: Semantic Gap Baseline
title: MinneAnalytics v0 Semantic Gap Baseline & Closure Register
description: Stable canonical register of semantic and policy gaps identified during implementation reconciliation and their final Phase 004 closure disposition.
tags: [concept-design, implementation-reconciliation, semantic-gap, migration, closure, v0]
status: stable
authority: canonical
phase: 004-H
sources:
  - { id: discovery, resource: ../../003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md, title: 003-A Concept-to-Implementation Ownership Map & Semantic Gap Register }
  - { id: evidence, resource: ../../evidence/003-A-semantic-gap-register.md, title: 003-A Semantic Gap Register }
  - { id: exit, resource: ../../004-H-phase-004-consolidation-and-v0-implementation-exit-review.md, title: 004-H Phase 004 Consolidation & v0 Implementation Exit Review }
  - { id: closure-ledger, resource: ../../evidence/004-H-semantic-gap-and-policy-closure-ledger.md, title: 004-H Semantic Gap & Policy Closure Ledger }
---
# Purpose

Provide stable gap IDs, accepted reconciliation outcomes, and current implementation-governance disposition.

Detailed source-path archaeology remains in the historical [003-A Semantic Gap Register](../../evidence/003-A-semantic-gap-register.md). Final per-gap runtime evidence is consolidated in the [004-H closure ledger](../../evidence/004-H-semantic-gap-and-policy-closure-ledger.md).

Priority is semantic/data-loss risk, not implementation effort.

# High-priority semantic gaps

| ID | Area | Original gap | Required reconciliation outcome | Phase 004 exit |
|---|---|---|---|---|
| SG-001 | Evaluation history | rescoring updated one `Score` row and moved its version marker, losing prior Revision-specific Evaluation | preserve independently referable Evaluation per evaluator + exact Revision | **verified-closed** |
| SG-002 | Selection history | `programStatus` stored only current organizer outcome | preserve immutable Selection Decision history plus subordinate current projection | **verified-closed** |
| SG-003 | Withdrawal independence | Withdrawal overwrote `programStatus`, and later organizer changes could clear withdrawal | preserve monotonic Withdrawal independently from Selection with convergent cleanup | **verified-closed** |
| SG-004 | Capacity authority | only derived capacity snapshots/configuration existed | durable Pool/Allocation/Release with hard entry enforcement | **verified-closed** |
| SG-005 | Controlled Disclosure history | disclosure was dynamically computed or console-logged | durable staged participant/context/information relation plus monotonic Reveal | **verified-closed** |
| SG-006 | Revision Classification | current `SubmissionTheme` was submission-level while historical sets lived only in snapshots | exact Revision↔Term Classification with historical preservation | **verified-closed** |
| SG-007 | Deliverable readiness | `deckStatus` was detached from exact versioned file and prior review state was overwritten | exact ArtifactVersion Assessment history and subordinate projection | **verified-closed** |
| SG-008 | Publication identity/history | public state was a mutable conference gate plus latest-deck derivation | exact MaterialRef Publication identity/current exposure/history | **verified-closed** |
| SG-009 | Historical public artifact access | old `publicId` could inherit authorization from mutable parent state | authorize only intentionally published exact MaterialRefs | **verified-closed** |
| SG-010 | Archive provenance | changing away from `ARCHIVED` could erase closure provenance | independent monotonic Archive closure and action-specific post-closure policy | **verified-closed** |
| SG-011 | Vocabulary history | term wording/availability overwrote `Theme`, and unused terms could be deleted | stable Term identity with TermState history and referentially safe retirement | **verified-closed** |

# Medium-high priority gaps

| ID | Area | Original gap | Required reconciliation outcome | Phase 004 exit |
|---|---|---|---|---|
| SG-012 | Proposal/Revision projection | mutable content was duplicated on `Submission` while snapshots lived in `SubmissionRevision` | exact Revision ownership; mutable current row only a projection | **verified-closed** |
| SG-013 | Availability Window | timestamps, manual boolean and Conference status competed; close boundary differed | bounded half-open Window plus explicit suspension/lifecycle policy | **verified-closed** |
| SG-014 | Schedule generation | generator cleared and rewrote authoritative placements directly | non-mutating proposal plus explicit expected-base atomic apply | **verified-closed** |
| SG-015 | Dispatch message evidence | send history lacked immutable exact rendered content/reference | preserve exact per-recipient message/attempt/send evidence | **verified-closed** |
| SG-016 | Dispatch resend semantics | `includeAlreadyEmailed` conflicted with same-round uniqueness | same-round idempotency; new semantic round for intentional repeat | **verified-closed** |
| SG-017 | Feedback coupling | Feedback mutated review workflow projection and directly sent email | Feedback fact independent from edit/workflow state and notification execution | **verified-closed** |
| SG-018 | Coverage/Vocabulary co-location | `Theme` mixed target bounds with term state and fallback thresholds blurred target absence | separate Coverage Target authority from Vocabulary and explicit no-target advisory policy | **verified-closed** |

# Cross-cutting policy gaps

| ID | Policy gap | Required outcome | Phase 004 exit |
|---|---|---|---|
| SG-P01 | Edit eligibility | server-authoritative composition of ownership, Window, lifecycle/Archive, decision lock and explicit Revision exception | **verified-closed** |
| SG-P02 | Authority naming/capability | consequential commands consume action-oriented capabilities while roles remain assignment mechanism | **verified-closed** |
| SG-P03 | Archive/post-event operations | ordinary active mutation denied after Archive while explicitly safe historical/publication/recovery operations remain possible | **verified-closed** |
| SG-P04 | Publication share/rights | sharing eligibility has bounded provenance and remains independent from exact Publication exposure | **verified-closed** |

# Phase 004 exit status

**Phase 004 is complete. All `SG-001`–`SG-018` and `SG-P01`–`SG-P04` are `verified-closed` in the declared supported v0 runtime scope.**

Final count:

- `verified-closed`: **22**;
- `explicitly-deferred`: **0**;
- `blocked`: **0**.

The canonical exit decision is [004-H v0 Implementation Exit Gate](../decisions/004-h-v0-implementation-exit-gate.md).

Closure means the accepted runtime semantics, authority boundaries, migration behavior, compatibility disposition, first-party reads, verification scenarios, recovery behavior and rollback floors pass within that supported scope. It does **not** mean the current live AWS EFS database has already been migrated or that a production release has been approved.

# Phase 004 ownership history

The original execution ownership remains useful historical navigation:

* **004-B** — SG-001, SG-006, SG-011/SG-012 and Feedback exact-reference portions of SG-017.
* **004-C** — SG-002, SG-003, SG-004, SG-007 and participation-side operational support.
* **004-D** — SG-005, SG-010, SG-013, edit-policy separation for SG-017, and SG-P01–SG-P03.
* **004-E** — SG-008, SG-009, SG-014, SG-015, SG-016 and SG-P04.
* **004-F** — first-party semantic interface/read cutover across the model.
* **004-G** — migration/rollback/removal gate and legacy-authority retirement.
* **004-H** — final audit, closure ledger, Feedback decoupling completion, and Coverage/Vocabulary runtime-authority completion.

# Accepted migration dispositions retained after closure

`legacy-unknown` is an evidence condition, not an open-gap state, where the migration design explicitly permits native truth to begin at cutover.

* **SG-001 / SG-006 / SG-012** — exact Revision anchoring is authoritative; ambiguous prior Evaluation history remains unknown rather than falsely attributed.
* **SG-002 / SG-003 / SG-004 / SG-007** — truthful current state was seeded where supported; `programStatus`/`deckStatus` remain compatibility projections.
* **SG-005** — pre-cutover blind-review exposure can remain a legacy-unknown cohort; native disclosure staging/reveal starts prospectively with truthful provenance.
* **SG-008 / SG-009** — only exact supportable public MaterialRefs were seeded; old tokens do not manufacture Publication history.
* **SG-010** — current Archive closure can be seeded; erased pre-cutover reopen history remains unknown.
* **SG-011 / SG-018** — current TermState and coherent explicit Coverage Targets can be seeded; old wording/target transition history is not invented; legacy `0/0` means no target.
* **SG-013** — only valid bounded Windows enter canonical offer policy; legacy boolean is suspension-only compatibility policy.
* **SG-014** — current placements are retained, while generation acceptance history is not fabricated.
* **SG-015 / SG-016** — historical exact message content can remain unknown; new Dispatches preserve exact evidence, semantic rounds and uncertainty handling.
* **SG-017** — `abstractReviewStatus` has no canonical replacement and remains compatibility residue only; Feedback itself does not mutate it or directly perform notification delivery.

# Compatibility after closure

Retained compatibility structures do not reopen a gap when they are subordinate to canonical truth.

The Phase 004 rule is:

> **Legacy semantic authority is retired; physical compatibility is intentionally retained.**

Current aggregate fields, compatibility routes and denormalized projections may remain for read rollback, external compatibility or low-cost presentation provided that:

- canonical writers remain authoritative;
- first-party semantic reads are the normal path;
- canonical→compatibility repair is one-way;
- compatibility cannot weaken exact public/protected-information floors.

# Closure semantics

Implementation-governance states and required evidence are owned by [v0 Implementation Closure & Evidence Baseline](implementation-closure-evidence-baseline.md).

Historical `legacy-unknown` evidence may remain after closure only where the canonical migration rules explicitly permit it and interfaces do not falsely claim certainty.

# Deferred signals retained

The accepted model still does not promote:

* Authorization/Delegation as a user-managed concept;
* Registration/Enrollment as one coherent concept;
* cross-concept Audit Trail;
* saved/versioned Export or Report definitions.

Existing role helpers, attendee/VIP fields, logs, exports, migration manifests, compatibility statuses and UI work queues must not silently promote these concepts in future work.

# Authority after implementation exit

The bounded Phase 004 authorization granted by the 003-G gate has been consumed and closed by 004-H.

This register does not authorize arbitrary future refactoring or destructive cleanup. New work must follow the current canonical Concept Design authority and intentionally amend the narrowest owner if new evidence contradicts the accepted semantics.