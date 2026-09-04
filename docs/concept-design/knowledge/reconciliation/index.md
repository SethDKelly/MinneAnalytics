---
type: Implementation Reconciliation Index
title: Implementation Reconciliation
description: Canonical entrypoint for mapping the accepted v0 Concept Design model to the existing MinneAnalytics implementation and its target persistence, execution, policy, interface, migration, and implementation-handoff architecture.
tags: [concept-design, implementation-reconciliation, architecture-mapping]
status: stable
authority: canonical
phase: 003-G
---
# Implementation Reconciliation

Use this directory for current normative conclusions about how the existing implementation relates to the accepted Concept Design model, how that realization should evolve safely, and how runtime implementation is executed and verified.

Concept semantics remain owned by the [Concept Catalog](../concepts/), and cross-concept behavior remains owned by the [MinneAnalytics v0 Synchronization & Composition Contract](../synchronizations/minneanalytics-v0.md). This directory owns neither; it maps implementation realization, execution architecture, application policy, interface compatibility, migration rollout, and implementation evidence/closure to them.

# Current canonical reconciliation knowledge

* [v0 Implementation Ownership Map](minneanalytics-v0-implementation-ownership.md) — semantic ownership of current models, fields, helpers, routes, and projections across the 17 concepts.
* [003-A Semantic Gap Baseline](semantic-gap-baseline.md) — prioritized reconciliation gaps that implementation must close or explicitly retain with compatibility rationale.
* [v0 Persistence, Identity & History Target](persistence-identity-history-target.md) — stable reference reuse, new durable histories, exact relationship targets, and compatibility-projection ownership.
* [v0 Migration Target Baseline](migration-target-baseline.md) — recoverability classes, no-fabrication rules, expand-first coexistence, rollback constraints, and migration truth principles.
* [v0 Synchronization, Transaction & Recovery Target](synchronization-transaction-recovery-target.md) — TX-A/TX-B/TX-C/TX-D execution classes, atomic entry, convergent exit, durable work, compatibility write direction, schedule apply, provider/file boundaries.
* [v0 Idempotency & Recovery Baseline](idempotency-recovery-baseline.md) — semantic uniqueness, expected-head append, command/work keys, retry classes, crash recovery, blocked uncertainty, and projection repair.
* [v0 Authority, Lifecycle & Operational Policy Target](authority-lifecycle-operational-policy-target.md) — action capabilities, setup/live/Archive policy, Availability Window/manual-suspension behavior, edit exceptions, and post-closure operations.
* [v0 Disclosure, Sharing & Publication Policy Baseline](disclosure-publication-policy-baseline.md) — blind-review staging/reveal, blind-mode locking, share-eligibility provenance, exact-material publication, and public-token access policy.
* [v0 Derived View, API & UI State Target](derived-view-api-ui-target.md) — canonical/derived/compatibility/operation-state classification, semantic read models, explicit protected-information state, queue/badge rules, and action-oriented interface boundaries.
* [v0 Interface Compatibility & Cutover Baseline](interface-compatibility-baseline.md) — legacy-field dispositions, additive semantic interfaces, command adapters, parity/shadow checks, consumer inventory, and compatibility retirement gates.
* [v0 Migration, Backfill & Rollout Execution Plan](migration-rollout-execution-plan.md) — F0–F9 implementation waves, exact-reference/current-state backfill order, semantic write/read cutover, legacy mutation retirement, and rollback classes.
* [v0 Backfill, Validation & Reversibility Baseline](backfill-validation-reversibility-baseline.md) — provenance, quarantine/blocking criteria, invariant/scenario/parity gates, rollback floors, and destructive-cleanup readiness.
* [v0 Implementation Execution Handoff](implementation-execution-handoff.md) — Phase 004 work-package order, bounded implementation authorization, dependencies, branch boundary, and execution constraints.
* [v0 Implementation Closure & Evidence Baseline](implementation-closure-evidence-baseline.md) — SG/SG-P runtime closure states, required evidence, high-risk closure rules, rollback-floor verification, and Phase 004 exit reporting.

# Phase 003 status

**Phase 003 is complete.**

003-A through 003-F established ownership, gaps, persistence/history, transaction/recovery, authority/policy, API/UI compatibility, and migration/rollback targets. 003-G performed the cross-phase consistency gate and authorized bounded Phase 004 runtime implementation.

Canonical gate: [003-G Implementation Reconciliation Gate](../decisions/003-g-implementation-reconciliation-gate.md).

Next: **004-A — Migration Discipline, Baseline & Additive Schema Foundation**.

Runtime/schema work is now permitted only under the [Implementation Execution Handoff](implementation-execution-handoff.md). Destructive cleanup remains separately gated and is not generally authorized by Phase 003 completion.

# Historical audit evidence

Detailed implementation observations and design reasoning remain in the numbered Phase 003 records and evidence artifacts:

* [003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register](../../003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md)
* [003-B — Persistence, Identity, History & Migration Target Design](../../003-B-persistence-identity-history-and-migration-target-design.md)
* [003-C — Synchronization, Transaction, Idempotency & Recovery Architecture](../../003-C-synchronization-transaction-idempotency-and-recovery-architecture.md)
* [003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation](../../003-D-authority-lifecycle-disclosure-and-operational-policy-reconciliation.md)
* [003-E — Derived Views, API/UI State & Compatibility Reconciliation](../../003-E-derived-views-api-ui-state-and-compatibility-reconciliation.md)
* [003-F — Data Migration, Backfill, Rollout & Reversibility Plan](../../003-F-data-migration-backfill-rollout-and-reversibility-plan.md)
* [003-G — Implementation Reconciliation Consolidation & Execution Handoff](../../003-G-implementation-reconciliation-consolidation-and-execution-handoff.md)
* [003-G Reconciliation Conformance & Closure Matrix](../../evidence/003-G-reconciliation-conformance-and-closure-matrix.md)
* [003-G Implementation Work Package & Dependency Matrix](../../evidence/003-G-implementation-work-package-and-dependency-matrix.md)

# Authority rule

A physical implementation aggregate may realize several concepts, policies, synchronizations, and projections. Implementation must preserve semantic ownership and history without assuming one table/service/route per concept.

Phase 004 evidence may refine physical realization and operational tooling. It does not override canonical Concept Design semantics merely because runtime code is newer.