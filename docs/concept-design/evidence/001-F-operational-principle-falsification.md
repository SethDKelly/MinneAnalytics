# 001-F Evidence — Operational-Principle Falsification Review

Status: **Complete for 001-F review**  
Concept model maturity: **v0 — discovery**  
Input: 18-candidate 001-E baseline and [001-F Operational Principles](001-F-operational-principles.md).

## 1. Purpose

This review evaluates whether each candidate's operational principle actually demonstrates a coherent concept or merely disguises:

- application policy;
- synchronization among other concepts;
- a derived view/state;
- implementation structure;
- future behavior not yet evidenced;
- excessive abstraction.

Passing 001-E established that a boundary was plausible. Passing 001-F requires that the boundary can be **explained behaviorally**.

---

## 2. Falsification tests

### F-01 — Singularity

Does one story reveal one central behavioral idea, or does the principle need several unrelated scenarios?

### F-02 — Purpose closure

At the end of the story, has the concept itself fulfilled its purpose without relying on hidden behavior elsewhere?

### F-03 — Independence

Can the story be told with generic references to actors/subjects/resources rather than another concept's private lifecycle?

### F-04 — Natural state/action implication

Does the story imply meaningful abstract state and actions that 002 can later specify, rather than merely a predicate or report?

### F-05 — Implementation neutrality

Would the story still make sense if current routes, tables, enums, tokens, UI surfaces, and providers disappeared?

### F-06 — Bounded genericity

Is the story reusable without becoming so broad that it absorbs neighboring concepts?

### F-07 — Evidence discipline

Does the story rely on current/historical behavior or valid abstraction thereof rather than inventing future product behavior to make the concept look complete?

---

## 3. Candidate result matrix

| Candidate | Singularity | Purpose closure | Independence | State/action signal | Genericity | Evidence discipline | Result |
|---|---|---|---|---|---|---|---|
| Proposal | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Revision | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Evaluation | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Controlled Disclosure | PASS | PASS | PASS | PASS | CONDITIONAL | PASS | **Survive with guardrail** |
| Feedback | PASS | PASS | PASS | PASS | CONDITIONAL | PASS | **Survive** |
| Selection | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Withdrawal | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Availability Window | PASS | PASS | PASS | PASS | CONDITIONAL | PASS | **Survive provisionally** |
| Coverage Target | PASS | PASS | PASS | PASS | PASS | PASS | **Survive provisionally** |
| Capacity | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Classification | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Vocabulary | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Deliverable | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Schedule | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Publication | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Archive | PASS | PASS | PASS | PASS | CONDITIONAL | PASS | **Survive with terminology guardrail** |
| Dispatch | PASS | PASS | PASS | PASS | PASS | PASS | **Survive** |
| Registration | CONDITIONAL | FAIL | CONDITIONAL | FAIL | PASS after narrowing | FAIL | **Demote** |

---

## 4. Strong confirmations

### Proposal / Revision separation strengthens

Operational principles for Proposal and Revision remain natural without one another.

Proposal's archetypal story is establishing a durable offered subject. Revision's story is preserving change over time for a referable subject.

The fact that MinneAnalytics synchronizes them does not create a shared concept.

**Result:** retain both independently.

---

### Evaluation / Controlled Disclosure / Feedback remain three concepts

The stories remain clearly different:

- Evaluation — form and retain one's judgment;
- Controlled Disclosure — stage/reveal information;
- Feedback — intentionally direct a response to a recipient.

None needs the others to explain its own purpose.

This falsifies the tempting “Review” umbrella concept more strongly than 001-D/001-E alone.

**Result:** retain all three independently.

---

### Selection / Withdrawal separation strengthens

Selection's story is organizer decision. Withdrawal's story is originator rescission.

Neither story becomes incomplete when the other is omitted.

Trying to merge them would require the operational principle to switch actor, purpose, and source of state change mid-story.

**Result:** retain both independently; effective participation remains composition.

---

### Vocabulary / Classification separation strengthens

Vocabulary tells one natural reusable-term lifecycle: contribute, correct, retire, restore.

Classification tells one natural association story: apply reusable terms to subjects.

The merged “Theme/Tagging” alternative would be less specific.

**Result:** retain both independently.

---

### Deliverable / Publication separation strengthens

Deliverable reaches closure when an artifact's readiness is established.

Publication reaches closure when material is intentionally made public or removed from public availability.

