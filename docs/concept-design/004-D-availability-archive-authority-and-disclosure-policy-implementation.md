# 004-D — Availability, Archive, Authority & Disclosure Policy Implementation

Status: **Complete**  
Concept model maturity: **v0 specified; implementation execution in progress**  
Branch: **`concept-design/v0-implementation`**

## 1. Purpose

004-D executes the Phase 003 lifecycle, authority, edit-policy, and protected-information slice assigned by the [v0 Implementation Execution Handoff](knowledge/reconciliation/implementation-execution-handoff.md).

The package moves the affected command boundaries away from broad `ACTIVE`/status-driven authority toward the accepted application-policy composition while preserving the existing Concept Design boundaries:

- [Availability Window](knowledge/concepts/availability-window.md) owns the bounded opportunity interval;
- [Archive](knowledge/concepts/archive.md) owns durable closure;
- [Controlled Disclosure](knowledge/concepts/controlled-disclosure.md) owns staged/revealed protected-information relationships;
- authority/capabilities, lifecycle eligibility, manual suspension, revision exceptions, and migration-cohort classification remain application policy rather than new concepts.

004-D does not implement exact Publication, public resolver hardening, Schedule proposal/apply, or Dispatch provider semantics; those remain 004-E.

## 2. Availability Window authority

The canonical Proposal-offer opportunity uses one `AvailabilityWindow` identified by opportunity key `proposal-offer`.

Target-native Offer availability now composes:

1. setup/live/Archive context state;
2. the canonical half-open interval `[opensAt, closesAt)`;
3. the legacy `submissionsOpen` field only as a manual suspension input.

Consequences:

- DRAFT/setup cannot offer even when the interval is open;
- Archive cannot offer regardless of timestamps or suspension state;
- a missing canonical Window is explicitly unconfigured rather than implicitly open;
- `submissionsOpen = false` temporarily suspends an otherwise-open opportunity;
- restoring `submissionsOpen = true` cannot reopen a future or expired Window;
- canonical Window changes project back to `Conference.submissionsOpenAt/submissionsCloseAt` during compatibility coexistence.

The public Proposal creation route consumes this policy when the 004-D gate is enabled.

## 3. Monotonic Archive closure

`ArchiveRecord` is now the durable closure authority at the migrated lifecycle boundary.

The target-native Conference policy writer permits the ordinary progression:

```text
DRAFT -> ACTIVE -> ARCHIVED
```

It rejects:

- ACTIVE -> DRAFT regression;
- reopening a context after an `ArchiveRecord` exists;
- erasing Archive provenance by changing a compatibility enum.

Archiving atomically creates the durable `ArchiveRecord` with actor/time provenance and projects the legacy `Conference.status`/`archivedAt` fields.

Even with the 004-D gate disabled, the legacy Conference settings path refuses to reopen a context once durable Archive history exists. Archive therefore becomes a rollback floor rather than history that a compatibility rollback can erase.

## 4. Action-oriented capability resolution

004-D introduces a narrow application capability vocabulary consumed by the migrated command boundaries. Current `ADMIN`, `BOARD`, and `CHAIR` roles remain an assignment mechanism; they are not promoted into Concept state.

Examples implemented in this package include:

- `MANAGE_CONTEXT_SETTINGS`;
- `MANAGE_AVAILABILITY`;
- `ARCHIVE_CONTEXT`;
- `RECORD_EVALUATION`;
- `GIVE_FEEDBACK`;
- `DECIDE_SELECTION`;
- `REVIEW_DELIVERABLE`.

The mapping intentionally does not mean “administrator can do everything.” For example, the current ADMIN role receives context/availability/archive administration but does not automatically receive protected review judgment authority.

Migrated routes resolve a capability first and then apply lifecycle/concept preconditions. Concept invariants remain unbypassable by role.

## 5. Broad lifecycle gating narrowed at migrated boundaries

The 004-D policy path replaces `assertConferenceAcceptsMutations()` at the command boundaries moved in this package and at the already-canonical 004-B/004-C commands whose safety depends on 004-D policy.

Target-native rules now include:

