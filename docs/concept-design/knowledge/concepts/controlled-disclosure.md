---
type: Concept Design Concept
title: Controlled Disclosure
description: Monotonic staged exposure of a specific information item to a participant within a specific context, with reveal triggered only when application policy permits.
tags: [concept-design, concept, disclosure, bias-reduction, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-B
concept_id: CC-004
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: intent, resource: ../../evidence/001-B-intent-ledger.md, title: 001-B Historical Intent Ledger }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-B-evaluation-disclosure-and-directed-response.md, title: 002-B Evaluation, Disclosure & Directed Response }
---
# Purpose

Stage exposure of information whose visibility timing matters to participant behavior while permitting intentional reveal when appropriate.

# Operational Principle

A participant enters a context in which a specific information item is intentionally withheld. Controlled Disclosure records that this participant/context/information relationship is concealed without owning the information itself. When application policy allows disclosure, an explicit participant action or a composed process can reveal that item. From then on, the concept preserves the fact that the information was disclosed in that context rather than pretending it can be made unknown again.

# Abstract State

Let `Disclosure` be the set of controlled-disclosure identities.

For each `d ∈ Disclosure`, Controlled Disclosure records:

- `participant(d): ActorRef` — the participant whose exposure is being staged;
- `context(d): ContextRef` — the local activity/context in which exposure is controlled;
- `information(d): InformationRef` — an opaque reference to the information being withheld/revealed;
- `stagedAt(d): Instant` — when controlled exposure was established;
- `revealedBy(d): ActorRef?` — absent while concealed, otherwise the actor/process reference associated with reveal;
- `revealedAt(d): Instant?` — absent while concealed, otherwise when reveal occurred.

The tuple `(participant, context, information)` identifies one exposure relationship. Different information items—such as identity information and peer aggregate information—are separate disclosure relationships even when they occur in the same review context.

# Actions

## `Stage(participant, context, information, at) -> disclosure`

**Intent:** establish that one information item is initially concealed from one participant in one context.

**Requires:**

- participant, context, and information references are supplied;
- no existing Disclosure has the same `(participant, context, information)` tuple.

Whether the application should stage this information at all is policy/composition, not an intrinsic decision of Controlled Disclosure.

**Effects:**

- creates a fresh Disclosure identity `d`;
- records the participant, context, information, and `stagedAt(d) = at`;
- leaves `revealedBy(d)` and `revealedAt(d)` absent;
- leaves all other Disclosure records unchanged.

## `Reveal(disclosure, actor, at)`

**Intent:** record that previously concealed information has been disclosed in its staged context.

**Requires:**

- `disclosure ∈ Disclosure`;
- `revealedAt(disclosure)` is absent;
- `at >= stagedAt(disclosure)`.

Authorization, eligibility, conflict checks, and reveal conditions are supplied by application policy/synchronization. This action does not decide *why* reveal is permitted.

**Effects:**

- sets `revealedBy(disclosure) = actor`;
- sets `revealedAt(disclosure) = at`;
- leaves participant, context, information, and staging provenance unchanged.

# Intrinsic Invariants

1. Every Disclosure refers to exactly one participant, context, and information item.
2. Participant, context, and information references are stable for the lifetime of a Disclosure identity.
3. At most one Disclosure exists for a given `(participant, context, information)` tuple.
4. `revealedBy(d)` and `revealedAt(d)` are either both absent or both present.
5. When present, `revealedAt(d) >= stagedAt(d)`.
6. Reveal is monotonic: a revealed Disclosure cannot return to concealed state through this concept.
7. Controlled Disclosure does not own the information contents or their source-of-truth lifecycle.
8. Controlled Disclosure does not define authentication, role membership, generic authorization grants, confidentiality-at-rest, data classification, permanent anonymity, or generic access revocation.
9. Controlled Disclosure does not define conflict-of-interest/recusal state.
10. Controlled Disclosure does not own [Evaluation](evaluation.md), even when disclosure timing is used to protect evaluator independence.
11. A configurable application may choose not to stage a particular information item at all; a global `blind review enabled` flag is therefore not intrinsic Controlled Disclosure state.

# Derived Observations

For `d ∈ Disclosure`:

- `concealed(d)` iff `revealedAt(d)` is absent;
- `revealed(d)` iff `revealedAt(d)` is present.

Exactly one of these observations holds.

The concept intentionally does not derive broad statements such as “participant can access subject X.” It answers only whether a specific staged information item has been revealed in the specified context.

# Synchronization Boundary

Controlled Disclosure is designed to compose without absorbing neighboring concepts:

- identity information may be staged and later explicitly revealed by a participant;
- peer/aggregate information may be staged and later revealed when a separate application condition—such as recording a current [Evaluation](evaluation.md)—is satisfied;
- multiple information items in the same context remain independently staged/revealed;
- future conflict-of-interest behavior may influence whether reveal is permitted but does not become Controlled Disclosure state;
- removing a participant's general access after an event or context ends is an authorization/lifecycle concern, not an attempt to reverse historical disclosure.

# Provisional Gate Resolution

**Resolved and specified in 002-B.** Controlled Disclosure survives its Phase 001 provisional condition because its formal model is narrowly about one staged exposure relationship with monotonic reveal. It does not become RBAC, generic confidentiality infrastructure, or conflict-management state.