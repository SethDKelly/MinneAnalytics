# 003-D — Authority, Lifecycle, Disclosure & Operational Policy Reconciliation

Status: **Complete**  
Concept model maturity: **v0 specified; persistence and execution architecture defined; policy reconciliation complete**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [003-C — Synchronization, Transaction, Idempotency & Recovery Architecture](003-C-synchronization-transaction-idempotency-and-recovery-architecture.md)

## 1. Purpose

003-D reconciles the current MinneAnalytics role checks, Conference lifecycle gates, submission/edit rules, blind-review visibility, and deck-sharing/publication behavior with the accepted Concept Design model.

It does **not** introduce a new Authorization, Workflow, ApplicationLifecycle, Consent, or Rights concept.

Current normative policy is owned by:

- [v0 Authority, Lifecycle & Operational Policy Target](knowledge/reconciliation/authority-lifecycle-operational-policy-target.md);
- [v0 Disclosure, Sharing & Publication Policy Baseline](knowledge/reconciliation/disclosure-publication-policy-baseline.md).

Historical evidence is preserved in:

- [003-D Authority & Lifecycle Policy Matrix](evidence/003-D-authority-lifecycle-policy-matrix.md);
- [003-D Disclosure & Publication Policy Matrix](evidence/003-D-disclosure-publication-policy-matrix.md).

---

## 2. Entry question

003-C established how accepted commands commit/retry/recover.

003-D asks:

> **Which actor may attempt each command, in which application/lifecycle context, and under which visibility/publication policy—without letting role strings or a broad status enum become domain authority?**

---

## 3. Current authority model finding

The current `lib/roles.ts` is a **good structural substrate** because capability decisions are already centralized behind helpers such as:

- `canScore`;
- `canApprove`;
- `canManageDeck`;
- `canSetDeckShareable`;
- `canPublishDeckArchive`;
- `canAccessSchedule`;
- `canArchiveConference`.

The problem is not centralized authorization itself. The problem is that route semantics are still coupled to current role names and occasionally reuse an unrelated capability—for example the email-send route currently uses `canSetProgramStatus` as its authorization check.

003-D therefore retains role→capability mapping as an implementation technique but makes **action capability** the target policy vocabulary.

---

## 4. Capability model

003-D defines application-scoped capabilities for consequential commands, including:

- context/settings/window management;
- Vocabulary/Coverage stewardship;
- Archive closure;
- Evaluation;
- Feedback;
- Selection;
- Deliverable Assessment;
- public-sharing policy;
- Publication/Unpublish;
- Schedule mutation;
- operational Dispatch;
- exports/historical reads.

Presenter token ownership similarly supplies scoped capabilities to revise, withdraw, and provide the Proposal's Deliverable.

The current role mapping can remain initially:

- ADMIN → context/window/vocabulary/coverage/archive;
- BOARD → Evaluation, Feedback, Selection, Deliverable review, share/publication, Schedule, Dispatch;
- CHAIR → Evaluation, Feedback, Deliverable review, current export/read capabilities.

The mapping can evolve later without rewriting concept histories.

---

## 5. No administrator bypass rule

A capability lets an actor invoke an application command. It does not waive the command's semantic preconditions.

Examples:

- `DECIDE_SELECTION` does not bypass Capacity;
- `PUBLISH_MATERIAL` does not bypass Deliverable readiness/share policy;
- `RECORD_EVALUATION` does not make an old Evaluation applicable to a newer Revision;
- `MANAGE_AVAILABILITY` does not mutate Archive or reopen a closed Window through a boolean override.

This preserves Concept Design authority over role privilege.

---

## 6. Lifecycle reconciliation

The current `assertConferenceAcceptsMutations` treats `ACTIVE` as a universal mutation permission.

003-D rejects that as the target policy because different commands have different legitimate lifecycle behavior.

The compatibility application progression is narrowed to:

```text
DRAFT/setup
    ↓
ACTIVE/live
    ↓
Archive closure
```

Archive is the canonical monotonic closure fact.

Routine reopening (`ARCHIVED -> ACTIVE/DRAFT`) is not accepted for v0 because the current admin route would erase `archivedAt` and contradict the Archive model.

Routine `ACTIVE -> DRAFT` regression is likewise not accepted absent new product evidence.

---

## 7. Post-Archive behavior

Archive closes **ordinary active work**, not every possible operation.

Explicitly allowed after closure when policy/capability otherwise passes:

- historical reads;
- exports;
- recovery/convergence of already committed source truth;
- public Unpublish;
- exact eligible Publish/Republish for the post-event slide archive;
- explicitly post-closure-safe Dispatch purposes, such as a post-event feedback request.

