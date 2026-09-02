# 001-B — Historical Intent Reconstruction & Repository Archaeology

Status: **Complete**  
Concept model maturity: **v0 — discovery**  
Branch: **`concept-design/v0-discovery`**  
Governing method: [001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules](001-A-design-authority-methodology-evidence-and-anti-bias.md)

## 1. Purpose

001-B reconstructs the historical product intent of MinneAnalytics from repository evidence before formal problem, purpose, or concept discovery begins.

The objective is not to identify concepts yet. It is to establish a trustworthy account of:

- what problems the project appears to have been trying to solve;
- which actors and organizational responsibilities emerged over time;
- which behaviors were foundational versus later refinements;
- which behaviors are deliberate product semantics versus prototype/demo accommodations;
- where terminology changed;
- where current documentation no longer preserves earlier rationale;
- which future directions are supported by historical evidence;
- which apparent domain structures must remain provisional until later Concept Design phases.

The outputs of 001-B are evidence for 001-C. They are not a canonical concept model.

---

## 2. Archaeology boundary

This phase follows the anti-bias rules established in 001-A.

Accordingly, 001-B emphasizes:

1. historical planning documents;
2. commit messages that state behavioral rationale;
3. user-facing walkthroughs and current behavioral documentation;
4. roadmap/backlog material that explains unmet needs;
5. implementation details only when needed to distinguish intended behavior from demo or engineering artifacts.

The following are deliberately **not** inferred in 001-B:

- final concept names;
- final concept boundaries;
- abstract concept state;
- concept actions;
- synchronizations;
- implementation refactoring requirements.

Where the evidence suggests a possible conceptual separation, this phase records a **design signal** rather than promoting a concept.

---

## 3. Primary archaeology finding: current documentation is not the complete design record

A central finding is that the richest product rationale is partly historical rather than present on `main`.

The repository repeatedly followed a pattern:

```text
planning document created
        ↓
behavior implemented
        ↓
implementation plan removed
        ↓
current architecture / walkthrough retained
```

This occurred at least twice:

1. The initial `docs/IMPLEMENTATION_PLAN.md` existed at the initial commit and described the original end-to-end product goals. Commit `40cca260e164272ce571be93f6d6e3b77971ab48` later removed that phased implementation plan and replaced it with developer-facing architecture, routing, walkthrough, development, and contribution documentation.
2. The v2 branch introduced `docs/conference-v2-implementation-plan.md` and `docs/conference-backlog.md`, which contain explicit problem statements, goals, non-goals, policy choices, open questions, and future needs. After v2 merged, commit `7d943641cc53d072bab0ce4aed8520ecd173dd49` removed the implementation-plan/backlog material and consolidated current documentation around shipped features and remaining roadmap items.

Therefore:

> **The current `docs/` directory is authoritative for current documented behavior, but it is incomplete as a source of historical design intent. Repository history must remain a first-class design evidence source throughout the retrofit.**

This is one of the most important outcomes of 001-B.

---

## 4. Historical intent epochs

The project history is most useful when grouped into intent epochs rather than interpreted commit-by-commit.

### Epoch 0 — Initial conference-planning proof of concept

**Earliest recoverable baseline:** initial commit `2a16e25d371de8d48c9fc48f4ff2d24fb894114d`.

The initial plan already described a broad end-to-end conference workflow rather than a narrow submission form.

Recovered user-visible needs included:

- prospective speakers can offer presentations for consideration;
- committee members can independently score offers and record notes;
- program decision makers can compare scores and manage finite program capacity;
- an authorized approver can accept pending or backup candidates;
- a presenter can withdraw even after acceptance;
- accepted presenters can provide a deck;
- committee members can review deck readiness;
- planners can place accepted talks into a schedule and manually rearrange placements;
- the application is explicitly a demo/prototype rather than a production identity/security deployment.

The initial plan also records two different lifecycle vocabularies on one submission record:

- program placement/status (`PENDING`, `APPROVED`, `DECLINED`, `BACKUP`, `WITHDRAWN`);
- deck readiness/status (`SUBMITTED`, `REVIEWED`, `APPROVED`, `CONCERN`).

**Design significance:** the product began as a workflow spanning proposal intake, collective evaluation, program formation, presenter agency, artifact readiness, and scheduling. These should not be collapsed into a single purpose merely because the initial implementation placed much of the state around a submission record.

### Epoch 1 — Organizational authority and lifecycle expansion

