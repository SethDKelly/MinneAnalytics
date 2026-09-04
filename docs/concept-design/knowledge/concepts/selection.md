---
type: Concept Design Concept
title: Selection
description: Durable organizer decision history about whether a candidate is selected, reserved, not selected, or returned to undecided consideration.
tags: [concept-design, concept, selection, decision, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-C
concept_id: CC-006
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-C-program-choice-participation-scarcity-and-representation-intent.md, title: 002-C Program Choice, Participation, Scarcity & Representation Intent }
---
# Purpose

Record consequential organizer choice among candidates while retaining alternatives and the history of later decision changes.

# Operational Principle

A decision maker considers candidates within a selection context. They may select a candidate, keep it as a reserve alternative, or record that it is not selected. If circumstances later change, the decision maker records a later decision rather than rewriting the earlier one, so a reserve candidate can become selected without pretending it was selected all along. A prior decision may also be explicitly cleared, returning the candidate to undecided consideration while retaining the fact that a decision previously existed.

# Abstract State

Let `SelectionContextRef` identify the collection or decision context in which candidates are being considered, and let `CandidateRef` identify a candidate.

Let `Decision` be the set of immutable selection-decision identities.

For every `d ∈ Decision`, Selection records:

- `contextOf(d): SelectionContextRef`;
- `candidateOf(d): CandidateRef`;
- `outcomeOf(d): Disposition?`, where `Disposition = { selected, reserve, notSelected }` and absence means the prior organizer decision was explicitly cleared;
- `decidedBy(d): ActorRef`;
- `decidedAt(d): Instant`;
- `predecessor(d): Decision?` — absent only for the first recorded decision event for the `(context, candidate)` pair.

For every `(context, candidate)` pair with at least one decision event, Selection records:

- `currentDecision(context, candidate): Decision`.

A candidate with no decision event is simply undecided. Selection does not require a separately stored `pending` state.

# Actions

## `Decide(context, candidate, outcome, actor, at) -> decision`

**Intent:** record a consequential organizer choice for a candidate.

**Requires:**

- a context reference, candidate reference, actor reference, and decision instant are supplied;
- `outcome ∈ { selected, reserve, notSelected }`.

Whether the actor is authorized, whether Capacity permits the choice, whether Coverage Target suggests a warning, or whether the candidate remains willing to participate is application policy/composition.

**Effects:**

- creates a fresh decision `d`;
- records the supplied context, candidate, outcome, actor, and instant;
- if a current decision already exists for `(context, candidate)`, records that decision as `predecessor(d)`; otherwise leaves the predecessor absent;
- sets `currentDecision(context, candidate) = d`;
- leaves every prior decision immutable.

## `Clear(context, candidate, actor, at) -> decision`

**Intent:** explicitly remove the current organizer disposition while retaining the prior decision history.

**Requires:**

- a current decision exists for `(context, candidate)`;
- the actor reference and instant are supplied.

**Effects:**

- lets `prior = currentDecision(context, candidate)`;
- creates a fresh decision `d` with the same context/candidate and `outcomeOf(d)` absent;
- records actor/time provenance;
- records `predecessor(d) = prior`;
- sets `currentDecision(context, candidate) = d`;
- leaves the prior decision unchanged.

# Intrinsic Invariants

1. Every Decision belongs to exactly one selection context and one candidate.
2. Every non-clearing Decision has exactly one disposition: selected, reserve, or not selected.
3. Decision records are immutable after creation.
4. For each `(context, candidate)` pair, Decision records form one acyclic linear predecessor chain.
5. `currentDecision(context, candidate)` is the terminal decision in that chain.
6. At most one organizer disposition is current for a `(context, candidate)` pair.
7. Absence of any Decision means undecided; an explicit clearing event also yields no current disposition while preserving decision history.
8. Reserve promotion is represented by a later selected Decision, not by rewriting the prior reserve Decision.
9. Selection has no intrinsic withdrawal, evaluation, capacity allocation, classification, scheduling, deliverable, or publication state.
10. Selection has no intrinsic rule requiring the current decision to follow aggregate Evaluation results or Coverage Target advice.

# Derived Observations

For a `(context, candidate)` pair:

- `currentDisposition` is `outcomeOf(currentDecision(...))` when a current decision exists and its outcome is present;
- `selected` iff `currentDisposition = selected`;
- `reserve` iff `currentDisposition = reserve`;
- `notSelected` iff `currentDisposition = notSelected`;
- `undecided` iff no Decision exists or the current Decision is a clearing event.

The complete organizer decision history is the predecessor chain ending at the current Decision.

# Synchronization Boundary

Selection remains independent from neighboring concepts:

- [Evaluation](evaluation.md) may inform a decision but does not create it;
- [Withdrawal](withdrawal.md) records originator participation rescission without rewriting Selection history;
- [Capacity](capacity.md) may constrain or account for selected commitments;
- [Coverage Target](coverage-target.md) may provide representation guidance/warnings without deciding;
- [Schedule](schedule.md) may require a currently eligible selected activity but does not own Selection.

Effective current participation is therefore composed from Selection, Withdrawal, and relevant application policy rather than stored as one `ProgramStatus` value.

# Formal Specification Decision

**Specified in 002-C.** Selection is an immutable organizer decision history with a current disposition projection. It deliberately rejects `PENDING/APPROVED/DECLINED/BACKUP/WITHDRAWN` as one intrinsic lifecycle: Withdrawal belongs to an independent actor/history, and undecided consideration does not require a stored status.