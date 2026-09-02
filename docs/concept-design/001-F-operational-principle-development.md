# 001-F — Operational Principle Development

Status: **Complete**  
Concept model maturity: **v0 — discovery**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-E — Concept Criteria, Independence & Genericity Review](001-E-concept-criteria-independence-and-genericity-review.md)

## 1. Purpose

001-F subjects the 001-E survivor set to a second behavioral falsification gate: **operational-principle development**.

001-E established that 18 candidate boundaries were coherent enough to test further.

001-F asks:

> **Can each candidate tell one concise, natural, archetypal story that demonstrates how it fulfills its purpose without relying on another concept's internal behavior or the current implementation?**

This is materially different from writing a use-case catalog.

An operational principle should expose the dynamic essence of a concept. If the story becomes a compound workflow, a policy predicate, a derived view, or invented future behavior, the candidate does not pass merely because its name or purpose sounded plausible.

---

## 2. Governing method

An acceptable operational principle must be:

### 2.1 Archetypal

It demonstrates the defining behavior rather than attempting to cover every branch and edge case.

### 2.2 Concept-local

It may refer to generic actors, subjects, resources, contexts, or supplied eligibility decisions, but it must not require another concept's internal lifecycle.

### 2.3 Purpose-revealing

The user/organizational difficulty addressed by the concept should visibly be resolved by the end of the story.

### 2.4 Implementation-neutral

No principle may require:

- Prisma models;
- enum values;
- routes or APIs;
- pages/tabs/dashboard organization;
- token or SSO mechanisms;
- current provider/storage/framework choices.

### 2.5 Appropriately generic

The story may abstract beyond the current instance only while the same behavioral essence remains obvious.

### 2.6 Free of hidden synchronization

MinneAnalytics-specific multi-concept composition must not be smuggled into a concept's operational principle simply to make it look complete.

---

## 3. 001-F artifacts

This phase produces:

- [Operational Principles](evidence/001-F-operational-principles.md) — archetypal principles for all 18 candidates entering the phase;
- [Operational-Principle Falsification Review](evidence/001-F-operational-principle-falsification.md) — explicit pass/fail analysis and candidate demotion;
- [Surviving Operational-Principle Baseline](evidence/001-F-surviving-candidate-baseline.md) — the 17-candidate handoff to 001-G.

These artifacts supersede the 001-E candidate baseline for discovery consolidation while preserving 001-E as the criteria-review record.

---

## 4. Phase result

001-F entered with **18 candidates**.

The operational-principle test produces:

- **17 surviving candidates**;
- **1 additional demotion: Registration**;
- no newly invented concepts;
- no revival of Authorization, Export, or Audit Trail;
- no return to current implementation aggregates/status models.

### Strong survivors

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

### Provisional-strong survivors

14. Controlled Disclosure
15. Dispatch

### Provisional survivors

16. Availability Window
17. Coverage Target

### Demoted during 001-F

18. Registration

---

## 5. Operational principles

The canonical 001-F evidence artifact contains the full principles. Their essential form is summarized here.

### Proposal

An originator establishes a durable offered subject and receives a stable reference to the thing under consideration.

**Behavioral center:** offer + durable subject identity.

### Revision

A mutable subject acquires a new current form while its earlier forms remain inspectable in sequence.

**Behavioral center:** change + retained history.

### Evaluation

An evaluator records their independently formed judgment about a subject, including private evaluation context where appropriate.

**Behavioral center:** owned judgment.

### Controlled Disclosure

Information is intentionally concealed at first and can later be deliberately revealed in context when application policy permits.

**Behavioral center:** staged exposure + reveal.

### Feedback

A source intentionally directs a response about a subject to a recipient/audience who can later inspect that response as intended communication.

**Behavioral center:** recipient-directed response.

### Selection

A decision maker records inclusion, non-inclusion, or reserve choice among candidates and may later make a new decision such as promotion.

**Behavioral center:** consequential organizer choice.

### Withdrawal

An originator rescinds their participation/commitment while unrelated decision histories remain untouched.

**Behavioral center:** originator agency over continuing participation.

### Availability Window

