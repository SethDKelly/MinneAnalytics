# 001-E Evidence — Concept Criteria Scorecard

Status: **Complete for 001-E review**  
Concept model maturity: **v0 — discovery**  
Input baseline: 21 candidates from 001-D.

## 1. Purpose

This scorecard subjects every 001-D candidate to an adversarial review against the Concept Design criteria established in 001-A.

The goal is not to preserve the candidate list. The goal is to remove or reshape candidates that do not form focused, complete, independently understandable, appropriately generic units of user-visible behavior.

Ratings:

- **PASS** — the candidate currently satisfies the criterion strongly enough to continue to operational-principle development.
- **CONDITIONAL** — the candidate can survive only with a boundary clarification, rename, or explicit constraint that 001-F must preserve.
- **FAIL** — the current candidate boundary should not continue as a standalone v0 concept hypothesis.

A candidate may have a very important underlying need and still fail as a concept.

---

## 2. Criteria interpretation

### Specificity

A candidate should serve one coherent purpose. It fails specificity when its purpose is effectively “coordinate several other behaviors,” when it combines independently useful purposes, or when its name is broad enough to absorb neighboring concepts.

### Completeness

A candidate should contain enough state and actions to fulfill its purpose. It need not encode MinneAnalytics-specific composition policy, but it cannot exist only as a relationship or predicate over other concepts.

### Independence

A candidate should be understandable and behaviorally meaningful without direct knowledge of another concept's internal state. Application-specific coordination belongs in synchronizations.

### Genericity

A candidate should not be unnecessarily specialized to current conference terminology, but it must not generalize so far that its purpose becomes vague or subsumes unrelated concepts.

Genericity therefore has two failure modes:

- **under-generalization** — the concept is accidentally tied to a current implementation/domain instance;
- **over-generalization** — the concept becomes an abstract umbrella with no crisp behavioral boundary.

---

## 3. Candidate scorecard

| 001-D candidate | Specificity | Completeness | Independence | Genericity | 001-E disposition |
|---|---|---|---|---|---|
| CC-001 Proposal | PASS | PASS | PASS | PASS | **Survive** |
| CC-002 Revision | PASS | PASS | PASS | PASS | **Survive** |
| CC-003 Evaluation | PASS | PASS | PASS | PASS | **Survive** |
| CC-004 Disclosure | PASS | CONDITIONAL | PASS | CONDITIONAL | **Survive with rename/boundary tightening → Controlled Disclosure** |
| CC-005 Feedback | PASS | PASS | PASS | CONDITIONAL | **Survive; future attendee use is a compatibility test, not part of current proof** |
| CC-006 Selection | PASS | PASS | PASS | PASS | **Survive** |
| CC-007 Retraction | PASS | PASS | PASS | CONDITIONAL | **Survive with rename → Withdrawal** |
| CC-008 Availability Window | PASS | PASS | PASS | CONDITIONAL | **Survive provisionally** |
| CC-009 Authorization | CONDITIONAL | FAIL | CONDITIONAL | CONDITIONAL | **Demote to application policy / future concept signal** |
| CC-010 Coverage | FAIL | CONDITIONAL | FAIL | PASS | **Replace with narrower Coverage Target; observed composition becomes derived composition behavior** |
| CC-011 Capacity | PASS | PASS | PASS | PASS | **Survive** |
| CC-012 Classification | PASS | PASS | PASS | PASS | **Survive** |
| CC-013 Vocabulary | PASS | PASS | PASS | PASS | **Survive** |
| CC-014 Deliverable | PASS | PASS | PASS | PASS | **Survive** |
| CC-015 Schedule | PASS | PASS | PASS | PASS | **Survive** |
| CC-016 Publication | PASS | PASS | PASS | PASS | **Survive** |
| CC-017 Archive | PASS | PASS | PASS | CONDITIONAL | **Survive; name must remain explicitly internal/read-only historical archive** |
| CC-018 Communication | CONDITIONAL | PASS | CONDITIONAL | PASS | **Narrow and rename → Dispatch** |
| CC-019 Export | CONDITIONAL | FAIL | CONDITIONAL | PASS | **Demote to cross-concept projection/representation capability** |
| CC-020 Obligation | FAIL | CONDITIONAL | PASS | FAIL | **Replace with narrower Registration candidate** |
| CC-021 Audit Trail | CONDITIONAL | CONDITIONAL | CONDITIONAL | CONDITIONAL | **Defer/demote from current v0 candidate set; retain provenance rule and future signal** |

