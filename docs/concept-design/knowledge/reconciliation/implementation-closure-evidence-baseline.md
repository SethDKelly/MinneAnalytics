---
type: Implementation Closure & Evidence Baseline
title: MinneAnalytics v0 Implementation Closure & Evidence Baseline
description: Canonical rules for Phase 004 gap-state reporting, runtime evidence, closure criteria, rollback-floor verification, and implementation exit review.
tags: [concept-design, implementation-reconciliation, implementation, evidence, verification, closure, v0]
status: stable
authority: canonical
phase: 003-G
sources:
  - { id: phase, resource: ../../003-G-implementation-reconciliation-consolidation-and-execution-handoff.md, title: 003-G Implementation Reconciliation Consolidation & Execution Handoff }
  - { id: conformance, resource: ../../evidence/003-G-reconciliation-conformance-and-closure-matrix.md, title: 003-G Reconciliation Conformance & Closure Matrix }
  - { id: validation, resource: backfill-validation-reversibility-baseline.md, title: MinneAnalytics v0 Backfill Validation & Reversibility Baseline }
  - { id: handoff, resource: implementation-execution-handoff.md, title: MinneAnalytics v0 Implementation Execution Handoff }
---
# Purpose

Define what evidence is required before a designed semantic/policy gap can be treated as implemented and closed.

The core rule is:

> **A design target is not an implementation result. A migration result is not a closure result. A gap closes only when authority, behavior, compatibility, verification, and rollback obligations are satisfied in the supported runtime scope.**

# Gap governance states

Phase 004 may report each SG/SG-P item using these implementation-governance states:

- `target-designed` — Phase 003 has a complete accepted target and execution path;
- `implementation-in-progress` — code/schema/migration work has started but authority has not fully moved;
- `canonical-write-active` — target-native writes are authoritative for the supported scope where the gap has a write owner;
- `semantic-read-active` — target semantic reads/UI are authoritative for the supported scope where applicable;
- `legacy-authority-disabled` — competing legacy write authority is removed or reduced to a documented safe adapter;
- `verified-closed` — all required runtime evidence and compatibility/rollback criteria pass.

`legacy-unknown` is an evidence/provenance condition, not a failure state by itself. A gap may close while historical unknowns remain when the canonical migration baseline explicitly permits native truth to begin at cutover and interfaces do not misrepresent older history.

These labels are project governance only; they are not Concept Design concepts or product workflow state.

# Universal closure requirements

Unless a requirement is genuinely inapplicable, `verified-closed` requires:

1. **Target realization** — accepted persistence/policy/execution semantics are implemented in the supported scope.
2. **Canonical write authority** — new native truth is captured through the target writer/command boundary.
3. **Legacy writer disposition** — competing legacy writers are disabled or narrowed to adapters that invoke target semantics without independent authority.
4. **Semantic read correctness** — first-party interfaces use target semantic facts/projections, or a documented compatibility read is proven safe and subordinate.
5. **Migration truth** — supported legacy records are backfilled/seeding/quarantined according to the canonical provenance rules.
6. **Invariant verification** — structural and concept/synchronization invariants pass.
7. **Scenario verification** — behavior that could lose history, violate authority, over-allocate, over-disclose, or duplicate effects is exercised.
8. **Parity classification** — coexistence differences are explained as equal projection, intentional correction, legacy unknown, or defect; no unexplained defects remain.
9. **Recovery verification** — expected retries, convergence, projection repair, provider uncertainty, or resource-boundary recovery are demonstrated where applicable.
10. **Rollback-floor preservation** — rollback/disable procedures cannot erase history or weaken accepted security/correctness floors.
11. **Consumer inventory** — affected first-party and supported external consumers no longer rely on the retired authority.
12. **Documentation/tests** — implementation docs/tests no longer describe the legacy surface as authoritative.

# Required evidence artifacts

Each implementation package should produce only the artifacts relevant to its scope, but the complete Phase 004 evidence set should include:

- committed Prisma migration artifacts and migration history where schema changes occur;
- idempotent backfill scripts with versioned run semantics;
- migration/run manifest with provenance and quarantine counts;
- pre/post invariant validation report;
- scenario-test results;
- semantic/compatibility shadow or parity report;
- write-path and consumer inventory;
- rollback/disable and forward-repair procedure;
- backup/restore rehearsal result;
- projection-repair result;
- durable-work retry/convergence result;
- public/protected-information security verification;
- final SG/SG-P closure ledger.

These may be tests, generated reports, implementation docs, CI artifacts, or version-controlled manifests. They are implementation evidence, not a new normative concept layer.

# High-risk closure criteria

## SG-001 — Evaluation history

Required evidence:

- exact Revision reference exists for target-native Evaluations;
- evaluator + exact Revision uniqueness is enforced;
- recording/revising Evaluation for R2 does not overwrite the Evaluation of R1;
- current-rescore/needs-evaluation queues derive from exact Revision applicability;
- ambiguous legacy scores do not receive false exact attribution.

## SG-002 — Selection history

Required evidence:

