---
type: Design Decision
title: 003-G Implementation Reconciliation Gate
description: Closes Phase 003 and authorizes bounded Phase 004 implementation execution under the accepted persistence, synchronization, policy, interface, migration, and evidence gates.
tags: [concept-design, phase-003, gate, implementation-reconciliation, implementation, migration]
status: stable
authority: canonical
phase: 003-G
sources:
  - { id: phase, resource: ../../003-G-implementation-reconciliation-consolidation-and-execution-handoff.md, title: 003-G Implementation Reconciliation Consolidation & Execution Handoff }
  - { id: conformance, resource: ../../evidence/003-G-reconciliation-conformance-and-closure-matrix.md, title: 003-G Reconciliation Conformance & Closure Matrix }
  - { id: packages, resource: ../../evidence/003-G-implementation-work-package-and-dependency-matrix.md, title: 003-G Implementation Work Package & Dependency Matrix }
  - { id: handoff, resource: ../reconciliation/implementation-execution-handoff.md, title: MinneAnalytics v0 Implementation Execution Handoff }
  - { id: closure, resource: ../reconciliation/implementation-closure-evidence-baseline.md, title: MinneAnalytics v0 Implementation Closure & Evidence Baseline }
---
# Decision

**Phase 003 passes and is complete.**

The accepted v0 Concept Design model has a coherent implementation reconciliation across:

- current implementation ownership;
- stable semantic and policy gaps;
- persistence/identity/history targets;
- synchronization/transaction/idempotency/recovery behavior;
- authority/lifecycle/disclosure/sharing/publication policy;
- derived read/API/UI/compatibility behavior;
- migration/backfill/cutover/rollback execution;
- runtime evidence and closure rules.

No unresolved contradiction requires reopening Phase 001 discovery or Phase 002 formal specification before implementation begins.

# Implementation authorization

**Bounded Phase 004 runtime implementation is authorized.**

Authorization is governed by the [v0 Implementation Execution Handoff](../reconciliation/implementation-execution-handoff.md) and [v0 Implementation Closure & Evidence Baseline](../reconciliation/implementation-closure-evidence-baseline.md).

This is not blanket authorization for arbitrary refactoring.

Implementation must preserve:

- canonical concept ownership;
- independent histories;
- exact reference semantics;
- transaction/recovery rules;
- policy boundaries;
- compatibility subordination;
- migration no-fabrication rules;
- security/correctness rollback floors;
- closure evidence requirements.

# Phase 004

Phase 004 is **v0 Implementation Execution & Migration** with these packages:

1. 004-A — Migration Discipline, Baseline & Additive Schema Foundation
2. 004-B — Revision, Classification, Evaluation & Feedback Canonicalization
3. 004-C — Selection, Withdrawal, Capacity & Deliverable Canonicalization
4. 004-D — Availability, Archive, Authority & Disclosure Policy Implementation
5. 004-E — Publication, Public Access, Schedule & Dispatch Hardening
6. 004-F — Semantic Read Models, API/UI Cutover & Compatibility Retirement
7. 004-G — Migration Validation, Rollback Rehearsal & Legacy Cleanup Gate
8. 004-H — Phase 004 Consolidation & v0 Implementation Exit Review

The dependency/order semantics are owned by the execution handoff node rather than duplicated here.

# Gap status at Phase 003 exit

All `SG-001`–`SG-018` and `SG-P01`–`SG-P04` are:

- target-designed;
- implementation-path assigned;
- migration/backfill disposition defined;
- runtime verification criteria defined.

They are **not yet implemented/closed**.

Phase 004 must close them with evidence or explicitly defer only where the closure baseline permits it.

# Branch boundary

The 003-G commit should be preserved as the stable v0 design/reconciliation baseline.

A dedicated Phase 004 implementation branch from that commit is recommended so runtime changes remain readily comparable to the accepted baseline.

# Destructive-cleanup boundary

Phase 004 authorization permits additive schema and runtime implementation beginning with 004-A.

It does **not** pre-authorize destructive removal of compatibility fields/tables/enums or weakening of rollback support.

Destructive cleanup remains conditional on the 004-G removal gate and may be skipped where a compatibility projection is cheap, unambiguous, and non-authoritative.

# Stop condition

If implementation reveals evidence that contradicts an accepted semantic/policy target, the affected slice must stop and the narrowest canonical owner must be intentionally amended before execution continues.

Newer code does not automatically override the design authority model.

# Next activity

Begin **004-A — Migration Discipline, Baseline & Additive Schema Foundation**.