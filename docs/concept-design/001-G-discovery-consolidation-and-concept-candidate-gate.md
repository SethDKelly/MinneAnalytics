# 001-G — Discovery Consolidation & Concept Candidate Gate

Status: **Complete**  
Concept model maturity: **v0 — discovery gate complete**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-F — Operational Principle Development](001-F-operational-principle-development.md)

## 1. Purpose

001-G closes Phase 001 by consolidating the complete discovery record and deciding which surviving candidates are mature enough to enter formal Concept Design specification.

This phase is a gate, not another candidate-generation exercise.

The canonical gate decision is maintained in the OKF knowledge bundle at [001-G Discovery Gate Decision](knowledge/decisions/001-g-discovery-gate.md). The detailed per-candidate audit is preserved in the [001-G Discovery Gate Matrix](evidence/001-G-discovery-gate-matrix.md).

This phase record therefore focuses on consolidation, unresolved risk, Phase 001 exit, and handoff rather than restating every candidate's purpose and operational principle.

## 2. Documentation architecture adopted before the gate

Immediately before 001-G, the repository adopted [Open Knowledge Format as the Concept Design knowledge layer](knowledge/decisions/okf-adoption.md).

The resulting authority model is:

1. compact canonical knowledge under `knowledge/`;
2. numbered phase/evidence files as historical design record and provenance;
3. application code/implementation documentation as current realization evidence.

[Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md) now require later work to prefer references to canonical knowledge instead of full restatement, except where independent auditability or a high-consequence constraint justifies controlled repetition.

OKF adoption does not affect candidate acceptance. It changes how accepted knowledge is represented and retrieved, not how concepts are discovered.

## 3. Gate result

Phase 001 enters 001-G with 17 candidates that survived purpose discovery, boundary review, criteria review, and operational-principle falsification.

001-G admits all 17 to formal specification:

- **13 admitted** without additional Phase 001 boundary conditions;
- **4 provisionally admitted** with explicit conditions that Phase 002 must resolve or preserve.

The canonical catalog is [Concept Catalog](knowledge/concepts/).

### Admitted

Proposal, Revision, Evaluation, Feedback, Selection, Withdrawal, Capacity, Classification, Vocabulary, Deliverable, Schedule, Publication, and Archive.

### Provisionally admitted

Controlled Disclosure, Dispatch, Availability Window, and Coverage Target.

The word “provisional” refers to unresolved boundary pressure, not to weaker documentation authority. Their canonical nodes are authoritative about the current boundary and its falsification condition.

## 4. Deferred signals

Phase 001 deliberately leaves several needs outside the Phase 002 concept set:

- Authorization / Delegation;
- Export / persistent report definitions;
- cross-concept Audit Trail;
- Registration / Enrollment.

Their current disposition and re-entry conditions are canonical in the [001-G gate decision](knowledge/decisions/001-g-discovery-gate.md). They remain discoverable rather than being erased from the design history.

## 5. Consolidated architecture findings

The major discovery conclusions survive the full Phase 001 chain:

- the current `Submission` aggregate is not a concept boundary;
- organizer Selection and originator Withdrawal preserve independent histories;
- Revision and Evaluation compose without a separate freshness/validity concept;
- Evaluation, Controlled Disclosure, and Feedback remain independent despite sharing review workflow;
- Vocabulary, Classification, and Coverage Target are distinct;
- actual composition is derived rather than authoritative Coverage state;
- Capacity is distinct from Schedule;
- Deliverable readiness is distinct from Publication;
- public Publication is distinct from internal Archive;
- broad coordinator concepts such as `Conference`, `Program`, generic `Workflow`, or generic `Status` are not admitted merely to hold derived cross-concept state;
- authority remains application policy until a focused user-visible delegation lifecycle is evidenced.

These conclusions are now represented primarily through the canonical concept/rule nodes rather than duplicated as complete specifications in this file.

## 6. Residual risks entering Phase 002