- Evaluation and Feedback: live, not archived, in scope, not withdrawn;
- Selection: live, not archived, explicit decision capability;
- Withdrawal: permitted independently of the Offer Window but not after Archive closure;
- Deliverable provision/review: live, not archived, effective participation where required;
- Proposal Offer: live, not archived, canonical Window open, not manually suspended.

Untouched Publication/Schedule/Dispatch command boundaries remain assigned to 004-E. Remaining compatibility consumers and route retirement remain 004-F/004-G work.

## 6. Explicit Revision eligibility and exception

004-D removes `ProgramStatus`/`AbstractReviewStatus` from target-native Revision permission authority.

Ordinary presenter Revision eligibility now composes:

- live/non-Archive context;
- no Withdrawal;
- no selected/not-selected decision lock;
- canonical Proposal-offer Window currently open.

A review-requested exception is an **explicit application-policy action**, not an implication of Feedback.

The package adds `RevisionExceptionPolicy` as current policy state with:

- Proposal/submission identity;
- exact current Revision identity;
- granting actor;
- granting time.

A successful successor Revision consumes the exception scoped to its predecessor. It does not automatically carry forward to the new Revision.

`FEEDBACK_PENDING` may remain a compatibility/work presentation field, but it does not create an edit grant on the canonical path. The Feedback response explicitly reports that no revision exception was granted.

This storage is application policy, not a new RevisionException concept or historical workflow.

## 7. Controlled Disclosure native cutover

Protected review exposure is now durable for native post-cutover relationships.

Two information identities are implemented according to the accepted policy baseline:

- Proposal-level presenter identity: `review.presenter-identity`;
- exact-Revision peer aggregate: `review.peer-aggregate`.

### Presenter identity

When blind review is enabled, target-native explicit reveal:

- validates reviewer/context scope and lifecycle;
- creates a staged Controlled Disclosure relationship when the relationship is native;
- records reveal actor/time monotonically;
- preserves the original reveal provenance on retry.

### Peer aggregate

For a native exact Revision, Evaluation and peer-aggregate reveal execute in the same local database transaction. The Evaluation remains the judgment authority and Controlled Disclosure remains the visibility authority.

A later Revision receives a different information subject and therefore does not inherit aggregate visibility from an earlier Revision.

## 8. Legacy disclosure cohort without fabricated history

Prior blind-review exposure cannot be reconstructed truthfully.

004-D therefore introduces `ConferencePolicyCutover` as migration-classification infrastructure, not concept state.

For presenter identity, a reviewer/Proposal relationship established before the cutover remains `legacy-unknown` when no target record exists. For peer aggregate, a reviewer/exact-Revision relationship predating the cutover is treated similarly.

Critical consequences:

- absence of a Controlled Disclosure row for the legacy cohort is **not** interpreted as proof that information was concealed or unseen;
- the backfill does not create fake concealed/revealed records;
- new post-cutover exact Revisions can receive native aggregate disclosure even when the broader Proposal/reviewer relationship predates cutover;
- once a native Controlled Disclosure relationship exists, its reveal state and provenance become authoritative.

## 9. Blind-review configuration lock

Blind-review configuration is now locked once protected review activity exists.

Changing `blindReviewEnabled` after either Evaluation or Controlled Disclosure activity has begun is rejected with a stable policy reason rather than pretending prior exposure can be undone or silently changing the information contract mid-review.

This is application policy and does not introduce a configuration-history concept.

## 10. Additive policy migration and truthful backfill

Checked-in migration:

`20260904004000_availability_archive_authority_disclosure`

It adds two application-policy tables:

- `ConferencePolicyCutover`;
- `RevisionExceptionPolicy`.

Neither table is represented as a new Concept Design concept.

Backfill entrypoint:

`npm run db:004-d:backfill`

The backfill:

- creates a Proposal-offer Availability Window only from two valid durable legacy bounds;
- reports missing/partial bounds as operator normalization and does not invent sentinel dates;
- treats conflicting canonical/legacy Window state as blocking;
- creates current-state Archive closure for currently archived contexts where needed;
- retains unknown historical Archive actor/time as unknown rather than substituting migration time;
- blocks a durable ArchiveRecord that contradicts a non-archived compatibility state;
- records the disclosure cutover only when no target Controlled Disclosure history already makes the boundary ambiguous;
- never derives a Revision exception from `FEEDBACK_PENDING` or another legacy workflow status.

