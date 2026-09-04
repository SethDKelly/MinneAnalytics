# MinneAnalytics Concept Design

This directory contains the repository's Daniel Jackson–style Concept Design retrofit.

## Current status

- **Concept model maturity:** v0 — formal concept specification complete; implementation reconciliation in progress
- **Working branch:** `concept-design/v0-discovery`
- **Completed:** Phase 001 (001-A through 001-G); Phase 002 (002-A through 002-G); 003-A; 003-B; 003-C; 003-D; 003-E
- **Next:** 003-F — Data Migration, Backfill, Rollout & Reversibility Plan

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

## Phase 003 — Implementation Reconciliation & Architecture Mapping — in progress

Phase 003 reconciles the existing implementation against accepted Concept Design authority before application refactoring is authorized.

1. [003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register](003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md) — **complete**
2. [003-B — Persistence, Identity, History & Migration Target Design](003-B-persistence-identity-history-and-migration-target-design.md) — **complete**
3. [003-C — Synchronization, Transaction, Idempotency & Recovery Architecture](003-C-synchronization-transaction-idempotency-and-recovery-architecture.md) — **complete**
   - [Synchronization, Transaction & Recovery Target](knowledge/reconciliation/synchronization-transaction-recovery-target.md)
   - [Idempotency & Recovery Baseline](knowledge/reconciliation/idempotency-recovery-baseline.md)
4. [003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation](003-D-authority-lifecycle-disclosure-and-operational-policy-reconciliation.md) — **complete**
   - [Authority, Lifecycle & Operational Policy Target](knowledge/reconciliation/authority-lifecycle-operational-policy-target.md)
   - [Disclosure, Sharing & Publication Policy Baseline](knowledge/reconciliation/disclosure-publication-policy-baseline.md)
5. [003-E — Derived Views, API/UI State & Compatibility Reconciliation](003-E-derived-views-api-ui-state-and-compatibility-reconciliation.md) — **complete**
   - [Derived View, API & UI State Target](knowledge/reconciliation/derived-view-api-ui-target.md)
   - [Interface Compatibility & Cutover Baseline](knowledge/reconciliation/interface-compatibility-baseline.md)
6. **003-F — Data Migration, Backfill, Rollout & Reversibility Plan** — next
7. **003-G — Implementation Reconciliation Consolidation & Execution Handoff**

003-A established the semantic gaps. 003-B defined persistent identity/history targets and expand-first migration truth. 003-C defined atomic vs convergent execution, idempotency, and external-resource recovery. 003-D defined action capabilities, lifecycle, disclosure, sharing, exact-material Publication, and permitted post-Archive operations. 003-E now defines how canonical facts, derived views, compatibility projections, and transient operation state cross the API/UI boundary.

The target deliberately preserves composition-oriented screens and useful legacy fields where they ease migration, but no compound status, queue, badge, or compatibility field may remain an independent write authority after canonical cutover.

## Knowledge architecture

The repository uses three complementary layers:

1. **Canonical knowledge** — `knowledge/` OKF nodes for current normative design knowledge.
2. **Historical design record** — numbered phase/evidence files showing how conclusions were reached.
3. **Implementation record** — source code and implementation documentation showing current realization.

Do not create a fourth prose layer that restates the same rules. Prefer links to the canonical owner.

## Branch discipline

003-E still authorizes **no application/domain/schema/refactoring changes**.

003-F must now turn the full Phase 003 target into a versioned, staged, reversible implementation plan: additive schema batches, truthful backfill, semantic command/read-model introduction, compatibility adapters, shadow/parity validation, public-access hardening, rollout/rollback boundaries, and eventual legacy retirement.