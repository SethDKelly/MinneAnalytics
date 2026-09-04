# 002-E — Deliverable & Scheduling Execution

Status: **Complete**  
Concept model maturity: **v0 — formal specification in progress**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-G — Discovery Consolidation & Concept Candidate Gate](001-G-discovery-consolidation-and-concept-candidate-gate.md), [002-C](002-C-program-choice-participation-scarcity-and-representation-intent.md), and [002-D](002-D-vocabulary-and-classification.md)

## 1. Purpose

002-E formally specifies:

- [Deliverable](knowledge/concepts/deliverable.md)
- [Schedule](knowledge/concepts/schedule.md)

The canonical concept nodes own current normative purpose, operational principle, abstract state, actions, intrinsic invariants, derived observations, and synchronization boundaries.

This phase record preserves the design decisions, rejected alternatives, implementation-reconciliation observations, deferred synchronization questions, and exit review needed to audit those specifications without creating a second specification layer.

Documentation authority remains governed by [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md), and implementation remains evidence rather than concept authority under [Concept Design Authority](knowledge/rules/concept-design-authority.md).

---

## 2. Entry conditions

Deliverable and Schedule both entered 002-E as admitted Phase 001 concepts.

Phase 001 already established two important separations:

1. artifact readiness is distinct from organizer Selection and from public Publication;
2. scheduling is place/time allocation, distinct from Selection and from scarce commitment Capacity.

The current implementation was consulted only as behavioral evidence. In particular, `DeckStatus`, `DeckFile.version`, file storage metadata, `ScheduleRoom`, `ScheduleSlot`, `SchedulePlacement`, session-slot types, the current grid template, and the auto-generation algorithm were not treated as formal-state templates.

---

## 3. Formal-specification method

Each concept had to demonstrate:

1. independent abstract state and actions;
2. clear treatment of replacement/change over time;
3. intrinsic invariants that protect the concept's purpose without importing workflow policy;
4. explicit separation of authoritative state from generated/advisory state;
5. no automatic promotion of current UI/status enums into conceptual lifecycles;
6. stable boundaries from Selection, Withdrawal, Capacity, Publication, and application authority;
7. enough history to preserve meaning where the accepted purpose requires it, without manufacturing a universal audit log.

The subgroup was tested against two failure modes:

> **A Deliverable must not become “whatever happens after approval,” and Schedule must not become “the whole program execution plan.”**

---

## 4. Deliverable design decisions

### D-002E-01 — Deliverable begins as an explicit requirement

Deliverable is not merely an uploaded file.

A Deliverable first establishes:

- the subject/commitment requiring an artifact;
- the responsible party;
- the required artifact kind/purpose.

This keeps the concept meaningful before any artifact has been provided and allows outstanding requirements to be inspected independently from storage/upload details.

---

### D-002E-02 — Provided artifacts are immutable version records

Each `Provide` action appends an immutable ArtifactVersion and makes it current.

Earlier provided artifacts remain identifiable rather than being overwritten.

The current implementation's versioned `DeckFile` records support this history requirement, but sequential integer version numbers are not intrinsic conceptual state; ordering comes from the predecessor chain.

---

### D-002E-03 — Readiness attaches to the exact ArtifactVersion reviewed

This is the central Deliverable decision.

A readiness determination about artifact version A must not silently apply to replacement version B.

Therefore:

- Assessments reference an exact ArtifactVersion;
- concerns and readiness are preserved against that exact version;
- providing a new ArtifactVersion naturally makes the Deliverable await review again;
- prior readiness remains historical truth about the earlier artifact.

This avoids a separate mutable status becoming detached from the artifact it described.

---

### D-002E-04 — Concern and ready are assessment dispositions, not one broad workflow enum

The formal model does not reproduce `SUBMITTED → REVIEWED → APPROVED/CONCERN` as an intrinsic lifecycle.

Instead:

- provision is represented by ArtifactVersion existence;
- no Assessment means the current artifact awaits review;
- a current `concern` Assessment means the artifact is not ready;
- a current `ready` Assessment means readiness has been established.

The current `REVIEWED` status does not have an independently recovered purpose strong enough to become a conceptual state between those facts.

---

### D-002E-05 — Assessment history is intrinsic where artifact history would otherwise lose meaning

Assessments form an immutable per-ArtifactVersion chain.

This supports scenarios such as:

`concern → corrected review → ready`

without deleting the fact that the earlier concern existed.

The history is concept-local: it is not a replacement for a cross-concept Audit Trail.

---

### D-002E-06 — New provision does not mutate old assessment state

When `Provide` makes a new artifact current, it does not clear or rewrite old Assessment rows.

Current readiness is derived only from the new current ArtifactVersion's Assessment state.

This is preferable to a status reset that destroys why the previous version had been considered ready or concerning.

---

### D-002E-07 — Deliverable does not own Selection eligibility

Current deck upload and review are restricted to approved submissions.

That is an application synchronization/policy rule, not an intrinsic Deliverable precondition.

A Deliverable can exist conceptually for any subject/commitment that the application decides requires an artifact.

Selection may create the requirement, but Deliverable does not know why it exists.

---

### D-002E-08 — Deliverable readiness does not imply Publication

A ready artifact is operationally ready for its intended downstream use.

It is not automatically public.

Publication intent/shareability remains separately governed by [Publication](knowledge/concepts/publication.md).

This preserves the historical distinction between an approved/ready deck and a deck intentionally made available in the public archive.

---

### D-002E-09 — File validation/storage are realization concerns

MIME type, file size, upload path, object storage, opaque download IDs, malware scanning, and transport are not intrinsic Deliverable state.

They may be necessary implementation/security constraints around `Provide`, but the concept operates over an opaque `ArtifactRef`.

---

## 5. Schedule design decisions

### D-002E-10 — Schedule owns explicit schedulable Opportunities

Schedule distinguishes:

- the schedule/context;
- place/time Opportunities;
- the placement relation assigning Activities to Opportunities.

An empty Opportunity exists independently from an activity occupying it.

This separation is conceptually cleaner than treating every place/time cell as a `SchedulePlacement` record whose `submissionId` may be null.

---

### D-002E-11 — Place/time definitions are opaque references

Schedule records the place and time associated with each Opportunity but does not define room-management or calendar/time-interval concepts.

`PlaceRef` and `TimeRef` can refer to application-defined resources such as rooms, stages, online channels, session intervals, or another future scheduling substrate.

Current `ScheduleRoom` and `ScheduleSlot` are possible realization structures, not conceptual types.

---

### D-002E-12 — One activity per Opportunity and one Opportunity per activity are intrinsic

Within one Schedule:

- an activity is placed at most once;
- an Opportunity has at most one activity.

These rules make the placement relation a partial one-to-one assignment and prevent basic double-booking inside a single schedule.

If a future use case requires multiple concurrent activity occupants within one place/time unit, the application can define multiple Opportunities or reopen the model deliberately.

---

### D-002E-13 — Human adjustment is first-class

Schedule formally supports:

- `Place`;
- `Move`;
- `Swap`;
- `Unplace`.

These are not implementation conveniences; they are central to the accepted operational principle that scheduling assistance must remain human-adjustable.

The current placement route's move/swap behavior is therefore useful evidence for the formal action set.

---

### D-002E-14 — Generated schedules are suggestions until explicit placement becomes authoritative

A generation/optimization algorithm does not own Schedule state merely because it computed assignments.

Generated assignments are external suggestions or application-level batch input. They become authoritative only when accepted/applied as explicit Schedule placements.

This keeps technical-variety balancing, attendee-demand weighting, optimization, randomization, and future algorithms replaceable.

**Implementation-reconciliation concern:** the current generation route clears session assignments and directly writes generated placements. Later reconciliation should decide whether production behavior should preserve the stronger planner-control semantics by previewing/applying a generated draft or otherwise making replacement explicit.

