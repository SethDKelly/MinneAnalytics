---
type: Design Decision
title: 004-H v0 Implementation Exit Gate
description: Closes Phase 004 with all 18 semantic gaps and 4 policy gaps verified-closed in the supported v0 runtime scope while explicitly separating semantic implementation acceptance from live production qualification.
tags: [concept-design, phase-004, gate, implementation, migration, verification, closure, v0]
status: stable
authority: canonical
phase: 004-H
sources:
  - { id: phase, resource: ../../004-H-phase-004-consolidation-and-v0-implementation-exit-review.md, title: 004-H Phase 004 Consolidation & v0 Implementation Exit Review }
  - { id: ledger, resource: ../../evidence/004-H-semantic-gap-and-policy-closure-ledger.md, title: 004-H Semantic Gap & Policy Closure Ledger }
  - { id: residual, resource: ../../evidence/004-H-residual-risk-and-operational-handoff.md, title: 004-H Residual Risk & Operational Handoff }
  - { id: closure, resource: ../reconciliation/implementation-closure-evidence-baseline.md, title: MinneAnalytics v0 Implementation Closure & Evidence Baseline }
---
# Decision

**Phase 004 passes and is complete.**

The MinneAnalytics **v0 semantic implementation is accepted** in the declared supported runtime scope.

Final implementation-governance disposition:

- `SG-001` through `SG-018`: **verified-closed**;
- `SG-P01` through `SG-P04`: **verified-closed**;
- explicitly deferred semantic/policy gaps: **none**;
- blocked semantic/policy gaps: **none**.

The detailed evidence is owned by the [004-H closure ledger](../../evidence/004-H-semantic-gap-and-policy-closure-ledger.md).

# Supported closure scope

The accepted scope includes:

- target-native v0 persistence and command behavior;
- semantic first-party reads;
- fresh SQLite migration/reconciliation;
- recognized pre-004-A SQLite backup/restore/baseline-adoption/migration/reconciliation;
- compatibility projection repair and controlled semantic-read rollback;
- exact public/protected-information rollback floors;
- current single-task AWS-dev deployment topology validation;
- optimized application build and production container build.

The gate does not claim that the currently mounted AWS dev EFS database has already been migrated or that a production release has occurred.

# Residual blockers discovered by the gate

004-H found and corrected two runtime ownership defects before accepting closure:

1. **SG-017 Feedback coupling** — Feedback still changed a legacy review-status projection and directly sent email. Feedback is now record-only; edit authority remains independent and any future notification must be an independent Dispatch purpose.
2. **SG-018 Coverage/Vocabulary separation** — `CoverageTarget` existed but organizer writes/warnings/read displays still treated Theme target columns as authority. Coverage bounds, capability, migration reconciliation and first-party reads now use `CoverageTarget`; Theme bounds remain compatibility projections.

The corrected runtime gate passed before this decision was recorded.

# Historical unknowns

Accepted `legacy-unknown` conditions do not reopen closed gaps when the pre-retrofit system never retained the relevant history and the migration baseline explicitly prohibits fabrication.

Examples include prior overwritten Evaluation judgments, pre-cutover disclosure exposure, erased archive/reopen provenance, historical Vocabulary transitions, and old exact Dispatch message content.

Target-native prospective truth and current-state seeds retain explicit provenance, and supported interfaces do not claim unknown history as known fact.

# Compatibility decision

The 004-G rule remains authoritative:

> **Legacy semantic authority is retired; physical compatibility is intentionally retained.**

Retained aggregate columns, compatibility projections, and adapter-shaped routes do not constitute open semantic gaps because they cannot regain independent writer authority, semantic reads are the normal first-party path, and canonical→compatibility repair is one-way.

No destructive persistence cleanup is required by this exit gate.

# Rollback boundary

Phase 004 exit preserves these floors:

- canonical history-bearing writers cannot be disabled back to legacy writers;
- semantic-read rollback requires prior canonical→compatibility repair/parity checking;
- monotonic Withdrawal, Archive and Disclosure Reveal facts remain intact;
- exact Revision Evaluation, ArtifactVersion Assessment, Publication and Dispatch evidence remain intact;
- exact public-material authorization cannot fall back to mutable parent state;
- provider uncertainty cannot be erased by blind retry.

There is no supported return to the pre-retrofit authority model.

# Production-readiness boundary

This decision is **not** a production-release approval.

Live AWS/EFS qualification, dependency/security triage, real-provider integration/qualification, and other release-readiness work remain separate operational/product obligations documented in the [004-H residual-risk handoff](../../evidence/004-H-residual-risk-and-operational-handoff.md).

Those obligations do not change the 22/22 semantic/policy closure result unless new evidence contradicts the accepted model.

# Authorization after exit

The bounded runtime implementation authorization granted by 003-G has been consumed and closed by Phase 004.

004-H does **not** automatically authorize a new implementation phase or arbitrary cleanup/refactoring.

The next body of work must be deliberately planned from post-v0 operational qualification, security/dependency needs, provider/integration work, product backlog, or newly observed evidence.

If future implementation evidence contradicts an accepted concept, synchronization, policy, migration, or rollback-floor rule, amend the narrowest canonical owner intentionally rather than treating newer code as automatic design authority.