---
type: Implementation Execution Handoff
title: MinneAnalytics v0 Implementation Execution Handoff
description: Canonical Phase 004 work-package order, implementation authorization boundary, dependency rules, and execution constraints following Phase 003 reconciliation.
tags: [concept-design, implementation-reconciliation, execution-handoff, implementation, migration, v0]
status: stable
authority: canonical
phase: 003-G
sources:
  - { id: phase, resource: ../../003-G-implementation-reconciliation-consolidation-and-execution-handoff.md, title: 003-G Implementation Reconciliation Consolidation & Execution Handoff }
  - { id: packages, resource: ../../evidence/003-G-implementation-work-package-and-dependency-matrix.md, title: 003-G Implementation Work Package & Dependency Matrix }
  - { id: rollout, resource: migration-rollout-execution-plan.md, title: MinneAnalytics v0 Migration Backfill & Rollout Execution Plan }
  - { id: closure, resource: implementation-closure-evidence-baseline.md, title: MinneAnalytics v0 Implementation Closure & Evidence Baseline }
---
# Purpose

Authorize and govern bounded runtime implementation after Phase 003 reconciliation.

This node owns **execution package order and authorization constraints**. It does not redefine the Concept Catalog, synchronization contract, persistence target, policy target, interface target, or migration semantics.

# Implementation authorization

**Phase 004 runtime implementation is authorized.**

Authorization is bounded by these rules:

1. begin from the accepted 003-G reconciliation baseline;
2. implement in the dependency order below;
3. use expand-first schema evolution;
4. do not fabricate migration history;
5. do not reintroduce competing legacy authority after canonical write cutover;
6. preserve all rollback floors;
7. do not mark SG/SG-P items closed without runtime evidence;
8. do not perform destructive cleanup before its removal gate;
9. if code evidence contradicts the accepted semantic design, amend the narrowest canonical owner instead of silently changing semantics in code.

# Recommended branch boundary

Preserve the 003-G gate commit as the stable design/reconciliation baseline.

Recommended execution branch:

`concept-design/v0-implementation`

created from the 003-G gate commit.

The exact branch name is workflow guidance, not normative domain semantics. The required property is that implementation work has a stable Phase 003 baseline for comparison and rollback reasoning.

# Phase 004 — v0 Implementation Execution & Migration

## 004-A — Migration Discipline, Baseline & Additive Schema Foundation

Scope:

- establish checked-in Prisma migration history;
- establish controlled migration deployment semantics;
- establish migration/backfill run reporting;
- establish backup and restore rehearsal support;
- introduce additive target schema and provenance support;
- introduce feature/configuration gates needed for staged cutover.

Mapped migration waves: F0/F1.

No semantic write authority moves in this package.

## 004-B — Revision, Classification, Evaluation & Feedback Canonicalization

Scope:

- exact current/predecessor Revision references;
- exact Revision↔Term Classification;
- exact Evaluation→Revision subject relation and uniqueness;
- exact abstract Feedback→Revision reference;
- current Submission/version/theme compatibility projections;
- deterministic/backfilled-current-state Revision migration;
- Evaluation legacy-unknown handling.

Mapped waves: F2 + F5-W1.

Priority rationale: current rescoring can erase earlier Revision-specific Evaluation history.

## 004-C — Selection, Withdrawal, Capacity & Deliverable Canonicalization

Scope:

- immutable Selection Decisions;
- independent Withdrawal;
- finite Capacity Pool/Allocation/Release;
- Deliverable Requirement and exact ArtifactVersion Assessment;
- atomic effective-participation entry;
- source-authoritative participation exit plus durable cleanup;
- compatibility `programStatus` and `deckStatus` projection.

Mapped waves: relevant F3 + F5-W2.

## 004-D — Availability, Archive, Authority & Disclosure Policy Implementation

Scope:

- canonical Availability Window;
- manual suspension compatibility;
- action-oriented capabilities;
- explicit edit eligibility/revision exception;
- monotonic Archive closure;
- native Controlled Disclosure staging/reveal;
- legacy in-flight disclosure cohort handling;
- blind-mode transition locking.

