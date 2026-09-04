# 003-D — Authority & Lifecycle Policy Matrix

Purpose: preserve the implementation evidence and reconciliation reasoning behind the canonical [Authority, Lifecycle & Operational Policy Target](../knowledge/reconciliation/authority-lifecycle-operational-policy-target.md).

This matrix is historical/audit evidence, not a second policy authority.

## Current authority surfaces

| Current surface | Current behavior | Reconciliation conclusion |
|---|---|---|
| `ReviewerRole.ADMIN` | site settings, themes, archive lifecycle | retain as capability-assignment shorthand; do not make role name semantic authority |
| `ReviewerRole.BOARD` | scoring, Selection/program status, deck review/share, schedule, publication, communications | decompose into explicit action capabilities |
| `ReviewerRole.CHAIR` | scoring, deck review, export, committee access | decompose into explicit action capabilities |
| presenter token | Proposal-scoped presenter identity | retain as scoped actor/ownership mechanism for revise/withdraw/provide actions |
| `lib/roles.ts` | centralized role→boolean helpers | strong substrate for capability resolver; replace route semantics gradually rather than duplicate checks |
| route UI visibility | hides/shows controls | never authoritative authorization |

Evidence: `lib/roles.ts`, `lib/reviewer.ts`, presenter-token routes.

## Capability reconciliation

| Current helper | Target capability | Initial mapping note |
|---|---|---|
| `canManageConferenceSettings` | `MANAGE_CONTEXT_SETTINGS` + `MANAGE_AVAILABILITY` where appropriate | ADMIN |
| `canManageThemes` | `MANAGE_VOCABULARY` + `MANAGE_COVERAGE_TARGETS` | ADMIN |
| `canArchiveConference` | `ARCHIVE_CONTEXT` | ADMIN |
| `canScore` | `RECORD_EVALUATION`; also current evidence for `GIVE_FEEDBACK` | BOARD, CHAIR |
| `canApprove` / `canSetProgramStatus` | `DECIDE_SELECTION` | BOARD |
| `canManageDeck` | `REVIEW_DELIVERABLE` | BOARD, CHAIR |
| `canSetDeckShareable` | `SET_PUBLIC_SHARING_POLICY` | BOARD |
| `canPublishDeckArchive` | `PUBLISH_MATERIAL` + `UNPUBLISH_MATERIAL` | BOARD |
| `canAccessSchedule` | `MANAGE_SCHEDULE` | BOARD |
| email send currently checks `canSetProgramStatus` | `DISPATCH_OPERATIONAL` | should become explicit; Selection authority and Dispatch authority are different policies |
| `canExportCsv` | `EXPORT_CONTEXT_DATA` | BOARD, CHAIR currently |
| `canViewHistoricalCommittee` | `VIEW_HISTORICAL_CONTEXT` | BOARD, ADMIN currently |

## Lifecycle evidence

| Current behavior | Risk | Target disposition |
|---|---|---|
| `assertConferenceAcceptsMutations` permits only `ACTIVE` | broad gate conflates many actions with one lifecycle flag | replace with per-command lifecycle policy |
| admin route allows arbitrary DRAFT/ACTIVE/ARCHIVED transition | can reopen archived context and erase `archivedAt` | v0 ordinary progression setup→live→archived; no reopen/regress without new design |
| public publication route requires ACTIVE | prevents reasonable post-event publication/unpublication | permit exact-material publish/unpublish post-Archive under explicit policy |
| email send route requires ACTIVE | blocks all post-event communication equally | allow only explicitly post-closure-safe Dispatch purposes after Archive |
| presenter Withdrawal route has no Conference-active check | can record event-participation Withdrawal after archival | target limits participation Withdrawal to non-archived operation; public/privacy removal uses separate policy |

## Availability evidence

Current `getSubmissionWindowState` composes:

- `Conference.status`;
- manual `submissionsOpen`;
- optional `submissionsOpenAt`/`submissionsCloseAt`;
- timezone formatting.

Observed issues:

1. `submissionsOpen=true` can currently function as an authority alongside missing timestamps.
2. close boundary uses `now > close`, while canonical Window is half-open and closes at `now >= close`.
3. initial Offer uses the helper but Revision edit does not.

Target:

- canonical Window interval owns ordinary temporal availability;
- manual boolean becomes suspension-only policy;
- `true` never overrides Window or Archive;
- Revision policy uses Window plus explicit exceptions.

## Revision/edit evidence

Current `canPresenterEditSubmission`:

- rejects WITHDRAWN;
- rejects DECLINED;
- rejects APPROVED;
- permits PENDING/BACKUP;
- contains a final `FEEDBACK_PENDING` branch that is effectively unreachable for the current ProgramStatus enum because all other statuses have already returned.

The Feedback route separately writes `abstractReviewStatus=FEEDBACK_PENDING`.

Reconciliation:

- Feedback existence must not automatically become edit permission;
- ordinary edit uses actor ownership + live/non-archived + open Window + decision-lock policy;
- a review-requested exception must be explicit and scoped;
- `abstractReviewStatus` remains compatibility/application workflow state for 003-E reconciliation.

## Selection/evaluation/deliverable evidence

Current routes consistently combine capability checks with `assertConferenceAcceptsMutations`.

This is good evidence that both authority and lifecycle matter, but the target changes the structure from:

`role check + ACTIVE check + mutable status check`

to:

`actor capability + resource scope + action-specific policy + canonical concept/synchronization preconditions`.

## Dispatch authority finding

Current template send route authorizes with `canSetProgramStatus`.

That coupling is not semantically justified: the ability to append Selection Decisions is not the same authority as performing operational communication.

Target introduces an explicit `DISPATCH_OPERATIONAL` application capability while preserving the current BOARD assignment initially.

## Archive/post-closure policy

Target post-Archive allowed set:

- historical reads;
- exports;
- recovery/convergence;
- public Unpublish;
- exact-material Publish/Republish when explicitly permitted;
- post-closure-safe Dispatch purposes.

Target blocked ordinary set:

- Proposal Offer/ordinary Revise;
- Evaluation;
- Selection;
- participation Withdrawal;
- Deliverable provision/review;
- Schedule mutation;
- program-shaping Vocabulary/Coverage changes.

## Policy gap disposition

- SG-P01 — target-designed in 003-D; implementation open.
- SG-P02 — target-designed in 003-D; implementation open.
- SG-P03 — target-designed in 003-D; implementation open.
- SG-013 policy portion — target-designed; persistence gap remains implementation open.

## Non-concepts reaffirmed

No evidence in this pass justifies introducing:

- Authorization;
- Delegation;
- Workflow;
- ApplicationLifecycle;
- EditStatus;
- CommunicationAuthority.
