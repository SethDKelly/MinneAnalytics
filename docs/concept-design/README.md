# MinneAnalytics Concept Design

This directory contains the repository's Daniel Jackson–style Concept Design retrofit.

## Current status

- **Concept model maturity:** v0 — formal concept specification and implementation reconciliation complete; bounded runtime implementation authorized
- **Working branch:** `concept-design/v0-discovery`
- **Completed:** Phase 001 (001-A through 001-G); Phase 002 (002-A through 002-G); Phase 003 (003-A through 003-G)
- **Next:** 004-A — Migration Discipline, Baseline & Additive Schema Foundation

## Start here

For current normative design knowledge, begin with:

- [Concept Design knowledge index](knowledge/index.md)
- [Concept Catalog](knowledge/concepts/)
- [MinneAnalytics v0 Synchronization & Composition Contract](knowledge/synchronizations/minneanalytics-v0.md)
- [Implementation Reconciliation](knowledge/reconciliation/)
- [v0 Implementation Ownership Map](knowledge/reconciliation/minneanalytics-v0-implementation-ownership.md)
- [003-A Semantic Gap Baseline](knowledge/reconciliation/semantic-gap-baseline.md)
- [v0 Persistence, Identity & History Target](knowledge/reconciliation/persistence-identity-history-target.md)
- [v0 Migration Target Baseline](knowledge/reconciliation/migration-target-baseline.md)
- [v0 Synchronization, Transaction & Recovery Target](knowledge/reconciliation/synchronization-transaction-recovery-target.md)
- [v0 Idempotency & Recovery Baseline](knowledge/reconciliation/idempotency-recovery-baseline.md)
- [v0 Authority, Lifecycle & Operational Policy Target](knowledge/reconciliation/authority-lifecycle-operational-policy-target.md)
- [v0 Disclosure, Sharing & Publication Policy Baseline](knowledge/reconciliation/disclosure-publication-policy-baseline.md)
- [v0 Derived View, API & UI State Target](knowledge/reconciliation/derived-view-api-ui-target.md)
- [v0 Interface Compatibility & Cutover Baseline](knowledge/reconciliation/interface-compatibility-baseline.md)
- [v0 Migration, Backfill & Rollout Execution Plan](knowledge/reconciliation/migration-rollout-execution-plan.md)
- [v0 Backfill, Validation & Reversibility Baseline](knowledge/reconciliation/backfill-validation-reversibility-baseline.md)
- [v0 Implementation Execution Handoff](knowledge/reconciliation/implementation-execution-handoff.md)
- [v0 Implementation Closure & Evidence Baseline](knowledge/reconciliation/implementation-closure-evidence-baseline.md)
- [003-G Implementation Reconciliation Gate](knowledge/decisions/003-g-implementation-reconciliation-gate.md)

Canonical documentation behavior is governed by:

- [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md)
- [Concept Design Authority](knowledge/rules/concept-design-authority.md)
- [OKF Adoption Decision](knowledge/decisions/okf-adoption.md)

The `knowledge/` directory is an [Open Knowledge Format (OKF) v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format) bundle and is the compact, progressively disclosed knowledge layer for current design authority.

## Documentation authority

Numbered phase documents and `evidence/` artifacts are the **historical design record**: observations, alternatives, reasoning, falsification, and exit decisions.

Once knowledge is promoted into a canonical OKF node, later work should reference that node instead of reproducing the full rule or concept specification. Historical records are preserved rather than rewritten merely to match later wording.

Application code and implementation documentation describe current realization; they do not override Concept Design authority.

## Phase 001 — Discovery & Archaeology — complete

1. [001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules](001-A-design-authority-methodology-evidence-and-anti-bias.md)
2. [001-B — Historical Intent Reconstruction & Repository Archaeology](001-B-historical-intent-reconstruction-and-repository-archaeology.md)
3. [001-C — Problem, Actor-Need & Purpose Inventory](001-C-problem-actor-need-and-purpose-inventory.md)
4. [001-D — Candidate Concept Discovery & Boundary Hypotheses](001-D-candidate-concept-discovery-and-boundary-hypotheses.md)
5. [001-E — Concept Criteria, Independence & Genericity Review](001-E-concept-criteria-independence-and-genericity-review.md)
6. [001-F — Operational Principle Development](001-F-operational-principle-development.md)
7. [001-G — Discovery Consolidation & Concept Candidate Gate](001-G-discovery-consolidation-and-concept-candidate-gate.md)

The canonical Phase 001 gate is [001-G Discovery Gate Decision](knowledge/decisions/001-g-discovery-gate.md).

## Phase 002 — Formal Concept Specification — complete

Phase 002 formally specified all 17 concepts admitted by 001-G and consolidated their reference identities, synchronizations, application policies, derived projections, and implementation-reconciliation handoff.

