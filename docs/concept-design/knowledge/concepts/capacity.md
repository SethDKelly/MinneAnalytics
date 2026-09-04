---
type: Concept Design Concept
title: Capacity
description: A finite pool with class-sensitive allocation and release of scarce commitment units.
tags: [concept-design, concept, capacity, scarcity, allocation, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-C
concept_id: CC-011
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-C-program-choice-participation-scarcity-and-representation-intent.md, title: 002-C Program Choice, Participation, Scarcity & Representation Intent }
---
# Purpose

Represent scarce commitment capacity and how commitments consume and release it.

# Operational Principle

An organizer establishes a finite Capacity pool. Commitment classes define how many units a commitment of that class consumes. When a commitment is allocated, Capacity reserves the applicable units if they are available. Releasing the commitment returns those units. The organizer can inspect committed units, remaining units, and whether the pool is saturated without Capacity deciding which candidate ought to receive those units.

# Abstract State

Let `Pool` be the set of capacity-pool identities, `CommitmentRef` identify commitments that may consume capacity, and `ClassRef` identify accounting classes.

For every `p ∈ Pool`, Capacity records:

- `limit(p): Quantity`, where `Quantity` is a non-negative discrete amount;
- a partial `rate(p, class): Quantity` for classes recognized by that pool, where every defined rate is positive.

Let `Allocation` be the set of allocation identities.

For every `a ∈ Allocation`, Capacity records:

- `poolOf(a): Pool`;
- `commitmentOf(a): CommitmentRef`;
- `classOf(a): ClassRef`;
- `unitsOf(a): Quantity` — the class rate applied when the allocation was created;
- `allocatedBy(a): ActorRef`;
- `allocatedAt(a): Instant`;
- `releasedBy(a): ActorRef?`;
- `releasedAt(a): Instant?`.

An Allocation is **active** exactly when `releasedAt(a)` is absent.

# Actions

## `DefinePool(limit) -> pool`

**Intent:** establish a finite scarce-capacity pool.

**Requires:** `limit >= 0`.

**Effects:** creates a fresh Pool with the supplied limit and no class rates or allocations.

## `SetClassRate(pool, class, units)`

**Intent:** establish or change the number of capacity units future commitments of a class consume.

**Requires:**

- `pool ∈ Pool`;
- `units > 0`.

**Effects:** sets `rate(pool, class) = units` for future allocations. Existing allocations retain their recorded `unitsOf` value.

## `Resize(pool, newLimit)`

**Intent:** change the finite size of an existing pool without invalidating commitments already allocated.

**Requires:**

- `pool ∈ Pool`;
- `newLimit >= committed(pool)`.

**Effects:** sets `limit(pool) = newLimit`.

## `Allocate(pool, commitment, class, actor, at) -> allocation`

**Intent:** consume capacity for a commitment.

**Requires:**

- `pool ∈ Pool`;
- `rate(pool, class)` is defined;
- no active Allocation already exists for the same `(pool, commitment)` pair;
- `rate(pool, class) <= remaining(pool)`.

Whether the commitment should be allocated, whether it corresponds to a selected candidate, and who is authorized to allocate are application policy/synchronization questions.

**Effects:**

- creates a fresh Allocation `a`;
- records the pool, commitment, class, actor, and instant;
- records `unitsOf(a) = rate(pool, class)` as the applied charge;
- leaves release provenance absent.

## `Release(allocation, actor, at)`

**Intent:** return capacity previously consumed by a commitment.

**Requires:**

- `allocation ∈ Allocation`;
- the allocation is active.

**Effects:** records `releasedBy(allocation) = actor` and `releasedAt(allocation) = at` exactly once.

# Intrinsic Invariants

1. Every Pool has a non-negative finite limit.
2. Every defined class rate is positive.
3. Every Allocation belongs to exactly one Pool and one commitment and records exactly one applied unit charge.
4. An Allocation's pool, commitment, class, applied units, and allocation provenance are immutable after creation.
5. Release provenance is absent initially and, once recorded, is immutable.
6. A `(pool, commitment)` pair has at most one active Allocation at a time.
7. `committed(pool) <= limit(pool)` always holds; Capacity does not silently over-allocate a finite pool.
8. Changing a class rate does not retroactively reprice existing allocations.
9. Releasing an Allocation returns its recorded `unitsOf` amount regardless of later class-rate changes.
10. Capacity does not select candidates, rank them, classify them, schedule them, or decide whether a Coverage Target should be met.
11. Sponsor/community or other domain labels are not intrinsic Capacity classes; they are application-provided `ClassRef` values when relevant.

# Derived Observations

For a Pool `p`:

- `committed(p)` is the sum of `unitsOf(a)` for active allocations in `p`;
- `remaining(p) = limit(p) - committed(p)`;
- `saturated(p)` iff `remaining(p) = 0`;
- active allocations identify which commitments currently consume the pool.

These values are projections of authoritative Pool/Allocation state and should not be duplicated as independent mutable state.

# Synchronization Boundary

Capacity composes with but does not absorb:

- [Selection](selection.md), which may trigger an allocation or be constrained by allocation success;
- [Withdrawal](withdrawal.md), which may trigger release of an allocation;
- [Schedule](schedule.md), whose place/time opportunities may inform how a pool limit is established but whose placements are independent state;
- application accounting policy, which decides which domain commitments map to which `ClassRef` values.

A failed `Allocate` means the pool lacks sufficient capacity; how MinneAnalytics presents or resolves that failure belongs to application composition.

# Formal Specification Decision

**Specified in 002-C.** Capacity is a hard finite-allocation concept with explicit pool, class-rate, allocation, and release state. Current configuration/count snapshot calculations are a possible implementation input/view, not the conceptual source of truth.