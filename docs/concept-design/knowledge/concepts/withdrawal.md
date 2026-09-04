---
type: Concept Design Concept
title: Withdrawal
description: Durable originator rescission of participation or commitment without rewriting organizer decision history.
tags: [concept-design, concept, withdrawal, participation, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-C
concept_id: CC-007
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-C-program-choice-participation-scarcity-and-representation-intent.md, title: 002-C Program Choice, Participation, Scarcity & Representation Intent }
---
# Purpose

Allow an originator to rescind their participation or commitment independently of organizer preference.

# Operational Principle

An originator has an offered participation or commitment they no longer wish to continue. They withdraw it. Withdrawal records that rescission and when it occurred. A separate organizer decision that previously selected, reserved, or rejected the participation remains historically unchanged; withdrawal says what the originator chose, not what the organizer had chosen.

# Abstract State

Let `ParticipationRef` identify an offered participation or commitment.

Let `Withdrawal` be the set of immutable withdrawal identities.

For every `w ∈ Withdrawal`, the concept records:

- `participationOf(w): ParticipationRef`;
- `withdrawnBy(w): ActorRef` — the actor recorded as exercising the originator/participant rescission;
- `withdrawnAt(w): Instant`.

For every participation that has been withdrawn, the concept records:

- `withdrawalOf(participation): Withdrawal`.

Application policy is responsible for establishing that the invoking actor is entitled to withdraw the referenced participation. Withdrawal records the actor and the rescission fact; it is not a general authorization concept.

# Actions

## `Withdraw(participation, actor, at) -> withdrawal`

**Intent:** permanently record that the originator/participant rescinded the referenced participation or commitment.

**Requires:**

- the participation reference, actor reference, and instant are supplied;
- no Withdrawal currently exists for that participation.

Whether the actor is the rightful originator and whether withdrawal is permitted in the current application context are external authorization/policy questions.

**Effects:**

- creates a fresh withdrawal `w`;
- records `participationOf(w) = participation`;
- records `withdrawnBy(w) = actor` and `withdrawnAt(w) = at`;
- records `withdrawalOf(participation) = w`;
- leaves all other concept state unchanged.

# Intrinsic Invariants

1. Every Withdrawal refers to exactly one participation.
2. A participation has at most one Withdrawal record in the current concept.
3. Withdrawal records are immutable after creation.
4. Once a participation is withdrawn, this concept never returns it to a never-withdrawn state.
5. Withdrawal does not erase, rewrite, or reinterpret the underlying [Proposal](proposal.md) or organizer [Selection](selection.md) history.
6. Withdrawal has no intrinsic selected/reserve/not-selected status, replacement-candidate behavior, capacity release, schedule removal, deliverable cancellation, or publication behavior.
7. Withdrawal is not general event cancellation and does not represent organizer-initiated removal.
8. There is no intrinsic `Unwithdraw` or reinstatement action. If the product later supports a participant re-entering after withdrawal, that behavior requires explicit design evidence and may represent a new participation/commitment rather than historical erasure.

# Derived Observations

For a participation `p`:

- `isWithdrawn(p)` iff `withdrawalOf(p)` exists;
- the withdrawal actor and time are obtained from that immutable record.

Whether `p` is effectively participating now cannot be answered by Withdrawal alone.

# Synchronization Boundary

Withdrawal composes with, but does not absorb, neighboring concepts:

- [Selection](selection.md) may still truthfully say the organizer selected the participation before or even after a Withdrawal was recorded;
- application composition determines whether a withdrawn item is currently eligible for [Schedule](schedule.md), [Deliverable](deliverable.md), [Publication](publication.md), or other downstream activity;
- a Withdrawal may cause a [Capacity](capacity.md) allocation to be released, but that is a synchronization rather than Withdrawal state.

This preserves the historical distinction between organizer preference and originator agency.

# Formal Specification Decision

**Specified in 002-C.** Withdrawal is a monotonic, durable rescission fact owned by the originator/participant side of the relationship. It is intentionally not a `ProgramStatus` transition and cannot erase Selection history.