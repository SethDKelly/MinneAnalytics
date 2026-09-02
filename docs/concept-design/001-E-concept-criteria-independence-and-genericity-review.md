# 001-E — Concept Criteria, Independence & Genericity Review

Status: **Complete**  
Concept model maturity: **v0 — discovery**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-D — Candidate Concept Discovery & Boundary Hypotheses](001-D-candidate-concept-discovery-and-boundary-hypotheses.md)

## 1. Purpose

001-E is the adversarial quality gate for the 001-D candidate decomposition.

001-D asked which concept boundaries were plausible.

001-E asks a harder question:

> **Which candidates still deserve to exist after deliberately trying to falsify their specificity, completeness, independence, and genericity?**

The phase does not reward continuity with the prior candidate set. Candidates may be:

- retained;
- renamed;
- narrowed;
- replaced;
- demoted to synchronization/application policy;
- demoted to a cross-concept capability;
- deferred as future intent;
- rejected.

Only candidates that remain coherent after this review proceed to 001-F operational-principle development.

---

## 2. Governing criteria

### 2.1 Specificity

A concept should have one focused purpose.

Warning signs:

- “manage everything about X”;
- combining independent actor purposes because one table stores them together;
- a generic word such as communication, obligation, authorization, or workflow becoming an umbrella for neighboring concepts;
- a candidate whose only purpose is coordinating other concepts.

### 2.2 Completeness

A concept should contain enough state/actions to fulfill its purpose.

A candidate fails when it is primarily:

- a predicate over other concepts;
- a derived view of other concepts;
- a projection/output operation with no meaningful lifecycle;
- an implementation helper presented as a concept.

Completeness does **not** require MinneAnalytics-specific policy to be embedded in the concept. Such policy should remain synchronization/application composition where possible.

### 2.3 Independence

A concept should be understandable without another concept's internal state.

Interaction is expected. Direct conceptual dependency is not.

References to abstract subjects, actors, terms, resources, recipients, or contexts are acceptable. A concept should not need to understand another candidate's private lifecycle merely to define its own behavior.

### 2.4 Genericity

A concept should abstract away accidental current terminology while remaining recognizable and focused.

001-E rejects both:

- **under-generalization** such as `Score`, `Theme`, `DeckStatus`, or provider-specific concepts; and
- **over-generalization** such as an `Obligation` concept broad enough to absorb Deliverables, registrations, deadlines, and arbitrary compliance checkpoints.

The goal is behavioral essence, not maximum abstraction.

---

## 3. Review artifacts

001-E produces:

- [Concept Criteria Scorecard](evidence/001-E-criteria-scorecard.md)
- [Independence & Composition Review](evidence/001-E-independence-and-composition-review.md)
- [Genericity & Boundary Decisions](evidence/001-E-genericity-and-boundary-decisions.md)
- [Surviving Candidate Baseline](evidence/001-E-surviving-candidate-baseline.md)

These artifacts supersede 001-D status labels for the next discovery phase while preserving 001-D as historical design reasoning.

---

## 4. Review result

001-D entered the phase with **21 candidates**.

001-E produces:

- **13 candidates that survive substantially as proposed**;
- **5 candidates that survive after material rename/narrowing/replacement**;
- **3 candidates demoted from the current v0 concept set**.

The resulting 001-F baseline contains **18 candidates**.

---

## 5. Strong surviving candidates

The following boundaries survive the criteria review with no material conceptual restructuring.

### Proposal

A Proposal is the durable offered subject.

It remains independently meaningful before evaluation, organizer selection, scheduling, deliverables, publication, or revision activity.

The current `Submission` record is therefore still rejected as the design boundary.

### Revision

Revision owns change-with-history.

It does not own:

- whether changing is currently allowed;
- why a change is allowed;
- whether an Evaluation becomes non-current;
- whether an organizer has acknowledged the revision.

Those concerns remain application composition/policy or unresolved workflow behavior.

### Evaluation

Evaluation owns independently formed judgment.

It remains separate from:

- Selection;
- Feedback;
- Controlled Disclosure;
- current-applicability after Revision.

A numeric score is one representation of Evaluation.

### Feedback

Feedback owns recipient-directed response about a subject, distinct from private evaluation context.

Current committee→originator behavior strongly supports the concept.

Future attendee→organizer/session response is retained only as a genericity stress test. 001-E does not claim that future use is already proven to fit the same concept.

### Selection

Selection owns organizer choice among candidates.

It remains separate from originator Withdrawal, Capacity, Coverage Target, Schedule, and individual Evaluation.

### Capacity

Capacity owns scarcity and consumption of scarce commitment capacity.

It remains meaningful before a concrete Schedule exists and before any specific Selection decision is made.

Sponsor/community behavior is treated as current accounting policy/classification, not as concept identity.

### Classification

Classification owns associations between subjects and reusable descriptive terms.

It remains separate from Vocabulary term lifecycle and Coverage Target.

### Vocabulary