An organizer establishes an explicit interval during which a participation opportunity is upcoming, open, or closed and visible as such to affected participants.

**Behavioral center:** governed time-bounded opportunity.

### Coverage Target

An organizer records desired representation for a collection dimension/value/range without claiming or owning the collection's actual composition.

**Behavioral center:** explicit composition goal.

### Capacity

A finite pool accepts consumption and release according to accounting rules and exposes committed/remaining/saturated state.

**Behavioral center:** scarcity accounting.

### Classification

A participant associates a subject with reusable descriptive terms that can later be inspected, changed, or removed.

**Behavioral center:** subject-to-term association.

### Vocabulary

Reusable terms are contributed, corrected, made available, retired/restored, and retained as historically identifiable terms.

**Behavioral center:** evolving reusable-term lifecycle.

### Deliverable

A required artifact is provided, reviewed, and established as ready or needing attention.

**Behavioral center:** required artifact + readiness.

### Schedule

Eligible activities are placed into constrained place/time opportunities and may be moved, swapped, or unplaced; generated assistance does not replace explicit placement state.

**Behavioral center:** place/time allocation.

### Publication

Eligible material is intentionally made publicly available or later unpublished without changing the underlying material itself.

**Behavioral center:** public exposure.

### Archive

An active working context is closed into retained read-only internal history that remains inspectable after active operation ends.

**Behavioral center:** internal historical closure.

### Dispatch

An operational message and resolved audience are previewed, dispatched, and recorded with recipient outcomes and semantic duplicate/round behavior.

**Behavioral center:** performed audience communication.

---

## 6. Registration does not survive

Registration entered 001-F as a provisional candidate because current behavior tracks presenter VIP/event-registration state and future intent anticipates external registration systems.

Operational-principle development exposes a fundamental evidence problem.

### If Registration owns a real lifecycle

A natural Registration concept would likely include actions such as:

- register;
- confirm enrollment;
- cancel;
- perhaps waitlist or change enrollment.

MinneAnalytics does not currently own or clearly specify that behavior.

Creating it in 001-F would invent product semantics from generic event-domain intuition.

### If Registration owns only observed status

The concept becomes:

> record whether an externally or locally authoritative source says someone is registered.

That is too close to a sourced application fact with no independently meaningful lifecycle.

### Decision

Registration is **demoted from the current v0 concept set**.

The durable product need remains:

> MinneAnalytics may need an operational registration fact for a participant, potentially supplied by an external authoritative system, with provenance of its source.

That need remains application composition/future discovery evidence rather than being lost.

If MinneAnalytics later owns a real enrollment/registration workflow or materially richer registration-state management, concept discovery should be reopened from that evidence.

---

## 7. Strong boundary confirmations

Operational principles strengthen several earlier decompositions.

### Proposal versus Revision

Proposal can tell a complete “establish an offered subject” story without versioning.

Revision can tell a complete “change with retained prior forms” story over any referable mutable subject.

Their interaction is composition, not conceptual merger.

---

### Evaluation versus Controlled Disclosure versus Feedback

These now have visibly different archetypal behaviors:

- Evaluation: **what is my judgment?**
- Controlled Disclosure: **what information is intentionally withheld/revealed?**
- Feedback: **what response am I intentionally directing to someone else?**

A broad `Review` concept would switch purposes and actor relationships mid-principle.

---

### Selection versus Withdrawal

Selection and Withdrawal cannot be merged without switching:

- actor;
- purpose;
- source of state change;
- historical meaning.

The operational principles support independent histories even more strongly than the enum-based archaeology did.

---

### Capacity versus Schedule

Capacity reaches purpose closure by accounting for finite commitment capacity.

Schedule reaches purpose closure by allocating activities to place/time opportunities.

Neither requires the other to exist.

---

### Classification versus Vocabulary

Classification applies reusable terms.

Vocabulary maintains those terms as reusable resources over time.

A merged taxonomy/tagging concept would be less specific.

---

### Deliverable versus Publication

Deliverable answers whether a required artifact is ready.

Publication answers whether material is intentionally public.

A ready artifact may remain private with neither concept incomplete.

---

### Publication versus Archive

Publication is public exposure of material.

