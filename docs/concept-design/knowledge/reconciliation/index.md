---
type: Implementation Reconciliation Index
title: Implementation Reconciliation
description: Canonical entrypoint for mapping the accepted v0 Concept Design model to the existing MinneAnalytics implementation, semantic gaps, and target persistence/migration architecture.
tags: [concept-design, implementation-reconciliation, architecture-mapping]
status: stable
authority: canonical
phase: 003-B
---
# Implementation Reconciliation

Use this directory for current normative conclusions about how the existing implementation relates to the accepted Concept Design model and how that realization should evolve safely.

Concept semantics remain owned by the [Concept Catalog](../concepts/), and cross-concept behavior remains owned by the [MinneAnalytics v0 Synchronization & Composition Contract](../synchronizations/minneanalytics-v0.md). This directory owns neither of those definitions; it maps implementation realization and reconciliation obligations to them.

# Current canonical reconciliation knowledge

* [v0 Implementation Ownership Map](minneanalytics-v0-implementation-ownership.md) — semantic ownership of current models, fields, helpers, routes, and projections across the 17 concepts.
* [003-A Semantic Gap Baseline](semantic-gap-baseline.md) — prioritized reconciliation gaps that later Phase 003 work must resolve, retain explicitly, or defer with rationale.
* [v0 Persistence, Identity & History Target](persistence-identity-history-target.md) — stable reference reuse, new durable histories, exact relationship targets, and compatibility-projection ownership established by 003-B.
* [v0 Migration Target Baseline](migration-target-baseline.md) — recoverability classes, no-fabrication rules, expand-first coexistence, rollback constraints, and migration validation gates.

# Current Phase 003 status

**003-A and 003-B are complete.** The implementation has been mapped to the concept model, semantic gaps have stable IDs, and target persistence/identity/history plus migration compatibility have been designed.

Next: **003-C — Synchronization, Transaction, Idempotency & Recovery Architecture**.

Runtime/schema changes remain unauthorized until the remaining Phase 003 architecture, policy, compatibility, and migration planning gates are complete.

# Historical audit evidence

Detailed implementation observations and design reasoning remain in the numbered Phase 003 records and evidence artifacts:

* [003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register](../../003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md)
* [003-A Implementation Surface Inventory](../../evidence/003-A-implementation-surface-inventory.md)
* [003-A Concept-to-Implementation Ownership Matrix](../../evidence/003-A-concept-to-implementation-ownership-matrix.md)
* [003-A Semantic Gap Register](../../evidence/003-A-semantic-gap-register.md)
* [003-B — Persistence, Identity, History & Migration Target Design](../../003-B-persistence-identity-history-and-migration-target-design.md)
* [003-B Persistence, Identity & History Target Matrix](../../evidence/003-B-persistence-identity-history-target-matrix.md)
* [003-B Backfill, Compatibility & Reversibility Matrix](../../evidence/003-B-backfill-compatibility-and-reversibility-matrix.md)

# Authority rule

A physical implementation aggregate may realize several concepts, policies, synchronizations, and projections. Reconciliation must preserve semantic ownership and history without assuming one table/service/route per concept.

The 003-B target uses additive identity/history structures only where current persistence cannot preserve the accepted semantics. Existing IDs and aggregates are retained whenever they remain suitable.