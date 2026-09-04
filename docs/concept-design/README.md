# MinneAnalytics Concept Design

This directory contains the repository's Daniel Jackson–style Concept Design retrofit.

## Current status

- **Concept model maturity:** v0 — formal concept specification complete; implementation reconciliation next
- **Working branch:** `concept-design/v0-discovery`
- **Completed:** Phase 001 (001-A through 001-G); Phase 002 (002-A through 002-G)
- **Next:** 003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register

## Start here

For current normative design knowledge, begin with:

- [Concept Design knowledge index](knowledge/index.md)
- [Concept Catalog](knowledge/concepts/)
- [MinneAnalytics v0 Synchronization & Composition Contract](knowledge/synchronizations/minneanalytics-v0.md)
- [002-G Formal Specification & Composition Gate](knowledge/decisions/002-g-formal-specification-and-composition-gate.md)

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

Phase 002 formally specified all 17 concepts admitted by 001-G and then consolidated their reference identities, synchronizations, application policies, derived projections, and implementation-reconciliation handoff.

1. [002-A — Offer, Change & Temporal Availability](002-A-offer-change-and-temporal-availability.md) — **complete**
   - [Proposal](knowledge/concepts/proposal.md)
   - [Revision](knowledge/concepts/revision.md)
   - [Availability Window](knowledge/concepts/availability-window.md)
2. [002-B — Evaluation, Disclosure & Directed Response](002-B-evaluation-disclosure-and-directed-response.md) — **complete**
   - [Evaluation](knowledge/concepts/evaluation.md)
   - [Controlled Disclosure](knowledge/concepts/controlled-disclosure.md)
   - [Feedback](knowledge/concepts/feedback.md)
3. [002-C — Program Choice, Participation, Scarcity & Representation Intent](002-C-program-choice-participation-scarcity-and-representation-intent.md) — **complete**
   - [Selection](knowledge/concepts/selection.md)
   - [Withdrawal](knowledge/concepts/withdrawal.md)
   - [Capacity](knowledge/concepts/capacity.md)
   - [Coverage Target](knowledge/concepts/coverage-target.md)
4. [002-D — Vocabulary & Classification](002-D-vocabulary-and-classification.md) — **complete**
   - [Vocabulary](knowledge/concepts/vocabulary.md)
   - [Classification](knowledge/concepts/classification.md)
5. [002-E — Deliverable & Scheduling Execution](002-E-deliverable-and-scheduling-execution.md) — **complete**
   - [Deliverable](knowledge/concepts/deliverable.md)
   - [Schedule](knowledge/concepts/schedule.md)
6. [002-F — Publication, Dispatch & Historical Closure](002-F-publication-dispatch-and-historical-closure.md) — **complete**
   - [Publication](knowledge/concepts/publication.md)
   - [Dispatch](knowledge/concepts/dispatch.md)
   - [Archive](knowledge/concepts/archive.md)
7. [002-G — Formal Specification Consolidation & Synchronization Handoff](002-G-formal-specification-consolidation-and-synchronization-handoff.md) — **complete**

All 17 concepts are formally specified. All four Phase 001 provisional admissions—Availability Window, Controlled Disclosure, Coverage Target, and Dispatch—resolved positively.

The canonical Phase 002 gate is [002-G Formal Specification & Composition Gate](knowledge/decisions/002-g-formal-specification-and-composition-gate.md).

## Phase 002 composition result

Use the [v0 Synchronization & Composition Contract](knowledge/synchronizations/minneanalytics-v0.md) rather than restating the full rules here.

The key reference alignment is:

- durable program/participation behavior → Proposal identity;
- version-sensitive Evaluation and Classification → exact Revision identity;
- Publication → exact immutable MaterialRef/Deliverable ArtifactVersion;
- Dispatch dedupe → stable RecipientRef, not mutable endpoint.

Cross-concept behaviors such as effective participation, Evaluation currentness, Coverage assessment, Publication eligibility, edit eligibility, and Dispatch audience resolution remain synchronizations/policies/projections rather than new concepts.

No hidden ProgramStatus/Workflow/SynchronizationManager concept was required.

## Phase 003 — Implementation Reconciliation & Architecture Mapping — next

Phase 003 should reconcile the existing implementation against accepted Concept Design authority before application refactoring is authorized.

1. **003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register**
2. **003-B — Persistence, Identity, History & Migration Target Design**
3. **003-C — Synchronization, Transaction, Idempotency & Recovery Architecture**
4. **003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation**
5. **003-E — Derived Views, API/UI State & Compatibility Reconciliation**
6. **003-F — Data Migration, Backfill, Rollout & Reversibility Plan**
7. **003-G — Implementation Reconciliation Consolidation & Execution Handoff**

The initial reconciliation backlog is maintained in [002-G Implementation Reconciliation Register](evidence/002-G-implementation-reconciliation-register.md).

## Knowledge architecture

The repository uses three complementary layers:

1. **Canonical knowledge** — `knowledge/` OKF nodes for current normative design knowledge.
2. **Historical design record** — numbered phase/evidence files showing how conclusions were reached.
3. **Implementation record** — source code and implementation documentation showing current realization.

Do not create a fourth prose layer that restates the same rules. Prefer links to the canonical owner.

## Branch discipline

Completion of Phase 002 does **not** itself authorize application/domain refactoring.

Phase 003 must map and reconcile the current code against the canonical concepts and synchronization contract, identify concrete semantic gaps and migration needs, and explicitly authorize later implementation changes.
