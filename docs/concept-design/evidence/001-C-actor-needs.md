# 001-C Evidence — Actor-Need Inventory

Status: **Complete for 001-C baseline**  
Purpose: identify the behavioral roles that experience the recovered problems and state what they need, without treating current application role names as conceptual authority.

## 1. Actor interpretation

An **actor** in this document is a behavioral role in a situation, not necessarily a persistent user type, permission group, database row, or organizational title.

One human may occupy several actor roles. For example, a board member may at different times act as an evaluator, program decision maker, artifact reviewer, planner, or communicator.

Conversely, a future organizational role could delegate only a subset of these behavioral responsibilities.

Current labels such as `BOARD`, `CHAIR`, `ADMIN`, route names, and token types therefore remain implementation evidence rather than actor definitions.

---

## 2. Behavioral actor set

### AR-01 — Content originator

A person or group offering candidate session content and later responsible for maintaining that content and deciding whether they remain willing to participate.

Historical implementations usually call this actor a submitter or presenter.

### AR-02 — Evaluator

A participant asked to form and preserve an independent judgment about candidate content.

Historically performed by board and co-chair members.

### AR-03 — Program decision maker

A participant with authority to make consequential decisions about which candidate content belongs in the event program and how finite capacity is consumed.

Historically a narrower responsibility than evaluation.

### AR-04 — Program planner

A participant responsible for allocating selected sessions into actual room/time opportunities and adjusting placements.

Historically held by board authority.

### AR-05 — Artifact reviewer

A participant responsible for determining whether presentation material needed for a selected session is operationally ready.

Historically available to both board and co-chair roles.

### AR-06 — Event policy administrator

A participant responsible for event-wide configuration and governance such as submission availability, shared vocabulary administration, review-mode policy, and event closure/history state.

Historically represented by a separate admin responsibility.

### AR-07 — Operational communicator

A participant responsible for sending consequential recurring event communications to eligible audiences and knowing what has already been sent.

Historically performed by board authority.

### AR-08 — Internal historical observer / auditor

A participant who needs to understand completed-event state and reconstruct important past changes or actions.

This role may be performed by organizers, administrators, later committee members, or future audit/reporting processes.

### AR-09 — Public audience member

A person outside the organizing workflow who may access intentionally published post-event material.

### AR-10 — Event attendee

A participant consuming the event program whose preferences, attendance, waitlist status, room occupancy, or session feedback may become operational evidence.

Much of this role is future-intent evidence today.

### AR-11 — External authoritative system

A system outside MinneAnalytics that owns or supplies operational facts needed by the workflow, such as registration, attendance, session choice, or room-demand information.

This is a participating system role, not a human actor.

### AR-12 — External operational consumer

A person or system that needs event decisions/history exported from MinneAnalytics for reporting, analysis, archival, or coordination outside the interactive application.

---

## 3. Content-originator needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-O01 | Offer candidate session content in a durable form for consideration. | PR-001 | High |
| AN-O02 | Retain a way to return to and understand the current state of that offered content. | PR-001, PR-003 | High |
| AN-O03 | Correct or improve proposed content when policy permits without losing earlier versions. | PR-002, PR-003 | High |
| AN-O04 | Know that prior versions remain historically attributable rather than silently overwritten. | PR-002, PR-027 | High |
| AN-O05 | Receive communication intended for the originator separately from evaluators' private reasoning. | PR-007 | Very high |
| AN-O06 | Understand that changed content may require renewed committee attention or judgment. | PR-005 | High |
| AN-O07 | Remain able to rescind participation even if organizers previously selected the session. | PR-009 | Very high |
| AN-O08 | Provide presentation material once downstream workflow requires it. | PR-017 | High |
| AN-O09 | Have public sharing of the session/material treated separately from program acceptance. | PR-019 | High |
| AN-O10 | Introduce useful new classification vocabulary when the available terms do not describe the content well. | PR-014 | High |
| AN-O11 | Complete and have organizers recognize downstream operational obligations such as registration. | PR-023 | Medium-high |
| AN-O12 | Potentially receive controlled permission to revise already-selected content rather than being permanently locked by prototype policy. | PR-003 | High future intent |

