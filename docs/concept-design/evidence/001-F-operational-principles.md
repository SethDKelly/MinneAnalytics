# 001-F Evidence — Operational Principles

Status: **Complete for 001-F review**  
Concept model maturity: **v0 — discovery**  
Input baseline: 18 candidates surviving 001-E.

## 1. Purpose

This document gives each 001-E candidate one archetypal operational story.

An operational principle is not an exhaustive use case, workflow specification, UI walkthrough, or implementation design. It demonstrates the characteristic behavior by which a concept fulfills its purpose.

The test is intentionally strict:

> **Can a person understand why this concept exists and how it works from one concise story, without needing another concept's internal lifecycle or MinneAnalytics implementation structure?**

If the answer is no, the candidate should not survive merely because its purpose sounds useful.

---

## 2. Operational-principle rules

Each principle must satisfy the following.

### OP-R01 — Archetypal rather than exhaustive

The story should demonstrate the defining behavior, not enumerate every edge case.

### OP-R02 — Concept-local

The story may refer to generic actors, subjects, resources, recipients, contexts, or supplied eligibility decisions. It must not require another concept's internal state machine.

### OP-R03 — Purpose-revealing

The behavior should visibly solve the concept's stated problem.

### OP-R04 — Implementation-neutral

No principle may depend on Prisma models, routes, pages, API calls, enum names, token mechanics, provider names, or current component structure.

### OP-R05 — Bounded genericity

The principle should generalize beyond the current implementation instance only when the same behavioral essence remains recognizable.

### OP-R06 — No synchronization smuggling

A principle must not hide a multi-concept application workflow inside the concept merely to make the story look complete.

---

## 3. Proposal

**001-E status:** Strong.

### Purpose

Establish a durable offered subject for organized consideration.

### Operational principle

An originator wants others to consider a proposed session. They create a Proposal containing the offered subject matter and receive a stable reference to it. From that point onward, the Proposal remains the identifiable thing under consideration even if other activities later occur around it. The originator and other participants can return to that same Proposal rather than creating a new identity for every subsequent action.

### Why the story is concept-local

The story requires only:

- an originator;
- offered content;
- a stable Proposal identity/reference.

It does not require Evaluation, Selection, Revision, Classification, Withdrawal, or Schedule behavior.

### Falsification result

**PASS.** The principle is singular, natural, and complete enough to demonstrate why Proposal exists independently of the current `Submission` aggregate.

---

## 4. Revision

**001-E status:** Strong.

### Purpose

Change a subject while preserving prior forms and the sequence of change.

### Operational principle

A mutable subject currently has revision 1. Its editor changes the subject and records the change as revision 2 rather than overwriting revision 1. Revision 2 becomes the current form while revision 1 remains inspectable as an earlier form. Later, someone can see both what the subject is now and what it was before the change.

### Why the story is concept-local

Revision needs only:

- a referable mutable subject;
- an ordered sequence of revisions;
- a current revision;
- retained earlier revisions.

The story does not decide whether the editor was allowed to make the change or whether judgments about revision 1 remain current in some application.

### Falsification result

**PASS.** Permission-to-edit and Evaluation freshness can remain outside the concept without weakening the operational principle.

---

## 5. Evaluation

**001-E status:** Strong.

### Purpose

Record an independently formed judgment about a subject.

### Operational principle

An evaluator considers a subject and records their own judgment, optionally retaining private context that helps explain that judgment to themselves or other permitted evaluators. The judgment is attributable to that evaluator and subject. The evaluator may later revise their own judgment, but another actor's collective decision does not manufacture or replace the evaluator's judgment.

### Why the story is concept-local

Evaluation requires only:

- an evaluator;
- a subject;
- a judgment;
- optional private evaluation context.

It does not require Selection, Disclosure, Feedback, or an application rule about whether an older Evaluation should participate in a current aggregate.

### Falsification result

**PASS.** The principle clearly distinguishes personal judgment from downstream decision making and from current numeric-score realization.

---

## 6. Controlled Disclosure

**001-E status:** Provisional-strong.

### Purpose

Stage exposure of information whose visibility timing matters to participant behavior, while permitting intentional reveal when appropriate.

### Operational principle

A participant is working in a context where a particular piece of information is intentionally concealed at first. The participant can see that information is being withheld without receiving its contents. If an allowed reveal condition is satisfied and the participant chooses to reveal it, the concealed information becomes visible in that context. The disclosure can remain distinguishable from the information itself and from whatever activity the participant performs afterward.

