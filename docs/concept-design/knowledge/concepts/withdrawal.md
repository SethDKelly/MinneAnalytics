---
type: Concept Design Concept
title: Withdrawal
description: An originator rescinds participation or commitment without rewriting organizer decision history.
tags: [concept-design, candidate, withdrawal, participation]
status: stable
authority: canonical
maturity: admitted
phase: 001-G
concept_id: CC-007
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Purpose

Allow an originator to rescind their participation or commitment independently of organizer preference.

# Operational Principle

An originator has an active offered participation they no longer wish to continue. They withdraw that participation. Withdrawal records that the originator rescinded their commitment and when it happened. Separate history describing what other actors previously wanted or decided about the participation remains untouched.

# Boundary

Withdrawal owns originator participation rescission and its history. It does not delete the [Proposal](proposal.md), reverse [Selection](selection.md) history, or represent general event cancellation.

Effective current participation is a later application composition of Selection, Withdrawal, and relevant event policy; it is not owned by either concept alone.

# Gate Decision

**Admitted to Phase 002 formal specification.** Independent actor, purpose, and history justify a separate concept rather than one mixed program-status lifecycle.