Ordinary Proposal, Evaluation, Selection, Deliverable, Schedule, and program-shaping operations remain closed.

This is a deliberate improvement over the current ACTIVE-only mutation gate.

---

## 8. Availability Window and manual suspension

003-D finalizes the role of legacy `submissionsOpen`:

> **It is a manual offer-suspension policy, not an alternative Availability Window authority.**

Target Proposal Offer requires:

1. live/non-archived context;
2. canonical Window open under `[opensAt, closesAt)`;
3. no manual suspension;
4. ordinary request eligibility.

Setting the compatibility boolean true cannot override a not-yet-open/closed Window, setup mode, or Archive.

---

## 9. Revision/edit policy

Current presenter editing is driven primarily by `ProgramStatus`, with a nominal `FEEDBACK_PENDING` branch that is effectively unreachable under the current enum ordering because APPROVED/DECLINED/WITHDRAWN are returned before it.

003-D replaces this with an explicit policy composition.

Ordinary edit requires:

- ownership-scoped revision capability;
- live/non-archived context;
- no Withdrawal;
- canonical Availability Window open;
- no current final-decision edit lock.

The v0 ordinary policy treats selected/not-selected as locked and reserve/undecided as editable while the Window is open.

A narrowly scoped **revision exception** may permit another Revision when an authorized reviewer/organizer intentionally requests it. That exception remains application policy, does not reopen the whole Window, does not bypass Archive, and is not inferred merely because Feedback exists.

003-E will reconcile `abstractReviewStatus` into the appropriate UI/API policy projection.

---

## 10. Withdrawal policy

Withdrawal remains originator-authoritative and is not tied to the Proposal availability window.

V0 allows it while the event context is not archived and the participation has not already been withdrawn.

A post-event request to remove public material is not modeled as a late participation Withdrawal; it uses Publication/share policy instead.

---

## 11. Blind-review decomposition

Current blind behavior already demonstrates two independent information items:

1. presenter identity;
2. peer/committee aggregate.

003-D makes that split canonical at the policy layer.

### Presenter identity

- Proposal-level information;
- separately staged for each reviewer/review context when blind review is enabled;
- explicit reviewer Reveal is permitted before scoring when review access is valid;
- Reveal is persisted and monotonic.

This preserves the current optional reveal behavior while replacing console-only logging.

### Peer aggregate

- exact-Revision information;
- no manual reveal bypass in v0;
- revealed only after the evaluator records the applicable Evaluation for that exact Revision;
- a new Revision receives a new concealed aggregate relation.

This preserves anti-anchoring behavior without a mutable `scoresVisible` state.

---

## 12. Blind-mode configuration locking

`blindReviewEnabled` cannot safely remain an ordinary live toggle after review begins.

- enabling blind mode after reviewers may already know protected information cannot restore ignorance;
- disabling it after staging would disclose all protected information.

Target v0 therefore locks ordinary blind-mode configuration once protected review/Evaluation activity exists.

If a future operational need requires disabling blind mode midstream, that must be an explicit bulk-reveal operation that durably reveals all affected staged relations rather than silently changing the UI.

---

## 13. Legacy disclosure migration

Historical identity reveals were only console-logged and cannot be reconstructed reliably.

003-D preserves the 003-B no-fabrication rule:

- new target review contexts use native Disclosure records;
- legacy in-flight review exposure remains legacy-unknown where evidence is absent;
- no migration script may claim an unrevealed relationship proves the reviewer never saw the information.

---

## 14. Shareability policy

Current `deckShareable` is a mutable Board-controlled boolean defaulting true.

003-D does **not** reinterpret that as presenter legal consent because the repository does not provide evidence for such a lifecycle.

Instead:

- it remains an application public-sharing eligibility input;
- the current Board mapping may initially retain authority to change it;
- target-native changes should retain actor/time provenance;
- an affirmative result permits eligibility evaluation but never automatically publishes;
- revocation makes affected public material ineligible and triggers Unpublish convergence.

An untouched legacy default-true value is legacy current state, not historical evidence that an actor explicitly consented.

---

## 15. Publication policy

Publishing exact material requires:

- `PUBLISH_MATERIAL` capability;
- exact MaterialRef;
- exact Deliverable readiness where applicable;
- affirmative sharing policy;
- current participation/rights/safety eligibility;
- lifecycle policy that permits the action.

Archive does **not** inherently block Publication. V0 explicitly permits post-event publication of exact eligible slide material and always permits authorized Unpublish when public exposure must end.

A Publication still never silently repoints to a new DeckFile.

---

## 16. Replacement deck policy

For the current v0 slide-archive use case, a replacement ArtifactVersion becomes a new publication candidate rather than silently inheriting public exposure.

