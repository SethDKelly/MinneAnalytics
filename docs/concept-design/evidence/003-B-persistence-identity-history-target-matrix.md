# 003-B — Persistence, Identity & History Target Matrix

Status: **Design evidence**  
Authority: supporting implementation-reconciliation evidence; canonical target is in `knowledge/reconciliation/`.

## Purpose

Translate the accepted concept/reference model and 003-A semantic gaps into a concrete persistence target **without changing the Prisma schema yet**.

This matrix distinguishes:

- identifiers that can be reused;
- new durable records that are actually required;
- compatibility projections that may remain during rollout;
- history that must be preserved natively going forward.

The target deliberately does **not** require one table per Concept Design concept.

## Target principles

1. Reuse existing stable row IDs when they already identify the right semantic object.
2. Add a new durable identity only when no existing object can preserve the concept's required state/history.
3. Prefer exact foreign-key references over integer-version correlation once the exact object already has a stable ID.
4. Preserve immutable event/history records where the concept requires retained history; do not make every mutable configuration append-only without evidence.
5. Retain current aggregate columns as compatibility projections only when they can be recomputed from canonical owners.
6. Backfilled records must distinguish observed current state from known historical events; migration must not invent actors, times, or lost prior values.

## Concept/reference target

| Concept / concern | Canonical reference target | Target persistence direction | Current compatibility surface |
|---|---|---|---|
| Proposal | reuse `Submission.id` | no parallel Proposal table required for v0; `Submission` may remain physical aggregate | `Submission` row |
| Revision | reuse `SubmissionRevision.id` | make exact revision ID primary reference; add predecessor/current-revision linkage; keep version number as compatibility/order projection | `Submission.abstractVersion` and current mutable content |
| Availability Window | **new stable Window ID** | add a distinct window record for the proposal-submission opportunity with non-null `[opensAt, closesAt)` | `Conference.submissionsOpenAt/submissionsCloseAt`; `submissionsOpen` remains policy override |
| Evaluation | reuse `Score.id` | associate each Score/Evaluation with exact `SubmissionRevision.id`; uniqueness becomes evaluator + exact Revision | `submissionId`, `scoredAbstractVersion`, current score helpers |
| Controlled Disclosure | **new Disclosure ID** | persist participant + review context + information identity + staged/reveal provenance | blind-review flag/masking helpers remain policy/view compatibility |
| Feedback | reuse `PresenterFeedback.id` | add exact Revision FK for abstract feedback; general feedback may remain Proposal-scoped | `abstractVersion` retained during transition |
| Selection | **new Decision ID per event** | append immutable decision chain per `(conference/selection-context, Submission.id)` | `Submission.programStatus`, `approvedAt` become derived compatibility |
| Withdrawal | **new Withdrawal ID** | one immutable Withdrawal per Proposal/participation; preserve actor/time independently | `programStatus=WITHDRAWN`, `withdrawnAt` become derived compatibility |
| Capacity | **new Pool / Allocation IDs** | durable finite Pool, current class-rate configuration, immutable allocation with release provenance | current Conference capacity configuration and `computeCapacity` remain planning inputs/views |
| Coverage Target | **new Target ID** | generic target row keyed by collection/context + dimension + bucket + measure + lower/upper bounds | `Theme.targetMin/targetMax`, sponsor target settings remain compatibility inputs until migrated |
| Vocabulary | reuse `Theme.id` as TermRef | add immutable TermState chain; Theme current fields may remain projection/application metadata | `Theme.name`, `removedAt`, `source`, `slug`, `sortOrder` |
| Classification | exact `SubmissionRevision.id` + `Theme.id` | add exact Revision↔Term relation; set-like current relation for each immutable Revision | `SubmissionTheme` mirrors current Revision; `SubmissionRevision.themeIds` remains legacy snapshot |
| Deliverable | **new Deliverable Requirement ID**; reuse `DeckFile.id` as ArtifactVersion | requirement row + artifact predecessor/current linkage + immutable version-specific assessment chain | `Submission.deckStatus` becomes derived compatibility; DeckFile storage fields remain implementation state |
| Schedule | reuse ScheduleRoom/Slot/Placement IDs | current persistence largely retained; no new history table required by concept in 003-B | existing schedule tables |
| Publication | **new Publication ID + PublicationState IDs**; reuse `DeckFile.id` as MaterialRef | exact material + public-surface identity with append-only published/unpublished state chain | `Conference.decksPublished`, `Submission.deckShareable`, latest-deck listing remain policy/compatibility |
| Dispatch | reuse Batch and SendRecord IDs | extend SendRecord to own stable recipient reference and exact rendered message snapshot/reference | template key, round, email endpoint, recipient FKs retained |
| Archive | **new Archive record** keyed to Conference context | immutable one-time closure record with actor/time provenance | `Conference.status`/`archivedAt` remain lifecycle/compatibility projection |

