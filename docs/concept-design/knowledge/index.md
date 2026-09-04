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
* [001-G Discovery Gate Decision](decisions/001-g-discovery-gate.md) - Completes Phase 001 and admits 17 candidates to Phase 002 formal specification, four provisionally at the gate.

# Concept catalog

* [Concept Catalog](concepts/) - Canonical formal specifications for all 17 concepts admitted by Phase 001-G.

Phase 002 formal concept specification is complete through [002-F](../002-F-publication-dispatch-and-historical-closure.md):

* [002-A](../002-A-offer-change-and-temporal-availability.md) — Proposal, Revision, Availability Window.
* [002-B](../002-B-evaluation-disclosure-and-directed-response.md) — Evaluation, Controlled Disclosure, Feedback.
* [002-C](../002-C-program-choice-participation-scarcity-and-representation-intent.md) — Selection, Withdrawal, Capacity, Coverage Target.
* [002-D](../002-D-vocabulary-and-classification.md) — Vocabulary, Classification.
* [002-E](../002-E-deliverable-and-scheduling-execution.md) — Deliverable, Schedule.
* [002-F](../002-F-publication-dispatch-and-historical-closure.md) — Publication, Dispatch, Archive.

All 17 concepts are now `maturity: specified`. Availability Window, Controlled Disclosure, Coverage Target, and Dispatch each resolved their Phase 001 provisional conditions positively. No provisional admissions remain.

The next work is **002-G — Formal Specification Consolidation & Synchronization Handoff**, which will consolidate cross-concept synchronizations/application composition and prepare later implementation reconciliation without reopening concept boundaries casually.

# Historical design record

The detailed design record remains outside this bundle at the [`docs/concept-design/` entrypoint](../README.md). Use those records as provenance and audit evidence. Do not treat phase-record restatements as newer authority than a canonical knowledge node unless that node explicitly delegates authority back to the phase record.