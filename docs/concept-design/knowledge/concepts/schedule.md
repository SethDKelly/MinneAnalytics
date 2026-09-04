---
type: Concept Design Concept
title: Schedule
description: Allocation of eligible activities to constrained place/time opportunities with inspectable, human-adjustable placements.
tags: [concept-design, candidate, schedule, allocation]
status: stable
authority: canonical
maturity: admitted
phase: 001-G
concept_id: CC-015
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Purpose

Allocate eligible activities to constrained place/time opportunities while preserving human-adjustable placement.

# Operational Principle

A planner has activities to place and available place/time opportunities. They create placements assigning activities to opportunities. If a placement is undesirable or conflicts with another constraint, the planner can move, swap, or remove it. The system may offer a generated draft or suggestion, but the resulting Schedule is the explicit placement set the planner can inspect and adjust.

# Boundary

Schedule owns opportunities, placements, move/swap/unplace behavior, and placement constraints. It does not own organizer [Selection](selection.md), participant [Withdrawal](withdrawal.md), attendee-demand collection, or any one generation heuristic.

[Capacity](capacity.md) represents scarce commitment capacity rather than place/time allocation.

# Gate Decision

**Admitted to Phase 002 formal specification.** The concept remains stable across changes in scheduling heuristics and future external demand inputs.