---

### D-002E-15 — Schedule does not own Selection or effective participation

Current scheduling only permits approved submissions.

The formal Schedule does not inspect Selection internals.

Application composition supplies eligible ActivityRefs using Selection, Withdrawal, event policy, and potentially other concepts.

If a placed activity later becomes withdrawn or no longer selected, application synchronization may unplace it; Schedule itself does not rewrite Selection/Withdrawal.

---

### D-002E-16 — Schedule Opportunity is not Capacity allocation

A Schedule Opportunity answers:

> Where/when can an activity be placed?

Capacity answers:

> How many scarce commitment units are allocated/remaining?

The number of Opportunities may inform a Capacity pool, but the two concepts remain independent because commitment scarcity can exist before detailed placement and not every Capacity accounting class maps one-to-one to room/time cells.

---

### D-002E-17 — Broader scheduling constraints remain composition inputs

The intrinsic model guarantees basic occupancy consistency only.

Constraints such as:

- presenter travel restrictions;
- attendee demand;
- room size/capabilities;
- technical-level diversity;
- topic conflicts;
- speaker conflicts across multiple activities;
- breaks and special fixed-event blocks;

remain external scheduling inputs/policy until a separately evidenced reusable constraint concept is justified.

This prevents Schedule from becoming a generic constraint-solving god concept.

---

### D-002E-18 — Placement history is not yet intrinsic

Current evidence requires a human-adjustable current Schedule but does not establish an independently user-facing need to reconstruct every past move/swap.

002-E therefore does not manufacture immutable placement-event history.

If later audit/operations requirements make historical schedule reconstruction important, that need can extend Schedule or justify a dedicated history mechanism explicitly.

---

## 6. Cross-concept boundary result

| Concept | Owns | Explicitly does not own |
|---|---|---|
| [Deliverable](knowledge/concepts/deliverable.md) | artifact requirement; immutable provided versions; version-specific readiness assessments/concerns | Selection; Publication; file storage/validation; communication; authorization |
| [Schedule](knowledge/concepts/schedule.md) | scheduling context; place/time Opportunities; current explicit placement relation; place/move/swap/unplace | Selection; Withdrawal; Capacity allocation; Deliverable readiness; generation algorithm; demand/constraint sources |

Both concepts remain independently understandable and operable without direct access to neighboring concept internals.

---

## 7. Implementation-reconciliation observations retained for later

### IR-002E-01 — Current readiness status is stored separately from exact DeckFile version

`DeckFile` records are versioned, but `deckStatus` lives on the broader Submission.

Uploading a new deck resets the status to `SUBMITTED`, which behaviorally reduces stale readiness risk, but the relationship between a particular review decision and a particular file version is implicit rather than explicit.

Formal Deliverable makes that relationship authoritative.

### IR-002E-02 — Current `REVIEWED` status may not represent an independent concept state

The current enum includes `REVIEWED`, but Phase 001/002 purpose evidence only requires provision, concern, and readiness.

Reconciliation should determine whether `REVIEWED` has a distinct user-facing meaning worth preserving as application workflow state or whether it is an implementation-era intermediate status.

### IR-002E-03 — Current concern status lacks durable concern detail in the central deck state

The current deck-status route can set `CONCERN`, but the broad status alone does not encode the concern's content or bind that concern to a specific deck version.

Formal Deliverable supports an Assessment detail and exact ArtifactVersion reference.

### IR-002E-04 — Current upload eligibility couples Deliverable directly to ProgramStatus

Deck upload requires `APPROVED` and rejects withdrawn submissions.

Formal design treats those checks as application composition over Selection/Withdrawal rather than intrinsic Deliverable state.

### IR-002E-05 — Current Schedule persistence conflates Opportunity cells and assignment

`SchedulePlacement` rows exist for `(slot, room)` cells and optionally contain a `submissionId`.

