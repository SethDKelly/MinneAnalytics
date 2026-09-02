# 001-C — Problem, Actor-Need & Purpose Inventory

Status: **Complete**  
Concept model maturity: **v0 — discovery**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-B — Historical Intent Reconstruction & Repository Archaeology](001-B-historical-intent-reconstruction-and-repository-archaeology.md)

## 1. Purpose

001-C transforms the historical evidence reconstructed in 001-B into an implementation-neutral inventory of:

- persistent problems the software is expected to address;
- behavioral actors who experience those problems;
- actor-specific needs and tensions;
- purpose statements describing why coherent software behavior should exist;
- overlap and boundary questions to carry into candidate concept discovery.

The phase deliberately stops **before naming or accepting concepts**.

This separation is important because a retrofit can otherwise become implementation archaeology followed by a simple noun-renaming exercise. 001-C instead asks:

> If the current code, schema, route names, page names, and enum boundaries were unavailable, what problems would still exist and what outcomes would the people involved still need?

Those problems and outcomes become the evidentiary basis for 001-D.

---

## 2. Governing constraints

001-C inherits all 001-A anti-bias rules and the evidence classifications from 001-B.

Additional phase-specific rules apply.

### C-01 — Problems are not concepts

A problem identifies a persistent difficulty. It does not predict the number or shape of concepts needed to solve it.

### C-02 — Actors are behavioral responsibilities, not database roles

`BOARD`, `CHAIR`, `ADMIN`, `SCORER`, `CORE`, route surfaces, and token types are not treated as actor definitions.

Instead, 001-C uses responsibility-oriented actor roles such as:

- content originator;
- evaluator;
- program decision maker;
- program planner;
- artifact reviewer;
- event policy administrator;
- operational communicator;
- historical observer/auditor;
- public audience member;
- attendee;
- external authoritative system;
- external operational consumer.

One human can occupy several of these roles.

### C-03 — Purpose before candidate concept

No implementation noun is eligible to become a candidate concept in 001-D unless it can be justified by one or more purposes recorded here.

### C-04 — Current state machines are decomposable evidence

`ProgramStatus`, `AbstractReviewStatus`, `DeckStatus`, and similar implementation structures are not treated as unitary behavioral lifecycles.

Where the evidence shows independently meaningful actor facts, 001-C states those needs separately.

### C-05 — Future intent constrains genericity but is not current behavior

Known roadmap/backlog needs—such as external attendance sources, conflict-of-interest handling, approved-content unlocking, and in-room attendee feedback—are used to prevent over-specialized purpose statements. They are explicitly marked as future intent.

### C-06 — Human decision support remains distinct from automated authority

Program composition targets and scheduling heuristics may inform decisions, but the recovered history preserves human decision/planning authority. 001-C therefore distinguishes information, goals, and human action.

---

## 3. Phase artifacts

001-C produces four evidence artifacts:

1. [001-C Problem Inventory](evidence/001-C-problem-inventory.md)
2. [001-C Actor-Need Inventory](evidence/001-C-actor-needs.md)
3. [001-C Purpose Inventory](evidence/001-C-purpose-inventory.md)
4. [001-C Intent → Problem → Actor Need → Purpose Traceability](evidence/001-C-traceability-matrix.md)

The detailed evidence remains in those files. This document is the synthesis and exit review.

---

## 4. Problem inventory result

001-C identifies **27 problem statements**.

They are intentionally more granular than the broad 16 threads handed off from 001-B because several historical threads contained independently meaningful difficulties.

### 4.1 Candidate content and change

- **PR-001** — offering candidate content for consideration;
- **PR-002** — changing content without erasing prior forms;
- **PR-003** — controlling when/under whose authorization mutable content may change.

This separates three questions the implementation often places around one submission record:

```text
What has been offered?
How has it changed?
When is change allowed?
```

Those questions may later compose, but they do not have the same purpose.

### 4.2 Judgment and information quality

- **PR-004** — recording an individual's independent judgment;
- **PR-005** — knowing whether a historical judgment applies to the current subject;
- **PR-006** — protecting independent judgment from premature information exposure;
- **PR-007** — separating private evaluation context from communication to the originator.

