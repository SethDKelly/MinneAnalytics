# 001-D Evidence — Composition Signals & Explicit Non-Concepts

Status: **Complete for 001-D candidate baseline**  
Concept model maturity: **v0 — discovery**  
Purpose: identify likely application synchronizations/policies and explicitly prevent implementation/context nouns from re-entering the candidate set as accidental concepts.

## 1. Interpretation

Concept Design separates independently understandable concepts from the application-specific rules that compose them.

001-D does **not** yet define canonical synchronizations. It records composition signals so 001-E can test concept independence without forcing related behaviors into one concept merely because MinneAnalytics coordinates them.

A composition signal means:

> “These candidate concepts probably interact in MinneAnalytics, but the interaction is not evidence that they are one concept.”

---

## 2. High-confidence composition signals

### CS-001 — Proposal creation may establish initial Revision history

**Candidates:** CC-001 Proposal ↔ CC-002 Revision.

**Observed intent:** offered content has a stable current form and later immutable revision lineage.

**Composition signal:** creating a Proposal may synchronize to create/recognize its initial Revision state. Later revisions may synchronize the Proposal's current content/reference.

**Boundary protection:** Proposal must not need to contain revision mechanics in order to exist.

---

### CS-002 — A new Revision can make prior Evaluations non-current without deleting them

**Candidates:** CC-002 Revision ↔ CC-003 Evaluation.

**Observed intent:** old scores remain historical but strict current-version aggregate uses only evaluations of the current revision.

**Composition signal:** when Revision advances, application policy can classify Evaluations referring to earlier revisions as non-current for present aggregation and surface renewed evaluation work.

**Boundary protection:** Revision does not own evaluation values; Evaluation does not own version history.

---

### CS-003 — Disclosure policy can depend on Evaluation state

**Candidates:** CC-003 Evaluation ↔ CC-004 Disclosure.

**Observed intent:** aggregate scores remain hidden until the viewer records an independent judgment; identity may be hidden by default and explicitly revealed.

**Composition signal:** an Evaluation action may change what Disclosure permits for that actor/subject/context.

**Boundary protection:** completing an Evaluation does not inherently reveal anything in the Evaluation concept itself.

---

### CS-004 — Feedback may create application-specific revision opportunity

**Candidates:** CC-005 Feedback ↔ CC-002 Revision ↔ CC-008 Availability Window?/CC-009 Authorization?.

**Observed intent:** committee feedback may permit or motivate presenter edits even after ordinary submission timing.

**Composition signal:** receipt/existence of eligible Feedback may create an exception or availability condition for Revision actions.

**Boundary protection:** Feedback does not own revision state, and Revision does not need to know why editing is permitted.

---

### CS-005 — Selection and Retraction jointly determine effective participation

**Candidates:** CC-006 Selection ↔ CC-007 Retraction.

**Observed intent:** a proposal may be selected and later withdrawn by its originator.

**Composition signal:** application views such as “currently participating selected sessions” may require both:

- Selection indicates organizer inclusion;
- no effective Retraction indicates continuing originator participation.

**Boundary protection:** neither concept overwrites the other's historical truth.

---

### CS-006 — Capacity informs and reacts to Selection

**Candidates:** CC-011 Capacity ↔ CC-006 Selection.

**Observed intent:** program decision makers reason about remaining capacity while accepting candidates; different classes may count differently.

**Composition signal:** Selection changes may synchronize capacity consumption/release, while Capacity state informs but does not perform Selection.

**Boundary protection:** capacity saturation does not automatically equal rejection unless explicit application policy later chooses that behavior.

---

### CS-007 — Coverage observes Selection/classification without making the decision

**Candidates:** CC-010 Coverage ↔ CC-006 Selection ↔ CC-012 Classification.

**Observed intent:** theme/technicality composition informs human program choice; target exceedance warns rather than automatically blocks.

**Composition signal:** selected items and their classifications/attributes contribute to observed Coverage. Coverage gaps/excess can be shown during Selection.

**Boundary protection:** Coverage cannot silently become an automatic selection engine.

---