### Originator non-needs / exclusions

The historical evidence does **not** establish a need for the originator to:

- know internal token/authentication mechanics;
- control committee evaluation outcomes;
- see private evaluator notes;
- dictate shared-vocabulary governance after proposing a term;
- automatically publish accepted materials publicly.

---

## 4. Evaluator needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-E01 | Form and record an individual judgment independently of a later program decision. | PR-004 | Very high |
| AN-E02 | Retain private evaluation context that is not automatically exposed to the originator. | PR-004, PR-007 | Very high |
| AN-E03 | Know which version of mutable content the judgment addressed. | PR-002, PR-005 | High |
| AN-E04 | Know when an earlier judgment no longer applies to the current version. | PR-005 | High |
| AN-E05 | Have changed content surfaced when renewed judgment is expected. | PR-005 | High |
| AN-E06 | Inspect relevant change history when evaluating revised content. | PR-002, PR-005 | High |
| AN-E07 | Communicate actionable originator-facing feedback without converting private notes into public communication. | PR-007 | Very high |
| AN-E08 | Avoid premature exposure to potentially biasing identity or aggregate judgment information when policy requires independent review. | PR-006 | High |
| AN-E09 | Obtain otherwise-hidden identity/context when justified by legitimate review needs. | PR-006 | High |
| AN-E10 | Be excluded or constrained when a future conflict policy determines their judgment should not participate. | PR-006, PR-010 | Medium-high future intent |
| AN-E11 | Participate in evaluation without automatically receiving approval, scheduling, publication, or administrative authority. | PR-010 | Very high |

### Evaluator non-needs / exclusions

Evaluation does not inherently require:

- authority to accept or decline candidates;
- access to all other evaluator judgments before forming one's own;
- control of event-wide policy;
- control of public publication;
- a specific numeric scale as the only possible judgment representation.

---

## 5. Program-decision-maker needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-D01 | Compare candidate content using available judgments and relevant program evidence. | PR-008 | High |
| AN-D02 | Choose among candidates under finite capacity. | PR-008 | High |
| AN-D03 | Preserve reserve/back-up options that can later be promoted. | PR-008 | High |
| AN-D04 | Understand program composition across classifications and other attributes. | PR-011, PR-016 | High |
| AN-D05 | Receive composition warnings/decision support without being forced into automatic target-driven decisions. | PR-011, PR-016 | High |
| AN-D06 | Distinguish different classes of capacity commitment such as sponsor/community sessions. | PR-012 | High |
| AN-D07 | Recognize that originator withdrawal is an independent later fact, not retroactive evidence that the earlier selection never occurred. | PR-009 | High |
| AN-D08 | Understand whether judgments being compared apply to the current content version. | PR-005 | High |
| AN-D09 | Recognize/handle revised content independently of per-evaluator judgment freshness. | PR-002, PR-005 | Medium-high |
| AN-D10 | Exercise only the consequential authority delegated to this responsibility. | PR-010 | High |
| AN-D11 | Potentially authorize exceptional post-selection content changes rather than relying on an unconditional lock. | PR-003 | High future intent |

---

## 6. Program-planner needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-P01 | Allocate selected sessions into finite room/time opportunities. | PR-018 | High |
| AN-P02 | Obtain an assisted initial arrangement when useful. | PR-018 | High |
| AN-P03 | Override, move, swap, or otherwise adjust machine-suggested placements. | PR-018 | High |
| AN-P04 | Consider relevant content/program characteristics when arranging sessions. | PR-018 | High |
| AN-P05 | Potentially incorporate attendee demand, room capacity, attendance, and waitlists as additional scheduling evidence. | PR-025 | Medium-high future intent |
| AN-P06 | Treat external scheduling/attendance facts according to their actual source of authority. | PR-024, PR-025 | Medium-high future intent |

