# MinneAnalytics Concept Design

This directory contains the repository's Daniel Jackson–style Concept Design retrofit.

## Current status

- **Concept model maturity:** v0 — Phase 001 discovery gate complete
- **Working branch:** `concept-design/v0-discovery`
- **Completed:** 001-A through 001-G
- **Next:** Phase 002 — Formal Concept Specification
- **Next subgroup:** 002-A — Offer, Change & Temporal Availability

## Start here

For current design knowledge, begin with the [Concept Design knowledge index](knowledge/index.md).

The Phase 001 canonical gate is [001-G Discovery Gate Decision](knowledge/decisions/001-g-discovery-gate.md), and the current concept entry set is the [Concept Catalog](knowledge/concepts/).

Canonical documentation behavior is governed by:

- [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md)
- [Concept Design Authority](knowledge/rules/concept-design-authority.md)
- [OKF Adoption Decision](knowledge/decisions/okf-adoption.md)

The `knowledge/` directory is an [Open Knowledge Format (OKF) v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format) bundle. It is the compact, progressively disclosed knowledge layer for current normative design knowledge.

## Documentation authority

Numbered phase documents and `evidence/` artifacts are the **historical design record**: they preserve observations, alternatives, reasoning, falsification, and exit decisions.

Once knowledge is promoted into a canonical OKF node, later work should reference that node instead of reproducing the full rule or concept specification. Historical records are not rewritten merely to match later wording.

Application code and implementation documentation describe the current realization; they do not override Concept Design authority. See [Concept Design Authority](knowledge/rules/concept-design-authority.md).

## Phase 001 — Discovery & Archaeology — complete

1. [001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules](001-A-design-authority-methodology-evidence-and-anti-bias.md)
2. [001-B — Historical Intent Reconstruction & Repository Archaeology](001-B-historical-intent-reconstruction-and-repository-archaeology.md)
3. [001-C — Problem, Actor-Need & Purpose Inventory](001-C-problem-actor-need-and-purpose-inventory.md)
4. [001-D — Candidate Concept Discovery & Boundary Hypotheses](001-D-candidate-concept-discovery-and-boundary-hypotheses.md)
5. [001-E — Concept Criteria, Independence & Genericity Review](001-E-concept-criteria-independence-and-genericity-review.md)
6. [001-F — Operational Principle Development](001-F-operational-principle-development.md)
7. [001-G — Discovery Consolidation & Concept Candidate Gate](001-G-discovery-consolidation-and-concept-candidate-gate.md)

Each phase record links to its supporting evidence artifacts. Load those records only when the reasoning/provenance behind a canonical conclusion is needed.

## Phase 002 handoff

Phase 001 admits **17 candidates** to formal specification:

- **13 admitted:** Proposal, Revision, Evaluation, Feedback, Selection, Withdrawal, Capacity, Classification, Vocabulary, Deliverable, Schedule, Publication, Archive.
- **4 provisionally admitted:** Controlled Disclosure, Dispatch, Availability Window, Coverage Target.

The detailed purposes, operational principles, boundaries, maturity, and provenance live in the [canonical concept nodes](knowledge/concepts/), not here.

The working Phase 002 subdivision established by 001-G is:

1. **002-A — Offer, Change & Temporal Availability**
2. **002-B — Evaluation, Disclosure & Directed Response**
3. **002-C — Program Choice, Participation, Scarcity & Representation Intent**
4. **002-D — Vocabulary & Classification**
5. **002-E — Deliverable & Scheduling Execution**
6. **002-F — Publication, Dispatch & Historical Closure**
7. **002-G — Formal Specification Consolidation & Synchronization Handoff**

## Knowledge architecture

The repository uses three complementary layers:

1. **Canonical knowledge** — `knowledge/` OKF nodes for current normative design knowledge.
2. **Historical design record** — numbered phase/evidence files showing how conclusions were reached.
3. **Implementation record** — source code and implementation documentation showing current realization.

Do not create a fourth prose layer that restates the same rules. Prefer links to the canonical owner.

## Branch discipline

OKF adoption and Phase 001 completion do **not** authorize application/domain refactoring.

Phase 002 should formalize abstract state/actions in the canonical concept nodes. Later synchronization/composition design and explicit implementation reconciliation should determine what product code actually needs to change.
