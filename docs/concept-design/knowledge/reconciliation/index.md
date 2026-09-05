# Implementation Reconciliation

Use this directory for current normative conclusions about how the implementation relates to the accepted Concept Design model, how that realization evolves safely, and how runtime implementation is executed and verified.

Concept semantics remain owned by the [Concept Catalog](../concepts/), and cross-concept behavior remains owned by the [MinneAnalytics v0 Synchronization & Composition Contract](../synchronizations/minneanalytics-v0.md). This directory maps implementation realization, execution architecture, application policy, interface compatibility, migration rollout, and closure to them.

# Current canonical reconciliation knowledge

* [v0 Implementation Ownership Map](minneanalytics-v0-implementation-ownership.md) — semantic ownership of models, fields, helpers, routes, and projections across the 17 concepts.
* [v0 Semantic Gap Baseline & Closure Register](semantic-gap-baseline.md) — stable SG/SG-P IDs and final Phase 004 disposition: 22 verified-closed, none deferred or blocked.
* [v0 Persistence, Identity & History Target](persistence-identity-history-target.md) — stable reference reuse, durable histories, exact relationships, and compatibility-projection ownership.
* [v0 Migration Target Baseline](migration-target-baseline.md) — recoverability classes, no-fabrication rules, expand-first coexistence, rollback constraints, and migration truth principles.
* [v0 Synchronization, Transaction & Recovery Target](synchronization-transaction-recovery-target.md) — TX-A/TX-B/TX-C/TX-D execution classes, atomic entry, convergent exit, durable work, compatibility direction, schedule apply, provider/file boundaries.
* [v0 Idempotency & Recovery Baseline](idempotency-recovery-baseline.md) — semantic uniqueness, expected-head append, command/work keys, retry classes, crash recovery, blocked uncertainty, and projection repair.
* [v0 Authority, Lifecycle & Operational Policy Target](authority-lifecycle-operational-policy-target.md) — action capabilities, setup/live/Archive policy, Availability Window/manual-suspension behavior, edit exceptions, and post-closure operations.
* [v0 Disclosure, Sharing & Publication Policy Baseline](disclosure-publication-policy-baseline.md) — blind-review staging/reveal, blind-mode locking, share-eligibility provenance, exact-material publication, and public-token policy.
* [v0 Derived View, API & UI State Target](derived-view-api-ui-target.md) — canonical/derived/compatibility/operation-state classification, semantic read models, protected-information state, and action-oriented interfaces.
* [v0 Interface Compatibility & Cutover Baseline](interface-compatibility-baseline.md) — legacy-field dispositions, semantic interfaces, command adapters, parity/shadow checks, consumer inventory, and retirement gates.
* [v0 Migration, Backfill & Rollout Execution Plan](migration-rollout-execution-plan.md) — implementation waves, backfill order, semantic write/read cutover, legacy mutation retirement, and rollback classes.
* [v0 Backfill, Validation & Reversibility Baseline](backfill-validation-reversibility-baseline.md) — provenance, quarantine/blocking criteria, invariant/scenario/parity gates, rollback floors, and destructive-cleanup readiness.
* [v0 Implementation Execution Handoff](implementation-execution-handoff.md) — historical Phase 004 work-package authorization, dependencies, branch boundary, and execution constraints.
* [v0 Implementation Closure & Evidence Baseline](implementation-closure-evidence-baseline.md) — SG/SG-P runtime closure rules, evidence requirements, high-risk verification, rollback-floor checks, and exit reporting.

# Current status

**Phase 003 implementation reconciliation and Phase 004 v0 implementation execution are complete.**

All `SG-001`–`SG-018` and `SG-P01`–`SG-P04` are `verified-closed` in the declared supported v0 runtime scope. The canonical exit decision is [004-H v0 Implementation Exit Gate](../decisions/004-h-v0-implementation-exit-gate.md).

The Phase 004 result intentionally distinguishes semantic implementation closure from production qualification. The current live AWS EFS database has not been claimed as migrated, and post-v0 operational/security/provider work requires separate planning.

The bounded implementation authorization granted by 003-G is closed. Destructive compatibility cleanup or a new runtime phase is not automatically authorized by this status.

# Historical audit evidence

Detailed observations, reasoning and runtime evidence remain in the numbered Phase 003/004 records and `evidence/` artifacts. Key exit records are:

* [003-G — Implementation Reconciliation Consolidation & Execution Handoff](../../003-G-implementation-reconciliation-consolidation-and-execution-handoff.md)
* [004-G — Migration Validation, Rollback Rehearsal & Legacy Cleanup Gate](../../004-G-migration-validation-rollback-rehearsal-and-legacy-cleanup-gate.md)
* [004-H — Phase 004 Consolidation & v0 Implementation Exit Review](../../004-H-phase-004-consolidation-and-v0-implementation-exit-review.md)
* [004-H Semantic Gap & Policy Closure Ledger](../../evidence/004-H-semantic-gap-and-policy-closure-ledger.md)
* [004-H Residual Risk & Operational Handoff](../../evidence/004-H-residual-risk-and-operational-handoff.md)

# Authority rule

A physical implementation aggregate may realize several concepts, policies, synchronizations, and projections. Implementation must preserve semantic ownership and history without assuming one table/service/route per concept.

Implementation evidence may refine physical realization and operational tooling. It does not override canonical Concept Design semantics merely because runtime code is newer.