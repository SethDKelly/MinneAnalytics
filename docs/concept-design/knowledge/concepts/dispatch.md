---
type: Concept Design Concept
title: Dispatch
description: Intentional operational message delivery to a resolved audience with durable send history and duplicate/round semantics.
tags: [concept-design, candidate, dispatch, communication]
status: stable
authority: canonical
maturity: admitted-provisional
phase: 001-G
concept_id: CC-018
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
---
# Purpose

Send an operational message to a resolved audience while preserving performed-send history and semantic duplicate/round behavior.

# Operational Principle

An organizer has an operational message and a resolved set of intended recipients. Before committing the action, they inspect the message and recipient set. They dispatch the message, and the Dispatch records the performed send and recipient outcomes. Repeating the same semantic send or round can recognize and skip recipients already dispatched, while a later round can intentionally include newly eligible recipients.

# Boundary

Dispatch owns message-instance preview/confirmation, performed send/batch history, recipient outcomes, and duplicate/round semantics. It does not own the source state that makes a recipient eligible, reusable template-authoring as a separate lifecycle, review [Feedback](feedback.md), or provider transport.

Recipient eligibility is supplied through application composition rather than read from [Selection](selection.md), [Deliverable](deliverable.md), or other concept internals.

# Gate Decision

**Provisionally admitted to Phase 002 formal specification.** Formal specification must preserve the performed-dispatch center and keep templates/provider mechanics from expanding the boundary.
