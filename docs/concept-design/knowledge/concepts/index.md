# Concept Catalog

These nodes are the canonical knowledge representation of the concepts admitted by Phase 001-G. Phase 002 incrementally adds formal abstract state, actions, intrinsic invariants, derived observations, and synchronization boundaries to the same nodes rather than creating a parallel specification layer.

# Formally specified

* [Proposal](proposal.md) - Durable offer identity and originator/subject reference; specified in 002-A.
* [Revision](revision.md) - Append-only linear change history with one current revision per tracked subject; specified in 002-A.
* [Availability Window](availability-window.md) - Referable governed opportunity with a valid half-open interval and derived upcoming/open/closed phase; specified in 002-A and no longer provisional.
* [Evaluation](evaluation.md) - Evaluator-attributed judgment about an exact referable subject state with optional private context; specified in 002-B.
* [Controlled Disclosure](controlled-disclosure.md) - Monotonic staged exposure of a specific information item to a participant/context; specified in 002-B and no longer provisional.
* [Feedback](feedback.md) - Immutable recipient-directed response about an exact referable subject; specified in 002-B.
* [Selection](selection.md) - Immutable organizer decision history with selected/reserve/not-selected dispositions and explicit clearing; specified in 002-C.
* [Withdrawal](withdrawal.md) - Monotonic originator rescission fact independent of Selection history; specified in 002-C.
* [Capacity](capacity.md) - Finite pool with class-sensitive allocation/release and a hard no-overallocation invariant; specified in 002-C.
* [Coverage Target](coverage-target.md) - Desired representation bounds only; observed composition remains derived; specified in 002-C and no longer provisional.
* [Vocabulary](vocabulary.md) - Stable reusable Term identities with append-only wording/availability history and contribute/correct/retire/restore lifecycle; specified in 002-D.
* [Classification](classification.md) - Current SubjectRef↔TermRef association relation independent of term lifecycle and representation planning; specified in 002-D.
* [Deliverable](deliverable.md) - Durable artifact requirement with immutable provided versions and version-specific readiness Assessment history; specified in 002-E.
* [Schedule](schedule.md) - Explicit human-adjustable placement relation over place/time Opportunities, independent of generation strategy; specified in 002-E.

# Admitted — awaiting formal specification

* [Publication](publication.md) - Intentional public exposure of eligible material.
* [Archive](archive.md) - Retained read-only internal closure/history.

# Provisionally admitted — awaiting resolution/formal specification

* [Dispatch](dispatch.md) - Performed operational sends with durable recipient/round semantics; must remain separate from Feedback and provider/template implementation.

# Deferred signals

Authorization/delegation, Export/report definitions, cross-concept Audit Trail, and Registration/Enrollment are not in the current Phase 002 concept set. See the [001-G discovery gate decision](../decisions/001-g-discovery-gate.md) for their disposition.

# Specification progression

* [002-A — Offer, Change & Temporal Availability](../../002-A-offer-change-and-temporal-availability.md) formally specifies Proposal, Revision, and Availability Window.
* [002-B — Evaluation, Disclosure & Directed Response](../../002-B-evaluation-disclosure-and-directed-response.md) formally specifies Evaluation, Controlled Disclosure, and Feedback.
* [002-C — Program Choice, Participation, Scarcity & Representation Intent](../../002-C-program-choice-participation-scarcity-and-representation-intent.md) formally specifies Selection, Withdrawal, Capacity, and Coverage Target.
* [002-D — Vocabulary & Classification](../../002-D-vocabulary-and-classification.md) formally specifies Vocabulary and Classification.
* [002-E — Deliverable & Scheduling Execution](../../002-E-deliverable-and-scheduling-execution.md) formally specifies Deliverable and Schedule.
* 002-F will formally specify Publication, Dispatch, and Archive and resolve Dispatch's remaining provisional gate.