Result: **18 candidates continue to 001-F**, three 001-D candidates are demoted from the current candidate set, and four surviving candidates are materially renamed/rebounded.

---

## 4. Strong unmodified survivors

### CC-001 — Proposal

**Specificity:** PASS. A Proposal exists to establish a durable offered subject for consideration. It does not need to own revision history, selection, participation, or downstream execution.

**Completeness:** PASS. A coherent state/action story exists around creation and continued reference to the offered subject.

**Independence:** PASS. A Proposal can exist before any Evaluation, Selection, Schedule, or Deliverable exists.

**Genericity:** PASS. “Proposal” is broad enough to cover candidate session content without being tied to a `Submission` row or CFP route.

**Disposition:** Survive unchanged.

---

### CC-002 — Revision

**Specificity:** PASS. Revision solves change-with-history, not permission-to-change or evaluation freshness.

**Completeness:** PASS. New revision creation, prior revision retention, current-revision identification, and history inspection can fulfill the purpose independently.

**Independence:** PASS. Revision can operate over an abstract subject reference rather than knowing Proposal internals. MinneAnalytics can synchronize Proposal creation/update with Revision.

**Genericity:** PASS. The concept is reusable for mutable content beyond abstracts without becoming vague.

**Disposition:** Survive unchanged.

---

### CC-003 — Evaluation

**Specificity:** PASS. The purpose is independent judgment, not selection or communication.

**Completeness:** PASS. An evaluator can create/update a judgment and retain private evaluation context.

**Independence:** PASS. The concept may evaluate any referable subject; it does not need Revision internals. Whether a judgment is current for an application is external composition policy.

**Genericity:** PASS. Numeric 0–1 scoring is one realization, not the boundary.

**Disposition:** Survive unchanged.

---

### CC-006 — Selection

**Specificity:** PASS. Selection exists to record consequential organizer choice among candidates.

**Completeness:** PASS. Inclusion, non-selection, reserve alternatives, and later organizer decision change can be expressed without Withdrawal, Evaluation, or Capacity internals.

**Independence:** PASS. Capacity and Coverage can inform Selection through application composition but do not define it.

**Genericity:** PASS. The concept is not tied to the current `ProgramStatus` values.

**Disposition:** Survive unchanged.

---

### CC-011 — Capacity

**Specificity:** PASS. Capacity represents scarce commitment capacity and its consumption.

**Completeness:** PASS. Available amount, consumption/allocation, release, and remaining/saturated state form a coherent behavioral unit.

**Independence:** PASS. Capacity can exist before any Selection or Schedule. Application synchronizations can convert selected commitments into capacity consumption.

**Genericity:** PASS. Sponsor/community treatment becomes a configurable accounting rule/classification rather than a hard-coded sponsorship concept.

**Disposition:** Survive unchanged.

---

### CC-012 — Classification

**Specificity:** PASS. Classification associates subjects with descriptive terms.

**Completeness:** PASS. Associate, remove/change, and inspect associations satisfy the purpose.

**Independence:** PASS. Classification can refer to terms supplied by Vocabulary without owning term lifecycle. Historical associations need not disappear when a term is retired.

**Genericity:** PASS. Themes and technical-level-like dimensions can participate without creating separate concepts solely by attribute name.

**Disposition:** Survive unchanged.

---

### CC-013 — Vocabulary

**Specificity:** PASS. Participant contribution and steward moderation both serve the same singular purpose: keep a reusable shared vocabulary expressive and governable over time.

**Completeness:** PASS. Create/propose, rename/correct, make available, retire, restore, and inspect terms form a coherent lifecycle.

**Independence:** PASS. Vocabulary need not know which subjects are classified with a term. Application composition constrains new Classification associations while preserving old ones.

**Genericity:** PASS. `Theme` is an instance of this behavior, not the concept boundary.

**Disposition:** Survive unchanged.

---

### CC-014 — Deliverable

**Specificity:** PASS. Deliverable exists to obtain a required artifact and establish operational readiness.

