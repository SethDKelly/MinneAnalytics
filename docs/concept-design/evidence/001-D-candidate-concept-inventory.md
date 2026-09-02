# 001-D Evidence — Candidate Concept Inventory

Status: **Candidate baseline for 001-D**  
Concept model maturity: **v0 — discovery**  
Purpose: propose implementation-neutral Concept Design candidates from the 001-C purpose inventory without yet accepting any candidate as canonical.

## 1. Interpretation

A candidate in this document is a **design hypothesis**.

It is not yet a canonical concept and has not yet passed the full 001-E criteria review for specificity, completeness, independence, and genericity.

Each candidate must be justified by one or more 001-C purposes rather than by an existing database table, enum, route, page, component, or organizational role.

Candidate status values:

- **Strong** — current/historical evidence strongly supports an independently meaningful behavioral purpose and a plausible coherent concept boundary.
- **Provisional** — a plausible concept boundary exists, but overlap, genericity, or completeness is still materially uncertain.
- **Exploratory** — useful to carry forward as an explicit hypothesis, but may collapse into synchronization, policy, a design-wide property, or another concept.

The candidate names are working names. 001-E and 001-F may rename them if a different term better captures the eventual purpose and operational principle.

---

## 2. Candidate set overview

| ID | Working candidate | Primary purpose(s) | Status | Main boundary question |
|---|---|---|---|---|
| CC-001 | Proposal | PU-001 | Strong | Does the offered subject remain coherent independently of revisions, decisions, and participation state? |
| CC-002 | Revision | PU-002 | Strong | Is change lineage a complete concept independent of whether change is allowed and whether judgments become stale? |
| CC-003 | Evaluation | PU-004 | Strong | Can independent judgment be modeled without selection, disclosure, or version-applicability rules inside it? |
| CC-004 | Disclosure | PU-006 | Strong | Is controlled information exposure independently complete, or merely review policy? |
| CC-005 | Feedback | PU-007, future PU-025 | Strong | Can committee→originator and attendee→organizer response share one generic concept without erasing meaningful differences? |
| CC-006 | Selection | PU-008 | Strong | Can organizer choice remain separate from originator participation and capacity/composition support? |
| CC-007 | Retraction | PU-009 | Strong | Does originator rescission warrant an independent history rather than a selection status? |
| CC-008 | Availability Window | PU-003 | Provisional | Is time-bounded availability reusable enough to be a concept rather than application policy? |
| CC-009 | Authorization | PU-010, part of PU-003 | Provisional | Is delegated authority a user-visible concept or only a cross-concept policy mechanism? |
| CC-010 | Coverage | PU-011, PU-012 | Provisional | Should desired composition and observed composition be one concept or two? |
| CC-011 | Capacity | PU-013, supports PU-008 | Strong | Is heterogeneous scarce-capacity accounting independent from selection and scheduling? |
| CC-012 | Classification | PU-014 | Strong | Is associating subjects with shared terms independent from managing the vocabulary itself? |
| CC-013 | Vocabulary | PU-015, PU-016 | Strong | Can participant extension and steward governance form one complete vocabulary concept? |
| CC-014 | Deliverable | PU-017 | Strong | Can required material submission/readiness stand independently of selection and publication? |
| CC-015 | Schedule | PU-018 | Strong | Does allocation remain stable as heuristics and external demand inputs evolve? |
| CC-016 | Publication | PU-019 | Strong | Is intentional public exposure independent from readiness and historical archiving? |
| CC-017 | Archive | PU-020 | Strong | Is ending ordinary mutation while retaining internal history a coherent concept independent from publication? |
| CC-018 | Communication | PU-021 | Provisional | One concept, or separate reusable message-definition and performed-send concepts? |
| CC-019 | Export | PU-022 | Provisional | Is portable representation a concept or a general affordance on other concepts? |
| CC-020 | Obligation | PU-023 | Provisional | Is downstream completion tracking sufficiently generic beyond the current VIP-registration example? |
| CC-021 | Audit Trail | PU-026 | Exploratory | Independent cross-cutting concept, intrinsic history in other concepts, design tenet, or combination? |

