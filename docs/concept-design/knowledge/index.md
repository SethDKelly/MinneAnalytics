---
okf_version: "0.2"
---
# MinneAnalytics Concept Design Knowledge

This directory is the canonical, progressively disclosed knowledge layer for the MinneAnalytics Concept Design retrofit.

Historical phase records and evidence remain in the parent `docs/concept-design/` tree. They explain how decisions were reached; this bundle states the compact knowledge that later work should reuse.

# Authority and authoring rules

* [Documentation Authority & Cross-Reference Rules](rules/documentation-authority.md) - Defines canonical ownership, cross-reference-first authoring, permitted repetition, lifecycle, and drift-control rules.
* [Concept Design Authority](rules/concept-design-authority.md) - Defines the relationship between Concept Design, implementation evidence, synchronizations, and later implementation reconciliation.

# Decisions

* [Decisions](decisions/) - Cross-cutting design and knowledge-architecture decisions.
* [Adopt OKF as the Concept Design Knowledge Layer](decisions/okf-adoption.md) - Adopts OKF v0.2 for canonical knowledge while keeping application architecture independent from the documentation format.

# Concept catalog

* [Concepts](concepts/) - Canonical or gated Concept Design knowledge nodes. Phase 001-G populates the discovery-gate baseline.

# Historical design record

The detailed discovery record remains outside this bundle under [`docs/concept-design/`](../). Use those records as provenance and audit evidence. Do not treat phase-record restatements as newer authority than a canonical knowledge node unless that node explicitly delegates authority back to the phase record.