## Proposed logical persistence shapes

The names below are logical target names, not authorized Prisma model names.

### Proposal + Revision

**ProposalRef** = existing `Submission.id`.

Revision target:

```text
RevisionRecord
- id = existing SubmissionRevision.id
- proposalId -> Submission.id
- predecessorRevisionId -> RevisionRecord.id?
- form snapshot fields
- changed/provenance metadata
- recordedAt
```

Proposal/current projection target:

```text
Submission.currentRevisionId -> RevisionRecord.id
Submission.abstractVersion   = compatibility ordinal
Submission.title/...         = compatibility/current-row projection
```

`version` may remain for display, migration lookup, and ordering, but exact references should use `SubmissionRevision.id`. Existing revisions can reconstruct predecessor links deterministically from `(submissionId, version)`.

### Availability Window

```text
AvailabilityWindowRecord
- id
- conferenceId
- opportunityKey = "PROPOSAL_SUBMISSION" for current v0 use
- opensAt          // required
- closesAt         // required
```

Required invariant: `opensAt < closesAt`.

Current null bounds cannot be converted to fabricated extreme dates. A conference lacking a complete interval remains a legacy-compatibility case until explicitly normalized.

`Conference.submissionsOpen` is **not** Window state; it remains an application override/policy input pending 003-D.

### Evaluation

Reuse `Score.id` rather than manufacture a parallel Evaluation identity.

Target relation:

```text
Score/Evaluation
- id
- submissionRevisionId -> SubmissionRevision.id
- reviewerAccessId
- value                 // current Judgment realization
- notes                 // current privateContext realization
- recordedAt
- lastChangedAt
```

Target uniqueness:

```text
(submissionRevisionId, reviewerAccessId)
```

An evaluator may update the same row for the same exact Revision, consistent with `Evaluation.Revise`. Scoring a later Revision creates a different Evaluation row rather than moving the earlier row's subject.

`submissionId` and `scoredAbstractVersion` may remain denormalized compatibility fields until reads migrate.

### Controlled Disclosure

A new durable relation is required because current masking/logging has no persistent exposure identity.

Logical target:

```text
DisclosureRecord
- id
- participantRef         // current v0: ReviewerAccess.id
- reviewContextRef       // current v0: Proposal/review-context reference
- informationKey        // semantic information identity
- exactSubjectRef?      // e.g. Revision.id where information is revision-specific
- stagedAt
- revealedByRef?
- revealedAt?
- migrationProvenance?
```

Uniqueness is the concrete realization of `(participant, context, information)`.

For current review behavior, expected information families include presenter identity and peer/aggregate information. Exact key/reference taxonomy and reveal authority remain 003-D policy work.

No historical reveal should be invented where legacy behavior did not persist it.

### Feedback

`PresenterFeedback.id` remains FeedbackRef.

For `kind=ABSTRACT`, target adds:

```text
submissionRevisionId -> SubmissionRevision.id
```

`abstractVersion` may remain temporarily for compatibility/backfill verification. `GENERAL` feedback may legitimately have no Revision FK and remain associated with the durable Proposal context.

### Selection

A new immutable decision record is required.

```text
SelectionDecision
- id
- selectionContextRef   // current v0 context may be Conference.id
- proposalId            // Submission.id
- disposition?          // selected | reserve | notSelected | null(clear)
- decidedByRef
- decidedAt
- predecessorDecisionId?
- migrationProvenance?
```

Current decision points to the terminal chain member; implementation may materialize a pointer or derive the terminal deterministically.

`PENDING` is not a canonical decision. Compatibility `ProgramStatus` is derived from current Selection plus Withdrawal.

### Withdrawal

```text
WithdrawalRecord
- id
- proposalId            // unique in v0
- withdrawnByRef
- withdrawnAt
- migrationProvenance?
```

The record is immutable and independent from Selection. Existing `Submission.withdrawnAt` becomes a compatibility projection rather than the sole authority.

### Capacity

The current room/count snapshot does not become Capacity authority.

Target:

```text
CapacityPool
- id
- contextRef            // current v0: Conference.id
- key
- limitUnits

CapacityClassRate
- poolId
- classRef
- units

CapacityAllocation
- id
- poolId
- proposalId            // CommitmentRef in current v0
- classRef
- unitsApplied
- allocatedByRef
- allocatedAt
- releasedByRef?
- releasedAt?
```

Existing evidence does not show sponsor sessions consuming a different number of slots than community sessions. Therefore v0 should not invent a sponsor-specific Capacity rate merely because `sponsorMin/sponsorMax` exist. A default one-unit class is sufficient unless later evidence requires another rate.

The current sponsor min/max configuration is better treated as representation/planning intent and is mapped to Coverage Target/application policy, not class-rate semantics.

### Coverage Target

Use a distinct target identity rather than leaving desired bounds embedded only in Vocabulary rows.

Logical target:

```text
CoverageTargetRecord
- id
- collectionRef         // current v0: Conference.id / program collection
- dimensionKey          // e.g. theme, session-kind
- bucketRef             // Theme.id, "sponsor", etc.
- measureKey            // current v0: count
- lowerBound?
- upperBound?
```

At least one bound is present. `0/0` legacy Theme values mean no explicit theme target unless product intent says otherwise; do not create a zero-width canonical target automatically.

Current `Theme.targetMin/targetMax` may remain a mirror during migration. Current `sponsorMin/sponsorMax` can seed a session-kind Coverage Target if validated as desired representation rather than hard capacity.

### Vocabulary

Reuse `Theme.id` as stable TermRef.

Add immutable state history:

```text
TermState
- id
- termId -> Theme.id
- label
- availability          // available | retired
- recordedByRef?
- recordedAt?
- predecessorStateId?
- migrationProvenance?
```

Native future state records require real actor/time provenance. A legacy current-state seed may have unknown actor/event time and must be marked as observed/backfilled rather than fabricated history.

`Theme.name` and `removedAt` can remain current projections. `slug`, `source`, and `sortOrder` remain application metadata, not TermState semantics.

Hard deletion of an established Theme/Term is not compatible with the target once historical references exist.

### Classification

Target exact relation:

```text
RevisionTerm
- submissionRevisionId
- themeId
PRIMARY KEY (submissionRevisionId, themeId)
```

Existing `SubmissionRevision.themeIds` snapshots make most historical relations deterministically backfillable.

`SubmissionTheme` may remain as a fast current-Revision mirror for legacy APIs/UI, but it is not canonical. It must be reconstructible from `Submission.currentRevisionId -> RevisionTerm`.

### Deliverable

A new durable requirement is justified because SYNC-005 establishes a requirement before/independently of file provision.

