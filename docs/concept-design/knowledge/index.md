---
okf_version: "0.2"
---
# MinneAnalytics Concept Design Knowledge

This directory is the canonical, progressively disclosed knowledge layer for the MinneAnalytics Concept Design retrofit.

Historical phase records and evidence remain in the parent `docs/concept-design/` tree. They explain how decisions were reached; this bundle states the compact knowledge that later work should reuse.

# Authority and authoring rules

* [Documentation Authority & Cross-Reference Rules](rules/documentation-authority.md) - Canonical ownership, cross-reference-first authoring, permitted repetition, lifecycle, and drift control.
* [Concept Design Authority](rules/concept-design-authority.md) - Relationship between Concept Design, implementation evidence, synchronization policy, and later code reconciliation.

# Decisions

* [Adopt OKF as the Concept Design Knowledge Layer](decisions/okf-adoption.md) - Uses OKF v0.2 for canonical design knowledge without making documentation structure drive runtime architecture.
* [001-G Discovery Gate Decision](decisions/001-g-discovery-gate.md) - Completes Phase 001 and admits 17 candidates to Phase 002 formal specification.
* [002-G Formal Specification & Composition Gate](decisions/002-g-formal-specification-and-composition-gate.md) - Completes Phase 002 with all 17 concepts formally specified and hands the accepted model to implementation reconciliation.

# Concept catalog

* [Concept Catalog](concepts/) - Canonical purpose, operational principle, abstract state, actions, invariants, derived observations, and concept-local synchronization boundaries for all 17 specified concepts.

# Synchronization and application composition

* [Synchronization & Application Composition](synchronizations/) - Canonical cross-concept entrypoint.
* [MinneAnalytics v0 Synchronization & Composition Contract](synchronizations/minneanalytics-v0.md) - Reference alignment, required synchronizations, application policies, derived projections, and failure semantics for the accepted v0 model.

# Implementation reconciliation

* [Implementation Reconciliation](reconciliation/) - Canonical implementation-mapping and target-architecture entrypoint.
* [v0 Implementation Ownership Map](reconciliation/minneanalytics-v0-implementation-ownership.md) - Current semantic ownership across implementation structures.
* [003-A Semantic Gap Baseline](reconciliation/semantic-gap-baseline.md) - Stable prioritized semantic/policy gap IDs.
* [v0 Persistence, Identity & History Target](reconciliation/persistence-identity-history-target.md) - Stable identity reuse, required durable histories, exact references, and compatibility projections.
* [v0 Migration Target Baseline](reconciliation/migration-target-baseline.md) - Recoverability, provenance, expand-first coexistence, rollback, and validation constraints.
* [v0 Synchronization, Transaction & Recovery Target](reconciliation/synchronization-transaction-recovery-target.md) - Atomic authoritative bundles, source-authoritative convergence, durable work, schedule/provider/file boundaries, and compatibility-write direction.
* [v0 Idempotency & Recovery Baseline](reconciliation/idempotency-recovery-baseline.md) - Command/work keys, retry classes, crash recovery, uncertainty handling, and projection repair.

# Current maturity

**Phase 002 formal specification is complete. Phase 003 implementation reconciliation is in progress.**

Completed reconciliation groups:

- **003-A** — implementation ownership and semantic-gap mapping;
- **003-B** — persistence, identity, history, and migration target design;
- **003-C** — synchronization, transaction, idempotency, and recovery architecture.

Next: **003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation**.

Product/domain/schema changes remain unauthorized until the remaining Phase 003 policy, compatibility, migration, and execution-handoff groups establish a safe implementation handoff.

# Historical design record

The detailed design record remains outside this bundle at the [`docs/concept-design/` entrypoint](../README.md). Use those records as provenance and audit evidence. Do not treat phase-record restatements as newer authority than a canonical knowledge node unless that node explicitly delegates authority back to the phase record.
