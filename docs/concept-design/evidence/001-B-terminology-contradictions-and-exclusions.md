# 001-B Evidence — Terminology, Contradictions & Exclusions

Status: **Complete for 001-B baseline**  
Purpose: prevent historically contingent names, prototype simplifications, and contradictory evidence from silently becoming Concept Design assumptions.

## 1. Interpretation rule

This register does not resolve concept boundaries. It marks areas where later phases must reason from purpose and operational need rather than inherit the repository's current vocabulary or state model.

Three categories are used:

- **Terminology drift** — a word changed meaning, accumulated responsibilities, or is ambiguous.
- **Contradiction / ambiguity** — repository evidence supports more than one interpretation or documents an intentional simplification.
- **Exclusion** — an implementation/demo detail that must not be promoted into durable product intent without independent evidence.

---

## 2. Terminology drift register

### TD-001 — `SCORER` / `CORE` → `BOARD` / `CHAIR`

**History**

The initial plan used capability-oriented labels such as `Scorer`, `Chair`, and `Core`. Commit `57892705a18da793bcbe726a7344c4d60ea0f8fd` replaced `SCORER` / `CORE` with board/co-chair organizational roles and redistributed capabilities accordingly.

**Risk**

Later discovery could assume either the old capabilities or current organizational names are intrinsic design entities.

**Rule for later phases**

Extract responsibilities first: evaluate, approve, schedule, review artifacts, publish, administer, etc. Decide later whether authority itself is conceptualized and how organizational roles participate in it.

---

### TD-002 — `Chair`

**History**

`Chair` appears as:

- an early actor/capability label;
- the later `CHAIR` co-chair role;
- the `/chair/{token}` program-management surface used by both board and co-chair actors;
- generic prose for program committee activity.

**Risk**

A page name can make unrelated responsibilities look like one coherent domain role.

**Rule for later phases**

Use explicit responsibility language in discovery records. Avoid `chair` as an unqualified design term.

---

### TD-003 — `Submission`

**Current implementation scope observed historically**

The term/record has carried or coordinated:

- presenter identity/contact information;
- proposed talk content;
- co-presenter information;
- technical level;
- theme associations;
- program decision state;
- presenter withdrawal;
- sponsor classification;
- VIP registration;
- deck readiness;
- abstract revision pointer/status;
- access token linkage.

**Risk**

The implementation's aggregate root can masquerade as a single Concept Design concept.

**Rule for later phases**

Treat `Submission` as a historical implementation/domain noun until purpose analysis shows which behaviors belong together.

---

### TD-004 — `ProgramStatus`

**Observed values**

`PENDING`, `APPROVED`, `DECLINED`, `BACKUP`, `WITHDRAWN`.

**Historical signal**

The v2 plan explicitly chose not to add revision/review concerns to this enum and introduced a parallel abstract-review state.

**Risk**

The enum combines at least different sources of state change: committee/program decisions and presenter withdrawal. `PENDING` also represents absence of a final decision rather than an affirmative outcome.

**Rule for later phases**

Do not assume one lifecycle solely because one enum currently represents the states.

---

### TD-005 — `AbstractReviewStatus`

**Observed values/purpose in v2**

`CURRENT`, `FEEDBACK_PENDING`, `REVISED`, `ACKNOWLEDGED`.

**Historical signal**

The final v2 plan records an explicit design question about separating abstract-review status from rescoring state and states that a single enum was chosen for demo simplicity.

**Risk**

A known implementation simplification may be mistaken for a durable behavioral model.

**Rule for later phases**

Re-derive the underlying problems before accepting this state machine.

---

### TD-006 — `Theme`

**Historical evolution**

Originally an administrator-created category. It later accumulated:

- presenter-created labels;
- official/community source;
- moderation lifecycle;
- soft removal;
- usage associations;
- target minimum/maximum counts;
- filtering;
- coverage analysis.

**Risk**

Category membership, vocabulary governance, and representation policy may be conflated by the current table/word.

**Rule for later phases**

Treat `Theme` as an evidence cluster, not a predetermined concept boundary.

---

### TD-007 — `Score`

**Historical evolution**

Initially a numeric value plus private notes associated with a reviewer and talk. V2 added the version context that the score evaluated and rules controlling whether it contributes to the current aggregate.

**Risk**

