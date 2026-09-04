---
type: Concept Design Concept
title: Controlled Disclosure
description: Stage exposure of information whose visibility timing matters, with intentional reveal when policy permits.
tags: [concept-design, candidate, disclosure, bias-reduction]
status: stable
authority: canonical
maturity: admitted-provisional
phase: 001-G
concept_id: CC-004
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
---
# Purpose

Stage exposure of information whose visibility timing matters to participant behavior while permitting intentional reveal when appropriate.

# Operational Principle

A participant works in a context where particular information is intentionally concealed at first. The participant can see that information is withheld without receiving its contents. If an allowed reveal condition is satisfied and the participant chooses to reveal it, the information becomes visible in that context. The disclosure remains distinguishable from the information itself and from whatever activity follows.

# Boundary

Controlled Disclosure owns concealed/disclosed state and intentional reveal behavior for staged information. Application policy may determine whether reveal is allowed.

It does not own authentication, generic authorization, permanent anonymity, full conflict/recusal management, or the [Evaluation](evaluation.md) whose independence the current application may protect.

# Gate Decision

**Provisionally admitted to Phase 002 formal specification.** Formal specification must preserve the staged-exposure center and reject expansion into generic RBAC, confidentiality, or conflict-management infrastructure.