No candidate is accepted merely because it appears in this table.

---

## 3. Candidate hypotheses

### CC-001 — Proposal

**Purpose basis:** PU-001.

**Candidate purpose**  
Provide a durable subject that an originator can offer for organized consideration and that other actors can subsequently reference.

**Why this is a candidate**

The offered subject remains meaningful before and independently of:

- any evaluation;
- any organizer decision;
- any schedule placement;
- any downstream material;
- any later publication.

The current `Submission` implementation contains many more responsibilities than this purpose requires. `Proposal` deliberately hypothesizes a narrower boundary.

**Expected conceptual responsibility**

- establish an offered subject;
- preserve its identity as the thing being considered;
- expose its current offered content/reference.

**Explicitly outside candidate boundary**

Revision lineage, whether changes are permitted, evaluation, selection, retraction, classification-vocabulary governance, deliverables, scheduling, and publication.

**Status:** Strong.

---

### CC-002 — Revision

**Purpose basis:** PU-002.

**Candidate purpose**  
Allow a mutable subject to acquire new versions while preserving prior versions and the sequence of change.

**Why this is a candidate**

Historical evidence repeatedly treats revision lineage as meaningful independently of:

- whether a reviewer has a current evaluation;
- whether an edit was authorized;
- whether a committee has acknowledged the change.

The same general purpose may apply beyond abstracts if other mutable event content later requires versioned history.

**Expected conceptual responsibility**

- create a new revision of a subject;
- retain prior revisions;
- identify current and historical revisions;
- explain sequence/change context sufficiently for later inspection.

**Explicitly outside candidate boundary**

Permission to revise, evaluation freshness, organizer acknowledgment policy, and generic activity auditing.

**Status:** Strong.

---

### CC-003 — Evaluation

**Purpose basis:** PU-004.

**Candidate purpose**  
Allow an evaluator to record and retain an independently formed judgment about a subject.

**Why this is a candidate**

Evaluation existed from the first product baseline and remains meaningful independently of collective selection. Historical synthetic demo scoring is explicitly excluded from this purpose.

**Expected conceptual responsibility**

- record an evaluator's judgment about a subject;
- preserve evaluator ownership and private evaluation context where appropriate;
- allow a judgment to be updated/replaced according to the concept's own semantics.

**Explicitly outside candidate boundary**

Collective selection, disclosure policy, presenter-visible feedback, and the rule deciding whether an evaluation of an earlier revision participates in current reasoning.

**Status:** Strong.

---

### CC-004 — Disclosure

**Purpose basis:** PU-006.

**Candidate purpose**  
Control when information about a subject or other participants is exposed to an actor, including intentional reveal where permitted.

**Why this is a candidate**

The product deliberately controls identity and aggregate-score exposure to protect independent judgment, while also allowing explicit identity reveal and conference-level configuration. These behaviors have a purpose separate from creating the evaluation itself.

**Expected conceptual responsibility**

- represent information whose exposure is controlled;
- determine or record visibility/reveal state for an actor/context;
- support intentional disclosure where policy permits.

**Explicitly outside candidate boundary**

Authentication mechanics, full conflict-of-interest declaration/exclusion, evaluation, and permanent anonymity.

**Status:** Strong, subject to 001-E independence testing because application policy may supply many of its constraints.

---

### CC-005 — Feedback

**Purpose basis:** PU-007 and future PU-025.

**Candidate purpose**  
Allow an actor to communicate an intentional response about a subject to an intended recipient or recipient group, distinct from private judgment context.

**Why this is a candidate**

The repository explicitly separated private evaluator notes from presenter-visible feedback. Future attendee/session feedback presents a second actor/audience pair with a similar durable need: response about a subject intended for another actor.

The hypothesis is deliberately more generic than `PresenterFeedback`.

**Expected conceptual responsibility**

- identify the subject of the feedback;
- identify the source and intended recipient/audience;
- preserve the feedback content and relevant context/time;
- allow recipients to inspect feedback intended for them.

