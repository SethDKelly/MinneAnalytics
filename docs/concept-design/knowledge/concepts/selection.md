---
type: Concept Design Concept
title: Selection
description: Consequential organizer choice among candidates, including reserve alternatives and later decision changes.
tags: [concept-design, candidate, selection, decision]
status: stable
authority: canonical
maturity: admitted
phase: 001-G
concept_id: CC-006
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Purpose

Record consequential organizer choice among candidates while retaining alternatives.

# Operational Principle

A decision maker considers several candidates for a limited collection. They record that one candidate is selected, another is not selected, and another is retained as a reserve alternative. Later, when circumstances change, the reserve candidate can be promoted through a new organizer decision without pretending that it had been selected all along.

# Boundary

Selection owns organizer decision history about inclusion, non-inclusion, reserve status, and later organizer decision changes. It does not own individual [Evaluation](evaluation.md), originator [Withdrawal](withdrawal.md), [Capacity](capacity.md), [Coverage Target](coverage-target.md), [Schedule](schedule.md), or downstream [Deliverable](deliverable.md) readiness.

# Gate Decision

**Admitted to Phase 002 formal specification.** Selection remains independent from originator participation agency and from the current `ProgramStatus` representation.
