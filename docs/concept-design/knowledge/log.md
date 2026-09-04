# Concept Design Knowledge Update Log

## 2026-09-03
* **Gate**: Completed 002-G — Formal Specification Consolidation & Synchronization Handoff; Phase 002 is complete.
* **Decision**: Accepted all 17 Phase 001-G candidates as the v0 formally specified concept baseline; no provisional admissions remain.
* **Composition**: Added canonical MinneAnalytics v0 reference alignment: durable operational behavior uses Proposal identity, version-sensitive Evaluation/Classification use exact Revision identity, Publication uses exact MaterialRef/ArtifactVersion, and Dispatch dedupe uses stable RecipientRef.
* **Synchronization**: Established eight required synchronization families covering offer/revision initialization, version-specific Classification, Evaluation-driven reveal, effective-participation Capacity/Deliverable/Schedule effects, and publication-eligibility loss.
* **Policy**: Classified edit eligibility, Evaluation applicability, effective participation, Coverage warnings, Schedule eligibility, Publication eligibility, Dispatch audience/message preparation, and Archive mutation gating as application policy rather than concept state.
* **Projection**: Classified current aggregates/work queues, effective participation, observed/prospective composition, Coverage assessments, public listings, and dispatch-eligibility views as derived projections rather than new sources of truth.
* **Failure semantics**: Distinguished hard precondition-style coordination from source-authoritative follow-up; Withdrawal must remain true even when downstream Capacity/Schedule/Publication cleanup requires retry/convergence.
* **Handoff**: Added implementation reconciliation register and established Phase 003 — Implementation Reconciliation & Architecture Mapping as the next design activity; product/domain refactoring remains unauthorized until reconciliation planning completes.
* **Specification**: Completed 002-F — Publication, Dispatch & Historical Closure.
* **Specification**: Promoted Publication to `maturity: specified` with exact MaterialRef/PublicSurfaceRef identity, reversible current availability, immutable exposure history, and no mutable-latest repointing.
* **Resolution**: Resolved Dispatch's Phase 001 provisional condition positively and promoted it to `maturity: specified` with provider-neutral Batch/SendRecord state, exact message/endpoint evidence, and same-round semantic dedupe.
* **Specification**: Promoted Archive to `maturity: specified` as monotonic internal closure with durable actor/time provenance and no intrinsic reopen/general-lifecycle state.
* **Boundary**: Separated public Publication from internal Archive closure and kept templates, recipient eligibility, provider transport, readiness/share policy, and post-closure operation policy outside the three concepts.
* **Specification**: Completed 002-E — Deliverable & Scheduling Execution.
* **Specification**: Promoted Deliverable to `maturity: specified` with durable artifact requirement state, immutable provided ArtifactVersion history, and version-specific concern/ready Assessment history.
* **Boundary**: Readiness now applies to the exact current artifact version; providing a replacement artifact does not inherit earlier readiness and does not erase prior review history.
* **Specification**: Promoted Schedule to `maturity: specified` with explicit Schedule/Opportunity state and planner-controlled `Place`/`Move`/`Swap`/`Unplace` actions.
* **Boundary**: Generated schedules remain suggestions until explicit placement is applied; Selection, Withdrawal, Capacity, Deliverable readiness, demand, and generation heuristics remain synchronization/application inputs rather than Schedule state.
* **Specification**: Completed 002-D — Vocabulary & Classification.
* **Specification**: Promoted Vocabulary to `maturity: specified` with stable Term identity, append-only wording/availability history, and explicit `Contribute`/`Correct`/`Retire`/`Restore` lifecycle actions.
* **Specification**: Promoted Classification to `maturity: specified` as the current SubjectRef↔TermRef association relation, independent from term governance, Coverage Target, Selection, and Revision history.
* **Boundary**: Retirement no longer implies classification deletion; existing associations may remain interpretable while new classification eligibility can depend on Vocabulary availability through later application composition.
* **Boundary**: Preserved the version-sensitive classification question for later synchronization design: MinneAnalytics may classify durable Proposal identities or exact Revision identities without merging Classification into Revision.
* **Specification**: Completed 002-C — Program Choice, Participation, Scarcity & Representation Intent.
* **Specification**: Promoted Selection to `maturity: specified` with immutable organizer Decision history, selected/reserve/not-selected dispositions, explicit clearing, and no intrinsic Withdrawal or Evaluation state.
* **Specification**: Promoted Withdrawal to `maturity: specified` as a monotonic originator rescission fact that does not rewrite Selection history and has no invented reinstatement lifecycle.
* **Specification**: Promoted Capacity to `maturity: specified` with finite Pool limits, class-sensitive rates, Allocation/Release state, and a hard no-overallocation invariant; committed/remaining/saturated are derived.
* **Resolution**: Resolved Coverage Target's Phase 001 provisional condition positively and promoted it to `maturity: specified`; desired bounds are authoritative while observed composition, gaps/excesses, warnings, and visualizations remain derived application projections.
* **Boundary**: Distinguished hard Capacity scarcity from soft Coverage Target planning intent and kept effective participation, Selection↔Capacity allocation, Withdrawal-triggered release, observed-composition calculation, and warning policy for later synchronization/application-policy design.
* **Specification**: Completed 002-B — Evaluation, Disclosure & Directed Response.
* **Specification**: Promoted Evaluation to `maturity: specified` with exact-subject attribution, opaque Judgment, evaluator-owned revision of the same judgment, optional private context, and explicit exclusion of aggregate/currentness/work-queue semantics.
* **Resolution**: Resolved Controlled Disclosure's Phase 001 provisional condition positively and promoted it to `maturity: specified`; the concept now owns one participant/context/information exposure relation with monotonic reveal rather than generic access control.
* **Specification**: Promoted Feedback to `maturity: specified` as immutable recipient-directed response with exact subject attribution, separate from private Evaluation context and Dispatch delivery semantics.
* **Boundary**: Kept Evaluation freshness/aggregation, reveal eligibility, Feedback-triggered Revision, `FEEDBACK_PENDING` workflow state, and notification delivery outside the three concepts for later synchronization/application-policy design.
* **Specification**: Completed 002-A — Offer, Change & Temporal Availability.
* **Specification**: Promoted Proposal to `maturity: specified` with durable offer state, `Offer` action, intrinsic invariants, and explicit exclusions from downstream lifecycle behavior.
* **Specification**: Promoted Revision to `maturity: specified` with append-only linear history, `Initialize`/`Revise` actions, immutable revision provenance, and a unique current revision per tracked subject.
* **Resolution**: Resolved Availability Window's Phase 001 provisional condition positively and promoted it to `maturity: specified`; window phase is derived from the half-open interval `[opensAt, closesAt)` rather than stored separately.
* **Boundary**: Kept offer/edit eligibility, authority, evaluation freshness, event lifecycle, and exceptional override behavior outside the three concepts for later synchronization/application-policy design.
* **Gate**: Completed Phase 001-G and admitted 17 concept candidates to Phase 002 formal specification, four provisionally at the gate.
* **Creation**: Promoted the 001-G candidate set into canonical OKF concept nodes with purpose, operational principle, boundary, gate status, and provenance.
* **Initialization**: Adopted Open Knowledge Format (OKF) v0.2 as the canonical Concept Design knowledge layer.
* **Creation**: Established documentation-authority and Concept Design authority rules.
* **Automation**: Added repository validation for OKF structure and local knowledge links.
* **Decision**: Kept OKF adoption separate from application/domain implementation refactoring; code reconciliation remains a later Concept Design activity.
