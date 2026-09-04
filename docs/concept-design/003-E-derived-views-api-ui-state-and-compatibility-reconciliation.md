# 003-E — Derived Views, API/UI State & Compatibility Reconciliation

Status: **Complete**  
Concept model maturity: **v0 specified; persistence, execution, policy, and interface reconciliation complete**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation](003-D-authority-lifecycle-disclosure-and-operational-policy-reconciliation.md)

## 1. Purpose

003-E reconciles the user-facing/API-facing state model against the accepted 17 concepts and the Phase 003 persistence, execution, and policy architecture.

The phase does not redesign the product screen-by-screen and does not change application code.

It answers:

> **What should APIs and interfaces expose as truth, what may remain a compatibility projection, what is merely derived or operational state, and how can existing consumers move without recreating the old compound status model?**

Current normative interface authority is owned by:

- [v0 Derived View, API & UI State Target](knowledge/reconciliation/derived-view-api-ui-target.md);
- [v0 Interface Compatibility & Cutover Baseline](knowledge/reconciliation/interface-compatibility-baseline.md).

Historical audit evidence is preserved in:

- [003-E Derived View & Interface State Matrix](evidence/003-E-derived-view-and-interface-state-matrix.md);
- [003-E Compatibility Field & API Cutover Matrix](evidence/003-E-compatibility-field-and-api-cutover-matrix.md).

---

## 2. Entry constraints

003-E inherits these decisions and does not reopen them:

1. all 17 concepts are formally specified;
2. semantic identity/history target is additive and reuse-first;
3. newly effective participation uses atomic Capacity/Deliverable coordination;
4. source-authoritative exit uses convergent cleanup;
5. compatibility writes become canonical -> legacy after cutover;
6. action authority is capability + scope + policy + concept precondition;
7. Archive is monotonic closure, not a universal deny-all flag;
8. Controlled Disclosure records real staged/revealed visibility;
9. Publication identifies exact MaterialRef exposure;
10. missing historical provenance must not be fabricated.

---

## 3. Interface-state taxonomy

003-E classifies every meaningful state exposed by the product into four categories:

### 3.1 Canonical fact

State owned by a Concept Design concept/history.

Examples:

- Selection Decision;
- Withdrawal;
- exact Revision;
- Evaluation;
- exact ArtifactVersion and Assessment;
- Publication;
- Archive;
- Controlled Disclosure.

### 3.2 Derived view

A computed answer over canonical facts and policy.

Examples:

- effective participation;
- needs Evaluation/rescore;
- edit eligibility;
- Capacity remaining;
- Coverage gap;
- public listing eligibility;
- work queues.

### 3.3 Compatibility projection

A legacy representation retained temporarily.

Examples:

- `programStatus`;
- `abstractReviewStatus`;
- `deckStatus`;
- `ConferenceStatus`;
- `submissionsOpen`;
- `deckShareable`;
- `decksPublished`.

### 3.4 Transient execution state

A recovery/operation condition, not domain state.

Examples:

- converging cleanup;
- provider outcome uncertain;
- generated Schedule proposal awaiting application;
- retry/repair attention.

This classification is the main anti-drift mechanism for 003-E.

---

## 4. `programStatus` decomposition at the interface

The current product repeatedly displays one Program Status badge and uses the same enum for branching logic.

The target semantic read model exposes independent state:

```text
Selection disposition
        +
Withdrawal
        ↓
effective participation projection
```

The compatibility enum remains derivable:

| Canonical state | Compatibility `programStatus` |
|---|---|
| Withdrawal exists | `WITHDRAWN` |
| selected | `APPROVED` |
| reserve | `BACKUP` |
| not-selected | `DECLINED` |
| no current Selection disposition | `PENDING` |

Withdrawal takes precedence only in the **compatibility projection**. It does not erase the underlying Selection Decision.

### UI consequence

Where the distinction matters, use labels such as:

- `Selection: Selected`;
- `Participation: Withdrawn`.

A single compatibility badge may temporarily remain, but it is subordinate to semantic state and is not a write target.

---

## 5. Revision/Evaluation read model

The current reviewer UI has three useful queues:

- Needs your score;
- Needs rescore;
- Scored at current version.

003-E keeps those user-recognizable projections.

Their target basis becomes:

- exact current Revision identity;
- evaluator's Evaluation subject identity;
- applicable Evaluation relation.

The target does **not** create `needsRescore` as persistent domain state.

A useful semantic read shape contains:

- current Revision ref + ordinal;
- evaluator's applicable/historical Evaluation ref;
- `needsEvaluation` + reason.

This preserves the current workflow UX while fixing the underlying historical-overwrite semantics designed in 003-B.

---

## 6. `abstractReviewStatus` decision

003-E explicitly rejects creating a replacement Concept Design lifecycle for:

- `CURRENT`;
- `FEEDBACK_PENDING`;
- `REVISED`;
- `ACKNOWLEDGED`.

Current implementation evidence shows this field combines several unrelated concerns:

- Feedback creation;
- presenter edit opportunity;
- Revision occurrence;
- Board acknowledgement;
- a later clear-to-current operation.

The accepted model already has the real owners:

- Revision;
- Evaluation applicability;
- Feedback;
- explicit revision-exception policy;
- edit eligibility.

Therefore `abstractReviewStatus` becomes **legacy-only compatibility state**.

### Important non-decision

003-E does not claim that current `ACKNOWLEDGED` is useless product behavior forever. It says only that the recovered behavior is insufficient to justify a canonical concept/state merely because the existing implementation has an enum and button.

If later evidence shows a durable organizer acknowledgement with independent lifecycle/user value, it should be discovered explicitly.

---

## 7. Editing UI/API state

Current presenter UI receives a single `canEdit` boolean computed from legacy `ProgramStatus`/`AbstractReviewStatus`.

Target read models provide a server-derived result with an explanatory reason, for example:

```text
editEligibility:
  allowed
  reason
  revisionExceptionActive
```

Reasons can distinguish:

- Window upcoming/closed;
- manual suspension;
- Withdrawal;
- Selection lock;
- Archive;
- capability/scope denial;
- missing explicit revision exception.

The client does not reconstruct these rules itself.

Feedback remains displayable independently from whether editing is currently permitted.

---

## 8. Blind-review API/UI state

Current masking uses:

- blank presenter strings/null identity;
- null aggregate until own current score;
- a separate explicit identity reveal endpoint.

The target replaces implicit absence with explicit visibility state.

Presenter identity:

```text
visibility = concealed | revealed | ordinary
```

Peer aggregate:

```text
visibility = concealed | revealed
revisionRef = exact Revision
```

Protected values are absent while concealed.

This prevents consumers from confusing concealed information with missing/corrupt data and ensures a newly revised subject gets a distinct aggregate disclosure item.

---

## 9. Deliverable UI/API state

The presenter and organizer interfaces currently treat `deckStatus` as the Deliverable workflow.

Target state instead exposes:

- current ArtifactVersion identity/version;
- current exact Assessment, if any;
- readiness projection.

Target-native readiness values are:

- not required;
- not provided;
- awaiting review;
- concern;
- ready.

Compatibility projection can continue using:

- null;
- `SUBMITTED`;
- `CONCERN`;
- `APPROVED`.

### `REVIEWED`

`REVIEWED` has no independent accepted concept semantics. Existing migrated rows may retain it as legacy residue until a target-native Assessment supersedes it. New target-native commands do not create `REVIEWED` merely to preserve the old enum.

---

## 10. Availability and context presentation

The target UI distinguishes:

1. canonical Window phase;
2. manual offer suspension;
3. application setup/live mode;
4. Archive closure.

A submission form can therefore communicate the actual reason it is unavailable rather than treating all cases as `submissionsOpen = false`.

Similarly, `ConferenceStatus` remains a compatibility presentation but does not decide every action.

A historical organizer view may be mostly read-only while still permitting explicit post-Archive operations such as export, Unpublish, eligible archive Publication, or post-event-safe Dispatch.

---

## 11. Capacity and Coverage presentation

The existing dashboard appropriately colocates Capacity and representation/balance information, but 003-E requires their semantics to remain visibly distinct.

Capacity:

- hard finite limit;
- committed;
- remaining;
- saturated.

Coverage:

- target;
- observed value;
- gap/excess;
- warning/confirmation.

A Coverage warning is advisory planning intent. A Capacity failure is a hard precondition.

