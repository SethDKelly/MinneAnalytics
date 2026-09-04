---
type: Concept Design Synchronization Index
title: Synchronization & Application Composition
description: Canonical entrypoint for cross-concept synchronization, application policy, derived projections, and reference alignment after Phase 002 formal specification.
tags: [concept-design, synchronization, composition, application-policy]
status: stable
authority: canonical
phase: 002-G
sources:
  - { id: phase, resource: ../../002-G-formal-specification-consolidation-and-synchronization-handoff.md, title: 002-G Formal Specification Consolidation & Synchronization Handoff }
---
# Purpose

This directory owns canonical MinneAnalytics composition knowledge that intentionally does **not** belong inside any one concept.

Use the [v0 Synchronization & Composition Contract](minneanalytics-v0.md) for the current cross-concept model.

# Authority split

Cross-concept behavior is classified into four kinds:

1. **Synchronization** — one application operation or source-state transition coordinates actions owned by multiple concepts.
2. **Application policy** — a predicate or rule decides whether an action may be offered or accepted; it does not create another concept's state by itself.
3. **Derived projection** — a fact/view is computed from authoritative concept state and is not persisted as another source of truth.
4. **Implementation reconciliation** — current code differs from the accepted model and must be evaluated before implementation work is authorized.

Do not create a generic Workflow, ProgramStatus, or coordinator concept merely to hold these relationships.

# Reference discipline

Concept nodes remain authoritative for their own state/actions/invariants. Synchronization nodes reference those owners and specify only cross-concept coordination. If a synchronization appears to require one concept to inspect or mutate another concept's internals, revisit the composition rather than weakening concept independence.

# Current status

Phase 002-G completes formal specification and establishes the v0 synchronization/application-composition handoff. Implementation reconciliation is the next design activity; this synchronization layer does not itself authorize product code changes.
