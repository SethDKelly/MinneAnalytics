---
type: Authority & Lifecycle Policy Target
title: MinneAnalytics v0 Authority, Lifecycle & Operational Policy Target
description: Canonical action-capability, availability, lifecycle, edit-exception, and post-closure policy for the v0 implementation reconciliation.
tags: [concept-design, implementation-reconciliation, authority, lifecycle, policy, availability, v0]
status: stable
authority: canonical
phase: 003-D
sources:
  - { id: phase, resource: ../../003-D-authority-lifecycle-disclosure-and-operational-policy-reconciliation.md, title: 003-D Authority Lifecycle Disclosure & Operational Policy Reconciliation }
  - { id: matrix, resource: ../../evidence/003-D-authority-lifecycle-policy-matrix.md, title: 003-D Authority & Lifecycle Policy Matrix }
  - { id: composition, resource: ../synchronizations/minneanalytics-v0.md, title: MinneAnalytics v0 Synchronization & Composition Contract }
  - { id: execution, resource: synchronization-transaction-recovery-target.md, title: MinneAnalytics v0 Synchronization Transaction & Recovery Target }
---
# Purpose

Define who may attempt consequential application actions and when lifecycle/availability policy permits those actions, without promoting roles, permissions, or a general event lifecycle into new Concept Design concepts.

Authentication, token verification, role storage, and capability-check code are implementation mechanisms. Concept-local action semantics remain owned by the [Concept Catalog](../concepts/).

# Authority model

MinneAnalytics v0 uses **capabilities resolved from actor context**, not role names as semantic domain state.

Current `ReviewerRole` values may remain a convenient assignment mechanism, but routes/services should consume capabilities whose names describe the action being authorized.

A role may map to several capabilities; changing that mapping later does not rewrite concept history.

# Stable v0 capabilities

The target capability vocabulary is intentionally application-scoped rather than a generic authorization platform.

## Organizer / reviewer capabilities

- `MANAGE_CONTEXT_SETTINGS` — change setup/live application configuration that is not owned by another explicit capability.
- `MANAGE_AVAILABILITY` — define/reschedule the Proposal availability window and control the manual offer suspension policy.
- `MANAGE_VOCABULARY` — contribute/correct/retire/restore governed Vocabulary terms on behalf of the application steward role.
- `MANAGE_COVERAGE_TARGETS` — define/update representation planning targets.
- `ARCHIVE_CONTEXT` — perform the monotonic Archive closure action.
- `RECORD_EVALUATION` — record/revise the actor's own Evaluation when review policy permits.
- `GIVE_FEEDBACK` — create recipient-directed Feedback.
- `DECIDE_SELECTION` — append Selection Decisions, including selected/reserve/not-selected/clear.
- `REVIEW_DELIVERABLE` — record concern/ready Assessment against an exact ArtifactVersion.
- `SET_PUBLIC_SHARING_POLICY` — change the application's affirmative/negative share-eligibility input for public material.
- `PUBLISH_MATERIAL` — Publish/Republish exact eligible MaterialRefs.
- `UNPUBLISH_MATERIAL` — end current Publication exposure.
- `MANAGE_SCHEDULE` — apply explicit Schedule placements/moves/swaps/unplacements and accepted generated proposals.
- `DISPATCH_OPERATIONAL` — perform an allowed operational Dispatch after audience/message policy resolves.
- `EXPORT_CONTEXT_DATA` — produce authorized export projections.
- `VIEW_HISTORICAL_CONTEXT` — inspect permitted retained historical data.

## Originator capabilities

Presenter-token possession currently supplies scoped actor identity for the Proposal and is a viable implementation mechanism for:

- `REVISE_OWN_PROPOSAL`;
- `WITHDRAW_OWN_PARTICIPATION`;
- `PROVIDE_OWN_DELIVERABLE`.

These are ownership-scoped capabilities, not broad rights over other Proposals.

# Current role mapping retained as implementation policy

The current roles can initially map as follows without becoming conceptual truth.

| Capability family | ADMIN | BOARD | CHAIR |
|---|---:|---:|---:|
| context/window/vocabulary/coverage administration | yes | no | no |
| archive context | yes | no | no |
| record Evaluation | no | yes | yes |
| give Feedback | no | yes | yes |
| decide Selection | no | yes | no |
| review Deliverable | no | yes | yes |
| set public-sharing policy | no | yes | no |
| publish/unpublish material | no | yes | no |
| manage Schedule | no | yes | no |
| operational Dispatch | no | yes | policy-specific/no by default |
| export context data | policy-specific | yes | yes |
| view historical context | yes | yes | policy-specific |

