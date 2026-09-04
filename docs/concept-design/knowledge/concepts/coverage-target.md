---
type: Concept Design Concept
title: Coverage Target
description: Desired representation bounds for a collection dimension, without owning observed composition or selection decisions.
tags: [concept-design, concept, coverage, planning, representation, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-C
concept_id: CC-010
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-C-program-choice-participation-scarcity-and-representation-intent.md, title: 002-C Program Choice, Participation, Scarcity & Representation Intent }
---
# Purpose

Express desired representation along a relevant collection dimension without owning actual collection composition.

# Operational Principle

An organizer wants a collection to contain a desired amount of a particular kind of item. They establish a Coverage Target for a dimension/bucket and a chosen measure, such as a minimum count, maximum proportion, or acceptable range. The target can later be adjusted or removed as planning intent changes. It states what representation is desired; actual representation is measured elsewhere and compared with the target.

# Abstract State

Let `CollectionRef` identify the collection being planned, `DimensionRef` identify a representation dimension, `BucketRef` identify one value/bucket within that dimension, and `MeasureRef` identify how representation is measured (for example count or proportion).

Let `Target` be the set of current Coverage Target identities.

For every `t ∈ Target`, Coverage Target records:

- `collectionOf(t): CollectionRef`;
- `dimensionOf(t): DimensionRef`;
- `bucketOf(t): BucketRef`;
- `measureOf(t): MeasureRef`;
- `lowerBound(t): Scalar?`;
- `upperBound(t): Scalar?`;
- `recordedBy(t): ActorRef`;
- `recordedAt(t): Instant`.

At least one bound must be present. `Scalar` values are non-negative and comparable within the supplied MeasureRef.

Coverage Target does not define how an observed measure is computed. The measure reference is an opaque contract with application composition or a later reusable measurement design.

# Actions

## `Establish(collection, dimension, bucket, measure, lower?, upper?, actor, at) -> target`

**Intent:** create current planning intent for desired representation.

**Requires:**

- the collection, dimension, bucket, measure, actor, and instant are supplied;
- at least one of `lower` or `upper` is present;
- every supplied bound is non-negative;
- if both are supplied, `lower <= upper`;
- no current Target already exists for the same `(collection, dimension, bucket, measure)` tuple.

**Effects:** creates a fresh Target and records the supplied tuple, bounds, and provenance.

## `Adjust(target, lower?, upper?, actor, at)`

**Intent:** change current representation intent without changing what collection/dimension/bucket/measure the Target refers to.

**Requires:**

- `target ∈ Target`;
- at least one bound is present;
- every supplied bound is non-negative;
- if both are supplied, `lower <= upper`.

**Effects:** replaces the Target's bounds and latest recording provenance; its collection/dimension/bucket/measure identity remains unchanged.

## `Remove(target)`

**Intent:** state that this representation target is no longer current planning intent.

**Requires:** `target ∈ Target`.

**Effects:** removes the Target from the current target set.

Coverage Target does not intrinsically preserve an adjustment/removal audit history. If historical target evolution becomes independently user-relevant, that requirement should be modeled explicitly rather than inferred.

# Intrinsic Invariants

1. Every Target identifies exactly one collection, dimension, bucket, and measure.
2. Every Target has at least one bound.
3. Bounds are non-negative and, when both exist, `lowerBound <= upperBound`.
4. There is at most one current Target for a `(collection, dimension, bucket, measure)` tuple.
5. Adjusting a Target cannot silently retarget it to another collection, dimension, bucket, or measure.
6. Coverage Target stores desired representation only; it has no authoritative observed-count, observed-proportion, gap, excess, warning, heatmap, or selection state.
7. A Target never intrinsically selects, rejects, reserves, or ranks a candidate.
8. Crossing a bound does not intrinsically prohibit an organizer action. Whether a bound is advisory, warning-producing, or policy-enforced is application composition.
9. Classification terms, technical levels, or other current domain dimensions are supplied references rather than built-in Coverage Target taxonomy.

# Derived Observations

Given a Target `t` and an externally supplied observed value `x` measured according to `measureOf(t)`:

- `belowTarget(t, x)` iff a lower bound exists and `x < lowerBound(t)`;
- `aboveTarget(t, x)` iff an upper bound exists and `x > upperBound(t)`;
- `withinTarget(t, x)` iff neither condition holds;
- `atUpperBound(t, x)` iff an upper bound exists and `x = upperBound(t)`.

The observed value itself is not Coverage Target state.

# Synchronization Boundary

Coverage Target composes with other concepts without reaching into their state:

- [Selection](selection.md) supplies organizer decisions from which application composition may determine which candidates belong to a current collection;
- [Classification](classification.md) or other attributes may supply the relevant dimension/bucket membership;
- application logic computes an observed measure from those sources and compares it with this Target;
- warnings or confirmation prompts may be produced from that comparison but do not become Target state;
- [Capacity](capacity.md) remains a hard scarce-allocation concern rather than desired representation intent.

# Provisional Gate Resolution

**Resolved and specified in 002-C.** Coverage Target survives its Phase 001 provisional condition because its formal state contains only durable planning intent—dimension/bucket/measure and desired bounds. Actual composition, gaps, excesses, warnings, and visualizations remain derived application projections, so the concept does not duplicate Selection or Classification truth.