Shortly after the initial commit, repository history changed the role model.

Commit `57892705a18da793bcbe726a7344c4d60ea0f8fd` replaced the original `SCORER` / `CORE` role vocabulary with `BOARD` and `CHAIR` behavior:

- board members score abstracts;
- co-chairs score abstracts;
- both can review decks;
- board members retain approval and schedule authority;
- co-chairs do not receive those consequential actions.

This is more than a naming cleanup. It shows that the project was moving from application-centric capability labels toward real organizational authority boundaries.

Commit `7a994056171aa4661f15b1dab038ddd6a76f6173` then expanded the workflow beyond program formation by adding:

- a dedicated deck queue;
- committee deck downloads;
- per-session shareability;
- publication/unpublication of a post-conference public slide archive;
- CSV export;
- public-form abuse controls and email stubs.

Commit `5d9f017bef6b286ec84eb70144fd3cb136c76342` added VIP-event registration tracking for approved talks.

Commit `b0d7e76f95afb4f3210b43f235949949bea2bf3a` added automatic synthetic scores for approved/declined seed/demo rows.

The last item is intentionally classified differently from the others:

> Auto-scoring after a board decision is a **demo consistency mechanism**, not reliable evidence that the intended product semantics allow program decisions to manufacture committee judgment retroactively.

That distinction is important for all later discovery.

### Epoch 2 — Administration, taxonomy, coverage, and historical operations

Commit `8439ffcafd73e8868ace846f9e0f6d6b1b08116f` materially expanded the product's operational scope.

It introduced or consolidated intent around:

- a separate site-administration responsibility;
- configurable submission windows;
- conference lifecycle management;
- theme taxonomy management;
- target minimum/maximum representation by theme;
- chair theme filters and gap analysis;
- saturation warnings during approval;
- historical conference review;
- database-backed listing of upcoming conferences.

This epoch shows a shift from a single event workflow toward a more configurable event-management platform.

It also introduced an important behavioral distinction:

- classification of talks by theme;
- governance of which theme labels are available;
- representation goals associated with those classifications;
- analytics used to inform program decisions.

001-B does **not** conclude how many concepts this represents. It records that the historical behavior contains several separable purposes that should be tested later rather than automatically inherited as one `Theme` abstraction.

### Epoch 3 — v2: iterative review, provenance, bias reduction, and richer governance

The v2 planning document is the richest single intent source in repository history.

At commit `54ebf8bcaef23672af979d3937ce7157038c243a`, `docs/conference-v2-implementation-plan.md` explicitly described the existing product as optimized for a **"one-shot CFP → score → approve flow"** and identified the resulting gaps.

The v2 goals introduced several distinct behavioral needs.

#### Presenter revision and lineage

The plan states that presenters need to revise selected submission content safely, with immutable historical snapshots and visible version lineage.

The product therefore evolved from:

```text
submit once → evaluate live row
```

into behavior closer to:

```text
submit → revise over time → preserve prior versions → know what was evaluated
```

Commit `02acafda3ecaacfd9baa024d7c8a8e4352dbefb8` added visible revision lineage, and commit `5b59f44a454b9e22247029c3c31924c08a0100b3` subsequently made evaluation validity version-aware.

The historical ordering is significant evidence: preserving changed content and determining whether a previous score still participates in the current aggregate were implemented as related but distinct refinements.

#### Committee feedback versus private evaluation notes

The v2 plan explicitly states that existing score notes were private committee notes and could not serve the need to tell presenters what should change.

Commit `49ecb748ac60b76777e218af0adcbfaa84e0d80c` implemented a separate presenter-visible feedback channel.

This is a strong historical signal that:

- an evaluator's private reasoning/context and
- communication from committee to presenter

were intentionally treated as different behaviors even though both can contain text associated with the same talk.

#### Bias-reduced review and controlled identity exposure

The v2 plan identified two anchoring/bias concerns:

- reviewer exposure to presenter identity before evaluating content;
- reviewer/approver exposure to committee aggregates before recording their own judgment.

Commit `729889008c61e233de60a504dfb8a460d3841ecb` implemented identity masking, explicit reveal, and score masking until the viewer had scored.

The intent is not simply "blind UI." The recovered need is to control information exposure in order to protect independent judgment while still allowing contextual disclosure when necessary.

The roadmap later extends this direction with a planned conflict-of-interest registry.

#### Evaluation validity after revision

