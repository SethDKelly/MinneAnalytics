---
type: Concept Design Synchronization Contract
title: MinneAnalytics v0 Synchronization & Composition Contract
description: Canonical cross-concept reference alignment, synchronizations, policies, and derived projections for the formally specified v0 concept model.
tags: [concept-design, synchronization, composition, v0]
status: stable
authority: canonical
phase: 002-G
sources:
  - { id: phase, resource: ../../002-G-formal-specification-consolidation-and-synchronization-handoff.md, title: 002-G Formal Specification Consolidation & Synchronization Handoff }
  - { id: authority, resource: ../rules/concept-design-authority.md, title: Concept Design Authority }
---
# Purpose

Compose the 17 formally specified concepts into MinneAnalytics application behavior without introducing a hidden coordinator concept or duplicating authoritative state.

Concept-local definitions remain in the [Concept Catalog](../concepts/). This contract owns only the cross-concept rules below.

# 1. Reference alignment

MinneAnalytics v0 uses different reference identities according to what must remain stable when content changes.

| Application role | Canonical reference choice | Reason |
|---|---|---|
| durable offered candidate | [Proposal](../concepts/proposal.md) identity | organizer/participation history should survive content revision |
| mutable offered content | [Revision](../concepts/revision.md) tracked subject + exact Revision identity | exact historical form must remain referable |
| Evaluation subject | exact Revision identity | judgment must remain attached to what was actually judged |
| Classification subject | exact Revision identity | category/theme associations are version-sensitive content evidence |
| Selection candidate | Proposal identity | organizer decision belongs to the durable offered candidate |
| Withdrawal commitment | Proposal/participation identity | rescission concerns participation, not one content revision |
| Capacity commitment | Proposal/participation identity | scarce commitment should not churn on content edits |
| Deliverable subject | Proposal/participation identity | artifact obligation follows the selected participation |
| Schedule activity | Proposal/participation identity | placement should survive content revision unless participation changes |
| Publication material | exact [Deliverable](../concepts/deliverable.md) ArtifactVersion or another immutable MaterialRef | public exposure must identify the exact material exposed |
| Dispatch recipient | stable participant/recipient identity | duplicate semantics must not depend on a mutable endpoint such as email |
| Archive context | application working-context reference | Archive is closure of the containing context, not a Conference concept |

## Classification/revision consequence

Classification is version-sensitive for MinneAnalytics v0. When a new Revision becomes current, the application supplies the complete desired Classification set for that exact Revision. A classification-only edit may create a new Revision even when the opaque `Form` is otherwise unchanged; Revision explicitly permits same-form successors.

Older Revision identities and their Classification associations remain unchanged. Vocabulary correction/retirement does not rewrite those historical associations.

# 2. Required synchronizations

The synchronization IDs below are stable references for later architecture and implementation-reconciliation work.

## SYNC-001 — Offer establishes initial Revision

**Trigger:** the application accepts an offer command after authority/availability/lifecycle policy passes.

**Coordinated actions:**

1. [Proposal](../concepts/proposal.md) `Offer(originator, subject)`;
2. [Revision](../concepts/revision.md) `Initialize(subject, initialForm, originator, at)`;
3. [Classification](../concepts/classification.md) `Classify(initialRevision, term)` for each supplied initial term.

**Contract:** MinneAnalytics should not commit a newly offered mutable proposal without its initial Revision representation. The application operation should be atomic from the user's perspective.

## SYNC-002 — Revision establishes version-specific Classification

**Trigger:** an accepted content/classification edit.

**Coordinated actions:**

1. `Revision.Revise(subject, newForm, actor, at)` creates `newRevision`;
2. `Classification.Classify(newRevision, term)` establishes the full term set supplied for that revision.

**Contract:** prior Revision/Classification state remains unchanged. The new Revision does not inherit classifications implicitly; the application copies forward unchanged terms as part of the requested complete set.

## SYNC-003 — Current Evaluation permits peer/aggregate reveal

**Trigger:** an evaluator successfully records the Evaluation required for the current Revision in a review context.

**Condition:** the applicable peer/aggregate [Controlled Disclosure](../concepts/controlled-disclosure.md) relation is staged and still concealed.