This is one of the strongest decomposition areas in the repository.

The v2 history independently introduced presenter feedback, identity/aggregate masking, revision lineage, and version-aware rescoring. 001-C preserves those as different problems rather than accepting `Score`, `Review`, or `AbstractReviewStatus` as concept boundaries.

### 4.3 Collective decision and participation

- **PR-008** — choosing a feasible program from more candidates than can be used;
- **PR-009** — preserving originator agency after an organizer decision;
- **PR-010** — distinguishing judgment participation from consequential authority;
- **PR-011** — making composition visible without replacing human judgment;
- **PR-012** — accounting for different classes of capacity commitment.

The most important result here is that **selection and withdrawal remain independent actor problems**.

The historical statement that an originator can withdraw after approval means that these two facts can coexist:

```text
Organizers selected the session.
The originator no longer intends to participate.
```

001-C does not permit `ProgramStatus` to erase that distinction merely because the current implementation stores the states together.

### 4.4 Classification and shared vocabulary

- **PR-013** — describing content using shared classifications;
- **PR-014** — allowing the shared vocabulary to evolve through participant input;
- **PR-015** — governing that evolving vocabulary while preserving historical meaning;
- **PR-016** — expressing desired representation over classified content.

This produces four different questions from the current `Theme` cluster:

```text
How is an item described?
How can new descriptive terms enter the vocabulary?
How is that vocabulary governed over time?
What representation does the organizer want across the collection?
```

No conclusion is yet made about how many concepts should solve them.

### 4.5 Operational readiness, scheduling, and publication

- **PR-017** — determining readiness of required presentation material;
- **PR-018** — allocating selected content into constrained places/times with human control;
- **PR-019** — controlling public access to post-event material independently of selection;
- **PR-020** — retaining completed-event history while ending ordinary mutation.

This deliberately prevents three different "approval/archive" vocabularies from collapsing:

```text
selected into program
material operationally ready
material intentionally public
```

and distinguishes public publication from internal completed-event retention.

### 4.6 Communication and external operations

- **PR-021** — repeatable operational communication with controlled audience/history;
- **PR-022** — carrying event state into external operational workflows;
- **PR-023** — knowing whether downstream participant obligations are complete;
- **PR-024** — incorporating facts whose authority resides in another system;
- **PR-025** — using attendee demand/room constraints as scheduling evidence;
- **PR-026** — capturing immediate audience response to a session.

PR-023 through PR-026 are partly or primarily future-intent evidence. Their role in v0 discovery is to keep the conceptual model from becoming artificially restricted to the current PoC.

### 4.7 Cross-cutting traceability

- **PR-027** — reconstructing how current state came to be.

This problem is strongly evidenced across immutable revisions, version-aware judgments, soft-retired classifications, communication history, archived events, and the roadmap's planned append-only committee audit.

Its exact design form remains intentionally unresolved.

---

## 5. Actor model result

001-C identifies **12 behavioral actor roles**.

The actor model is responsibility-oriented rather than organization-title-oriented.

### 5.1 Content originator

Needs include:

- make an offer;
- return to it;
- revise it when policy permits;
- preserve earlier forms;
- receive intended feedback;
- remain able to withdraw;
- provide downstream materials;
- propose useful classification vocabulary;
- have public sharing treated independently of acceptance;
- complete relevant downstream obligations.

### 5.2 Evaluator

Needs include:

- form an independent judgment;
- preserve private reasoning/context;
- know what version was judged;
- know when judgment is stale;
- revisit changed content;
- send separate originator-facing feedback;
- avoid premature biasing information;
- obtain identity/context when legitimately required;
- participate without inheriting unrelated consequential authority.

### 5.3 Program decision maker

Needs include:

- compare candidates;
- choose under finite capacity;
- preserve reserve alternatives;
- understand composition and capacity classes;
- know whether available judgments are current;
- retain human discretion;
- recognize originator withdrawal as an independent fact;
- potentially authorize exceptional post-selection changes.

### 5.4 Program planner

Needs include:

- allocate selected sessions to scarce room/time opportunities;
- obtain machine assistance without surrendering control;
- adjust placements;
- potentially incorporate external attendee-demand evidence.