- Selection Decision history is append-preserving;
- current disposition derives from that history;
- compatibility `programStatus` projects from Selection + Withdrawal;
- organizer legacy status updates no longer overwrite Selection history.

## SG-003 — Withdrawal independence

Required evidence:

- Withdrawal is durable and independently queryable;
- later Selection decisions cannot erase Withdrawal;
- withdrawal cleanup is convergent/idempotent;
- source-authoritative Withdrawal remains visible during cleanup failure.

## SG-004 — Capacity authority

Required evidence:

- finite Pool and active Allocations are authoritative;
- concurrent effective-participation attempts cannot exceed limit;
- release is idempotent;
- Capacity is not inferred only from dashboard counts.

## SG-005 — Controlled Disclosure

Required evidence:

- native staged relationship identity is durable;
- Reveal is monotonic and retry-safe;
- presenter identity and exact-Revision peer aggregate are independently represented;
- protected values remain absent while concealed;
- legacy in-flight unknown exposure is never represented as known concealed state.

## SG-006 — Revision Classification

Required evidence:

- exact Revision↔Term relation is authoritative;
- historical revisions retain historical classifications;
- current `SubmissionTheme` mirror, if retained, repairs from current Revision Classification;
- retired Terms remain referable.

## SG-007 — Deliverable readiness

Required evidence:

- ready/concern Assessments reference exact ArtifactVersion;
- replacement ArtifactVersion does not inherit prior readiness;
- native writes do not create `REVIEWED` merely for compatibility;
- compatibility `deckStatus` is subordinate.

## SG-008 / SG-009 — Publication and public access

Required evidence:

- Publication binds exact MaterialRef;
- publish/unpublish history is retained;
- public listing derives from exact Publication + current eligibility;
- public token resolver authorizes the exact material, not parent mutable state;
- historical old `publicId` requests fail unless that exact material is intentionally published;
- revocation suppresses public visibility immediately even while cleanup converges.

These properties are security rollback floors.

## SG-010 — Archive provenance

Required evidence:

- Archive closure identity persists independently from compatibility status;
- routine status mutation cannot erase closure;
- post-Archive allowed/denied actions follow action-specific policy.

## SG-014 — Schedule generation

Required evidence:

- generation does not directly mutate authoritative placement;
- proposal includes expected/base version or equivalent concurrency anchor;
- stale apply conflicts rather than overwriting newer planner work;
- accepted apply is atomic for its placement delta.

## SG-015 / SG-016 — Dispatch

Required evidence:

- new sends preserve exact immutable message evidence;
- stable recipient + semantic round uniqueness is enforced;
- same-round retry does not create a second semantic send;
- intentional repeat uses a new round;
- provider uncertainty blocks unsafe blind retry.

# Policy-gap closure

## SG-P01 — edit eligibility

Close only when first-party Revision commands obtain server-authoritative reasoned eligibility from ownership + Window + lifecycle + decision lock + explicit revision exception, rather than deriving authority from legacy status enums.

## SG-P02 — capability authority

Close only when consequential server commands check action-oriented capabilities/scopes consistently. Current role strings may remain the assignment mechanism.

## SG-P03 — Archive/post-event operations

Close only when ordinary active mutation is denied after Archive while explicitly permitted historical/export/publication-safe/recovery operations remain possible according to policy.

## SG-P04 — sharing/publication policy

Close only when share eligibility and changes have target-native provenance where required, affirmative share eligibility does not auto-publish, and exact Publication controls public exposure.

# Partial support scopes

A gap may be closed for a declared supported scope while quarantined legacy contexts remain outside that scope only when:

- the scope boundary is explicit;
- unsupported/quarantined contexts cannot accidentally enter canonical commands that assume invariants they do not satisfy;
- the UI/API clearly preserves compatible behavior without false historical claims;
- the implementation exit review records the remaining cohort and its terminal plan.

Do not use scoped closure to hide unresolved blocking defects in active supported data.

# Parity acceptance

For the current application scale, closure expects **zero unexplained defects** in the supported in-scope records.

Differences may remain only when classified as:

- equal projection;
- intentional semantic/security correction;
- accepted legacy unknown.

Security-sensitive public/disclosure behavior must prefer the accepted safer target when current behavior is over-broad.

# Rollback closure requirement

A gap cannot close if the only rollback plan re-enables a writer or read behavior that violates a canonical rollback floor.

Safe fallback may be:

- compatibility read;
- disabled semantic UI;
- maintenance/read-only command mode;
- forward repair.

It need not be a full return to the old behavior.

# Phase 004 final closure ledger

004-H must report every SG-001–SG-018 and SG-P01–SG-P04 as one of:

- `verified-closed`;
- `explicitly-deferred` with rationale, supported-scope impact, and next owner;
- `blocked` — Phase 004 cannot pass.

A high-priority semantic/security gap may not be silently deferred.

# Documentation authority after implementation

Implementation results may refine physical realization, performance strategy, schema indexes, file/module placement, or operational tooling.

They do not override canonical Concept Design semantics merely because code is newer.

If implementation evidence requires a semantic change, update the canonical owner intentionally and record the decision before treating the new behavior as authoritative.