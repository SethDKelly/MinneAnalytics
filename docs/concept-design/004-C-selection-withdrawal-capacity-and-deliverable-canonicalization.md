# 004-C — Selection, Withdrawal, Capacity & Deliverable Canonicalization

Status: **Complete**  
Concept model maturity: **v0 specified; implementation execution in progress**  
Branch: **`concept-design/v0-implementation`**

## 1. Purpose

004-C executes the Phase 003 F3/F5-W2 participation and Deliverable slice. It replaces `programStatus` and `deckStatus` as first-party write authority, when the staged 004-C gate is enabled, with the independent canonical histories required by Selection, Withdrawal, Capacity, and Deliverable.

The package implements the accepted transaction split:

- **TX-A — atomic entry:** newly effective participation commits Selection Decision, hard Capacity Allocation, first required Deliverable, current canonical pointers, and compatibility projection together;
- **TX-B — source-authoritative exit:** Withdrawal or a Selection change that ends effective participation commits the source history first and records durable idempotent cleanup work for downstream convergence.

Canonical semantics remain owned by the Concept Catalog and Phase 003 reconciliation nodes.

## 2. Selection canonicalization

`SelectionDecision` now records immutable organizer-decision history. The current Decision is referenced by `Submission.currentSelectionDecisionId`.

The target-native writer:

- appends selected, reserve, not-selected, and clearing Decisions;
- retains predecessor history rather than overwriting the prior choice;
- treats no Decision/clearing as undecided rather than manufacturing a persisted pending decision;
- supports command-key replay;
- advances the current Decision pointer with an expected-head check;
- projects the canonical current disposition back to legacy `programStatus` and `approvedAt`.

The organizer compatibility route no longer accepts `WITHDRAWN` as a Selection disposition in canonical mode.

## 3. Withdrawal independence

Presenter withdrawal now records one durable `WithdrawalRecord` with originator actor/time provenance.

Withdrawal:

- is monotonic and idempotent;
- never deletes or rewrites Selection Decisions;
- causes `WITHDRAWN` only as the compatibility projection;
- cannot be cleared by a later organizer Selection command;
- commits before downstream release/unplacement convergence.

A later organizer Decision may therefore remain historically meaningful while effective participation stays false because Withdrawal independently exists.

## 4. Capacity authority

004-C activates the Capacity structures introduced by 004-A.

The initial v0 Pool:

- uses key `program-slots`;
- derives its validated finite limit from `rooms * sessionsPerRoom - eodTrim - graemeSlots`;
- uses one `standard` class consuming one unit;
- deliberately does not reinterpret sponsor/community representation targets as different Capacity charges.

New effective participation allocates one unit inside TX-A before the Selection entry can commit. Insufficient Capacity rejects the whole entry transaction: no selected Decision, Deliverable, or compatibility `APPROVED` projection survives.

The 004-C migration adds a SQLite partial unique index enforcing at most one active Allocation for a Pool/Proposal pair. Committed/remaining Capacity remains derived from active Allocation history.

## 5. Participation-exit convergence

Selection changes that end effective participation and Withdrawal create durable `SynchronizationWork` records keyed by `(syncId, sourceRef, effectKey)`.

004-C implements local idempotent convergence for:

- Capacity release (`SYNC-006`);
- Schedule unplacement (`SYNC-007`).

The source Decision/Withdrawal is never rolled back because a cleanup effect fails. Failed work remains visibly `BLOCKED`, retaining attempts/error evidence for retry; successful effects become `COMPLETED`.

Publication cleanup belongs to the later exact-Publication package and is not fabricated here.

## 6. Deliverable and ArtifactVersion canonicalization

A newly effective participant receives the required deck `DeliverableRequirement` in the same TX-A transaction as Selection and Capacity.

`DeckFile.id` remains ArtifactVersion identity. Native provision now:

- stages a collision-safe file path;
- creates the exact ArtifactVersion linked to its Deliverable;
- records the predecessor ArtifactVersion;
- advances the Deliverable current-artifact pointer with an expected-head check;
- retains prior artifacts and assessments;
- projects the newly current unassessed artifact to legacy `deckStatus = SUBMITTED`;
- removes the staged file if the database commit fails.

The 004-C migration also enforces unique logical DeckFile version ordinals per Proposal.

## 7. Exact readiness Assessment

Target-native deck review no longer mutates a free-standing status as readiness authority.

For the exact current ArtifactVersion:

- `CONCERN` appends a concern Assessment;
- legacy `APPROVED` input appends a canonical `READY` Assessment;
- each later Assessment records the preceding Assessment for that same ArtifactVersion;
- current assessment pointer advancement uses expected-head semantics;
- `deckStatus` is projected as `CONCERN` or `APPROVED` only after the exact Assessment commits.

Legacy `REVIEWED` has no canonical concern/ready meaning and is rejected by the target-native writer rather than converted into invented history.

