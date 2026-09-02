# 001-D Evidence — Concept Boundary Hypotheses

Status: **Complete for 001-D candidate baseline**  
Concept model maturity: **v0 — discovery**  
Purpose: record the split/merge/composition hypotheses that justify the 001-D candidate set and define what 001-E must challenge.

## 1. Interpretation

A boundary hypothesis is not a final design decision.

Each hypothesis states:

1. the behavioral concerns under comparison;
2. the preferred 001-D decomposition;
3. why that decomposition currently fits the evidence;
4. the strongest alternative;
5. what 001-E must test before the boundary can survive.

The primary bias to avoid is replacing implementation coupling with conceptual coupling. If two behaviors interact heavily but have independent purposes, the first question is whether a **synchronization** can compose them rather than whether they should become one concept.

---

## 2. Candidate-content boundaries

### BH-001 — Proposal and Revision remain separate

**Concerns**  
PU-001 durable offered subject; PU-002 mutable-content history.

**Preferred hypothesis**  
`Proposal` and `Revision` are independent candidates.

**Reasoning**

A proposal can exist and be acted upon without ever being revised. Revision solves a separate change-over-time problem and may be reusable for other mutable subjects.

The existing implementation stores live proposal content and revision metadata together, but that realization does not create one purpose.

**Likely composition**

A Proposal may synchronize with Revision so a newly created proposal establishes an initial revision and a later revision becomes the Proposal's current content.

**Strongest alternative**  
Revision is merely intrinsic history within Proposal and does not deserve independent concept status.

**001-E test**  
Can Revision state/actions and an operational principle be explained without requiring Proposal-specific semantics?

---

### BH-002 — Change eligibility should not be embedded wholesale in Revision

**Concerns**  
PU-003 change governance; CC-002 Revision; CC-008 Availability Window; CC-009 Authorization; selection/feedback/event policy.

**Preferred hypothesis**  
Revision owns **how change is preserved**, not all reasons a change is currently permitted.

Change eligibility is composed from:

- time availability;
- delegated authority;
- the subject's application state;
- explicit policy such as feedback-driven or board-unlocked edits.

**Reasoning**

A versioning concept becomes less generic if it contains conference-specific rules such as `PENDING` may edit, `APPROVED` may not unless unlocked, CFP-close exceptions, or board feedback state.

**Strongest alternative**  
A single Revision concept includes its own complete edit-policy state machine.

**001-E test**  
Can Revision remain complete if permission is external, and can Availability/Authorization or synchronization express the missing policy without creating hidden direct dependencies?

---

### BH-003 — Revision acknowledgement remains unresolved workflow behavior

**Concerns**  
Board “mark revision reviewed,” evaluator freshness, revision state.

**Preferred hypothesis**  
Do not create an `Acknowledgement` concept and do not place acknowledgment automatically inside Evaluation or Revision yet.

**Reasoning**

The historical evidence does not establish one singular purpose. The action may mean “noticed,” “reviewed,” “workflow cleared,” or “accepted without requiring every evaluator to rescore.”

**Strongest alternative**  
Acknowledgement is an action of Revision indicating organizational review completion.

**001-E test**  
Determine whether a user-recognizable purpose exists independently of the current `AbstractReviewStatus` workflow.

---

## 3. Evaluation, applicability, and disclosure boundaries

### BH-004 — Evaluation and evaluation applicability remain distinct

**Concerns**  
PU-004 independent judgment; PU-005 applicability after subject change.

**Preferred hypothesis**  
`Evaluation` is a concept; “current applicability” is primarily synchronization/policy between Evaluation and Revision.

**Reasoning**

An evaluation remains a historically meaningful judgment even after becoming stale. The product's strict-current aggregate rule concerns **how an application uses evaluations in relation to current revisions**, not whether the old evaluation ceases to exist.

**Likely composition**

```text
Revision advances current version
        ↓ synchronization/policy
Evaluations referring to earlier versions remain historical
but no longer participate in current aggregate
        ↓
Evaluator may be surfaced for renewed Evaluation
```

