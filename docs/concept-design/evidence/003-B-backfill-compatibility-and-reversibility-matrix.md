# 003-B — Backfill, Compatibility & Reversibility Matrix

Status: **Design evidence**  
Authority: supporting implementation-reconciliation evidence; canonical migration target is in `knowledge/reconciliation/`.

## Purpose

Classify what the existing database can honestly seed into the 003-B target, what must begin prospectively, which compatibility fields should remain during rollout, and where migration must avoid manufacturing historical evidence.

This is a migration **target** assessment, not an execution script or authorized schema change.

## Provenance classes

New canonical/history records created during migration should distinguish at least these provenance classes conceptually:

- **native** — created by the new behavior at the real event time with real actor/reference provenance;
- **backfilled-historical** — reconstructed deterministically from durable historical data that already identifies the event/state;
- **backfilled-current-state** — seeded from an observed legacy current state at cutover; does not claim the state began at cutover or that prior transitions are known;
- **legacy-unknown** — historical detail is not reconstructible and must remain explicitly unknown rather than guessed.

The physical encoding of this marker can be shared implementation metadata; it does not create a cross-concept Audit Trail concept.

## Backfill matrix

| Target | Recoverability | Safe seed rule | Information that must remain unknown |
|---|---|---|---|
| Proposal identity | deterministic | reuse every `Submission.id` | none for identity itself |
| Revision exact identity | deterministic for existing revision rows | reuse `SubmissionRevision.id`; reconstruct predecessor from sequential versions | revisions that were edited before revision history existed and were never captured |
| current Revision pointer | deterministic where revision rows complete | map `(Submission.id, abstractVersion)` to exact Revision ID | cases with missing/inconsistent revision row require repair/quarantine |
| Availability Window | conditional | create only from explicit complete valid open/close timestamps | unbounded/null legacy interval must not be replaced with invented sentinel dates |
| Evaluation exact subject | mostly deterministic for current surviving Score | map Score `scoredAbstractVersion` to exact Revision ID | Evaluation rows previously overwritten by later rescoring are irrecoverable |
| Controlled Disclosure | forward-only/partial | create native records prospectively; optional current-state seed only where current disclosure is objectively observable and policy accepts it | historical identity reveal and other unpersisted reveal events |
| Feedback exact Revision | deterministic for abstract feedback with valid version | map `(submissionId, abstractVersion)` to Revision ID | malformed/missing legacy version references; GENERAL feedback need not map to Revision |
| Selection current decision | partial | APPROVED→selected, BACKUP→reserve, DECLINED→notSelected as a backfilled current-state Decision; PENDING means no known decision | prior decision chain, decision actor/time where not persisted; WITHDRAWN may hide prior outcome |
| Withdrawal | partial/strong when `withdrawnAt` exists | seed immutable Withdrawal when current legacy state proves withdrawal; preserve known timestamp | prior withdrawal that was later erased by organizer status change; actor identity beyond originator context if not stored |
| Capacity Pool | deterministic only after policy confirms pool basis | seed finite pool from accepted configuration rule at cutover; use current observed effective participants to seed active allocations if reconciliation validates them | historic allocation/release events; prior over-capacity episodes |
| Coverage Target | conditional | Theme bounds with explicit target semantics seed theme targets; validated sponsor min/max may seed session-kind target | whether 0/0 meant an explicit zero target versus no target; historical target revisions |
| Vocabulary current state | partial | one backfilled current-state TermState per retained Theme, preserving stable Theme ID | earlier labels, retire/restore sequence, actor/time for prior changes |
| Classification by Revision | strongly backfillable for captured revisions | parse each `SubmissionRevision.themeIds` and create Revision↔Term pairs after validating referenced Theme IDs | associations from uncaptured pre-history revisions |
| Deliverable requirement | deterministic for selected/current relevant proposals at cutover, subject to policy | seed requirement for proposals currently requiring a deck; attach existing DeckFile history in version order | exact historical point requirement was established if not persisted |
| Artifact predecessor chain | deterministic | order DeckFiles by version per Submission and link predecessors | missing/deleted historical files |
| current Deliverable assessment | partial | latest `deckStatus=APPROVED` may seed ready; `CONCERN` may seed concern as backfilled current state for latest DeckFile; SUBMITTED means no assessment | earlier assessment chain; exact reviewer/time if not stored; REVIEWED semantics are not canonical |
| Schedule | already durable current state | retain existing room/slot/placement IDs | prior placement history not required by current concept and should not be invented |
| Publication current exposure | partial | at cutover, if current policy/listing says exact latest DeckFile is publicly exposed, create a Publication with published state marked backfilled-current-state | earlier exposed DeckFile identities and exact exposure intervals; event-wide published timestamp may not identify the material |
| Dispatch exact message | forward-only for body snapshot | populate exact rendered subject/body for new sends; preserve existing Batch/SendRecord history as legacy send evidence | exact old rendered bodies/subjects after mutable templates changed |
| Archive | partial | if Conference is currently ARCHIVED with `archivedAt`, seed one ArchiveRecord; actor may be unknown | archive→reopen history already erased; archival actor if not stored |

