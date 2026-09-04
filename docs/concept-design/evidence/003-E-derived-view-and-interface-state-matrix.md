# 003-E — Derived View & Interface State Matrix

Status: **Historical audit evidence**  
Authority: supporting evidence for 003-E; current normative conclusions are owned by the OKF reconciliation nodes.

## Purpose

Record how current MinneAnalytics fields, helpers, queues, badges, and public views should be classified when reconciling them with canonical Concept Design authority.

## State classification matrix

| Current surface | Current behavior/evidence | Target class | Canonical/derived owner | 003-E disposition |
|---|---|---|---|---|
| `Submission.id` | durable talk/submission identifier | canonical reference | Proposal | retain |
| `Submission.abstractVersion` | integer current version marker used across review UI | compatibility projection | Revision current identity + ordinal | retain ordinal; add exact Revision reference |
| current title/abstract/bio/technical level | mutable copy on `Submission` | compatibility/denormalized projection | current Revision | retain if transactionally repairable |
| `SubmissionTheme` | current theme association | compatibility projection | current Revision Classification | retain as current-set projection |
| `programStatus` | `PENDING/APPROVED/DECLINED/BACKUP/WITHDRAWN` controls labels and operations | compatibility projection | Selection + Withdrawal | derive; stop treating as mutation authority |
| `abstractReviewStatus` | `CURRENT/FEEDBACK_PENDING/REVISED/ACKNOWLEDGED`; feedback, edit, acknowledgement workflow | legacy-only compatibility | Revision + Feedback + Evaluation applicability + explicit edit-exception policy | no replacement enum; migrate consumers away |
| `Score.scoredAbstractVersion` and review queues | determines current/stale score and `Needs rescore` | derived view over legacy reference | exact Revision + Evaluation | retain queue behavior; switch to exact refs |
| current aggregate | scores filtered by current integer version | derived projection | Evaluations for exact Revision | derive by exact Revision |
| blank presenter identity under blind review | hidden by replacing strings/null | presentation workaround | Controlled Disclosure | replace with explicit visibility state |
| committee aggregate hidden until own current score | dynamic condition | derived/protected view | Evaluation + Controlled Disclosure | explicit concealed/revealed state |
| `deckStatus` | `SUBMITTED/REVIEWED/APPROVED/CONCERN` | compatibility projection/legacy residue | current ArtifactVersion + Deliverable Assessment | native projection excludes `REVIEWED` as new state |
| latest `DeckFile` | newest uploaded artifact | canonical reference/current view | Deliverable ArtifactVersion | retain exact ID/version |
| `deckShareable` | current boolean | compatibility policy input | sharing-eligibility policy | retain during migration with provenance class |
| `decksPublished` | event-wide public archive switch | compatibility/public-surface policy | Publication collection/surface policy | cannot replace exact Publication |
| `Conference.status` | broad `DRAFT/ACTIVE/ARCHIVED` lifecycle gate | compatibility projection/application mode | setup/live policy + Archive | Archive dominates; action policy remains per-command |
| `submissionsOpen` | manual open/close combined with timestamps | compatibility policy input | manual suspension + Availability Window | boolean becomes suspension only |
| `canEdit` | calculated from legacy statuses in presenter page | derived policy view | edit-eligibility policy | server-derived semantic reasoned view |
| `readOnly` | broad organizer UI flag | UI projection | capability + lifecycle + viewed context | do not treat as authorization |
| capacity widget snapshot | calculated from configured slots/counts | derived projection today | target Capacity ledger | target reads Pool/Allocation authority |
| theme/technical heatmaps | counts, gaps, balance views | derived projection | Classification + Selection + Coverage Target | retain as advisory projections |
| schedule generated result | current route writes generated assignments directly | currently authoritative mutation | target generation proposal + Schedule | split proposal from apply |
| schedule placements | room/slot assignment rows | canonical/physical state | Schedule | retain |
| `PresenterFeedback` list | recipient-directed messages | canonical fact | Feedback | retain |
| email preview | rendered candidate communication | transient observation | Dispatch policy/rendering | retain as preview, not SendRecord |
| email send batch/history | batch + send records | canonical + operation state | Dispatch | retain, add exact message/attempt semantics |
| public deck list | latest approved/shareable deck when collection switch on | derived public view | exact Publication + current eligibility | replace dynamic parent-state authorization |
| `publicId` file fetch | authorizes file from parent current state | address + unsafe compatibility behavior | exact MaterialRef Publication | token never grants authority |
| rescore indicator | old evaluation does not apply to current Revision | derived queue/badge | Evaluation applicability | retain as projection |
| pending cleanup/retry | mostly absent from current UI | transient execution view | TX-B durable work/recovery | add operator-facing where actionable |

