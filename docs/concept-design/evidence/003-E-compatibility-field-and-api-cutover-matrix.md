# 003-E — Compatibility Field & API Cutover Matrix

Status: **Historical audit evidence**  
Authority: supporting evidence for 003-E; current normative conclusions are owned by the OKF reconciliation nodes.

## Purpose

Record the intended coexistence and eventual retirement treatment of legacy state fields and mutation surfaces before 003-F defines the executable migration sequence.

## Field cutover matrix

| Legacy surface | Target source | Read compatibility | Write compatibility | Retirement condition |
|---|---|---|---|---|
| `programStatus` | Selection + Withdrawal | yes, deterministic lossy projection | temporary adapter only | all first-party writes use semantic commands; read consumers migrated |
| `abstractVersion` | current Revision ordinal | yes, long-lived useful ordinal | no independent write | exact Revision refs used for cross-concept ownership |
| Submission current content | current Revision | yes, denormalized projection | only through Revision command | transactional projection verified/repairable |
| `SubmissionTheme` | current Revision Classification | yes | only through Revision/Classification composition | exact historical Classification populated and current projection verified |
| `abstractReviewStatus` | no single replacement | temporary legacy read only | no target-native writes | UI/API consumers use edit eligibility, Feedback, Revision, Evaluation applicability |
| `deckStatus` | current ArtifactVersion + Assessment | yes for supported projection | temporary adapter only | exact Assessments drive all first-party reads/writes; `REVIEWED` residue handled |
| `deckShareable` | share-eligibility policy | yes, with legacy provenance | temporary policy adapter | provenance-aware target policy is authoritative |
| `decksPublished` | public-surface policy + exact Publications | yes as collection control if still useful | temporary adapter/bulk action | no exact file exposure depends solely on flag |
| `ConferenceStatus` | setup/live application mode + Archive | yes | transitional adapter | Archive and per-action lifecycle policy authoritative |
| `submissionsOpen` | manual offer suspension | yes | yes as suspension control | no consumer treats it as temporal Window truth |

## Mutation/API matrix

| Current command pattern | Target command meaning | Compatibility approach |
|---|---|---|
| set generic `programStatus` | append Selection Decision | adapt selected/reserve/not-selected; explicit clear only when intent known; reject organizer Withdrawal semantics |
| presenter withdrawal endpoint | record Withdrawal | preserve route if desired; change persistence/cleanup semantics behind it |
| score POST/upsert | record/revise Evaluation for exact Revision | preserve UX/route shape if desired; bind exact Revision and stop overwriting older Revision Evaluation |
| feedback POST | create Feedback | remove implicit edit-status authority and direct-send coupling; notification becomes Dispatch consequence |
| abstract-review `acknowledge/clear` | no direct canonical equivalent | retire or redesign as explicit revision-review/edit-exception UI policy; do not preserve enum lifecycle for its own sake |
| deck-status POST | record Deliverable Assessment | adapt `APPROVED -> ready`, `CONCERN -> concern`; `SUBMITTED` belongs provision state, `REVIEWED` is not target assessment |
| deck-shareable PATCH | change public-sharing eligibility | retain as adapter with provenance until target-native command lands |
| publish-archive POST | surface/bulk Publication operation | adapt to exact Publish/Unpublish actions and/or explicit public-surface gate |
| schedule generate | compute proposal | must become non-mutating proposal generation |
| schedule placement | authoritative Schedule mutation | retain action-oriented placement semantics; add expected-base where required |
| email send | Dispatch semantic round | preserve preview/send UX; remove same-round resend ambiguity; expose uncertain provider state |
| admin conference status PATCH | setup/live mode or Archive action | split Archive from ordinary settings; do not permit archived provenance erasure |

## Read/API migration order recommendation

003-F should prefer this consumer sequence because it reduces risk without requiring a big-bang UI rewrite:

1. internal server-side semantic read services;
2. organizer/reviewer read models that currently combine the most state;
3. presenter portal edit/participation/deliverable read model;
4. public archive listing and exact public file resolver;
5. exports/report builders;
6. remaining compatibility-only helpers/tests/demo tooling.

Public exact-material access may need to move earlier than ordinary UI cleanup if SG-009 is treated as a security/correctness issue.

## Write migration order recommendation

1. exact Revision/Evaluation/Classification writes;
2. Selection + Withdrawal + Capacity/Deliverable atomic/convergent commands;
3. Deliverable Assessments;
4. sharing + exact Publication commands;
5. Archive/lifecycle commands;
6. Schedule proposal/apply;
7. Dispatch exact-message/round semantics;
8. retire generic status writers.

Final ordering remains 003-F authority because schema/backfill dependencies may require a different deploy sequence.

## Semantic parity examples

### Program

Legacy:

`programStatus = WITHDRAWN`

Target may simultaneously contain:

- current Selection = selected;
- Withdrawal = true;
- effective participation = false.

This is an intentional information gain, not a parity failure.

### Evaluation

Legacy:

- one Score points at integer version 2.

Target:

- Evaluation E1 -> Revision R1;
- Evaluation E2 -> Revision R2.

Legacy cannot reproduce E1 if it was overwritten. Missing history is legacy-unknown, not a target defect.

### Deck

Legacy:

`deckStatus = REVIEWED`

Target:

- ArtifactVersion exists;
- no canonical ready/concern Assessment inferred solely from `REVIEWED`.

Compatibility may preserve the legacy label until a native Assessment occurs.

### Publication

Legacy may list latest deck and allow historical publicId access from parent current state.

Target intentionally suppresses any exact MaterialRef without current exact Publication/eligibility. This is a correctness change, not a shadow-parity defect.

## Error migration

Current routes primarily return English `{ error: string }` bodies. Target command services should introduce stable machine-readable reason codes, with legacy adapters free to keep old messages during coexistence.

Reason-code adoption should precede major UI message changes so components can distinguish capability denial, lifecycle closure, stale expected-head, Capacity conflict, and provider uncertainty without string parsing.

## UI migration constraints

- Do not expose raw canonical histories everywhere merely because they now exist.
- Keep composition-oriented screens where they serve users well.
- Split only ambiguous labels/controls, not necessarily page structure.
- Hide/disable controls for usability, but never rely on UI visibility for authorization.
- When compatibility and semantic fields disagree during shadow mode, surface the discrepancy to diagnostics rather than silently choosing the legacy field.

## Legacy-unknown presentation

When migration provenance is unknown, the UI/API should avoid false precision.

Examples:

- sharing policy may be `legacy-current-state` rather than `approved by Board at <time>`;
- disclosure state for an old reviewer may be compatibility-unknown rather than `concealed`;
- old Selection history may expose only current imported disposition;
- old `REVIEWED` deck status may be identified as legacy state without inventing a Deliverable Assessment.

## Compatibility removal evidence required

For each retired field/endpoint, 003-F should retain evidence of:

- consumer search/inventory;
- write-path migration;
- read parity/shadow results;
- legacy-unknown handling;
- rollback behavior;
- tests proving semantic commands cannot be bypassed through the old path.

## Exit observation

The safest API/UI evolution is incremental but one-directional. Compatibility can absorb temporary duplication; it cannot remain an alternate write authority once canonical command cutover occurs.