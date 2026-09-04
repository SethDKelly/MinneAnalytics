# 003-G — Implementation Reconciliation Consolidation & Execution Handoff

Status: **Complete**  
Concept model maturity: **v0 specified; implementation reconciliation complete; bounded implementation execution authorized**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [003-F — Data Migration, Backfill, Rollout & Reversibility Plan](003-F-data-migration-backfill-rollout-and-reversibility-plan.md)

## 1. Purpose

003-G consolidates Phase 003 into one implementation-ready architecture and determines whether runtime/schema implementation may begin.

It does **not** perform runtime implementation.

Current normative handoff authority is owned by:

- [003-G Implementation Reconciliation Gate](knowledge/decisions/003-g-implementation-reconciliation-gate.md);
- [v0 Implementation Execution Handoff](knowledge/reconciliation/implementation-execution-handoff.md);
- [v0 Implementation Closure & Evidence Baseline](knowledge/reconciliation/implementation-closure-evidence-baseline.md).

Historical audit evidence is preserved in:

- [003-G Reconciliation Conformance & Closure Matrix](evidence/003-G-reconciliation-conformance-and-closure-matrix.md);
- [003-G Implementation Work Package & Dependency Matrix](evidence/003-G-implementation-work-package-and-dependency-matrix.md).

---

## 2. Gate question

Phase 003 entered with a formally specified 17-concept model but an implementation that collapsed several independent histories and policies into mutable aggregate fields.

003-G asks:

> **Is the target implementation architecture now specific, internally consistent, migratable, reversible, and evidence-governed enough to authorize bounded runtime implementation without reopening concept discovery?**

The answer is **yes**, with implementation constrained by the canonical execution handoff and migration gates.

---

## 3. Cross-phase conformance result

### 003-A — ownership and semantic gaps

**Pass.**

All 17 concepts have explicit current implementation mappings. Eighteen semantic gaps (`SG-001` through `SG-018`) and four cross-cutting policy gaps (`SG-P01` through `SG-P04`) have stable identifiers.

The phase correctly distinguished semantic ownership from physical table/module decomposition.

### 003-B — persistence, identity and history

**Pass.**

Every structural gap has:

- a retained or new stable reference strategy;
- an authoritative history/current-state target;
- a compatibility posture;
- a recoverability classification.

Existing identities are reused where semantically sound. New durable records are required only where current mutable state cannot preserve accepted history.

### 003-C — synchronization and failure behavior

**Pass.**

Cross-concept execution has explicit transaction classes:

- atomic authoritative entry;
- source-authoritative action plus convergent follow-up;
- independent external consequence;
- non-transactional resource/provider boundary.

Idempotency, expected-head checks, durable synchronization work, provider uncertainty, and compatibility projection direction are defined.

### 003-D — authority and operational policy

**Pass.**

Action-oriented capabilities, setup/live/Archive policy, Availability Window/manual suspension, revision exceptions, Controlled Disclosure, public-sharing provenance, exact Publication eligibility, post-Archive behavior, and public-token authorization are defined.

No generic Authorization, Workflow, Consent, or ApplicationLifecycle concept is needed.

### 003-E — API/UI and compatibility

**Pass.**

Interface state is classified as canonical fact, derived application view, compatibility projection, or transient execution state.

Compound legacy status fields are explicitly transitional. Mutation boundaries are action-oriented. Read/UI compatibility is additive and temporary.

### 003-F — migration and reversibility

**Pass.**

The target has:

- F0–F9 migration order;
- checked-in migration-discipline requirement;
- truthful backfill rules;
- provenance classes;
- quarantine/blocking semantics;
- semantic write/read cutover waves;
- rollback classes and rollback floors;
- destructive cleanup gates.

---

## 4. Contradiction audit

003-G found no unresolved contradiction requiring a concept/specification redesign.

The following potentially conflicting areas are explicitly reconciled:

### 4.1 Selection vs Withdrawal

Selection remains an independent organizer decision history. Withdrawal remains an independent originator-authoritative fact. Effective participation is derived.

No `ProgramStatus` lifecycle is reintroduced.

### 4.2 Revision vs operational Proposal identity

Evaluation and Classification use exact Revision identity. Selection, Withdrawal, Capacity, Deliverable responsibility and Schedule participation use durable Proposal identity.

Content changes therefore do not churn operational participation identity.

### 4.3 Capacity vs Coverage

Capacity is a hard finite-resource invariant. Coverage Target is advisory representation intent.

Migration may not silently enlarge Capacity or convert sponsor target ranges into class-specific capacity rates without new evidence.

### 4.4 Deliverable readiness vs Publication

Readiness is exact ArtifactVersion assessment. Sharing eligibility is application policy. Publication is intentional exposure of exact material.

None substitutes for another.

### 4.5 Archive vs broader lifecycle

Archive remains monotonic retained closure. Compatibility setup/live mode may continue for operational policy, but ordinary unarchive is not target behavior.

### 4.6 Controlled Disclosure vs authorization

Disclosure owns exposure history. Capabilities and review access determine whether reveal actions may be invoked. Concealment is not a generic ACL.