The exact compatibility mapping may retain current UI-access helpers during rollout. What becomes authoritative is the capability check at the application command boundary, not the `ADMIN`/`BOARD`/`CHAIR` string.

# Capability resolution rule

Authorization for a command is the conjunction of:

1. authenticated/resolved actor identity;
2. required application capability;
3. resource/context scope (for example same Conference/Proposal);
4. action-specific lifecycle/availability policy;
5. concept/synchronization preconditions.

A capability alone never bypasses concept invariants such as Capacity limits, exact-subject ownership, or monotonic Archive/Withdrawal/Disclosure history.

# Application lifecycle policy

`ConferenceStatus` may remain a compatibility application field, but its target semantics are narrower than a workflow concept.

## Setup

Compatibility: `DRAFT`.

Allowed examples:

- manage context settings;
- define/reschedule Availability Window;
- manage Vocabulary and Coverage Targets;
- prepare reviewer access/configuration;
- prepare Schedule topology or other non-participation configuration.

Ordinary Proposal offer, Evaluation, Selection, active Deliverable review, and operational Dispatch are not yet offered merely because configuration exists.

## Live operation

Compatibility: `ACTIVE` and no Archive closure.

Normal concept actions are available subject to their capability and finer-grained policies.

## Archived closure

Canonical: an [Archive](../concepts/archive.md) record exists.

Ordinary active-work mutation is closed. The context remains referable and selected post-closure operations are explicitly allowed below.

# Lifecycle transition policy

For v0, the accepted ordinary progression is:

`setup -> live -> archived`.

The current ability to change an archived Conference back to `ACTIVE`/`DRAFT` and clear `archivedAt` is **not accepted target behavior**.

Likewise, routine `ACTIVE -> DRAFT` regression is not accepted without new product evidence. If cancellation, reopening, or another operational mode becomes necessary, design that policy explicitly rather than weakening Archive provenance.

# Post-Archive policy

Archive blocks ordinary active mutation but is not an indiscriminate deny-all switch.

## Allowed after Archive when capability/policy otherwise passes

- historical inspection;
- export/report projection;
- `UNPUBLISH_MATERIAL` at any time public exposure must end;
- `PUBLISH_MATERIAL`/Republish when the application explicitly permits post-event archive publication and all exact-material/readiness/share-policy checks pass;
- operational Dispatch whose semantic purpose is explicitly classified as post-closure-safe (for example a post-event feedback request);
- recovery/repair required to converge previously committed authoritative actions.

## Not ordinarily allowed after Archive

- new Proposal offers;
- ordinary Proposal Revision;
- new/revised Evaluation;
- new Selection Decisions;
- new participation Withdrawal as an event-participation action;
- new Deliverable provision/assessment;
- ordinary Schedule mutation/generation;
- Vocabulary/Coverage program-shaping changes intended for the closed event;
- ordinary reminders/declines/program-operation Dispatch.

Archive never blocks infrastructure recovery needed to make already-committed source truth converge.

# Availability Window policy

The canonical Window owns the bounded interval. The legacy `submissionsOpen` boolean is interpreted only as a **manual offer suspension policy** during coexistence.

Target offer eligibility is:

- context is live and not archived;
- actor/request is otherwise eligible to submit;
- canonical Availability Window is open at observation time;
- manual offer suspension is not active.

Setting the compatibility boolean to `true` does **not** reopen a closed/not-yet-open Window and does not override Archive/setup mode. Reopening ordinary offers requires rescheduling/defining the canonical Window.

# Revision/edit policy

`Revision.Revise` uses more policy than Proposal Offer because organizer decisions and explicit review exceptions can affect edit eligibility.

Ordinary originator edit requires:

- `REVISE_OWN_PROPOSAL` for the referenced Proposal;
- context live and not archived;
- Proposal not withdrawn;
- applicable Availability Window open;
- no current application decision lock that intentionally freezes ordinary editing.

The initial v0 decision-lock policy should treat a current final selected/not-selected disposition as closed to ordinary edits. Reserve/undecided content may remain ordinarily editable while the Window is open.

## Explicit revision exception