Preferred behavior:

1. old currently published deck becomes ineligible as the current public artifact;
2. old Publication is unpublished through SYNC-008 when needed;
3. new deck receives its own readiness Assessment;
4. authorized actor explicitly publishes the new exact deck.

Keeping multiple historical deck versions public would require an explicit future product decision.

---

## 17. Historical public-ID access

The current public resolver can accept a historical DeckFile `publicId` based on the parent's current approved/shareable state.

That is rejected by the target exact-material policy.

Target authorization path is:

```text
public token
   ↓
exact MaterialRef
   ↓
currently published Publication
   ↓
current eligibility checks
   ↓
serve bytes
```

A public token is an address, not authority.

This resolves the design portion of SG-009.

---

## 18. Dispatch lifecycle policy

Current operational email send is Board-authorized indirectly through `canSetProgramStatus` and blocked universally outside ACTIVE.

003-D separates those concerns:

- `DISPATCH_OPERATIONAL` is its own capability;
- audience/message eligibility remains Dispatch application policy;
- live event operational sends are permitted according to semantic purpose;
- after Archive only explicitly post-closure-safe purposes are permitted.

No Communication or Workflow concept is introduced.

---

## 19. High-consequence actions

003-D classifies these as requiring explicit server-side capability enforcement and durable actor attribution where applicable:

- Selection Decision;
- Archive;
- sharing-policy changes;
- Publication/Unpublish;
- Deliverable readiness Assessment;
- explicit identity Reveal;
- accepted Schedule apply;
- operational Dispatch.

UI control visibility is never authorization.

---

## 20. Gap disposition

003-D designs the target resolution for:

- SG-005 — Controlled Disclosure policy/history;
- SG-008/SG-009 publication-access policy aspects;
- SG-P01 — edit eligibility;
- SG-P02 — authority naming/capability;
- SG-P03 — Archive/post-event operations;
- SG-P04 — public sharing/rights policy;
- policy portions of SG-013 and SG-017.

These gaps remain open operationally until 003-E/003-F and runtime verification.

---

## 21. Rejected alternatives

### Generic Authorization concept

Rejected. Current needs are application capabilities resolved from existing actor context, not a user-managed grant/delegate/revoke lifecycle.

### `ACTIVE` as universal permission

Rejected. It blocks legitimate post-event operations and hides action-specific policy.

### Admin bypass

Rejected. Privilege does not waive concept invariants.

### Feedback automatically opens editing

Rejected. Feedback and Revision permission are separate concerns.

### Blind-mode live toggle

Rejected once review activity exists because information exposure is irreversible.

### `deckShareable=true` as consent history

Rejected. Current implementation lacks actor/source provenance and presenter-consent semantics.

### Public ID as authorization

Rejected. Public access must resolve through exact currently published material.

---

## 22. Implementation authorization

003-D authorizes **no runtime, schema, role, API, UI, or permission-code change**.

It defines the policy target that 003-E must expose through stable API/UI state and that 003-F must migrate/cut over safely.

---

## 23. Exit review

### Authority decomposition

**PASS** — roles remain implementation assignments; action capabilities own application authorization semantics.

### Lifecycle decomposition

**PASS** — Archive is monotonic; setup/live compatibility is retained without a generic lifecycle concept; post-closure exceptions are explicit.

### Availability/edit policy

**PASS** — Window authority, manual suspension, decision locks, and explicit revision exceptions are separated.

### Controlled Disclosure

**PASS** — identity and exact-Revision aggregate policies are explicit; blind-mode transition policy is safe.

### Publication/share policy

**PASS** — share eligibility, exact Publication, Archive timing, replacement artifacts, and public-token access are separated.

### Anti-bloat discipline

**PASS** — no Authorization, Consent, Workflow, PublicArchive, or ApplicationLifecycle concept was introduced.

### Runtime refactoring

**NOT AUTHORIZED** — compatibility API/UI and executable migration/cutover design remain incomplete.

**003-D result: COMPLETE.**

---

## 24. Next — 003-E

Proceed to:

### **003-E — Derived Views, API/UI State & Compatibility Reconciliation**

003-E should define:

- canonical read models and derived status labels;
- `programStatus`, `abstractReviewStatus`, `deckStatus`, blind-review visibility, and Archive/publication compatibility behavior;
- API command/read contracts around exact Revision/Artifact/Publication identities;
- schedule proposal/acceptance interaction;
- pending synchronization/blocked/uncertain operational presentation;
- UI treatment of capability denial, edit locks/exceptions, historical Evaluation, disclosure state, and post-Archive operations;
- compatibility deprecation boundaries before 003-F rollout planning.
