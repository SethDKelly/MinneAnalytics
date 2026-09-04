---
type: Concept Design Concept
title: Feedback
description: Immutable recipient-directed response about an exact referable subject, preserving source, recipient, content, and communication provenance without becoming evaluation or operational dispatch.
tags: [concept-design, concept, feedback, directed-response, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-B
concept_id: CC-005
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: intent, resource: ../../evidence/001-B-intent-ledger.md, title: 001-B Historical Intent Ledger }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-B-evaluation-disclosure-and-directed-response.md, title: 002-B Evaluation, Disclosure & Directed Response }
---
# Purpose

Deliver recipient-directed response about a subject, distinct from private judgment context.

# Operational Principle

A source has a response about a referable subject that is intended for a particular recipient rather than for the source's private notes. They provide Feedback that preserves who sent it, who it was addressed to, what exact subject it concerned, what was communicated, and when. The recipient can later inspect that response as a durable directed communication without treating it as an Evaluation or assuming that receiving it requires a subsequent Revision.

# Abstract State

Let `Feedback` be the set of feedback identities.

For each `f ∈ Feedback`, Feedback records:

- `source(f): ActorRef` — the actor who provided the response;
- `recipient(f): RecipientRef` — the intended recipient or audience reference;
- `subject(f): SubjectRef` — the exact referable subject the response is about;
- `content(f): FeedbackContent` — the response communicated to the recipient;
- `recordedAt(f): Instant` — when the Feedback was recorded/provided.

`RecipientRef`, `SubjectRef`, and `FeedbackContent` are abstract. When Feedback is specifically about one mutable-content revision, a [Revision](revision.md) identity can be supplied as `subject(f)` so the historical context remains explicit.

# Actions

## `Provide(source, recipient, subject, content, at) -> feedback`

**Intent:** create a durable response deliberately addressed to a recipient about a subject.

**Requires:**

- source, recipient, and subject references are supplied;
- response content is supplied.

Application authority, moderation, notification policy, and whether the recipient is currently eligible to receive Feedback are outside this concept.

**Effects:**

- creates a fresh Feedback identity `f`;
- records the supplied source, recipient, subject, content, and `recordedAt(f) = at`;
- leaves all existing Feedback records unchanged.

# Intrinsic Invariants

1. Every Feedback item has exactly one source reference, recipient reference, subject reference, content value, and recording instant.
2. Source, recipient, subject, content, and recording provenance are immutable after `Provide`.
3. Feedback is deliberately recipient-directed; it is not the source's private evaluation context.
4. Feedback does not create, change, or imply an [Evaluation](evaluation.md).
5. Feedback does not require or automatically create a [Revision](revision.md).
6. Feedback does not own acknowledgement, resolution, completion, `pending`, `revised`, or workflow-clearing status.
7. Feedback does not own notification/email delivery, batching, retry, recipient-resolution, or duplicate-send semantics; those belong to [Dispatch](dispatch.md) or application composition.
8. Multiple Feedback items may concern the same subject and recipient; later Feedback does not silently overwrite what was previously communicated.
9. Feedback has no intrinsic edit/delete/redact action under the current evidence. Corrections or additional guidance are represented by additional Feedback unless later requirements establish a focused redaction/correction lifecycle.

# Derived Observations

Feedback intentionally has minimal derived state. Useful projections may group Feedback by recipient, subject, source, or recording time, but those views do not create new authoritative lifecycle state.

Whether Feedback remains `unread`, has been acted upon, or is associated with a later change is application/composition behavior unless separately modeled.

# Synchronization Boundary

Feedback composes with neighboring concepts while remaining independent:

- evaluator-facing private notes stay inside [Evaluation](evaluation.md) and are never Feedback merely because both contain prose;
- Feedback about a particular mutable form may use that [Revision](revision.md) identity as its exact subject;
- an application may permit or encourage a later Revision after Feedback, but Feedback itself does not require one;
- a [Dispatch](dispatch.md) may notify the recipient that Feedback exists, but the Feedback record is not the send operation or delivery history;
- current implementation workflow states such as `FEEDBACK_PENDING` are composed application behavior, not Feedback state.

# Formal Specification Decision

**Specified in 002-B.** Feedback is an immutable directed-response record with exact subject attribution. It deliberately excludes private Evaluation context, revision obligation, workflow status, and transport/delivery behavior.