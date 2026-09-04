---
type: Concept Design Concept
title: Proposal
description: A durable offer that binds an originator to a stable reference for the subject placed under organized consideration.
tags: [concept-design, concept, proposal, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-A
concept_id: CC-001
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-A-offer-change-and-temporal-availability.md, title: 002-A Offer, Change & Temporal Availability }
---
# Purpose

Establish a durable offered subject for organized consideration.

# Operational Principle

An originator offers a subject for consideration and receives a fresh Proposal identity that refers to that subject. Later activity can refer to the same Proposal without changing what was originally established as the offer or replacing its identity with a workflow status.

# Abstract State

Let `Proposal` be the set of established proposal identities.

For each `p ∈ Proposal`, Proposal records:

- `originator(p): ActorRef` — the actor who established the offer;
- `subject(p): SubjectRef` — an opaque stable reference to the thing being offered.

`ActorRef` and `SubjectRef` are abstract references. Proposal does not define identity-management behavior for the actor and does not define the internal content or version structure of the subject.

# Actions

## `Offer(originator, subject) -> proposal`

**Intent:** establish a new durable offer.

**Requires:**

- an originator reference is supplied;
- a subject reference is supplied.

Whether the actor is authorized or whether the offer is currently allowed is application policy/composition, not an intrinsic Proposal precondition.

**Effects:**

- creates a fresh `proposal` identity not already in `Proposal`;
- adds `proposal` to `Proposal`;
- sets `originator(proposal) = originator`;
- sets `subject(proposal) = subject`;
- leaves every existing Proposal unchanged.

# Intrinsic Invariants

1. Every Proposal has exactly one originator reference and one subject reference.
2. A Proposal identity is never reassigned to a different offer.
3. `originator(p)` and `subject(p)` are stable for the lifetime of `p` within this concept.
4. `Offer` only creates new Proposal state; it never rewrites an existing Proposal.
5. Proposal has no intrinsic selected/declined/backup/withdrawn/current/archived status.
6. Proposal has no intrinsic edit, revision, evaluation, selection, withdrawal, scheduling, deliverable, classification, or publication action.
7. Proposal has no intrinsic deletion action. Later inability or unwillingness to participate must not erase the historical fact that the offer was established.

# Derived Observations

Proposal intentionally has very little derived state. The important observable fact is simply whether a durable offer exists and what originator/subject it refers to.

Application views may combine a Proposal with other concepts to answer questions such as whether it is currently participating, selected, revised, schedulable, or publishable. Those are not Proposal state.

# Synchronization Boundary

Proposal remains independent of neighboring concepts:

- change history belongs to [Revision](revision.md);
- organizer choice belongs to [Selection](selection.md);
- originator participation rescission belongs to [Withdrawal](withdrawal.md);
- time-bounded permission to invoke `Offer` may be composed with [Availability Window](availability-window.md).

A later synchronization may choose to initialize Revision history when a Proposal is offered, but Proposal does not require Revision in order to be complete.

# Formal Specification Decision

**Specified in 002-A.** The formal model deliberately rejects the current `Submission` aggregate as the concept boundary. Proposal is the durable offer/reference, not the mutable content history or the lifecycle of everything that later happens to the offer.