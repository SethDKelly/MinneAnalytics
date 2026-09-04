---
type: Implementation Reconciliation Index
title: Implementation Reconciliation
description: Canonical entrypoint for mapping the accepted v0 Concept Design model to the existing MinneAnalytics implementation, semantic gaps, and target persistence/execution architecture.
tags: [concept-design, implementation-reconciliation, architecture-mapping]
status: stable
authority: canonical
phase: 003-C
---
# Implementation Reconciliation

Use this directory for current normative conclusions about how the existing implementation relates to the accepted Concept Design model and how that realization should evolve safely.

Concept semantics remain owned by the [Concept Catalog](../concepts/), and cross-concept behavior remains owned by the [MinneAnalytics v0 Synchronization & Composition Contract](../synchronizations/minneanalytics-v0.md). This directory owns neither; it maps implementation realization and execution architecture to them.

# Current canonical reconciliation knowledge

* [v0 Implementation Ownership Map](minneanalytics-v0-implementation-ownership.md) — semantic ownership of current models, fields, helpers, routes, and projections across the 17 concepts.
* [003-A Semantic Gap Baseline](semantic-gap-baseline.md) — prioritized reconciliation gaps that later Phase 003 work must resolve, retain explicitly, or defer with rationale.
* [v0 Persistence, Identity & History Target](persistence-identity-history-target.md) — stable reference reuse, new durable histories, exact relationship targets, and compatibility-projection ownership established by 003-B.
* [v0 Migration Target Baseline](migration-target-baseline.md) — recoverability classes, no-fabrication rules, expand-first coexistence, rollback constraints, and migration validation gates.
* [v0 Synchronization, Transaction & Recovery Target](synchronization-transaction-recovery-target.md) — TX-A/TX-B/TX-C/TX-D execution classes, atomic entry, convergent exit, durable work, compatibility write direction, schedule apply, provider/file boundaries.
* [v0 Idempotency & Recovery Baseline](idempotency-recovery-baseline.md) — semantic uniqueness, expected-head append, command/work keys, retry classes, crash recovery, blocked uncertainty, and projection repair.

# Current Phase 003 status

**003-A, 003-B, and 003-C are complete.** Implementation ownership, semantic gaps, target persistence/history, and synchronization/transaction/recovery execution rules are defined.

Next: **003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation**.

Runtime/schema changes remain unauthorized until the remaining Phase 003 policy, compatibility, migration, and execution-handoff gates are complete.

# Historical audit evidence

Detailed implementation observations and design reasoning remain in the numbered Phase 003 records and evidence artifacts:

* [003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register](../../003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md)
* [003-B — Persistence, Identity, History & Migration Target Design](../../003-B-persistence-identity-history-and-migration-target-design.md)
* [003-C — Synchronization, Transaction, Idempotency & Recovery Architecture](../../003-C-synchronization-transaction-idempotency-and-recovery-architecture.md)
* [003-C Synchronization Execution Matrix](../../evidence/003-C-synchronization-execution-matrix.md)
* [003-C Failure, Idempotency & Recovery Matrix](../../evidence/003-C-failure-idempotency-and-recovery-matrix.md)

# Authority rule

A physical implementation aggregate may realize several concepts, policies, synchronizations, and projections. Reconciliation must preserve semantic ownership and history without assuming one table/service/route per concept.

The 003-B target uses additive identity/history structures only where current persistence cannot preserve accepted semantics. The 003-C target uses ordinary local transactions where atomic truth is required and narrow durable work only where source-authoritative convergence or external boundaries require it; it does not promote orchestration infrastructure into domain concepts.