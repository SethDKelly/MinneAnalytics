---
type: Design Decision
title: 002-G Formal Specification & Composition Gate
description: Closes Phase 002 with 17 accepted formal concepts and a canonical synchronization/application-composition contract, handing work to implementation reconciliation.
tags: [concept-design, phase-002, gate, synchronization, composition]
status: stable
authority: canonical
phase: 002-G
sources:
  - { id: phase, resource: ../../002-G-formal-specification-consolidation-and-synchronization-handoff.md, title: 002-G Formal Specification Consolidation & Synchronization Handoff }
  - { id: conformance, resource: ../../evidence/002-G-concept-conformance-matrix.md, title: 002-G Concept Conformance Matrix }
  - { id: reconciliation, resource: ../../evidence/002-G-implementation-reconciliation-register.md, title: 002-G Implementation Reconciliation Register }
  - { id: synchronization, resource: ../synchronizations/minneanalytics-v0.md, title: MinneAnalytics v0 Synchronization & Composition Contract }
---
# Decision

**Phase 002 passes and is complete.**

All 17 Phase 001-G candidates are accepted as the v0 formally specified concept baseline:

Proposal, Revision, Availability Window, Evaluation, Controlled Disclosure, Feedback, Selection, Withdrawal, Capacity, Coverage Target, Vocabulary, Classification, Deliverable, Schedule, Publication, Dispatch, and Archive.

No provisional admissions remain.

# Composition authority

Cross-concept behavior is governed by the [MinneAnalytics v0 Synchronization & Composition Contract](../synchronizations/minneanalytics-v0.md).

That contract establishes:

- reference alignment across durable Proposal identity, exact Revision identity, exact public MaterialRef, and stable Dispatch RecipientRef;
- required synchronization families;
- application-policy boundaries;
- derived-projection boundaries;
- transaction/failure semantics that distinguish hard preconditions from source-authoritative follow-up.

# Explicit non-decision

Phase 002 does **not** authorize product/domain refactoring solely because the formal concept model is complete.

The existing implementation must first be reconciled against the accepted model. Physical schemas, services, modules, APIs, and UI structures may remain aggregated where they preserve the required semantics; one implementation object per concept is neither required nor preferred by default.

# Next authority boundary

Phase 003 is **Implementation Reconciliation & Architecture Mapping**.

Its purpose is to determine which current implementation structures:

- already realize the accepted semantics;
- require reinterpretation rather than replacement;
- lose independent history or authority;
- need migration/backfill;
- need new synchronization/recovery behavior;
- can remain physically combined without semantic coupling.

Concrete application-code changes should be authorized only after that reconciliation produces an implementation-safe plan.