Formal Schedule distinguishes Opportunity from placement. Later implementation may retain the table shape if its semantics remain clear; one-concept/one-table mapping is not required.

### IR-002E-06 — Current placement route already supports human move/swap behavior

The existing placement mutation preserves planner control and maps naturally to formal `Move`, `Swap`, and `Unplace` behavior.

This is strong compatibility evidence rather than a reason to copy route mechanics into the concept.

### IR-002E-07 — Current generation route replaces session assignments directly

Generation currently clears all session placements and writes algorithmic assignments immediately.

The formal model treats generated output as advisory until explicitly applied. Later reconciliation should consider preview/accept behavior, transactional replacement semantics, or another explicit planner-controlled application action.

### IR-002E-08 — Current slot types mix schedulable and fixed operational blocks

Registration, kickoff, breaks, lunch, networking, and session rows currently share `ScheduleSlot` infrastructure.

Formal Schedule does not create intrinsic SlotType semantics. An application may represent fixed blocks as pre-placed activities, non-schedulable calendar structure, constraints, or another appropriate mechanism.

---

## 8. Synchronization signals carried forward

002-E does not yet canonize these synchronizations, but the formal specifications make the likely relationships precise:

1. **Selection → Deliverable** — selected participation may establish an artifact requirement.
2. **Withdrawal → Deliverable policy** — withdrawal may stop reminders/provision/review while preserving Deliverable history.
3. **Deliverable ready → Publication eligibility** — ready artifact may be necessary but not sufficient for publication.
4. **Deliverable outstanding → Dispatch** — reminders/calls may target responsible parties with outstanding requirements.
5. **Selection + Withdrawal → Schedule eligibility** — determine which activities may be placed/remain placed.
6. **Withdrawal/Selection change → Schedule** — may trigger unplacement.
7. **Capacity + Schedule topology** — schedule opportunities may inform capacity configuration or consistency checks without becoming the same state.
8. **Deliverable readiness → Schedule policy** — readiness might be used for scheduling readiness gates if product policy requires it, but no such intrinsic dependency is assumed.
9. **External constraints/demand → scheduling suggestion** — feed generation/ranking strategies rather than Schedule authority.
10. **Generated suggestion → Schedule placement** — requires explicit application acceptance/application semantics.

These should be consolidated in 002-G after the remaining concepts are formally specified.

---

## 9. Rejected concept additions

002-E does not introduce:

- Deck;
- Deck Status;
- File Upload;
- Review Queue;
- Readiness Workflow;
- Room;
- Session Slot;
- Schedule Generator;
- Schedule Conflict;
- Schedule Draft;
- Demand;
- Constraint Engine;
- Program Execution;
- Event Runbook.

Some are implementation structures or strategies; others may become future concepts only if an independently evidenced purpose and lifecycle emerge.

---

## 10. Exit review

### Deliverable

- focused artifact-requirement purpose: **pass**
- immutable replacement/version semantics: **pass**
- version-specific readiness: **pass**
- concern/readiness history: **pass**
- separation from Selection/Publication/storage: **pass**
- implementation-neutral: **pass**

**Result: specified.**

### Schedule

- focused place/time-allocation purpose: **pass**
- complete opportunity/placement actions: **pass**
- human-adjustability preserved: **pass**
- basic occupancy invariants: **pass**
- generation strategy separated from authority: **pass**
- separation from Selection/Withdrawal/Capacity: **pass**
- implementation-neutral: **pass**

**Result: specified.**

---

## 11. 002-E exit decision

**002-E passes.**

The canonical model now distinguishes:

- artifact requirement from file-upload implementation;
- artifact version from readiness assessment;
- readiness from public publication;
- place/time opportunity from actual placement;
- explicit planner-controlled schedule state from generated suggestions;
- scheduling opportunity from commitment Capacity;
- intrinsic occupancy correctness from application-specific scheduling constraints.

No application/domain refactoring is authorized by this phase.

The next subgroup is **002-F — Publication, Dispatch & Historical Closure**.