### 5.5 Artifact reviewer

Needs include:

- receive/access required presentation material;
- determine material readiness independently of program selection;
- record concerns/readiness;
- perform that review without needing full program authority.

### 5.6 Event policy administrator

Needs include:

- control participation windows/event lifecycle;
- govern shared vocabulary;
- preserve historical associations during moderation;
- express representation targets;
- configure disclosure/review policy;
- exercise administrative authority independently of committee evaluation.

### 5.7 Operational communicator

Needs include:

- choose recurring communication intent;
- resolve eligible audience;
- preview content/audience;
- execute sends;
- avoid duplicates;
- support later rounds;
- preserve send history independent of transport provider.

### 5.8 Historical observer / auditor

Needs include:

- inspect completed events;
- reconstruct changed content;
- understand historical judgment context;
- preserve interpretation of retired vocabulary;
- know what communications occurred;
- eventually inspect broader committee activity history.

### 5.9 Public audience

Needs access only to intentionally published material, not internal committee history.

### 5.10 Event attendee

Primarily future-intent needs around preference/demand evidence and in-room feedback.

### 5.11 External authoritative system

Represents a system participating as the authoritative source of some operational fact.

### 5.12 External operational consumer

Represents a person/system consuming portable event state/history outside the interactive application.

---

## 6. Cross-actor tensions

The actor analysis identifies several tensions that later design should preserve rather than resolve by overwriting one actor's state with another's.

### T-01 — Organizer selection vs originator willingness

The organizer may want the session; the originator may withdraw.

### T-02 — Evaluator privacy vs originator communication

Private reasoning and intentional feedback require different audiences.

### T-03 — Independent judgment vs aggregate transparency

The evaluator benefits from delayed aggregate visibility; decision makers later need aggregate evidence.

### T-04 — Participant vocabulary creation vs administrative stewardship

Low-friction vocabulary evolution and governance must coexist.

### T-05 — Composition policy vs human program discretion

Targets should inform rather than silently become selection authority.

### T-06 — Machine assistance vs planner control

Automated scheduling should remain advisory/assistive.

### T-07 — Public publication vs internal history

Public audiences and internal historical observers need materially different information.

### T-08 — Local workflow vs external source of truth

External facts should be usable without hiding their provenance.

These tensions will be useful tests of concept independence in 001-D.

---

## 7. Purpose inventory result

001-C derives **26 purpose candidates**.

These are the direct inputs to 001-D.

### Candidate-content purposes

- **PU-001** — enable an originator to make a durable offer of candidate content;
- **PU-002** — preserve the history of mutable offered content;
- **PU-003** — govern when and under whose authorization mutable content may change.

### Evaluation/information purposes

- **PU-004** — preserve an evaluator's independently formed judgment;
- **PU-005** — preserve the applicability context of judgment when its subject can change;
- **PU-006** — control exposure of potentially biasing or sensitive information during judgment;
- **PU-007** — support intentional communication to the content originator separately from private evaluation.

### Program formation/governance purposes

- **PU-008** — support consequential choice among candidates under finite capacity;
- **PU-009** — preserve originator continuing agency over participation;
- **PU-010** — constrain consequential behavior according to delegated authority;
- **PU-011** — express desired composition of a collection independently of individual classification;
- **PU-012** — make actual collection composition legible for human decision making;
- **PU-013** — account for heterogeneous classes of scarce program capacity.

### Classification/vocabulary purposes

- **PU-014** — associate offered content with shared descriptive classifications;
- **PU-015** — allow participants to extend a shared classification vocabulary;
- **PU-016** — govern an evolving shared vocabulary while preserving historical interpretation.

### Operational-execution purposes

- **PU-017** — establish readiness of required downstream presentation material;
- **PU-018** — allocate selected sessions to constrained place/time opportunities with human-adjustable assistance;
- **PU-019** — control intentional public publication of eligible event material;
- **PU-020** — preserve completed-event state for internal historical access while ending ordinary mutation.

### Communication/external/audience purposes