**Explicitly outside candidate boundary**

Private evaluation notes, numeric evaluation, broad operational campaigns, and delivery-provider mechanics.

**Boundary alternative**

001-E may conclude that committee-originator feedback and audience-session response have materially different operational principles and require separate concepts. 001-D does not pre-decide that split.

**Status:** Strong for the generic feedback hypothesis; attendee use remains future-intent evidence.

---

### CC-006 — Selection

**Purpose basis:** PU-008.

**Candidate purpose**  
Allow authorized decision makers to choose candidates for inclusion while retaining reserve alternatives and explicit non-selection outcomes.

**Why this is a candidate**

Selection is a consequential collective/organizational decision, not an evaluator's personal judgment. The product has supported approval, decline, backup, and backup promotion since its earliest baseline.

**Expected conceptual responsibility**

- record a decision about a candidate;
- support reserve/alternative status where needed;
- permit later decision changes such as promotion while preserving relevant decision history.

**Explicitly outside candidate boundary**

Originator retraction, capacity accounting, individual evaluation, schedule placement, and deliverable readiness.

**Status:** Strong.

---

### CC-007 — Retraction

**Purpose basis:** PU-009.

**Candidate purpose**  
Allow the originator of an offered subject to rescind participation independently of the organizer's selection decision.

**Why this is a candidate**

The earliest product plan explicitly permits withdrawal after approval. Therefore `selected` and `originator later withdrew` can both be historically meaningful facts established by different actors.

**Expected conceptual responsibility**

- permit an eligible originator to retract an offered commitment;
- preserve that the retraction occurred and when;
- make current participation willingness distinguishable from organizer preference.

**Explicitly outside candidate boundary**

Organizer selection, content revision, and general event cancellation.

**Status:** Strong.

---

### CC-008 — Availability Window

**Purpose basis:** temporal portion of PU-003 and IL-012.

**Candidate purpose**  
Make an otherwise meaningful action available only during an explicitly governed time interval.

**Why this is a candidate**

Submission availability is visibly controlled by conference windows, and timing also participates in edit eligibility. A generic availability-window concept could be reused for submission, revisions, deadlines, communication actions, or future operational periods without embedding those purposes inside the window itself.

**Expected conceptual responsibility**

- define/open/close a time-bounded availability period;
- determine whether a governed action is currently within the period;
- expose timing/closure information to affected actors.

**Explicitly outside candidate boundary**

The governed action itself, delegated authority, event archiving, and reasons for exceptional override.

**Boundary alternative**

Time eligibility may prove too policy-like to warrant an independent concept and instead become synchronization/configuration around Proposal/Revision/other concepts.

**Status:** Provisional.

---

### CC-009 — Authorization

**Purpose basis:** PU-010 and authorization portion of PU-003.

**Candidate purpose**  
Constrain consequential actions according to delegated responsibility context.

**Why this is a candidate**

The project deliberately separated evaluation authority, program-decision authority, artifact-review authority, scheduling authority, publication authority, and administration. Those distinctions are durable even though token-based authentication is temporary.

**Expected conceptual responsibility**

- express which actor/responsibility context is entitled to perform which governed action;
- support different scopes of authority without requiring one monolithic role;
- permit governed concepts to ask whether an action is authorized without embedding organizational role names.

**Explicitly outside candidate boundary**

Establishing technical identity/session authentication, defining the governed concepts' purposes, and organizational HR structure.

**Boundary alternative**

If there is no sufficiently user-visible operational principle for managing/delegating authorization within MinneAnalytics, authority may be better modeled as application policy/synchronization rather than a standalone concept.

**Status:** Provisional.

---

### CC-010 — Coverage

**Purpose basis:** PU-011 and PU-012.

**Candidate purpose**  
Allow organizers to express desired representation across a collection and understand how the actual collection compares with those goals.

**Why this is a candidate**

Theme targets and technicality balance share a recurring purpose: reason about collection composition without mechanically making the selection decision. Combining target-setting and assessment may form a coherent concept in which desired coverage and observed coverage are two sides of the same purpose.

