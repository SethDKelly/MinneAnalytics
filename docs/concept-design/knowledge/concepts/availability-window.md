---
type: Concept Design Concept
title: Availability Window
description: A named governed opportunity with an explicit interval whose upcoming, open, and closed states are derived from time.
tags: [concept-design, concept, availability, time, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-A
concept_id: CC-008
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-A-offer-change-and-temporal-availability.md, title: 002-A Offer, Change & Temporal Availability }
---
# Purpose

Establish a visible time-bounded opportunity during which a governed activity is ordinarily available.

# Operational Principle

An organizer defines a named opportunity by declaring when it opens and when it closes. Participants can tell whether that opportunity is upcoming, open, or closed from the declared interval and the current time. The organizer can reschedule the interval when application policy permits, while the window remains a distinct referable object rather than a hidden pair of timestamps embedded in the governed action.

# Abstract State

Let `Window` be the set of availability-window identities.

For each `w ∈ Window`, Availability Window records:

- `opportunity(w): OpportunityRef` — the governed opportunity the window describes;
- `opensAt(w): Instant` — the inclusive opening boundary;
- `closesAt(w): Instant` — the exclusive closing boundary.

`OpportunityRef` is opaque. Availability Window does not know the internal behavior of the action or concept whose ordinary availability is being governed.

The conceptual interval is half-open: `[opensAt(w), closesAt(w))`.

# Actions

## `Define(opportunity, opensAt, closesAt) -> window`

**Intent:** establish a visible governed opportunity interval.

**Requires:**

- an opportunity reference is supplied;
- `opensAt < closesAt`.

**Effects:**

- creates a fresh Window identity `w`;
- records `opportunity(w) = opportunity`;
- records the supplied opening and closing boundaries;
- leaves all existing windows unchanged.

## `Reschedule(window, opensAt, closesAt)`

**Intent:** change the currently declared interval for an existing opportunity without changing the Window's identity.

**Requires:**

- `window ∈ Window`;
- `opensAt < closesAt`.

Whether the actor may reschedule, whether rescheduling is still allowed after opening/closing, and whether a notice or audit record is required are application policy/composition.

**Effects:**

- replaces `opensAt(window)` and `closesAt(window)` with the supplied valid interval;
- leaves `opportunity(window)` unchanged.

# Intrinsic Invariants

1. Every Window refers to exactly one opportunity.
2. `opportunity(w)` is stable for the lifetime of `w`.
3. Every Window has a non-empty interval: `opensAt(w) < closesAt(w)`.
4. Availability phase is derived from the interval and observation time; it is not separately authoritative stored state.
5. Passage of time does not mutate Window state.
6. Availability Window does not own the governed action or determine whether an actor is authorized to perform it.
7. Availability Window has no intrinsic conference/event lifecycle, archive, pause, suspension, override, calendar, recurrence, or timezone-management semantics.
8. `Reschedule` changes the currently declared interval but does not itself create a version history of prior interval values. If preserving interval-change history becomes a user-facing requirement, that must be modeled explicitly rather than inferred from this concept.

# Derived Observations

For a Window `w` observed at time `now`:

- `upcoming(w, now)` iff `now < opensAt(w)`;
- `open(w, now)` iff `opensAt(w) <= now < closesAt(w)`;
- `closed(w, now)` iff `now >= closesAt(w)`.

Exactly one of these phases holds at a given observation time.

Display timezone is presentation context for the same instants, not Availability Window state.

# Synchronization Boundary

Availability Window can govern ordinary availability without absorbing neighboring concepts:

- invoking [Proposal](proposal.md) `Offer` may require a relevant window to be open;
- invoking [Revision](revision.md) `Initialize` or `Revise` may require a relevant window to be open or an application-defined exception;
- authorization, event lifecycle, explicit override, and exceptional reopen/lock policy remain application composition until separately justified.

The current implementation's manual `submissionsOpen` flag is therefore not promoted into this concept merely because it participates in present-day submission-window logic.

# Provisional Gate Resolution

**Resolved and specified in 002-A.** Availability Window survives its Phase 001 provisional condition because the formal model is a user-recognizable governed opportunity with its own identity, interval-establishment/rescheduling actions, precise derived lifecycle, and stable boundary from the governed action. It is intentionally narrower than general calendar or scheduling infrastructure.