Vocabulary owns the lifecycle of reusable terms.

Participant contribution and steward governance survive in one concept because both serve one purpose: keeping the shared vocabulary expressive and governable over time.

Different actors performing different lifecycle actions do not by themselves require different concepts.

### Deliverable

Deliverable owns required artifact provision and readiness assessment.

It remains separate from Selection and Publication.

A selected session may have no ready deliverable yet; a ready deliverable may still not be public.

### Schedule

Schedule owns allocation to constrained place/time opportunities.

Current balancing heuristics and future attendance/demand signals are inputs/strategies, not the concept.

### Publication

Publication owns intentional public exposure.

It remains distinct from selection, deliverable readiness, and internal Archive.

### Archive

Archive owns retained read-only closure/history of an active working context.

It survives with an explicit terminology guardrail:

> **Archive means internal retained closure/history; public “slide archive” behavior belongs to Publication.**

---

## 6. Materially revised candidates

### 6.1 Disclosure → Controlled Disclosure

The underlying need survives, but the original name was too broad.

The refined boundary is:

> stage exposure of information whose visibility timing matters to participant behavior, with explicit/justified reveal where application policy permits.

This avoids turning the concept into generic access control or confidentiality infrastructure.

Controlled Disclosure may accept eligibility/policy decisions from the application. It must not know Evaluation internals merely because current review policy uses Evaluation state to change visibility.

**Status entering 001-F:** provisional-strong.

---

### 6.2 Retraction → Withdrawal

The boundary remains strong, but the name changes.

`Retraction` can imply retracting content, a claim, or Proposal existence.

The actual purpose is:

> allow the originator to withdraw participation/commitment independently of organizer Selection.

Selection history remains true after Withdrawal.

**Status entering 001-F:** strong.

---

### 6.3 Coverage → Coverage Target

This is the most significant structural correction in 001-E.

The 001-D candidate combined:

- desired program representation; and
- observed actual program composition.

That merged concept fails independence.

Actual composition is not authoritative state owned by a Coverage concept. It is derived from selected items plus their Classification/other relevant attributes.

Making Coverage own current counts would either:

- duplicate source-of-truth state; or
- require direct knowledge of Selection and Classification internals.

The refined candidate therefore owns only **desired representation**:

> Coverage Target allows organizers to state target/range expectations for a relevant collection dimension/bucket.

MinneAnalytics later composes:

```text
Selection
+ Classification / relevant attributes
→ actual composition projection

actual composition
+ Coverage Target
→ gaps / excess / warnings / balance views / heatmaps
```

No `Composition Assessment` concept is introduced in v0.

**Status entering 001-F:** provisional.

---

### 6.4 Communication → Dispatch

`Communication` was too broad and risked overlap with Feedback.

The refined concept is:

> Dispatch intentionally sends an operational message to a resolved audience while preserving performed-send history and semantic duplicate/round behavior.

Templates may be used to construct messages, but current evidence does not establish a sufficiently independent user-facing template-authoring lifecycle to create a `Message Template` concept.

Recipient eligibility may be supplied from Selection, Deliverable, Registration, etc. through application composition. Dispatch does not own those facts.

**Status entering 001-F:** provisional-strong.

---

### 6.5 Obligation → Registration

`Obligation` fails genericity because it is **too generic**, not because the need is weak.

A generic obligation could absorb:

- deliverable requirements;
- deadlines;
- registration;
- compliance checks;
- future payment/training/administrative checkpoints.

The current and planned evidence has a much clearer center around participant registration state.

The refined candidate is:

> Registration represents whether an applicable participant is registered for a relevant event/participation context, independent of whether that fact is local or externally supplied.

**Status entering 001-F:** provisional.

---

## 7. Demoted candidates

### 7.1 Authorization

The authority requirement remains critical, but Authorization does not currently survive as a standalone concept.

The product does not yet expose an independent user-facing lifecycle of:

- grants;
- delegations;
- scopes;
- revocations;
- authority management.

Current board/co-chair/admin distinctions are primarily application policy realized through current authentication/role machinery.

For v0:

- concept actions remain role-name-independent;
- application policy determines which established actor context may invoke consequential actions;
- authentication remains separate engineering/application concern;
- future user-managed delegation may justify rediscovery of a `Delegation`/`Authorization` concept.

---

### 7.2 Export

Export does not currently have enough independent lifecycle/state to justify concept status.

It is primarily a projection of source concept state into an external representation.

CSV and future reporting/API output remain important behavior, but the design treats them as cross-concept representation capabilities.

If future users manage persistent export/report definitions—saved scope, schedule, versions, distribution—concept discovery can revisit.

---

### 7.3 Audit Trail

The need for provenance remains strong, but current cross-concept Audit Trail evidence is future-heavy.

The correct v0 decision is dual:

1. concepts retain history/provenance necessary for their own correctness; and
2. a future organizational Audit Trail remains a candidate signal when append-only cross-concept activity reconstruction becomes real user-facing behavior.

