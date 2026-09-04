# 003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register

Status: **Complete**  
Concept model maturity: **v0 specified; implementation reconciliation in progress**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [002-G — Formal Specification Consolidation & Synchronization Handoff](002-G-formal-specification-consolidation-and-synchronization-handoff.md)

## 1. Purpose

003-A begins Phase 003 by mapping the existing MinneAnalytics implementation to the accepted 17-concept model and recording concrete semantic gaps **without changing product/domain code**.

Current normative reconciliation knowledge is owned by:

- [MinneAnalytics v0 Implementation Ownership Map](knowledge/reconciliation/minneanalytics-v0-implementation-ownership.md);
- [003-A Semantic Gap Baseline](knowledge/reconciliation/semantic-gap-baseline.md).

Detailed implementation evidence is preserved in:

- [003-A Implementation Surface Inventory](evidence/003-A-implementation-surface-inventory.md);
- [003-A Concept-to-Implementation Ownership Matrix](evidence/003-A-concept-to-implementation-ownership-matrix.md);
- [003-A Semantic Gap Register](evidence/003-A-semantic-gap-register.md).

The accepted concept-local specifications remain authoritative in the [Concept Catalog](knowledge/concepts/), and cross-concept behavior remains authoritative in the [v0 Synchronization & Composition Contract](knowledge/synchronizations/minneanalytics-v0.md).

---

## 2. Reconciliation rule

003-A applies one central rule:

> **Map semantic ownership before proposing physical decomposition.**

A table, route, helper, or view may legitimately participate in several concepts and policies. The reconciliation question is whether it preserves each owner's identity, state, history, invariants, and synchronization semantics—not whether the directory/table structure visually resembles the Concept Design graph.

Therefore 003-A does not classify a current aggregate as defective merely because it spans several concepts.

---

## 3. Method

The implementation was inspected through five lenses:

1. **Persistence** — Prisma models, fields, uniqueness, and current history representation.
2. **Commands** — routes that create/mutate state and the side effects they coordinate.
3. **Policies** — role/capability, availability, lifecycle, disclosure, and shareability gates.
4. **Projections** — aggregates, queues, heatmaps, capacity snapshots, public listings, and view models.
5. **Migration signals** — existing version/backfill logic and whether historical semantic detail is reconstructible.

Each of the 17 concepts was classified as strong, partial, conflicting, or derived-only relative to current implementation behavior.

---

## 4. Overall ownership result

The current codebase is **not concept-free** and does not require wholesale replacement.

It contains several strong or reusable implementation substrates:

- `Submission.id` as a likely durable Proposal reference;
- `SubmissionRevision` as a Revision-history substrate;
- `PresenterFeedback` as a Feedback record;
- `DeckFile` as Deliverable ArtifactVersion history;
- schedule room/slot/placement tables and manual move/swap behavior;
- email Batch/SendRecord persistence for Dispatch;
- stable Theme IDs usable as Vocabulary Term references;
- existing additive revision/scored-version backfill patterns.

The primary problem is **semantic overloading and overwritten history**, not lack of implementation structure.

---

## 5. `Submission` aggregate decision

003-A explicitly does **not** require decomposing `Submission` into one table per concept.

`Submission` currently spans:

- Proposal identity;
- current Revision projection;
- Selection + Withdrawal compatibility state;
- Deliverable readiness projection;
- current Classification relation;
- Publication eligibility inputs;
- Capacity accounting attributes;
- participant/contact/application data;
- deferred registration signal.

That physical aggregate can remain useful for compatibility, query shape, or transactional convenience **if later phases establish canonical owners beneath/alongside it**.

The critical requirement is that fields such as `programStatus`, `deckStatus`, and current theme joins can no longer be the only authority where the accepted design requires independent immutable histories.

---

## 6. `Conference` aggregate decision

`Conference` remains an application/context aggregate, not a recovered Concept Design concept.

Its current fields span:

- Availability Window inputs;
- Archive/general lifecycle;
- Capacity/Schedule configuration;
- Publication collection gating;
- Controlled Disclosure policy;
- application identity/timezone.

003-A retains the Phase 001/002 decision that this aggregation does not justify a broad `Conference` behavioral concept.

---

## 7. `Theme` aggregate decision

Current `Theme` rows can potentially remain a physical representation containing:

- Vocabulary current-term state;
- Coverage Target bounds.

However, those concerns have separate semantic owners. Current Classification remains in `SubmissionTheme` and historical theme sets in `SubmissionRevision.themeIds`.

Later design may retain physical co-location while introducing history/reference precision. One-table-per-concept is not assumed.

---

## 8. Highest-risk semantic findings

### 8.1 Evaluation history loss

The current Score uniqueness/upsert model is more serious than a simple “version freshness” mismatch.

One evaluator has one mutable Score row per Submission. When they score a later abstract version, the row's score/notes/version are updated in place. The former Evaluation of the earlier Revision can therefore be lost.

Canonical Evaluation instead attaches judgment to an exact Revision. The earlier Evaluation remains historically meaningful even when it is not current.

This is **SG-001** and a high-priority 003-B/003-F concern.

### 8.2 Selection and Withdrawal flattening

`programStatus` still collapses organizer Selection and originator Withdrawal.

Withdrawal writes `WITHDRAWN`; organizer program-status updates overwrite that field and clear `withdrawnAt`. Neither immutable Selection Decision history nor independent Withdrawal history is durably represented.

This yields **SG-002** and **SG-003**.

### 8.3 Capacity is currently advisory/derived

Current capacity logic calculates a snapshot from room/session configuration and current counts. It does not own durable Pool/Allocation/Release state and cannot enforce the Phase 002 hard allocation invariant before newly effective participation succeeds.

This is **SG-004**.

### 8.4 Controlled Disclosure has no durable reveal history

Blind-review masking exists, but identity reveal is console-logged and aggregate visibility is dynamically tied to current-score state.

The implementation cannot durably answer the canonical question:

`Was information I revealed to participant P in context C ever revealed?`

This is **SG-005**.

### 8.5 Exact historical Classification exists only as snapshots

Current `SubmissionTheme` joins describe the current Submission. Revision snapshots contain theme IDs, which is useful and likely makes much historical Classification backfillable, but there is no authoritative exact Revision↔Term relation.

This is **SG-006**.

### 8.6 Deliverable readiness is detached from artifact version

`DeckFile` provides useful version history, but `deckStatus` is one mutable field on Submission. A replacement upload resets it, while earlier assessment history is not retained against the exact file reviewed.

This is **SG-007**.

### 8.7 Public exposure is dynamic rather than exact-material state

Current public deck behavior combines an event-wide switch, latest deck file, current Selection status, current deck status, and mutable shareability.

There is no explicit Publication identity/state bound to exact material. A known historical `publicId` can also be authorized from current parent state even when the listing shows only the latest deck.

These are **SG-008** and **SG-009**.

### 8.8 Archive closure can be erased

Current Conference status can move away from `ARCHIVED` and clear `archivedAt`. Canonical Archive is monotonic retained closure; a future reopen requirement must preserve closure history rather than erase it.

This is **SG-010**.

### 8.9 Vocabulary history is not preserved

Theme IDs are promising TermRefs, but rename/removal/restoration are mutable row changes, and unused terms can be hard-deleted. Canonical Vocabulary requires retained identity and wording/availability history.

This is **SG-011**.

---

## 9. Medium-high reconciliation findings

The gap baseline also records:

- **SG-012** — duplicated current Revision projection on Submission versus immutable revision snapshots;
- **SG-013** — Availability Window authority split among timestamps, boolean override, broad Conference status, and asymmetric edit behavior;
- **SG-014** — schedule generator directly clearing/replacing planner placements;
- **SG-015** — Dispatch history missing exact rendered MessageRef;
- **SG-016** — same-round resend API option conflicting with persistence uniqueness;
- **SG-017** — Feedback route coupling directed response, edit-workflow state, and notification;
- **SG-018** — Coverage Target bounds and default warning policy mixed into Theme/Vocabulary implementation.

No additional Concept Design concepts are required to describe these gaps.

---

## 10. Policy findings

003-A keeps four important areas as policy reconciliation rather than concept discovery:

- **SG-P01 — Edit eligibility** — current status/review gates versus Availability Window + explicit exceptions + Archive/lifecycle composition.
- **SG-P02 — Authority** — current role/capability helpers remain an application policy implementation; no Authorization concept is introduced.
- **SG-P03 — Post-Archive operations** — broad ACTIVE-only gating must later distinguish ordinary mutation from deliberate post-event behavior.
- **SG-P04 — Publication sharing/rights** — mutable `deckShareable` is a publication-eligibility input whose authority/provenance need explicit policy.

