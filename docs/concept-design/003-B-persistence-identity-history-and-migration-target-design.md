# 003-B — Persistence, Identity, History & Migration Target Design

Status: **Complete**  
Concept model maturity: **v0 specified; target persistence architecture defined; transaction/policy/compatibility execution design next**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register](003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md)

## 1. Purpose

003-B converts the semantic ownership/gap findings from 003-A into a concrete **target persistence and migration design** without changing product code or the Prisma schema.

Current normative target knowledge is owned by:

- [MinneAnalytics v0 Persistence, Identity & History Target](knowledge/reconciliation/persistence-identity-history-target.md);
- [MinneAnalytics v0 Migration Target Baseline](knowledge/reconciliation/migration-target-baseline.md).

Detailed audit evidence is preserved in:

- [003-B Persistence, Identity & History Target Matrix](evidence/003-B-persistence-identity-history-target-matrix.md);
- [003-B Backfill, Compatibility & Reversibility Matrix](evidence/003-B-backfill-compatibility-and-reversibility-matrix.md).

The accepted concept semantics remain owned by the [Concept Catalog](knowledge/concepts/), and cross-concept rules remain owned by the [v0 Synchronization & Composition Contract](knowledge/synchronizations/minneanalytics-v0.md).

---

## 2. Entry question

003-A established that the current implementation has reusable substrates but loses or conflates several independent histories.

003-B asks:

> **What persistent identities and histories must exist so the accepted concept model can be realized without needlessly replacing working implementation structures?**

This is a target architecture question, not a schema-coding step.

---

## 3. Design method

Each structural gap was reviewed through five tests:

1. **Identity fit** — does an existing row ID already identify the accepted semantic object?
2. **History fit** — can the current representation preserve every history the concept requires?
3. **Reference precision** — can neighboring concepts reference the exact state they mean rather than a mutable aggregate/version number?
4. **Compatibility cost** — can the existing API/UI/query shape remain temporarily as a derived projection?
5. **Migration honesty** — can historical state be reconstructed, or must it begin prospectively?

The preferred order is:

```text
reuse exact identity
        ↓
add missing exact reference/history
        ↓
retain compatibility projection
        ↓
verify / cut authority over later
```

not:

```text
concept name
   ↓
new table with same name
```

---

## 4. Stable identity decisions

003-B accepts several existing IDs as the target implementation references.

### Reused directly

- `Submission.id` → ProposalRef;
- `SubmissionRevision.id` → RevisionRef;
- `Score.id` → EvaluationRef;
- `PresenterFeedback.id` → FeedbackRef;
- `Theme.id` → TermRef;
- `DeckFile.id` → ArtifactVersionRef and current deck MaterialRef;
- existing Schedule room/slot/placement IDs;
- `ConferenceEmailBatch.id` and `EmailSendRecord.id` for Dispatch;
- `ReviewerAccess.id` as the current participant/evaluator/actor reference where that implementation identity is appropriate.

Renaming those models is not required for correctness.

### Why this matters

The target architecture therefore **does not create parallel Proposal, Revision, Evaluation, Feedback, Term, ArtifactVersion, Schedule, or Dispatch identity systems merely for conceptual symmetry**.

That substantially reduces migration risk.

---

## 5. New durable identities justified

New persistence is required only where the current model has no row capable of preserving the accepted state/history:

- Availability Window;
- Controlled Disclosure relation;
- Selection Decision history;
- Withdrawal;
- Capacity Pool/Allocation;
- Coverage Target;
- Vocabulary TermState history;
- Deliverable Requirement and Assessment;
- Publication and PublicationState;
- Archive closure.

These are justified additions because the current mutable aggregate can otherwise erase or fail to represent accepted semantic truth.

---

## 6. Revision becomes the exact version anchor

The most important reference decision is to stop using an integer abstract version as the primary cross-concept historical identity.

Target:

```text
Submission / Proposal
    │
    └── currentRevisionId ───────────────┐
                                         ↓
SubmissionRevision R1 ← predecessor ← SubmissionRevision R2
       ↑                                      ↑
       │                                      │
 Evaluation / Classification             Evaluation / Classification
```

`SubmissionRevision.id` becomes the exact anchor for:

- Evaluation subject;
- Classification subject;
- abstract Feedback subject;
- current Revision reference.

Existing `version`/`abstractVersion` remain useful ordinals and compatibility fields but no longer need to carry exact identity by themselves.

Existing revision rows can deterministically acquire predecessor relationships from their per-Submission version ordering.

---

## 7. Evaluation target

003-A identified SG-001 as actual judgment-history loss: one Score row is moved to the newest abstract version.

003-B does **not** require replacing Score with another table.

Instead:

```text
Score.id = EvaluationRef
Score.submissionRevisionId = exact subject
unique(reviewerAccessId, submissionRevisionId)
```

A reviewer changing their judgment about the **same Revision** updates the same Evaluation, as the concept permits.

A reviewer evaluating a **different Revision** creates another row, preserving the earlier Evaluation.

Existing `submissionId` and `scoredAbstractVersion` can remain transitional query/backfill fields.

---

## 8. Selection and Withdrawal target

The current combined `ProgramStatus` cannot remain canonical.

### Selection

Add immutable Decision records with:

- selection context;
- Proposal ID;
- selected/reserve/not-selected/clear outcome;
- actor/time;
- predecessor.

### Withdrawal

Add one immutable originator Withdrawal record per current v0 Proposal participation.

### Compatibility projection

During migration:

```text
if Withdrawal exists:
    programStatus = WITHDRAWN
else if Selection = selected:
    programStatus = APPROVED
else if Selection = reserve:
    programStatus = BACKUP
else if Selection = notSelected:
    programStatus = DECLINED
else:
    programStatus = PENDING
```

`ProgramStatus` may remain for compatibility, but it becomes a projection rather than an authority.

---

## 9. Capacity target and sponsor correction

A durable Capacity realization needs:

- Pool;
- finite limit;
- class-rate configuration;
- Allocation with applied units;
- Release provenance.

The current `computeCapacity` snapshot remains useful as configuration/planning logic but is not the ledger.

003-B makes one important correction to a tempting mapping:

> **Current sponsor min/max values should not become Capacity class rates merely because sponsor sessions are a named class.**

Current behavior treats sponsor/community numbers as desired composition/count planning; it does not show that a sponsor session consumes more or fewer scarce units than another session.

Therefore the initial Capacity model should use a standard one-unit commitment unless evidence later establishes differentiated consumption.

Sponsor min/max is instead a candidate session-kind [Coverage Target](knowledge/concepts/coverage-target.md) or planning-policy input.

---

## 10. Availability Window target

The canonical Availability Window requires a distinct referable Window identity with a real bounded interval.

Therefore the target adds a Window record for the proposal-submission opportunity rather than treating embedded Conference timestamps as the final authority.

Current fields can remain compatibility mirrors:

- `submissionsOpenAt`;
- `submissionsCloseAt`.

The current `submissionsOpen` boolean remains policy/override state pending 003-D.

A legacy conference with missing open/close bounds must **not** be backfilled using invented infinite/sentinel timestamps. It remains a legacy-compatibility case until its interval is explicitly normalized.

---

## 11. Controlled Disclosure target

Current blind-review behavior has no durable exposure relation.

The target therefore adds one persistent record for each relevant:

```text
(participant, review context, information item)
```

with:

- stable identity;
- staging time;
- optional exact Revision/subject reference where the information is version-sensitive;
- monotonic reveal actor/time.

The concrete information-key taxonomy and reveal authorization remain 003-D work.

### Migration guardrail

Legacy identity reveal was not persisted. 003-B explicitly rejects backfilling concealed/revealed history by guesswork.

In-flight legacy review contexts may require compatibility treatment while new contexts begin canonical disclosure tracking prospectively.

---

## 12. Vocabulary and Classification target

### Vocabulary

`Theme.id` remains TermRef.

Add immutable TermState records for:

- label;
- available/retired state;
- actor/time;
- predecessor.

Current `Theme.name`/`removedAt` may remain current projections.

Existing slugs/source/sort order stay application metadata.

### Classification

Add an exact set-like relation:

```text
SubmissionRevision.id ↔ Theme.id
```