**Strongest alternative**  
An independent `Applicability` or `Validity` concept owns the relationship between judgments and changing subjects.

**001-E test**  
Does applicability have enough independent state/actions and purpose to exist without merely relating Revision and Evaluation?

---

### BH-005 — Evaluation and Disclosure remain separate

**Concerns**  
PU-004 judgment; PU-006 controlled exposure.

**Preferred hypothesis**  
`Evaluation` and `Disclosure` are independent candidates composed by review policy.

**Reasoning**

Evaluation answers “what is my judgment?” Disclosure answers “what information may I see now?” A conference can disable bias-reduced review without removing evaluation behavior. Explicit identity reveal also demonstrates Disclosure actions that do not create or change the judgment.

**Strongest alternative**  
Blindness is simply an Evaluation mode and Disclosure has no independent concept purpose.

**001-E test**  
Can Disclosure's operational principle be stated generically enough to be independently useful, without becoming generic access control?

---

### BH-006 — Disclosure must not absorb conflict/recusal

**Concerns**  
Current explicit identity reveal; future COI registry.

**Preferred hypothesis**  
Keep future conflict declaration/exclusion outside Disclosure until a separate purpose/concept is justified.

**Reasoning**

Seeing identity and declaring a conflict are not the same behavior. A conflict may be known through other means, and a disclosure may occur for reasons unrelated to conflict.

**Strongest alternative**  
A broader “Impartial Review” concept combines disclosure, conflicts, and evaluator exclusion.

**001-E test**  
Use future intent to test Disclosure genericity, but do not invent missing current behavior merely to create a broader concept.

---

### BH-007 — Feedback is tentatively generic across actor pairs

**Concerns**  
PU-007 committee→originator feedback; future PU-025 attendee→organizer session response.

**Preferred hypothesis**  
One generic `Feedback` candidate can represent intentional response about a subject from a source to an intended recipient/audience.

**Reasoning**

Both needs contain the same behavioral essence:

- a source experiences/reviews a subject;
- the source intentionally records a response about that subject;
- another actor is the intended consumer of the response;
- the response remains distinct from private evaluator context.

Differences in who may submit, anonymity, rating shape, timing, and visibility may be application policy or specializations rather than concept boundaries.

**Strongest alternative**  
`Review Feedback` and `Audience Feedback` are separate concepts because their operational principles, recipient semantics, and data shape differ substantially.

**001-E test**  
Attempt one operational principle that feels natural for both. If the result becomes vague or requires branches for each actor pair, split.

---

## 4. Program decision and participation boundaries

### BH-008 — Selection and Retraction require independent histories

**Concerns**  
PU-008 organizer choice; PU-009 originator agency.

**Preferred hypothesis**  
`Selection` and `Retraction` are independent concepts.

**Reasoning**

The organizer can truthfully have selected a proposal while the originator later truthfully retracted participation. These facts:

- are established by different actors;
- answer different questions;
- can occur at different times;
- remain historically meaningful together.

A single `ProgramStatus` that overwrites `APPROVED` with `WITHDRAWN` risks flattening those independent histories.

**Likely composition**

Application availability/effective participation may be derived from both Selection and Retraction without either concept rewriting the other's history.

**Strongest alternative**  
One unified participation lifecycle is simpler and sufficient.

**001-E test**  
Try to state a singular purpose and operational principle for a unified lifecycle without weakening either organizer decision history or originator agency.

---

### BH-009 — Selection, Coverage, and Capacity remain separate

**Concerns**  
PU-008 choice; PU-011/012 composition; PU-013 capacity.

**Preferred hypothesis**  
`Selection`, `Coverage`, and `Capacity` are distinct candidates composed in the program-building experience.

**Reasoning**

- Selection records consequential inclusion decisions.
- Coverage expresses/assesses representation goals.
- Capacity represents scarcity and remaining room for commitments.

