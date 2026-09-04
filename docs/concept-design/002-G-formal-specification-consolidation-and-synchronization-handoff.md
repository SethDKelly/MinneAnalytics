# 002-G — Formal Specification Consolidation & Synchronization Handoff

Status: **Complete**  
Concept model maturity: **v0 — formal specification complete; implementation reconciliation next**  
Branch: **`concept-design/v0-discovery`**  
Depends on: 002-A through 002-F

## 1. Purpose

002-G closes Phase 002 by:

- verifying all 17 formally specified concepts remain coherent as one model;
- resolving cross-concept reference identities where individual concept specifications intentionally stayed abstract;
- classifying cross-concept behavior as synchronization, application policy, derived projection, or implementation reconciliation;
- establishing the canonical MinneAnalytics v0 synchronization/composition contract;
- defining the implementation-reconciliation handoff without authorizing product refactoring yet.

Current normative cross-concept knowledge is owned by [MinneAnalytics v0 Synchronization & Composition Contract](knowledge/synchronizations/minneanalytics-v0.md). The individual concept nodes remain authoritative for concept-local state/actions/invariants.

Historical audit evidence is retained in:

- [002-G Concept Conformance Matrix](evidence/002-G-concept-conformance-matrix.md);
- [002-G Implementation Reconciliation Register](evidence/002-G-implementation-reconciliation-register.md).

---

## 2. Entry conditions

002-A through 002-F formally specified all 17 candidates admitted by Phase 001-G.

All four provisional admissions resolved positively:

- Availability Window;
- Controlled Disclosure;
- Coverage Target;
- Dispatch.

002-G therefore did not reopen concept discovery by default. A concept would be reopened only if composition exposed an actual incompleteness, contradiction, or hidden dependency.

No such failure occurred.

---

## 3. Consolidation method

The complete model was tested against five questions.

### C-01 — Can every concept remain independently understandable?

Yes. No concept requires direct access to another concept's internal representation.

### C-02 — Does composition require a new coordinator concept?

No. Effective participation, Evaluation currentness, Coverage assessment, publication eligibility, edit eligibility, and dispatch eligibility remain derived/policy concerns.

### C-03 — Are reference identities stable at the correct semantic granularity?

Yes, after one application-level alignment decision:

- durable operational identity uses Proposal;
- version-sensitive review/classification uses exact Revision;
- public exposure uses exact ArtifactVersion/MaterialRef;
- Dispatch dedupe uses stable RecipientRef.

### C-04 — Can hard invariants and actor authority survive synchronization failure?

Yes, if implementation distinguishes precondition-style coordination from source-authoritative follow-up.

### C-05 — Does the model force one code/table/service per concept?

No. Concept Design governs semantic ownership and behavior, not physical modularity.

---

## 4. Reference alignment decision

The most important 002-G composition decision is the identity mapping recorded canonically in the synchronization contract.

### Durable Proposal identity

Use Proposal identity for:

- Selection candidate;
- Withdrawal participation/commitment;
- Capacity commitment;
- Deliverable subject;
- Schedule activity.

These behaviors concern the continuing offered participation and should not be invalidated merely because its content is revised.

### Exact Revision identity

Use exact Revision identity for:

- Evaluation subject;
- Classification subject.

This preserves what an evaluator actually judged and which terms described that exact content state.

A classification-only edit can therefore create another Revision even when the opaque Revision `Form` is otherwise unchanged. Revision explicitly allows a successor whose Form is equal; the changed classification set is application-composed state associated with the new Revision identity.

### Exact public material identity

Publication uses exact Deliverable ArtifactVersion (or another immutable MaterialRef), never an implicit mutable `latest` pointer.

### Stable recipient identity

Dispatch dedupe uses RecipientRef while preserving the actual endpoint separately.

---

## 5. Synchronization classification result

002-G establishes eight required synchronization families in the canonical synchronization contract:

1. Offer → initial Revision + initial Classification;
2. Revision → version-specific Classification set;
3. current Evaluation → permitted peer/aggregate Controlled Disclosure reveal;
4. effective-participation entry → Capacity allocation;
5. first effective participation → Deliverable requirement;
6. effective-participation exit → Capacity release;
7. effective-participation exit → Schedule unplacement;
8. publication-eligibility loss → Publication unpublish.

These relationships do not merge the concepts involved.

---

## 6. Application-policy result

The following remain application policy rather than concept state:

- action authority;
- Availability Window/edit eligibility;
- Evaluation applicability/current aggregate rules;
- effective participation definition;
- Coverage warning/confirmation policy;
- Schedule eligibility;
- Publication eligibility and rights/share consent;
- Dispatch audience/message preparation;
- Archive-driven mutation gating and explicit post-closure exceptions.

No generic Authorization, Workflow, ProgramStatus, PublicationEligibility, or DispatchEligibility concept is introduced.

---

## 7. Derived-projection result

The application should derive rather than independently persist conceptual authority for:

- current proposal form;
- current Evaluation set and score aggregates;
- rescore/work queues;
- effective participation;
- current/prospective program composition;
- Coverage gaps/excess/warnings/heatmaps;
- Deliverable work queues;
- current public listing;
- Dispatch eligibility and already-sent views.

