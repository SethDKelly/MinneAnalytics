---
type: Concept Design Concept
title: Coverage Target
description: Desired representation for a collection dimension without duplicating observed composition state.
tags: [concept-design, candidate, coverage, planning]
status: stable
authority: canonical
maturity: admitted-provisional
phase: 001-G
concept_id: CC-010
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
---
# Purpose

Express desired representation along a relevant collection dimension without owning actual collection composition.

# Operational Principle

An organizer wants a collection to contain a desired amount of a particular kind of item. They establish a Coverage Target for a dimension/value, such as a desired minimum, maximum, or acceptable range. The target can be inspected, changed, or removed as planning intent evolves. It states what representation is desired; it does not claim how much representation currently exists.

# Boundary

Coverage Target owns planning intent about desired representation. It does not own [Classification](classification.md), [Selection](selection.md), actual composition, gap/excess calculations, warnings, heatmaps, or automatic selection decisions.

Actual composition is a derived projection over selected items and relevant classifications/attributes; comparison with the target is application composition.

# Gate Decision

**Provisionally admitted to Phase 002 formal specification.** Phase 002 must preserve target-only authority and reject reintroduction of duplicated observed-composition state.