The v2 plan considered two aggregate policies and explicitly chose strict current-version participation for the demo.

Commit `5b59f44a454b9e22247029c3c31924c08a0100b3` records the implemented policy:

- scores are associated with the abstract version they evaluated;
- a later revision can place a reviewer into a rescore queue;
- aggregate ranking uses current-version scores only;
- the board can mark a revision reviewed.

This is strong evidence that evaluation is not merely attached to a talk forever; its applicability is historically contextual.

#### Community-driven taxonomy with administrative moderation

The v2 plan identified a limitation in an admin-only fixed taxonomy.

The intended behavior became:

- presenters may propose new theme labels;
- proposed labels are immediately reusable by later submitters;
- administrators can rename, promote, target, restore, or soft-remove labels;
- removal should not destroy historical classification relationships.

Commits `4f0c9d289d09cddad46e79b0a5e5acc8e5aef3bf` and `44ef2787af2d0a1f667472c9fb1651ae058307e1` implement this progression.

The explicit soft-removal policy is especially useful archaeological evidence: the application values historical interpretability over destructive taxonomy cleanup.

#### Sponsorship and capacity accounting

The initial application already had sponsorship-aware capacity math, but the sponsor flag was effectively seed/configuration state rather than an ordinary operational action.

Commit `4cb46a0197c2582f646529e500efac7751e49243` gave board members an explicit operational ability to classify/unclassify a talk as a sponsor session and made that state visible to review/program workflows.

This suggests that program capacity is not merely a count of approved talks; different classes of program commitments can consume or be excluded from different capacity targets.

#### Board communications and send history

Commit `929917719a8d94f51d35a42c1cf00cb5a00b3178` introduced reusable communication templates, per-conference batches, send history, deduplication, and multi-round decline behavior.

The underlying need is broader than email delivery:

- select a communication intent;
- resolve an eligible audience;
- preview content;
- perform a batch communication;
- preserve what was sent and when;
- avoid unintended duplicate delivery within a round;
- allow later rounds to target newly eligible recipients.

The current roadmap explicitly treats the email provider as replaceable, confirming that transport is an engineering realization rather than the durable behavioral purpose.

#### Coverage visualization

Commit `928e887a69d405ccb0a38e30908ccf1b7a6c1f9e` added theme/status and technicality/theme heatmaps.

This commit primarily changes representation rather than introducing a new underlying user need. The underlying need—understanding program composition and imbalance—already existed in the earlier theme gap and technicality balance behavior.

This distinction prevents later Concept Design work from treating each visualization widget as a separate concept.

### Epoch 4 — Current roadmap: production identity, governance, integration, and attendee operations

The current roadmap provides future-intent evidence rather than current behavior.

It records needs around:

- replacing long-lived committee tokens with structured organizational identity;
- full conflict-of-interest declaration/exclusion;
- board-authorized unlocking of approved abstracts for further edits;
- production communication/calendar delivery;
- registration-system synchronization;
- Sched.com session/attendance/waitlist synchronization;
- append-only committee activity audit;
- multi-conference public operation;
- scalable data/storage infrastructure;
- reporting APIs;
- in-room attendee feedback.

Historical backlog material adds richer rationale for two of these future directions:

- room-based QR feedback addresses in-the-moment audience reaction, which is explicitly distinguished from committee-to-presenter feedback and post-event email feedback;
- Sched integration addresses attendee preference, capacity, waitlists, and external operational truth, which the internal schedule builder does not currently represent.

These future items are not accepted concepts. They are evidence that the design model should not be so narrowly framed around the current PoC that these already-articulated needs become unnatural extensions.

---

## 5. Recovered actor and responsibility evolution

The project history reveals a richer actor model than the current route names alone suggest.

### Prospective presenter / submitter

Historical needs:

- offer a talk;
- provide descriptive and classification information;
- later propose classifications;
- receive a private return path to manage the submission.

### Presenter after submission

Historical needs:

- observe current program state;
- withdraw, including after approval;
- revise content while policy permits;
- receive committee feedback;
- upload presentation materials after acceptance.

### Evaluator

Initially represented as a generic scorer, then associated with board/co-chair membership.

Historical needs:

- form an independent judgment;
- record numeric evaluation and private notes;
- understand whether a prior evaluation applies to the current revision;
- communicate separate presenter-visible feedback;
- access identity when necessary under a bias-reduced review policy.

### Program decision authority

