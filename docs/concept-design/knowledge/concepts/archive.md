---
type: Concept Design Concept
title: Archive
description: Transition an active working context into retained read-only internal history.
tags: [concept-design, candidate, archive, history, closure]
status: stable
authority: canonical
maturity: admitted
phase: 001-G
concept_id: CC-017
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate-input, resource: ../../evidence/001-F-surviving-candidate-baseline.md, title: 001-F Surviving Candidate Baseline }
---
# Purpose

Close an active working context into retained read-only internal history.

# Operational Principle

An operator determines that a working context has finished active operation and archives it. The context remains available for authorized historical inspection, but it is now explicitly retained history rather than an active context. Later viewers can inspect what was retained and understand that ordinary ongoing work belongs to a different active context or phase.

# Boundary

Archive owns active-versus-archived context state, closure, and retained historical access. It does not own the internal lifecycles of every concept scoped to that context, generic backup/retention infrastructure, or public [Publication](publication.md).

Application synchronizations may use archived state to gate ordinary mutations without making Archive a `Conference` or `Program` god concept.

# Gate Decision

**Admitted to Phase 002 formal specification.** The term is reserved for internal retained closure/history; public material exposure remains Publication.
