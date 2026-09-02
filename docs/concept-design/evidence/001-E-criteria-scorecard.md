# 001-E Evidence — Concept Criteria Scorecard

Status: **Complete for 001-E review**  
Concept model maturity: **v0 — discovery**  
Input baseline: **21 candidates from 001-D**.

## 1. Purpose

This scorecard subjects every 001-D candidate to an adversarial review against four Concept Design criteria:

- **Specificity** — one focused behavioral purpose rather than a bundle of neighboring purposes.
- **Completeness** — enough state/actions to fulfill that purpose without existing only as a predicate or relationship over other concepts.
- **Independence** — understandable and behaviorally meaningful without direct knowledge of another concept's internal state; MinneAnalytics-specific coordination belongs in synchronizations.
- **Genericity** — not accidentally tied to current conference implementation terminology, but also not generalized so far that the purpose becomes vague or swallows unrelated concepts.

Ratings:

- **PASS** — sufficiently strong to continue.
- **CONDITIONAL** — survives only with an explicit boundary/terminology constraint that 001-F must preserve.
- **FAIL** — the 001-D standalone boundary should not continue.

A need may be important even when its proposed concept fails.

---

## 2. Candidate scorecard

| 001-D candidate | Specificity | Completeness | Independence | Genericity | 001-E disposition |
|---|---|---|---|---|---|
| CC-001 Proposal | PASS | PASS | PASS | PASS | **Survive** |
| CC-002 Revision | PASS | PASS | PASS | PASS | **Survive** |
| CC-003 Evaluation | PASS | PASS | PASS | PASS | **Survive** |
| CC-004 Disclosure | PASS | CONDITIONAL | PASS | CONDITIONAL | **Rename/tighten → Controlled Disclosure** |
| CC-005 Feedback | PASS | PASS | PASS | CONDITIONAL | **Survive; attendee use remains only a future compatibility test** |
| CC-006 Selection | PASS | PASS | PASS | PASS | **Survive** |
| CC-007 Retraction | PASS | PASS | PASS | CONDITIONAL | **Rename → Withdrawal** |
| CC-008 Availability Window | PASS | PASS | PASS | CONDITIONAL | **Survive provisionally** |
| CC-009 Authorization | CONDITIONAL | FAIL | CONDITIONAL | CONDITIONAL | **Demote to application authority policy / future concept signal** |
| CC-010 Coverage | FAIL | CONDITIONAL | FAIL | PASS | **Replace → Coverage Target; actual composition is derived** |
| CC-011 Capacity | PASS | PASS | PASS | PASS | **Survive** |
| CC-012 Classification | PASS | PASS | PASS | PASS | **Survive** |
| CC-013 Vocabulary | PASS | PASS | PASS | PASS | **Survive** |
| CC-014 Deliverable | PASS | PASS | PASS | PASS | **Survive** |
| CC-015 Schedule | PASS | PASS | PASS | PASS | **Survive** |
| CC-016 Publication | PASS | PASS | PASS | PASS | **Survive** |
| CC-017 Archive | PASS | PASS | PASS | CONDITIONAL | **Survive with internal-history terminology guardrail** |
| CC-018 Communication | CONDITIONAL | PASS | CONDITIONAL | PASS | **Narrow/rename → Dispatch** |
| CC-019 Export | CONDITIONAL | FAIL | CONDITIONAL | PASS | **Demote to cross-concept representation/projection capability** |
| CC-020 Obligation | FAIL | CONDITIONAL | PASS | FAIL | **Replace → Registration** |
| CC-021 Audit Trail | CONDITIONAL | CONDITIONAL | CONDITIONAL | CONDITIONAL | **Defer/demote; retain provenance rule and future signal** |

### Accounting

- **13** candidates survive substantially as proposed: Proposal, Revision, Evaluation, Feedback, Selection, Availability Window, Capacity, Classification, Vocabulary, Deliverable, Schedule, Publication, Archive.
- **5** survive only after a material name/boundary correction: Controlled Disclosure, Withdrawal, Coverage Target, Dispatch, Registration.
- **3** are removed from the current v0 candidate set: Authorization, Export, Audit Trail.

Result: **18 candidates continue to 001-F**.

---

## 3. Strong survivors

### CC-001 — Proposal

**Specificity:** one purpose—establish a durable offered subject.  
**Completeness:** creation/current reference are sufficient.  
**Independence:** can exist before Evaluation, Selection, Revision, Schedule, or Deliverable.  
**Genericity:** not tied to `Submission` or CFP routes.

**Disposition:** survive unchanged.

### CC-002 — Revision