Machine-readable evidence is recorded through the established `MigrationRun`/`MigrationIssue` infrastructure when apply mode is used.

## 11. Verification scenarios

`scripts/migrations/verify-004-d.ts` verifies the high-consequence semantics independently of application seed data:

1. current roles resolve explicit capabilities without administrator privilege becoming universal domain authority;
2. setup mode overrides an otherwise-open Window;
3. DRAFT -> ACTIVE enables a valid open Window;
4. manual suspension closes and resume restores the same Window without redefining it;
5. the Window is closed exactly at `closesAt`, proving half-open semantics;
6. pre-cutover presenter identity remains `legacy-unknown` and does not fabricate Controlled Disclosure state;
7. a post-cutover exact Revision reveals peer aggregates atomically with its Evaluation;
8. replay/re-evaluation preserves the original disclosure reveal provenance;
9. blind-review mode cannot change after protected review activity begins;
10. a closed Window denies ordinary Revision;
11. an explicit exact-Revision exception enables the requested Revision;
12. the successor Revision consumes that exception rather than inheriting it;
13. Archive creates durable actor/time closure;
14. Archive cannot be reopened;
15. Archive dominates Window/suspension state.

## 12. CI exit evidence

GitHub Actions run **33932065490**, head `8cd2e34510beb6ddb55e15184e5548db774a8901`, completed successfully.

The same implementation head passed:

1. dependency installation;
2. OKF validation;
3. migration-foundation verification;
4. Prisma schema validation;
5. the complete five-migration fresh deployment chain;
6. baseline migration reporting;
7. both 004-B semantic verifiers;
8. the 004-C participation/Deliverable verifier;
9. the new 004-D lifecycle/authority/disclosure verifier;
10. existing-database baseline adoption;
11. 004-B Vocabulary and exact-Revision backfills;
12. 004-C participation/Capacity/Deliverable backfill;
13. 004-D Availability/Archive/disclosure-policy backfill;
14. lint;
15. optimized production build.

The existing-database rehearsal passed without requiring fabricated revision exceptions or disclosure exposure history.

## 13. Gap-state effect

004-D materially advances its assigned closure work:

- **SG-005 — Controlled Disclosure history:** native durable staging/reveal and exact-Revision aggregate exposure are implemented with legacy-unknown cohort treatment;
- **SG-010 — Archive provenance:** native closure is durable and monotonic, with reopen blocked;
- **SG-013 — Availability Window:** canonical interval + suspension composition now owns target-native Offer availability;
- **SG-017 — Feedback coupling:** Feedback no longer grants target-native edit permission; explicit Revision exception is independent;
- **SG-P01 — Edit eligibility:** target-native Revision policy now composes Window, lifecycle, Withdrawal, decision lock, and explicit exception;
- **SG-P02 — Authority naming/capability:** migrated command boundaries consume explicit capabilities while current roles remain assignment mechanism;
- **SG-P03 — Archive/post-event operations:** the migrated lifecycle boundaries no longer rely on one broad `ACTIVE` mutation rule.

These items are **not globally `verified-closed` by 004-D alone**. 004-E still owns its post-Archive-safe Publication/Dispatch/Schedule operations; 004-F owns semantic read/consumer cutover and compatibility retirement; 004-G/004-H own rollback rehearsal, cleanup authorization, and final closure accounting.

## 14. Exit decision

004-D passes because:

- Availability Window is authoritative on the target-native Offer path;
- manual suspension cannot redefine or reopen the interval;
- Archive is durable, provenance-retaining, and non-reopenable;
- high-consequence migrated commands consume explicit capabilities and action-specific lifecycle policy;
- Revision exceptions are explicit, exact-Revision-scoped policy rather than inferred Feedback state;
- native Controlled Disclosure staging/reveal is durable and monotonic;
- legacy exposure remains truthfully unknown instead of fabricated;
- peer aggregate reveal remains exact-Revision-specific and atomic with Evaluation;
- blind-mode configuration is locked after protected review activity;
- both fresh and pre-existing database CI paths pass.

Next package:

> **004-E — Publication, Public Access, Schedule & Dispatch Hardening**