### CS-008 — Vocabulary determines which terms are available for new Classification

**Candidates:** CC-013 Vocabulary ↔ CC-012 Classification.

**Observed intent:** retired terms disappear from future pickers but remain associated historically with existing talks.

**Composition signal:** Vocabulary availability constrains creation/change of Classification associations; retirement does not erase existing classifications.

**Boundary protection:** Classification can retain a historical association even when Vocabulary no longer offers the term for new use.

---

### CS-009 — Selection may create downstream Deliverable expectations

**Candidates:** CC-006 Selection ↔ CC-014 Deliverable.

**Observed intent:** presentation deck upload becomes relevant after talk approval.

**Composition signal:** selecting a proposal may establish/request a required Deliverable or make an existing deliverable requirement active.

**Boundary protection:** Selection remains valid independently of whether the Deliverable is later ready.

---

### CS-010 — Deliverable readiness can participate in Publication eligibility

**Candidates:** CC-014 Deliverable ↔ CC-016 Publication.

**Observed intent:** public slide archive includes only appropriate/approved/shareable material.

**Composition signal:** Publication eligibility may require a ready Deliverable plus separate sharing/publication intent.

**Boundary protection:** “ready” and “publicly shareable” remain different facts.

---

### CS-011 — Schedule eligibility depends on program participation, not vice versa

**Candidates:** CC-015 Schedule ↔ CC-006 Selection ↔ CC-007 Retraction.

**Observed intent:** approved sessions are scheduled; withdrawn sessions should not remain effective scheduled participants.

**Composition signal:** application policy determines which selected/non-retracted subjects are schedulable. Schedule placement does not establish Selection.

**Boundary protection:** unscheduling a session must not implicitly decline it unless explicit policy says so.

---

### CS-012 — Availability Window can govern Proposal and Revision actions

**Candidates:** CC-008 Availability Window? ↔ CC-001 Proposal/CC-002 Revision.

**Observed intent:** submission windows and edit timing govern whether actions are ordinarily available.

**Composition signal:** window state can enable/disable actions without owning the action's behavior.

**Boundary protection:** expiration of a window does not delete or close the Proposal/Revision history.

---

### CS-013 — Authorization gates consequential actions across concepts

**Candidate:** CC-009 Authorization? composed with many candidates.

**Observed intent:** evaluation, selection, artifact review, scheduling, publication, administration, and archive operations have different authority scopes.

**Composition signal:** concept actions may require an authorization predicate scoped to actor/context/action.

**Boundary protection:** organizational role names must not be baked into the governed concepts.

---

### CS-014 — Archive state can gate ordinary mutation without owning every concept's lifecycle

**Candidates:** CC-017 Archive composed with active concept actions.

**Observed intent:** archived conferences remain historically inspectable while ordinary mutations stop.

**Composition signal:** transition to Archive may disable/suppress ordinary mutation synchronizations across the event context.

**Boundary protection:** Archive does not absorb Proposal, Selection, Schedule, Communication, etc. into one conference lifecycle.

---

### CS-015 — Communication eligibility may be derived from other concept state

**Candidates:** CC-018 Communication? with CC-006 Selection, CC-014 Deliverable, CC-020 Obligation?, CC-017 Archive, etc.

**Observed intent:** decline messages target declined candidates; deck calls target eligible selected sessions; attendee reminders depend on recipient state.

**Composition signal:** recipient eligibility can be synchronized/derived from relevant application facts without those facts becoming Communication state.

**Boundary protection:** Selection must not contain email/send history, and Communication must not own program decisions.

---

### CS-016 — External sources synchronize into the concepts that own the behavior

**Candidates:** CC-020 Obligation?, CC-015 Schedule, CC-011 Capacity and future attendee concepts.

**Observed/future intent:** registration systems and Sched may be authoritative for registration, attendance, waitlists, and demand.

**Composition signal:** adapters/synchronizations translate authoritative external facts into the relevant concept/application state while preserving source provenance.

**Boundary protection:** provider/API identity does not define a concept boundary.

---

### CS-017 — Export projects state without becoming source-of-truth

