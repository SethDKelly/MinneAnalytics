# MinneAnalytics Concept Design

This directory contains the repository's Daniel Jackson–style Concept Design retrofit.

## Current status

- **Concept model maturity:** v0 — discovery
- **Working branch:** `concept-design/v0-discovery`
- **Current phase:** 001 — Discovery & Archaeology
- **Completed:** 001-A through 001-F
- **Next:** [001-G — Discovery Consolidation & Concept Candidate Gate](001-G-discovery-consolidation-and-concept-candidate-gate.md) *(created when the gate is executed)*

## Start here

For current design knowledge, begin with the [Concept Design knowledge index](knowledge/index.md).

Canonical documentation behavior is governed by:

- [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md)
- [Concept Design Authority](knowledge/rules/concept-design-authority.md)
- [OKF Adoption Decision](knowledge/decisions/okf-adoption.md)

The `knowledge/` directory is an [Open Knowledge Format (OKF) v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format) bundle. It is the compact, progressively disclosed knowledge layer for settled rules and gated design knowledge.

## Documentation authority

Numbered phase documents and `evidence/` artifacts are the **historical design record**: they preserve observations, alternatives, reasoning, falsification, and exit decisions.

Once knowledge is promoted into a canonical OKF node, later work should reference that node instead of reproducing the full rule or concept specification. Historical records are not rewritten merely to match later wording.

Application code and implementation documentation describe the current realization; they do not override Concept Design authority. See [Concept Design Authority](knowledge/rules/concept-design-authority.md).

## Phase 001 progression

1. [001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules](001-A-design-authority-methodology-evidence-and-anti-bias.md) — complete
2. [001-B — Historical Intent Reconstruction & Repository Archaeology](001-B-historical-intent-reconstruction-and-repository-archaeology.md) — complete
3. [001-C — Problem, Actor-Need & Purpose Inventory](001-C-problem-actor-need-and-purpose-inventory.md) — complete
4. [001-D — Candidate Concept Discovery & Boundary Hypotheses](001-D-candidate-concept-discovery-and-boundary-hypotheses.md) — complete
5. [001-E — Concept Criteria, Independence & Genericity Review](001-E-concept-criteria-independence-and-genericity-review.md) — complete
6. [001-F — Operational Principle Development](001-F-operational-principle-development.md) — complete
7. **001-G — Discovery Consolidation & Concept Candidate Gate** — next

Each phase record links to its supporting evidence artifacts. Load those records only when the reasoning/provenance behind a canonical conclusion is needed.

## Current discovery handoff

The authoritative input to 001-G is the [001-F Surviving Operational-Principle Baseline](evidence/001-F-surviving-candidate-baseline.md).

It contains 17 surviving candidates after purpose discovery, criteria review, and operational-principle falsification. The candidates are not canonical until 001-G explicitly admits them to formal specification.

## Knowledge architecture

The repository uses three complementary layers:

1. **Canonical knowledge** — `knowledge/` OKF nodes for current normative design knowledge.
2. **Historical design record** — numbered phase/evidence files showing how conclusions were reached.
3. **Implementation record** — source code and implementation documentation showing current realization.

Do not create a fourth prose layer that restates the same rules. Prefer links to the canonical owner.

## Branch discipline

The v0 discovery branch remains design/documentation work. OKF adoption permits documentation tooling and CI validation, but it does **not** authorize application/domain refactoring.

Application changes should wait for formal concept specification, synchronization/composition design, and explicit implementation reconciliation to identify what actually needs to change.