Persistence caches/materialized projections remain possible implementation techniques, but must be reconstructible from their canonical owners or explicitly treated as caches rather than competing truth.

---

## 8. Synchronization failure semantics

002-G establishes one important design rule for implementation planning.

### Precondition-style coordination

When an action cannot truthfully succeed without another concept's hard invariant—most importantly newly effective participation requiring Capacity—the application should validate/co-commit the required target action before presenting source success.

### Source-authoritative follow-up

When an actor's source action must remain independently true—most importantly Withdrawal—the source action must not be rolled back because downstream cleanup fails.

For Withdrawal:

1. record Withdrawal;
2. derive effective participation as false immediately;
3. converge/retry Capacity release, Schedule unplacement, and relevant Publication cleanup;
4. surface synchronization failure operationally if needed;
5. never erase Withdrawal to restore consistency.

This preserves actor authority and independent histories under partial failure.

---

## 9. No hidden god concept result

The complete cross-concept model does not require:

- Program;
- ProgramStatus;
- Workflow;
- EffectiveParticipation;
- EvaluationFreshness;
- CoverageAssessment;
- ScheduleDraft;
- PublicationEligibility;
- DispatchEligibility;
- SynchronizationManager.

Some implementation layer must orchestrate application commands/events, but that technical mechanism is not itself a user-facing Concept Design concept without a separately evidenced purpose.

---

## 10. Implementation-reconciliation findings

002-G does not attempt to solve implementation mapping in the same step as accepting the conceptual model.

The reconciliation register identifies the highest-priority gaps, including:

- `Submission` as a physical aggregate spanning many conceptual owners;
- `ProgramStatus` flattening Selection and Withdrawal;
- score/review currentness versus exact Revision identity;
- submission-level Classification versus version-specific Revision Classification;
- computed Capacity snapshots versus durable allocation semantics;
- detached `deckStatus` versus exact ArtifactVersion readiness;
- schedule generation overwriting planner placements directly;
- dynamic/latest public deck behavior versus exact Publication MaterialRef;
- potentially accessible historical deck `publicId` values;
- Dispatch send history lacking exact rendered MessageRef;
- same-round resend API semantics conflicting with persistent dedupe;
- reversible current `ARCHIVED` status clearing closure provenance.

These are implementation design inputs, not permission to refactor immediately.

---

## 11. Deferred concept signals retained

Phase 002 does not promote the Phase 001 deferred signals:

- Authorization / Delegation;
- Export / saved report definitions;
- cross-concept Audit Trail;
- Registration / Enrollment.

Implementation reconciliation must not accidentally recreate them as broad infrastructure concepts merely because current code has role helpers, export routes, logs, or registration flags.

---

## 12. Phase 002 exit gate

### Formal concept completeness

**PASS** — all 17 concepts have accepted purpose, operational principle, abstract state, actions, intrinsic invariants, derived observations, and synchronization boundaries.

### Provisional conditions

**PASS** — all four resolved positively.

### Cross-concept compatibility

**PASS** — reference alignment and composition do not require concept merger.

### Hidden-authority duplication

**PASS** — combined statuses/projections are not promoted as canonical state.

### Synchronization handoff

**PASS** — canonical synchronization, policy, projection, and failure-semantics contracts exist.

### Implementation authorization

**NOT YET** — Phase 002 accepts design authority but deliberately leaves product refactoring to Phase 003 reconciliation/planning.

**Phase 002 result: COMPLETE.**

---

## 13. Phase 003 — Implementation Reconciliation & Architecture Mapping

The recommended next phase is:

### 003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register

Map current models, fields, routes, helpers, views, and histories to canonical concepts, policies, projections, and synchronizations. Refine/close the 002-G reconciliation register.

### 003-B — Persistence, Identity, History & Migration Target Design

Decide physical persistence/reference strategy for Proposal/Revision/Selection/Withdrawal/Classification/Capacity/Deliverable/Publication/Dispatch/Archive, without assuming one-table-per-concept.

### 003-C — Synchronization, Transaction, Idempotency & Recovery Architecture

Design application command/event boundaries for the canonical synchronization contracts, including hard preconditions, source-authoritative follow-up, retries, and consistency recovery.

### 003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation

Map current role helpers, Availability/Archive gating, Controlled Disclosure, share/rights policy, and post-event operations into explicit application policy.

### 003-E — Derived Views, API/UI State & Compatibility Reconciliation

Replace or reinterpret combined workflow/status projections safely while preserving UX/API compatibility where useful.

### 003-F — Data Migration, Backfill, Rollout & Reversibility Plan

Plan migration of historical state, exact Revision/Classification associations, Deliverable assessments, Publication material identity, Dispatch message evidence, and Archive provenance.

### 003-G — Implementation Reconciliation Consolidation & Execution Handoff

Confirm architecture/migration coverage, identify intentionally retained implementation aggregates, authorize concrete implementation phases, and preserve canonical documentation authority.

---

## 14. Final 002-G decision

Phase 002 closes with a stable v0 formal concept model and an explicit application-composition contract.

The next work should **reconcile the existing implementation to that design**, not continue abstract discovery unless reconciliation uncovers genuinely new behavioral evidence.
