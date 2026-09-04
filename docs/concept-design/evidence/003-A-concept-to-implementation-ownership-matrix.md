# 003-A — Concept-to-Implementation Ownership Matrix

Status: **Supporting reconciliation evidence**  
Canonical compact owner: [MinneAnalytics v0 Implementation Ownership Map](../knowledge/reconciliation/minneanalytics-v0-implementation-ownership.md)

## Purpose

Record the detailed concept-by-concept mapping used to establish the canonical ownership map. “Current owner” describes implementation location, not normative semantic authority.

| Concept | Current persistence | Key behavior/helpers | Fit | Principal reconciliation question |
|---|---|---|---|---|
| Proposal | `Submission.id` + offered/contact fields | submission POST; presenter portal queries | Partial | Can `Submission.id` remain the durable ProposalRef while mutable form and downstream states become explicit owners/projections? |
| Revision | `SubmissionRevision`; `Submission.abstractVersion`; duplicated current fields | submission create/edit, revision snapshot/diff/backfill | Partial/strong | Which identifier is canonical RevisionRef, how is current form projected, and how are integer-version compatibility fields retained? |
| Availability Window | Conference open/close timestamps + `submissionsOpen` | `getSubmissionWindowState`; admin conference route | Partial | Which state is canonical interval versus explicit manual/lifecycle override, and how should half-open close semantics be represented? |
| Evaluation | `Score` | score upsert, rescoring/current aggregate helpers | Conflicting | How do we preserve old Revision-specific Evaluations when a reviewer evaluates a later Revision? |
| Controlled Disclosure | no dedicated durable rows | `blindReviewEnabled`, masking, identity endpoint/log, score-gated aggregate reveal | Conflicting | What durable staging/reveal state is minimally required, and what current policy switch remains only configuration? |
| Feedback | `PresenterFeedback` | feedback route, presenter display | Partial/strong | How should `abstractVersion` map to exact RevisionRef and how are status/email side effects separated? |
| Selection | `Submission.programStatus`, `approvedAt` | program-status route; status-based queries/views | Conflicting | How is immutable Decision history introduced while preserving current status API/UI compatibility? |
| Withdrawal | `programStatus=WITHDRAWN`, `withdrawnAt` | presenter withdraw route | Conflicting | How is Withdrawal preserved independently when current schema uses the same Selection status field? |
| Capacity | Conference config only; no allocation rows | `computeCapacity`, sponsor-session flag, status counts | Derived-only | What Pool/Allocation realization and transaction boundary can coexist safely with existing config/scheduling assumptions? |
| Coverage Target | `Theme.targetMin/targetMax` | theme stats, saturation warning, heatmaps | Partial | Can bounds remain physically on Theme while semantically owned/versioned as Coverage Target, and how is “no target” represented? |
| Vocabulary | `Theme` | presenter proposal, admin create/update/remove, selectable-theme queries | Partial/conflicting | How is append-only Term state preserved without requiring unnecessary taxonomy table explosion? |
| Classification | `SubmissionTheme`; revision JSON theme snapshots | submission create/edit; theme helpers | Partial/conflicting | How are exact Revision↔Term associations made authoritative and current Proposal classification projected? |
| Deliverable | `DeckFile`; `Submission.deckStatus` | deck upload/review helpers/routes | Conflicting | How is version-specific Assessment history attached to the exact DeckFile while retaining current queue behavior? |
| Schedule | room/slot/placement tables | grid generation, manual placement, generator | Partial/strong | How is generator output made advisory/explicitly accepted without losing useful existing topology and placement rows? |
| Publication | `Conference.decksPublished`, `deckShareable`, `DeckFile.publicId` | publish route, public listing/resolver | Conflicting | What explicit Publication/MaterialRef state is needed to preserve exact exposure history and prevent unintended historical-file access? |
| Dispatch | email batch/send records | templates, audience resolution, preview/send | Partial/strong | How is exact rendered MessageRef preserved, and how are same-round retries aligned with uniqueness/idempotency? |
| Archive | `Conference.status`, `archivedAt` | admin conference route, active mutation guard, archive queries | Conflicting | If reopen is retained, how can immutable closure provenance survive while broad lifecycle state remains separate? |