Initially expressed as `CORE`, later as board authority.

Historical needs:

- compare eligible proposals;
- reason about capacity and program composition;
- approve, decline, or retain backups;
- promote backups;
- classify sponsor sessions;
- acknowledge revised content;
- publish post-conference materials;
- send operational communications;
- construct the schedule.

### Co-chair

The role change shows deliberate partial delegation:

- may score;
- may review decks;
- may participate in program analysis;
- may not approve/decline, publish the archive, or build the schedule in the current model.

This is evidence that responsibility should be modeled independently of authentication implementation.

### Site administrator

Introduced later and intentionally separated from board authority.

Historical needs:

- manage conference lifecycle and submission windows;
- manage/moderate taxonomy;
- configure review behavior;
- archive conference state.

The current implementation explicitly allows the same human to hold different tokens/roles, reinforcing the difference between a person and the authority context in which that person acts.

### Attendee

Primarily future/backlog evidence today.

Potential needs already documented:

- receive event communications;
- express session preferences through external systems;
- occupy limited room capacity;
- provide in-room talk feedback.

### External operational systems

Roadmap/backlog evidence introduces external sources such as registration platforms and Sched.

The important recovered need is not a particular API. It is that some operational facts may be authoritative outside MinneAnalytics and synchronized into its workflows.

---

## 6. Historical policy decisions worth preserving as evidence

The following are not yet concept rules, but they are sufficiently explicit in planning/history that later phases must account for them.

### HP-01 — Presenter withdrawal survives approval

The earliest implementation plan explicitly permits withdrawal from an approved state.

This means selection by the committee does not eliminate presenter agency.

### HP-02 — Approval authority is narrower than evaluation authority

The role evolution intentionally allows more people to score than to approve or schedule.

### HP-03 — Public publication is narrower than acceptance

An accepted talk does not automatically appear in the post-conference public archive. Deck readiness, archive publication state, and per-session shareability all matter.

### HP-04 — Historical references should survive later changes

Examples include:

- immutable submission revisions;
- old scores retained even when stale;
- soft-removed themes retained on historically tagged talks;
- archived conferences remaining reviewable in read-only form;
- communication send history retained.

The project repeatedly favors preserving historical truth over rewriting prior records.

### HP-05 — Private evaluator notes and presenter-visible feedback are different

The v2 design explicitly rejects using score notes as presenter feedback.

### HP-06 — Evaluation applicability depends on version context

The project deliberately distinguishes a score's existence from its applicability to the current revision.

### HP-07 — Bias reduction requires controlled disclosure, not permanent anonymity

Identity is hidden by default in review but may be explicitly revealed. Committee aggregates are withheld until an evaluator has formed their own judgment.

### HP-08 — Classification vocabulary can be community-created but remains governable

Presenter-proposed themes become reusable immediately, while administrators retain moderation and target-setting authority.

### HP-09 — Representation goals inform selection without mechanically determining it

Theme targets and technicality balance are decision-support mechanisms. The history shows warnings, filters, and analytics rather than automatic program composition by target alone.

### HP-10 — Communication history and deduplication matter independently of delivery transport

The application preserves batch/recipient history even though delivery is currently a stub and the roadmap anticipates replacing the provider.

### HP-11 — Conference closure changes mutability

Archived conference behavior is read-only; historical information remains visible while active-event mutations cease.

### HP-12 — Internal schedule generation remains adjustable by humans

The initial scheduling behavior combines automatic draft generation with drag/drop reassignment and swaps. Automation is advisory/assistive rather than final authority.

---

## 7. Demo and engineering accommodations that must not become product intent accidentally

### DE-01 — Synthetic auto-scores

Approved/declined seed rows receive synthetic high/low scores to keep the demo visually coherent.

This is not reliable evidence that scores should derive from decisions or that selection causally determines evaluation.

### DE-02 — Opaque URL tokens

Tokens are explicitly documented as demo authentication. Current roadmap intent is to replace committee tokens with structured identity/SSO.

Do not create concepts around token URLs.

### DE-03 — SQLite and local file storage

These are prototype realization choices. The roadmap explicitly anticipates production data/storage replacements.

### DE-04 — Stub email delivery

Template, eligibility, history, deduplication, and batch semantics may represent durable product behavior. Console delivery does not.

### DE-05 — Seeded people, conferences, rooms, slot counts, sponsor ranges, and example talks

