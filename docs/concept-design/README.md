# MinneAnalytics Concept Design

This directory contains the repository's Daniel Jackson–style Concept Design retrofit.

## Current status

- **Concept model maturity:** v0 — formal specification in progress
- **Working branch:** `concept-design/v0-discovery`
- **Completed:** Phase 001 (001-A through 001-G); 002-A; 002-B; 002-C; 002-D
- **Next:** 002-E — Deliverable & Scheduling Execution

## Start here

For current normative design knowledge, begin with the [Concept Design knowledge index](knowledge/index.md) and [Concept Catalog](knowledge/concepts/).

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

## Phase 002 — Formal Concept Specification — in progress

Phase 002 extends the canonical concept nodes with abstract state, actions, intrinsic invariants, derived observations, and explicit synchronization boundaries.

1. [002-A — Offer, Change & Temporal Availability](002-A-offer-change-and-temporal-availability.md) — **complete**
   - [Proposal](knowledge/concepts/proposal.md) — specified
   - [Revision](knowledge/concepts/revision.md) — specified
   - [Availability Window](knowledge/concepts/availability-window.md) — specified; Phase 001 provisional condition resolved
2. [002-B — Evaluation, Disclosure & Directed Response](002-B-evaluation-disclosure-and-directed-response.md) — **complete**
   - [Evaluation](knowledge/concepts/evaluation.md) — specified
   - [Controlled Disclosure](knowledge/concepts/controlled-disclosure.md) — specified; Phase 001 provisional condition resolved
   - [Feedback](knowledge/concepts/feedback.md) — specified
3. [002-C — Program Choice, Participation, Scarcity & Representation Intent](002-C-program-choice-participation-scarcity-and-representation-intent.md) — **complete**
   - [Selection](knowledge/concepts/selection.md) — specified
   - [Withdrawal](knowledge/concepts/withdrawal.md) — specified
   - [Capacity](knowledge/concepts/capacity.md) — specified
   - [Coverage Target](knowledge/concepts/coverage-target.md) — specified; Phase 001 provisional condition resolved
4. [002-D — Vocabulary & Classification](002-D-vocabulary-and-classification.md) — **complete**
   - [Vocabulary](knowledge/concepts/vocabulary.md) — specified
   - [Classification](knowledge/concepts/classification.md) — specified
5. **002-E — Deliverable & Scheduling Execution** — next
6. **002-F — Publication, Dispatch & Historical Closure**
7. **002-G — Formal Specification Consolidation & Synchronization Handoff**

The remaining concept maturity and group membership are maintained in the [Concept Catalog](knowledge/concepts/) rather than duplicated here.

## Formal-specification results to date

002-A separates durable offer identity, mutable history, and governed temporal opportunity.

002-B separates evaluator-attributed judgment, staged information disclosure, and recipient-directed response.

002-C separates organizer choice from originator withdrawal, effective participation from either source fact, hard finite scarcity from soft representation intent, and desired representation from observed composition.

002-D separates stable reusable-term identity/lifecycle from subject Classification and keeps both independent from Coverage Target. It also carries forward the application-level decision of whether MinneAnalytics classifications attach to a durable Proposal or exact Revision identities when version-sensitive classification matters.

The complete state/action/invariant definitions live in the canonical concept nodes. Numbered phase records preserve decisions, rejected alternatives, deferred synchronization questions, and implementation-reconciliation observations.

No application/domain implementation changes are authorized by Phase 002 specification work.

## Knowledge architecture

The repository uses three complementary layers:

1. **Canonical knowledge** — `knowledge/` OKF nodes for current normative design knowledge.
2. **Historical design record** — numbered phase/evidence files showing how conclusions were reached.
3. **Implementation record** — source code and implementation documentation showing current realization.

Do not create a fourth prose layer that restates the same rules. Prefer links to the canonical owner.

## Branch discipline

Phase 002 formal specification does **not** authorize application/domain refactoring.

Synchronization/composition design and explicit implementation reconciliation should determine what product code actually needs to change.