**Coordinated effect:** invoke `Controlled Disclosure.Reveal` for that evaluator/context/information item.

**Contract:** Evaluation does not own reveal state. Once revealed, later Evaluation edits or Revision changes do not pretend the earlier disclosure never happened.

## SYNC-004 — Effective participation entry reserves Capacity

**Trigger:** application composition transitions a Proposal from not effectively participating to effectively participating.

**Condition:** the mapped [Capacity](../concepts/capacity.md) Pool/ClassRef has enough remaining units.

**Coordinated effect:** create `Capacity.Allocate(pool, proposal, class, actor, at)`.

**Contract:** a Selection action that would newly create effective participation must not be committed as successful when the required hard Capacity allocation cannot be established. Coverage Target guidance cannot override this hard invariant.

## SYNC-005 — First effective participation establishes Deliverable requirement

**Trigger:** a Proposal first becomes effectively participating and application policy requires an artifact kind.

**Coordinated effect:** create the applicable [Deliverable](../concepts/deliverable.md) requirement for the Proposal/participation identity.

**Contract:** this is idempotent per `(subject, artifact kind)` application requirement. Later loss of participation does not delete the Deliverable or its history.

## SYNC-006 — Effective participation exit releases Capacity

**Trigger:** a Proposal transitions from effectively participating to not effectively participating because Selection changes/clears or [Withdrawal](../concepts/withdrawal.md) is recorded.

**Coordinated effect:** release any active Capacity Allocation mapped to that participation.

**Contract:** originator Withdrawal must not be rejected merely because downstream cleanup fails. Withdrawal commits as the source truth; Capacity cleanup must converge and surface/retry failure rather than erase the Withdrawal.

## SYNC-007 — Effective participation exit unplaces Schedule activity

**Trigger:** the same effective-participation exit as SYNC-006.

**Coordinated effect:** if the Proposal is currently placed in [Schedule](../concepts/schedule.md), invoke `Schedule.Unplace`.

**Contract:** Withdrawal remains authoritative even if cleanup is temporarily incomplete. User-facing active-program projections should use effective-participation truth rather than treating a stale placement as continuing participation.

## SYNC-008 — Publication eligibility loss ends current exposure

**Trigger:** an actively published material becomes ineligible under the application publication policy.

**Examples of causes:**

- participation ceases;
- sharing/rights consent is revoked;
- a current Deliverable artifact is replaced and the prior artifact is no longer intended as current public material;
- another explicit publication-eligibility rule becomes false.

**Coordinated effect:** invoke [Publication](../concepts/publication.md) `Unpublish` for the affected Publication identity.

**Contract:** this changes current public availability but preserves publication history. Publication never silently repoints to another ArtifactVersion.

# 3. Application policies

These rules govern action eligibility but do not own concept state.

## POL-001 — Offer/edit temporal eligibility

`Proposal.Offer` and `Revision.Revise` are offered only when the applicable [Availability Window](../concepts/availability-window.md), application authority, Archive/lifecycle policy, and any explicitly supported exception permit the action.

No `EditStatus` or mutable workflow concept is introduced.

## POL-002 — Evaluation applicability

An Evaluation is current for mutable proposal content only when its exact subject is the Revision currently applicable to that proposal.

Older Evaluations remain valid historical judgments about their exact Revision but are excluded from current aggregates/work views unless an explicit historical view requests them.

## POL-003 — Effective participation

For the current MinneAnalytics program context:

`effectiveParticipation(proposal) = Selection.selected(proposal) AND NOT Withdrawal.withdrawn(proposal)`

Application-specific context/closure rules may further constrain active operation, but neither Selection nor Withdrawal stores this projection.

## POL-004 — Coverage remains decision support

Observed/prospective composition may be compared with [Coverage Target](../concepts/coverage-target.md) before Selection. A below/above-target result may cause a warning or confirmation requirement but does not itself create, reject, or rewrite a Selection Decision.

## POL-005 — Schedule eligibility

Only effectively participating Proposal identities are eligible for current Schedule placement. Additional travel, demand, room, or operational constraints may influence suggestions/placement policy without becoming Schedule state.

## POL-006 — Publication eligibility

Publishing event material requires application-supplied eligibility, normally including:

