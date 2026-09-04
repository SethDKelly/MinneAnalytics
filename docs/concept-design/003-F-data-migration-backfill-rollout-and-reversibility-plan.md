# 003-F — Data Migration, Backfill, Rollout & Reversibility Plan

Status: **Complete**  
Concept model maturity: **v0 specified; implementation reconciliation migration plan complete**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [003-E — Derived Views, API/UI State & Compatibility Reconciliation](003-E-derived-views-api-ui-state-and-compatibility-reconciliation.md)

## 1. Purpose

003-F converts the accepted Phase 003 target architecture into an executable migration and rollout sequence.

It does **not** modify Prisma, application code, APIs, UI, deployment configuration, or live data.

Current normative migration authority is owned by:

- [v0 Migration, Backfill & Rollout Execution Plan](knowledge/reconciliation/migration-rollout-execution-plan.md);
- [v0 Backfill, Validation & Reversibility Baseline](knowledge/reconciliation/backfill-validation-reversibility-baseline.md).

Historical planning evidence is preserved in:

- [003-F Migration Wave & Cutover Matrix](evidence/003-F-migration-wave-and-cutover-matrix.md);
- [003-F Backfill Provenance, Validation & Rollback Matrix](evidence/003-F-backfill-provenance-validation-and-rollback-matrix.md).

---

## 2. Entry question

003-B established what must persist. 003-C established transaction/recovery rules. 003-D established action policy. 003-E established the semantic interface and compatibility boundary.

003-F asks:

> **In what order can the existing application acquire that target state, preserve only truthful legacy evidence, move authority safely, verify behavior, and still recover from rollout failure without deleting newly captured history?**

---

## 3. Current migration-tooling finding

The repository currently uses Prisma 6.9 with SQLite. `package.json` exposes `db:push: prisma db push`, and the checked-in `prisma/` tree has no `prisma/migrations` history. A development SQLite database is also present at `prisma/prisma/dev.db`.

This is sufficient for prototype iteration but not for the target migration/reversibility discipline.

003-F therefore requires execution work to establish:

- checked-in Prisma migration history;
- `prisma migrate deploy` or equivalent controlled deployment semantics;
- separately versioned idempotent backfill scripts;
- backup + actual restore rehearsal;
- machine-readable migration validation reports.

`db push` may remain useful for disposable local environments, but it cannot remain the migration authority for persistent environments.

The checked-in development database must not be treated as a deployment/migration baseline. If retained, it is a deliberate fixture/demo artifact only.

---

## 4. Migration shape accepted

The accepted migration shape is:

```text
F0  Migration discipline + baseline capture
 ↓
F1  Additive target schema
 ↓
F2  Exact history/reference backfills
 ↓
F3  Current-state seeds
 ↓
F4  Validation + quarantine
 ↓
F5  Canonical write cutover by semantic slice
 ↓
F6  Shadow semantic reads
 ↓
F7  First-party read/UI cutover
 ↓
F8  Legacy mutation retirement
 ↓
F9  Optional destructive cleanup after removal gate
```

This sequence rejects both a big-bang rewrite and indefinite dual authority.

---

## 5. F0 — migration discipline before semantic migration

Before target schema work reaches a persistent environment, implementation must establish a controlled schema baseline and restore story.

Required execution prerequisites:

1. create committed migration history for the current accepted schema;
2. define migration/backfill entrypoints;
3. snapshot current per-Conference counts and invariants;
4. rehearse on a production-shaped clone where available;
5. capture a restorable database snapshot and prove restore;
6. inventory all consumers from 003-E;
7. establish bounded feature/configuration gates for individual migration slices;
8. distinguish application/schema version from data-backfill version.

A backup is not considered sufficient merely because a file was copied. Restore must be demonstrated in an isolated environment.

---

## 6. F1 — additive schema expansion

The first target schema change is additive.

It may add nullable references, new tables, indexes, history records, migration provenance, and durable-work infrastructure while leaving legacy application behavior operational.

Target additions include the 003-B requirements for:

- exact Revision/current/predecessor references;
- exact Evaluation/Feedback Revision references;
- exact Revision Classification;
- Availability Window;
- Selection Decisions;
- Withdrawal;
- Capacity Pool/Allocation;
- Coverage Target;
- TermState;
- Deliverable Requirement/Assessment;
- Controlled Disclosure;
- Publication history;
- Archive closure;
- exact Dispatch message/attempt evidence;
- synchronization work state required by 003-C.

No legacy status/compatibility field is removed in this wave.

---

## 7. F2 — exact reference/history backfill first

The migration deliberately resolves exact content identity before business-state seeds.

### 7.1 Revision

Where a `SubmissionRevision` matching `Submission.abstractVersion` exists, reuse that exact Revision identity.

Where it does not, the migration may create a **backfilled-current-state baseline Revision** from the durable current Submission content. That record establishes a truthful cutover baseline only; it must not claim an unknown presenter actor, historical event time, or predecessor chain.