Providing a replacement ArtifactVersion resets the current compatibility view to `SUBMITTED`; readiness of an earlier file remains historical truth about that earlier ArtifactVersion and never transfers automatically.

## 8. Migration and truthful current-state backfill

Checked-in migration:

`20260904003000_selection_withdrawal_capacity_deliverable`

Backfill entrypoint:

`npm run db:004-c:backfill`

The backfill is current-state seeding, not historical reconstruction.

### Selection and Withdrawal

- `APPROVED` seeds selected;
- `BACKUP` seeds reserve;
- `DECLINED` seeds not-selected;
- `PENDING` seeds no Decision;
- `WITHDRAWN` seeds Withdrawal and only seeds a prior selected Decision when surviving `approvedAt` supports that fact.

Unknown historical decision actors/times are not invented.

### Capacity

The current configuration is validated into the finite Pool. One-unit active Allocations are created only for effectively participating Proposals. If migrated commitments exceed the accepted Pool, the context is a blocking defect; the migration never enlarges Capacity merely to pass.

### Deliverable

For migrated effective participants, the deck Deliverable and retained DeckFile history are connected using exact identities and logical version order.

For the latest retained artifact:

- legacy `APPROVED` may seed `READY` current-state Assessment;
- legacy `CONCERN` may seed concern Assessment;
- `SUBMITTED` remains awaiting review;
- `REVIEWED` is reported as expected legacy residue and receives no invented Assessment.

All migration issues are emitted through machine-readable reports and `MigrationRun`/`MigrationIssue` evidence when apply mode is used.

## 9. Staged compatibility cutover

The runtime gate remains:

`MINNE_V0_WRITE_SELECTION_PARTICIPATION`

With the gate enabled, organizer program decisions, presenter Withdrawal, deck provision, and deck readiness commands use canonical 004-C writers. Existing UI/API shapes are retained as bounded compatibility adapters rather than requiring screen-per-concept redesign.

With the gate disabled, pre-cutover compatibility writers remain available for staged rollout. This does not authorize a later authority rollback that erases durable Selection, Withdrawal, Capacity, or Assessment history already captured canonically.

## 10. Verification scenarios

`scripts/migrations/verify-004-c.ts` exercises the high-risk semantics on a one-unit Capacity pool:

1. selecting Proposal A atomically creates its Decision, Allocation, Deliverable, and `APPROVED` projection;
2. command replay creates no duplicate Decision/Allocation;
3. selecting Proposal B while full fails without partial state;
4. moving A to reserve retains the selected Decision and releases the slot through durable cleanup;
5. B can then be selected;
6. withdrawing B preserves B's selected Decision while Withdrawal dominates effective participation and compatibility projection;
7. a later organizer Decision cannot erase Withdrawal;
8. first artifact provision yields awaiting-review state;
9. concern then ready Assessments form exact immutable history on artifact v1;
10. artifact v2 records v1 as predecessor and becomes awaiting review rather than inheriting v1 readiness;
11. exit cleanup work remains durable and completes idempotently.

## 11. CI exit evidence

GitHub Actions run **33891168547**, head `26b4a4bce6a014fcd97e3496409ebae39102d09d`, completed successfully.

The same head passed:

1. dependency installation;
2. OKF validation;
3. migration-foundation verification;
4. Prisma validation;
5. the complete four-migration fresh deployment chain;
6. baseline migration reporting;
7. both 004-B semantic verifiers;
8. the 004-C Selection/Withdrawal/Capacity/Deliverable verifier;
9. existing-database baseline adoption;
10. 004-B Vocabulary and exact-Revision backfills;
11. 004-C participation/Capacity/Deliverable backfill;
12. lint;
13. optimized production build.

The first 004-C verifier run exposed that Prisma/SQLite does not support `createMany(..., skipDuplicates)` for the cleanup work implementation. The implementation was corrected to semantic-key upserts. The same correction also ensures a failed TX-B cleanup retains its durable `BLOCKED` diagnostic state rather than rolling that state back.

## 12. Gap-state effect

004-C materially advances:

- SG-002 — immutable Selection history and current Decision projection;
- SG-003 — independent monotonic Withdrawal;
- SG-004 — finite Capacity authority and Allocation/Release realization;
- SG-007 — exact ArtifactVersion readiness Assessment;
- participation-related operational portions of the accepted synchronization architecture.

These gaps are **not globally `verified-closed` by 004-C alone**. 004-F still owns semantic read/consumer cutover and independent compatibility-writer retirement; 004-G/004-H own final migration validation, rollback rehearsal, cleanup decisions, and closure accounting.

## 13. Exit decision

004-C passes because target-native writes now preserve the four independent concept histories, TX-A prevents partial participation entry, TX-B preserves source truth while cleanup converges, migration seeds only supported current state, and the complete substantive CI gate is green.

Next package:

> **004-D — Availability, Archive, Authority & Disclosure Policy Implementation**
