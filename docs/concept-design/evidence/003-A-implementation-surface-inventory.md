# 003-A — Implementation Surface Inventory

Status: **Supporting reconciliation evidence**  
Authority: historical implementation inventory; canonical semantic ownership is in the [v0 Implementation Ownership Map](../knowledge/reconciliation/minneanalytics-v0-implementation-ownership.md).

## Purpose

Inventory the existing implementation surfaces materially relevant to the accepted v0 concepts, application policies, synchronizations, and derived projections. This inventory does not imply that a file, field, route, or model should become a Concept Design boundary.

## 1. Persistence aggregates

### `Conference`

Source: [`prisma/schema.prisma`](../../../prisma/schema.prisma)

Relevant responsibilities currently co-located:

- application/context identity: `id`, `slug`, `name`;
- broad lifecycle: `status`, `archivedAt`;
- Availability inputs/override: `submissionsOpen`, `submissionsOpenAt`, `submissionsCloseAt`, `timezone`;
- Capacity configuration: `rooms`, `sessionsPerRoom`, `eodTrim`, `graemeSlots`, `sponsorMin`, `sponsorMax`;
- Publication collection gate: `decksPublished`, `decksPublishedAt`;
- Controlled Disclosure policy switch: `blindReviewEnabled`;
- ownership of related persistence collections.

Reconciliation classification: **application aggregate spanning concepts + policy**, not a canonical `Conference` concept.

### `Submission`

Source: [`prisma/schema.prisma`](../../../prisma/schema.prisma)

Current responsibilities include:

- durable submitted-candidate identity;
- participant/contact and offered-content fields;
- `programStatus` + `approvedAt` + `withdrawnAt`;
- `abstractVersion`, `abstractReviewStatus`, acknowledgement/edit timestamps;
- current Deliverable projection through `deckStatus` and `deckShareable`;
- Capacity class signal `isSponsorSession`;
- deferred registration signal `vipRegistered`;
- current Classification through `SubmissionTheme`;
- Revision, Evaluation, Feedback, Deliverable file, Schedule, and Dispatch relations.

Reconciliation classification: **highly overloaded physical aggregate, potentially retainable only with explicit semantic ownership/projection rules**.

### `SubmissionRevision`

Sources:

- [`prisma/schema.prisma`](../../../prisma/schema.prisma)
- [`lib/submission-revision.ts`](../../../lib/submission-revision.ts)
- [`lib/revision-history.ts`](../../../lib/revision-history.ts)

Current behavior:

- versioned title/abstract/bio/technical-level snapshot;
- theme IDs embedded as JSON;
- changed-field metadata and optional change note;
- unique `(submissionId, version)` sequence;
- revision display/diff support.

Reconciliation classification: **strong Revision evidence with reference/history precision gaps**.

### `Score`

Sources:

- [`prisma/schema.prisma`](../../../prisma/schema.prisma)
- [`app/api/scores/route.ts`](../../../app/api/scores/route.ts)
- [`lib/rescoring.ts`](../../../lib/rescoring.ts)

Current behavior:

- unique `(submissionId, reviewerAccessId)` row;
- mutable score + private notes;
- `scoredAbstractVersion` number;
- upsert updates the same row when a reviewer scores again;
- current/stale aggregates and rescore queues are derived by integer-version comparison.

Reconciliation classification: **Evaluation current-state realization that loses prior Revision-specific Evaluation when rescored**.

### `PresenterFeedback`

Sources:

- [`prisma/schema.prisma`](../../../prisma/schema.prisma)
- [`app/api/review/feedback/route.ts`](../../../app/api/review/feedback/route.ts)

Current behavior:

- immutable row per directed feedback entry;
- source reviewer, submission recipient context, body, kind, created time;
- optional `abstractVersion` integer for abstract feedback.

Reconciliation classification: **strong Feedback realization with exact Revision-reference and workflow-coupling gaps**.

### `Theme` + `SubmissionTheme`

Sources:

- [`prisma/schema.prisma`](../../../prisma/schema.prisma)
- [`lib/themes.ts`](../../../lib/themes.ts)
- [`app/api/admin/themes/route.ts`](../../../app/api/admin/themes/route.ts)

Current responsibilities:

- reusable term ID/name/slug/source/proposal provenance/removed state;
- target min/max bounds;
- current submission↔theme joins;
- presenter contribution and admin management;
- restore removed term on repeated proposed slug;
- soft remove used terms; hard delete unused terms.