A ready artifact can remain unpublished without either concept being incomplete.

**Result:** retain both independently.

---

## 5. Provisional candidates that pass the OP gate

### Controlled Disclosure

**Concern entering 001-F:** could collapse into generic authorization/confidentiality.

**Why the OP passes:** staged concealment plus intentional reveal is a specific user-visible behavioral pattern. The concept can accept application-supplied reveal eligibility rather than owning general permissions.

**Guardrail:** the concept must not expand to “who may see any resource at any time.” Its behavioral center is information deliberately withheld and later disclosed in a participant context.

**Result:** survive as provisional-strong.

---

### Availability Window

**Concern entering 001-F:** might be no more than two date fields.

**Why the OP passes:** the user-recognizable behavior is an opportunity being upcoming, open, and closed according to an explicitly communicated interval that an organizer can establish/adjust.

The concept can stand without knowing the governed action's internals.

**Guardrail:** do not generalize into calendaring, scheduling, timers, or general temporal infrastructure.

**Result:** survive as provisional.

---

### Coverage Target

**Concern entering 001-F:** after removing observed composition, would a target alone be too thin?

**Why the OP passes:** expressing a desired minimum/maximum/range for a collection dimension is itself a durable planning act with meaningful lifecycle state. The organizer's target remains meaningful even before actual composition exists.

**Guardrail:** actual composition, gaps, warnings, and heatmaps remain derived projections/comparisons. Coverage Target must not cache or own them as authoritative state.

**Result:** survive as provisional.

---

### Dispatch

**Concern entering 001-F:** could overlap Feedback or depend directly on recipient-source concepts.

**Why the OP passes:** previewing and performing an audience send, preserving recipient outcomes, and enforcing semantic duplicate/round behavior form one coherent lifecycle.

Eligibility may be supplied to Dispatch rather than discovered by direct knowledge of Selection, Deliverable, or other concept internals.

**Guardrail:** generic interpersonal response belongs to Feedback; reusable content/template authoring is not promoted without an independently evidenced lifecycle.

**Result:** survive as provisional-strong.

---

## 6. Registration failure analysis

Registration entered 001-F as a deliberately narrow replacement for the over-generalized Obligation candidate.

The purpose evidence remains real:

- organizers currently track a VIP/event-registration fact for approved presenters;
- future intent anticipates external registration systems becoming authoritative.

However, the operational-principle test exposes a boundary problem.

### Alternative A — Registration owns the registration transaction/lifecycle

A strong generic Registration concept would naturally support behavior such as:

- participant registers;
- registration is confirmed;
- participant cancels;
- waitlist/enrollment may change.

MinneAnalytics does not currently own or clearly intend this lifecycle. Adding those actions would use outside domain intuition to invent product semantics.

**Rejected for evidence discipline.**

### Alternative B — Registration owns only known registration status

The concept could instead say:

- participant has status registered/not registered;
- organizer or external system supplies the state;
- organizer inspects it.

This is too weak for a concept. It is primarily an externally/local-sourced fact used by other workflows, with no independently evidenced lifecycle beyond status observation.

**Rejected for completeness/state-action weakness.**

### Decision

Demote Registration from the current v0 concept set.

Preserve the need as:

> **MinneAnalytics may consume/track an externally or locally authoritative participation-registration fact for operational coordination, with provenance of its source.**

This remains an application composition/future discovery signal until the product owns or meaningfully manages a registration/enrollment lifecycle.

This demotion does **not** imply registration is unimportant. It means current evidence is insufficient to claim it as an independent Concept Design concept.

---

## 7. Derived behaviors still excluded after OP development

Operational-principle work does not revive any of the following:

- effective participation status;
- current/stale Evaluation status as a standalone concept;
- needs-score / needs-rescore queues;
- actual program composition;
- coverage gaps/excess;
- edit eligibility;
- publication eligibility;
- Dispatch recipient eligibility;
- externally authoritative fact ingestion;
- authorization grants/role model;
- export/report projection;
- global audit trail;
- generic workflow/status concept.

Each remains composition, application policy, representation, or future concept evidence.

---

## 8. 001-F falsification result

001-F entered with **18 candidates**.

- **17 survive operational-principle development**.
- **1 is demoted:** Registration.
- No new candidate is introduced merely to maintain concept count.
- No demoted 001-E candidate is revived.

The surviving set is sufficiently coherent to proceed to 001-G discovery consolidation and candidate gating.