## Compound status findings

### `programStatus`

The current badge and presenter/organizer logic make one enum appear to be the entire participation truth. This hides the accepted independence of Selection and Withdrawal.

The compatibility value can still be generated for old consumers, but the target interface should show Selection and Withdrawal separately when their distinction matters.

### `abstractReviewStatus`

This field has the weakest semantic fit.

Current behavior includes:

- Feedback creation can set `FEEDBACK_PENDING`;
- presenter Revision writes `REVISED`;
- Board action changes `REVISED -> ACKNOWLEDGED -> CURRENT`;
- presenter edit eligibility also consults the field after checking ProgramStatus.

No accepted concept owns that state machine. 003-E therefore treats it as legacy-only compatibility rather than creating a formal replacement merely to preserve the enum.

### `deckStatus`

`APPROVED` and `CONCERN` can map to exact ArtifactVersion Assessments. `SUBMITTED` can describe a provided current artifact awaiting final Assessment. `REVIEWED` has no independently recovered invariant/action/history and remains migration residue only.

## Queue findings

The current reviewer queues are conceptually useful:

- never evaluated current Revision;
- prior Evaluation exists but applies to older Revision;
- current Revision evaluated.

The problem is not the queue labels. It is the legacy one-Score-row overwrite and integer-only reference. Once SG-001 is fixed, these queues remain derived work views.

## Concealment findings

The current review model uses blank identity fields and null aggregate values as concealment signals. This is fragile because an API consumer can confuse absence with missing data.

Target protected-information views must include explicit visibility state and must omit the protected value while concealed.

## Presenter interface findings

Current presenter UI derives:

- deck upload availability from `programStatus === APPROVED`;
- withdrawal state from `programStatus === WITHDRAWN`;
- edit presentation from a `canEdit` boolean computed from legacy status fields;
- three separate status badges (`programStatus`, `abstractReviewStatus`, `deckStatus`).

Target UI should receive explicit policy/read-model state so it does not recreate business rules client-side.

## Organizer interface findings

The organizer dashboard combines:

- Selection status;
- rescore state;
- Deliverable status;
- Capacity;
- Coverage/heatmaps;
- public sharing;
- publication switch;
- Schedule;
- communications.

This is an appropriate composition-oriented screen. It does not need one screen per concept. The target requirement is only that each control writes to the proper owner and that summary badges remain projections.

## Public interface findings

Public archive listing currently uses the latest DeckFile plus current parent approval/readiness/shareability and event-wide publication switch. The direct-file resolver can authorize a historical DeckFile from those same parent conditions.

The target public interface must instead derive listing and fetch authorization from the exact MaterialRef's Publication plus current eligibility.

## Operational-state findings

TX-B convergence creates a new class of UI concern that the current application mostly lacks. Operator surfaces may need a small attention view for pending cleanup, blocked provider outcomes, or repair work. This must remain infrastructure-derived and must not become a generic Workflow concept.

## Exit observation

The current UI architecture can largely survive. The required change is semantic: compose richer read models server-side, migrate controls to action-oriented commands, keep compatibility fields subordinate, and expose operation state only where it helps recovery.