Mapped waves: relevant F3 + F5-W3/W4.

## 004-E — Publication, Public Access, Schedule & Dispatch Hardening

Scope:

- public-sharing provenance;
- exact MaterialRef Publication and PublicationState;
- exact public-token/file authorization;
- Publication cleanup convergence;
- Schedule generation proposal + expected-base atomic apply;
- exact Dispatch messages and provider-attempt/outcome semantics;
- same-round idempotency and new-round intentional repeat.

Mapped waves: F5-W5/W6/W7.

Exact public authorization and protected-data behavior are security rollback floors.

## 004-F — Semantic Read Models, API/UI Cutover & Compatibility Retirement

Scope:

- shadow semantic reads;
- machine-readable application error codes;
- semantic presenter/reviewer/organizer/public views;
- explicit protected-information states;
- first-party action-oriented mutation surfaces;
- compatibility adapters only where needed;
- disable first-party independent compatibility writes.

Mapped waves: F6/F7/F8.

Composition-oriented screens may remain. This package does not require screen-per-concept or API-per-concept redesign.

## 004-G — Migration Validation, Rollback Rehearsal & Legacy Cleanup Gate

Scope:

- complete structural invariant validation;
- scenario tests across high-risk synchronizations;
- semantic/compatibility parity reports;
- backup/restore rehearsal;
- projection-repair tests;
- durable-work recovery tests;
- consumer inventory closure;
- legacy-unknown terminal disposition;
- destructive cleanup eligibility decisions.

Mapped waves: F4/F9 plus cross-slice closure validation.

Destructive cleanup is optional and performed only where the removal gate passes.

## 004-H — Phase 004 Consolidation & v0 Implementation Exit Review

Scope:

- close or explicitly defer every SG/SG-P item with evidence;
- ensure no supported competing legacy writer remains;
- ensure rollback floors remain enforced;
- update implementation/documentation authority links;
- decide next-phase product/operational readiness.

# Dependency order

Hard dependency chain:

```text
004-A
  ↓
004-B
  ↓
004-C
  ↓
004-D
  ↓
004-E
  ↓
004-F
  ↓
004-G
  ↓
004-H
```

This does not prohibit parallel coding inside a package. It prohibits a later package from **assuming authority has moved** before the earlier package's own acceptance gate is satisfied.

# Cross-package hard rules

- Exact Revision identity must exist before exact Evaluation/Classification authority.
- Valid Capacity must exist before newly effective Selection can become authoritative.
- Public Publication state and exact resolver rules must move together.
- Canonical writers must exist before semantic reads become authoritative.
- First-party legacy writers must be disabled before compatibility fields are treated as projection-only.
- Destructive cleanup must follow consumer inventory, parity, rollback and provenance gates.

# Implementation evidence

Each package must produce implementation evidence appropriate to its changes. The required evidence classes are owned by [Implementation Closure & Evidence Baseline](implementation-closure-evidence-baseline.md).

# Physical architecture rule

Concept boundaries do not imply one table, service, route, worker, screen or module per concept.

Existing aggregates may remain where:

- canonical ownership is explicit;
- independent histories are preserved;
- invariants can be enforced;
- compatibility state remains subordinate;
- migration/repair can reconstruct projections.

# Anti-bloat constraints

Phase 004 does not require:

- event sourcing;
- Kafka or another broker;
- a distributed saga platform;
- CQRS/read-model databases;
- database-engine replacement;
- one endpoint per concept;
- one service per concept;
- full UI redesign before semantic cutover.

Use the minimum infrastructure needed to satisfy the accepted invariants, migration gates, and recovery behavior.

# Stop-and-amend rule

Implementation may reveal evidence that an accepted target cannot be realized safely or that a recovered product need contradicts the specification.

When that occurs:

1. stop the affected semantic slice;
2. identify the narrowest canonical owner;
3. document the new evidence;
4. amend that owner and dependent targets intentionally;
5. resume implementation only after the contradiction is resolved.

Do not encode an undocumented exception in application code.