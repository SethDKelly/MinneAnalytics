---
type: Concept Design Concept
title: Schedule
description: Human-adjustable assignment of eligible activities to explicit place/time opportunities, independent from selection and generation heuristics.
tags: [concept-design, concept, schedule, placement, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-E
concept_id: CC-015
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-E-deliverable-and-scheduling-execution.md, title: 002-E Deliverable & Scheduling Execution }
---
# Purpose

Allocate eligible activities to constrained place/time opportunities while preserving explicit, inspectable, human-adjustable placement.

# Operational Principle

A planner creates a Schedule with a set of place/time opportunities. Eligible activities can be placed into those opportunities. A placed activity can later be moved, two activities can be swapped, or an activity can be unplaced. Automated logic may suggest a draft, but the Schedule's authoritative state is the explicit placement relation the planner can inspect and modify.

# Abstract State

Let `Schedule` be the set of schedule identities and `Opportunity` the set of schedulable opportunity identities.

For each `s ∈ Schedule`, Schedule records:

- `context(s): ContextRef` — the application context whose activities are being scheduled.

For each `o ∈ Opportunity`, Schedule records:

- `scheduleOf(o): Schedule`;
- `placeOf(o): PlaceRef`;
- `timeOf(o): TimeRef`.

Schedule owns the partial placement relation:

- `placedIn(s): ActivityRef ⇀ Opportunity`.

For any mapping `placedIn(s)(activity) = opportunity`, that Opportunity belongs to `s`.

`ContextRef`, `PlaceRef`, `TimeRef`, and `ActivityRef` are abstract. Schedule does not define Selection, participant identity, physical-room metadata, attendee demand, generation algorithms, or event lifecycle.

# Actions

## `Create(context) -> schedule`

**Intent:** establish an independently referable scheduling context.

**Requires:**

- a context reference is supplied.

**Effects:**

- creates a fresh Schedule identity `s`;
- records `context(s) = context`;
- creates no Opportunities or placements by itself.

## `AddOpportunity(schedule, place, time) -> opportunity`

**Intent:** establish one schedulable place/time opportunity.

**Requires:**

- `schedule ∈ Schedule`;
- place and time references are supplied.

Whether the opportunity corresponds to a room, stage, virtual channel, or another schedulable resource is application-specific.

**Effects:**

- creates a fresh Opportunity `o`;
- records `scheduleOf(o) = schedule`, `placeOf(o) = place`, and `timeOf(o) = time`;
- leaves all existing Opportunities and placements unchanged.

## `RemoveOpportunity(opportunity)`

**Intent:** remove an unused scheduling opportunity.

**Requires:**

- `opportunity ∈ Opportunity`;
- no activity is currently placed in that Opportunity.

**Effects:**

- removes the Opportunity from Schedule state;
- leaves all activities and other Opportunities unchanged.

Removing or changing an occupied opportunity requires explicit unplacement/movement first so Schedule does not silently discard a placement.

## `Place(schedule, activity, opportunity)`

**Intent:** assign an unplaced activity to an unoccupied Opportunity.

**Requires:**

- `schedule ∈ Schedule`;
- `scheduleOf(opportunity) = schedule`;
- `activity` is not currently in the domain of `placedIn(schedule)`;
- no other activity in `schedule` is currently mapped to `opportunity`.

Whether the activity is eligible because of Selection, Withdrawal, Deliverable state, attendee-demand policy, or other constraints is application composition.

**Effects:**

- sets `placedIn(schedule)(activity) = opportunity`;
- leaves every other placement unchanged.

## `Move(schedule, activity, opportunity)`

**Intent:** move a currently placed activity to an unoccupied Opportunity.

**Requires:**

- `activity` is currently placed in `schedule`;
- `scheduleOf(opportunity) = schedule`;
- `opportunity` is currently unoccupied.

**Effects:**

- changes only that activity's mapping to the new Opportunity.

## `Swap(schedule, activityA, activityB)`

**Intent:** exchange the Opportunities of two currently placed activities without losing either placement.

**Requires:**

- both activities are currently placed in `schedule`;
- the activities are distinct.

**Effects:**

- exchanges their current Opportunity mappings atomically;
- leaves every other placement unchanged.

## `Unplace(schedule, activity)`

**Intent:** remove an activity from the current Schedule without deleting the activity or its Opportunity.

**Requires:**

- `activity` is currently placed in `schedule`.

**Effects:**

- removes `activity` from the domain of `placedIn(schedule)`;
- leaves the formerly occupied Opportunity available for later placement.

# Intrinsic Invariants

1. Every Opportunity belongs to exactly one Schedule and keeps the same Schedule/place/time references while it exists.
2. Within one Schedule, an activity is placed in at most one Opportunity.
3. Within one Schedule, an Opportunity contains at most one activity.
4. Every placement refers to an Opportunity belonging to the same Schedule.
5. `Place`, `Move`, `Swap`, and `Unplace` preserve all unaffected placements.
6. Schedule does not own whether an ActivityRef is selected, withdrawn, ready, publishable, or otherwise eligible; those are application-composition inputs.
7. Schedule does not intrinsically require a particular number of rooms, sessions, rows, slot types, or fixed grid topology.
8. Schedule does not own a generation heuristic. Technical-level balancing, demand weighting, randomization, optimization, or externally generated assignments are replaceable strategies.
9. Generated suggestions are not authoritative Schedule state until translated into explicit placement actions accepted by application policy.
10. Schedule does not own [Capacity](capacity.md) allocations. A schedulable Opportunity is a place/time assignment unit, whereas Capacity represents scarce commitment units.
11. Schedule has no intrinsic immutable placement history in the current v0 specification. If reconstructing every move/swap later becomes a user-facing purpose, that history must be added explicitly rather than assumed.

# Derived Observations

For `s ∈ Schedule`:

- `placed(s) = domain(placedIn(s))`;
- `unoccupied(s) = { o | scheduleOf(o)=s and no activity maps to o }`;
- `opportunityOf(s, activity)` is defined exactly when the activity is placed;
- `occupantOf(o)` is defined exactly when some activity maps to `o`.

Collision-free occupancy follows from the intrinsic one-activity-per-Opportunity invariant; broader conflict and desirability assessments remain external inputs unless later requirements justify intrinsic constraint types.

# Synchronization Boundary

Schedule composes with neighboring concepts without absorbing their state:

- [Selection](selection.md) plus [Withdrawal](withdrawal.md) may determine whether an activity is currently eligible to remain placed;
- [Capacity](capacity.md) may constrain how many commitments can exist before or independently of place/time assignment;
- [Deliverable](deliverable.md) readiness may inform scheduling policy without becoming Schedule state;
- external attendee demand, travel constraints, room attributes, or other evidence can influence generation/placement policy;
- a generation service may propose assignments, but explicit Schedule placement remains the authoritative result.

The current implementation's `SchedulePlacement` rows combine empty place/time cells and occupied assignments in one persistence structure. That can remain an implementation choice later, but the conceptual model distinguishes Opportunities from the placement relation so an empty schedulable opportunity is not itself mistaken for an activity placement.

# Formal Specification Decision

**Specified in 002-E.** Schedule is an explicit human-adjustable placement relation over place/time Opportunities. It remains independent from Selection, Withdrawal, Capacity, Deliverable readiness, and any particular generation heuristic.