A score's stored existence, historical meaning, applicability to current content, and aggregate participation can be conflated.

**Rule for later phases**

State these needs separately during purpose discovery.

---

### TD-008 — `Feedback`

**Historically distinct uses**

1. private evaluator score notes;
2. committee-to-presenter feedback;
3. future attendee/session feedback;
4. post-event feedback-request communications.

**Risk**

The common English word obscures different audience, purpose, timing, and confidentiality.

**Rule for later phases**

Qualify the actor relationship and purpose whenever using `feedback`.

---

### TD-009 — `Archive`

**Distinct current meanings**

1. public post-conference deck/slide publication;
2. internal read-only access to an archived conference.

**Risk**

Publication and historical preservation can be accidentally treated as one behavior because both use “archive.”

**Rule for later phases**

Use `public material publication` and `historical conference retention/access` during discovery until boundaries are established.

---

### TD-010 — `Approval`

**Distinct contexts**

- approval of a talk into the program;
- approval of a presentation deck/material;
- potential administrative approval/promotion of a community theme to official status.

**Risk**

A generic state word can suggest shared semantics that may not exist.

**Rule for later phases**

Always qualify what is being approved and why.

---

### TD-011 — `Review`

**Distinct contexts**

- evaluating/scoring candidate talks;
- reviewing revised abstracts;
- deck readiness review;
- historical committee review of archived events.

**Risk**

A UI or prose term may hide multiple purposes.

**Rule for later phases**

Avoid treating “review” as a candidate concept without a specific purpose.

---

### TD-012 — `Conference`

**Observed scope**

The current record/configuration anchors:

- lifecycle;
- submission windows;
- review policy;
- themes/targets;
- capacity parameters;
- communications;
- schedule;
- publication state;
- historical access.

**Risk**

The event container may be mistaken for a behavioral concept merely because many other records are scoped to it.

**Rule for later phases**

Treat event scoping/context separately from behavioral purpose until justified.

---

## 3. Contradiction and ambiguity register

### CA-001 — Presenter withdrawal versus program decision lifecycle

**Evidence A**

`WITHDRAWN` is a `ProgramStatus` alongside `APPROVED`, `DECLINED`, and `BACKUP`.

**Evidence B**

The earliest plan explicitly allows a presenter to withdraw after approval.

**Unresolved interpretation**

The current enum may represent a unified lifecycle, or it may overwrite/flatten independent facts about committee selection and presenter participation.

**Carry forward**

001-C should state the separate actor needs without resolving the model. 001-D should test whether independent histories are required.

---

### CA-002 — Revision acknowledgement versus score freshness

**Evidence A**

The board can mark a revision reviewed/acknowledged.

**Evidence B**

Per-reviewer scores independently become stale/current by version.

**Unresolved interpretation**

Acknowledgement may represent committee attention, content acceptance, workflow clearing, or an implementation convenience. It is not obviously identical to rescoring completion.

**Carry forward**

Separate the needs “committee has seen/handled a revision” and “an evaluator has a current judgment.”

---

### CA-003 — `AbstractReviewStatus` combines different conditions

**Evidence**

The v2 plan explicitly debated a single enum versus a separate `needsRescore` flag and chose one enum for demo simplicity.

**Unresolved interpretation**

Feedback awaiting presenter action, presenter revision, committee acknowledgement, and evaluator score freshness may represent more than one independent history.

**Carry forward**

Do not adopt the enum as conceptual state without re-derivation.

---

### CA-004 — Blind review is both a policy and a configurable mode

**Evidence A**

V2 frames masking as bias reduction.

**Evidence B**

An administrator can disable blind review and restore visible behavior.

**Unresolved interpretation**

The durable behavioral capability may be controlled information disclosure, while a conference policy determines whether/when it is applied.

**Carry forward**

001-C should identify the need without naming the solution; later phases should test policy versus intrinsic behavior.

---

### CA-005 — Identity reveal versus future conflict-of-interest registry

**Evidence A**

Current review allows explicit identity reveal, partly for contextual/conflict checking.

**Evidence B**

The roadmap separately calls for a full conflict-of-interest registry with declaration and scoring exclusion.

**Unresolved interpretation**

Identity disclosure and conflict management are related but not necessarily the same purpose.

**Carry forward**

Do not treat “Reveal identity” as complete COI behavior.

---

### CA-006 — Approved abstract lock is current behavior but not settled policy

