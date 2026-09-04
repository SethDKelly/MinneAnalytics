---
type: Concept Design Concept
title: Classification
description: Current associations between referable subjects and stable reusable Terms, independent from term governance and representation planning.
tags: [concept-design, concept, classification, taxonomy, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-D
concept_id: CC-012
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-D-vocabulary-and-classification.md, title: 002-D Vocabulary & Classification }
---
# Purpose

Associate referable subjects with shared reusable descriptive terms without making Classification responsible for term lifecycle, vocabulary governance, or collection-level representation goals.

# Operational Principle

A participant classifies a subject by associating it with one or more reusable Terms. Others can inspect the subject's current Terms or find subjects sharing a Term. The association can later be added or removed without renaming or deleting the Term itself. If a Term is later retired from future reuse, existing associations can remain intelligible because they still reference the same stable Term identity.

# Abstract State

Let `SubjectRef` identify referable subjects supplied by the application, and let `TermRef` identify reusable descriptive terms.

Classification owns one authoritative relation:

- `classified ⊆ SubjectRef × TermRef`.

A pair `(subject, term) ∈ classified` means the subject is currently associated with that term.

`SubjectRef` and `TermRef` are opaque references. Classification does not inspect mutable subject internals and does not own term wording, availability, provenance, or lifecycle.

# Actions

## `Classify(subject, term)`

**Intent:** establish a current descriptive association.

**Requires:**

- subject and term references are supplied;
- `(subject, term) ∉ classified`.

Whether the term is currently available for new use, whether the actor may classify this subject, and whether application-specific cardinality limits apply are composition/policy concerns.

**Effects:**

- adds `(subject, term)` to `classified`;
- leaves all other associations unchanged.

## `Unclassify(subject, term)`

**Intent:** remove a current descriptive association without modifying the subject or Term.

**Requires:**

- `(subject, term) ∈ classified`.

**Effects:**

- removes `(subject, term)` from `classified`;
- leaves the Term and all other Classification associations unchanged.

Changing a subject from one Term to another is the composition of `Unclassify(subject, oldTerm)` and `Classify(subject, newTerm)`; it does not require a separate intrinsic action.

# Intrinsic Invariants

1. Classification state is set-like: a subject/term pair is either currently associated or not; duplicate associations do not exist.
2. Classification never changes the identity, wording, availability, or history of a Term.
3. Classification never changes the internal content or lifecycle of the classified subject.
4. Retirement or correction of a Term is not an intrinsic Classification mutation.
5. Classification does not own Coverage Target bounds, observed composition counts, gap/excess assessments, or organizer Selection.
6. Classification has no intrinsic theme-count limit, conference scope, technical-level semantics, or implementation join-table behavior.
7. Classification does not require a hard cascade when a Term is retired. Stable term identity permits an existing association to remain interpretable.
8. Classification does not intrinsically preserve every prior association after `Unclassify`. When historical classification must be preserved, the application should classify an immutable/version-specific `SubjectRef` or introduce an explicitly justified history requirement rather than silently expanding this concept.

# Derived Observations

For a subject `s`:

- `terms(s) = { t | (s,t) ∈ classified }`.

For a term `t`:

- `subjects(t) = { s | (s,t) ∈ classified }`.

Counts, filters, groupings, and collection-level composition can be derived from this relation but are not additional authoritative Classification state.

# Synchronization Boundary

Classification composes with neighboring concepts without absorbing them:

- [Vocabulary](vocabulary.md) supplies stable Term identities and may expose whether a Term is currently available;
- application policy may require `Vocabulary.available(term)` before `Classify`, while existing associations remain intact after retirement;
- [Coverage Target](coverage-target.md) can compare externally derived composition over Classification plus [Selection](selection.md) against desired representation bounds;
- when classification is version-sensitive, an application may use an exact [Revision](revision.md) identity as the `SubjectRef`, allowing historical revisions to retain their own term associations without making Classification own Revision history;
- when classification is intended to follow a durable offered identity across revisions, an application may instead classify a [Proposal](proposal.md) or another stable subject reference.

Choosing which subject identity MinneAnalytics classifies is therefore an application-composition decision that should be made during synchronization design, not embedded into Classification itself.

# Implementation Compatibility Note

The current `SubmissionTheme` join resembles the present-state relation, but current revision snapshots also include theme IDs. That combination is evidence that MinneAnalytics may need version-sensitive Classification composition. It does not justify merging Classification back into Revision or Vocabulary.

# Formal Specification Decision

**Specified in 002-D.** Classification is the current subject↔Term association relation. It remains independent from term governance, historical term identity, Coverage Target planning, Selection, and Revision history.