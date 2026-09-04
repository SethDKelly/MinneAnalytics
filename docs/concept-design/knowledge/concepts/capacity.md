---
type: Concept Design Concept
title: Capacity
description: A finite pool whose commitments consume and release scarce capacity according to accounting rules.
tags: [concept-design, candidate, capacity, scarcity]
status: stable
authority: canonical
maturity: admitted
phase: 001-G
concept_id: CC-011
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Purpose

Represent scarce commitment capacity and how commitments consume it.

# Operational Principle

An organizer establishes a finite capacity pool. Commitments consume units from that pool according to its accounting rules, and released commitments return capacity. At any time the organizer can see how much is committed, how much remains, and whether the pool is saturated. Different commitment classes may consume the pool differently without changing the meaning of the pool itself.

# Boundary

Capacity owns finite availability, consumption/release, accounting rules/classes, and remaining/saturated state. It does not choose which candidate should consume capacity and does not allocate activities to place/time opportunities.

[Selection](selection.md) may compose with Capacity when decisions consume or release commitment capacity. [Schedule](schedule.md) owns place/time allocation instead.

# Gate Decision

**Admitted to Phase 002 formal specification.** The concept remains meaningful before a Schedule exists and independently of current sponsor terminology.