This makes the accepted v0 “classification belongs to exact Revision” decision relationally explicit.

Existing `SubmissionRevision.themeIds` makes much of the historical relation strongly backfillable. `SubmissionTheme` can remain a current-Revision compatibility mirror.

---

## 13. Coverage Target target

Coverage Target receives its own stable record with:

- collection/context;
- dimension;
- bucket/value;
- measure;
- optional lower/upper bounds.

That permits:

- Theme targets (`dimension=theme`, bucket=`Theme.id`);
- validated sponsor/session-kind targets;
- future representation dimensions without changing Vocabulary semantics.

Legacy `targetMin=0,targetMax=0` is treated as **ambiguous/no configured target by default**, not automatically as a canonical target of exactly zero.

---

## 14. Deliverable target

`DeckFile.id` is retained as ArtifactVersionRef, but the current model is missing both requirement identity and version-specific Assessment history.

Target:

```text
DeliverableRequirement
      │
      ├── DeckFile v1
      │      └── concern → ready
      │
      └── DeckFile v2   ← current
             └── awaiting assessment
```

A new Deliverable Requirement identifies the Proposal/responsible party/artifact kind.

DeckFiles attach to that requirement with exact predecessor/current semantics.

New immutable Assessment records hold concern/ready review against one exact DeckFile.

`deckStatus` becomes compatibility projection. `REVIEWED` is retained only as a legacy UX/API state until 003-E decides how to remove or reinterpret it; 003-B does not manufacture a new concept meaning for it.

---

## 15. Publication target

The public deck feature must move from mutable “latest eligible deck under global flag” semantics to exact-material Publication state.

Target:

```text
Publication
- exact DeckFile.id / MaterialRef
- PublicSurfaceRef
    │
    └── PublicationState chain
          published → unpublished → published ...
```

`DeckFile.publicId` remains a public delivery token/address, not Publication identity.

A newer DeckFile does not mutate an existing Publication's material reference.

Current event-wide publication/share flags remain policy/compatibility inputs during migration.

---

## 16. Dispatch target

Existing Batch/SendRecord persistence is retained.

The main target addition is exact performed-message evidence per recipient:

- rendered subject;
- rendered body or equivalent immutable MessageRef;
- stable recipient identity;
- actual endpoint;
- existing semantic key/round/batch provenance.

Historical sends whose exact rendered message was not stored remain legacy-unknown; mutable templates cannot be used to fabricate what was sent.

---

## 17. Archive target

Add one immutable Archive closure record per current v0 Conference/application context.

A later broader lifecycle status may change, but that cannot erase the historical Archive fact.

Current `Conference.status` can remain a broader application lifecycle field and `archivedAt` a compatibility mirror.

If true reopen behavior is later retained, it must be designed separately; 003-B does not weaken Archive to accommodate the current reversible enum.

---

## 18. Schedule persistence decision

No additional Schedule persistence hierarchy is justified by 003-B.

Existing Room, Slot, and Placement identities already provide a useful target substrate. The known generator problem is about **authority and coordinated mutation**, not missing persistent identity.

That is carried to 003-C/003-E.

---

## 19. Migration provenance decision

003-B formalizes four migration truth classes:

1. native;
2. backfilled-historical;
3. backfilled-current-state;
4. legacy-unknown.

This avoids a common migration error: assigning cutover timestamps or guessed actors to events that happened earlier simply because a new history table requires a row.

Examples:

- Revision predecessor links can be true backfilled history;
- current BACKUP Selection may only be a current-state seed when its original decision time is absent;
- overwritten prior Evaluation values remain unknown;
- prior identity reveals remain unknown;
- a currently public exact DeckFile can be established as public **at cutover**, without claiming it has been that exact published material since the event-wide flag was enabled.

---

## 20. Compatibility posture

003-B chooses an **expand-first coexistence architecture**.

No current aggregate projection needs to be removed before the canonical owners exist and are verified.

Compatibility fields may remain, including:

- `programStatus`;
- current abstract/content fields and `abstractVersion`;
- `abstractReviewStatus`;
- `SubmissionTheme`;
- `deckStatus`;
- Conference window fields;
- current Theme state/target columns;
- publication/archive flags;
- existing Dispatch cached fields.