### R-001 — Controlled Disclosure genericity

Formal state/actions must stay centered on staged exposure and intentional reveal. If the specification requires generic permissions, confidentiality, or conflict/recusal management to feel complete, the candidate should be narrowed or demoted.

### R-002 — Availability Window completeness

Formal specification must show a real governed-opportunity lifecycle, not merely an interval value attached to another concept.

### R-003 — Coverage Target authority

Formal specification must not duplicate actual composition or introduce derived count state as authoritative. Target state should remain desired representation only.

### R-004 — Dispatch boundary

Formal specification must keep recipient eligibility supplied by composition and avoid absorbing Feedback, reusable-template authoring, or provider transport without new evidence.

### R-005 — provenance architecture

Each concept must preserve history necessary for its own correctness. The lack of a current Audit Trail concept does not permit history to be discarded or replaced by generic infrastructure logging.

## 7. Codebase refactoring decision

No application/domain refactor is authorized by Phase 001 or by OKF adoption.

That is deliberate.

The conceptual decomposition is now strong enough to guide formal specification, but abstract state/actions and cross-concept synchronizations have not yet been fully designed. Refactoring the runtime now would risk implementing candidate boundaries before their contracts are complete.

Immediate repository changes are limited to documentation/knowledge tooling and validation. Product code should be reconciled only after formal specifications and synchronization design expose concrete mismatches.

See [Concept Design Authority](knowledge/rules/concept-design-authority.md) for the canonical rule.

## 8. Phase 001 exit review

### Methodology

- [x] Concept Design authority separated from implementation authority.
- [x] Purpose-first and evidence-provenance discipline established.
- [x] Historical implementation treated as evidence rather than source of concept boundaries.
- [x] Candidate criteria and operational-principle falsification applied.

### Discovery coverage

- [x] Historical intent reconstructed.
- [x] Problem and actor-need inventory completed.
- [x] Purpose inventory completed.
- [x] Candidate boundaries and alternatives recorded.
- [x] Derived/application behavior explicitly separated from concept state.
- [x] Demoted/future signals preserved.

### Knowledge integrity

- [x] OKF canonical knowledge layer established.
- [x] Canonical documentation ownership established.
- [x] Cross-reference-first authoring rule established.
- [x] Progressive disclosure/agent context rule established.
- [x] Repository validator and CI enforcement established.
- [x] Phase/evidence records retained as audit history rather than rewritten as current authority.

### Candidate gate

- [x] All 17 001-F survivors received explicit gate dispositions.
- [x] Canonical OKF concept nodes created for the Phase 002 entry set.
- [x] Four provisional candidates carry explicit falsification conditions.
- [x] No candidate was admitted merely because it matches an implementation noun.

**Phase 001 passes and is complete.**

## 9. Phase 002 handoff

Phase 002 should perform **Formal Concept Specification** and update the canonical OKF concept nodes rather than create a parallel full specification corpus.

A logical working subdivision is:

1. **002-A — Offer, Change & Temporal Availability** — Proposal, Revision, Availability Window.
2. **002-B — Evaluation, Disclosure & Directed Response** — Evaluation, Controlled Disclosure, Feedback.
3. **002-C — Program Choice, Participation, Scarcity & Representation Intent** — Selection, Withdrawal, Capacity, Coverage Target.
4. **002-D — Vocabulary & Classification** — Vocabulary, Classification.
5. **002-E — Deliverable & Scheduling Execution** — Deliverable, Schedule.
6. **002-F — Publication, Dispatch & Historical Closure** — Publication, Dispatch, Archive.
7. **002-G — Formal Specification Consolidation & Synchronization Handoff** — review the full concept set for specification consistency before application composition is made canonical.

Each subgroup should define purpose (by reference), operational principle (by reference unless changed), abstract state, actions, intrinsic invariants where justified, and any remaining boundary questions. Cross-concept application rules should be recorded as synchronization candidates rather than embedded into the concept specifications.