**Candidate:** CC-019 Export? composed with many source concepts.

**Observed intent:** CSV/reporting output carries state/history into external workflows.

**Composition signal:** Export reads/projectively represents selected concept state at a point/context.

**Boundary protection:** changing an exported representation does not itself change source concept state unless an explicit future import concept exists.

---

### CS-018 — Audit Trail may observe consequential actions without replacing concept histories

**Candidate:** CC-021 Audit Trail?.

**Observed/future intent:** feature-specific histories exist; future append-only committee activity audit is planned.

**Composition signal:** consequential actions in concepts may synchronize to append an audit event.

**Boundary protection:** Audit Trail cannot become the only place Revision, Communication, Vocabulary, etc. store history required for their own semantics.

---

## 3. Application policy signals that should not become concepts automatically

### AP-001 — Strict current-version aggregate

Current policy: only evaluations referring to the current revision participate in aggregate score.

**Classification:** synchronization/application policy among Revision + Evaluation + aggregate representation.

Not a concept merely because it is important.

### AP-002 — Needs-score / needs-rescore queues

These queues represent derived work views based on Evaluation and Revision state.

**Classification:** workflow/view representation.

Not a concept.

### AP-003 — Bias-reduced review enabled/disabled

The conference setting determines whether certain Disclosure synchronizations/policies apply.

**Classification:** application policy/configuration.

Not automatically the Disclosure concept itself.

### AP-004 — Approved proposals locked from editing

Current demo behavior is intentionally incomplete; roadmap allows board unlock.

**Classification:** current application policy, not a Revision invariant.

### AP-005 — Target exceedance is advisory

Coverage information currently warns rather than automatically preventing Selection.

**Classification:** application decision-support policy.

### AP-006 — Sponsor/community accounting rule

Sponsor-classified sessions affect current capacity accounting differently.

**Classification:** current Capacity classification/accounting policy; no Sponsor concept inferred.

### AP-007 — Schedule generation heuristic

Technical-level variety currently informs auto-generation; future attendee demand may also inform it.

**Classification:** replaceable scheduling strategy, not Schedule concept state by default.

### AP-008 — Public archive eligibility rules

Current eligible public materials depend on selected/readied/shareable state.

**Classification:** Publication synchronization policy across relevant concepts.

### AP-009 — Communication recipient rules

Specific templates map to specific eligible audiences and rounds.

**Classification:** Communication/application policy, unless later criteria establish independent recipient-rule concepts.

---

## 4. Explicit non-concept register

The following terms/artifacts are **not** 001-D candidates unless a later phase produces a new focused purpose that justifies them.

### NC-001 — `Conference`

Current role: event/scoping/context aggregate.

**Why not a candidate:** it currently anchors many unrelated behaviors and has no singular purpose established by 001-C.

A future focused Event concept is not prohibited, but a “Conference contains everything” concept is rejected.

---

### NC-002 — `Submission`

Current role: implementation aggregate/domain noun.

**Why not a candidate:** responsibilities decompose across Proposal, Revision, Selection, Retraction, Classification, Capacity class, Obligation, Deliverable, etc.

---

### NC-003 — `Program`

Current role: broad product/UI language for selected sessions, capacity, balance, history, communications, etc.

**Why not a candidate:** “build/manage the program” is a compound workflow, not one focused purpose.

---

### NC-004 — `Reviewer` / `Presenter` / `Board` / `Chair` / `Admin`

Current role: actor/organizational labels.

**Why not candidates:** actors participate in concepts; role names are not units of behavior.

---

### NC-005 — `Theme`

Current role: implementation term/table.

**Why not a candidate:** decomposed into Vocabulary term lifecycle, Classification association, and Coverage target/assessment.

---

### NC-006 — `Score`

Current role: numeric evaluation representation.

**Why not a candidate:** candidate is Evaluation; numeric scale/value is one representation of judgment.

---

### NC-007 — `ProgramStatus`

Current role: mixed enum.

**Why not a candidate:** conflates organizer Selection, originator Retraction, and undecided/current derived states.

---

### NC-008 — `AbstractReviewStatus`