- **PU-021** — perform repeatable operational communication with controlled eligibility and durable send history;
- **PU-022** — provide portable external representations of important event state/history;
- **PU-023** — recognize completion state of downstream participation obligations independently of selection;
- **PU-024** — incorporate operational facts from external authoritative systems without obscuring provenance;
- **PU-025** — capture session-specific audience response distinct from pre-event committee judgment.

### Cross-cutting purpose

- **PU-026** — preserve enough provenance to reconstruct why current state exists.

Again, these are **not** the concept list.

---

## 8. Strong non-collapse findings

001-C now has enough evidence to identify relationships that should **not** be pre-merged before 001-D tests them.

### 8.1 Offer vs revision vs mutability governance

A durable offered subject, its historical versions, and policy governing change solve different problems.

### 8.2 Revision history vs judgment applicability

Knowing what changed is distinct from knowing whether an evaluator's earlier judgment remains current.

### 8.3 Judgment vs information disclosure

The ability to judge and the policy controlling what information is visible during judgment are independently understandable.

### 8.4 Private evaluation vs originator feedback

The project history explicitly separated these.

### 8.5 Program selection vs originator participation

The earliest requirement that withdrawal survives approval makes this one of the strongest independent-history signals in the project.

### 8.6 Classification vs vocabulary creation vs vocabulary governance vs representation goals

The current `Theme` cluster must not enter 001-D as one presumed concept.

### 8.7 Program selection vs material readiness vs publication

Each represents a different decision/eligibility concern.

### 8.8 Public publication vs internal historical retention

The common word "archive" is insufficient reason to combine them.

### 8.9 Authentication vs authority

Current token mechanics and future SSO establish actor identity/session realization. Delegated authority concerns what an actor may do.

### 8.10 Scheduling purpose vs current balancing heuristic

The scheduling purpose survives even if the algorithm changes to use attendee demand, room capacity, or other future evidence.

---

## 9. Purpose consolidation questions for 001-D

Not every purpose necessarily deserves its own concept. 001-D must specifically test the following.

### Q-001 — Composition goal vs composition assessment

Should PU-011 and PU-012 belong to one independently complete concept, or does expressing intent about a collection remain separable from measuring/understanding actual collection composition?

### Q-002 — Vocabulary extension vs vocabulary governance

Should PU-015 and PU-016 form one managed-vocabulary concept or separate concepts synchronized around proposed/recognized terms?

### Q-003 — Operational communication internal decomposition

Does PU-021 represent one complete concept, or should reusable message definition and performed communication/send history be independent concepts?

### Q-004 — Obligation tracking vs external fact authority

Does PU-023 stand independently as an obligation/completion concept that may receive facts from PU-024, or is the current registration need too narrow to warrant a separate concept?

### Q-005 — Provenance

Should PU-026 be:

- an independent reusable concept;
- a property required within several independent concepts;
- a design tenet applied throughout the model;
- or a combination of those?

### Q-006 — Mutability governance and delegated authority

Is PU-003 primarily an intrinsic policy of mutable offered content that synchronizes with PU-010 authority, or should a more generic authorization mechanism own change eligibility?

### Q-007 — Controlled disclosure and conflict management

Will PU-006 remain independently complete when future conflict declaration/exclusion is modeled, or is another purpose needed for conflict handling itself?

### Q-008 — Capacity-class accounting genericity

Is PU-013 a sufficiently general reusable purpose, or is sponsorship-aware capacity better represented as application policy around program formation/composition?

### Q-009 — Historical event retention

Is PU-020 an independent behavioral concept or primarily an application lifecycle synchronization that freezes/retains many other concepts?

### Q-010 — External representation/export

Is PU-022 a genuine independent purpose or a representation capability composed over many concepts without its own conceptual state?

These questions are intentionally unresolved.

---

## 10. Known current implementation structures that 001-C rejects as design shortcuts

001-C does not assert that these structures are wrong engineering. It rejects them as sufficient evidence for design boundaries.

### `Submission`

Cannot be accepted as one concept merely because it currently coordinates proposal content, presenter information, program outcome, withdrawal, classification, sponsorship, registration, material readiness, revision state, and access state.

### `ProgramStatus`

Cannot be accepted as one conceptual lifecycle because organizer choice and originator withdrawal have independent actor sources and historical meaning.