### 4.7 Compatibility vs authority

After canonical write cutover, compatibility is one-way `canonical -> compatibility`. Read rollback may use compatibility; independent legacy authority may not be re-enabled after native canonical history exists.

### 4.8 Migration unknowns vs historical truth

Legacy unknowns are not treated as defects when the original system never persisted the evidence. They are explicitly classified and do not receive fabricated event histories.

---

## 5. Implementation authorization decision

003-G authorizes **bounded implementation execution** beginning with Phase 004.

This authorization is not permission for unconstrained refactoring.

Implementation must:

1. follow the accepted work-package dependency order;
2. preserve the canonical concept/synchronization/policy boundaries;
3. use expand-first migrations;
4. maintain truthful migration provenance;
5. keep compatibility one-directional after write cutover;
6. preserve rollback floors;
7. close gaps only through runtime evidence;
8. defer destructive cleanup until the explicit removal gate passes.

If implementation evidence reveals a contradiction in the accepted design, stop the affected slice and return to the narrowest canonical owner for amendment. Do not silently redefine semantics in code.

---

## 6. Branch handoff

The current branch represents the complete v0 discovery/specification/reconciliation baseline.

Preferred execution discipline:

- preserve the 003-G gate commit as the immutable design/reconciliation baseline;
- begin Phase 004 runtime work from that commit on a dedicated implementation branch, recommended name `concept-design/v0-implementation`;
- merge or compare implementation work against the baseline rather than rewriting the historical Phase 001–003 record.

Branch naming is repository workflow, not design authority; the important rule is preserving a stable reconciliation baseline before runtime changes begin.

---

## 7. Phase 004 implementation work packages

Phase 004 is **v0 Implementation Execution & Migration**.

The accepted subdivision is:

### 004-A — Migration Discipline, Baseline & Additive Schema Foundation

Covers F0/F1.

Primary outcomes:

- checked-in Prisma migration baseline and deploy discipline;
- backup/restore rehearsal support;
- migration/backfill run reporting infrastructure;
- feature/configuration gates;
- additive target schema and migration provenance support;
- no semantic authority cutover yet.

### 004-B — Revision, Classification, Evaluation & Feedback Canonicalization

Covers F2 and F5-W1.

Primary outcomes:

- exact current/predecessor Revision references;
- exact Revision↔Term Classification;
- Evaluation uniqueness by evaluator + exact Revision;
- exact abstract Feedback reference;
- current Submission/version/theme compatibility projections;
- backfill and parity evidence.

This package addresses the highest immediate history-loss risk: Evaluation overwrite.

### 004-C — Selection, Withdrawal, Capacity & Deliverable Canonicalization

Covers relevant F3 backfills and F5-W2.

Primary outcomes:

- immutable Selection Decision history;
- independent Withdrawal;
- finite Capacity Pool/Allocation/Release;
- Deliverable Requirement + exact ArtifactVersion Assessment;
- TX-A effective-participation entry;
- TX-B participation-exit cleanup;
- `programStatus` and `deckStatus` become compatibility projections.

### 004-D — Availability, Archive, Authority & Disclosure Policy Implementation

Covers remaining relevant F3 state and F5-W3/W4.

Primary outcomes:

- canonical Availability Window and suspension policy;
- action-oriented capability checks;
- monotonic Archive closure;
- explicit revision exception/edit eligibility;
- native Controlled Disclosure staging/reveal;
- legacy in-flight review cohort handling;
- blind-review transition locking.

### 004-E — Publication, Public Access, Schedule & Dispatch Hardening

Covers F5-W5/W6/W7.

Primary outcomes:

- sharing-policy provenance;
- exact MaterialRef Publication and states;
- exact public-token authorization hardening;
- Schedule generation proposal + expected-base apply;
- exact Dispatch message/provider-attempt semantics;
- same-round idempotency/new-round repeat behavior.

Exact public authorization is a security rollback floor.

### 004-F — Semantic Read Models, API/UI Cutover & Compatibility Retirement

Covers F6/F7/F8 for first-party surfaces.

Primary outcomes:

- shadow semantic read comparisons;
- machine-readable error reason codes;
- reviewer/presenter/organizer/public semantic views;
- explicit disclosure state;
- action-oriented first-party mutation surfaces;
- legacy endpoints reduced to narrow adapters where still supported;
- first-party raw compatibility writes eliminated.

### 004-G — Migration Validation, Rollback Rehearsal & Legacy Cleanup Gate

Covers cross-slice runtime validation and F9 eligibility.

Primary outcomes:

- complete invariant/scenario/parity evidence;
- zero unexplained defects for supported scope;
- backup/restore rehearsal evidence;
- projection repair and durable-work recovery tests;
- legacy consumer inventory closure;
- explicit decision for each destructive cleanup candidate;
- legacy-unknown cohort terminal dispositions.

Destructive removal is performed only where the gate passes; retainable projections may remain.

### 004-H — Phase 004 Consolidation & v0 Implementation Exit Review

Final implementation audit.

Primary outcomes:

