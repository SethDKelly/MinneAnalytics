# 002-G — Formal Concept Conformance Matrix

Status: **Complete**  
Authority: historical design evidence; canonical current specifications remain in `knowledge/concepts/`.

## Purpose

This matrix verifies that all 17 Phase 001-G candidates remain coherent after Phase 002 formal specification and cross-concept composition review.

A **pass** means the concept retains:

- one focused behavioral purpose;
- independent abstract state/actions;
- intrinsic invariants that do not require another concept's internals;
- clear authority boundaries;
- no dependency on current implementation nouns;
- a usable synchronization boundary.

| Concept | Phase | Conformance | Composition result |
|---|---|---:|---|
| Proposal | 002-A | PASS | Durable offer identity remains separate from Revision and downstream lifecycle |
| Revision | 002-A | PASS | Exact mutable-content history; currentness/edit eligibility remain composed |
| Availability Window | 002-A | PASS | Temporal opportunity is meaningful without becoming generic calendar/workflow state |
| Evaluation | 002-B | PASS | Exact-subject evaluator judgment; freshness/aggregate use remain derived |
| Controlled Disclosure | 002-B | PASS | Narrow staged exposure; reveal can synchronize from Evaluation without becoming RBAC |
| Feedback | 002-B | PASS | Directed response remains distinct from private Evaluation context and Dispatch |
| Selection | 002-C | PASS | Organizer decision history remains independent from Withdrawal/Capacity |
| Withdrawal | 002-C | PASS | Originator rescission remains independently authoritative and monotonic |
| Capacity | 002-C | PASS | Hard scarce-allocation invariant remains distinct from Selection and Schedule |
| Coverage Target | 002-C | PASS | Desired representation only; observed/prospective composition remains derived |
| Vocabulary | 002-D | PASS | Stable Term lifecycle/history remains separate from subject association |
| Classification | 002-D | PASS | Subject↔Term relation remains independent; MinneAnalytics maps SubjectRef to exact Revision |
| Deliverable | 002-E | PASS | Version-specific artifact readiness remains separate from Selection/Publication |
| Schedule | 002-E | PASS | Explicit human-adjustable placement remains distinct from generators and Capacity |
| Publication | 002-F | PASS | Exact-material public exposure remains distinct from readiness and Archive |
| Dispatch | 002-F | PASS | Performed-send history/round dedupe remains separate from templates/eligibility/provider |
| Archive | 002-F | PASS | Monotonic internal closure remains distinct from public Publication/general lifecycle |

## Provisional-condition disposition

All four Phase 001 provisional admissions resolved positively during specification:

- Availability Window — resolved in 002-A;
- Controlled Disclosure — resolved in 002-B;
- Coverage Target — resolved in 002-C;
- Dispatch — resolved in 002-F.

No Phase 002 concept remains provisional.

## Hidden-coordinator test

The complete model was reviewed for behaviors that might appear to require a new Program/Workflow/Status concept.

The following remain composition rather than concepts:

- edit eligibility;
- Evaluation currentness/freshness;
- effective participation;
- actual/prospective composition;
- Coverage assessment;
- Deliverable work queues;
- Schedule eligibility;
- Publication eligibility;
- Dispatch audience eligibility;
- Archive mutation gating.

No new coordinating concept is required to make the 17 concepts complete.

## Reference-alignment test

Cross-concept references can be aligned without collapsing identities:

- durable operational participation uses Proposal identity;
- exact review/classification content uses Revision identity;
- public material uses exact ArtifactVersion/MaterialRef;
- Dispatch dedupe uses stable RecipientRef rather than endpoint.

This resolves the most important ambiguity left by the individual subgroup specifications while preserving concept independence.

## Exit result

**PASS.** All 17 concepts are accepted as the v0 formal concept baseline for implementation reconciliation.
