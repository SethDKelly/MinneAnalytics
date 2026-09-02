# 001-C Evidence — Problem Inventory

Status: **Complete for 001-C baseline**  
Purpose: normalize the 001-B historical intent ledger into implementation-neutral problems before candidate concept discovery.

## 1. Interpretation rules

This inventory is not a list of concepts, features, entities, pages, or workflows.

A **problem** here means a persistent difficulty or unmet need that software behavior may address. Problems are phrased without assuming the current implementation structure is correct.

Rules:

- A problem may later be solved by one concept, several concepts, a synchronization, or application policy.
- Multiple historical behaviors may be evidence for the same problem.
- One historical behavior may expose more than one problem.
- Current nouns such as `Submission`, `Theme`, `Score`, `ProgramStatus`, `Archive`, and `Conference` are avoided where they would silently pre-select a design boundary.
- Demo accommodations and implementation mechanisms excluded by 001-B remain excluded here.

Problem IDs are stable discovery references for later phases; they are not concept IDs.

---

## 2. Candidate-content and change problems

### PR-001 — Offering candidate content for consideration

**Problem**  
An outside participant needs a durable way to offer proposed session content to an event-organizing process so that the content can be considered by others.

**Why the problem exists**  
Without a durable offer, there is no stable subject for evaluation, selection, later revision, operational preparation, or scheduling.

**Evidence**  
IL-001.

**Boundary caution**  
The need to offer content does not by itself establish that presenter identity, program decisions, later materials, registration state, or every subsequent lifecycle fact belongs to the same conceptual unit.

---

### PR-002 — Changing proposed content without erasing its prior form

**Problem**  
An originator may need to correct or improve proposed content after it has already been observed or acted upon, while other participants still need to know what existed before the change.

**Why the problem exists**  
Simple replacement destroys the context in which earlier feedback and judgments were formed.

**Evidence**  
IL-016, IL-017, IL-018, IL-051.

**Boundary caution**  
Preserving change history is not the same problem as deciding whether an earlier evaluation still applies after the change.

---

### PR-003 — Controlling when proposed content may change

**Problem**  
The ability to modify proposed content cannot remain equally available at every stage of an event. Organizers and originators need controlled mutability that can depend on event timing, program decisions, feedback, or explicit authorization.

**Why the problem exists**  
Unrestricted editing can invalidate downstream decisions or operational preparation; permanent locking can prevent legitimate correction.

**Evidence**  
IL-012, IL-016, IL-023; CA-006.

**Boundary caution**  
Current rules that lock approved talks are not treated as permanent invariants.

---

## 3. Judgment and information-quality problems

### PR-004 — Recording an individual's independent judgment

**Problem**  
An evaluator needs to record their own judgment about candidate content, including private context, without that judgment being manufactured from or overwritten by a later collective decision.

**Why the problem exists**  
Collective comparison depends on preserving independently formed judgments.

**Evidence**  
IL-002; exclusion IL-X01 / EX-001.

**Boundary caution**  
A numeric scale is current policy/representation, not necessarily the full durable purpose.

---

### PR-005 — Knowing whether a historical judgment applies to the current subject

**Problem**  
When the subject of a judgment changes, participants need to distinguish a judgment that remains historically true from one that is currently applicable.

**Why the problem exists**  
A stored judgment can accurately describe an earlier version while being misleading if treated as a judgment of the revised version.

**Evidence**  
IL-019, IL-020, IL-021; CA-002, CA-003.

**Boundary caution**  
This problem is distinct from preserving revision history itself and from merely acknowledging that a revision has been seen.

---

### PR-006 — Protecting independent judgment from premature information exposure

**Problem**  
Information available during evaluation can bias or anchor judgment. Organizers need a way to control when potentially influential information is exposed while still permitting justified access when necessary.

**Why the problem exists**  
Identity and other evaluators' judgments can influence an evaluator before they form their own view.

**Evidence**  
IL-026, IL-027, IL-028, IL-029; CA-004, CA-005.

**Boundary caution**  
The durable problem is not a particular "blind review" UI. Configurable disclosure policy and future conflict handling may compose with judgment without being intrinsic to it.