**Specificity:** change-with-history, not permission-to-change or evaluation freshness.  
**Completeness:** create revision, preserve prior forms, identify current/history.  
**Independence:** operates over a referable subject rather than Proposal internals.  
**Genericity:** can apply to mutable event content beyond abstracts.

**Disposition:** survive unchanged.

### CC-003 — Evaluation

**Specificity:** independently formed judgment.  
**Completeness:** record/update judgment and private evaluation context.  
**Independence:** current applicability after revision is composition policy, not Evaluation state.  
**Genericity:** current 0–1 score is one representation.

**Disposition:** survive unchanged.

### CC-005 — Feedback

**Specificity:** recipient-directed response about a subject, distinct from private Evaluation and broad operational Dispatch.  
**Completeness:** source, subject, intended recipient/audience, response, context/time, recipient inspection.  
**Independence:** need not cause Revision or alter Selection.  
**Genericity:** current committee→originator evidence is strong; future attendee→organizer feedback is only a test of reuse.

**Disposition:** survive. If 001-F needs actor-specific branches to tell one operational principle, split the future attendee case rather than weakening the current concept.

### CC-006 — Selection

**Specificity:** consequential organizer inclusion/non-inclusion/reserve choice.  
**Completeness:** decision, reserve alternative, decision change/history.  
**Independence:** Capacity/Coverage may inform but do not decide.  
**Genericity:** not defined by current `ProgramStatus` values.

**Disposition:** survive unchanged.

### CC-011 — Capacity

**Specificity:** scarce commitment capacity and consumption.  
**Completeness:** establish capacity, consume/release, inspect remaining/saturation.  
**Independence:** meaningful before Selection and before Schedule.  
**Genericity:** sponsor/community is current accounting policy, not concept identity.

**Disposition:** survive unchanged.

### CC-012 — Classification

**Specificity:** associate subjects with descriptive terms.  
**Completeness:** add/change/remove/inspect associations.  
**Independence:** term lifecycle belongs to Vocabulary.  
**Genericity:** `Theme` is an instance, not the boundary.

**Disposition:** survive unchanged.

### CC-013 — Vocabulary

**Specificity:** keep a reusable shared vocabulary expressive and governable over time.  
**Completeness:** contribute/create, rename/correct, make usable, retire, restore, inspect.  
**Independence:** does not need to know which subjects use terms.  
**Genericity:** participant contribution and steward moderation are actions in the same term lifecycle rather than separate concepts solely because actors differ.

**Disposition:** survive unchanged.

### CC-014 — Deliverable

**Specificity:** obtain a required artifact and establish operational readiness.  
**Completeness:** require/request, provide, review, concern/readiness.  
**Independence:** Selection may create the requirement; Publication may later depend on readiness.  
**Genericity:** presentation deck/file format is the current instance.

**Disposition:** survive unchanged.

### CC-015 — Schedule

**Specificity:** allocate eligible activities to constrained place/time opportunities.  
**Completeness:** opportunities, place/unplace/move/swap, collision/constraint handling, assisted draft generation.  
**Independence:** does not own Selection, attendance, or demand collection.  
**Genericity:** current technical-variety algorithm is replaceable strategy.

**Disposition:** survive unchanged.

### CC-016 — Publication

**Specificity:** intentional public exposure.  
**Completeness:** eligibility/intent, publish/unpublish, public availability.  
**Independence:** readiness and Selection can constrain via synchronization.  
**Genericity:** broader than “slide archive” but still specifically about public exposure.

**Disposition:** survive unchanged.

### CC-017 — Archive

**Specificity:** transition an active context to retained read-only internal history.  
**Completeness:** archive/freeze, retained access, archived state, block ordinary mutation.  
**Independence:** may gate other concept actions without owning their histories.  
**Genericity:** conditionally passes because repository language also calls public slide publication an “archive.”

**Disposition:** survive. `Archive` must mean **internal retained closure/history**; `Publication` remains the public-audience concept.

---

## 4. Material boundary corrections

### CC-004 — Disclosure → **Controlled Disclosure**

`Disclosure` alone is too broad and risks becoming generic access control.

Refined purpose:

> intentionally stage exposure of information whose timing/visibility matters to participant behavior, while allowing justified reveal where policy permits.

The concept may own hidden/disclosed state and reveal actions. Application policy supplies which information is initially controlled and whether reveal is permitted; it must not inspect Evaluation/role internals directly.

**Disposition:** continue as **Controlled Disclosure**, provisional-strong. 001-F must not turn it into RBAC, general confidentiality, or permanent anonymity.

---

### CC-007 — Retraction → **Withdrawal**

The boundary is strong; the name is not.

