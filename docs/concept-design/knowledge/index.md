---
okf_version: "0.2"
---
# MinneAnalytics Concept Design Knowledge

This directory is the canonical, progressively disclosed knowledge layer for the MinneAnalytics Concept Design retrofit.

Historical phase records and evidence remain in the parent `docs/concept-design/` tree. They explain how decisions were reached and implemented; this bundle states the compact knowledge that later work should reuse.

# Authority and authoring rules

* [Documentation Authority & Cross-Reference Rules](rules/documentation-authority.md) - Canonical ownership, cross-reference-first authoring, permitted repetition, lifecycle, and drift control.
* [Concept Design Authority](rules/concept-design-authority.md) - Relationship between Concept Design, implementation evidence, synchronization policy, and later code reconciliation.

# Decisions

* [Adopt OKF as the Concept Design Knowledge Layer](decisions/okf-adoption.md) - Uses OKF v0.2 for canonical design knowledge without making documentation structure drive runtime architecture.
* [001-G Discovery Gate Decision](decisions/001-g-discovery-gate.md) - Completes Phase 001 and admits 17 candidates to Phase 002 formal specification.
* [002-G Formal Specification & Composition Gate](decisions/002-g-formal-specification-and-composition-gate.md) - Completes Phase 002 with all 17 concepts formally specified and hands the accepted model to implementation reconciliation.
* [003-G Implementation Reconciliation Gate](decisions/003-g-implementation-reconciliation-gate.md) - Completes Phase 003 and authorizes bounded Phase 004 runtime implementation under the accepted reconciliation, migration, rollback-floor, and evidence rules.
* [004-H v0 Implementation Exit Gate](decisions/004-h-v0-implementation-exit-gate.md) - Completes Phase 004 with all 18 semantic gaps and 4 policy gaps verified-closed in the supported v0 runtime scope while withholding any unsupported production-release claim.

# Concept catalog

* [Concept Catalog](concepts/) - Canonical purpose, operational principle, abstract state, actions, invariants, derived observations, and concept-local synchronization boundaries for all 17 specified concepts.

# Synchronization and application composition

* [Synchronization & Application Composition](synchronizations/) - Canonical cross-concept entrypoint.
* [MinneAnalytics v0 Synchronization & Composition Contract](synchronizations/minneanalytics-v0.md) - Reference alignment, required synchronizations, application policies, derived projections, and failure semantics for the accepted v0 model.

# Implementation reconciliation and execution

* [Implementation Reconciliation](reconciliation/) - Canonical implementation-mapping, target-architecture, migration, execution, and closure entrypoint.
* [v0 Implementation Ownership Map](reconciliation/minneanalytics-v0-implementation-ownership.md) - Semantic ownership across implementation structures.
* [v0 Semantic Gap Baseline & Closure Register](reconciliation/semantic-gap-baseline.md) - Stable SG/SG-P IDs and final 22/22 Phase 004 closure disposition.
* [v0 Persistence, Identity & History Target](reconciliation/persistence-identity-history-target.md) - Stable identity reuse, required durable histories, exact references, and compatibility projections.
* [v0 Migration Target Baseline](reconciliation/migration-target-baseline.md) - Recoverability, provenance, expand-first coexistence, rollback, and validation constraints.
* [v0 Synchronization, Transaction & Recovery Target](reconciliation/synchronization-transaction-recovery-target.md) - Atomic authoritative bundles, source-authoritative convergence, durable work, schedule/provider/file boundaries, and compatibility-write direction.
* [v0 Idempotency & Recovery Baseline](reconciliation/idempotency-recovery-baseline.md) - Command/work keys, retry classes, crash recovery, uncertainty handling, and projection repair.
* [v0 Authority, Lifecycle & Operational Policy Target](reconciliation/authority-lifecycle-operational-policy-target.md) - Capability-based action authority, lifecycle/Archive policy, Availability Window/manual suspension, edit exceptions, and post-closure operation rules.
* [v0 Disclosure, Sharing & Publication Policy Baseline](reconciliation/disclosure-publication-policy-baseline.md) - Controlled Disclosure staging/reveal policy, blind-mode transition safety, share-eligibility provenance, exact Publication eligibility, and public-token resolution.
* [v0 Derived View, API & UI State Target](reconciliation/derived-view-api-ui-target.md) - Canonical/derived/compatibility/operation-state classification, semantic read-model composition, explicit concealment state, queue/badge semantics, and interface command boundaries.
* [v0 Interface Compatibility & Cutover Baseline](reconciliation/interface-compatibility-baseline.md) - Legacy field dispositions, additive semantic interfaces, compatibility adapters, parity/shadow comparison, consumer inventory, and retirement gates.
* [v0 Migration, Backfill & Rollout Execution Plan](reconciliation/migration-rollout-execution-plan.md) - Ordered schema/backfill/write/read/retirement waves and rollback classes.
* [v0 Backfill, Validation & Reversibility Baseline](reconciliation/backfill-validation-reversibility-baseline.md) - Provenance, quarantine/blocking rules, invariant/scenario/parity gates, rollback floors, and destructive-cleanup requirements.
* [v0 Implementation Execution Handoff](reconciliation/implementation-execution-handoff.md) - Historical Phase 004 package authorization, dependencies, execution constraints, and stop-and-amend rule.
* [v0 Implementation Closure & Evidence Baseline](reconciliation/implementation-closure-evidence-baseline.md) - Runtime closure states, evidence requirements, high-risk verification, rollback-floor checks, and final closure reporting rules.

# Phase 005 planning boundary

The historical Phase 005 subgroup plan is [Post-v0 Operational Qualification, Security Hardening & Production Readiness](../005-phase-structure-post-v0-operational-qualification-security-hardening-and-production-readiness.md).

It divides the next stage into ten dependency-aware groups from authority/evidence governance through security, deployment, live migration, provider qualification, operations, performance, accessibility/usability, compatibility/product admission, and a final production-readiness gate.

The subdivision itself does **not** authorize runtime, live-environment, destructive-cleanup, provider, or production deployment changes. **005-A must establish the bounded authority and change-control rules first.**

# Current maturity

**Phase 001 discovery, Phase 002 formal specification, Phase 003 implementation reconciliation, and Phase 004 v0 implementation execution are complete. Phase 005 is planned and has not yet begun execution.**

All 17 concepts are formally specified.

All 18 semantic gaps and 4 policy gaps are **`verified-closed`** in the declared supported v0 runtime scope. There are no explicitly deferred or blocked SG/SG-P items at the Phase 004 exit gate.

Implementation branch: `concept-design/v0-implementation` from the immutable 003-G design/reconciliation baseline `e50bcea4e70e26e9b9f1a9560ea68b99f0d798bb`.

The implementation exit does **not** claim that the current live AWS EFS database has already been migrated or that a production release has been approved.

Next: **005-A — Phase Authority, Scope, Release Criteria, Evidence Taxonomy & Change Control**.

The bounded runtime authorization granted by 003-G was consumed by completed Phase 004 and is not reactivated by Phase 005 planning.

# Historical design and implementation record

The detailed design/implementation record remains outside this bundle at the [`docs/concept-design/` entrypoint](../README.md). Use those records as provenance and audit evidence. Do not treat phase-record restatements as newer authority than a canonical knowledge node unless that node explicitly delegates authority back to the phase record.
