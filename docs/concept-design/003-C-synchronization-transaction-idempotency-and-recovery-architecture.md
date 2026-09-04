# 003-C — Synchronization, Transaction, Idempotency & Recovery Architecture

Status: **Complete**  
Concept model maturity: **v0 specified; persistence target defined; execution/recovery architecture defined**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [003-B — Persistence, Identity, History & Migration Target Design](003-B-persistence-identity-history-and-migration-target-design.md)

## 1. Purpose

003-C defines how accepted concept synchronizations are executed safely when operations span multiple canonical owners, legacy compatibility projections, external providers, or failure boundaries.

Current normative execution knowledge is owned by:

- [MinneAnalytics v0 Synchronization, Transaction & Recovery Target](knowledge/reconciliation/synchronization-transaction-recovery-target.md);
- [MinneAnalytics v0 Idempotency & Recovery Baseline](knowledge/reconciliation/idempotency-recovery-baseline.md).

Historical evidence is preserved in:

- [003-C Synchronization Execution Matrix](evidence/003-C-synchronization-execution-matrix.md);
- [003-C Failure, Idempotency & Recovery Matrix](evidence/003-C-failure-idempotency-and-recovery-matrix.md).

The accepted cross-concept semantics remain owned by the [v0 Synchronization & Composition Contract](knowledge/synchronizations/minneanalytics-v0.md). 003-C specifies execution architecture; it does not redefine those synchronizations.

---

## 2. Entry problem

003-B established the target identities and histories, but a correct schema alone does not preserve semantic truth under:

- partial failure;
- concurrent writes;
- HTTP/client retries;
- process crashes;
- compatibility dual-write periods;
- file/object storage operations;
- external communication providers.

003-C asks:

> **Which operations must commit together, which source facts must survive failed cleanup, and how can every retry converge without creating new semantic history?**

---

## 3. Four execution classes

003-C adopts four execution classes rather than one generic workflow mechanism.

### TX-A — atomic authoritative bundle

Use when the initiating action is not truthful unless all hard local effects exist.

Examples:

- Offer + initial Revision + Classification;
- Revision + exact Classification + current pointer;
- Evaluation + local eligible reveal;
- Selection entry + Capacity allocation + first required Deliverable.

All authoritative state commits or none commits.

### TX-B — source-authoritative + convergent follow-up

Use when downstream cleanup must not invalidate the initiating decision/action.

Examples:

- Withdrawal;
- Selection changes/clears that end effective participation;
- publication/placement/capacity cleanup caused by eligibility loss.

The source transaction commits the source fact plus durable follow-up obligations. Cleanup converges after commit.

### TX-C — independent external/notification consequence

Use when communication or another side effect is motivated by but not constitutive of source truth.

Feedback, Selection approval, or Deliverable state must not be rolled back because a notification fails.

### TX-D — non-transactional resource/provider boundary

Use where one database transaction cannot include the effect, notably file storage and real external communication providers.

Truth requires explicit prepare/commit/reconcile handling rather than pretending atomicity exists.

---

## 4. Atomic offer/revision bundles

SYNC-001 and SYNC-002 are formally TX-A.

An accepted offer should atomically establish:

- durable Proposal identity;
- initial exact Revision;
- complete exact Classification set;
- current Revision pointer;
- controlled legacy current-content/theme projections.

An accepted edit should atomically establish:

- one successor Revision of the expected current head;
- its complete Classification set;
- current Revision pointer;
- current compatibility projections.

This prevents partially materialized proposals or revisions.

Concurrency must use an expected-current-head condition so two simultaneous edits cannot both silently become accepted successors of the same head.

---

## 5. Evaluation/disclosure execution

While both Evaluation and Controlled Disclosure remain local persistence, the Evaluation→reveal synchronization should be TX-A.

The exact Evaluation is recorded/updated for the current Revision and the applicable staged Disclosure is conditionally revealed in one transaction.

The reveal update is conditional on still being concealed. Retrying therefore cannot replace the first reveal actor/time.

If disclosure later moves across a service/database boundary, Evaluation becomes the source-authoritative fact and reveal becomes a convergent TX-B effect rather than weakening Evaluation semantics.

---

## 6. Effective-participation entry

A newly-effective Selection is a hard-invariant boundary because Capacity cannot be exceeded.

The TX-A entry bundle should normally include:

1. immutable Selection Decision;
2. required Capacity Allocation;
3. first Deliverable Requirement when policy requires one;
4. current compatibility `programStatus`/approval projection.

Capacity validation must occur inside the allocation transaction/invariant boundary, not from a stale precomputed dashboard value.