**Expected conceptual responsibility**

- define a dimension or classification over which coverage matters;
- record desired minimum/maximum/range or other target;
- track/derive observed representation for a collection;
- expose gaps, excesses, or distribution information without automatically selecting items.

**Explicitly outside candidate boundary**

Defining classification vocabulary, assigning individual classifications, and making program-selection decisions.

**Boundary alternative**

001-E must test a split into independently reusable `Target` and `Composition Assessment` concepts.

**Status:** Provisional.

---

### CC-011 — Capacity

**Purpose basis:** PU-013 and supporting part of PU-008.

**Candidate purpose**  
Represent scarce capacity and how heterogeneous classes of commitments consume or participate in that capacity.

**Why this is a candidate**

Capacity exists independently of which specific proposals are selected. Sponsor/community distinctions demonstrate that commitments may participate differently in capacity accounting.

**Expected conceptual responsibility**

- establish available capacity;
- represent consumption/allocation against that capacity;
- support classes or rules that consume capacity differently;
- report remaining/saturated capacity.

**Explicitly outside candidate boundary**

Choosing candidates, defining sponsorship generally, or assigning room/time schedule slots.

**Status:** Strong, with genericity of heterogeneous classes to be tested in 001-E.

---

### CC-012 — Classification

**Purpose basis:** PU-014.

**Candidate purpose**  
Associate subjects with shared descriptive terms so they can be consistently grouped, found, compared, and reasoned about.

**Why this is a candidate**

Associating a proposal with a term remains meaningful even if the vocabulary is created/governed elsewhere and even if no composition targets exist.

**Expected conceptual responsibility**

- associate a subject with one or more allowed classifications;
- remove/change associations while preserving required historical meaning;
- answer which classifications describe a subject and which subjects share a classification.

**Explicitly outside candidate boundary**

Creating/governing vocabulary terms, representation goals, and selection.

**Status:** Strong.

---

### CC-013 — Vocabulary

**Purpose basis:** PU-015 and PU-016.

**Candidate purpose**  
Maintain an evolving shared set of reusable descriptive terms that participants may extend and authorized stewards may govern without destroying historical interpretation.

**Why this is a candidate**

Participant-created terms and administrator moderation operate on the same reusable vocabulary and share one central problem: the vocabulary must evolve while remaining usable and historically interpretable.

**Expected conceptual responsibility**

- create/propose reusable terms;
- distinguish availability or recognition state where useful;
- rename/correct terms;
- retire/restore terms without erasing historical use;
- expose currently usable terms.

**Explicitly outside candidate boundary**

Assigning a term to a proposal, program-coverage targets, and program selection.

**Boundary alternative**

001-E must still test whether decentralized contribution and steward governance have sufficiently different operational principles to split.

**Status:** Strong.

---

### CC-014 — Deliverable

**Purpose basis:** PU-017.

**Candidate purpose**  
Allow an actor to provide a required downstream artifact and allow responsible reviewers to establish whether it is operationally ready or needs attention.

**Why this is a candidate**

Deck submission/review is historically distinct from talk selection and from whether the artifact may later be published publicly.

**Expected conceptual responsibility**

- establish that an artifact is required/requested for a subject or commitment;
- accept/provide an artifact;
- record readiness/review outcome and concerns;
- expose current artifact readiness.

**Explicitly outside candidate boundary**

Selecting the underlying proposal, public sharing permission, and schedule placement.

**Status:** Strong.

---

### CC-015 — Schedule

**Purpose basis:** PU-018.

**Candidate purpose**  
Allocate selected activities to constrained place/time opportunities while supporting assisted generation and human adjustment.

**Why this is a candidate**

The underlying allocation purpose survives changes in balancing heuristics. Future attendee-demand and room-capacity data can inform scheduling without redefining the concept.

**Expected conceptual responsibility**

- represent allocatable opportunities/resources;
- place/unplace/move/swap scheduled subjects;
- identify collisions/constraints;
- support generated suggestions/drafts while retaining explicit human changes.