Coverage and capacity inform Selection but do not themselves choose.

**Strongest alternative**  
A broad `Program` concept owns candidates, decisions, targets, counts, and capacity.

**001-E test**  
Reject any broad Program candidate unless it can articulate one focused purpose rather than “everything needed to build the program.”

---

### BH-010 — Capacity is not Schedule capacity

**Concerns**  
Program slot accounting versus room/time opportunities.

**Preferred hypothesis**  
`Capacity` represents scarce commitment capacity; `Schedule` represents allocation to actual place/time opportunities.

**Reasoning**

The current product can reason about how many community/sponsor sessions may be accepted before those sessions are assigned to rooms/times. Scheduling has richer spatial/temporal constraints and placement actions.

**Strongest alternative**  
Schedule opportunities are the only real capacity, so one concept should own both.

**001-E test**  
Determine whether Capacity has an independent operational principle that remains meaningful before a schedule exists.

---

## 5. Availability and authority boundaries

### BH-011 — Availability Window is a candidate, not yet a certainty

**Concerns**  
Submission windows, editing windows, future deadlines.

**Preferred hypothesis**  
Carry `Availability Window` into 001-E as a provisional concept.

**Reasoning**

A time-bounded opportunity is visible to users and can govern multiple actions without owning those actions. It has plausible reusable state/actions: define interval, open/close, answer current availability.

**Strongest alternative**  
Window data is configuration on each governed concept and has no independent operational principle.

**001-E test**  
Test whether a user can understand/use Availability Window independently, and whether genericity adds value rather than abstraction for abstraction's sake.

---

### BH-012 — Authorization is distinct from authentication but may still be policy

**Concerns**  
PU-010 delegated responsibility; token/SSO implementation.

**Preferred hypothesis**  
Carry `Authorization` as a provisional concept while explicitly excluding authentication/session mechanism.

**Reasoning**

The behavioral distinction among “may evaluate,” “may approve,” “may review deliverables,” “may schedule,” “may publish,” and “may administer” survives a change from token URLs to SSO.

**Strongest alternative**  
Authorization is an application-wide policy layer with no independent user-facing concept state/actions.

**001-E test**  
Can users/admins meaningfully inspect, grant, revoke, or understand authority independent of the actions being governed? If not, demote from concept to policy/synchronization.

---

### BH-013 — Edit permission composes Revision, Availability, Authorization, and application state

**Concerns**  
Current/future edit rules for pending, backup, approved, feedback-driven, and closed-window cases.

**Preferred hypothesis**  
No `EditStatus` or `Mutability` concept.

A rule may resemble:

```text
Revision requested
  AND governed action is temporally available or explicitly excepted
  AND actor is authorized for the path they are using
  AND application-specific subject state permits the change
→ allow Revision action
```

**Reasoning**

This keeps conference policy out of Revision and prevents the current `AbstractReviewStatus` enum from becoming conceptual authority.

**Strongest alternative**  
A dedicated Change Request/Unlock concept is needed for exceptional post-selection edits.

**001-E test**  
Future approved-talk unlock may reveal a real concept if users explicitly request/grant one-time change authorization rather than merely satisfy a policy predicate.

---

## 6. Classification, vocabulary, and coverage boundaries

### BH-014 — Classification and Vocabulary remain separate

**Concerns**  
PU-014 item association; PU-015/016 shared-term creation/governance.

**Preferred hypothesis**  
`Classification` and `Vocabulary` are independent candidates.

**Reasoning**

A term can exist in a vocabulary without being applied to any particular proposal, and a proposal's classification remains historically meaningful even after the vocabulary term is retired from future use.

**Likely composition**

Vocabulary supplies currently usable terms; Classification associates subjects with them. Retirement affects future association eligibility without erasing historical associations.

**Strongest alternative**  
A single Tagging/Taxonomy concept owns terms and assignments.

**001-E test**  
Determine whether the merged concept would still have one focused purpose rather than “manage tags and tag things.”

