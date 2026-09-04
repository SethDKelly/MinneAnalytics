---
type: Concept Design Concept
title: Classification
description: Association of subjects with reusable descriptive terms.
tags: [concept-design, candidate, classification, taxonomy]
status: stable
authority: canonical
maturity: admitted
phase: 001-G
concept_id: CC-012
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Purpose

Associate subjects with shared descriptive terms.

# Operational Principle

A participant describes a subject by associating it with one or more reusable terms. Other participants can inspect which terms describe the subject and can find or group subjects that share a term. An association may later be changed or removed according to application policy without requiring the term itself to be renamed or deleted.

# Boundary

Classification owns subject-to-term associations and their inspection/change. It does not create, govern, retire, or restore terms; those behaviors belong to [Vocabulary](vocabulary.md). It does not own [Coverage Target](coverage-target.md) or organizer [Selection](selection.md).

Historical associations may remain meaningful after a vocabulary term is retired through composition with Vocabulary policy.

# Gate Decision

**Admitted to Phase 002 formal specification.** The concept remains independent from the historical `Theme` implementation boundary.