But their future write direction must become explicit:

```text
canonical owner
      ↓
compatibility projection
```

rather than two independent sources of truth.

003-C defines coordinated/dual-write semantics. 003-E determines when APIs/UI stop depending on legacy projections. 003-F defines the rollout gates.

---

## 21. Deletion and retained-history posture

The current Prisma schema uses broad cascade deletion from aggregate parents.

003-B does not authorize copying that behavior into new durable history automatically.

Selection decisions, Withdrawal, Evaluation, Controlled Disclosure, Vocabulary states, Deliverable assessments, Publication history, and Archive closure exist specifically to retain meaningful history.

Before implementation, later work must decide whether destructive Conference/Submission/Theme deletion is prohibited, restricted, transformed into retained closure, or otherwise made reference-safe.

---

## 22. Database migration/tooling finding

The current repository uses Prisma/SQLite and exposes `prisma db push`; there is no checked-in migration directory/history in the current Prisma tree.

That is adequate evidence of current prototype workflow, but **not an acceptable final rollback/migration discipline for the structural reconciliation envisioned here**.

003-F must establish an explicit versioned migration, backfill, verification, rollback, and deployment procedure before destructive cleanup is allowed.

003-B does not change that tooling now.

---

## 23. Gap disposition

003-B assigns a persistence/reference target to the structural portions of the 003-A gaps.

Key dispositions include:

- SG-001 → Score survives; exact Revision FK + revised uniqueness;
- SG-002 → immutable Selection Decision chain;
- SG-003 → independent immutable Withdrawal;
- SG-004 → Pool/Allocation/Release ledger;
- SG-005 → durable Disclosure relation;
- SG-006 → exact Revision↔Term relation;
- SG-007 → Deliverable Requirement + exact Artifact Assessment;
- SG-008/009 → exact-material Publication + state history;
- SG-010 → immutable Archive closure;
- SG-011 → TermState history;
- SG-012 → exact current Revision reference + current-row projection;
- SG-013 → distinct Availability Window + explicit policy override separation;
- SG-015 → exact Dispatch message snapshot;
- SG-018 → distinct generic Coverage Target.

SG-014, SG-016, SG-017 and synchronization/policy portions of several gaps remain primarily 003-C/003-D/003-E work.

The gaps are **target-designed, not closed** until implementation and verification occur.

---

## 24. Implementation authorization

003-B authorizes **no Prisma, route, helper, API, or UI change**.

It supplies the target that subsequent Phase 003 groups must make executable and safe.

---

## 25. Exit review

### Stable identity reuse

**PASS** — existing IDs are reused wherever their semantic identity fits.

### Required new history identification

**PASS** — new durable records are limited to places where current representation cannot preserve accepted truth.

### Exact cross-concept references

**PASS** — Revision, ArtifactVersion, recipient, and other exact reference targets are defined.

### Compatibility strategy

**PASS** — legacy aggregate fields may remain as projections rather than forcing an immediate rewrite.

### Recoverability honesty

**PASS** — deterministic, current-state, forward-only, and unknown history classes are distinguished.

### Reversibility posture

**PASS** — expand-first coexistence is required; truthful new history cannot be erased merely to roll back application behavior.

### Migration tooling readiness

**OPEN FOR 003-F** — current `db push` workflow is not the final migration mechanism.

### Runtime/schema changes

**NOT AUTHORIZED**.

**003-B result: COMPLETE.**

---

## 26. Next — 003-C

Proceed to:

### **003-C — Synchronization, Transaction, Idempotency & Recovery Architecture**

003-C should determine, without coding:

- which user commands require one database transaction across canonical owners;
- how SYNC-001 through SYNC-008 map to application-command boundaries;
- how Selection + Capacity precondition semantics are enforced;
- how Withdrawal commits before/reliably converges downstream Capacity/Schedule/Publication cleanup;
- how canonical writes project to legacy compatibility fields during coexistence;
- idempotency keys/constraints for retries;
- failure/retry state for source-authoritative follow-up;
- safe schedule-generation apply semantics;
- Dispatch same-round idempotency;
- how partial failure is detected, surfaced, and repaired without inventing a new SynchronizationManager concept.