`Retraction` can imply retracting content or the Proposal itself. The actual purpose is that the originator withdraws participation/commitment while organizer Selection history remains true.

**Disposition:** continue as **Withdrawal**, strong.

---

### CC-010 — Coverage → **Coverage Target**

The merged 001-D candidate fails independence.

It combined:

1. desired representation; and
2. observed actual composition.

Actual composition has no independent authoritative state: it is derived from Selection plus Classification/other attributes. If Coverage owned actual counts it would either duplicate source truth or reach into other concepts.

Refined candidate purpose:

> allow organizers to express desired representation for values/ranges along a relevant collection dimension.

Independent state/actions can include dimension/bucket, desired minimum/maximum/range/target, update/remove, and inspection.

**Derived application behavior:** Selection + Classification/attributes produce actual composition; the application compares that projection with Coverage Target for warnings, gap analysis, charts, and heatmaps.

**Disposition:** continue as **Coverage Target**, provisional. `Composition Assessment` is not a v0 concept candidate.

---

### CC-018 — Communication → **Dispatch**

`Communication` overlaps Feedback and was too willing to absorb current template storage/UI.

Refined purpose:

> intentionally dispatch an operational message to a resolved audience while preserving performed-send history and semantic duplicate/round behavior.

Dispatch can accept message content/template output and an eligible recipient set through synchronization. Reusable message templates are supporting content/configuration in v0 because an independent user-facing template-authoring lifecycle is not established strongly enough.

**Disposition:** continue as **Dispatch**, provisional-strong. Provider/email mechanism remains implementation.

---

### CC-020 — Obligation → **Registration**

`Obligation` over-generalizes. Deliverables, deadlines, compliance checkpoints, registrations, and many unrelated requirements could all fit, making the boundary an umbrella rather than a concept.

Current and near-future evidence is coherent around event/participant **registration state**, whether recorded locally or supplied by an external registration authority.

Refined purpose:

> allow organizers and participants to know whether an applicable participant is registered for a relevant event/participation context, while preserving source/provenance of that state.

**Disposition:** continue as **Registration**, provisional. External system synchronization remains composition/engineering rather than provider-specific concept behavior.

---

## 5. Demoted candidates

### CC-009 — Authorization

The authority need is real, but the current standalone concept boundary fails completeness.

Repository evidence does not establish an independently user-visible lifecycle for granting, delegating, revoking, or inspecting fine-grained authority. Current role/token behavior is primarily application policy and implementation.

A generic authorization concept would mostly be a predicate over actions defined elsewhere and risks becoming infrastructure/access control rather than product behavior.

**Disposition:** demote to **application-wide authority policy/composition concern**. If later product behavior exposes user-managed delegation/grants/scopes, rediscover a `Delegation`/`Authorization` concept from that purpose. Authentication remains separate.

---

### CC-019 — Export

The need to carry state outward is important, but current Export has little independent state/history. It is primarily a projection operation over source concepts.

Format independence is good genericity but does not create a concept lifecycle.

**Disposition:** demote to **cross-concept external representation/projection capability**. Revisit if users later define, save, schedule, version, or manage persistent report/export definitions.

---

### CC-021 — Audit Trail

Current evidence strongly requires concept-intrinsic provenance, but cross-concept organizational auditing is still primarily roadmap/future intent.

A standalone Audit Trail today would mostly observe actions in other concepts and risks becoming generic logging infrastructure.

**Disposition:** remove from current 001-F candidate set while preserving:

1. a design rule that each concept retains history/provenance required for its own correct behavior; and
2. a future concept signal for user-facing append-only cross-concept activity reconstruction.

---

## 6. Explicit non-concepts confirmed

001-E does not revive:

- `Conference` as a god context;
- `Submission` as an aggregate concept;
- `Program` as a workflow-manager concept;
- `Theme` as classification + vocabulary + target/analytics;
- `ProgramStatus`, `AbstractReviewStatus`, `DeckStatus` as conceptual lifecycles;
- `Score` separate from Evaluation;
- blind-review mode separate from Controlled Disclosure;
- rescore/needs-score queues;
- dashboards/tabs/routes/APIs;
- heatmaps/charts/widgets;
- provider names/integration adapters;
- token/SSO mechanism as behavioral concept;
- Sponsor under current evidence.

---

## 7. Result

The review deliberately changes the 001-D baseline:

- **13** candidates survive substantially as proposed.
- **5** survive after material rename/narrowing/replacement.
- **3** are demoted from the current v0 candidate set.

The resulting baseline contains **18 surviving candidates** for 001-F.

Passing 001-E does not make those concepts canonical. 001-F must still attempt to falsify them by requiring a concise, natural operational principle for each.