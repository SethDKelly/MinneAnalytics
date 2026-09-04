---
type: Concept Design Concept
title: Revision
description: Append-only linear change history for a referable mutable subject, preserving prior forms while identifying the current form.
tags: [concept-design, concept, revision, history, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-A
concept_id: CC-002
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-A-offer-change-and-temporal-availability.md, title: 002-A Offer, Change & Temporal Availability }
---
# Purpose

Change a subject while preserving prior forms and the sequence of change.

# Operational Principle

A mutable subject begins with an initial recorded form. When an editor changes it, Revision appends a new immutable revision after the current revision and makes the new revision current. Earlier revisions remain inspectable in sequence, so changing the current form never destroys the history of what existed before.

# Abstract State

Let `SubjectRef` identify a referable mutable subject and let `Revision` be the set of immutable revision identities.

Revision records:

- `tracked ⊆ SubjectRef` — subjects for which revision history has been established;
- `subjectOf(r): SubjectRef` for every `r ∈ Revision`;
- `formOf(r): Form` — the form captured by revision `r`;
- `recordedBy(r): ActorRef` — the actor associated with recording the revision;
- `recordedAt(r): Instant` — when the revision was recorded;
- `predecessor(r): Revision?` — absent only for the initial revision of a subject;
- `current(s): Revision` for every `s ∈ tracked`.

`Form` is intentionally abstract. Revision does not know whether the form is text, structured fields, metadata, or another content representation.

# Actions

## `Initialize(subject, initialForm, actor, at) -> revision`

**Intent:** establish revision history for a subject that does not yet have one.

**Requires:**

- `subject ∉ tracked`;
- the subject, initial form, actor reference, and recording instant are supplied.

Authorization and application eligibility are outside Revision.

**Effects:**

- creates a fresh revision `r`;
- adds `subject` to `tracked`;
- records `subjectOf(r) = subject`;
- records `formOf(r) = initialForm`;
- records `recordedBy(r) = actor` and `recordedAt(r) = at`;
- leaves `predecessor(r)` absent;
- sets `current(subject) = r`.

## `Revise(subject, newForm, actor, at) -> revision`

**Intent:** append a new current form without overwriting history.

**Requires:**

- `subject ∈ tracked`;
- the new form, actor reference, and recording instant are supplied.

Whether the change is permitted now, why it is permitted, or whether downstream actors must react to it is application policy/composition.

**Effects:**

- lets `prior = current(subject)`;
- creates a fresh revision `r`;
- records `subjectOf(r) = subject`;
- records `formOf(r) = newForm`;
- records `recordedBy(r) = actor` and `recordedAt(r) = at`;
- records `predecessor(r) = prior`;
- sets `current(subject) = r`;
- leaves every prior revision unchanged.

# Intrinsic Invariants

1. Every tracked subject has exactly one current revision.
2. Every revision belongs to exactly one subject and records exactly one form.
3. An initial revision has no predecessor; every non-initial revision has exactly one predecessor.
4. A revision's predecessor, when present, belongs to the same subject.
5. Per subject, revision history is a single linear chain: a revision has at most one direct successor, and `Revise` always extends the current revision.
6. The predecessor relation is acyclic.
7. `current(s)` is the terminal revision in the chain for `s`.
8. Revision records are immutable after creation, including form, subject, actor/time provenance, and predecessor.
9. Creating a later revision never deletes or rewrites an earlier revision.
10. Revision does not require forms to differ. Whether a save with no meaningful change should create a revision is application policy.
11. Revision has no intrinsic branch, merge, rollback, approval, acknowledgement, evaluation-currentness, or deletion semantics.

# Derived Observations

For a tracked subject `s`:

- `isCurrent(r)` is true exactly when `current(subjectOf(r)) = r`;
- the subject's revision history is the predecessor chain ending at `current(s)`;
- sequence position can be derived from that chain and need not be stored as authoritative state.

A prior revision remains historically valid even after it is no longer current.

# Synchronization Boundary

Revision intentionally excludes the reasons and consequences of change:

- an [Availability Window](availability-window.md) may contribute to whether `Initialize` or `Revise` is currently invokable;
- application authority policy decides who may invoke those actions;
- a [Proposal](proposal.md) or another concept may provide the referable subject being versioned;
- whether a prior [Evaluation](evaluation.md) remains applicable to the current subject is a later synchronization/application-policy question;
- acknowledgement or workflow-clearing behavior is not part of Revision.

A future requirement for true branching/merging would be new evidence requiring explicit reconsideration of this linear-history specification rather than a silent extension.

# Formal Specification Decision

**Specified in 002-A.** Revision is an append-only, linear change-history concept. It owns the history and the current pointer, but not edit permission, evaluation freshness, or conference-specific workflow status.