---

### PR-007 — Separating private evaluation context from communication to the originator

**Problem**  
Evaluators need a private place to retain reasoning or context for committee use, while the originator separately needs actionable communication intended for them.

**Why the problem exists**  
Private notes and external feedback have different audiences, confidentiality, tone, and consequences.

**Evidence**  
IL-024, IL-025.

**Boundary caution**  
The fact that both are text associated with the same proposed content does not make them one behavior.

---

## 4. Collective decision and participation problems

### PR-008 — Choosing a feasible program from more candidates than can be used

**Problem**  
Program decision makers need to choose among candidate sessions under finite capacity, retaining options for later changes rather than making only isolated yes/no judgments.

**Why the problem exists**  
Events have limited session capacity and may need accepted, declined, undecided, and reserve candidates during program formation.

**Evidence**  
IL-003, IL-004.

**Boundary caution**  
The problem of selecting content is not assumed to include presenter withdrawal, scheduling placement, or artifact readiness.

---

### PR-009 — Preserving originator agency after an organizer decision

**Problem**  
An originator may no longer be willing or able to participate even after organizers have selected their content. The system must preserve the originator's ability to rescind participation without pretending the earlier organizer decision never occurred.

**Why the problem exists**  
Organizer preference and participant willingness are facts established by different actors and can change independently.

**Evidence**  
IL-005; HP-01; CA-001.

**Boundary caution**  
The current `WITHDRAWN` program status is not accepted as the conceptual model.

---

### PR-010 — Distinguishing participation in judgment from authority to make consequential decisions

**Problem**  
Organizations need to let some participants evaluate or review work without granting them every consequential power over program outcomes, scheduling, publication, or administration.

**Why the problem exists**  
Real organizational responsibilities overlap but are not identical.

**Evidence**  
IL-009, IL-010, IL-011.

**Boundary caution**  
Current role names are not treated as durable actor identities. The underlying issue is delegated authority.

---

### PR-011 — Making program composition visible without replacing human judgment

**Problem**  
Program decision makers need to understand whether the emerging program is balanced or representative across relevant dimensions while retaining discretion over final decisions.

**Why the problem exists**  
Aggregate evaluation alone may produce an undesirable or unrepresentative program, but rigid target enforcement can also override legitimate judgment.

**Evidence**  
IL-035, IL-036; CA-008.

**Boundary caution**  
Heatmaps, bars, filters, and warnings are representations of this need, not separate problems.

---

### PR-012 — Accounting for different classes of capacity commitment

**Problem**  
Not every selected session consumes the same category of scarce program capacity. Decision makers need to distinguish classes of commitment when reasoning about how much capacity remains.

**Why the problem exists**  
Sponsor and community sessions historically participate differently in capacity accounting.

**Evidence**  
IL-037.

**Boundary caution**  
Specific sponsor ranges and Data Tech capacity numbers are demo/configuration details, not invariants.

---

## 5. Classification and shared-vocabulary problems

### PR-013 — Describing candidate content using shared classifications

**Problem**  
Participants need a common vocabulary for describing candidate content so that it can be found, compared, grouped, and analyzed as part of a larger program.

**Why the problem exists**  
Free-text content alone does not reliably support consistent program composition reasoning.

**Evidence**  
IL-030.

**Boundary caution**  
Association with a category is kept separate from governance of the category vocabulary and from representation targets associated with categories.

---

### PR-014 — Allowing a shared vocabulary to evolve without requiring all terms to be predeclared centrally

**Problem**  
A centrally defined classification vocabulary may fail to anticipate emerging topics. Participants need a way to introduce useful new labels that can become immediately reusable.

**Why the problem exists**  
A fixed taxonomy can become a bottleneck or misrepresent the actual subject matter proposed by participants.

**Evidence**  
IL-032.

**Boundary caution**  
Creation of a term does not automatically establish its official standing or permanent availability.

---

### PR-015 — Governing an evolving shared vocabulary without destroying historical meaning

**Problem**  
Administrators need to correct, moderate, recognize, or retire shared classification terms while preserving what historically used those terms.

