# Concept Design Knowledge Update Log

## 2026-09-03
* **Reconciliation**: Completed 003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation.
* **Authority**: Defined action-oriented application capabilities while retaining current `ADMIN`/`BOARD`/`CHAIR` roles only as an initial capability-assignment mechanism; role names are not concept state and administrator privilege does not bypass concept invariants.
* **Lifecycle**: Narrowed ordinary application progression to setup/live/Archive, kept Archive monotonic, rejected routine reopening/regression, and replaced the broad ACTIVE-only mutation rule with action-specific lifecycle policy.
* **Post-closure policy**: Explicitly permitted historical reads/exports, recovery convergence, public Unpublish, exact eligible post-event Publish/Republish, and classified post-closure-safe Dispatch purposes without reopening ordinary event mutation.
* **Availability/edit policy**: Classified legacy `submissionsOpen` as suspension-only policy under the canonical Availability Window; ordinary Revision uses Window + ownership + decision lock, while review-requested editing requires an explicit scoped exception rather than Feedback itself granting edit authority.
* **Controlled Disclosure**: Separated Proposal-level presenter identity from exact-Revision peer aggregate information; identity may be explicitly revealed with durable monotonic provenance, while peer aggregate reveal follows the applicable current Evaluation with no v0 manual bypass.
* **Blind-review safety**: Locked routine blind-mode configuration once protected review activity begins so configuration changes cannot pretend prior exposure did not happen or silently reveal staged information.
* **Sharing/publication policy**: Kept `deckShareable` as a legacy public-sharing eligibility input rather than inferred presenter consent, required provenance for target-native changes, allowed exact-material Publication after Archive, and made public tokens addresses rather than authorization.
* **Exact public access**: Required public resolution through exact MaterialRef → currently published Publication → current eligibility, eliminating the target ambiguity where an old `publicId` can be served from mutable parent state.
* **Anti-bloat**: Introduced no Authorization, Delegation, Consent, Workflow, PublicArchive, or ApplicationLifecycle concept; capabilities/configuration remain application policy.
* **Handoff**: Advanced Phase 003 to 003-E — Derived Views, API/UI State & Compatibility Reconciliation. 003-D authorizes no runtime/schema/permission-code changes.
* **Reconciliation**: Completed 003-C — Synchronization, Transaction, Idempotency & Recovery Architecture.
* **Execution classes**: Established TX-A atomic authoritative bundles, TX-B source-authoritative commits with convergent follow-up, TX-C independent notification/external consequences, and TX-D non-transactional resource/provider boundaries.
* **Atomicity**: Classified Offer/Revision establishment, local Evaluation→Disclosure reveal, and newly-effective Selection + Capacity + required Deliverable establishment as local atomic transactions.
* **Source authority**: Required Withdrawal and participation-exit Selection Decisions to commit independently of Capacity/Schedule/Publication cleanup; downstream cleanup is represented as durable idempotent work and cannot erase source truth.
* **Idempotency**: Established semantic uniqueness, expected-head append, stable command keys, and `(syncId, sourceRef, effectKey)` work keys so retries do not manufacture duplicate Revision/Decision/Publication/Dispatch history.
* **Schedule**: Replaced clear-then-generate target semantics with non-mutating generation proposals followed by expected-base, single-transaction accepted placement application.
* **External boundaries**: Required exact prepared Dispatch message/recipient evidence plus provider uncertainty handling, and recoverable storage→ArtifactVersion commit/orphan cleanup for Deliverable uploads.
* **Compatibility direction**: After canonical write cutover, legacy aggregate fields are repaired/projected canonical→compatibility; uncontrolled bidirectional authority is prohibited.
* **Anti-bloat**: Durable work/outbox infrastructure remains an implementation mechanism; no Workflow, SynchronizationManager, distributed saga, message broker, or global event-sourcing requirement was introduced.
* **Handoff**: Advanced Phase 003 to 003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation. 003-C authorizes no runtime/schema/provider changes.
* **Reconciliation**: Completed 003-B — Persistence, Identity, History & Migration Target Design.
* **Persistence target**: Reused existing `Submission.id`, `SubmissionRevision.id`, `Score.id`, `PresenterFeedback.id`, `Theme.id`, `DeckFile.id`, Schedule IDs, and Dispatch Batch/SendRecord IDs where their semantic identity already fits; no parallel identity system is introduced merely for conceptual naming symmetry.
* **History target**: Required new durable identity/history only for Availability Window, Controlled Disclosure, Selection Decisions, Withdrawal, Capacity Pool/Allocation, Coverage Target, Vocabulary TermState, Deliverable Requirement/Assessment, Publication/PublicationState, and Archive closure.
* **Reference target**: Made exact `SubmissionRevision.id` the version-sensitive anchor for Evaluation, Classification, abstract Feedback, and current Revision relationships while retaining integer versions as compatibility ordinals.
* **Capacity/Coverage boundary**: Rejected an automatic sponsor-specific Capacity rate; current sponsor min/max evidence is representation/planning intent and should map to Coverage Target/policy unless different scarce-unit consumption is later demonstrated.
* **Compatibility**: Established current aggregate fields such as `programStatus`, `abstractVersion`, current Submission content, `SubmissionTheme`, `deckStatus`, Theme current state/targets, and Conference publication/archive/window fields as transitional projections or policy inputs rather than competing canonical truth.
* **Migration truth**: Established native, backfilled-historical, backfilled-current-state, and legacy-unknown provenance classes; missing prior Evaluation, disclosure, decision, publication, assessment, dispatch-message, and archive/reopen history must not be fabricated.
* **Rollout posture**: Required expand-first coexistence and preservation of truthful new history through rollback; destructive cleanup is deferred to later compatibility/migration gates.
* **Tooling finding**: Recorded that the current Prisma/SQLite workflow uses `prisma db push` without checked-in migration history; 003-F must define a versioned production-safe migration/backfill/rollback mechanism before destructive schema evolution.
* **Handoff**: Advanced Phase 003 to 003-C — Synchronization, Transaction, Idempotency & Recovery Architecture. 003-B authorizes no Prisma/application runtime changes.
* **Reconciliation**: Completed 003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register.
* **Ownership**: Added the canonical MinneAnalytics v0 Implementation Ownership Map for all 17 concepts, distinguishing semantic ownership from physical table/module boundaries and explicitly permitting useful implementation aggregates to remain where they preserve independent histories and invariants.
* **Gap baseline**: Established 18 semantic gaps and 4 cross-cutting policy gaps with stable IDs, priority, recoverability class, and later Phase 003 ownership.
* **Refinement**: Sharpened Evaluation reconciliation from a freshness/reference issue into a historical-overwrite defect: the current one-Score-per-reviewer/submission upsert can erase a prior Revision-specific Evaluation.
* **Refinement**: Sharpened Controlled Disclosure reconciliation by identifying the absence of durable participant/context/information staging and monotonic reveal history; current identity reveal is only console-logged and aggregate visibility is dynamically recomputed.
* **Migration evidence**: Classified target data as deterministically backfillable, partially backfillable, forward-only where history was never retained, or policy-only; historical provenance must not be manufactured.
* **Handoff**: Advanced Phase 003 to 003-B — Persistence, Identity, History & Migration Target Design. 003-A authorizes no product/domain runtime refactoring.
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
