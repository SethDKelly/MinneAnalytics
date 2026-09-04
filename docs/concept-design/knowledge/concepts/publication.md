---
type: Concept Design Concept
title: Publication
description: Intentional, reversible public exposure of an exact material reference with durable exposure history, distinct from readiness and internal archive closure.
tags: [concept-design, concept, publication, public-access, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-F
concept_id: CC-016
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-F-publication-dispatch-and-historical-closure.md, title: 002-F Publication, Dispatch & Historical Closure }
---
# Purpose

Intentionally expose an exact material reference to a public audience while preserving the distinction between current public availability and the historical fact that exposure occurred.

# Operational Principle

A publisher has material that may be made public. They publish that exact material into a public context, making it currently available to the public audience. The publisher can later unpublish it without deleting the material or pretending it was never exposed, and may republish the same material later. Replacing or revising the underlying source does not silently change which material this Publication refers to.

# Abstract State

Let `Publication` be the set of publication identities and `PublicationState` the set of immutable public-availability state records.

For each `p ∈ Publication`, Publication records:

- `material(p): MaterialRef` — the exact material state intentionally exposed;
- `surface(p): PublicSurfaceRef` — the public context/surface in which it is exposed.

For each `s ∈ PublicationState`, Publication records:

- `publicationOf(s): Publication`;
- `availabilityOf(s) ∈ {published, unpublished}`;
- `recordedBy(s): ActorRef`;
- `recordedAt(s): Instant`;
- `predecessor(s): PublicationState?` — absent only for the initial state.

For every `p ∈ Publication`, `current(p): PublicationState` identifies its latest state.

`MaterialRef`, `PublicSurfaceRef`, and `ActorRef` are abstract references. Publication does not define the internal contents of the material, the storage/download mechanism, the public website, Selection, Deliverable readiness, or application authority.

`MaterialRef` is expected to identify the exact material state intended for exposure. If an application wants a dynamically changing collection, it must make that mutability explicit rather than silently treating a mutable source pointer as the published material identity.

# Actions

## `Publish(material, surface, actor, at) -> publication`

**Intent:** intentionally establish public exposure of exact material.

**Requires:**

- material, public-surface, actor, and recording-instant references are supplied.

Whether the material is eligible, ready, selected, shareable, legally publishable, or authorized for exposure is application composition/policy rather than an intrinsic Publication precondition.

**Effects:**

- creates a fresh Publication identity `p`;
- records `material(p) = material` and `surface(p) = surface`;
- creates an initial PublicationState `s` with `availabilityOf(s) = published`;
- records actor/time provenance;
- leaves `predecessor(s)` absent;
- sets `current(p) = s`.

## `Unpublish(publication, actor, at) -> state`

**Intent:** end current public availability without deleting the underlying material or prior exposure history.

**Requires:**

- `publication ∈ Publication`;
- `availabilityOf(current(publication)) = published`;
- actor and recording instant are supplied.

**Effects:**

- appends a fresh state `s` for the same Publication;
- records `availabilityOf(s) = unpublished`;
- records predecessor and actor/time provenance;
- sets `current(publication) = s`;
- leaves all earlier states and the material reference unchanged.

## `Republish(publication, actor, at) -> state`

**Intent:** restore public availability of the same exact material in the same public surface.

**Requires:**

- `publication ∈ Publication`;
- `availabilityOf(current(publication)) = unpublished`;
- actor and recording instant are supplied.

Eligibility may be rechecked by application policy before invocation.

**Effects:**

- appends a fresh state `s` with `availabilityOf(s) = published`;
- records predecessor and actor/time provenance;
- sets `current(publication) = s`;
- leaves the Publication's material/surface and earlier history unchanged.

Publishing a replacement material state is represented by a new Publication identity rather than mutating `material(p)`.

# Intrinsic Invariants

1. Every Publication refers to exactly one `MaterialRef` and one `PublicSurfaceRef`; both are stable for the Publication's lifetime.
2. Every Publication has exactly one current PublicationState.
3. PublicationState history is a single acyclic linear chain ending at `current(p)`.
4. PublicationState records are immutable after creation.
5. `Publish` begins in `published`; `Unpublish` and `Republish` alternate current availability explicitly.
6. Unpublishing does not delete the Publication, its material, or the fact that earlier public exposure occurred.
7. Replacing or revising source material does not mutate an existing Publication's `MaterialRef`.
8. Publication does not intrinsically establish material readiness, share consent, organizer Selection, internal retention, or storage accessibility.
9. Publication has no intrinsic file type, route, URL, object-storage, web-page, collection-layout, or CDN semantics.
10. Publication is public-audience exposure, not staged participant-specific disclosure; [Controlled Disclosure](controlled-disclosure.md) remains the concept for intentionally staged information visibility to particular participants/contexts.

# Derived Observations

For `p ∈ Publication`:

- `published(p)` iff `availabilityOf(current(p)) = published`;
- `unpublished(p)` iff `availabilityOf(current(p)) = unpublished`;
- `wasEverPublished(p)` is always true after `Publish` and remains true after later `Unpublish`;
- the exposure history is the predecessor chain ending at `current(p)`.

Current public listings may be derived from all `p` for which `published(p)` is true and whose application-level eligibility remains satisfied.

# Synchronization Boundary

Publication composes with neighboring concepts without absorbing their state:

- [Deliverable](deliverable.md) readiness may be required before `Publish`, but readiness remains Deliverable state;
- [Selection](selection.md), [Withdrawal](withdrawal.md), sharing intent, rights, and other policy may contribute to publication eligibility;
- publishing a current Deliverable should reference the exact ready ArtifactVersion or another exact material representation rather than a mutable "latest" pointer;
- [Archive](archive.md) is internal retained closure and is independent from whether material is currently public;
- application policy may unpublish material when eligibility changes without rewriting the underlying concept histories.

The current deck archive is one Publication realization. Its current public resolver dynamically checks conference publication, selection, deck readiness, shareability, and file existence. Later reconciliation should preserve those eligibility checks while avoiding ambiguous publication of mutable "latest file" state.

# Formal Specification Decision

**Specified in 002-F.** Publication is intentional, reversible public exposure of an exact material reference with durable exposure history. It remains separate from Deliverable readiness, Selection, sharing policy, storage delivery, and Archive closure.