- an exact eligible MaterialRef;
- applicable Deliverable readiness when the material is a Deliverable ArtifactVersion;
- sharing/rights consent;
- relevant current participation/event policy.

Passing eligibility permits `Publication.Publish`; it does not create Publication automatically unless a separate application action/synchronization explicitly does so.

## POL-007 — Dispatch audience and message preparation

The application resolves Dispatch recipients and exact per-recipient MessageRefs from authoritative source state before calling Dispatch. Selection, Deliverable, Feedback, attendee/registration facts, and lifecycle policy remain outside Dispatch.

Reusable templates may render MessageRefs but are not Dispatch state.

## POL-008 — Archive mutation gating

Archive is a strong closure signal. Ordinary active-work mutations scoped to an archived context should be rejected unless an explicitly designed post-closure operation is permitted.

Do not infer that every possible operation must stop merely from Archive alone; permitted post-event Publication, reporting, or communication behavior must be explicit application policy. Archive itself remains monotonic and does not gain a general lifecycle state machine.

# 4. Derived projections

These are computed views, not additional sources of truth.

## PROJ-001 — Current proposal form

Use `Revision.current(subject)` and its `formOf` value.

## PROJ-002 — Current Evaluation set / aggregate inputs

For a proposal's current Revision, include only Evaluations whose exact subject matches that Revision and satisfy applicable evaluator/assignment policy. Aggregates, means, rankings, and `needs-rescore` queues are derived from this set.

## PROJ-003 — Effective participation

Use POL-003. Do not persist a combined `PENDING/APPROVED/BACKUP/WITHDRAWN` workflow status as conceptual authority.

## PROJ-004 — Observed program composition

For the active-program view, derive the participating Proposal set from PROJ-003, map each Proposal to its current Revision, then derive Classification terms/other attributes for those current Revisions.

## PROJ-005 — Coverage assessment

Compare an observed or prospective scalar derived from PROJ-004 with the applicable Coverage Target bounds. `below/within/above`, gaps, excesses, saturation-style warnings, and heatmaps are projections.

## PROJ-006 — Deliverable readiness/work queues

Use Deliverable's current ArtifactVersion and current Assessment. `awaiting provision`, `awaiting review`, `concern`, and `ready` are derived observations already defined by Deliverable; operational queues merely filter those observations.

## PROJ-007 — Current public listing

List exact Publication identities whose current state is published and whose application-level eligibility remains satisfied. Do not infer public material from a mutable "latest file" pointer alone.

## PROJ-008 — Dispatch eligibility/history views

Recipient eligibility is derived upstream; Dispatch history and already-sent state come from immutable Batch/SendRecord state for the semantic `(context,key,round)`.

# 5. Transaction and failure semantics

Cross-concept composition must preserve the authority of the initiating behavior.

1. **Precondition-style coordination** — when a hard invariant must be satisfied before an action can truthfully succeed (for example newly selected effective participation requiring Capacity), coordinate/validate before committing the user-visible success.
2. **Source-authoritative follow-up** — when an actor's action must remain true regardless of downstream cleanup (especially Withdrawal), commit the source action and make downstream synchronization retryable/convergent.
3. **No rollback by restatement** — downstream failure must not be "fixed" by rewriting another concept's independently meaningful history.
4. **Idempotent synchronization** — repeated processing must detect already-established target state where practical rather than manufacture duplicates.
5. **Derived-view safety** — user-facing active-state projections should prefer authoritative source truth even while asynchronous cleanup converges.

# 6. Explicit non-concepts

002-G does not introduce:

- Workflow;
- ProgramStatus;
- EffectiveParticipation;
- EvaluationFreshness;
- CoverageAssessment;
- PublicationEligibility;
- DispatchEligibility;
- ScheduleDraft;
- ApplicationLifecycle;
- SynchronizationManager.

These names describe projections, policies, orchestration concerns, or implementation mechanisms rather than independently evidenced behavioral concepts.

# 7. Handoff

This contract is the canonical input to implementation reconciliation. It does not require one service/table/module per concept and does not authorize a rewrite merely to mirror the Concept Design graph.

Implementation work should first map current behavior and persistence to these concept/reference/synchronization contracts, identify semantic gaps, then produce a migration-safe implementation plan.