**Completeness:** PASS. Request/require, provide, review, raise concern, and establish readiness form one coherent purpose.

**Independence:** PASS. A Deliverable can be conceptually understood independently of why it was requested. Selection can synchronize to create a requirement; Publication can later depend on readiness.

**Genericity:** PASS. Presentation decks are the current instance, not the permanent concept name or file format.

**Disposition:** Survive unchanged.

---

### CC-015 — Schedule

**Specificity:** PASS. Schedule owns allocation of activities to constrained place/time opportunities.

**Completeness:** PASS. Opportunities, placement, move, unplace, swap, constraint/collision handling, and assisted draft generation form a coherent behavioral story.

**Independence:** PASS. The concept can accept eligible activities and external signals without owning Selection, attendance, or demand collection.

**Genericity:** PASS. Current technical-variety balancing is a strategy, not the concept.

**Disposition:** Survive unchanged.

---

### CC-016 — Publication

**Specificity:** PASS. Publication intentionally exposes material to a public audience.

**Completeness:** PASS. Publication intent/eligibility, publish, unpublish, and public availability are sufficient to explain the behavior.

**Independence:** PASS. Readiness and organizer selection may constrain eligibility through synchronization, but Publication does not need their internal state.

**Genericity:** PASS. The concept is broader than the current “slide archive” wording while remaining specifically about intentional public exposure.

**Disposition:** Survive unchanged.

---

## 5. Survivors requiring boundary changes

### CC-004 — Disclosure → **Controlled Disclosure**

The underlying need survives, but `Disclosure` by itself is too broad and risks collapsing into generic access control.

**Specificity:** PASS only when the purpose is narrowed to **intentional staged exposure of information whose timing/visibility matters to participant behavior**.

**Completeness:** CONDITIONAL. The concept may own disclosure state and reveal actions, but application policy determines which information is initially withheld and when a reveal is permitted. That external policy does not make the concept incomplete as long as Controlled Disclosure can accept a visibility rule/eligibility decision rather than directly interrogating Evaluation or role internals.

**Independence:** PASS. The concept is meaningful without Evaluation: information can be hidden, disclosed, and its disclosure observed independently of a judgment being recorded.

**Genericity:** CONDITIONAL. It must remain narrower than authorization/confidentiality in general. The current bias-reduction case provides the clearest operational center.

**Disposition:** Continue as **Controlled Disclosure**, provisional-strong. 001-F must produce an operational principle that does not become generic RBAC or permanent anonymity.

---

### CC-005 — Feedback

The generic candidate survives, but future attendee feedback must not be used to broaden the present concept artificially.

**Specificity:** PASS. Feedback is recipient-directed response about a subject. It is distinct from private Evaluation context and from broad operational Dispatch.

**Completeness:** PASS. Source, subject, intended recipient/audience, response content, context/time, and recipient inspection form a coherent unit.

**Independence:** PASS. Feedback can exist without causing a Revision or affecting Selection. Those effects are synchronizations/policy.

**Genericity:** CONDITIONAL. Committee→originator feedback is current strong evidence. Future attendee→organizer feedback is a useful compatibility test only. If 001-F requires actor-pair branches to tell the operational story, the future use should split rather than weaken the current concept.

**Disposition:** Survive as Feedback; do not claim attendee feedback is already proven to be the same concept.

---

### CC-007 — Retraction → **Withdrawal**

The concept boundary survives strongly, but the working name is misleading.

`Retraction` can suggest retracting a claim, content, or Proposal itself. The recovered purpose is narrower and clearer: the originator withdraws their participation/commitment while organizer Selection history remains meaningful.

**Specificity:** PASS after rename.

**Completeness:** PASS. Withdraw, inspect withdrawal state/history, and distinguish current willingness from organizer preference fulfill the purpose.

**Independence:** PASS. Withdrawal does not modify Selection history.

**Genericity:** CONDITIONAL only in naming: the concept should not become general deletion/cancellation.

**Disposition:** Rename to **Withdrawal** and continue as a strong candidate.

---

### CC-008 — Availability Window

**Specificity:** PASS. It has one purpose: establish a bounded interval during which some governed opportunity is ordinarily available.

**Completeness:** PASS. Define/update interval, determine open/closed state, and expose timing information can fulfill the purpose.

