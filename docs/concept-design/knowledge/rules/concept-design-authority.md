---
type: Design Rule
title: Concept Design Authority
description: Canonical authority rules separating Concept Design from implementation evidence, synchronization policy, and later code reconciliation.
tags: [concept-design, authority, implementation, synchronization, evidence]
status: stable
authority: canonical
sources:
  - id: phase-001-a
    resource: ../../001-A-design-authority-methodology-evidence-and-anti-bias.md
    title: 001-A Design Authority, Methodology, Evidence & Anti-Bias Rules
  - id: phase-001-f
    resource: ../../001-F-operational-principle-development.md
    title: 001-F Operational Principle Development
---
# Design authority

MinneAnalytics Concept Design describes the intended behavioral structure of the product independently of its current realization.

> **Existing code, schemas, routes, UI organization, APIs, deployment topology, and framework choices are evidence of implemented behavior; they do not define Concept Design boundaries.**

# Discovery and specification discipline

- Purpose precedes structure.
- Candidate concepts are justified by user/organizational problems and operational principles, not by implementation nouns.
- Independently meaningful histories should remain independently representable even when the current implementation collapses them.
- Heavy interaction between concepts is not evidence that they should merge.
- Application-specific coordination belongs in synchronizations or application policy when the concepts remain independently understandable.
- Derived facts and workflow views should not be promoted to authoritative concepts merely because the application displays or persists them.

For the full discovery rationale and anti-bias record, see [001-A](../../001-A-design-authority-methodology-evidence-and-anti-bias.md). Future work should cite this canonical rule rather than repeatedly reproducing the full anti-bias list.

# Evidence ordering

For concept discovery and refinement, prefer evidence in this order:

1. user/problem intent;
2. user-visible behavior;
3. historical evolution and rationale;
4. future intent;
5. implementation details.

This is an anti-bias ordering, not a claim that implementation evidence is inaccurate about current behavior.

# Concept-local versus composed behavior

A concept owns only the behavior required to fulfill its focused purpose.

Rules that depend on several independent concepts should normally be represented later as synchronizations/application composition. Examples from discovery include effective participation, evaluation freshness, coverage gaps, edit eligibility, publication eligibility, and dispatch-recipient eligibility.

For the accepted MinneAnalytics v0 cross-concept rules, use the canonical [Synchronization & Application Composition](../synchronizations/) layer rather than restating those rules in concept nodes or phase indexes.

# Implementation reconciliation

OKF adoption does **not** authorize application refactoring.

Application code changes should occur only after later Concept Design work has:

1. accepted concept specifications;
2. defined the required synchronizations/application policies;
3. compared those specifications against the existing implementation;
4. identified a concrete semantic mismatch, accidental coupling, missing behavior, or migration requirement;
5. explicitly authorized the implementation change.

Refactoring application code merely to resemble the knowledge-directory structure is prohibited.

Documentation/tooling code may be changed when necessary to maintain the knowledge contract, provided it does not change product semantics.
