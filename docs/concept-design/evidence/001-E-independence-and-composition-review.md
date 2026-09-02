# 001-E Evidence — Independence & Composition Review

Status: **Complete for 001-E review**  
Concept model maturity: **v0 — discovery**

## 1. Purpose

This artifact tests whether the surviving concept candidates can remain independently understandable while still composing into the MinneAnalytics conference workflow.

The review uses the 001-A rule:

> Concepts should not require direct knowledge of another concept's internal state merely because MinneAnalytics coordinates them.

Where one concept's behavior depends on another concept in this application, the default model is synchronization or application policy.

---

## 2. Independence test

A candidate passes only if:

1. its purpose can be stated without another candidate's purpose;
2. its state can be described without embedding another candidate's state machine;
3. its actions can be understood without calling another concept directly as part of their definition;
4. MinneAnalytics-specific eligibility/coordination can plausibly be supplied through synchronization or policy;
5. removing a neighboring concept would not make this candidate meaningless in principle.

An abstract reference to a subject, actor, recipient, term, resource, or context is allowed. Direct dependence on another concept's internal lifecycle is not.

---

## 3. Independence disposition by surviving candidate

| Candidate entering 001-F | Independence result | Important boundary condition |
|---|---|---|
| Proposal | **PASS** | Does not own Revision, Selection, Classification, or participant willingness. |
| Revision | **PASS** | Operates on a referable subject; edit eligibility remains external composition. |
| Evaluation | **PASS** | May evaluate a revision/subject reference; current-applicability remains external. |
| Controlled Disclosure | **PASS / guarded** | Owns staged exposure/reveal, not RBAC or Evaluation eligibility rules. |
| Feedback | **PASS** | Does not cause Revision or encode private Evaluation notes. |
| Selection | **PASS** | Does not own Withdrawal, Capacity, Coverage Target, or Schedule. |
| Withdrawal | **PASS** | Does not rewrite Selection history. |
| Availability Window | **PASS / provisional** | Governs time-bounded opportunity without knowing the governed action internals. |
| Coverage Target | **PASS / provisional** | Owns desired representation only; actual composition is derived elsewhere. |
| Capacity | **PASS** | Owns scarcity/consumption, not which candidate should be selected. |
| Classification | **PASS** | Associates a subject to terms; term lifecycle remains Vocabulary. |
| Vocabulary | **PASS** | Owns reusable terms; does not own subject associations. |
| Deliverable | **PASS** | Selection can create a requirement; Deliverable remains independently meaningful. |
| Schedule | **PASS** | Accepts eligible activities; does not own program selection or demand collection. |
| Publication | **PASS** | Accepts eligible/shareable material; does not own readiness or selection. |
| Archive | **PASS / guarded** | Gates ordinary mutation through composition without absorbing all concept state. |
| Dispatch | **PASS / guarded** | Accepts recipient eligibility/message content; does not own Selection/Deliverable rules. |
| Registration | **PASS / provisional** | Registration state is meaningful regardless of local/external source and Selection history. |

No surviving candidate requires a direct conceptual dependency on another candidate's internal representation.

---

## 4. High-confidence synchronization relationships retained

The following are composition signals, not merged concept boundaries.

### SYNC-SIGNAL-01 — Proposal → Revision

Creating a Proposal may establish an initial Revision. Later Revision activity may update which revision is treated by the application as the Proposal's current offered content.

**Independence protection:** Proposal does not implement version history; Revision does not define what a proposal means.

---

### SYNC-SIGNAL-02 — Revision ↔ Evaluation

An Evaluation identifies the subject/revision it judged. When Revision advances, application policy may exclude older Evaluations from current aggregate reasoning and surface renewed evaluation work.

**Independence protection:** historical Evaluation remains true; Revision does not mutate it into “invalid.”

---

### SYNC-SIGNAL-03 — Evaluation ↔ Controlled Disclosure

Evaluation state may change the application's disclosure policy, such as allowing aggregate scores to become visible after an actor records their own judgment.

**Independence protection:** Evaluation does not inherently reveal information; Controlled Disclosure does not own the judgment.

---

### SYNC-SIGNAL-04 — Feedback ↔ Revision availability

Eligible Feedback may create an application-specific exception that permits Revision even when an ordinary Availability Window has closed.

**Independence protection:** Feedback does not edit the subject; Revision does not need to know why the application allowed the edit.

---

### SYNC-SIGNAL-05 — Availability Window → Proposal / Revision / future actions

An open window may permit an otherwise-defined action; a closed window may ordinarily block it.

**Independence protection:** the window does not own the governed behavior or destroy its state after closing.

---

### SYNC-SIGNAL-06 — Selection ↔ Withdrawal

Effective participation may require both organizer Selection and absence of a current/effective Withdrawal.

**Independence protection:** organizer choice and originator willingness retain separate histories.

---

### SYNC-SIGNAL-07 — Selection ↔ Capacity

A Selection decision may create/release a Capacity consumption entry according to application accounting rules.

**Independence protection:** Capacity informs Selection but does not select; Selection does not calculate scarcity internally.

---

### SYNC-SIGNAL-08 — Selection + Classification/attributes + Coverage Target → composition assessment

Current program composition is derived from selected subjects and their classifications/attributes. Coverage Target supplies desired representation.