Reconciliation classification: **one physical taxonomy aggregate spanning Vocabulary + Coverage Target, with current Classification held separately but keyed to Submission rather than exact Revision**.

### `DeckFile` + `Submission.deckStatus`

Sources:

- [`prisma/schema.prisma`](../../../prisma/schema.prisma)
- [`app/api/presenter/deck/route.ts`](../../../app/api/presenter/deck/route.ts)
- [`app/api/chair/deck-status/route.ts`](../../../app/api/chair/deck-status/route.ts)

Current behavior:

- immutable-ish uploaded file rows with integer version and stable public ID;
- latest file selected by version;
- readiness workflow stored as one mutable `Submission.deckStatus` independent of the exact file row.

Reconciliation classification: **good Deliverable artifact-version substrate; insufficient version-specific Assessment ownership/history**.

### Schedule persistence

Source: [`prisma/schema.prisma`](../../../prisma/schema.prisma)

Current structures:

- `ScheduleRoom`;
- `ScheduleSlot`;
- `SchedulePlacement` with unique `(slotId, roomId)` and unique `submissionId`.

Related behavior:

- [`app/api/schedule/placement/route.ts`](../../../app/api/schedule/placement/route.ts) — place/move/swap/unplace realization;
- [`app/api/schedule/generate/route.ts`](../../../app/api/schedule/generate/route.ts) — generated assignment application;
- [`lib/schedule/`](../../../lib/schedule/) — topology, generation, balancing, and auth helpers.

Reconciliation classification: **strong Schedule substrate with generated-authority concern**.

### Dispatch persistence

Sources:

- [`prisma/schema.prisma`](../../../prisma/schema.prisma)
- [`lib/email-send.ts`](../../../lib/email-send.ts)
- [`lib/email-templates.ts`](../../../lib/email-templates.ts)

Current structures:

- `EmailTemplate` — reusable message-authoring configuration;
- `ConferenceEmailBatch` — performed batch key/round/actor/time;
- `EmailSendRecord` — recipient reference, email endpoint, semantic key/round, sent time;
- same-round per-recipient uniqueness constraints.

Reconciliation classification: **strong Dispatch structure; exact MessageRef snapshot absent**.

## 2. Command / mutation surfaces

| Surface | Current behavioral role | Canonical classification |
|---|---|---|
| [`app/api/submissions/route.ts`](../../../app/api/submissions/route.ts) | creates submission, current themes, revision v1, token, confirmation email | SYNC-001-like application command plus unrelated notification implementation |
| [`app/api/presenter/submission/route.ts`](../../../app/api/presenter/submission/route.ts) | updates current content/themes, increments version, appends revision, changes review status | SYNC-002-like command mixed with workflow projection mutation |
| [`app/api/presenter/withdraw/route.ts`](../../../app/api/presenter/withdraw/route.ts) | records withdrawal by replacing `programStatus` | Withdrawal source command with semantic-collision gap |
| [`app/api/chair/program-status/route.ts`](../../../app/api/chair/program-status/route.ts) | organizer disposition, coverage warning, demo score creation, approval email | Selection command mixed with projections/demo side effects/notification |
| [`app/api/scores/route.ts`](../../../app/api/scores/route.ts) | evaluator score upsert against current integer version | Evaluation command with historical-overwrite gap |
| [`app/api/review/feedback/route.ts`](../../../app/api/review/feedback/route.ts) | append Feedback + mutate review status + send email | Feedback command mixed with workflow projection and notification |
| [`app/api/review/submissions/[id]/identity/route.ts`](../../../app/api/review/submissions/[id]/identity/route.ts) | explicit identity reveal under blind review | Controlled Disclosure reveal behavior without persistent disclosure state |
| [`app/api/admin/themes/route.ts`](../../../app/api/admin/themes/route.ts) | create/edit/remove/restore-ish taxonomy terms and target bounds | Vocabulary + Coverage Target administration physically combined |
| [`app/api/presenter/deck/route.ts`](../../../app/api/presenter/deck/route.ts) | add artifact version and reset readiness | Deliverable Provide-like command |
| [`app/api/chair/deck-status/route.ts`](../../../app/api/chair/deck-status/route.ts) | mutate detached deck readiness status | Deliverable assessment-like command with version-binding gap |
| [`app/api/schedule/placement/route.ts`](../../../app/api/schedule/placement/route.ts) | manual placement/move/swap/unplace | strong Schedule command realization |
| [`app/api/schedule/generate/route.ts`](../../../app/api/schedule/generate/route.ts) | clears and directly writes generated assignments | scheduling suggestion/acceptance boundary gap |
| [`app/api/chair/publish-archive/route.ts`](../../../app/api/chair/publish-archive/route.ts) | toggles conference-wide public deck gate | Publication collection-policy command, not Archive |
| [`app/api/chair/email-templates/[key]/send/route.ts`](../../../app/api/chair/email-templates/[key]/send/route.ts) | resolve/send operational batch | Dispatch application command |
| [`app/api/admin/conference/route.ts`](../../../app/api/admin/conference/route.ts) | availability/disclosure/lifecycle configuration and reversible archive status | policy + Availability + Archive concerns combined |