### Planner non-need

The planner does not need the current technical-variety algorithm to be conceptually fixed. It is one heuristic for satisfying a broader placement problem.

---

## 7. Artifact-reviewer needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-R01 | Know whether required presentation material has been provided for a selected session. | PR-017 | High |
| AN-R02 | Assess material readiness independently of whether the session was selected into the program. | PR-017 | High |
| AN-R03 | Record concern/readiness outcomes appropriate to operational preparation. | PR-017 | High |
| AN-R04 | Access the submitted material needed to perform the review. | PR-017 | High |
| AN-R05 | Participate in material review without necessarily receiving program-decision authority. | PR-010, PR-017 | High |

---

## 8. Event-policy-administrator needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-A01 | Define when an event accepts new candidate content. | PR-003 | High |
| AN-A02 | Change event lifecycle state so completed events become historical/read-only. | PR-020 | High |
| AN-A03 | Govern the available shared classification vocabulary. | PR-015 | High |
| AN-A04 | Moderate participant-created vocabulary while preserving historical associations. | PR-014, PR-015 | High |
| AN-A05 | Express representation targets/preferences associated with classifications. | PR-016 | High |
| AN-A06 | Configure review/disclosure policy such as whether bias-reduced information masking is active. | PR-006 | High |
| AN-A07 | Exercise event-policy authority independently from ordinary evaluation and program decision participation. | PR-010 | High |
| AN-A08 | Future: support structured organizational identity/authority mappings without making current token mechanics the behavioral model. | PR-010 | High future intent |

---

## 9. Operational-communicator needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-C01 | Select a repeatable communication intent rather than compose every operational message from scratch. | PR-021 | High |
| AN-C02 | Resolve which participants are currently eligible recipients for that communication. | PR-021 | High |
| AN-C03 | Preview message content and audience before committing the send. | PR-021 | High |
| AN-C04 | Perform a communication batch and preserve recipient/send history. | PR-021, PR-027 | High |
| AN-C05 | Avoid unintended duplicate delivery within a communication round. | PR-021 | High |
| AN-C06 | Conduct later rounds that can target participants who became newly eligible. | PR-021 | High |
| AN-C07 | Retain these semantics if the delivery provider changes. | PR-021 | High |

---

## 10. Historical-observer and audit needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-H01 | Access completed-event state after active operations cease. | PR-020 | High |
| AN-H02 | Know how mutable content changed over time. | PR-002, PR-027 | High |
| AN-H03 | Know the historical context of judgments, including which version was judged. | PR-005, PR-027 | High |
| AN-H04 | Know that retired vocabulary was historically associated with prior content. | PR-015, PR-027 | High |
| AN-H05 | Know what operational communications were sent and to whom. | PR-021, PR-027 | High |
| AN-H06 | Future: reconstruct broader committee actions through append-only activity history. | PR-027 | High future intent |

---

## 11. Public-audience needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-U01 | Access intentionally published post-event materials without needing internal committee access. | PR-019 | High |
| AN-U02 | Encounter only material organizers/presenters have made eligible for public sharing. | PR-019 | High |

The public audience has no historical evidence-based need to access internal evaluation, decision, or administrative histories.

---

## 12. Event-attendee needs

These needs are mostly future-intent evidence and therefore should influence genericity without being represented as fully shipped behavior.

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-T01 | Express or have session preferences represented in event operations. | PR-025 | Medium-high future |
| AN-T02 | Have attendance/waitlist state recognized when organizers reason about room/session demand. | PR-025 | Medium-high future |
| AN-T03 | Provide low-friction, session-specific reaction near the time/place of the session. | PR-026 | Medium-high future |
| AN-T04 | Potentially receive event communications based on attendance/registration context. | PR-021, PR-023 | Medium future |