**Independence:** PASS. The window need not know Proposal or Revision internals; those actions can synchronize against current window state.

**Genericity:** CONDITIONAL. A window must not become generic scheduler/time infrastructure. Its value comes from explicit user-visible availability periods such as CFP/submission timing and future deadlines.

**Disposition:** Continue provisionally. 001-F must demonstrate a natural operational principle independent of “a field with two timestamps.”

---

### CC-010 — Coverage → **Coverage Target**

The 001-D merged candidate does **not** survive.

The original candidate combined two independently meaningful concerns:

1. organizers expressing desired representation;
2. organizers observing actual composition.

The second concern has no independent authoritative state in the current evidence: actual composition is derived from Selection plus Classification/other attributes. Making Coverage own that observed composition would either duplicate source-of-truth state or require direct knowledge of other concepts.

**Specificity:** FAIL for the merged candidate because goal-setting and observation are independently useful.

**Completeness:** CONDITIONAL because the merged concept can appear complete only by importing observed facts from other concepts.

**Independence:** FAIL because “actual coverage” is inherently a projection over selected/classified items.

**Genericity:** PASS at the dimension level; theme and technicality are both compatible with a dimension-generic model.

**Replacement candidate — Coverage Target**

Purpose: allow organizers to express desired representation for values/ranges along a relevant program dimension.

Expected independent state/actions:

- define the dimension/bucket being targeted;
- set/modify/remove desired minimum/maximum/range or target;
- inspect desired representation.

Application composition can derive current composition from Selection + Classification/attributes and compare it with Coverage Target for warnings/visualizations.

**Disposition:** Replace CC-010 with **Coverage Target**. `Composition Assessment` remains a derived application projection/view, not a concept candidate in v0.

---

### CC-017 — Archive

**Specificity:** PASS when strictly defined as internal transition from active mutable context to retained read-only historical context.

**Completeness:** PASS. Archive/freeze, retained access, active-vs-archived state, and blocking ordinary mutation form a coherent purpose.

**Independence:** PASS. Archive can gate application actions through synchronization without owning their histories.

**Genericity:** CONDITIONAL. The name is historically overloaded by the public slide archive. All later specifications must explicitly reserve `Publication` for public exposure and `Archive` for internal retained closure/history.

**Disposition:** Survive as Archive with terminology guardrail.

---

### CC-018 — Communication → **Dispatch**

The underlying operational communication purpose survives, but the 001-D name/boundary is too broad.

`Communication` risks overlapping Feedback and treating reusable template definition as part of the same concept solely because current storage/UI places them together.

The durable current behavior is more focused:

> intentionally dispatch an operational message to a resolved audience while preserving performed-send history and duplicate/round semantics.

Reusable templates can be inputs/configuration used to construct the message; they do not need independent concept status in the current v0 because user-facing template-authoring purpose is not sufficiently established.

**Specificity:** CONDITIONAL for Communication; PASS for Dispatch.

**Completeness:** PASS for Dispatch: specify/preview message instance, resolve/accept intended recipients, perform dispatch, record outcomes/history, enforce semantic duplicate protection/round rules.

**Independence:** CONDITIONAL for the old candidate because recipient eligibility came from many other concepts. PASS for Dispatch if eligibility is supplied through synchronization rather than read directly from Selection/Deliverable/etc.

**Genericity:** PASS. Email/provider transport remains implementation.

**Disposition:** Rename/narrow to **Dispatch**. Do not introduce a Message Template concept in v0 unless 001-F reveals an independently user-visible authoring lifecycle.

---

### CC-020 — Obligation → **Registration**

The 001-D generalization is too broad.

A generic `Obligation` concept could absorb Deliverable requirements, deadlines, compliance checks, and many other unrelated responsibilities. The evidence does not justify such a large umbrella.

Current and near-future evidence is much more coherent around **registration/enrollment state** for selected participants, with local or externally authoritative sources.

**Specificity:** FAIL for Obligation; PASS for Registration.

**Completeness:** CONDITIONAL for Obligation because the lifecycle of arbitrary obligations is undefined. Registration has a clearer lifecycle: required/eligible participant, registered/unregistered/cancelled or equivalent state, source/provenance, organizer inspection.

**Independence:** PASS for Registration. It remains meaningful independently of Selection, though Selection may make registration relevant through synchronization.

