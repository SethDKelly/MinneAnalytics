# 001-E Evidence — Genericity & Boundary Decisions

Status: **Complete for 001-E review**  
Concept model maturity: **v0 — discovery**

## 1. Purpose

Genericity is not a directive to make every concept maximally abstract.

For this retrofit, a concept is appropriately generic when it:

- captures the stable behavioral essence rather than current implementation vocabulary;
- can survive foreseeable variations already evidenced in repository history/roadmap;
- does not absorb neighboring purposes merely to create a reusable umbrella;
- remains easy for a user/domain participant to understand through one operational principle.

This artifact records where 001-E intentionally generalized, intentionally narrowed, or refused to generalize.

---

## 2. Under-generalization corrected

### `Submission` → Proposal + independent neighboring concepts

`Submission` was too implementation-specific and accumulated many responsibilities.

The candidate model keeps **Proposal** as the durable offered subject while Revision, Selection, Withdrawal, Classification, Deliverable, Registration, etc. remain independent.

**Decision:** do not use `Submission` as a concept name/boundary.

---

### `Score` → Evaluation

A numeric 0–1 value is one representation of independent judgment.

**Decision:** `Evaluation` is the durable concept; numeric scale and aggregate display are application representation/policy.

---

### `Blind Review` → Controlled Disclosure

“Blind review” is one configured use of staged information exposure.

The durable behavior is hiding and intentionally revealing information at policy-defined moments.

**Decision:** use **Controlled Disclosure**, but keep it narrower than general authorization/confidentiality.

---

### `Theme` → Vocabulary + Classification + Coverage Target

The current `Theme` abstraction combines:

- reusable terms and their lifecycle;
- applying those terms to subjects;
- desired representation goals;
- derived composition analytics.

**Decision:** retain separate Vocabulary, Classification, Coverage Target. Actual composition remains derived.

---

### `Deck` / `DeckStatus` → Deliverable

Presentation decks are one required downstream artifact.

**Decision:** use Deliverable so the concept can support other required artifacts without changing its purpose.

---

### current scheduling algorithm → Schedule

Technical-level balancing is a strategy. Future attendee demand/waitlist data may inform the same placement behavior.

**Decision:** Schedule owns place/time allocation, not one heuristic.

---

### public “slide archive” → Publication

Calling public slides an archive obscures the purpose: intentional public exposure.

**Decision:** use Publication for public access; reserve Archive for internal retained closure/history.

---

### email → Dispatch

Email/stub/provider is transport realization.

**Decision:** Dispatch owns performed operational-message behavior and send history independent of provider.

---

### VIP toggle → Registration

The behavioral fact is participant registration state, potentially supplied by external systems.

**Decision:** use Registration rather than `vipRegistered` or a provider name.

---

## 3. Over-generalization rejected

### Obligation

`Obligation` could encompass Deliverables, deadlines, registration, compliance, payment, training, and unrelated checkpoints.

The repository does not support one coherent operational principle across that breadth.

**Decision:** replace with the narrower Registration candidate. Rediscover other obligation-like concepts when distinct purposes emerge.

---

### Communication

A broad Communication concept risks swallowing Feedback, notifications, operational campaigns, and potentially any message-like behavior.

**Decision:** narrow to Dispatch for operational audience-targeted sends. Feedback remains a separate subject-response concept.

---

### Disclosure as generic access control

General information authorization would overlap application authority, authentication, confidentiality, and security infrastructure.

**Decision:** Controlled Disclosure is specifically staged/intentional exposure where timing itself matters to user behavior.

---

### Authorization

General authorization across every action is important but currently behaves mainly as application-wide policy.

**Decision:** do not promote infrastructure-like RBAC abstraction into a current product concept without an independent user-visible delegation/grant lifecycle.

---

### Export

“Anything can be exported” is too cross-cutting to establish an independent concept under current evidence.

**Decision:** treat external representations as projection/output capabilities until persistent report/export-definition behavior emerges.

---

### Audit Trail

A general event log can easily become implementation observability rather than user-facing product behavior.

**Decision:** preserve concept-intrinsic provenance and defer cross-concept Audit Trail until the planned organizational audit capability becomes concrete.

---

## 4. Genericity decisions on surviving candidates

### Proposal

Generic enough to represent candidate offered session content, but not generic “entity submission.”

### Revision