```text
DeliverableRequirement
- id
- proposalId
- responsibleRef
- kindKey              // current v0: slide-deck
- currentArtifactId?

DeckFile / ArtifactVersion
- id = existing DeckFile.id
- deliverableId
- predecessorArtifactId?
- existing immutable storage/file metadata

DeliverableAssessment
- id
- artifactVersionId -> DeckFile.id
- disposition           // concern | ready
- detail?
- reviewedByRef
- reviewedAt
- predecessorAssessmentId?
- migrationProvenance?
```

`DeckStatus.SUBMITTED` becomes `provided && awaitingReview`; `APPROVED` maps to ready and `CONCERN` maps to concern. `REVIEWED` has no accepted intrinsic semantic equivalent and must remain compatibility-only until 003-E determines UX/API treatment.

### Schedule

No persistence decomposition is required by 003-B. Existing Room/Slot/Placement identities can remain.

The direct generator overwrite problem is transactional/authority behavior for 003-C/003-E, not evidence that another Schedule persistence hierarchy is needed.

### Publication

A new exact-material Publication identity and immutable state chain are required.

```text
PublicationRecord
- id
- materialDeckFileId -> DeckFile.id
- publicSurfaceKey

PublicationState
- id
- publicationId
- availability          // published | unpublished
- recordedByRef
- recordedAt
- predecessorStateId?
- migrationProvenance?
```

`DeckFile.publicId` remains a delivery/address token, not Publication identity.

Replacing the latest DeckFile never repoints an existing Publication. The replacement receives its own Publication if intentionally exposed.

### Dispatch

Retain existing `ConferenceEmailBatch.id` and `EmailSendRecord.id`.

Strengthen `EmailSendRecord` so it can serve as the immutable MessageRef evidence:

```text
EmailSendRecord
- existing batch/context/key/round/recipient data
- stable recipient identity (submissionId or attendeeId; explicit kind if useful)
- email endpoint used
- renderedSubject
- renderedBody
- optional contentHash/version marker
- sentAt
```

Existing template IDs remain provenance/message-preparation metadata; they are insufficient as the exact MessageRef by themselves.

`recipientCount` can remain a cached/compatibility value if verified against SendRecords.

### Archive

A new immutable closure record is required:

```text
ArchiveRecord
- id
- contextRef            // current v0: Conference.id, unique
- archivedByRef
- archivedAt
- migrationProvenance?
```

`Conference.status` may continue expressing broader DRAFT/ACTIVE lifecycle policy, but moving away from `ARCHIVED` cannot delete the ArchiveRecord. `Conference.archivedAt` becomes a compatibility mirror and may eventually be removed.

## Foreign-key and deletion posture

Historical concept records should not disappear because a convenience aggregate is hard-deleted.

Target implementation planning should prefer either:

- restricting destructive deletion of a Conference/Submission/Theme once durable histories exist; or
- an explicit deletion/retention design that preserves required references.

Blind `onDelete: Cascade` from application aggregates into Selection, Evaluation, Withdrawal, Publication, Archive, or Vocabulary history would undermine the accepted semantics. 003-D/003-F must determine the operational deletion policy before new history tables inherit cascade behavior.

## Compatibility-field rule

A compatibility field may remain during rollout when all three are true:

1. its canonical source can be named;
2. it can be recomputed or verified against that source;
3. write ownership is controlled so it cannot diverge silently.

This applies particularly to:

- `programStatus` / `approvedAt` / `withdrawnAt`;
- `abstractVersion` and current mutable submission content;
- `abstractReviewStatus`;
- `SubmissionTheme`;
- `deckStatus`;
- `Theme.name` / `removedAt` / target fields;
- Conference submission-window fields;
- `decksPublished` / `archivedAt`;
- cached recipient counts and other projections.

003-C decides dual-write/transaction boundaries; 003-E decides API/UI compatibility lifetime; 003-F decides rollout/removal sequencing.