- close or explicitly defer every SG/SG-P item with evidence;
- verify no competing legacy writer remains in supported scope;
- verify rollback floors remain enforced;
- reconcile implementation docs/API/UI with canonical knowledge;
- decide readiness for the next product/operational phase.

---

## 8. Dependency rules

The work packages are ordered by semantic dependency, not convenience.

Hard dependencies:

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

Parallel implementation inside a package is allowed where invariants permit it, but no later package may assume a prior semantic slice is authoritative before its own cutover gate passes.

In particular:

- UI cutover cannot precede canonical writes for its slice;
- Publication cutover cannot authorize public access without exact material identity;
- Selection write cutover cannot precede valid Capacity state;
- Evaluation exact-subject cutover cannot precede exact Revision identity;
- destructive cleanup cannot precede consumer and rollback gates.

---

## 9. Gap closure lifecycle

Phase 003 finishes with all 22 gaps **target-designed and execution-planned**, but not implemented.

During Phase 004 each gap is reported with project-governance state:

1. `target-designed`;
2. `implementation-in-progress`;
3. `canonical-write-active` where applicable;
4. `semantic-read-active` where applicable;
5. `legacy-authority-disabled`;
6. `verified-closed`.

A gap may also retain `legacy-unknown` evidence without preventing closure if the accepted migration baseline explicitly permits native history to begin at cutover.

These are implementation governance states, not product/domain concepts.

A gap becomes `verified-closed` only when the closure baseline requirements are satisfied.

---

## 10. Required implementation evidence

Every Phase 004 package must leave reviewable evidence appropriate to its scope, including:

- committed schema migration artifacts where schema changes occur;
- idempotent backfill tooling where data migration occurs;
- pre/post invariant report;
- migration provenance/quarantine report;
- unit/integration/scenario tests;
- semantic-vs-compatibility parity report where reads coexist;
- consumer/write-path inventory update;
- rollback/disable procedure;
- documentation/OKF cross-reference updates where implementation decisions refine realization.

The implementation evidence is not a fourth normative design layer. Canonical semantics remain in the concept/synchronization/reconciliation nodes.

---

## 11. Runtime closure rules for high-risk gaps

### SG-001 — Evaluation history

Cannot close until recording an Evaluation for Revision R2 demonstrably preserves the Evaluation for R1.

### SG-002 / SG-003 — Selection / Withdrawal

Cannot close until Selection history is independently durable, Withdrawal cannot be overwritten/cleared by organizer decisions, and legacy `programStatus` is no longer an independent writer.

### SG-004 — Capacity

Cannot close until authoritative Allocation state prevents over-capacity effective participation under concurrency.

### SG-005 — Controlled Disclosure

Cannot close until native reveal is durable/monotonic and protected reads consume explicit disclosure state.

### SG-007 — Deliverable readiness

Cannot close until readiness is exact ArtifactVersion-specific and replacement artifacts do not inherit prior readiness.

### SG-008 / SG-009 — Publication/public access

Cannot close until exact Publication state drives listing and public-token resolution; historical material is not authorized from mutable parent state.

### SG-010 — Archive

Cannot close until closure cannot be erased by routine status mutation.

### SG-014 — Schedule generation

Cannot close until generation is non-authoritative until expected-base acceptance.

### SG-015 / SG-016 — Dispatch

Cannot close until new sends preserve exact message evidence and same-round retries cannot create a second semantic send.

---

## 12. Explicit non-goals for execution

The implementation handoff does not require:

- one table/service/module per concept;
- global event sourcing;
- CQRS infrastructure;
- Kafka/message broker adoption;
- a distributed workflow engine;
- database-engine replacement;
- one endpoint per concept;
- removal of all denormalized/current projection fields;
- migration of history that was never persisted.

The current Next.js + Prisma + SQLite architecture may evolve incrementally while preserving the accepted semantics.

---

## 13. Phase 003 exit review

| Exit criterion | Result |
|---|---|
| all 17 concepts mapped to target implementation semantics | **PASS** |
| all 18 semantic gaps have structural/execution/interface/migration paths | **PASS** |
| all 4 policy gaps have policy/interface/migration paths | **PASS** |
| transaction/idempotency/recovery model defined | **PASS** |
| migration provenance and no-fabrication rules defined | **PASS** |
| compatibility write/read cutover strategy defined | **PASS** |
| security rollback floors defined | **PASS** |
| destructive cleanup gated | **PASS** |
| implementation evidence/closure rules defined | **PASS** |
| unresolved contradiction requiring new concept discovery | **NONE** |
| runtime implementation authorization | **AUTHORIZED — bounded by Phase 004 packages and gates** |

**Phase 003 passes and is complete.**

---

## 14. Handoff

The Concept Design retrofit has now progressed from discovery through formal specification to an implementation-safe reconciliation architecture.

The next activity is **Phase 004 — v0 Implementation Execution & Migration**, beginning with:

> **004-A — Migration Discipline, Baseline & Additive Schema Foundation**

Runtime changes may begin in 004-A, but only within the accepted execution package and migration safety rules. Later semantic cutovers remain gated by their package prerequisites and evidence.