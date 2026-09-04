---
type: Concept Design Concept
title: Vocabulary
description: Lifecycle and stewardship of stable reusable descriptive terms, preserving identity and history as wording or availability changes.
tags: [concept-design, concept, vocabulary, taxonomy, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-D
concept_id: CC-013
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-D-vocabulary-and-classification.md, title: 002-D Vocabulary & Classification }
---
# Purpose

Maintain an evolving reusable set of descriptive terms that participants can contribute to and stewards can govern over time without erasing historical meaning.

# Operational Principle

A participant contributes a reusable term to a vocabulary. The term receives a stable identity and becomes available for reuse. A steward can later correct its wording without creating a different term, retire it from future use without deleting its identity or history, and restore it when appropriate. Earlier states remain inspectable so historical references continue to identify the same term even after its wording or availability changes.

# Abstract State

Let `Term` be the set of reusable term identities and `TermState` the set of immutable lifecycle-state records.

Vocabulary records:

- `vocabularyOf(t): VocabularyRef` for every `t ∈ Term` — the vocabulary/context to which the term belongs;
- `stateOf(s): Term` for every `s ∈ TermState`;
- `labelOf(s): Label` — the wording in effect at state `s`;
- `availabilityOf(s) ∈ {available, retired}`;
- `recordedBy(s): ActorRef`;
- `recordedAt(s): Instant`;
- `predecessor(s): TermState?` — absent only for the first state of a term;
- `current(t): TermState` for every `t ∈ Term`.

`VocabularyRef`, `Label`, and `ActorRef` are abstract. Vocabulary does not define event/conference ownership, display slugs, sort order, authentication, or application role semantics.

A term's current wording and availability are projections from `current(t)`; the stable `Term` identity is not its label.

# Actions

## `Contribute(vocabulary, label, actor, at) -> term`

**Intent:** add a reusable term while establishing stable identity and history.

**Requires:**

- a vocabulary reference, non-empty label, actor reference, and recording instant are supplied.

Whether this actor may contribute, whether moderation is required before the action is offered, or whether a semantically similar term should be reused instead is application policy.

**Effects:**

- creates a fresh `term ∉ Term`;
- creates a fresh initial state `s`;
- records `vocabularyOf(term) = vocabulary`;
- records `stateOf(s) = term`;
- records `labelOf(s) = label`;
- records `availabilityOf(s) = available`;
- records actor/time provenance;
- leaves `predecessor(s)` absent;
- sets `current(term) = s`.

## `Correct(term, newLabel, actor, at) -> state`

**Intent:** correct or rename a term without changing its identity or availability.

**Requires:**

- `term ∈ Term`;
- a non-empty new label and provenance are supplied.

**Effects:**

- lets `prior = current(term)`;
- appends a fresh `state` for the same term;
- records `labelOf(state) = newLabel`;
- preserves `availabilityOf(state) = availabilityOf(prior)`;
- records `predecessor(state) = prior` and actor/time provenance;
- sets `current(term) = state`;
- leaves all prior states unchanged.

## `Retire(term, actor, at) -> state`

**Intent:** remove a term from ordinary future reuse without erasing its identity or historical references.

**Requires:**

- `term ∈ Term`;
- `availabilityOf(current(term)) = available`.

**Effects:**

- appends a fresh state preserving the current label;
- records `availabilityOf(state) = retired`;
- records predecessor and actor/time provenance;
- sets `current(term) = state`;
- leaves prior states and external references to the Term unchanged.

## `Restore(term, actor, at) -> state`

**Intent:** make a retired term available for ordinary future reuse again.

**Requires:**

- `term ∈ Term`;
- `availabilityOf(current(term)) = retired`.

**Effects:**

- appends a fresh state preserving the current label;
- records `availabilityOf(state) = available`;
- records predecessor and actor/time provenance;
- sets `current(term) = state`;
- leaves prior states unchanged.

# Intrinsic Invariants

1. Every Term belongs to exactly one `VocabularyRef`, which is stable for that Term's lifetime.
2. Every Term has exactly one current TermState.
3. A Term's first state has no predecessor; each later state has exactly one predecessor belonging to the same Term.
4. Per Term, TermState history is a single acyclic linear chain ending at `current(term)`.
5. TermState records are immutable after creation.
6. A Term identity is never changed merely because its wording changes.
7. Retirement never deletes the Term, its prior states, or references held by other concepts.
8. A retired Term can be restored using the same Term identity.
9. Vocabulary does not require labels to be globally unique. Deduplication, synonym policy, normalization, and slug generation are application concerns unless later requirements establish their own semantics.
10. Vocabulary has no intrinsic `Theme`, `ADMIN`, `PRESENTER`, conference, Coverage Target, or subject-classification state.
11. Vocabulary has no hard-delete action for an established Term. Durable identity is required for historical interpretation.

# Derived Observations

For `t ∈ Term`:

- `label(t) = labelOf(current(t))`;
- `available(t)` iff `availabilityOf(current(t)) = available`;
- `retired(t)` iff `availabilityOf(current(t)) = retired`;
- the term's history is the predecessor chain ending at `current(t)`.

A retired term remains historically identifiable even though it is not ordinarily offered for new reuse.

# Synchronization Boundary

Vocabulary owns term lifecycle, not use of terms:

- [Classification](classification.md) owns subject↔Term associations;
- application composition may require `available(term)` before creating a new Classification association;
- retirement must not automatically delete existing Classification associations;
- [Coverage Target](coverage-target.md) may use a Term or another application-defined bucket as a representation coordinate without becoming Vocabulary state;
- contribution/stewardship authority, moderation workflow, submission-window eligibility, and event ownership remain application policy/composition.

Current implementation fields such as `source`, `slug`, `sortOrder`, `targetMin`, and `targetMax` do not define Vocabulary. In particular, target bounds belong to Coverage Target rather than the term lifecycle.

# Formal Specification Decision

**Specified in 002-D.** Vocabulary is a stable reusable-term lifecycle with append-only wording/availability history. Contribution and stewardship remain actions in one coherent concept, while Classification and representation planning remain separate.