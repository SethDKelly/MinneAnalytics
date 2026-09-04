---
type: Concept Design Concept
title: Revision
description: Change a mutable subject while preserving prior forms and their sequence.
tags: [concept-design, candidate, revision, history]
status: stable
authority: canonical
maturity: admitted
phase: 001-G
concept_id: CC-002
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Purpose

Change a subject while preserving prior forms and the sequence of change.

# Operational Principle

A mutable subject currently has one revision. Its editor records a changed form as the next revision rather than overwriting the prior form. The new revision becomes current while earlier revisions remain inspectable, allowing later participants to understand both what the subject is now and what it was before.

# Boundary

Revision owns version sequence, current-versus-historical forms, and intrinsic change history. It does not determine whether editing is permitted, whether a prior [Evaluation](evaluation.md) is current for application use, or whether another actor has acknowledged a change.

Time-bounded edit opportunities may compose with [Availability Window](availability-window.md).

# Gate Decision

**Admitted to Phase 002 formal specification.** The concept remains complete without absorbing edit-policy or evaluation-freshness rules.