---

## 11. Projection findings

Several existing implementation helpers are already close to the desired architecture **because they compute rather than own truth**:

- score currentness/aggregates/rescore queues;
- theme heatmaps and coverage warnings;
- current Capacity snapshot;
- combined dashboard/list item view models;
- public listings;
- recipient eligibility/already-sent views.

These should generally be retained as projections or compatibility surfaces, then rewired to canonical owners as those owners become precise.

This is preferable to promoting their output into new persisted workflow concepts.

---

## 12. Historical recoverability result

003-A distinguishes four migration classes.

### Strongly backfillable

Likely deterministic from existing state:

- initial/current Revision state;
- many historical Revision→Classification sets from snapshot `themeIds`;
- current concept/reference mapping from existing stable row IDs;
- current Selection disposition as a seed latest Decision;
- current public/latest artifacts as initial exposure candidates, subject to policy.

### Partially backfillable

Current state can seed the target but prior events are incomplete:

- Selection history;
- Withdrawal history that may have been overwritten;
- current Deliverable readiness Assessment;
- Archive closure after any previous reopen;
- Vocabulary prior rename/retire/restore sequence;
- Publication exposure intervals/material history.

### Forward-only detail

Must not be fabricated:

- overwritten prior Evaluation values;
- historical Controlled Disclosure reveals that were only console/UI state;
- prior exact Deliverable assessment events;
- historical exact rendered Dispatch messages not persisted.

### Policy-only

No data reconstruction by itself:

- edit-window exceptions;
- role/capability semantics;
- post-Archive allowed operations;
- share/rights authority.

This recoverability classification is an input to 003-B and 003-F, not a migration plan yet.

---

## 13. Refinement of the 002-G register

The 002-G register remains historical handoff evidence. 003-A refines it rather than rewriting it.

Material refinements include:

1. Revision-aware scoring is now explicitly identified as **historical Evaluation overwrite**, not merely a currentness-reference issue.
2. Controlled Disclosure is now explicitly identified as **missing durable reveal state**.
3. Vocabulary history receives its own high-priority gap.
4. Availability Window reconciliation now includes half-open boundary precision and the fact that edits and initial submissions currently use different eligibility paths.
5. every gap now carries likely recoverability and a later Phase 003 owner.

---

## 14. Implementation authorization

003-A authorizes **no product/domain code change**.

It establishes where the semantic mismatches are. 003-B must decide persistence, identity, history, and migration targets before any schema/domain refactor is justified.

Documentation/knowledge updates made by 003-A are therefore reconciliation metadata only.

---

## 15. Exit review

### Concept coverage

**PASS** — all 17 concepts have a current implementation mapping.

### Policy/projection coverage

**PASS** — major authority, availability, lifecycle, disclosure, coverage, work-queue, public-listing, and dispatch-recipient surfaces are classified.

### Semantic gap register

**PASS** — 18 prioritized semantic gaps and 4 cross-cutting policy gaps are recorded with stable IDs.

### Historical-loss identification

**PASS** — irrecoverable/partially recoverable history is distinguished from deterministically backfillable state.

### Anti-bias / physical architecture discipline

**PASS** — no one-table-per-concept or one-route-per-concept requirement was introduced.

### Runtime refactoring

**NOT AUTHORIZED** — target persistence/reference/history design remains open.

**003-A result: COMPLETE.**

---

## 16. Next — 003-B

Proceed to:

### **003-B — Persistence, Identity, History & Migration Target Design**

003-B should decide, without coding:

- which existing IDs become canonical Proposal/Revision/Term/Artifact/etc. references;
- which current tables/fields can remain physical aggregates;
- where new immutable history/state is required;
- whether compatibility projections such as `programStatus`, `abstractVersion`, current themes, and `deckStatus` remain during migration;
- how exact Revision Evaluation/Classification, Capacity allocations, Deliverable assessments, Publication identities, Dispatch MessageRefs, Vocabulary history, Controlled Disclosure records, and Archive provenance should be persisted;
- what can be backfilled versus initialized only prospectively;
- what schema changes are reversible and migration-safe.