**Why the problem exists**  
Vocabulary evolves, but destructive cleanup can make historical records uninterpretable.

**Evidence**  
IL-031, IL-033, IL-034; CA-007.

**Boundary caution**  
Vocabulary governance and classification association remain separate problem statements even though the current implementation uses one `Theme` table.

---

### PR-016 — Expressing desired representation over classified content

**Problem**  
Organizers may want the program to contain more or less representation of certain classifications or attributes and need those goals expressed independently of the classifications themselves.

**Why the problem exists**  
A category label describes content; a representation target describes an organizer preference about a collection of content.

**Evidence**  
IL-031, IL-035, IL-036.

**Boundary caution**  
Targets inform program decisions but do not automatically make them.

---

## 6. Operational readiness, scheduling, and publication problems

### PR-017 — Determining whether required presentation material is operationally ready

**Problem**  
Selecting a session does not ensure that the material needed to present it is available or suitable. Organizers need to receive required artifacts and establish their readiness separately from program selection.

**Why the problem exists**  
An accepted session can still have missing, concerning, or unapproved presentation material.

**Evidence**  
IL-006, IL-007.

**Boundary caution**  
Talk acceptance and artifact readiness use the word "approval" in current UI but solve different problems.

---

### PR-018 — Allocating selected content into constrained places and times while retaining human control

**Problem**  
Selected sessions must be assigned to limited rooms and time opportunities. Software may assist with an initial arrangement, but human planners need to inspect and change that arrangement.

**Why the problem exists**  
Selection alone does not produce an executable event schedule, and automated heuristics cannot anticipate every operational concern.

**Evidence**  
IL-008, HP-12; CA-012.

**Boundary caution**  
Current technical-variety balancing is one heuristic, not the definition of the scheduling problem. Future attendee-demand evidence broadens the decision inputs.

---

### PR-019 — Controlling public access to post-event materials independently of program selection

**Problem**  
Organizers need to decide whether eligible event materials should become public after the event, including the ability to exclude individual sessions from an otherwise published collection.

**Why the problem exists**  
Acceptance into a program is not consent or readiness for indefinite public distribution.

**Evidence**  
IL-038, IL-039.

**Boundary caution**  
Public material publication is distinct from internal retention of a completed conference.

---

### PR-020 — Retaining completed-event history while preventing ordinary mutation

**Problem**  
After an event is complete, authorized users still need historical access, while ordinary operational changes should cease.

**Why the problem exists**  
Completed events remain institutionally useful and auditable even after they are no longer active operational objects.

**Evidence**  
IL-013, IL-051; CA-009.

**Boundary caution**  
Internal historical access is not the same problem as public material publication.

---

## 7. Communication and external-operation problems

### PR-021 — Performing repeatable operational communication with a controlled audience and history

**Problem**  
Organizers need to communicate recurring event intents to the correct eligible people, preview the audience/content before committing, avoid unintended duplicates, support later rounds, and retain a record of what was sent.

**Why the problem exists**  
One-off free-form email does not reliably support operationally significant communication across an evolving event workflow.

**Evidence**  
IL-040, IL-041, IL-042, IL-043, IL-044.

**Boundary caution**  
Message definition, audience resolution, execution, and history may later prove independently reusable. 001-C keeps them within one problem family without declaring a concept boundary.

---

### PR-022 — Carrying event state into external operational workflows

**Problem**  
Organizers need important decisions and historical context outside the interactive application for reporting, analysis, coordination, or archival purposes.

**Why the problem exists**  
Operational work does not end at the application UI boundary.

**Evidence**  
IL-045.

**Boundary caution**  
CSV is a current representation, not the durable purpose.

---

### PR-023 — Knowing whether downstream participation obligations have been completed

**Problem**  
After selection, organizers may need to know whether participants have completed associated obligations such as event/VIP registration.

**Why the problem exists**  
Program selection and operational readiness of the participant are different facts.

**Evidence**  
IL-046, IL-047.

**Boundary caution**  
Manual tracking is current implementation; the fact may later be sourced externally.

---

### PR-024 — Incorporating operational facts whose authority resides in another system