**Evidence A**

Current demo locks approved abstracts.

**Evidence B**

V2 and current roadmap explicitly preserve a board-unlock future path.

**Unresolved interpretation**

The lock is a scope boundary in the PoC, not proven permanent product semantics.

**Carry forward**

Describe the underlying need for controlled mutability after selection rather than asserting permanent immutability.

---

### CA-007 — Theme proposal publication is permissive but administratively governed

**Evidence A**

Presenter-proposed themes become selectable immediately.

**Evidence B**

Administrators can remove, rename, target, or promote them.

**Unresolved interpretation**

Creation, publication/availability, moderation, and official recognition may be separate behaviors despite sharing one table.

**Carry forward**

001-C should identify each actor need separately.

---

### CA-008 — Program composition metrics influence but do not dictate selection

**Evidence A**

Theme targets, technicality balance, heatmaps, sponsor counts, and capacity are surfaced to decision makers.

**Evidence B**

Approval remains a human board action; saturation creates warnings rather than automatic rejection.

**Unresolved interpretation**

Composition may be advisory policy rather than an automated allocation/selection authority.

**Carry forward**

Preserve the distinction between information for judgment and automatic decision behavior.

---

### CA-009 — Public archive and internal historical archive share a label but differ in audience and mutability

**Evidence**

Current system supports both public deck publication and authenticated read-only historical conference access.

**Unresolved interpretation**

They may share retention concerns but solve different actor problems.

**Carry forward**

Keep separate problem statements until later boundary analysis.

---

### CA-010 — Communication templates are global while sends/history are conference-scoped

**Evidence**

V2 implements global template definitions and per-conference send batches/recipient records.

**Unresolved interpretation**

Reusable message definition and performed communication history may be separate behavioral responsibilities.

**Carry forward**

Do not let current storage placement settle the boundary.

---

### CA-011 — VIP registration is manually tracked today but may become externally authoritative

**Evidence A**

Current UI supports manual VIP registration toggles.

**Evidence B**

Roadmap proposes synchronization from Eventbrite/Cvent/webhooks.

**Unresolved interpretation**

The durable need is awareness of registration state; manual toggling may only be one realization/source of truth.

**Carry forward**

Purpose must not assume local manual ownership.

---

### CA-012 — Scheduling currently balances program attributes; future planning may incorporate attendee demand

**Evidence A**

Current generator balances technical/variety attributes and allows manual movement.

**Evidence B**

Sched backlog proposes attendance, waitlist, room capacity, and preference-aware hints.

**Unresolved interpretation**

The durable scheduling purpose may be broader than the current generation algorithm.

**Carry forward**

Avoid defining scheduling by today's heuristic.

---

### CA-013 — Historical plan recommendations versus implemented policy

**Evidence**

V2 uses labels such as “tentative” and “recommendation,” with some choices implemented and others deferred.

**Unresolved interpretation**

A historical design suggestion cannot be treated as final intent unless later implementation/current documentation confirms it or later reasoning re-accepts it.

**Carry forward**

Record plan status when citing historical decisions.

---

### CA-014 — Planning chronology versus commit chronology

**Evidence**

V2 revision log records May 21 planning while related commits landed June 2.

**Unresolved interpretation**

None behaviorally; the two timelines describe different things.

**Carry forward**

Use plan revision dates for idea chronology and commit dates for repository realization chronology.

---

### CA-015 — Missing v2 Phase 7

**Evidence**

The surviving v2 roadmap jumps from Phase 6 to Phase 8.

**Unresolved interpretation**

Likely planning-numbering history, not a product gap.

**Carry forward**

No behavioral inference permitted.

---

## 4. Explicit exclusion register

### EX-001 — Synthetic auto-scores

**Artifact:** commit `b0d7e76f95afb4f3210b43f235949949bea2bf3a`.

**Exclude from intent:** decision → synthetic evaluation causality.

**Reason:** commit explicitly states demo consistency as the reason.

---

### EX-002 — Opaque token URLs as domain structure

**Artifact:** `/review/{token}`, `/chair/{token}`, `/presenter/{token}`, `/admin/{token}`.

**Exclude from intent:** token URLs as concepts or durable actor identity model.

**Reason:** roadmap plans SSO/structured committee identity; token mechanism is a PoC choice.

---

### EX-003 — Prisma/table boundaries

