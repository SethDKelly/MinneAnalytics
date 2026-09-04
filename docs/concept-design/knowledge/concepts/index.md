# Concept Catalog

These nodes are the canonical knowledge representation of the concepts admitted by Phase 001-G. Phase 002 incrementally adds formal abstract state, actions, intrinsic invariants, derived observations, and synchronization boundaries to the same nodes rather than creating a parallel specification layer.

# Formally specified

* [Proposal](proposal.md) - Durable offer identity and originator/subject reference; specified in 002-A.
* [Revision](revision.md) - Append-only linear change history with one current revision per tracked subject; specified in 002-A.
* [Availability Window](availability-window.md) - Referable governed opportunity with a valid half-open interval and derived upcoming/open/closed phase; specified in 002-A and no longer provisional.
* [Evaluation](evaluation.md) - Evaluator-attributed judgment about an exact referable subject state with optional private context; specified in 002-B.
* [Controlled Disclosure](controlled-disclosure.md) - Monotonic staged exposure of a specific information item to a participant/context; specified in 002-B and no longer provisional.
* [Feedback](feedback.md) - Immutable recipient-directed response about an exact referable subject; specified in 002-B.

# Admitted — awaiting formal specification

* [Selection](selection.md) - Consequential organizer choice among candidates.
* [Withdrawal](withdrawal.md) - Originator rescission of participation/commitment.
* [Capacity](capacity.md) - Finite commitment capacity and consumption.
* [Classification](classification.md) - Subject associations with reusable terms.
* [Vocabulary](vocabulary.md) - Reusable term lifecycle, contribution, and stewardship.
* [Deliverable](deliverable.md) - Required artifact provision and readiness.
* [Schedule](schedule.md) - Place/time allocation with human-adjustable placements.
* [Publication](publication.md) - Intentional public exposure of eligible material.
* [Archive](archive.md) - Retained read-only internal closure/history.

# Provisionally admitted — awaiting resolution/formal specification

* [Dispatch](dispatch.md) - Performed operational sends with durable recipient/round semantics; must remain separate from Feedback and provider/template implementation.
* [Coverage Target](coverage-target.md) - Desired representation only; actual composition remains derived application state.

# Deferred signals

Authorization/delegation, Export/report definitions, cross-concept Audit Trail, and Registration/Enrollment are not in the current Phase 002 concept set. See the [001-G discovery gate decision](../decisions/001-g-discovery-gate.md) for their disposition.

# Specification progression

* [002-A — Offer, Change & Temporal Availability](../../002-A-offer-change-and-temporal-availability.md) formally specifies Proposal, Revision, and Availability Window.
* [002-B — Evaluation, Disclosure & Directed Response](../../002-B-evaluation-disclosure-and-directed-response.md) formally specifies Evaluation, Controlled Disclosure, and Feedback.
* 002-C will formally specify Selection, Withdrawal, Capacity, and Coverage Target.