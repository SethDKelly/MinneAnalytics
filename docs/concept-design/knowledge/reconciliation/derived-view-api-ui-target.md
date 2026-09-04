---
type: Derived View API UI Target
title: MinneAnalytics v0 Derived View, API & UI State Target
description: Canonical read-model and interface-state architecture for exposing concept truth, policy outcomes, compatibility projections, and operational convergence without creating competing authority.
tags: [concept-design, implementation-reconciliation, derived-view, api, ui, compatibility, v0]
status: stable
authority: canonical
phase: 003-E
sources:
  - { id: phase, resource: ../../003-E-derived-views-api-ui-state-and-compatibility-reconciliation.md, title: 003-E Derived Views API UI State & Compatibility Reconciliation }
  - { id: matrix, resource: ../../evidence/003-E-derived-view-and-interface-state-matrix.md, title: 003-E Derived View & Interface State Matrix }
  - { id: ownership, resource: minneanalytics-v0-implementation-ownership.md, title: MinneAnalytics v0 Implementation Ownership Map }
  - { id: policy, resource: authority-lifecycle-operational-policy-target.md, title: MinneAnalytics v0 Authority Lifecycle & Operational Policy Target }
  - { id: disclosure, resource: disclosure-publication-policy-baseline.md, title: MinneAnalytics v0 Disclosure Sharing & Publication Policy Baseline }
---
# Purpose

Define how canonical concept state, application policy, derived projections, compatibility fields, and transient execution state are exposed through APIs and user interfaces during and after implementation reconciliation.

This node does not redefine concept state. It defines **read-model authority**: interfaces may summarize authoritative facts, but a summary does not become another source of truth merely because users see or filter by it.

# Interface state classes

Every API/UI field that describes product state must be attributable to one of four classes.

## 1. Canonical fact

Directly identifies or reports state owned by a concept/history, for example:

- Proposal identity;
- exact current Revision identity;
- current Selection disposition and Decision reference;
- Withdrawal existence/reference;
- exact ArtifactVersion and current Deliverable Assessment;
- exact Publication identity/state;
- Controlled Disclosure concealed/revealed state;
- Archive closure;
- Capacity Pool/Allocation state.

Canonical facts may be projected for convenience, but writes must route to the owning command/action.

## 2. Derived application view

Computed from canonical owners and policy without adding authoritative state, for example:

- effective participation;
- proposal edit eligibility and denial reason;
- whether an evaluator needs an Evaluation for the current Revision;
- current aggregate score/count;
- Coverage gap/warning;
- current Deliverable readiness summary;
- public listing eligibility;
- Schedule eligibility;
- dashboard work queues.

Derived views may be cached/materialized if reconstructible.

## 3. Compatibility projection

A legacy field retained to keep current code/API/UI working during migration, for example:

- `programStatus`;
- integer `abstractVersion`;
- current Submission content fields;
- `SubmissionTheme` current associations;
- `deckStatus`;
- `submissionsOpen`;
- `ConferenceStatus`;
- `decksPublished`;
- `deckShareable`.

After canonical write cutover these fields are **canonical -> compatibility only**. They are never allowed to win a conflict against canonical state.

## 4. Transient execution state

Describes an operation, synchronization, or external boundary rather than domain truth, for example:

- applying;
- cleanup pending;
- retrying;
- blocked/uncertain provider outcome;
- generation proposal awaiting acceptance;
- upload bytes stored but ArtifactVersion commit not complete.

Transient execution state must never replace the source-authoritative fact. A withdrawn Proposal remains withdrawn even if downstream cleanup is pending.

# Read-model composition rule

Read models should be assembled from canonical owners first, then policy/derived views, then compatibility projections only where a consumer still requires them.

Preferred conceptual order:

```text
canonical concept facts
        +
application policy
        +
projection calculations
        +
optional operation state
        ↓
semantic read model
        ↓
legacy compatibility fields if needed
```

A legacy row is not the preferred read source merely because it contains a convenient pre-composed enum.

# Proposal/program view

The current `programStatus` collapses Selection and Withdrawal. Target read models expose them separately.

Recommended semantic shape:

```text
selection:
  disposition: selected | reserve | not-selected | none
  decisionRef
  decidedAt

withdrawal:
  withdrawn: boolean
  withdrawalRef?
  withdrawnAt?

participation:
  effective: boolean
  reason: selected | reserve | not-selected | withdrawn | undecided
```

`effective` remains derived from the accepted synchronization contract; it is not persisted as another concept state.

## Legacy `programStatus` projection

During compatibility:

1. if Withdrawal exists -> `WITHDRAWN`;
2. else current Selection `selected` -> `APPROVED`;
3. else current Selection `reserve` -> `BACKUP`;
4. else current Selection `not-selected` -> `DECLINED`;
5. else -> `PENDING`.

This projection is intentionally lossy. For example, a withdrawn selected Proposal still has a historical/current Selection disposition even though the compatibility field shows only `WITHDRAWN`.

New command APIs must never accept `programStatus` as the semantic mutation primitive.

# Revision and evaluation view