This is preferable to either blocking every imperfect historical dataset forever or fabricating a full Revision history.

### 7.2 Classification

Existing revision `themeIds` are used as historical evidence for exact Revision↔Term relations when IDs resolve to stable Themes.

Missing Term IDs are defects requiring explicit treatment; they cannot simply disappear from a migration report.

### 7.3 Evaluation

A surviving Score can become an exact Evaluation only when its version marker maps unambiguously to one Revision.

If not, the legacy Score remains available through compatibility paths but is classified as ambiguous for exact-subject migration.

No prior overwritten Evaluation is reconstructed.

### 7.4 Feedback

ABSTRACT Feedback maps to exact Revision where its stored version can be resolved. GENERAL Feedback remains Proposal/context-level when no exact content state was intended.

---

## 8. F3 — current-state seeds without invented history

The second backfill class seeds current truth that legacy data can support but does not pretend to reconstruct the path by which that state arose.

### Selection and Withdrawal

Legacy `programStatus` is decomposed according to the 003-B rules. `PENDING` produces no invented Clear event. `WITHDRAWN` produces Withdrawal, and prior selected state is recovered only where surviving evidence such as `approvedAt` actually supports it.

### Capacity

The initial Pool is operator-validated from the accepted schedule-capacity configuration. Current code computes the available program count from rooms × sessions per room minus configured trims; sponsor min/max remain representation planning rather than alternate unit rates.

One-unit Allocations are seeded for migrated effective participants.

If commitments exceed the accepted Pool, migration stops for that slice. The migration must never silently increase Capacity to fit existing data.

### Deliverable

Selected/effectively participating legacy Proposals receive the applicable deck Requirement.

The latest artifact maps as follows:

- APPROVED → `ready` current-state Assessment;
- CONCERN → `concern` current-state Assessment;
- SUBMITTED → awaiting-review with no final Assessment;
- REVIEWED → unsupported legacy residue, not a fabricated canonical state.

### Vocabulary / Coverage

Current Theme name/availability becomes one current-state TermState. Historical labels are not invented.

Nonzero coherent target bounds can become Coverage Targets. Legacy `0/0` normally means no explicit target.

### Availability

Only valid bounded intervals are migrated as canonical Windows. Missing bounds require operator normalization; no extreme/sentinel dates are created.

### Archive

Current archived contexts receive current-state Archive seeds from surviving evidence. Migration observation time is not substituted for unknown historical archive time.

### Publication

Only the exact latest material that is actually exposed under current legacy behavior at cutover may receive a current-state Publication seed.

The migration cannot infer what earlier DeckFile was exposed when the event-wide publish flag was first enabled.

### Controlled Disclosure

Existing reviewer relationships are the most important no-fabrication case.

Because identity reveals were not durably recorded, existing protected review relationships are placed into a **legacy in-flight cohort** whose prior exposure remains unknown.

Native disclosure history begins for new review relationships and new exact-Revision aggregate disclosures after cutover.

### Dispatch

Old SendRecord recipient/send evidence is retained. Exact old message content remains unknown where only mutable template references exist.

---

## 9. F4 — quarantine and blocking rules

003-F distinguishes:

- `PASS`;
- expected legacy unknown;
- operator normalization required;
- blocking defect.

This distinction prevents two opposite failures:

1. forcing fabricated data merely to make a target column complete; and
2. allowing an unsafe record to pass merely because legacy data is imperfect.

Examples of blocking conditions include:

- no exact current Revision for an active Proposal;
- broken/cyclic Revision chain;
- active missing-Term Classification;
- Capacity over-allocation;
- inability to establish exact current public material safely;
- inability to enforce semantic uniqueness/idempotency.

Examples of expected unknowns that may be compatible include:

- overwritten old Evaluations;
- unknown past identity reveals;
- unknown old rendered Dispatch messages;
- erased old Selection transitions;
- legacy `REVIEWED` deck residue.

---

## 10. Canonical write cutover order

The accepted order is semantic rather than table-oriented.

### W1 — Revision / Classification / Evaluation / Feedback references

This goes first because legacy rescoring currently risks destroying exact prior Evaluation meaning.

### W2 — Selection / Withdrawal / Capacity / Deliverable

This activates atomic selected-entry and convergent participation-exit semantics.

### W3 — Availability / Archive / action lifecycle policy

This moves routes away from broad ACTIVE/status authority toward explicit policy.

### W4 — Controlled Disclosure

Native staging/reveal begins for the safe post-cutover scope while the legacy exposure-unknown cohort stays explicit.

### W5 — Sharing / Publication / public resolver

Exact MaterialRef Publication becomes authoritative. Public token access hardening occurs at or before this cutover.

### W6 — Schedule proposal/apply

Generator output stops directly owning the Schedule.

### W7 — Dispatch

New sends capture exact message evidence, semantic-round idempotency, and provider uncertainty.

---

## 11. Write authority before read authority

A major 003-F rule is:

> **Do not cut a user-facing read to canonical state before the application is reliably maintaining that canonical state.**