### Why the story is concept-local

Controlled Disclosure requires:

- information whose exposure is staged;
- a participant/context;
- concealed versus disclosed state;
- an explicit or otherwise intentional reveal action where permitted.

The application may supply the rule determining whether reveal is allowed. Controlled Disclosure does not need to know Evaluation internals, role names, or authentication machinery.

### Falsification result

**PASS, with boundary guardrail.** The story is richer than generic access control because its defining behavior is staged exposure followed by intentional reveal. 001-G should retain the `Controlled` qualifier and reject any later expansion into general authorization/confidentiality.

---

## 7. Feedback

**001-E status:** Strong.

### Purpose

Deliver recipient-directed response about a subject, distinct from private judgment context.

### Operational principle

A reviewer has a response about a subject that is intended for its originator rather than merely for the reviewer's private notes. The reviewer records the Feedback for that subject and intended recipient. The recipient can later inspect the response as information deliberately addressed to them, with its source and relevant context preserved.

### Why the story is concept-local

Feedback requires only:

- a source;
- a subject;
- an intended recipient or audience;
- response content and context.

It neither creates an Evaluation nor requires the recipient to revise the subject.

### Falsification result

**PASS.** The current committee-to-originator case yields a natural principle. Future attendee response remains only a compatibility test; it is not required to justify this concept.

---

## 8. Selection

**001-E status:** Strong.

### Purpose

Record consequential organizer choice among candidates while retaining alternatives.

### Operational principle

A decision maker is considering several candidates for a limited program. They record that one candidate is selected, another is not selected, and another is retained as a reserve alternative. Later, when a place becomes available, the reserve candidate can be promoted through a new organizer decision without pretending that it had been selected all along.

### Why the story is concept-local

Selection requires:

- candidates;
- a decision authority supplied by application policy;
- selection/non-selection/reserve decisions;
- relevant decision history.

The concept does not need to know why capacity exists, how candidates were evaluated, or whether an originator later withdraws.

### Falsification result

**PASS.** Reserve and promotion fit naturally within the same decision purpose without requiring a broad `ProgramStatus` lifecycle.

---

## 9. Withdrawal

**001-E status:** Strong.

### Purpose

Allow an originator to rescind their participation or commitment independently of organizer preference.

### Operational principle

An originator has an active offered participation they no longer wish to continue. They withdraw that participation. The Withdrawal records that the originator rescinded their commitment and when it happened. Any separate history describing what other actors previously wanted or decided about the participation remains untouched.

### Why the story is concept-local

Withdrawal requires:

- an originator;
- an offered participation/commitment reference;
- an act of withdrawal;
- retained withdrawal state/history.

It does not need Selection state in order to explain what withdrawal means.

### Falsification result

**PASS.** The principle preserves independent actor agency and makes the split from Selection clearer than a unified status lifecycle would.

---

## 10. Availability Window

**001-E status:** Provisional.

### Purpose

Establish a visible time-bounded opportunity during which a governed activity is ordinarily available.

### Operational principle

An organizer defines that a participation opportunity opens at one time and closes at another. Before opening, affected participants can see that the opportunity is upcoming but cannot ordinarily act within it. During the interval it is open. After the closing time it is closed, while the window itself remains inspectable so participants can understand the timing that governed the opportunity. The organizer may explicitly adjust the interval when policy permits.

### Why the story is concept-local

Availability Window requires:

- an opportunity reference;
- opening and closing boundaries;
- visible upcoming/open/closed interpretation;
- ability to establish or adjust the interval.

It does not need to know the internal behavior of Proposal, Revision, Dispatch, or another governed concept.

### Falsification result

**PASS provisionally.** The operational principle is user-recognizable and richer than two timestamps because it models an explicitly communicated opportunity interval. It must remain about governed availability, not become general calendar/time infrastructure.

---

## 11. Coverage Target

**001-E status:** Provisional.

### Purpose

Express desired representation along a relevant collection dimension without owning actual collection composition.

### Operational principle

An organizer wants a collection to contain a desired amount of a particular kind of item. They establish a Coverage Target for a named dimension/value—for example, a desired minimum, maximum, or acceptable range. The target can be inspected, changed, or removed as planning intent evolves. The target states what representation is desired; it does not claim how much representation currently exists.