Target API/UI state uses exact Revision references, not only integer versions.

Recommended semantic shape:

```text
revision:
  currentRevisionRef
  ordinal
  changedAt

myEvaluation:
  state: not-recorded | current | historical
  evaluationRef?
  subjectRevisionRef?

reviewNeed:
  needsEvaluation: boolean
  reason: never-evaluated | revision-changed | none
```

`needsEvaluation` is derived by comparing the evaluator's applicable Evaluation subject to the exact current Revision.

The current `Needs rescore` queue remains a valid user-facing work queue, but it is a projection—not Evaluation state.

# Aggregate and peer-visibility view

Aggregate judgment views must be computed for one exact Revision.

When Controlled Disclosure applies, the API should expose protected information using an explicit discriminated state rather than blanking fields and expecting consumers to infer concealment.

Preferred shape:

```text
peerAggregate:
  visibility: concealed | revealed
  revisionRef
  value?: { count, sum, average }
```

When concealed, protected aggregate values are absent.

A new Revision creates a distinct peer-aggregate disclosure item. Prior aggregate reveal does not make the new Revision visible.

# Presenter identity visibility

Presenter identity is Proposal-level protected information under blind review.

Preferred shape:

```text
presenterIdentity:
  visibility: concealed | revealed | ordinary
  revealAvailable: boolean
  value?: { name, organization, email }
```

`ordinary` means the information was not staged under blind review and therefore does not require a fabricated Reveal history.

The target avoids empty strings such as `firstName: ""` as the semantic representation of concealment.

# Edit eligibility view

The UI must not infer editing rights from `programStatus` or `abstractReviewStatus`.

Preferred semantic projection:

```text
editEligibility:
  allowed: boolean
  reason:
    allowed
    | window-not-open
    | window-closed
    | manually-suspended
    | withdrawn
    | decision-locked
    | archived
    | revision-exception-required
    | capability-denied
  revisionExceptionActive: boolean
```

The server remains authoritative. UI hiding/disabling is explanatory only.

# `abstractReviewStatus` compatibility

The current `abstractReviewStatus` mixes feedback, revision acknowledgement, and edit/workflow cues that do not map one-to-one onto accepted concepts.

Therefore 003-E does **not** manufacture a canonical replacement enum.

Target consumers instead read:

- current Revision identity;
- Evaluation applicability/work queue;
- Feedback records;
- explicit revision-exception policy;
- edit eligibility.

During coexistence, `abstractReviewStatus` may remain as a legacy compatibility field for existing UI/API consumers. It must be labeled internally as non-authoritative and must not be used as a source for new canonical actions after cutover.

Native target behavior should stop producing new semantic dependence on `CURRENT`, `FEEDBACK_PENDING`, `REVISED`, or `ACKNOWLEDGED`.

003-F must define when legacy values are frozen, projected where safely possible, and finally retired.

# Deliverable view

Deliverable UI must bind readiness to the exact current ArtifactVersion.

Recommended semantic shape:

```text
deliverable:
  requirementRef?
  currentArtifactVersionRef?
  versionOrdinal?
  readiness: not-required | not-provided | awaiting-review | concern | ready
  assessmentRef?
```

A replacement ArtifactVersion immediately causes the new current artifact to be `awaiting-review` until assessed, without erasing prior assessments.

## Legacy `deckStatus` projection

For target-native state:

- no applicable artifact -> `null`;
- current artifact with no concern/ready Assessment -> `SUBMITTED`;
- latest applicable Assessment `concern` -> `CONCERN`;
- latest applicable Assessment `ready` -> `APPROVED`.

`REVIEWED` has no accepted independent semantic owner. Existing legacy rows may preserve it as a compatibility snapshot during migration, but target-native commands do not create a new `REVIEWED` state merely to keep the old enum populated.

# Availability view

Proposal-offer availability is exposed as a derived policy result, not as the legacy manual boolean.

Recommended shape:

```text
offerAvailability:
  phase: upcoming | open | closed
  allowed: boolean
  reason: available | setup | archived | manually-suspended | upcoming | closed
  opensAt
  closesAt
```

The phase comes from the canonical half-open Availability Window. Manual suspension affects `allowed`, not the Window phase.

# Context lifecycle view

`ConferenceStatus` remains a compatibility presentation but target consumers distinguish application mode from Archive truth.

Preferred semantic shape:

```text
context:
  mode: setup | live
  archived: boolean
  archivedAt?
  interaction: active | historical
```

When Archive exists, compatibility `ConferenceStatus` projects to `ARCHIVED` regardless of prior mode. Without Archive, setup/live may project to `DRAFT`/`ACTIVE`.

`readOnly` is a UI convenience, not an authorization fact. Post-Archive Publish/Unpublish, safe Dispatch, export, and recovery may still be permitted for specific capabilities.

# Capacity and representation views

Capacity UI reads the canonical Pool/Allocation ledger and may expose:

- limit;
- committed;
- remaining;
- saturated.

Coverage views remain explicitly advisory:

- observed value;
- target lower/upper bound;
- gap/excess;
- warning/confirmation requirement.

