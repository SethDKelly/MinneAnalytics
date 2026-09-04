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

# Current maturity

**Phase 002 formal specification is complete.** All 17 Phase 001-G concepts are formally specified and no provisional admissions remain.

Phase 003 is the next design activity: **Implementation Reconciliation & Architecture Mapping**. Product/domain code changes remain unauthorized until that reconciliation identifies and plans concrete semantic gaps.

# Historical design record

The detailed design record remains outside this bundle at the [`docs/concept-design/` entrypoint](../README.md). Use those records as provenance and audit evidence. Do not treat phase-record restatements as newer authority than a canonical knowledge node unless that node explicitly delegates authority back to the phase record.