## Aggregate ownership map

### `Submission`

Semantic owners currently represented directly or by projection:

| Current field/group | Canonical owner/classification |
|---|---|
| `id` | candidate ProposalRef |
| title/abstract/bio/technicalLevel | current Revision projection |
| contact/presenter attributes | application participant/profile data; not one of the 17 concepts by default |
| `programStatus` | combined Selection + Withdrawal compatibility projection; not canonical |
| `approvedAt` | current Selection-derived/provenance-like field; not sufficient Decision history |
| `withdrawnAt` | Withdrawal provenance but not independent record |
| `abstractVersion` | Revision current-position compatibility projection |
| `abstractReviewStatus` | workflow/projection state; not canonical concept state |
| `abstractVersionAcknowledgedAt` | unresolved review-work acknowledgement/application workflow evidence |
| `lastPresenterEditAt` | Revision/application convenience projection |
| `deckStatus` | Deliverable current-readiness compatibility projection |
| `deckShareable` | Publication eligibility/share-policy input |
| `isSponsorSession` | Capacity accounting-class/application attribute |
| `vipRegistered` | deferred Registration/operational fact |
| `themes` relation | current Classification compatibility projection |

### `Theme`

| Current field/group | Canonical owner/classification |
|---|---|
| `id` | candidate Vocabulary TermRef |
| `name` | current Vocabulary TermState projection |
| `removedAt` | current Vocabulary availability projection |
| `source`, proposal provenance | Vocabulary/application stewardship provenance |
| `targetMin`, `targetMax` | Coverage Target state physically co-located |
| `sortOrder`, `slug` | implementation/UI identity convenience unless later proved semantically required |

### `Conference`

| Current field/group | Canonical owner/classification |
|---|---|
| `status` | broad application lifecycle compatibility state; overlaps Archive but is not Archive |
| `archivedAt` | Archive provenance-like field with mutability conflict |
| `submissionsOpenAt/CloseAt` | Availability Window interval inputs |
| `submissionsOpen` | application override/policy input |
| room/session/capacity configuration | Schedule topology + Capacity configuration inputs |
| sponsor min/max | current planning/accounting policy/config; not Coverage Target by default |
| `decksPublished` | current Publication collection gate/projection |
| `blindReviewEnabled` | Controlled Disclosure application policy switch |

## Route ownership observations

Some routes currently coordinate multiple owners and therefore should later become explicit application-command boundaries rather than be assigned wholesale to one concept:

- submission creation already approximates Proposal + Revision + Classification synchronization and then sends a confirmation email;
- presenter revision coordinates Revision + current Classification but also mutates `abstractReviewStatus`;
- program status coordinates Selection plus Coverage warning, demo scoring, and notification;
- Feedback creation writes Feedback plus workflow state and email;
- deck publication toggles an application-wide Publication gate rather than exact material identities.

This is not inherently a reason to split routes. It is a reason to make transaction/synchronization ownership explicit in 003-C.

## Data-preservation observation

Several current structures contain enough data to bootstrap more precise semantics:

- `SubmissionRevision.id/version/themeIds` can support exact Revision mapping and historical Classification backfill;
- `Score.scoredAbstractVersion` can often locate the Revision a current Score describes, but prior overwritten Score values cannot be recovered from the current row alone;
- `DeckFile.version` can identify artifact history, but historical readiness assessments cannot be reconstructed if only the latest mutable `deckStatus` was retained;
- current `ConferenceEmailBatch`/`EmailSendRecord` preserve send participants/rounds but not exact rendered message bodies;
- a cleared `withdrawnAt` or changed `programStatus` may have erased prior Selection/Withdrawal history that cannot be reliably reconstructed from current rows alone.

Phase 003-B and 003-F must distinguish **backfillable precision** from **irrecoverable historical detail** rather than manufacturing provenance.