**Genericity:** FAIL for Obligation due to over-generalization. Registration is still provider-independent and reusable across event registration systems.

**Disposition:** Replace CC-020 with **Registration**, provisional because current behavior is narrow and external synchronization remains future intent.

---

## 6. Candidates demoted from the v0 concept set

### CC-009 — Authorization

The authority need is real and extremely important, but the current standalone concept hypothesis fails the review.

**Specificity:** CONDITIONAL. “Control who may do what” is focused at a policy level but very broad across all concepts.

**Completeness:** FAIL for current v0. Repository evidence does not establish a user-facing lifecycle for granting, delegating, revoking, or inspecting fine-grained authority independent of the actions being governed. The current role/token configuration is primarily application policy/implementation.

**Independence:** CONDITIONAL. A hypothetical authorization concept can be generic, but its useful meaning is almost entirely predicates over actions defined elsewhere.

**Genericity:** CONDITIONAL. General access-control abstraction risks becoming infrastructure rather than a product concept.

**Disposition:** Demote to **application-wide authority policy/composition concern** for v0. Preserve the future signal: if MinneAnalytics later exposes user-managed delegation/grants/scopes, a `Delegation` or `Authorization` concept can be rediscovered from that user-visible purpose. Authentication remains separate.

---

### CC-019 — Export

**Specificity:** CONDITIONAL. “Produce an external representation” is coherent, but it applies generically to nearly every concept.

**Completeness:** FAIL. Current export has little independent state/history; it is primarily a projection operation over source concept state.

**Independence:** CONDITIONAL. Export can be understood generically, but each useful output depends on the semantics/context supplied by source concepts.

**Genericity:** PASS in being format-independent, but this does not overcome the lack of an independent behavioral lifecycle.

**Disposition:** Demote to **cross-concept representation/projection capability**. CSV/reporting/API outputs remain important requirements, but v0 does not treat Export as an independent concept. If users later define/schedule/version persistent reports or export specifications, concept discovery can revisit.

---

### CC-021 — Audit Trail

The cross-cutting provenance need is strong, but current evidence does not yet justify a current standalone concept.

**Specificity:** CONDITIONAL. An organizational activity trail has a focused purpose, but current user-visible behavior is mostly feature-specific history.

**Completeness:** CONDITIONAL. A future append-only audit could have independent record/query/export actions, but those are roadmap intent rather than established current behavior.

**Independence:** CONDITIONAL. Audit events would be generated almost exclusively by observing actions in other concepts.

**Genericity:** CONDITIONAL. A global audit mechanism must not become generic logging infrastructure or replace concept-intrinsic history.

**Disposition:** Remove from the current 001-F candidate set. Preserve two things:

1. a **design rule** that concepts retain history/provenance required for their own correct behavior;
2. a **future concept signal** for an organizational Audit Trail when append-only cross-concept activity reconstruction becomes an explicit user-facing capability.

---

## 7. Concepts explicitly not revived

001-E confirms that the following remain non-concepts in the v0 discovery baseline absent a new singular purpose:

- `Conference` as a god context;
- `Submission` as an aggregate concept;
- `Program` as a workflow manager;
- `Theme` as a combined category/taxonomy/coverage concept;
- `ProgramStatus`, `AbstractReviewStatus`, and `DeckStatus` as conceptual lifecycles;
- `Score` as distinct from Evaluation;
- blind-review mode as distinct from Controlled Disclosure;
- rescore/needs-score queues;
- dashboards/tabs/routes/APIs;
- heatmaps/charts/widgets;
- integration providers;
- current authentication mechanism;
- Sponsor as a concept under current evidence.

---

## 8. 001-E scorecard result

The criteria review is intentionally non-conservative:

- **14** 001-D candidates survive substantially as proposed, though some carry terminology/genericity constraints.
- **4** candidates survive only after material rename/narrowing/replacement: Controlled Disclosure, Withdrawal, Coverage Target, Dispatch, and Registration are the resulting refined names/boundaries (five names reflect four categories of material boundary correction plus one precision rename).
- **3** candidates are demoted from the current concept set: Authorization, Export, Audit Trail.

The resulting baseline contains **18 surviving candidates** for 001-F.

001-F must still attempt to falsify them through operational principles. Passing this scorecard does not make them canonical.