After a semantic write slice is enabled, existing UI may still read compatibility projections while the target state is shadow-compared.

This reduces risk without returning to bidirectional authority.

---

## 12. Shadow parity

Shadow comparison does not demand raw-field equality.

Differences are classified as:

- equal projection;
- intentional semantic/security correction;
- accepted legacy unknown;
- defect.

The recommended gate for the current scale is **zero unexplained defects in the in-scope records**, rather than accepting a statistical error threshold.

Particular attention is required for:

- programStatus projection;
- current Revision/current Submission parity;
- current Classification/current SubmissionTheme parity;
- Evaluation work queues;
- Deliverable readiness;
- Capacity ledger;
- public listing/file resolution;
- Archive/context views.

---

## 13. First-party consumer cutover order

The accepted read/UI migration order prioritizes high-consequence correctness:

1. public listing and public file resolver;
2. reviewer disclosure and exact Evaluation queues;
3. presenter portal;
4. organizer program/Capacity/Coverage/Deliverable surfaces;
5. sharing/Publication controls;
6. Schedule proposal/apply;
7. communications/Dispatch;
8. historical/export projections.

The existing UI does not need to be redesigned all at once.

---

## 14. Legacy adapters

Legacy mutation routes may temporarily adapt old requests where the mapping is unambiguous.

Examples:

- APPROVED → Selection(selected);
- BACKUP → Selection(reserve);
- DECLINED → Selection(not-selected).

But `WITHDRAWN` must stop being an organizer-controlled program-status mutation.

Likewise:

- `abstractReviewStatus` cannot remain a target-native command authority;
- `REVIEWED` cannot be manufactured as a native Deliverable Assessment;
- `submissionsOpen=true` cannot override a closed Window;
- Conference status cannot erase Archive;
- `decksPublished` cannot authorize an individual file.

---

## 15. Rollback model

003-F rejects the idea that every migration has a single "roll back to old code" operation.

### Before native canonical writes

A conventional application rollback is still possible. Additive tables can remain unused.

### After canonical writes begin

The safe rollback is often:

```text
semantic writes continue
      ↓
compatibility projections continue
      ↓
old read/UI temporarily restored
```

It is **not**:

```text
turn canonical writes off
      ↓
restore raw legacy independent writers
      ↓
last writer wins
```

Once target-native history exists, returning to independent mutable legacy authority may destroy or contradict that history.

Where no safe adapter exists, maintenance/read-only mode is safer than authority regression.

---

## 16. Rollback floors

The following cannot be undone merely to make old code work again:

- native Withdrawal truth;
- Archive closure history;
- Controlled Disclosure Reveal;
- exact Revision-specific Evaluation history;
- Capacity allocation/release history;
- exact ArtifactVersion Assessments;
- exact Publication history;
- exact new Dispatch messages/outcome uncertainty;
- public resolver hardening that prevents arbitrary historical DeckFile authorization.

These are either actor/history truth or security/correctness boundaries.

---

## 17. Destructive cleanup

No destructive schema cleanup is included in the initial semantic cutover.

A later removal requires:

- target state coverage;
- zero first-party writer dependence;
- read-consumer inventory completion;
- legacy unknown terminal policy;
- zero unexplained parity defects;
- tested projection repair;
- tested backup/restore;
- a rollback/forward-fix story that preserves target history.

003-F explicitly distinguishes removal of **competing authority** from removal of every denormalized field.

For example, `abstractVersion`, current Submission content, and a current Classification mirror may remain useful projections indefinitely if they are repairable and never independently authoritative.

---

## 18. Required implementation evidence

Future runtime implementation should produce per slice:

- committed Prisma migration;
- idempotent backfill script;
- migration run manifest;
- invariant report;
- shadow/parity report;
- consumer inventory update;
- rollback/disable procedure;
- tests for semantic and compatibility behavior;
- list of legacy-unknown/quarantined records.

This gives Phase 003-G a concrete basis for execution handoff rather than a vague "refactor the schema" instruction.

---

## 19. Exit review

003-F passes because it now defines:

- production-safe migration discipline;
- additive schema expansion order;
- exact-reference backfill before current-state seeds;
- per-area provenance/no-fabrication handling;
- quarantine and blocking rules;
- canonical write-cutover order;
- shadow/read cutover order;
- compatibility adapter/retirement behavior;
- rollback classes and rollback floors;
- destructive cleanup gates;
- required migration evidence.

### Runtime implementation authorization

**Not yet granted.**

003-F is still design/reconciliation work. Phase 003-G must consolidate the full implementation-reconciliation architecture, confirm no contradictions or missing execution dependencies remain, define logical implementation slices, and issue the explicit execution handoff.

---

## 20. Next phase

Proceed to:

**003-G — Implementation Reconciliation Consolidation & Execution Handoff**

003-G should consolidate 003-A through 003-F into the implementation authority package, resolve any remaining cross-phase inconsistencies, establish implementation order/slice dependencies, define verification/closure reporting, and decide whether the repository is ready to begin runtime changes.