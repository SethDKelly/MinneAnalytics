---
type: Implementation Reconciliation Index
title: Implementation Reconciliation
description: Canonical entrypoint for mapping the accepted v0 Concept Design model to the existing MinneAnalytics implementation, semantic gaps, and target persistence, execution, and operational-policy architecture.
tags: [concept-design, implementation-reconciliation, architecture-mapping]
status: stable
authority: canonical
phase: 003-D
---
# Implementation Reconciliation

Use this directory for current normative conclusions about how the existing implementation relates to the accepted Concept Design model and how that realization should evolve safely.

Concept semantics remain owned by the [Concept Catalog](../concepts/), and cross-concept behavior remains owned by the [MinneAnalytics v0 Synchronization & Composition Contract](../synchronizations/minneanalytics-v0.md). This directory owns neither; it maps implementation realization, execution architecture, and application-policy reconciliation to them.

# Current canonical reconciliation knowledge

* [v0 Implementation Ownership Map](minneanalytics-v0-implementation-ownership.md) — semantic ownership of current models, fields, helpers, routes, and projections across the 17 concepts.
* [003-A Semantic Gap Baseline](semantic-gap-baseline.md) — prioritized reconciliation gaps that later Phase 003 work must resolve, retain explicitly, or defer with rationale.
* [v0 Persistence, Identity & History Target](persistence-identity-history-target.md) — stable reference reuse, new durable histories, exact relationship targets, and compatibility-projection ownership established by 003-B.
* [v0 Migration Target Baseline](migration-target-baseline.md) — recoverability classes, no-fabrication rules, expand-first coexistence, rollback constraints, and migration validation gates.
* [v0 Synchronization, Transaction & Recovery Target](synchronization-transaction-recovery-target.md) — TX-A/TX-B/TX-C/TX-D execution classes, atomic entry, convergent exit, durable work, compatibility write direction, schedule apply, provider/file boundaries.
* [v0 Idempotency & Recovery Baseline](idempotency-recovery-baseline.md) — semantic uniqueness, expected-head append, command/work keys, retry classes, crash recovery, blocked uncertainty, and projection repair.
* [v0 Authority, Lifecycle & Operational Policy Target](authority-lifecycle-operational-policy-target.md) — action capabilities, setup/live/Archive policy, Availability Window/manual-suspension behavior, edit exceptions, and post-closure operations.
* [v0 Disclosure, Sharing & Publication Policy Baseline](disclosure-publication-policy-baseline.md) — blind-review staging/reveal, blind-mode locking, share-eligibility provenance, exact-material publication, and public-token access policy.

# Current Phase 003 status

**003-A through 003-D are complete.** Implementation ownership, semantic gaps, target persistence/history, synchronization/transaction/recovery, and authority/lifecycle/disclosure/publication policy are defined.

Next: **003-E — Derived Views, API/UI State & Compatibility Reconciliation**.

Runtime/schema changes remain unauthorized until the remaining Phase 003 compatibility, migration, and execution-handoff gates are complete.

# Historical audit evidence

Detailed implementation observations and design reasoning remain in the numbered Phase 003 records and evidence artifacts:

* [003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register](../../003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md)
* [003-B — Persistence, Identity, History & Migration Target Design](../../003-B-persistence-identity-history-and-migration-target-design.md)
* [003-C — Synchronization, Transaction, Idempotency & Recovery Architecture](../../003-C-synchronization-transaction-idempotency-and-recovery-architecture.md)
* [003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation](../../003-D-authority-lifecycle-disclosure-and-operational-policy-reconciliation.md)
* [003-D Authority & Lifecycle Policy Matrix](../../evidence/003-D-authority-lifecycle-policy-matrix.md)
* [003-D Disclosure & Publication Policy Matrix](../../evidence/003-D-disclosure-publication-policy-matrix.md)

# Authority rule

A physical implementation aggregate may realize several concepts, policies, synchronizations, and projections. Reconciliation must preserve semantic ownership and history without assuming one table/service/route per concept.

The 003-D capability and lifecycle policies remain application composition: role mappings, capability resolvers, configuration flags, and operational gates must not be promoted into new Authorization, Workflow, Consent, or ApplicationLifecycle concepts merely because implementation code needs them.