The application may expose a narrowly scoped current policy exception when an authorized reviewer/organizer intentionally requests another Revision after ordinary editing would otherwise be closed.

The exception:

- is scoped to one Proposal/current review situation;
- does not erase Selection/Evaluation/Feedback history;
- does not reopen Proposal Offer generally;
- does not bypass Archive;
- may be represented by mutable application policy state because no independent historical lifecycle has yet been established;
- must be explicit rather than inferred from the mere existence of any Feedback record.

The current `abstractReviewStatus=FEEDBACK_PENDING` may remain compatibility state during rollout, but 003-E must remove the current ambiguity where Feedback and edit eligibility are coupled indirectly.

# Withdrawal policy

Withdrawal is originator-authoritative while the context is still operational.

Requires:

- `WITHDRAW_OWN_PARTICIPATION` for the Proposal;
- context not archived;
- no prior Withdrawal.

It does not require the Proposal to be selected and is not constrained by the Proposal Availability Window. Once accepted, downstream cleanup follows TX-B convergence rules.

Post-Archive requests to remove public material or change privacy/share treatment must use the appropriate Publication/share-rights policy rather than manufacturing a late event-participation Withdrawal.

# Evaluation and Feedback policy

Evaluation and Feedback require:

- live, non-archived context;
- appropriate capability;
- same context/resource scope;
- eligible review assignment/access where applicable;
- non-withdrawn subject for ordinary active review.

Evaluation applicability remains exact-Revision based. An older Evaluation is historical evidence, not authorization to act on the current Revision.

Feedback creation does not intrinsically create edit permission; a revision exception must be an explicit application decision.

# Selection policy

Selection requires `DECIDE_SELECTION`, live/non-archived context, and a candidate in the same selection context.

Selection entry that creates effective participation remains subject to atomic Capacity allocation and Deliverable establishment under 003-C.

Coverage Target may require warning/confirmation but never grants or denies the capability and never manufactures a Selection Decision.

# Deliverable policy

Provision requires the originator-scoped capability plus current application eligibility, normally effective participation and non-archived operation.

Assessment requires `REVIEW_DELIVERABLE`, exact current ArtifactVersion, and live/non-archived operation.

A readiness Assessment does not itself grant Publication authority.

# Schedule policy

`MANAGE_SCHEDULE` is required to make authoritative placement changes. Generator computation can be available more broadly as a suggestion if desired, but applying its result is a Schedule mutation and requires the capability plus live/non-archived policy.

Only effectively participating Proposals remain placement-eligible.

# Dispatch policy

`DISPATCH_OPERATIONAL` authorizes invoking Dispatch only after an upstream policy has resolved an eligible audience/message purpose.

During live operation, allowed semantic send purposes may include program/deck/attendee operations according to their source-state rules.

After Archive, only explicitly post-closure-safe semantic purposes are eligible. This classification belongs to application policy around each DispatchKey/template purpose; Archive does not need a generic communication state machine.

# High-consequence action rule

The following actions require explicit server-side capability enforcement and durable actor attribution where the owning concept/history supports it:

- Selection Decisions;
- Archive closure;
- public-sharing policy changes;
- Publication Publish/Unpublish/Republish;
- Deliverable readiness Assessments;
- Controlled Disclosure explicit identity reveal;
- Schedule accepted apply;
- operational Dispatch.

UI visibility is never sufficient authorization.

# Gap disposition

This target resolves the design portion of:

- SG-P01 — edit eligibility;
- SG-P02 — authority naming/capability;
- SG-P03 — Archive/post-event operations;
- lifecycle/availability portions of SG-013 and related synchronization policy.

These gaps remain implementation-open until 003-E/003-F/runtime verification completes.

Public-sharing and Controlled Disclosure details are owned by [003-D Disclosure & Publication Policy Baseline](disclosure-publication-policy-baseline.md).

# Non-goals

003-D does not introduce:

- a generic Authorization or Delegation concept;
- user-managed arbitrary permission grants;
- a Workflow/ApplicationLifecycle concept;
- a new persisted role model merely to rename `ReviewerRole`;
- automatic policy bypass for administrators.

# Handoff

003-E must define the API/UI representation of capability denial, edit locks/exceptions, archived/post-closure operations, and compatibility status labels. 003-F must define migration/cutover of policy checks and validation that no old route can bypass canonical action policy.