A Coverage warning must be visually and semantically distinguishable from a hard Capacity failure.

# Schedule view

Schedule generation must surface a non-authoritative proposal before it changes placements.

Recommended proposal shape:

```text
generationProposal:
  proposalRef
  basedOnScheduleVersion
  placements
  warnings
  applyEligibility
```

Applying requires `MANAGE_SCHEDULE` and an expected-base check. A stale proposal produces a conflict rather than silently replacing intervening planner work.

Authoritative Schedule reads expose current placements separately from the latest generated proposal.

# Publication/public archive view

Public listing and public-file resolution derive from exact Publication identities plus current eligibility.

Organizer view should distinguish:

```text
sharingPolicy:
  eligible: boolean
  provenance: native | legacy-current-state | unknown

publication:
  state: unpublished | published
  publicationRef?
  materialRef
```

A MaterialRef can be share-eligible but unpublished.

A public surface must not list or serve a file solely because `deckShareable`, `deckStatus`, or an event-wide `decksPublished` flag appears favorable.

If unpublish convergence is pending after an eligibility loss, public reads still suppress the material immediately from source-authoritative eligibility truth.

# Dispatch view

Operational communication UI separates:

- resolved audience;
- exact preview messages;
- semantic round;
- same-round already-sent recipients;
- prepared/attempt state;
- confirmed SendRecords;
- uncertain/blocked provider outcomes.

`includeAlreadyEmailed` is not a target semantic control. Intentional repeat communication creates a new RoundRef.

# Operational convergence views

Administrative interfaces may surface recovery state when it helps operators act, but should use user-meaningful language rather than expose raw outbox implementation fields.

Examples:

- `Withdrawal recorded — schedule cleanup pending`;
- `Publication blocked from public view — unpublish cleanup pending`;
- `Message delivery outcome uncertain — do not retry automatically`.

Ordinary participant/public interfaces should usually show source-authoritative truth immediately and hide recoverable infrastructure detail unless action is required.

# Command/API boundary rule

Query/read APIs may be composition-oriented. Mutation APIs must be action-oriented.

Preferred command boundaries include actions such as:

- append Selection Decision;
- record Withdrawal;
- create Revision;
- record Evaluation;
- create Feedback;
- record Deliverable Assessment;
- change sharing policy;
- Publish/Unpublish exact material;
- accept Schedule generation proposal;
- perform Dispatch for an explicit semantic round.

A generic `setStatus` endpoint is not an acceptable long-term command surface when the status spans multiple concept owners.

# Error contract

Target command APIs return machine-readable reason codes so UI behavior does not parse English strings.

Error categories should distinguish at least:

- authentication failure;
- capability/scope denial;
- lifecycle/availability denial;
- concept/precondition conflict;
- expected-head/concurrency conflict;
- Capacity conflict;
- disclosure/publication eligibility denial;
- external outcome uncertainty;
- validation failure.

HTTP codes may remain conventional (`401`, `403`, `409`, `422`, `503` as appropriate), but the stable application `code` is the UI contract.

Error details must not leak concealed information or unauthorized resource existence.

# UI badge rule

A badge may summarize a projection, but its label must name the thing being summarized.

Preferred examples:

- `Selection: Selected`;
- `Participation: Withdrawn`;
- `Revision: v3 — evaluation needed`;
- `Deck v2: Ready`;
- `Public: Published`;
- `Sharing: Legacy eligible`.

Avoid a generic `Status` badge when the value conflates independent owners.

# Queue rule

Queues are read models, not persisted workflow state.

Examples that remain valid derived queues:

- needs Evaluation;
- needs Evaluation after Revision;
- Deliverable awaiting review;
- Capacity/coverage warning review;
- cleanup/recovery attention;
- Dispatch uncertain outcome.

Moving an item between queues must be caused by authoritative concept/policy change, not by updating a queue status field.

# Anti-bloat constraints

003-E does not require:

- GraphQL or a new API framework;
- a dedicated read-model database;
- CQRS infrastructure;
- event sourcing;
- one API resource per Concept Design concept;
- redesigning every screen before migration begins.

The existing Next.js/Prisma stack can implement these read models incrementally through ordinary query/service composition.

# Gap disposition

This target completes the design portion of the API/UI/projection implications of SG-001 through SG-018, especially:

- SG-002/SG-003 `programStatus` decomposition;
- SG-005 disclosure representation;
- SG-006 current Classification compatibility;
- SG-007 `deckStatus` replacement;
- SG-008/SG-009 exact public exposure reads;
- SG-012 current Revision projection;
- SG-013 Availability representation;
- SG-014 generation preview/apply;
- SG-016 resend UI semantics;
- SG-017 `abstractReviewStatus` retirement;
- SG-018 Coverage advisory presentation;
- SG-P01 through SG-P04 action-policy representation.

These remain implementation-open until 003-F migration/cutover and runtime validation.

# Handoff

003-F must turn these interface targets into a staged compatibility plan: which additive fields/endpoints appear first, which existing components move first, how parity is measured, when old writes are disabled, and when lossy compatibility fields can safely be removed.