---

### BH-015 — Vocabulary extension and governance tentatively belong together

**Concerns**  
PU-015 decentralized term contribution; PU-016 steward moderation.

**Preferred hypothesis**  
One `Vocabulary` concept includes creation/proposal plus rename, recognition, retirement, and restoration.

**Reasoning**

These actions all govern the lifecycle of reusable vocabulary entries and share a single durable purpose: keep a shared vocabulary expressive and governable over time.

Different actors performing different actions is not by itself evidence of different concepts; Authorization can constrain actions.

**Strongest alternative**  
A `Suggestion`/`Contribution` concept represents participant proposals, synchronized into a separately governed Vocabulary.

**001-E test**  
Can the Vocabulary operational principle naturally tell the story of participant-created terms and steward moderation without the contribution portion feeling bolted on?

---

### BH-016 — Coverage tentatively combines target and assessment

**Concerns**  
PU-011 desired composition; PU-012 observed composition.

**Preferred hypothesis**  
One `Coverage` candidate owns desired representation and comparison to observed representation.

**Reasoning**

A coverage target is primarily useful because actual composition can be compared against it. Conversely, composition counts become more decision-relevant when interpreted against desired representation.

**Strongest alternative**  
Two concepts:

- `Target` — desired representation/range.
- `Composition` or `Measure` — observed distribution/assessment.

**001-E test**  
Test whether either half remains independently useful and complete in common workflows. If users routinely inspect composition with no target or define targets without measurement, split may be stronger.

---

### BH-017 — Coverage is dimension-generic, not Theme-specific

**Concerns**  
Theme coverage and technicality balance.

**Preferred hypothesis**  
Coverage should be parameterized by a dimension/classification rather than defined around “theme.”

**Reasoning**

The application already uses two dimensions—theme and technical level—for a similar collection-composition need. Future dimensions should not require new concepts.

**Strongest alternative**  
Theme targets are conceptually different from technicality distribution because only themes currently have explicit min/max values.

**001-E test**  
Determine whether the same state/actions can express both without losing useful semantics.

---

## 7. Downstream execution boundaries

### BH-018 — Selection and Deliverable remain separate

**Concerns**  
Accepted session versus required presentation material/readiness.

**Preferred hypothesis**  
`Deliverable` is independent and synchronized to Selection when application policy requires selected presenters to provide an artifact.

**Reasoning**

A session can be selected before a deck exists. The deck can later be submitted, reviewed, or have concerns without changing the original selection decision.

**Strongest alternative**  
Deck readiness is simply a phase of selected-session lifecycle.

**001-E test**  
Try to define Deliverable for other required artifacts or obligations; if coherent, independence strengthens.

---

### BH-019 — Deliverable readiness and Publication remain separate

**Concerns**  
Material ready/approved versus public shareability.

**Preferred hypothesis**  
`Deliverable` establishes readiness; `Publication` establishes intentional public exposure.

**Reasoning**

Ready material may remain private/non-shareable. Publication may require both readiness and separate sharing intent.

**Likely composition**

```text
Deliverable is ready
AND item/collection is shareable
AND organizer publishes
→ material becomes publicly available
```

**Strongest alternative**  
“Approved deck” inherently means publishable.

**001-E test**  
Historical per-session non-shareable behavior should falsify the alternative unless a stronger singular purpose emerges.

---

### BH-020 — Schedule remains independent from its heuristics and external inputs

**Concerns**  
Current technical-variety generation; future attendee demand/waitlist input.

**Preferred hypothesis**  
`Schedule` owns placement state/actions; generation heuristics and external demand facts inform but do not define it.

**Reasoning**

The durable actions—place, move, swap, unplace, detect constraints—remain stable whether suggestions are based on technicality, attendee demand, room capacity, or future algorithms.

**Strongest alternative**  
Scheduling concept includes optimization objectives as intrinsic state.

**001-E test**  
Keep optimization goals outside unless the concept cannot explain why generated suggestions exist without them.

