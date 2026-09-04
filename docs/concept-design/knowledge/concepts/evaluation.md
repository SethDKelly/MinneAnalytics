---
type: Concept Design Concept
title: Evaluation
description: Evaluator-attributed judgment about an exact referable subject state, with optional private context and concept-local revision of that judgment.
tags: [concept-design, concept, evaluation, judgment, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-B
concept_id: CC-003
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: intent, resource: ../../evidence/001-B-intent-ledger.md, title: 001-B Historical Intent Ledger }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-B-evaluation-disclosure-and-directed-response.md, title: 002-B Evaluation, Disclosure & Directed Response }
---
# Purpose

Record an independently formed judgment about a subject.

# Operational Principle

An evaluator considers an exact referable subject and records their own judgment, optionally with private context. The Evaluation remains attributable to that evaluator and that subject. The evaluator may revise their judgment about the same subject without another actor's collective decision manufacturing or replacing it. If the underlying mutable content later has a different referable revision, an Evaluation of the earlier revision remains a valid historical judgment about what was actually seen.

# Abstract State

Let `Evaluation` be the set of evaluation identities.

For each `e ∈ Evaluation`, Evaluation records:

- `evaluator(e): ActorRef` — the actor whose judgment the Evaluation represents;
- `subject(e): SubjectRef` — the exact referable subject state that was judged;
- `judgment(e): Judgment` — an opaque judgment value or structured judgment;
- `privateContext(e): PrivateContext?` — optional evaluator-facing context associated with the judgment;
- `recordedAt(e): Instant` — when the Evaluation was first recorded;
- `lastChangedAt(e): Instant` — when its current judgment/context was last changed.

`Judgment` is intentionally abstract. Evaluation does not prescribe a numeric scale, rubric dimensions, ranking semantics, or aggregate representation.

`SubjectRef` should identify the exact state that was evaluated whenever historical applicability matters. For mutable offered content, a [Revision](revision.md) identity can therefore be the Evaluation subject rather than a mutable Proposal whose contents later change.

# Actions

## `Record(evaluator, subject, judgment, privateContext?, at) -> evaluation`

**Intent:** record an evaluator's independently formed judgment about an exact subject.

**Requires:**

- evaluator and subject references are supplied;
- a judgment is supplied.

Application authority, assignment, queue eligibility, disclosure policy, and whether the evaluator has inspected required material are outside Evaluation.

**Effects:**

- creates a fresh Evaluation identity `e`;
- records `evaluator(e) = evaluator`;
- records `subject(e) = subject`;
- records the supplied judgment and optional private context;
- sets `recordedAt(e) = at` and `lastChangedAt(e) = at`;
- leaves all existing Evaluations unchanged.

## `Revise(evaluation, evaluator, judgment, privateContext?, at)`

**Intent:** let the evaluator change their own judgment/context about the same exact subject.

**Requires:**

- `evaluation ∈ Evaluation`;
- `evaluator = evaluator(evaluation)`;
- a judgment is supplied;
- `at >= recordedAt(evaluation)`.

The equality requirement is semantic attribution, not an authentication mechanism: a judgment attributed to one evaluator cannot be rewritten as another actor's judgment through this action.

**Effects:**

- replaces `judgment(evaluation)` and `privateContext(evaluation)` with the supplied values;
- sets `lastChangedAt(evaluation) = at`;
- leaves `evaluator(evaluation)`, `subject(evaluation)`, and `recordedAt(evaluation)` unchanged.

# Intrinsic Invariants

1. Every Evaluation has exactly one evaluator and one exact subject reference.
2. Evaluator and subject attribution are stable for the lifetime of an Evaluation identity.
3. Only the attributed evaluator can semantically revise that Evaluation through `Revise`.
4. `lastChangedAt(e) >= recordedAt(e)`.
5. Evaluation does not prescribe a particular judgment representation; the current numeric `Score` scale is one application realization.
6. Private evaluation context is not recipient-directed [Feedback](feedback.md) and does not become Feedback automatically.
7. Evaluation owns neither collective organizer choice nor aggregation/ranking policy.
8. Evaluation owns neither staged information exposure nor access-control policy; those concerns may compose with [Controlled Disclosure](controlled-disclosure.md).
9. Evaluation does not decide whether a judgment about an older subject revision is applicable to a newer current revision.
10. Evaluation has no intrinsic `current`, `stale`, `needs rescore`, selected/declined, or workflow status.
11. `Revise` changes the current judgment/context of the same Evaluation identity but does not intrinsically preserve every prior edit to those fields. If evaluator-edit history becomes a separately required user-facing behavior, it must be modeled explicitly rather than inferred from general audit logging.

# Derived Observations

- `changed(e)` may be observed when `lastChangedAt(e) > recordedAt(e)`.
- A historical Evaluation remains truthful about the exact `subject(e)` even when that subject is no longer the current [Revision](revision.md).

Whether an Evaluation participates in a current aggregate is deliberately **not** derived by Evaluation alone. MinneAnalytics can later compare the Evaluation's exact subject reference with the currently applicable subject/revision and apply aggregation policy.

# Synchronization Boundary

Evaluation remains independent of neighboring concepts:

- a [Revision](revision.md) may supply the exact immutable subject reference being judged;
- a successful Evaluation `Record` or `Revise` may later satisfy an application condition that reveals separately staged information through [Controlled Disclosure](controlled-disclosure.md);
- evaluator-facing private context remains separate from [Feedback](feedback.md);
- [Selection](selection.md) may consume Evaluation-derived decision support but must not manufacture or rewrite evaluator judgments.

Current-version score queues, aggregate visibility, ranking, and rescore work views are later application composition, not Evaluation state.

# Formal Specification Decision

**Specified in 002-B.** Evaluation is evaluator-attributed judgment about an exact referable subject state. It deliberately rejects the current `Score` row, aggregate, queue, and version-freshness workflow as the concept boundary.