### `AbstractReviewStatus`

Cannot be accepted as one conceptual lifecycle because the v2 plan itself documents its combination of feedback/revision/acknowledgement/rescore conditions as a demo simplification.

### `Score`

Cannot by itself settle whether judgment, private notes, applicability, aggregate participation, and disclosure belong together.

### `Theme`

Cannot settle classification membership, vocabulary creation, vocabulary governance, or composition target boundaries.

### `DeckStatus`

Cannot imply that presentation-material review and talk selection are the same kind of approval.

### `Archive`

Cannot combine public material publication with internal historical event retention.

### `BOARD` / `CHAIR` / `ADMIN`

Cannot serve as concept actors without responsibility decomposition.

---

## 11. Traceability result

The 001-C traceability matrix maps all **52 positive historical-intent observations** from 001-B into problems, actor needs, and/or purposes.

It also confirms that:

- the seven explicit intent-ledger demo/non-intent entries remain excluded;
- the broader 001-B implementation exclusion register remains excluded;
- every decomposition-relevant ambiguity from 001-B has an explicit 001-C treatment and an unresolved 001-D question where appropriate.

This means 001-D does not need to return to the implementation simply to recover missing purpose rationale.

Implementation may still be consulted later for behavior confirmation, but the purpose basis now exists independently.

---

## 12. Purpose evidence strength

### Tier A — strong current/historical purpose evidence

PU-001 through PU-021 and PU-026.

These are backed by explicit historical intent and implemented/current behavior, although exact policy details may still be configurable.

### Tier B — supported but scope/representation evolving

PU-022 and PU-023.

The needs exist today, but their scope is likely to expand as the product becomes more operationally mature.

### Tier C — future-intent genericity constraints

PU-024 and PU-025.

These should influence candidate boundaries but must not be described as current shipped behavior.

---

## 13. What 001-C deliberately does not decide

001-C makes no decision about:

- the final number of concepts;
- final concept names;
- whether `Proposal`, `Revision`, `Evaluation`, `Selection`, `Authority`, `Classification`, `Vocabulary`, `Publication`, or any other preliminary label should exist;
- concept state or actions;
- operational principles;
- synchronization structure;
- implementation refactoring;
- database migration;
- API or UI redesign.

Even when a purpose appears to map naturally to a familiar noun, 001-D must still earn that boundary using Concept Design criteria.

---

## 14. 001-C exit criteria

- [x] Every 001-B historical-intent entry has an explicit 001-C disposition.
- [x] Demo/engineering artifacts remain excluded from purpose discovery.
- [x] Problems are stated without requiring current implementation structure.
- [x] Actor roles are defined behaviorally rather than by current role enums/routes.
- [x] Actor-specific needs and cross-actor tensions are recorded.
- [x] Purpose candidates are stated as outcomes/needs rather than mechanisms.
- [x] Purpose scope exclusions are recorded where overlap could cause premature merging.
- [x] Future-intent needs are distinguished from shipped/current behavior.
- [x] Known implementation conflations are explicitly prevented from determining the next phase.
- [x] Consolidation/merge questions are identified for candidate concept discovery.
- [x] No final concept boundaries have been declared.
- [x] No implementation changes have been performed.

### Phase result

**001-C passes.**

The design investigation now has a complete purpose-oriented layer between repository archaeology and concept discovery.

The project can proceed into 001-D without asking "what entities already exist?" as its starting point. Instead it can ask which independently understandable behavioral concepts best satisfy the documented purposes.

---

## 15. Immediate next phase

The next work item is:

**001-D — Candidate Concept Discovery & Boundary Hypotheses**

001-D should:

1. begin with the 26 purpose candidates rather than implementation nouns;
2. propose multiple concept-boundary hypotheses where evidence supports alternatives;
3. test obvious split/merge candidates without prematurely canonicalizing them;
4. identify likely concept families and candidate synchronizations;
5. explicitly record why familiar repository nouns are accepted, renamed, split, merged, or rejected as candidate concepts;
6. keep abstract state/actions and full operational principles lightweight until 001-E/001-F refine surviving candidates.

The 001-D output should still be a **candidate model**, not the canonical v0 Concept Design baseline.