Archive is internal closure into retained history.

The historical use of “archive” for both product surfaces is definitively treated as terminology collision rather than one concept.

---

## 8. Provisional survivor guardrails

### Controlled Disclosure

Survives only while focused on:

- deliberate initial withholding;
- context-specific visibility;
- intentional reveal.

It must not become general resource authorization, confidentiality, or identity management.

### Dispatch

Survives only while focused on:

- operational message instance;
- resolved intended audience;
- performed send;
- recipient outcomes/history;
- duplicate/round semantics.

Feedback and general message-template authoring remain outside its current boundary.

### Availability Window

Survives because users can understand a governed opportunity as upcoming/open/closed, not merely because two timestamp fields exist.

It must not expand into general calendaring or scheduling.

### Coverage Target

Survives because expressing desired representation is itself a durable planning behavior.

It must never own authoritative actual composition. Actual composition and gap/excess remain application projections/comparisons.

---

## 9. Derived/application behaviors remain outside concepts

001-F confirms that operational principles do not require new concepts for:

- effective participation;
- evaluation freshness/currentness;
- needs-score/rescore queues;
- actual program composition;
- coverage gaps/excess;
- edit eligibility;
- schedule eligibility;
- publication eligibility;
- Dispatch recipient eligibility;
- authority grants/role policy;
- external-fact ingestion;
- reporting/export projections;
- cross-concept audit history.

These remain synchronization, application policy, derived representation, or future concept evidence.

---

## 10. Provenance rule remains intact

Operational-principle development reinforces the earlier dual-layer provenance rule.

Concepts preserve history required for their own behavior:

- Revision preserves earlier revisions;
- Selection preserves relevant organizer decision history;
- Withdrawal preserves rescission history;
- Vocabulary preserves term lifecycle/history;
- Dispatch preserves performed-send history;
- and so on where concept correctness requires history.

No global Audit Trail is required to make these operational principles coherent.

A future cross-concept activity history can still be discovered separately when it becomes an evidenced user-facing behavior.

---

## 11. 001-G baseline

The discovery set entering consolidation is:

### Strong

- Proposal
- Revision
- Evaluation
- Feedback
- Selection
- Withdrawal
- Capacity
- Classification
- Vocabulary
- Deliverable
- Schedule
- Publication
- Archive

### Provisional-strong

- Controlled Disclosure
- Dispatch

### Provisional

- Availability Window
- Coverage Target

**Total: 17.**

001-G should not automatically admit all 17 to formal specification simply because they survived their individual operational-principle tests.

The consolidation gate should look across the whole discovery corpus for:

- duplicated purposes;
- residual naming ambiguity;
- cross-candidate inconsistency;
- candidate gaps;
- any remaining accidental implementation influence;
- readiness for formal state/action specification.

---

## 12. 001-F exit criteria

- [x] Operational principle attempted for every 001-E survivor.
- [x] Principles are archetypal rather than exhaustive workflows.
- [x] Principles are written independently of current implementation structure.
- [x] No principle requires another concept's internal state.
- [x] Provisional candidates were actively challenged rather than automatically retained.
- [x] Registration was demoted when its operational principle could not be justified without invented behavior or weak mirrored-state semantics.
- [x] Earlier demotions remained demoted unless operational-principle work required reconsideration; none did.
- [x] Derived/application behavior remained outside the concept set.
- [x] Provenance remains intrinsic where required rather than delegated to a global log.
- [x] No implementation refactor was performed.
- [x] A clear 17-candidate baseline exists for discovery consolidation.

### Phase result

**001-F passes.**

The operational-principle gate reduces the candidate set from 18 to 17 and provides a concept-local behavioral story for every survivor.

---

## 13. Immediate next phase

**001-G — Discovery Consolidation & Concept Candidate Gate**

001-G should consolidate the complete 001-A through 001-F evidence chain and decide which candidates are ready to become the Phase 002 specification baseline.

It should explicitly classify each survivor as:

- admitted;
- admitted provisionally with open questions;
- deferred;
- rejected/demoted.

Only after 001-G should formal Concept specifications begin defining abstract state, actions, invariants, and later application synchronizations.