## 3. Policy and projection helpers

### Availability and closure policy

- [`lib/submission-window.ts`](../../../lib/submission-window.ts) computes current submission availability from lifecycle, manual boolean, and timestamps.
- [`lib/conference-active.ts`](../../../lib/conference-active.ts) imposes broad `ACTIVE`-only mutation gating.

### Authority policy

- [`lib/reviewer.ts`](../../../lib/reviewer.ts) resolves token-backed reviewer access.
- [`lib/roles.ts`](../../../lib/roles.ts) maps `ADMIN`/`BOARD`/`CHAIR` roles to capabilities.

These are application authority mechanisms, not an accepted Authorization concept.

### Evaluation currentness / work views

- [`lib/rescoring.ts`](../../../lib/rescoring.ts) derives currentness, stale scores, aggregates, and queue partitioning from `scoredAbstractVersion === abstractVersion`.
- [`lib/revision-history.ts`](../../../lib/revision-history.ts) builds revision/score summaries.
- [`lib/submissions.ts`](../../../lib/submissions.ts) produces combined submission/program/deck/evaluation UI view models.

These are projection-heavy surfaces and should remain derived from canonical owners.

### Controlled Disclosure

- [`lib/review-blind.ts`](../../../lib/review-blind.ts) masks identity and peer aggregate values; aggregate visibility depends on a current viewer score.
- explicit identity reveal currently logs through `logIdentityReveal` rather than persisting participant/context/information reveal state.

### Coverage and composition views

- [`lib/theme-stats.ts`](../../../lib/theme-stats.ts) computes theme counts/target warnings.
- [`lib/chair-heatmaps.ts`](../../../lib/chair-heatmaps.ts) computes program-status/theme and technicality/theme heatmaps.
- [`lib/capacity.ts`](../../../lib/capacity.ts) computes a capacity snapshot from conference configuration and status counts.

These are useful projections but not authoritative Coverage/Capacity state.

### Publication

- [`lib/decks.ts`](../../../lib/decks.ts) derives public deck listings from current conference gate, `programStatus`, `deckStatus`, shareability, and latest file; direct `publicId` access also uses current parent eligibility.

### Dispatch

- [`lib/email-templates.ts`](../../../lib/email-templates.ts) owns current recipient resolution and rendering rules.
- [`lib/email-send.ts`](../../../lib/email-send.ts) persists batches/send records and invokes the provider stub.

## 4. Existing migration/backfill signals

- [`lib/backfill-revisions.ts`](../../../lib/backfill-revisions.ts) already provides an idempotent v1 revision backfill from current Submission + current themes.
- `backfill-scored-versions.ts` (same `lib/` area) establishes scored version values for historical Score rows where possible.

These demonstrate that the existing codebase already uses additive/backfill patterns, which Phase 003-B/003-F can reuse. They do not establish that all new semantic histories can be reconstructed retroactively.

## 5. Inventory conclusion

The current repository contains meaningful implementation support for every major Phase 002 area, but realization quality varies substantially:

- strong substrates exist for Revision snapshots, Feedback, Schedule placement, and Dispatch batches;
- several concepts are currently represented only by mutable combined fields or derived helpers;
- the highest semantic risk comes from histories that are overwritten or never persisted, not from directory/module naming.

See the canonical [003-A Semantic Gap Baseline](../knowledge/reconciliation/semantic-gap-baseline.md) for the prioritized consequences.
