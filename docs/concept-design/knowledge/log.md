# Concept Design Knowledge Update Log

## 2026-09-03
* **Specification**: Completed 002-F — Publication, Dispatch & Historical Closure.
* **Specification**: Promoted Publication to `maturity: specified` with exact MaterialRef exposure, reversible publish/unpublish/republish state, and durable historical exposure provenance.
* **Resolution**: Resolved Dispatch's Phase 001 provisional condition positively and promoted it to `maturity: specified`; Dispatch now owns performed Batch/SendRecord history, exact per-recipient message/endpoint evidence, and semantic same-round dedupe while templates, eligibility, Feedback, and provider transport remain external.
* **Specification**: Promoted Archive to `maturity: specified` as a monotonic retained-internal-closure fact rather than a broad conference lifecycle or public archive concept.
* **Boundary**: All 17 Phase 001-G concepts are now formally specified; no provisional admissions remain.
* **Boundary**: Kept Deliverable readiness, Selection/Withdrawal/share policy, recipient eligibility, template generation, provider delivery mechanics, and Archive↔Publication timing outside the three concepts for 002-G synchronization/application composition.
* **Reconciliation**: Flagged mutable/dynamic current deck-publication behavior, potential historical-publicId exposure, missing exact rendered-message snapshots in send history, same-round `includeAlreadyEmailed` ambiguity, and reversible current conference archival as later implementation-reconciliation concerns.
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
* **Boundary**: Distinguished hard Capacity scarcity from soft Coverage Target planning intent and kept effective participation, Selection↔Capacity allocation, Withdrawal-triggered release, observed-composition calculation, and warning policy for later synchronization/application design.
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
