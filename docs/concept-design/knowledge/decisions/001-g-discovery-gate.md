---
type: Design Decision
title: 001-G Discovery Gate Decision
description: Consolidates Phase 001 and admits 17 Concept Design candidates to Phase 002 formal specification, four provisionally.
tags: [concept-design, phase-001, gate, candidates]
status: stable
authority: canonical
phase: 001-G
sources:
  - { id: criteria, resource: ../../001-E-concept-criteria-independence-and-genericity-review.md, title: 001-E Concept Criteria Review }
  - { id: operational-principles, resource: ../../001-F-operational-principle-development.md, title: 001-F Operational Principle Development }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Decision

Phase 001 discovery passes its consolidation gate.

Seventeen candidates are admitted to Phase 002 formal concept specification. Admission means the candidate has a supported purpose, a plausible independent boundary, acceptable specificity/completeness/genericity, and a natural concept-local operational principle. It does **not** mean abstract state/actions are final or that implementation changes are authorized.

# Admitted candidates

The following thirteen candidates are admitted without an additional Phase 001 boundary condition:

- [Proposal](../concepts/proposal.md)
- [Revision](../concepts/revision.md)
- [Evaluation](../concepts/evaluation.md)
- [Feedback](../concepts/feedback.md)
- [Selection](../concepts/selection.md)
- [Withdrawal](../concepts/withdrawal.md)
- [Capacity](../concepts/capacity.md)
- [Classification](../concepts/classification.md)
- [Vocabulary](../concepts/vocabulary.md)
- [Deliverable](../concepts/deliverable.md)
- [Schedule](../concepts/schedule.md)
- [Publication](../concepts/publication.md)
- [Archive](../concepts/archive.md)

# Provisionally admitted candidates

Four candidates proceed to Phase 002 with explicit falsification conditions:

- [Controlled Disclosure](../concepts/controlled-disclosure.md) — retain staged-exposure semantics; do not broaden into generic authorization/confidentiality or absorb future conflict management.
- [Dispatch](../concepts/dispatch.md) — retain performed-send semantics; recipient eligibility is supplied composition and templates/providers remain implementation/supporting input unless later evidence establishes independent lifecycles.
- [Availability Window](../concepts/availability-window.md) — prove a user-recognizable governed-opportunity lifecycle rather than generic timestamp/calendar configuration.
- [Coverage Target](../concepts/coverage-target.md) — own desired representation only; observed composition, gaps, warnings, and visualizations remain derived from other concept/application state.

A provisional admission is not a weaker documentation authority: the node is canonical about the current candidate boundary and its unresolved condition. Phase 002 must either resolve the condition or demote the candidate.

# Deferred current signals

The following needs remain real but do not enter Phase 002 as current standalone concepts:

- **Authorization / Delegation** — application-wide authority policy until users have an evidenced grant/delegate/revoke lifecycle.
- **Export / Reporting definition** — cross-concept projection capability until persistent user-managed report/export definitions have their own lifecycle.
- **Audit Trail** — intrinsic histories remain concept-local; a future cross-concept activity-history concept may emerge when that roadmap capability becomes user-facing.
- **Registration / Enrollment** — currently a locally/externally supplied operational fact; owning register/cancel behavior would invent semantics not established by the product.

These signals are deferred, not discarded. Rediscovery is permitted when new user-visible behavior creates a focused purpose and operational principle.

# Superseded candidate shapes

Earlier discovery names/boundaries that should not be revived without new evidence include:

- `Disclosure` as a broad concept → narrowed to Controlled Disclosure;
- `Retraction` → renamed to Withdrawal;
- merged `Coverage` → narrowed to Coverage Target, with observed composition derived;
- broad `Communication` → narrowed to Dispatch;
- generic `Obligation` → rejected as over-generalized; the later Registration replacement was itself deferred;
- `Authorization`, `Export`, and `Audit Trail` as Phase 001 standalone candidates → demoted as described above.

# Derived behavior remains non-conceptual

The gate reaffirms that effective participation, evaluation freshness, needs-rescore queues, actual collection composition, coverage gaps/excess, edit eligibility, schedule eligibility, publication eligibility, Dispatch recipient eligibility, external-fact ingestion, and report/export projections are composed or derived behavior unless later evidence establishes an independent purpose/state lifecycle.

# Documentation and implementation consequence

Phase 002 should update the canonical concept nodes under [`../concepts/`](../concepts/) with abstract state, actions, and intrinsic invariants. It should not create a second complete specification layer elsewhere.

The [OKF adoption decision](okf-adoption.md) and [Concept Design Authority](../rules/concept-design-authority.md) remain in force: this gate does not authorize application/domain code refactoring. Implementation changes wait for later synchronization design and explicit implementation reconciliation.

# Phase 001 exit

Phase 001 has established:

- design authority and anti-bias rules;
- historical-intent archaeology and provenance;
- problem, actor-need, and purpose inventories;
- candidate concept boundaries;
- criteria/independence/genericity review;
- operational-principle falsification;
- an OKF-based canonical knowledge architecture with documentation drift controls;
- a 17-candidate formal-specification entry set.

**Phase 001 is complete.**
