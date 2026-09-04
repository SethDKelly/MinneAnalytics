# Concept Catalog

These nodes are the canonical knowledge representation of the concepts admitted by Phase 001-G and formally specified by Phase 002. Formal abstract state, actions, intrinsic invariants, derived observations, and concept-local synchronization boundaries live in these nodes rather than in parallel specification documents.

# Formally specified

* [Proposal](proposal.md) - Durable offer identity and originator/subject reference; specified in 002-A.
* [Revision](revision.md) - Append-only linear change history with one current revision per tracked subject; specified in 002-A.
* [Availability Window](availability-window.md) - Referable governed opportunity with a valid half-open interval and derived upcoming/open/closed phase; specified in 002-A and provisional condition resolved.
* [Evaluation](evaluation.md) - Evaluator-attributed judgment about an exact referable subject state with optional private context; specified in 002-B.
* [Controlled Disclosure](controlled-disclosure.md) - Monotonic staged exposure of a specific information item to a participant/context; specified in 002-B and provisional condition resolved.
* [Feedback](feedback.md) - Immutable recipient-directed response about an exact referable subject; specified in 002-B.
* [Selection](selection.md) - Immutable organizer decision history with selected/reserve/not-selected dispositions and explicit clearing; specified in 002-C.
* [Withdrawal](withdrawal.md) - Monotonic originator rescission fact independent of Selection history; specified in 002-C.
* [Capacity](capacity.md) - Finite pool with class-sensitive allocation/release and a hard no-overallocation invariant; specified in 002-C.
* [Coverage Target](coverage-target.md) - Desired representation bounds only; observed composition remains derived; specified in 002-C and provisional condition resolved.
* [Vocabulary](vocabulary.md) - Stable reusable Term identities with append-only wording/availability history and contribute/correct/retire/restore lifecycle; specified in 002-D.
* [Classification](classification.md) - Current SubjectRef↔TermRef association relation independent of term lifecycle and representation planning; specified in 002-D.
* [Deliverable](deliverable.md) - Durable artifact requirement with immutable provided versions and version-specific readiness Assessment history; specified in 002-E.
* [Schedule](schedule.md) - Explicit human-adjustable placement relation over place/time Opportunities, independent of generation strategy; specified in 002-E.
* [Publication](publication.md) - Intentional reversible public exposure of an exact MaterialRef with durable exposure history; specified in 002-F.
* [Dispatch](dispatch.md) - Provider-neutral performed operational sends with exact per-recipient message evidence and semantic round dedupe; specified in 002-F and provisional condition resolved.
* [Archive](archive.md) - Monotonic internal closure of a working context into retained history; specified in 002-F.

All 17 Phase 001-G candidates are formally specified. No provisional admissions remain.

# Application composition

The concept nodes intentionally do not restate cross-concept application rules. Use the canonical [MinneAnalytics v0 Synchronization & Composition Contract](../synchronizations/minneanalytics-v0.md) for:

- Proposal/Revision/Classification reference alignment;
- effective participation;
- Evaluation currentness and disclosure sequencing;
- Selection/Capacity/Withdrawal coordination;
- Coverage projections;
- Deliverable/Schedule participation behavior;
- Publication eligibility/material identity;
- Dispatch audience/dedupe composition;
- Archive mutation gating.

# Deferred signals

Authorization/delegation, Export/report definitions, cross-concept Audit Trail, and Registration/Enrollment are not in the current concept set. See the [001-G discovery gate decision](../decisions/001-g-discovery-gate.md) for their disposition.

# Specification progression

* [002-A — Offer, Change & Temporal Availability](../../002-A-offer-change-and-temporal-availability.md) formally specifies Proposal, Revision, and Availability Window.
* [002-B — Evaluation, Disclosure & Directed Response](../../002-B-evaluation-disclosure-and-directed-response.md) formally specifies Evaluation, Controlled Disclosure, and Feedback.
* [002-C — Program Choice, Participation, Scarcity & Representation Intent](../../002-C-program-choice-participation-scarcity-and-representation-intent.md) formally specifies Selection, Withdrawal, Capacity, and Coverage Target.
* [002-D — Vocabulary & Classification](../../002-D-vocabulary-and-classification.md) formally specifies Vocabulary and Classification.
* [002-E — Deliverable & Scheduling Execution](../../002-E-deliverable-and-scheduling-execution.md) formally specifies Deliverable and Schedule.
* [002-F — Publication, Dispatch & Historical Closure](../../002-F-publication-dispatch-and-historical-closure.md) formally specifies Publication, Dispatch, and Archive.
* [002-G — Formal Specification Consolidation & Synchronization Handoff](../../002-G-formal-specification-consolidation-and-synchronization-handoff.md) accepts the complete v0 baseline and establishes the canonical cross-concept handoff.

# Phase 002 result

**Complete.** The next activity is Phase 003 implementation reconciliation and architecture mapping, not additional concept specification by default.