---

## 13. External-authoritative-system needs

A participating external system does not have human "needs" in the ordinary sense. These statements describe integration responsibilities necessary for trustworthy composition.

| Need ID | Integration responsibility | Problem refs | Evidence strength |
|---|---|---|---|
| AN-X01 | Supply operational facts that it owns authoritatively without MinneAnalytics reinterpreting local manual state as more authoritative. | PR-024 | Medium-high future |
| AN-X02 | Permit synchronization/mapping of registration, attendee, session, capacity, or waitlist state into relevant workflows. | PR-024, PR-025 | Medium-high future |
| AN-X03 | Preserve source identity/provenance sufficiently that users can distinguish externally supplied facts from locally established facts. | PR-024, PR-027 | Medium future |

---

## 14. External-operational-consumer needs

| Need ID | Need | Problem refs | Evidence strength |
|---|---|---|---|
| AN-Z01 | Receive important event state in a portable representation suitable for external analysis or coordination. | PR-022 | Medium-high |
| AN-Z02 | Receive enough context/history that exported state is not misleading when mutable content or judgments changed over time. | PR-022, PR-027 | Medium-high |

---

## 15. Cross-actor tensions that later design must preserve

These tensions are valuable because they indicate that one actor's desired outcome should not silently erase another actor's independently meaningful state.

### CT-01 — Program decision maker vs content originator

The organizer may select a session; the originator may later withdraw. Both facts are meaningful.

### CT-02 — Evaluator privacy vs originator communication

The evaluator needs private reasoning space; the originator needs intentional actionable feedback. These audiences must not collapse.

### CT-03 — Independent evaluator vs collective judgment visibility

The evaluator benefits from withholding collective aggregates before forming a judgment; the program decision maker later needs aggregate evidence.

### CT-04 — Participant-created vocabulary vs administrative governance

Originators need low-friction vocabulary evolution; administrators need moderation and historical continuity.

### CT-05 — Human program discretion vs composition policy

Decision makers need composition evidence and goals without having their decision mechanically determined by them.

### CT-06 — Automation vs planner authority

Automated scheduling can provide assistance; human planners retain final control.

### CT-07 — Public access vs internal historical access

The public may receive intentionally published materials; organizers need a much richer private historical record.

### CT-08 — Local workflow vs external source of truth

MinneAnalytics needs external operational facts but should not erase which system established them.

---

## 16. Actor-to-problem coverage matrix

Legend: `P` primary need; `S` supporting/secondary concern; `F` future-intent concern.

| Actor | Primary problem areas |
|---|---|
| Content originator | PR-001, PR-002, PR-003, PR-007, PR-009, PR-014, PR-017, PR-019, PR-023 |
| Evaluator | PR-004, PR-005, PR-006, PR-007, PR-010 |
| Program decision maker | PR-005, PR-008, PR-009, PR-010, PR-011, PR-012, PR-016 |
| Program planner | PR-018; PR-024/PR-025 future |
| Artifact reviewer | PR-010, PR-017 |
| Event policy administrator | PR-003, PR-006, PR-010, PR-014, PR-015, PR-016, PR-020 |
| Operational communicator | PR-021, PR-027 |
| Historical observer/auditor | PR-002, PR-005, PR-015, PR-020, PR-021, PR-027 |
| Public audience | PR-019 |
| Event attendee | PR-025, PR-026; PR-021/PR-023 secondary/future |
| External authoritative system | PR-024, PR-025, PR-027 |
| External operational consumer | PR-022, PR-027 |

---

## 17. Handoff to purpose discovery

The next 001-C artifact derives **purposes** from these actor needs.

Purpose discovery must ask:

> What coherent behavioral capability would remove this difficulty or satisfy this need, independent of how the current application stores, displays, routes, or permissions it?

A purpose may serve several actor needs. A single actor need may participate in several purposes. No purpose becomes a concept until 001-D tests candidate boundaries.