---

### BH-021 — Publication and Archive remain separate despite shared historical terminology

**Concerns**  
Public post-event materials versus internal read-only completed-event state.

**Preferred hypothesis**  
`Publication` and `Archive` are independent concepts.

**Reasoning**

They differ in:

- audience (public vs authorized internal);
- subject (shareable materials vs event working context);
- purpose (exposure vs retained institutional history);
- mutability semantics.

**Strongest alternative**  
One Archiving concept handles both preservation and public exposure.

**001-E test**  
A unified operational principle should be rejected if it requires two unrelated meanings of “archive.”

---

## 8. Communication and representation boundaries

### BH-022 — Communication remains one candidate with an explicit split test

**Concerns**  
Reusable templates versus audience resolution/performed sends/history.

**Preferred hypothesis**  
Carry one `Communication` candidate into 001-E because the user workflow is strongly end-to-end: choose communication intent, preview audience/content, send, preserve history, repeat in later rounds.

**Strongest alternative**

- `Message Template` — reusable content definition.
- `Dispatch`/`Campaign` — recipient resolution and performed-send history.

**Reasons the split may win**

- templates can exist before any conference/send;
- performed sends have per-event history and dedupe semantics independent of template editing;
- different actors may manage templates versus sends.

**Reasons the merge may win**

- current user-facing purpose is repeatable operational communication, and template definition may be incomplete/use-less without send behavior;
- separate concepts could add ceremony without meaningful independence.

**001-E test**  
Apply completeness and operational-principle tests to both alternatives.

---

### BH-023 — Review Feedback and Communication remain separate

**Concerns**  
CC-005 Feedback; CC-018 Communication.

**Preferred hypothesis**  
Feedback is subject-specific interpersonal/role-directed response; Communication is an operational audience action with eligibility, batch/round, and dedupe semantics.

**Reasoning**

The fact that both may ultimately use email transport is implementation coincidence. Their purposes, audiences, recurrence, and confidentiality differ.

**Strongest alternative**  
One Messaging concept subsumes both.

**001-E test**  
A broad Messaging concept should fail specificity if it cannot explain why private evaluation feedback and decline campaigns have different behavioral obligations.

---

### BH-024 — Export may be a concept or an affordance

**Concerns**  
PU-022 portable representation.

**Preferred hypothesis**  
Carry `Export` provisionally rather than distributing the purpose immediately into every other concept.

**Reasoning**

Users recognize export as a coherent action: choose/scope state and produce a portable representation. The roadmap's reporting API suggests the underlying need persists beyond CSV.

**Strongest alternative**  
Each owning concept exposes representations, and no independent Export state/actions are needed.

**001-E test**  
Does Export need durable conceptual state/history of its own? If it is only a stateless projection action, it may not warrant independent concept status.

---

## 9. External facts, obligations, and provenance boundaries

### BH-025 — Obligation is independent from where fulfillment truth comes from

**Concerns**  
PU-023 downstream obligation state; PU-024 externally authoritative facts.

**Preferred hypothesis**  
`Obligation` owns required/satisfied/outstanding semantics. External source synchronization may update the fulfillment fact without defining the concept.

**Reasoning**

VIP registration can be tracked manually today and externally tomorrow while the user need—know whether a selected participant fulfilled the requirement—remains the same.

**Strongest alternative**  
Registration is a specialized external-system mirror rather than an internal concept.

**001-E test**  
Generalize to other downstream requirements. If the same operational principle holds, Obligation strengthens.

---

### BH-026 — No standalone External System concept yet

**Concerns**  
PU-024 external authority/provenance.

**Preferred hypothesis**  
Treat integrations as synchronizations/adapters into concepts that own the relevant behavior.

**Reasoning**

Users care that registration, attendance, waitlist, or room-demand facts are trustworthy and correctly incorporated; they do not necessarily need a generic user-facing “external fact” concept.