### Why the story is concept-local

Coverage Target requires only:

- a collection/dimension context;
- a target bucket/value or range;
- desired representation constraints;
- target lifecycle actions.

Actual counts or gaps can be supplied later by application composition over other concepts.

### Falsification result

**PASS provisionally.** The story fulfills a distinct goal-setting purpose without duplicating Selection or Classification state. 001-G should retain the prohibition against turning observed composition into authoritative Coverage Target state.

---

## 12. Capacity

**001-E status:** Strong.

### Purpose

Represent scarce commitment capacity and how commitments consume it.

### Operational principle

An organizer establishes a capacity pool with a finite amount available. Commitments can consume units from that pool according to the pool's accounting rules, and released commitments return capacity. At any time the organizer can see how much capacity is committed, how much remains, and whether the pool is saturated. Different commitment classes may consume the pool differently without changing the meaning of the pool itself.

### Why the story is concept-local

Capacity requires:

- a finite pool;
- consumption/release records or allocations;
- accounting rules/classes;
- remaining/saturated state.

It does not select which candidate should consume capacity and does not allocate activities to rooms/times.

### Falsification result

**PASS.** The principle remains meaningful before a Schedule exists and independently of current sponsor terminology.

---

## 13. Classification

**001-E status:** Strong.

### Purpose

Associate subjects with shared descriptive terms.

### Operational principle

A participant describes a subject by associating it with one or more reusable terms. Other participants can inspect which terms describe the subject and can find or group subjects that share a term. An association may later be changed or removed according to application policy without requiring the term itself to be renamed or deleted.

### Why the story is concept-local

Classification requires:

- a subject;
- referable descriptive terms;
- associations between them;
- inspection/change of associations.

The concept does not create, govern, or retire the reusable terms themselves.

### Falsification result

**PASS.** The principle naturally separates assigning meaning from governing the Vocabulary that supplies the terms.

---

## 14. Vocabulary

**001-E status:** Strong.

### Purpose

Maintain an evolving reusable set of descriptive terms that can be contributed to and stewarded over time.

### Operational principle

A participant finds that the existing vocabulary lacks a useful term and contributes a new reusable term. The term becomes available according to the vocabulary's contribution policy. Later, a steward corrects its wording and eventually retires it from future use without erasing the fact that the term existed historically. If needed, the steward can restore it. Throughout the lifecycle, participants can inspect the terms currently available for reuse.

### Why the story is concept-local

Vocabulary requires:

- reusable term identities;
- creation/contribution;
- availability/recognition state;
- rename/correction;
- retirement/restoration;
- historical continuity of terms.

It does not need to know which subjects are classified with a term.

### Falsification result

**PASS.** Contribution and stewardship form one natural term-lifecycle story rather than two unrelated concepts.

---

## 15. Deliverable

**001-E status:** Strong.

### Purpose

Obtain a required artifact and establish whether it is operationally ready.

### Operational principle

A responsible party is expected to provide an artifact for a subject or commitment. The Deliverable records that requirement and accepts the provided artifact. A reviewer examines it and may record a concern while it is not ready. After the concern is resolved, the reviewer establishes that the Deliverable is ready for its intended downstream use.

### Why the story is concept-local

Deliverable requires:

- a required artifact reference;
- responsible provider;
- supplied artifact;
- readiness review/state and concerns.

It does not decide why the artifact became required or whether a ready artifact should later be published publicly.

### Falsification result

**PASS.** The story is coherent beyond presentation decks and remains independent from Selection and Publication.

---

## 16. Schedule

**001-E status:** Strong.

### Purpose

Allocate eligible activities to constrained place/time opportunities while preserving human-adjustable placement.

### Operational principle

A planner has a set of activities to place and a set of available place/time opportunities. They create placements assigning activities to opportunities. If a placement causes a conflict or is undesirable, the planner can move, swap, or remove it. The system may offer a generated draft or suggestion, but the resulting Schedule is the explicit set of placements the planner can inspect and adjust.

### Why the story is concept-local

Schedule requires:

- activities supplied as eligible scheduling subjects;
- place/time opportunities;
- placements;
- conflict/constraint information;
- move/swap/unplace operations;
- optional generated placement suggestions.

It does not need to know why an activity was selected or how demand information was obtained.

### Falsification result

**PASS.** The principle survives replacement of current scheduling heuristics and future external-demand inputs.