These provide examples and test fixtures. They should not be treated as universal design constraints unless independent product evidence supports them.

### DE-06 — Current UI tabs and routes

Program, Balance, History, Deck Queue, Communications, `/review`, `/chair`, `/admin`, and similar surfaces are useful evidence of accessible behavior but do not establish concept boundaries.

### DE-07 — AWS deployment work

The June 5 deployment commits establish an engineering goal of preserving local demo operation while enabling AWS dev deployment. They carry little weight for concept discovery beyond confirming that realization environment should remain separable from behavioral design.

---

## 8. Terminology drift identified during archaeology

The history contains several terms whose meaning changed or whose implementation scope may hide multiple purposes.

### `SCORER`, `CORE`, `BOARD`, `CHAIR`

The original capability-oriented roles changed quickly to organization-oriented roles. Later documentation uses "chair" in both role and dashboard/program-management contexts.

001-C must reason from responsibilities and needs rather than role-name identity.

### `Submission`

Historically used as a container for:

- presenter identity/contact data;
- proposed talk content;
- current editable abstract fields;
- program decision state;
- withdrawal state;
- technical level;
- theme associations;
- sponsor classification;
- deck readiness flags;
- VIP registration flag;
- revision pointer/status.

The breadth of this record is an implementation observation, not evidence that all these behaviors form one concept.

### `ProgramStatus`

The initial enum combines committee/program outcomes (`APPROVED`, `DECLINED`, `BACKUP`) with presenter-originated withdrawal (`WITHDRAWN`) and an undecided state (`PENDING`).

The v2 plan explicitly avoided further overloading this enum by adding a parallel abstract-review lifecycle.

This is a strong **boundary-review signal** for later phases, not a conclusion in 001-B.

### `Theme`

The term evolved from admin-defined category to a shared vocabulary containing official and presenter-proposed labels, moderation history, usage, and coverage targets.

Later phases must not assume that one database table means one behavioral concept.

### `Archive`

The repository contains two different archive ideas:

- a public post-conference deck/slide archive;
- archived conferences available to authorized committee users in read-only history views.

These should remain terminologically disambiguated during discovery.

### `Feedback`

At least three historically distinct meanings now exist or are planned:

- private score notes;
- committee-to-presenter feedback;
- future attendee/session feedback.

The project history itself repeatedly distinguishes their audience and timing.

---

## 9. Contradictions, ambiguities, and unresolved evidence

### CA-01 — Role vocabulary is historically unstable

The rapid transition from scorer/core to board/chair means early role names cannot be treated as durable domain language.

### CA-02 — `WITHDRAWN` shares a program-status enum with selection outcomes

The history does not establish whether this was a deliberate unified lifecycle or an implementation convenience. Later phases must test it from purposes rather than infer either answer.

### CA-03 — Abstract review state was intentionally split from program status, but still uses one enum for several review conditions

The v2 plan itself records an open question about whether `AbstractReviewStatus` should be split from rescoring state. The demo chose a single enum for simplicity.

This is explicit evidence that the current implementation may contain a known simplification.

### CA-04 — Blind review is configurable

The application supports bias-reduced review but can be toggled off. Later design must distinguish the underlying disclosure capability/policy from one configured conference mode.

### CA-05 — Presenter edit policy is intentionally incomplete

Approved talks are locked in the current demo; the v2 plan and current roadmap both preserve a future board-unlock path.

Therefore the current lock should not automatically become a conceptual invariant.

### CA-06 — Phase 7 is absent from the surviving v2 numbered roadmap

The v2 implementation sequence jumps from Phase 6 to Phase 8. No behavioral conclusion should be drawn from this numbering anomaly.

### CA-07 — Historical plans contain tentative decisions

The v2 plan contains recommendations and "tentative" choices. Some later became implemented policy; others were deferred. Source classification must distinguish planned recommendation from shipped behavior.

### CA-08 — Documentation dates and commit dates represent different timelines

The v2 plan revision log records May 21 planning entries while the relevant commits were made June 2. This is not inherently contradictory; it indicates planning chronology may predate repository commit chronology.

---

## 10. Intent threads to carry into 001-C

001-B does not convert these into candidate concepts. It hands 001-C a set of recurrent problem domains that require explicit actor-need and purpose analysis.

The strongest threads are:

1. **Offering and maintaining proposed session content** — initial submission, later edits, historical versions.
2. **Independent judgment** — scoring, private notes, bias protection, score applicability.
3. **Communication about proposed content** — committee-to-presenter feedback distinct from evaluation notes.
4. **Program decision making** — accept, decline, backup, promotion, capacity and composition reasoning.
5. **Presenter agency after committee action** — withdrawal and potentially later edit/unlock behavior.
6. **Authority and delegation** — evaluator versus board decision authority versus administration.
7. **Classification and vocabulary governance** — selectable labels, community proposals, moderation, historical preservation.
8. **Program composition goals** — theme coverage, technicality distribution, sponsorship, finite capacity.
9. **Artifact readiness** — presentation deck submission, review, concern/approval.
10. **Scheduling** — allocation to room/time, assisted generation, manual rearrangement.
11. **Publication and historical access** — public materials versus internal read-only conference history.
12. **Operational communication** — templated audience resolution, send history, rounds, deduplication.
13. **Temporal availability/lifecycle** — submission windows, active versus archived events, mutation eligibility.
14. **Registration/attendance operations** — VIP tracking today; external registration/Sched intent later.
15. **Audit/provenance** — revisions, stale-score context, send history, future committee activity audit.
16. **Audience feedback** — future in-room feedback distinct from committee review.

These are **problem threads**, not concept names.

---

## 11. Evidence confidence summary

### High-confidence historical intent

Supported by explicit plans plus implemented/current behavior:

- public proposal intake;
- committee evaluation;
- narrower approval authority;
- presenter withdrawal after approval;
- deck workflow;
- schedule construction;
- revision lineage;
- version-aware rescoring;
- separate presenter feedback;
- bias-reduced review;
- taxonomy moderation/community proposals;
- program composition analysis;
- post-event publication;
- templated communication history.

### Medium-confidence durable intent

Supported by one or more historical/current sources but potentially conference-specific or still evolving:

- VIP registration tracking;
- sponsor target/capacity semantics;
- exact technicality balancing rules;
- board acknowledgment of revisions;
- specific edit-window policies;
- multi-conference administration.

### Future-intent evidence only

Not yet current product behavior:

- SSO/structured identity;
- full conflict-of-interest registry;
- production email/calendar integration;
- board unlock of approved abstracts;
- external registration synchronization;
- Sched attendance/waitlist integration;
- full committee activity audit;
- reporting API;
- in-room QR feedback.

### Explicitly weak concept evidence

- synthetic demo scores;
- token URL shape;
- SQLite/Prisma choice;
- Next.js/Tailwind structure;
- AWS deployment topology;
- current component/module organization;
- specific seed names/data;
- exact visual chart/heatmap implementation.

---

## 12. 001-B artifacts

This phase produces the following evidence set:

- [001-B Source Register](evidence/001-B-source-register.md)
- [001-B Repository Timeline](evidence/001-B-repository-timeline.md)
- [001-B Intent Ledger](evidence/001-B-intent-ledger.md)
- [001-B Terminology, Contradictions & Exclusions](evidence/001-B-terminology-contradictions-and-exclusions.md)

The artifacts are intentionally separated so later phases can cite recovered observations without relying on one narrative document.

---

## 13. 001-B exit review

### Exit criteria

- [x] Earliest recoverable product plan reviewed.
- [x] Major behavioral commits reconstructed chronologically.
- [x] Removed historical planning material recovered from Git history.
- [x] v2 problem statement, goals, non-goals, policy choices, and open questions reviewed.
- [x] Current roadmap and historical backlog reviewed as future-intent evidence.
- [x] Actor/responsibility evolution recorded without canonizing current role names.
- [x] Demo/engineering accommodations separated from reliable product intent.
- [x] Terminology drift and known modeling ambiguities recorded.
- [x] Recurrent problem threads identified without prematurely naming concepts.
- [x] No implementation refactor performed.

### Phase result

**001-B passes.**

The repository contains sufficient historical evidence to proceed to purpose-oriented discovery without using the current implementation as the primary source of design structure.

The most important methodological conclusion is that **deleted planning documents and commit rationale are necessary design evidence**. A current-main-only reading would systematically under-represent the reasons the system evolved as it did.

---

## 14. Next phase

Proceed to:

**001-C — Problem, Actor-Need & Purpose Inventory**

001-C should take the recovered intent threads and restate them as implementation-neutral problems and actor needs. It should deliberately avoid candidate concept naming until each purpose has been made explicit enough to support later boundary discovery in 001-D.