1. [002-A — Offer, Change & Temporal Availability](002-A-offer-change-and-temporal-availability.md) — **complete**
2. [002-B — Evaluation, Disclosure & Directed Response](002-B-evaluation-disclosure-and-directed-response.md) — **complete**
3. [002-C — Program Choice, Participation, Scarcity & Representation Intent](002-C-program-choice-participation-scarcity-and-representation-intent.md) — **complete**
4. [002-D — Vocabulary & Classification](002-D-vocabulary-and-classification.md) — **complete**
5. [002-E — Deliverable & Scheduling Execution](002-E-deliverable-and-scheduling-execution.md) — **complete**
6. [002-F — Publication, Dispatch & Historical Closure](002-F-publication-dispatch-and-historical-closure.md) — **complete**
7. [002-G — Formal Specification Consolidation & Synchronization Handoff](002-G-formal-specification-consolidation-and-synchronization-handoff.md) — **complete**

All 17 concepts are formally specified. The canonical Phase 002 gate is [002-G Formal Specification & Composition Gate](knowledge/decisions/002-g-formal-specification-and-composition-gate.md).

Use the [v0 Synchronization & Composition Contract](knowledge/synchronizations/minneanalytics-v0.md) rather than restating its cross-concept rules here.

## Phase 003 — Implementation Reconciliation & Architecture Mapping — complete

Phase 003 reconciled the existing implementation against the accepted Concept Design model and established a migration-safe runtime handoff.

1. [003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register](003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md) — **complete**
2. [003-B — Persistence, Identity, History & Migration Target Design](003-B-persistence-identity-history-and-migration-target-design.md) — **complete**
3. [003-C — Synchronization, Transaction, Idempotency & Recovery Architecture](003-C-synchronization-transaction-idempotency-and-recovery-architecture.md) — **complete**
4. [003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation](003-D-authority-lifecycle-disclosure-and-operational-policy-reconciliation.md) — **complete**
5. [003-E — Derived Views, API/UI State & Compatibility Reconciliation](003-E-derived-views-api-ui-state-and-compatibility-reconciliation.md) — **complete**
6. [003-F — Data Migration, Backfill, Rollout & Reversibility Plan](003-F-data-migration-backfill-rollout-and-reversibility-plan.md) — **complete**
7. [003-G — Implementation Reconciliation Consolidation & Execution Handoff](003-G-implementation-reconciliation-consolidation-and-execution-handoff.md) — **complete**

The canonical Phase 003 gate is [003-G Implementation Reconciliation Gate](knowledge/decisions/003-g-implementation-reconciliation-gate.md).

All 18 semantic gaps and 4 policy gaps now have target architecture, migration/cutover paths, Phase 004 ownership, and runtime closure criteria. They remain implementation-open until verified by Phase 004 evidence.

## Phase 004 — v0 Implementation Execution & Migration — authorized

Phase 004 executes the accepted reconciliation architecture. The authoritative package order and constraints are in the [v0 Implementation Execution Handoff](knowledge/reconciliation/implementation-execution-handoff.md).

1. **004-A — Migration Discipline, Baseline & Additive Schema Foundation** — next
2. **004-B — Revision, Classification, Evaluation & Feedback Canonicalization**
3. **004-C — Selection, Withdrawal, Capacity & Deliverable Canonicalization**
4. **004-D — Availability, Archive, Authority & Disclosure Policy Implementation**
5. **004-E — Publication, Public Access, Schedule & Dispatch Hardening**
6. **004-F — Semantic Read Models, API/UI Cutover & Compatibility Retirement**
7. **004-G — Migration Validation, Rollback Rehearsal & Legacy Cleanup Gate**
8. **004-H — Phase 004 Consolidation & v0 Implementation Exit Review**

Runtime implementation is authorized **only within these bounded packages and gates**. Additive schema/runtime work may begin in 004-A. Destructive cleanup is not pre-authorized and remains conditional on the 004-G removal gate.

The preferred branch discipline is to preserve the 003-G gate commit as the v0 design/reconciliation baseline and begin Phase 004 implementation from it on a dedicated branch such as `concept-design/v0-implementation`.

## Knowledge architecture

The repository uses three complementary layers:

1. **Canonical knowledge** — `knowledge/` OKF nodes for current normative design knowledge.
2. **Historical design record** — numbered phase/evidence files showing how conclusions were reached.
3. **Implementation record** — source code, migrations, tests, reports, and implementation documentation showing current realization.

Do not create a fourth prose layer that restates the same rules. Prefer links to the canonical owner.

## Branch and implementation discipline

Phase 003 itself changed no product/domain runtime behavior.

During Phase 004, code may change under the explicit 003-G authorization, but implementation must preserve canonical semantics, migration no-fabrication rules, one-way compatibility after write cutover, rollback floors, and the evidence/closure requirements in the [Implementation Closure & Evidence Baseline](knowledge/reconciliation/implementation-closure-evidence-baseline.md).

If runtime evidence contradicts an accepted semantic target, stop the affected slice and amend the narrowest canonical owner intentionally rather than encoding an undocumented exception.