**Artifact examples:** `Submission`, `Theme`, `Score`, `ReviewerAccess`, communication records.

**Exclude from intent:** one table = one concept or one aggregate = one purpose.

**Reason:** 001-A anti-bias rule; archaeology already shows several records accumulated unrelated responsibilities.

---

### EX-004 — Enum boundaries

**Artifact examples:** `ProgramStatus`, `AbstractReviewStatus`, `DeckStatus`.

**Exclude from intent:** enum = conceptual lifecycle.

**Reason:** v2 history explicitly documents at least one enum as a demo simplification, and `ProgramStatus` spans different actor-originated changes.

---

### EX-005 — UI navigation boundaries

**Artifact examples:** Program, Balance, History, Deck Queue, Communications tabs.

**Exclude from intent:** tab = concept.

**Reason:** tabs optimize workflow/presentation and often combine several behaviors.

---

### EX-006 — Route/API boundaries

**Artifact examples:** `/review`, `/chair`, `/api/scores`, `/api/chair/*`.

**Exclude from intent:** endpoint grouping = concept action/boundary.

**Reason:** routing is engineering realization.

---

### EX-007 — Framework and persistence choices

**Artifact examples:** Next.js, React, Prisma, SQLite, PostgreSQL plans, local files/S3.

**Exclude from intent:** any direct Concept Design boundary.

**Reason:** implementation realization is intentionally replaceable.

---

### EX-008 — AWS dev deployment topology

**Artifact:** ECS/Fargate/OIDC/deployment-mode work.

**Exclude from intent:** deployment topology as behavioral design.

**Reason:** engineering-only concern for this phase.

---

### EX-009 — Stub email transport

**Artifact:** console delivery.

**Exclude from intent:** console/email provider mechanism.

**Retain as evidence:** template/audience/batch/history/deduplication behavior.

---

### EX-010 — Exact seed/configuration numbers

**Artifact examples:** eight rooms, eight session rows, EOD/Graeme slot trims, specific sponsor ranges, named seeded reviewers/talks.

**Exclude from intent:** universal invariants.

**Reason:** examples/configuration for a Data Tech demo unless separately supported by product requirements.

---

### EX-011 — Visualization implementation

**Artifact examples:** heatmap cell matrices, bar-chart styles, color scales.

**Exclude from intent:** visualization itself as a concept.

**Retain as evidence:** decision makers need program-composition information.

---

### EX-012 — Documentation file organization

**Artifact:** architecture/routing/walkthrough/roadmap split.

**Exclude from intent:** doc section = behavioral boundary.

**Reason:** documentation was reorganized repeatedly after implementation milestones.

---

## 5. Boundary-review signals for 001-C/001-D

The following areas deserve especially careful purpose decomposition because the history demonstrates likely conflation or independent evolution:

| Signal | Why flagged |
|---|---|
| Program decision vs presenter withdrawal | Different actors can establish meaningful facts at different times; withdrawal survives approval. |
| Proposal content vs revision history | Current content changes while historical versions remain meaningful. |
| Evaluation vs version applicability | Stored judgment can remain historical while becoming stale for current aggregation. |
| Evaluation notes vs presenter communication | V2 explicitly separated them. |
| Evaluation vs information disclosure | Bias-reduced review controls identity/aggregate exposure independently of numeric judgment. |
| Classification vs vocabulary governance vs coverage policy | These accumulated within `Theme` but have different actors and purposes. |
| Acceptance vs deck readiness vs public publication | Each has distinct decisions and eligibility. |
| Authentication vs authority | Token/SSO answers identity mechanism; board/co-chair/admin responsibilities answer permission/governance. |
| Event lifecycle vs public publication | “Archived conference” and “published archive” are distinct behaviors. |
| Communication definition vs communication execution/history | Global templates and conference-scoped sends have different temporal/state concerns. |
| Current scheduling heuristic vs scheduling purpose | Future attendee-demand evidence suggests the purpose is broader than technical-variety balancing. |

These are **signals for investigation**, not pre-approved concept splits.

---

## 6. Exit condition

This register is complete enough for 001-C when later analysis can answer, for every inherited repository noun or current state machine:

> “Are we using this because the recovered user need requires it, or because the implementation happens to be organized this way?”

If the answer is unclear, the term remains non-authoritative until later Concept Design analysis resolves it.