A global audit mechanism must never substitute for Revision history, Evaluation context, Dispatch history, Vocabulary history, or other intrinsic historical semantics.

---

## 8. Independence findings

The surviving set can be composed without direct conceptual dependencies.

High-confidence composition relationships include:

- Proposal ↔ Revision;
- Revision ↔ Evaluation;
- Evaluation ↔ Controlled Disclosure;
- Feedback ↔ application-specific Revision opportunity;
- Availability Window ↔ Proposal/Revision actions;
- Selection ↔ Withdrawal;
- Selection ↔ Capacity;
- Selection + Classification/attributes + Coverage Target → composition projections;
- Vocabulary ↔ Classification;
- Selection ↔ Deliverable;
- Deliverable ↔ Publication;
- Selection + Withdrawal ↔ Schedule eligibility;
- Archive ↔ application mutation gating;
- other application state ↔ Dispatch recipient eligibility;
- external authorities ↔ Registration / future scheduling inputs.

These are still composition signals, not canonical synchronizations. Canonical synchronization design occurs later.

---

## 9. Derived behaviors explicitly kept out of the concept set

001-E confirms that the following should remain derived application behavior unless later evidence establishes an independent purpose/state lifecycle:

### Effective participation

Derived from Selection + Withdrawal (plus event/application policy as relevant).

### Evaluation currentness/freshness

Derived from Evaluation subject reference + current Revision + application policy.

### Needs-score / needs-rescore queues

Derived work views.

### Actual program composition

Derived from Selection + Classification/attributes.

### Coverage gap/excess

Comparison of actual composition projection with Coverage Target.

### Edit eligibility

Derived from Revision action + Availability Window + authority policy + subject/application state + explicit exceptions.

### Publication eligibility

Derived from Deliverable readiness + sharing intent + Publication/application policy.

### Dispatch recipient eligibility

Derived from relevant application/concept state.

No generic `Status`, `Workflow`, `Manager`, or “Program” concept is introduced to own these derived facts.

---

## 10. Genericity findings

001-E establishes an important rule for subsequent work:

> **Genericity is bounded abstraction, not maximum abstraction.**

The phase intentionally generalizes:

- Submission → Proposal;
- Score → Evaluation;
- Blind Review → Controlled Disclosure;
- Theme → Vocabulary + Classification + Coverage Target;
- Deck → Deliverable;
- current scheduling heuristic → Schedule;
- public slide archive → Publication;
- email transport → Dispatch;
- VIP-specific flag → Registration.

But it intentionally refuses over-generalization into:

- Obligation;
- broad Communication;
- generic Authorization infrastructure;
- generic Export concept;
- generic Audit/logging concept.

Concept names remain domain-comprehensible where that improves usability: Proposal, Selection, Withdrawal, Schedule, Publication, Registration, etc. There is no value in replacing them with abstract names such as `Item`, `Decision`, `Allocation`, or `Checkpoint` merely to sound generic.

---

## 11. 001-F candidate baseline

### Strong

1. Proposal
2. Revision
3. Evaluation
4. Feedback
5. Selection
6. Withdrawal
7. Capacity
8. Classification
9. Vocabulary
10. Deliverable
11. Schedule
12. Publication
13. Archive

### Provisional-strong

14. Controlled Disclosure
15. Dispatch

### Provisional

16. Availability Window
17. Coverage Target
18. Registration

001-F must attempt to tell one concise, archetypal operational story for each.

Candidates should be rejected/split/revised if that story:

- requires another concept's internals;
- requires current implementation nouns/enums/routes;
- becomes a list of unrelated scenarios;
- cannot show how the purpose is fulfilled;
- becomes vague due to over-generalization;
- merely describes application synchronization rather than the concept itself.

---

## 12. 001-E exit criteria

- [x] All 21 001-D candidates reviewed against specificity.
- [x] All candidates reviewed against completeness.
- [x] All candidates reviewed against independence.
- [x] All candidates reviewed against genericity, including over-generalization risk.
- [x] Candidate merges/splits/renames/demotions recorded explicitly.
- [x] Purpose coverage preserved after demotions.
- [x] Composition needs separated from concept state.
- [x] Derived application views/states explicitly excluded from concept promotion.
- [x] Provenance requirement preserved without prematurely accepting Audit Trail.
- [x] Current implementation nouns remain non-authoritative.
- [x] No implementation refactor performed.
- [x] A clear candidate baseline exists for 001-F.

### Phase result

**001-E passes.**

The candidate set is materially stronger than the 001-D baseline because the review removed several attractive but insufficient abstractions rather than treating concept count as a goal.

---

## 13. Immediate next phase

**001-F — Operational Principle Development**

001-F should write an archetypal operational principle for each of the 18 survivors and use those stories as a second falsification gate.

The operational principles should be concept-local first. MinneAnalytics-specific multi-concept workflows belong later in synchronization/composition work, not inside the individual concept stories.