The interface must not use similar red/green styling in a way that makes those enforcement levels indistinguishable without explanatory text.

---

## 12. Schedule generation/apply interface

Current schedule generation writes generated placements immediately.

The target interface requires two distinct states:

```text
current authoritative Schedule
        ≠
generated proposal
```

A generated proposal carries the Schedule version it was based on. Applying it is an explicit action requiring Schedule authority and expected-base validation.

If the Schedule changed since generation, the apply operation fails as stale rather than silently replacing the planner's newer work.

This does not require a new ScheduleDraft concept.

---

## 13. Publication/public archive interface

Organizer UI must distinguish:

- share-eligibility policy;
- exact Publication state.

A shareable/ready deck may still be unpublished.

Public listing and direct file fetch must both re-evaluate the exact MaterialRef's Publication + current eligibility.

A `publicId` is therefore treated as an address, not a bearer authorization.

If eligibility is revoked while Unpublish cleanup is still converging, the public read model suppresses the item immediately from source-authoritative eligibility truth.

---

## 14. Dispatch interface

The current communication UI can largely remain composition-oriented, but target state should distinguish:

- audience resolution;
- preview;
- semantic round;
- same-round already-sent recipients;
- provider attempt;
- confirmed SendRecord;
- blocked/uncertain outcome.

Intentional repeat contact uses a new semantic round rather than an `includeAlreadyEmailed` override that conflicts with same-round deduplication.

---

## 15. API command/read separation

003-E does not require REST purity or one route per concept.

It establishes only this boundary:

- **reads may compose many owners** for the user's task;
- **writes must invoke one semantically explicit command or accepted synchronization bundle**.

Examples of target write meaning:

- decide Selection;
- withdraw own participation;
- revise Proposal;
- record Evaluation;
- give Feedback;
- assess exact ArtifactVersion;
- change sharing eligibility;
- publish/unpublish exact MaterialRef;
- accept generated Schedule proposal;
- perform Dispatch round.

A generic `setStatus` command is not an acceptable permanent semantic interface when it spans independent owners.

---

## 16. API error contract

Current routes mostly expose English `{ error: string }` messages.

Target command services should provide stable machine-readable reason codes so clients can distinguish:

- authentication;
- capability/scope denial;
- lifecycle/availability denial;
- Capacity/precondition conflict;
- concurrency/expected-head conflict;
- concealment/publication eligibility;
- validation;
- external uncertainty.

English messages remain presentation and may change without forcing business-logic string parsing.

Protected resource existence/information must not leak through detailed errors.

---

## 17. Compatibility cutover strategy

003-E establishes additive coexistence rather than a big-bang API/UI rewrite.

### C1 — semantic reads/commands added

Add target read-model fields and action-oriented command paths/services.

### C2 — legacy adapters

Old mutation endpoints may translate supported, unambiguous operations into canonical commands.

### C3 — canonical-only first-party writes

All first-party UI writes use semantic commands. Legacy state becomes read-only projection.

### C4 — compatibility retirement

Remove old mutation contracts, then old read fields, only after consumer inventory and shadow/parity checks pass.

003-F owns the executable deployment ordering.

---

## 18. Compatibility field decisions

| Field | 003-E target |
|---|---|
| `programStatus` | deterministic lossy projection from Selection + Withdrawal; retire as writer |
| `abstractVersion` | keep useful ordinal; exact Revision ID owns reference semantics |
| current Submission content | retainable current Revision denormalization |
| `SubmissionTheme` | retainable current Revision Classification projection |
| `abstractReviewStatus` | legacy-only; no replacement enum |
| `deckStatus` | target-native projection from exact artifact Assessment; `REVIEWED` legacy-only |
| `deckShareable` | transitional share-policy current-state representation |
| `decksPublished` | collection/surface control only; not exact Publication |
| `ConferenceStatus` | setup/live compatibility mode + Archive projection |
| `submissionsOpen` | manual offer suspension only |

---

## 19. Shadow/parity principle

Parity is semantic, not byte-for-byte equality.

Differences are acceptable when they are:

- intentional corrections;
- explicit information gain from decomposed owners;
- legacy-unknown provenance;
- security/correctness hardening.

For example:

- a withdrawn selected Proposal having both Selection and Withdrawal is correct even though old `programStatus` had only `WITHDRAWN`;
- blocking an old un-published deck `publicId` is an intended correctness improvement;
- preserving multiple Evaluation rows by Revision is intended information gain;
- inability to infer the meaning of legacy `REVIEWED` is honest migration uncertainty.

Unexpected differences remain cutover blockers.

---

## 20. Consumer inventory requirement

Before removing compatibility state, 003-F must account for more than React components.

Inventory includes:

- API routes;
- server pages;
- client components;
- helpers/queries;
- exports;
- seed/demo code;
- tests/fixtures;
- documentation/examples;
- any supported external clients.

---

## 21. Operational convergence presentation

The accepted TX-B architecture may create temporary states in which source truth has committed but cleanup remains pending.

UI rule:

- participant/public surfaces show source-authoritative truth immediately;
- operator interfaces may additionally show user-meaningful recovery state.

Examples:

- Withdrawn — schedule cleanup pending;
- Public access blocked — unpublish cleanup pending;
- Message outcome uncertain — operator review required.

No generic Workflow state is introduced.

---

## 22. Gap reconciliation result

003-E completes the **design** portion of the interface/compatibility consequences of all 003-A semantic gaps.

Especially resolved at design level:

- SG-002/SG-003 combined Program status;
- SG-005 disclosure API/UI representation;
- SG-006 current Classification projection;
- SG-007 Deliverable status representation;
- SG-008/SG-009 public listing/file-read semantics;
- SG-012 current Revision projection;
- SG-013 Availability UI/API semantics;
- SG-014 Schedule generation preview/apply;
- SG-016 Dispatch resend UI;
- SG-017 `abstractReviewStatus` disposition;
- SG-018 Coverage presentation;
- SG-P01 through SG-P04 policy-result presentation.

No gap is marked implementation-complete.

---

## 23. Rejected alternatives

### 23.1 One new mega-status enum

Rejected because it would recreate the exact semantic coupling Phase 001/002 decomposed.

### 23.2 One API endpoint per concept

Rejected. Task-oriented read models may compose many concepts; physical/API decomposition should follow implementation usefulness.

### 23.3 Keep legacy fields authoritative forever for compatibility

Rejected because that creates permanent dual authority and drift.

### 23.4 Remove all compatibility fields immediately

Rejected because the current UI/server code heavily consumes them and migration can be safer through additive read models and adapters.

### 23.5 Persist work queues

Rejected because queue membership is derived from authoritative state/policy and would create additional synchronization obligations.

### 23.6 Let clients infer concealment from blank values

Rejected because absence and intentional concealment are semantically different.

---

## 24. Exit criteria

| Criterion | Result |
|---|---|
| canonical vs derived vs compatibility vs operation state classified | PASS |
| `programStatus` compatibility projection defined | PASS |
| `abstractReviewStatus` disposition resolved without invented concept | PASS |
| `deckStatus` native projection and `REVIEWED` legacy treatment defined | PASS |
| exact Revision/Evaluation queue semantics defined | PASS |
| explicit Controlled Disclosure API/UI state defined | PASS |
| Availability/edit/lifecycle interface semantics defined | PASS |
| Capacity vs Coverage presentation separated | PASS |
| Schedule generation preview/apply interface defined | PASS |
| exact Publication/public token interface rule defined | PASS |
| Dispatch round/uncertainty interface defined | PASS |
| command vs read-model boundary defined | PASS |
| error-code direction defined | PASS |
| additive compatibility/cutover model defined | PASS |
| runtime/schema changes performed | NO — intentionally |

**003-E passes.**

---

## 25. Handoff to 003-F

003-F — Data Migration, Backfill, Rollout & Reversibility Plan must now make the Phase 003 target executable.

It should define:

1. additive schema migration batches;
2. backfill order and provenance classification;
3. canonical read/write introduction order;
4. compatibility adapter lifetime;
5. first-party UI/API consumer migration order;
6. public-access hardening sequence;
7. shadow/parity checks and thresholds;
8. dual-write/canonical-write cutover;
9. rollback boundaries that preserve new truthful history;
10. legacy field/endpoint retirement prerequisites;
11. test/CI/deployment gates;
12. versioned Prisma migration discipline replacing destructive reliance on `db push` for production reconciliation.

003-E authorizes no implementation changes by itself.