**Problem**  
Some event facts may be authoritative in registration, scheduling, or attendance systems outside MinneAnalytics. The application needs to use those facts without pretending it originated or exclusively owns them.

**Why the problem exists**  
Duplicating externally authoritative state causes drift and weakens operational trust.

**Evidence**  
IL-047, IL-048, IL-050.

**Boundary caution**  
Sched, Eventbrite, and Cvent are examples, not conceptual dependencies.

---

### PR-025 — Using attendee demand and room constraints as scheduling evidence

**Problem**  
Planners may need to consider actual attendee choices, room capacity, attendance, and waitlists when deciding whether a session is appropriately placed.

**Why the problem exists**  
Internal content attributes alone do not reflect operational demand.

**Evidence**  
IL-048.

**Boundary caution**  
This is future-intent evidence and may ultimately compose with scheduling rather than define a new independent concept.

---

### PR-026 — Capturing immediate audience response to a session

**Problem**  
Organizers may need low-friction, session-specific audience reaction during or near the event, distinct from committee evaluation and committee-to-presenter feedback.

**Why the problem exists**  
The people experiencing a session have a different perspective, timing, and purpose from pre-event evaluators.

**Evidence**  
IL-049.

**Boundary caution**  
QR codes and room URLs are proposed mechanisms, not the purpose.

---

## 8. Cross-cutting traceability problem

### PR-027 — Reconstructing how current state came to be

**Problem**  
Important event state changes over time, and later participants need to reconstruct what earlier actors saw, decided, communicated, or changed rather than seeing only the latest value.

**Why the problem exists**  
Without provenance, current state can be operationally useful but historically inexplicable.

**Evidence**  
IL-017 through IL-020, IL-034, IL-042, IL-051, IL-052.

**Boundary caution**  
The repository currently implements provenance feature-by-feature and plans a broader audit. Later phases must test whether provenance is intrinsic state inside several concepts, a reusable independent concept, synchronization policy, or some combination.

---

## 9. Problem interaction map

The following relationships are intentionally recorded without collapsing the problems:

| Problem interaction | Reason to preserve separation |
|---|---|
| PR-002 change history ↔ PR-005 judgment applicability | A revision can exist even without evaluation; a judgment's applicability is about what it evaluated. |
| PR-004 judgment ↔ PR-006 controlled exposure | Judgment can exist without blind policy; disclosure rules can apply to information beyond scores. |
| PR-004 judgment ↔ PR-007 originator communication | Private reasoning and intended communication have different audiences. |
| PR-008 program choice ↔ PR-009 originator agency | Organizers can select while the originator can later withdraw. |
| PR-010 authority ↔ all consequential actions | Authority constrains who may act but does not define each action's purpose. |
| PR-013 classification ↔ PR-015 vocabulary governance | Associating content with a label is different from governing the label's availability/status. |
| PR-013 classification ↔ PR-016 representation goals | What something is classified as differs from how much of that classification organizers want. |
| PR-008 selection ↔ PR-017 artifact readiness | A selected talk may have unready material. |
| PR-017 artifact readiness ↔ PR-019 public publication | A ready artifact may still be non-shareable. |
| PR-018 scheduling ↔ PR-025 attendee-demand evidence | Demand is a planning input; scheduling allocates scarce place/time. |
| PR-019 public publication ↔ PR-020 historical retention | Different audiences and purposes despite shared “archive” vocabulary. |
| PR-021 communication ↔ PR-027 traceability | Communication history is one provenance source but communication has its own operational purpose. |

---

## 10. Problem confidence and maturity

### High-confidence current/durable problems

PR-001 through PR-022 and PR-027 are supported by implemented behavior and/or explicit historical planning, though some policy details remain open.

### Medium-confidence / future-expansion problems

PR-023 through PR-026 are supported by current or historical roadmap material and should influence boundary design, but they must not be represented as fully shipped product behavior.

---

## 11. Handoff to actor-needs and purposes

The actor-needs inventory maps who experiences each problem and what outcome they require.

The purpose inventory then translates clusters of these problems into solution-neutral statements of why software behavior should exist.

Neither step is permitted to convert problem IDs mechanically into concept IDs.