Current role: demo workflow enum.

**Why not a candidate:** history explicitly documents simplification; constituent needs distribute across Revision, Feedback, Evaluation applicability, and unresolved acknowledgement workflow.

---

### NC-009 — `DeckStatus`

Current role: current readiness-state representation.

**Why not a candidate:** candidate is Deliverable; enum does not define the concept boundary.

---

### NC-010 — “Blind Review”

Current role: configured review experience/policy.

**Why not a candidate:** candidate hypothesis is more generic Disclosure; full conflict handling remains separate future intent.

---

### NC-011 — “Rescore Queue” / “Needs Score”

Current role: derived workflow views.

**Why not candidates:** they are representations of Evaluation + Revision/application policy.

---

### NC-012 — “Heatmap”, “Balance Chart”, “Gap Panel”, “Capacity Widget”

Current role: UI representations.

**Why not candidates:** underlying candidate purposes are Coverage and Capacity.

---

### NC-013 — `ChairDashboard`, `ReviewPanel`, `AdminDashboard`, `ScheduleBuilder`

Current role: UI composition surfaces.

**Why not candidates:** each combines multiple independent behaviors for workflow efficiency.

---

### NC-014 — routes and APIs

Examples: `/review`, `/chair`, `/admin`, `/presenter`, `/api/scores`, `/api/chair/*`.

**Why not candidates:** engineering/presentation boundaries.

---

### NC-015 — opaque token / SSO mechanism

Current/future role: authentication realization.

**Why not candidates:** establishes actor identity/session; does not define behavioral concepts.

---

### NC-016 — `Sponsor`

Current role: session classification affecting capacity accounting.

**Why not a candidate:** current evidence does not establish an independent sponsorship-management purpose.

If future commerce/sponsor-management requirements emerge, concept discovery can revisit.

---

### NC-017 — `TechnicalLevel`

Current role: descriptive attribute/dimension used by scheduling and coverage analysis.

**Why not a candidate:** no independent purpose established; may serve as a classification/dimension input.

---

### NC-018 — `VIP Registration`

Current role: specific downstream operational checkpoint.

**Why not the final candidate name:** CC-020 Obligation deliberately generalizes the underlying completion-state problem while preserving registration as an instance.

---

### NC-019 — CSV

Current role: export format.

**Why not a candidate:** CC-019 Export, if it survives, is format-independent.

---

### NC-020 — `EmailTemplate`, `ConferenceEmailBatch`, `EmailSendRecord`

Current role: implementation structures within operational communication.

**Why not automatically separate candidates:** CC-018 Communication carries an explicit one-vs-two concept split test; storage tables do not resolve it.

---

### NC-021 — public “slide archive” as `Archive`

Current role: product wording.

**Why not one Archive concept:** public slide access maps to Publication; internal completed-event retention maps to CC-017 Archive.

---

### NC-022 — integration providers

Examples: Sched, Eventbrite, Cvent, SendGrid, SES.

**Why not candidates:** provider-specific engineering/external systems. Durable behavioral facts are owned elsewhere.

---

## 5. Composition-quality guardrails for 001-E

001-E should treat the candidate decomposition as suspect if it requires any candidate to:

1. directly reach into another candidate's internal state rather than compose through synchronization;
2. know MinneAnalytics role names merely to define its purpose;
3. embed `Conference`, `Submission`, or current enum structure to remain understandable;
4. encode a current UI tab/route as part of its operational principle;
5. absorb a neighboring purpose solely because the current implementation stores the data together;
6. create a “manager,” “workflow,” or “program” concept whose purpose is only coordinating other concepts;
7. depend on provider/framework/storage choices;
8. use Audit Trail as a substitute for history intrinsic to correct concept behavior.

---

## 6. Result

The preferred 001-D decomposition expects MinneAnalytics to be understood as **composition of independent behavioral concepts**, with the conference workflow arising from synchronizations/policies such as those above.

This is intentionally different from the current implementation's aggregate/page/status organization.

The synchronization signals are inputs to later concept specification/composition work; they are not canonical synchronization definitions yet.