The application may compare these to produce:

- gaps;
- saturation/excess warnings;
- balance views;
- heatmaps/charts.

**Independence protection:** no `Composition Assessment` concept is required; no source concept duplicates derived counts.

---

### SYNC-SIGNAL-09 — Vocabulary → Classification

Vocabulary determines which terms are currently available for new Classification associations.

Retiring a term prevents new use but must not erase historical Classification associations.

---

### SYNC-SIGNAL-10 — Selection → Deliverable

Selection may make a Deliverable required or activate a downstream material request.

**Independence protection:** the selected session remains selected even if no artifact has yet been provided.

---

### SYNC-SIGNAL-11 — Deliverable + sharing intent → Publication

A ready Deliverable may participate in Publication eligibility only when separate sharing/publication conditions are satisfied.

**Independence protection:** readiness is not public consent/exposure.

---

### SYNC-SIGNAL-12 — Selection + Withdrawal → Schedule eligibility

Only currently participating selected activities may be schedulable under application policy.

**Independence protection:** placing/unplacing does not select/decline/withdraw a proposal.

---

### SYNC-SIGNAL-13 — Archive → active mutation gating

Archiving the event context may disable ordinary mutating actions across Proposal, Revision, Selection, Schedule, Dispatch, etc.

**Independence protection:** Archive does not absorb or rewrite those concepts' histories; it gates application composition.

---

### SYNC-SIGNAL-14 — Other concept state → Dispatch recipient eligibility

Examples:

- non-selected candidates may become eligible for a decline Dispatch;
- selected participants missing a Deliverable may become eligible for a reminder Dispatch;
- Registration state may determine reminder eligibility.

**Independence protection:** Dispatch accepts/resolves recipients from application policy; it does not own the program/registration facts.

---

### SYNC-SIGNAL-15 — External authoritative source → Registration / scheduling inputs

External registration or event systems may synchronize authoritative facts into the concept/application state that needs them.

**Independence protection:** provider identity/API shape remains engineering; Registration and Schedule retain provider-neutral purposes.

---

## 5. Derived behaviors that are explicitly not concepts

### Effective participation

Derived from Selection + Withdrawal and possibly event closure/application policy.

It is a query/projection such as:

> selected by organizers AND not withdrawn by originator.

No `ParticipationStatus` concept is introduced merely to recombine histories that were intentionally separated.

### Evaluation freshness/currentness

Derived by relating Evaluation's subject reference to current Revision plus application policy.

No `Validity`, `Freshness`, `Rescore`, or `ReviewStatus` concept is introduced.

### Needs-score / needs-rescore work queues

Views over Evaluation + Revision/currentness.

### Actual program composition

Projection over Selection + Classification/attributes.

### Coverage gap/excess

Comparison of actual composition projection with Coverage Target.

### Publication eligibility

Derived from Deliverable readiness + sharing intent + organizer/publication policy.

### Dispatch recipient eligibility

Derived from relevant concept/application state.

### Current mutability/edit eligibility

Derived from Revision action + Availability Window + authority policy + application-specific state/exception rules.

---

## 6. Authority after Authorization demotion

Demoting CC-009 Authorization does **not** remove authority constraints from the design.

For v0:

- authority is an application-wide policy concern;
- concept actions remain conceptually defined without `BOARD`, `CHAIR`, `ADMIN`, token, or SSO terminology;
- MinneAnalytics synchronizations/policies determine which established actor context may invoke consequential actions;
- authentication answers who is acting and remains an engineering/application concern separate from concept purposes.

If later product requirements expose an independent user-facing lifecycle of grants/delegations/scopes, concept discovery should re-open a focused authority candidate.

---

## 7. Provenance after Audit Trail demotion

Demoting Audit Trail also does not remove historical traceability.

Intrinsic histories remain wherever concept correctness requires them, including likely:

- Revision history;
- Evaluation subject/context/history as needed;
- Selection decision history where later changes matter;
- Withdrawal occurrence/history;
- Vocabulary retirement/change history;
- Dispatch history/deduplication state;
- Archive transition/history;
- Registration source/provenance where externally supplied.

A future cross-concept Audit Trail may observe consequential actions, but it may not replace those intrinsic histories.

---

## 8. Independence risks for 001-F

001-F should reject or revise any operational principle that makes a candidate:

1. directly query another concept's internal state as part of its own definition;
2. use `Conference`, `Submission`, current status enums, or current role names to remain understandable;
3. encode a current UI route/tab/dashboard as a concept action;
4. make a derived application projection into authoritative duplicated concept state;
5. turn a synchronization rule into an intrinsic invariant solely because the current code couples the behavior;
6. hide missing completeness behind an unspecified “system checks other things” step;
7. over-generalize a concept until neighboring purposes become mere modes of it.

---

## 9. Result

The 18-candidate 001-E baseline is compositionally plausible without introducing coordinating god concepts or direct inter-concept service dependencies.

The most important corrections relative to 001-D are:

- authority remains policy rather than a current standalone concept;
- observed composition remains derived rather than state owned by Coverage;
- externally sourced facts synchronize into the concept/application behavior that needs them;
- Export remains a projection capability;
- cross-concept auditing remains future work while intrinsic provenance is preserved.

This independence result is sufficient to proceed to operational-principle testing in 001-F.