**Explicitly outside candidate boundary**

Selecting which sessions belong in the program, collecting attendee preferences, and any one generation heuristic.

**Status:** Strong.

---

### CC-016 — Publication

**Purpose basis:** PU-019.

**Candidate purpose**  
Intentionally expose eligible material to a public audience while respecting collection-level and item-level sharing intent.

**Why this is a candidate**

Public publication is historically separate from acceptance and artifact readiness. An approved, ready session may still be non-shareable.

**Expected conceptual responsibility**

- identify material eligible for publication;
- record item-level shareability/publication eligibility;
- publish/unpublish a collection or item as appropriate;
- expose only material whose publication conditions are satisfied.

**Explicitly outside candidate boundary**

Internal historical retention, material readiness itself, and program selection.

**Status:** Strong.

---

### CC-017 — Archive

**Purpose basis:** PU-020.

**Candidate purpose**  
Transition an active working context into retained read-only history so authorized actors can continue inspecting it after ordinary mutation ends.

**Why this is a candidate**

Internal historical event access and public slide publication solve different problems despite both historically using the word `archive`.

**Expected conceptual responsibility**

- close/freeze an active context;
- preserve access to its retained state;
- prevent ordinary mutation after closure;
- distinguish active from archived historical context.

**Explicitly outside candidate boundary**

Public publication, generic backups/disaster recovery, and feature-specific histories such as revisions.

**Status:** Strong.

---

### CC-018 — Communication

**Purpose basis:** PU-021.

**Candidate purpose**  
Perform repeatable operational communications to an eligible audience with preview, duplicate protection, rounds/history, and reusable content intent.

**Why this is a candidate**

The durable behavior is already richer than email transport: reusable communication intent, audience resolution, preview, performed sends, deduplication, later rounds, and historical records.

**Expected conceptual responsibility under the one-concept hypothesis**

- define reusable communication intent/content;
- determine or accept eligible recipients;
- preview a communication;
- perform a send/batch;
- preserve send/recipient history;
- protect against accidental duplicate delivery according to communication semantics.

**Explicitly outside candidate boundary**

Provider transport, committee-review feedback, and attendee session response.

**Boundary alternative**

Potential split:

1. `Message Template` — reusable message definition/merge structure.
2. `Dispatch` or `Campaign` — audience resolution, performed sends, rounds, dedupe, history.

001-E must test whether each side is independently complete and user-understandable.

**Status:** Provisional.

---

### CC-019 — Export

**Purpose basis:** PU-022.

**Candidate purpose**  
Produce a portable external representation of important state/history for coordination, reporting, analysis, or archival workflows.

**Why this is a candidate**

CSV export exists today and the roadmap anticipates broader reporting APIs. The durable need is movement of sufficient contextual state outside the interactive application, not CSV specifically.

**Expected conceptual responsibility**

- select/define an exportable representation or scope;
- produce a portable snapshot/representation;
- preserve enough context/provenance for the output to remain interpretable.

**Explicitly outside candidate boundary**

Creating source state, becoming the source of truth, and any one serialization format.

**Boundary alternative**

Export may be an affordance implemented independently by many concepts rather than an independently meaningful concept.

**Status:** Provisional.

---

### CC-020 — Obligation

**Purpose basis:** PU-023.

**Candidate purpose**  
Represent a downstream participation requirement or checkpoint and whether the responsible participant has satisfied it.

**Why this is a candidate**

VIP registration is the current example, but the problem is broader: selected participants may have operational obligations whose completion matters independently of program selection and whose source may be local or external.

**Expected conceptual responsibility**

- establish a requirement/checkpoint for an actor or commitment;
- record or ingest fulfillment state;
- identify outstanding/satisfied obligations;
- preserve source/context where fulfillment is externally supplied.

**Explicitly outside candidate boundary**

Selection, generic attendee identity, and third-party synchronization mechanics.

**Status:** Provisional because current evidence is narrow and future integration is expected to broaden it.