## Selection + Withdrawal legacy mapping

`ProgramStatus` must not be translated one-for-one into a new lifecycle enum.

Recommended cutover interpretation:

| Legacy state | Selection seed | Withdrawal seed | Notes |
|---|---|---|---|
| `PENDING` | none | none | undecided; do not invent a Clear event |
| `APPROVED` | selected | none | use `approvedAt` as event time only when it is trusted; actor may remain unknown/backfilled |
| `BACKUP` | reserve | none | event time/actor normally unknown; record as current-state seed |
| `DECLINED` | notSelected | none | event time/actor normally unknown; record as current-state seed |
| `WITHDRAWN` + `approvedAt` | selected current-state seed | Withdrawal | evidence supports prior selection plus later withdrawal, but earlier decision history remains unknown |
| `WITHDRAWN` without `approvedAt` | no Selection assumption | Withdrawal | do not infer whether prior state was pending/reserve/notSelected |

A legacy row whose withdrawal was previously cleared by the existing organizer route cannot be detected reliably and therefore cannot be reconstructed.

## Evaluation migration detail

Existing surviving Score rows can normally be attached to an exact Revision through `scoredAbstractVersion`.

Caveat: the existing helper that fills a null `scoredAbstractVersion` from the Submission's **current** `abstractVersion` is an implementation repair, not proof that the score was originally recorded against that revision. Rows whose version provenance came only from that fallback should be treated with lower migration confidence if the original scoring chronology cannot be established.

No migration should synthesize earlier Evaluation rows from aggregate values, revision history, timestamps, or reviewer count.

## Controlled Disclosure migration detail

Current legacy behavior does not durably retain identity-reveal history. Therefore migration must not create a concealed Disclosure record and claim the participant never saw the information.

Safer rollout choices for 003-D/003-F are:

1. apply canonical disclosure persistence only to newly established review contexts/information after cutover; or
2. explicitly classify an in-flight legacy cohort whose prior exposure is unknown and use compatibility behavior until that cohort closes.

If current peer-aggregate visibility is seeded because it is objectively observable at cutover, the seed must represent **current observed visibility**, not the historical reveal instant.

## Availability Window normalization

Canonical Window requires a distinct identity and `opensAt < closesAt`.

Legacy records fall into three groups:

- both bounds present and valid → deterministic Window seed;
- one/both bounds absent → no canonical interval can be inferred honestly;
- invalid ordering → data defect requiring operator correction before canonical cutover.

`submissionsOpen=true` with null timestamps is not evidence for specific opening/closing instants.

## Coverage Target normalization

Legacy `Theme.targetMin`/`targetMax` use `0` as both a numeric value and de facto “no configured target” signal in current helpers.

Migration should therefore:

- create no Theme Coverage Target when both are zero unless product policy explicitly confirms a zero target;
- validate `lower <= upper` whenever both are present;
- represent an absent bound as absent rather than forced zero when the canonical target is created;
- separately validate whether Conference `sponsorMin/sponsorMax` are representation targets; if confirmed, migrate them as a session-kind Coverage Target rather than Capacity class rates.

## Compatibility projection matrix

| Legacy field/surface | Canonical owner after cutover | Transitional rule |
|---|---|---|
| `Submission.programStatus` | Selection + Withdrawal projection | retain/read for legacy compatibility; new writes should originate from canonical actions and project back |
| `approvedAt` | selected Selection Decision provenance/current projection | mirror latest applicable selected event when useful; not independent authority |
| `withdrawnAt` | WithdrawalRecord | mirror immutable Withdrawal timestamp |
| `abstractVersion` | current exact Revision | retain ordinal/display compatibility |
| mutable title/abstract/bio/technicalLevel | current Revision projection | derive/verify against `currentRevisionId` |
| `abstractReviewStatus` | workflow/UI policy projection | do not migrate into a new authoritative status concept |
| `SubmissionTheme` | current Revision Classification | mirror exact current Revision↔Term relation |
| `SubmissionRevision.themeIds` | legacy snapshot | retain for audit/compatibility initially; stop using as canonical relation once backfill verified |
| `deckStatus` | current ArtifactVersion Assessment projection | derive; preserve `REVIEWED` only as temporary legacy state until 003-E resolves UI semantics |
| `Conference.submissionsOpenAt/CloseAt` | AvailabilityWindow | mirror during transition |
| `Conference.submissionsOpen` | application manual override policy | retain until 003-D defines explicit override model |
| `Theme.name/removedAt` | current TermState | mirror for existing queries/UI |
| `Theme.targetMin/targetMax` | CoverageTarget | mirror only for theme-target compatibility |
| `Conference.sponsorMin/sponsorMax` | likely CoverageTarget/policy after validation | do not interpret as Capacity rates |
| `Conference.decksPublished` | Publication/publication-policy compatibility | not exact-material Publication authority |
| `Submission.deckShareable` | publication rights/share policy | remain policy input pending SG-P04 resolution |
| `Conference.status/archivedAt` | broader lifecycle policy + ArchiveRecord | ArchiveRecord cannot be cleared if status later changes |
| `EmailSendRecord.email` | Dispatch endpoint evidence | retain |
| email template key | Dispatch semantic key/message-preparation provenance | retain, but exact message snapshot becomes authoritative evidence |

## Reversibility posture

003-B chooses an **expand-first** migration target.

A later implementation plan should be able to roll back application reads/writes before destructive cleanup because:

1. new structures are added alongside legacy fields first;
2. deterministic backfills do not delete legacy data;
3. compatibility projections remain readable during verification;
4. canonical writes can be shadow-verified before old write paths are disabled;
5. destructive column/table removal is deferred until 003-E/003-F compatibility and rollback gates are passed.

Rollback does not mean deleting newly captured truthful history. If a rollout is reverted, new immutable Selection/Withdrawal/Disclosure/etc. records should normally remain preserved and ignored by the legacy application rather than erased.

## Migration validation requirements carried to 003-F

Before canonical cutover, migration tooling should be able to prove at minimum:

- every current Submission maps to exactly one current Revision or is explicitly quarantined;
- every Revision Classification pair references an existing stable Term;
- every migrated Score/Evaluation references the intended exact Revision with a confidence/provenance classification;
- Selection + Withdrawal projection reproduces legacy current program views for all non-ambiguous rows;
- seeded active Capacity allocations do not exceed the accepted pool limit;
- current Deliverable assessment projection reproduces supported legacy deck states;
- current public listing matches the set of seeded published exact MaterialRefs at cutover;
- new Dispatch sends have immutable exact message evidence;
- current archived contexts have retained ArchiveRecords;
- no migration step claims unrecoverable historical events occurred at invented times.