Subject-agnostic version/change history is appropriate. Do not specialize to abstract text.

### Evaluation

Judgment representation is generic; MinneAnalytics may currently use numeric score + private note.

### Controlled Disclosure

Generic across identity and aggregate-score exposure. Do not broaden to all access control.

### Feedback

Generic across recipient-directed responses about a subject. Current committee→originator use is authoritative; future attendee use must fit naturally or split later.

### Selection

Generic organizer choice among candidates. Current approved/declined/backup vocabulary is application policy/state representation.

### Withdrawal

Generic originator rescission of participation/commitment. Do not broaden to content deletion or event cancellation.

### Availability Window

Generic time-bounded availability of a governed opportunity. Do not broaden into general calendar/scheduling infrastructure.

### Coverage Target

Generic desired representation over a dimension/bucket. Do not make theme the only supported dimension.

### Capacity

Generic scarce commitment capacity. Current sponsor/community accounting is a policy/example.

### Classification

Generic subject-to-term association.

### Vocabulary

Generic reusable-term lifecycle with participant contribution and steward governance.

### Deliverable

Generic required downstream artifact/readiness behavior.

### Schedule

Generic allocation to constrained place/time opportunities with optional assistance.

### Publication

Generic intentional public exposure of eligible material.

### Archive

Generic retained read-only closure of a working context, but terminology must remain distinct from Publication.

### Dispatch

Generic operational dispatch independent of email provider. Do not absorb Feedback.

### Registration

Generic event/participation registration state independent of local/external source. Do not expand back into arbitrary obligations.

---

## 5. Domain vocabulary intentionally retained

Concept Design genericity does not require replacing every understandable domain word with a universal abstraction.

The following names remain useful because their purposes are crisp and portable enough:

- Proposal
- Evaluation
- Selection
- Withdrawal
- Schedule
- Publication
- Registration

Replacing them with terms such as `Item`, `Decision`, `State`, `Allocation`, or `ExternalCheckpoint` would reduce user comprehensibility without improving independence.

---

## 6. Genericity constraints from future intent

Future evidence is used as a **stress test**, not as permission to invent current behavior.

### Conflict-of-interest registry

Controlled Disclosure must not absorb conflict declaration/recusal. If that future purpose becomes concrete, discover a separate candidate.

### Approved-content unlock

Revision must remain generic enough that application policy can permit post-selection edits without changing the concept.

### Sched attendance/demand

Schedule must accept new planning signals without owning attendee enrollment/demand semantics.

### External registration systems

Registration must be source-neutral.

### In-room audience feedback

Feedback should be tested for reuse, but current committee feedback remains the proven operational center. Split if a single operational principle becomes vague.

### Cross-concept audit

Intrinsic histories must remain correct even if a future Audit Trail is added.

---

## 7. Naming decisions entering 001-F

| 001-D name | 001-E name | Reason |
|---|---|---|
| Proposal | Proposal | Already precise and generic enough |
| Revision | Revision | Already precise and reusable |
| Evaluation | Evaluation | Better than current `Score` |
| Disclosure | **Controlled Disclosure** | Avoid generic access-control interpretation |
| Feedback | Feedback | Current boundary remains coherent |
| Selection | Selection | Separates organizer choice from Withdrawal |
| Retraction | **Withdrawal** | Better matches participation agency; avoids content-retraction ambiguity |
| Availability Window | Availability Window | Keep provisional |
| Coverage | **Coverage Target** | Remove derived actual-composition responsibility |
| Capacity | Capacity | Stable |
| Classification | Classification | Stable |
| Vocabulary | Vocabulary | Stable |
| Deliverable | Deliverable | Stable |
| Schedule | Schedule | Stable |
| Publication | Publication | Stable |
| Archive | Archive | Keep explicit internal-history definition |
| Communication | **Dispatch** | Narrow away from Feedback/template umbrella |
| Obligation | **Registration** | Prevent over-generalized obligation umbrella |

Demoted names not entering 001-F: Authorization, Export, Audit Trail.

---

## 8. Result

The surviving concept names are generic enough to avoid current implementation accidents but specific enough to support one recognizable behavioral story each.

The most important genericity result is negative:

> **More abstract is not automatically better.**

001-E deliberately rejects `Obligation`, broad `Communication`, generic `Authorization`, and generic `Export`/`Audit` abstractions where reuse would come at the cost of a focused user-visible purpose.