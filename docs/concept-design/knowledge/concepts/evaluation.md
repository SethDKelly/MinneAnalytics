---
type: Concept Design Concept
title: Evaluation
description: An independently formed judgment about a subject, attributable to its evaluator.
tags: [concept-design, candidate, evaluation, judgment]
status: stable
authority: canonical
maturity: admitted
phase: 001-G
concept_id: CC-003
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Purpose

Record an independently formed judgment about a subject.

# Operational Principle

An evaluator considers a subject and records their own judgment, optionally retaining private context that helps explain that judgment. The Evaluation is attributable to that evaluator and subject. The evaluator may later revise their own judgment, but another actor's collective decision does not manufacture or replace it.

# Boundary

Evaluation owns evaluator-attributed judgment and private evaluation context. It does not own organizer [Selection](selection.md), recipient-directed [Feedback](feedback.md), staged [Controlled Disclosure](controlled-disclosure.md), or application rules deciding whether an evaluation of an earlier [Revision](revision.md) participates in current aggregation.

# Gate Decision

**Admitted to Phase 002 formal specification.** Evaluation remains a focused behavioral concept rather than the current numeric `Score` representation.