**Strongest alternative**  
A `Source`/`Authority` concept explicitly models origin and ownership of facts across systems.

**001-E test**  
Do not create the concept unless user workflows require inspecting/changing source authority itself rather than merely seeing provenance.

---

### BH-027 — Provenance requires a dual-layer hypothesis

**Concerns**  
PU-026; Revision history; Evaluation version context; Vocabulary retirement; Communication send history; event Archive; future activity audit.

**Preferred hypothesis**  
Use two layers:

1. **Intrinsic historical truth belongs to the concept whose behavior creates it.**
   - Revision owns revision sequence.
   - Evaluation owns the judgment and its subject reference.
   - Vocabulary owns term retirement/history necessary to interpret terms.
   - Communication owns performed-send history needed for dedupe and accountability.
2. **A future Audit Trail concept may record cross-concept consequential activity** for organizational reconstruction without replacing those intrinsic histories.

**Reasoning**

A single global Audit Trail cannot substitute for concept state needed to make each behavior work correctly. Conversely, feature-specific histories alone may not satisfy the planned organization-wide audit view.

**Strongest alternatives**

- all history belongs in one Audit concept;
- Audit is never a concept and provenance is solely a design tenet.

**001-E test**  
Keep CC-021 exploratory unless a complete user-facing audit operational principle can be stated from current/future evidence.

---

## 10. Context objects and inherited nouns explicitly denied automatic concept status

### BH-028 — `Conference` is application context, not a candidate concept by default

**Preferred hypothesis**  
A conference/event scopes many concept instances and synchronizations but currently lacks one focused purpose that would justify a broad `Conference` concept containing all behavior.

**Reasoning**

The current Conference record accumulates lifecycle, windows, blind-review policy, capacity, themes, communication, schedule, publication, and history. That is a scoping/implementation signal, not singularity.

**001-E test**  
A narrower Event/Occurrence concept may emerge later if there is a focused purpose around event identity/date/context, but no “god concept” should be created merely to hold all behavior.

---

### BH-029 — `Submission` is not a candidate concept name for the aggregate implementation record

**Preferred hypothesis**  
`Proposal` captures the durable offered subject; other responsibilities remain separate concepts/composition.

**Reasoning**

The current Submission record is a historical aggregate containing content, identity, selection, withdrawal, sponsor classification, registration, deliverable state, revision state, etc.

**001-E test**  
If `Submission` is retained as terminology, it must mean a focused concept equivalent to a justified purpose, not the current storage aggregate.

---

### BH-030 — Existing enums are evidence, not candidate lifecycles

No candidate concept is defined by:

- `ProgramStatus`;
- `AbstractReviewStatus`;
- `DeckStatus`.

Their values are redistributed as potential concept state/actions or synchronization-derived application state only after purposes justify the placement.

001-E must reject any candidate whose strongest justification is “the enum already groups these states.”

---

## 11. Preferred 001-D decomposition

The current preferred hypothesis is:

```text
Proposal        Revision        Evaluation        Disclosure
   │                │                │                │
   └──── app synchronizations / policy ──────────────┘

Feedback        Selection       Retraction       Authorization?

Availability?   Coverage?       Capacity         Classification

Vocabulary      Deliverable     Schedule         Publication

Archive         Communication?  Export?          Obligation?

                       Audit Trail? (cross-cutting, exploratory)
```

Question marks indicate provisional or exploratory boundaries, not weaker user needs.

The diagram intentionally omits a central `Conference`, `Submission`, `Program`, or `Workflow` concept. Application composition is expected to arise from synchronizations among independent concepts rather than a concept whose purpose is to coordinate everything.

---

## 12. Gate into 001-E

001-D boundary analysis is sufficient when every candidate enters 001-E with:

- a purpose basis;
- an explicit proposed boundary;
- neighboring concerns it does not own;
- strongest alternative split/merge/policy interpretation;
- a concrete question that the concept criteria review can attempt to falsify.

No boundary in this document is canonical until 001-E completes that review.