---

## 17. Publication

**001-E status:** Strong.

### Purpose

Intentionally expose eligible material to a public audience.

### Operational principle

A publisher has material that may be made public. They intentionally publish an eligible item or collection, making that material available to the public audience. Material that is not intended for public exposure remains unavailable even if it exists and is otherwise ready. The publisher can later unpublish material without erasing the underlying material itself.

### Why the story is concept-local

Publication requires:

- material references;
- publication/share intent or eligibility supplied to the concept/application;
- publish/unpublish actions;
- public availability state.

It does not establish operational readiness, program Selection, or internal historical retention.

### Falsification result

**PASS.** The principle remains distinct from the historically overloaded “slide archive” terminology and from Deliverable readiness.

---

## 18. Archive

**001-E status:** Strong.

### Purpose

Close an active working context into retained read-only internal history.

### Operational principle

An operator determines that a working context has finished active operation and archives it. The context remains available for authorized historical inspection, but it is now explicitly a retained historical context rather than an active one. Later viewers can inspect what was retained and understand that ordinary ongoing work belongs to a different active context or phase.

### Why the story is concept-local

Archive requires:

- a referable working context;
- active versus archived state;
- archive/closure action;
- retained historical access.

Application synchronizations may use archived state to prevent ordinary mutations in other concepts; Archive itself does not need to own those concepts' actions or histories.

### Falsification result

**PASS.** The operational principle is coherent as internal historical closure provided later specifications continue to exclude public Publication and generic backup/retention infrastructure.

---

## 19. Dispatch

**001-E status:** Provisional-strong.

### Purpose

Send an operational message to a resolved audience while preserving performed-send history and semantic duplicate/round behavior.

### Operational principle

An organizer has an operational message to send and a resolved set of intended recipients. Before committing the action, they inspect the message and recipient set. They then dispatch the message. The Dispatch records the performed send and its recipient outcomes. If the same semantic send/round is attempted again, already-dispatched recipients can be recognized and skipped, while a later round can intentionally include recipients who newly qualify.

### Why the story is concept-local

Dispatch requires:

- a message instance/intention;
- a supplied/resolved recipient set;
- preview/confirmation;
- performed send/batch;
- recipient outcomes/history;
- duplicate/round semantics.

It does not need to know why a recipient qualified, nor does it absorb Feedback merely because both involve text sent between actors.

### Falsification result

**PASS.** The narrowed name produces a coherent operational principle. Reusable template authoring remains supporting configuration/input rather than a separate concept under current evidence.

---

## 20. Registration

**001-E status:** Provisional.

### Purpose

Track participant registration state independently of program selection and independently of which system supplies the fact.

### Attempted operational principle

A participant is expected to be registered for a relevant event context. Registration records whether that participant is currently registered, not registered, or no longer registered. The state may be entered locally or supplied by an external authoritative source, and organizers can inspect it when coordinating participation.

### Falsification problem

Unlike the other surviving candidates, the current evidence does not establish a stable concept-local lifecycle that MinneAnalytics itself owns.

The attempted story has two weaknesses:

1. **If Registration owns register/cancel actions**, 001-F invents behavior not currently supported by MinneAnalytics and only weakly implied by future integrations.
2. **If Registration merely mirrors a boolean/status supplied locally or externally**, its operational principle collapses into “record a fact from elsewhere,” which is closer to application state/integration composition than to an independently complete user-facing concept.

The present VIP-registration behavior is intentionally narrow, and the roadmap suggests external registration systems may remain authoritative.

### Falsification result

**FAIL for the current v0 concept set.** Demote Registration to a future concept signal / externally sourced operational fact until product behavior establishes a real registration/enrollment lifecycle or a richer user-facing registration-status purpose.

The underlying need remains accounted for as application state composed from external/local authoritative facts; it is not discarded.

---

## 21. Operational-principle result

Of the 18 candidates entering 001-F:

- **17 produce a natural concept-local operational principle**;
- **1 candidate, Registration, fails the operational-principle test and is demoted from the current v0 set**.

No surviving candidate requires revival of:

- Authorization;
- Export;
- Audit Trail;
- `Conference`;
- `Submission`;
- `Program`;
- current status enums;
- current role names;
- UI/workflow constructs.

The operational-principle pass therefore strengthens rather than reverses the decompositions established in 001-D and 001-E.