If allocation cannot be established, the newly-effective Selection does not commit.

Coverage Target remains advisory and cannot override this hard failure.

---

## 7. Source-authoritative exits

003-C generalizes the Phase 002-G rule beyond Withdrawal: a committed Selection Decision that intentionally ends effective participation is also not something downstream cleanup should rewrite.

For Withdrawal or Selection exit, the source transaction commits:

- the source Withdrawal/Decision;
- immediate compatibility projection;
- one durable work item per required follow-up effect.

Follow-up may include:

- Capacity release;
- Schedule unplacement;
- Publication unpublish.

Effective-participation views switch immediately based on source truth.

If cleanup is delayed, stale target state is operational debt, not permission to treat the Proposal as participating.

A temporarily unreleased Capacity allocation is conservatively safe—it can temporarily reduce available capacity—but must converge promptly.

---

## 8. Durable work without a Workflow concept

003-C requires durable implementation work for TX-B effects but explicitly rejects a new domain Workflow/SynchronizationManager concept.

A narrow relational work/outbox record is sufficient for v0 when it stores:

- synchronization ID;
- source reference;
- semantic effect key;
- pending/processing/completed/blocked status;
- attempt/error timestamps and diagnostics.

The key `(syncId, sourceRef, effectKey)` makes enqueue itself idempotent.

The work record is operations infrastructure. It carries no new product lifecycle meaning.

No Kafka/message broker/distributed saga framework is required for the current application boundary.

---

## 9. Idempotency architecture

003-C uses three complementary techniques rather than a universal event store.

### Semantic uniqueness

Use accepted uniqueness such as:

- one Withdrawal per participation;
- one Disclosure per participant/context/information;
- one active Capacity allocation per Pool/commitment;
- Dispatch recipient/context/key/round uniqueness.

### Expected-head append

Use expected-current-state checks for:

- Revision chains;
- Selection Decisions;
- Vocabulary TermState;
- Deliverable Assessments;
- PublicationState.

### Command keys

Retryable mutating commands that create meaningful append events should carry a stable command/operation key. Retrying the same key returns the original result rather than creating another event.

This is especially appropriate for Offer, Revision submit, Selection decision, Deliverable provision/assessment, Publication transitions, accepted Schedule application, and Dispatch initiation.

---

## 10. Crash/retry contract

003-C explicitly handles four important crash positions.

### Before transaction commit

No authoritative state exists; same command may retry.

### After commit but before client response

Retry must discover the committed result through command identity/current semantic state rather than duplicate it.

### After source commit before follow-up

Durable work remains pending and drains independently. Source truth is already authoritative.

### After effect before work completion marker

The retry re-reads target semantic state, recognizes the already-established effect, and marks work complete without manufacturing a second event.

---

## 11. Schedule generator correction

The current generator clears all session placements and then updates generated assignments one row at a time.

That presents two problems:

1. generation is treated as immediate authority rather than a suggestion;
2. failure midway can leave a partially rewritten Schedule.

The target architecture is:

```text
current placement snapshot/version
        ↓
generate proposal (no mutation)
        ↓
human/application acceptance
        ↓
expected-base check
        ↓
one transactional placement delta
```

If the base changed since generation, apply is rejected and the proposal must be recomputed/reviewed.

003-E owns the actual preview/accept interaction.

---

## 12. Dispatch and external delivery

003-C distinguishes **performed Dispatch truth** from provider attempt state.

Current `sendTemplateBatch` creates database send records before invoking the email stub. With a real provider, a provider failure could therefore leave durable state claiming a send occurred when handoff did not succeed.

The target requires durable preparation of:

- stable recipient identity;
- exact endpoint;
- exact rendered message;
- semantic context/key/round;
- attempt/idempotency identity.

Then provider outcome is reconciled:

- known success → canonical SendRecord exists/confirmed;
- known pre-handoff failure → retry is safe;
- unknown timeout → block/reconcile unless provider idempotency makes replay safe.

Exactly-once external delivery is not claimed when the provider cannot guarantee it.

Intentional repeat contact uses a new round rather than an `includeAlreadyEmailed` bypass of same-round uniqueness.

---

## 13. Deliverable/file-storage boundary

Current deck upload stores bytes first, creates `DeckFile` metadata second, and updates legacy `deckStatus` third.

Storage-first is preferable to a database row pointing at missing bytes, but it can leave orphaned files when the DB step fails and can create unintended logical versions on retries.

The target therefore requires:

1. validate and durably stage/store immutable bytes;
2. transactionally establish ArtifactVersion + compatibility projection;
3. clean/reconcile an unreferenced stored object after DB failure;
4. identify retry of the same upload operation where possible;
5. never expose a partially stored artifact as a committed ArtifactVersion.

No storage-provider choice is made in 003-C.

---

## 14. Compatibility dual-write direction

003-B allowed legacy projections to survive migration. 003-C now fixes their write direction.

Before canonical cutover, controlled legacy→canonical shadow/backfill is permitted.

After canonical write authority moves:

```text
canonical owner
    ↓ same local transaction where possible
compatibility projection
```

Never:

```text
canonical owner ↔ legacy field
      whichever wrote last wins
```

Projection repair can recompute legacy fields from canonical state, but cannot reconstruct missing canonical history from those projections after cutover.

---

## 15. Operational recovery visibility

Durable follow-up work must be operationally inspectable.

Minimum useful signals include:

- pending/blocked count by SYNC family;
- oldest work age;
- source/effect references;
- attempts/last error;
- external uncertainty;
- manual-action requirement.

This is operations metadata, not a business Audit Trail concept.

003-E/003-F will determine the concrete operator surface and deployment mechanism.

---

## 16. Existing implementation findings

### Program status route

The current route mutates `programStatus`, then performs demo-score creation and approval email separately. This lacks the target Selection/Capacity/Deliverable atomic boundary and mixes independent notification behavior into the request sequence.

### Withdrawal route

The current route already behaves idempotently when legacy `WITHDRAWN` is present, which is useful evidence. It lacks independent immutable Withdrawal history and durable release/unplace/unpublish convergence.

### Schedule generation

The current clear-then-loop write sequence is a concrete partial-failure risk and is not retained as target semantics.

### Dispatch

Current persistence-before-provider order cannot truthfully distinguish attempted from known handed-off external messages under a real provider.

### Feedback

The current Feedback route creates Feedback and mutates review workflow state in a transaction, but notification is an immediate external stub afterward. Target architecture preserves Feedback independently and moves notification into Dispatch-style follow-up.

---

## 17. Gap disposition

003-C advances the following gaps materially:

- **SG-003** — Withdrawal cleanup gets source-authoritative convergence;
- **SG-004** — Capacity entry becomes transactional hard invariant;
- **SG-005** — reveal updates become conditional/idempotent execution;
- **SG-014** — Schedule generation becomes non-mutating proposal + atomic accepted apply;
- **SG-015/016** — Dispatch gets exact prepared message evidence, semantic dedupe, provider uncertainty handling, and new-round repeat semantics;
- **SG-017** — Feedback notification separates from Feedback truth;
- publication/withdrawal cleanup from SG-008/009 gets durable convergence;
- compatibility aspects of SG-002/006/007/010/011/012 get one-way canonical→legacy write rules.

The gaps remain implementation-open until later execution phases deliver and verify them.

---

## 18. Implementation authorization

003-C authorizes **no runtime code, Prisma schema, queue, worker, API, or provider change**.

It establishes the architecture those changes must obey.

---

## 19. Exit review

### Atomicity classification

**PASS** — every major synchronization is classified as atomic, source-authoritative follow-up, independent external consequence, or non-transactional resource boundary.

### Source-truth preservation

**PASS** — Withdrawal and participation-exit decisions cannot be erased by cleanup failure.

### Hard-invariant enforcement

**PASS** — Capacity allocation belongs inside participation-entry success.

### Idempotency

**PASS** — semantic uniqueness, expected-head appends, command keys, and work keys are defined without global event sourcing.

### Recovery

**PASS** — crash points, retry classes, blocked uncertainty, projection repair, provider ambiguity, and artifact-orphan recovery are defined.

### Anti-bloat

**PASS** — no Workflow/SynchronizationManager concept, distributed saga framework, broker, or one-worker-per-concept requirement was introduced.

### Runtime implementation

**NOT AUTHORIZED** — authority/lifecycle/disclosure policy, compatibility UI/API behavior, and executable migration/rollout plans remain open.

**003-C result: COMPLETE.**

---

## 20. Next — 003-D

Proceed to:

### **003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation**

003-D should finalize:

- capabilities and actor authority for canonical actions;
- Availability Window override/edit exception semantics;
- Archive versus broader Conference lifecycle and post-closure operations;
- Controlled Disclosure information keys, stage/reveal policy, and legacy in-flight treatment;
- Publication sharing/rights authority and revocation semantics;
- operational policy boundaries for Dispatch, Deliverable review, Schedule management, and other high-consequence actions;
- explicit policy inputs required by 003-C transactions without introducing Authorization or Workflow as concepts.