---

### CC-021 — Audit Trail

**Purpose basis:** PU-026.

**Candidate purpose**  
Record consequential activity across a working context so later authorized actors can reconstruct who did what, when, and in what relevant context.

**Why this is a candidate**

The repository repeatedly preserves feature-specific history, and the roadmap explicitly calls for an append-only committee activity audit. This supports at least a future cross-cutting need beyond intrinsic histories such as Revision.

**Expected conceptual responsibility under the standalone hypothesis**

- append records of consequential actions;
- identify actor, action, subject/context, and time;
- expose a historical activity view/export without rewriting past entries.

**Explicitly outside candidate boundary**

Replacing Revision history, Evaluation's subject/version context, Communication send history, or generic infrastructure logs.

**Boundary alternative**

The strongest current evidence may justify only a **provenance design rule** requiring relevant concepts to retain their own historical truth, with an Audit Trail concept added only when cross-concept organizational activity history becomes a real user-facing capability.

**Status:** Exploratory.

---

## 4. Purposes not promoted directly into standalone candidates

### PU-003 — Govern mutable-content change

001-D does not create a `Mutability` concept.

Primary hypothesis:

- Revision supplies change/version behavior.
- Availability Window supplies temporal eligibility where useful.
- Authorization supplies delegated permission where useful.
- Application synchronizations/policy determine when Proposal/Revision actions are permitted based on selection state, event timing, feedback state, or explicit override.

This avoids placing conference-specific edit policy inside Revision itself.

### PU-005 — Preserve judgment applicability context

001-D does not create a `Judgment Applicability` concept.

Primary hypothesis:

- Evaluation records the subject/revision it judged.
- Revision identifies current/historical versions.
- Synchronization/application policy determines whether an Evaluation participates in the current aggregate and whether renewed evaluation is requested after a revision.

The resulting behavior remains visible without requiring a concept whose only purpose is to glue two other concepts together.

### PU-024 — Consume externally authoritative facts

001-D does not create an `External System` or `External Fact` concept yet.

Primary hypothesis:

- existing concepts such as Obligation, Schedule, Capacity, or future attendee concepts own the behavioral fact that matters;
- synchronizations/adapters bring externally authoritative state into those concepts while preserving provenance/source;
- a specific third-party integration is an engineering realization, not a concept.

If later operational principles show users explicitly manage competing authorities/sources, 001-E or a future discovery phase may revive an independent candidate.

### Revision acknowledgement

No `Acknowledgement` candidate is introduced yet.

The current board action may mean one of several things:

- the revision has been noticed;
- the changed content has been reviewed;
- the workflow item has been cleared;
- prior evaluations may remain acceptable.

Until a singular purpose is established, acknowledgement remains an application-workflow signal rather than a concept.

---

## 5. Deferred future candidate signals

The following are intentionally **not** promoted to candidates in the v0 current/historical set, but should remain visible:

### Conflict / Recusal

Future COI intent may eventually justify a concept around declared conflicts, exclusions, and recusal. Controlled Disclosure does not absorb that problem merely because identity reveal can help detect conflicts.

### Attendance / Enrollment

Sched integration may eventually expose a stable actor-facing need around attendee enrollment, waitlists, and room attendance. Current evidence is future-heavy and should influence Schedule genericity without forcing a premature candidate.

### Attendee identity/profile

No current purpose requires a generalized attendee-account/person-profile concept.

---

## 6. Candidate-set interpretation

The candidate inventory deliberately contains fewer candidates than purpose statements because several purposes are hypothesized to compose through synchronizations/policy rather than map one-to-one to concepts.

It also contains candidates that combine multiple purposes where a coherent generic behavior seems plausible, especially:

- Feedback — current committee→originator and future attendee→organizer response;
- Coverage — desired versus observed collection composition;
- Vocabulary — participant extension plus steward governance;
- Communication — reusable message definition plus performed sends/history.

001-E must challenge these combined boundaries rather than assuming the merge is correct.

The candidate set is therefore a **testable decomposition**, not a destination.
