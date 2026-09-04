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
* [001-G Discovery Gate Decision](decisions/001-g-discovery-gate.md) - Completes Phase 001 and admits 17 candidates to Phase 002 formal specification, four provisionally.

# Concept catalog

* [Concept Catalog](concepts/) - Canonical nodes for the 17 candidates admitted by the Phase 001 discovery gate.

The catalog currently contains 13 admitted and 4 provisionally admitted candidates. Their `maturity` metadata describes discovery-gate status; Phase 002 will extend the same nodes with formal abstract state, actions, and intrinsic invariants.

# Historical design record

The detailed discovery record remains outside this bundle under [`docs/concept-design/`](../). Use those records as provenance and audit evidence. Do not treat phase-record restatements as newer authority than a canonical knowledge node unless that node explicitly delegates authority back to the phase record.
