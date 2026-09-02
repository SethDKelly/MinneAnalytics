# 001-E Evidence — Surviving Candidate Baseline

Status: **Complete for 001-E review**  
Concept model maturity: **v0 — discovery**  
Purpose: define the candidate set that is allowed to proceed into 001-F operational-principle development.

## 1. Interpretation

This document supersedes the 001-D candidate-status classification for purposes of later discovery work.

It does **not** make any candidate canonical.

Every candidate below must still survive 001-F by supporting a concise, natural operational principle that demonstrates the concept fulfilling its purpose without requiring implementation structure or another concept's internal behavior.

---

## 2. 001-F candidate set

### Strong candidates

| ID lineage | 001-E candidate | Purpose center | 001-F falsification focus |
|---|---|---|---|
| CC-001 | **Proposal** | Establish a durable offered subject for organized consideration. | Can the story remain independent of revision/selection? |
| CC-002 | **Revision** | Change a subject while preserving prior forms/history. | Can change history be told without edit-policy or Evaluation freshness? |
| CC-003 | **Evaluation** | Record an independently formed judgment about a subject. | Can it remain independent from Selection and Disclosure? |
| CC-005 | **Feedback** | Deliver recipient-directed response about a subject, distinct from private judgment. | Does one natural OP cover the proven committee→originator case without becoming generic messaging? |
| CC-006 | **Selection** | Record consequential organizer choice among candidates. | Can reserve/promotion fit one focused decision concept without Withdrawal? |
| CC-007 | **Withdrawal** | Preserve originator agency to rescind participation independently of organizer choice. | Does the OP clearly preserve Selection history? |
| CC-011 | **Capacity** | Represent scarce commitment capacity and its consumption. | Can the OP exist before a schedule and without selecting candidates? |
| CC-012 | **Classification** | Associate subjects with shared descriptive terms. | Can it remain independent of term lifecycle/governance? |
| CC-013 | **Vocabulary** | Maintain an evolving reusable set of terms with contribution and stewardship. | Does contribution+moderation feel like one term-lifecycle story? |
| CC-014 | **Deliverable** | Obtain a required artifact and establish readiness. | Can readiness remain independent of Selection and Publication? |
| CC-015 | **Schedule** | Allocate eligible activities to constrained place/time opportunities. | Can the OP omit current heuristics and future provider details? |
| CC-016 | **Publication** | Intentionally expose eligible material publicly. | Can it remain distinct from readiness and Archive? |
| CC-017 | **Archive** | Close an active context into retained read-only internal history. | Can it avoid becoming a Conference lifecycle/god concept? |

### Provisional-strong candidates

| ID lineage | 001-E candidate | Purpose center | 001-F falsification focus |
|---|---|---|---|
| CC-004 | **Controlled Disclosure** | Stage exposure of information whose visibility timing matters, with justified reveal. | Produce an OP that is not generic RBAC/confidentiality and does not require Evaluation internals. |
| CC-018 | **Dispatch** | Send operational messages to a resolved audience with durable performed-send semantics. | Produce an OP that does not absorb Feedback or require recipient-source concept internals. |

### Provisional candidates

| ID lineage | 001-E candidate | Purpose center | 001-F falsification focus |
|---|---|---|---|
| CC-008 | **Availability Window** | Establish a visible time-bounded opportunity for a governed action. | Show behavior richer and more user-recognizable than “two timestamps.” |
| CC-010 | **Coverage Target** | Express desired representation along a relevant collection dimension. | Show a complete OP without importing actual composition state. |
| CC-020 | **Registration** | Track participant registration state independently of program selection and source system. | Show current/future behavior coherent enough to justify more than a registration flag. |

Total entering 001-F: **18 candidates**.

---

## 3. Candidates removed from the current set

### CC-009 — Authorization

**Disposition:** application-wide authority policy/composition concern.

**Reason:** current evidence does not establish an independently user-visible grant/delegation/revocation lifecycle. Reopen if future product behavior creates one.

### CC-019 — Export

**Disposition:** cross-concept external representation/projection capability.

**Reason:** current behavior is an operation over source state rather than an independent lifecycle with authoritative state.

### CC-021 — Audit Trail

**Disposition:** provenance design rule + future concept signal.

**Reason:** current histories are feature/concept-specific; future cross-concept append-only audit remains roadmap intent.

---

## 4. Purpose disposition after 001-E

| 001-C purpose | 001-E disposition |
|---|---|
| PU-001 durable offer | Proposal |
| PU-002 change history | Revision |
| PU-003 govern mutability | Composition: Revision + Availability Window + authority policy + application state/exception rules |
| PU-004 independent judgment | Evaluation |
| PU-005 judgment applicability | Composition: Evaluation subject reference + current Revision + application aggregation/work policy |
| PU-006 controlled exposure | Controlled Disclosure |
| PU-007 originator-directed response | Feedback |
| PU-008 consequential choice | Selection |
| PU-009 originator participation agency | Withdrawal |
| PU-010 delegated authority | Application authority policy; no current standalone concept |
| PU-011 desired composition | Coverage Target |
| PU-012 observed composition | Derived application projection/view over Selection + Classification/attributes, compared with Coverage Target where present |
| PU-013 heterogeneous scarce capacity | Capacity |
| PU-014 shared descriptive association | Classification |
| PU-015 participant vocabulary extension | Vocabulary |
| PU-016 vocabulary governance/history | Vocabulary |
| PU-017 required artifact readiness | Deliverable |
| PU-018 place/time allocation | Schedule |
| PU-019 public exposure | Publication |
| PU-020 retained read-only historical closure | Archive |
| PU-021 operational communication | Dispatch; reusable templates are supporting input/configuration in v0 |
| PU-022 portable external representation | Cross-concept projection capability; no concept candidate |
| PU-023 downstream registration state | Registration |
| PU-024 externally authoritative facts | Synchronization/adapters into the concept/application state that owns the behavioral fact; preserve provenance |
| PU-025 attendee session response | Future compatibility/split test for Feedback; not claimed as current proof |
| PU-026 provenance | Intrinsic concept history design rule; future Audit Trail signal |

Every 001-C purpose remains accounted for after demotions and boundary changes.

---

## 5. Implementation nouns still excluded

The 001-E baseline must not be translated back into implementation nouns prematurely.

The following remain non-authoritative:

- `Submission`
- `Theme`
- `Score`
- `ProgramStatus`
- `AbstractReviewStatus`
- `DeckStatus`
- `Conference`
- `Program`
- `BOARD`, `CHAIR`, `ADMIN`
- dashboards/tabs/routes/APIs
- provider/integration names
- current persistence/module boundaries

The 001-F operational principles must be written from candidate purposes, not from those artifacts.

---

## 6. Composition assumptions entering 001-F

001-F may assume only the following at a high level:

- concepts may refer to generic actors/subjects/resources without knowing neighboring concept internals;
- MinneAnalytics composes independent concepts through later synchronizations/application policy;
- effective state such as “currently participating,” “current evaluation,” “coverage gap,” “publishable,” or “eligible recipient” may be derived rather than owned by a new concept;
- authority and authentication are not concept names in the current v0 set;
- provenance required for concept correctness remains intrinsic;
- future capabilities may stress-test genericity but may not be invented into current operational principles.

---

## 7. Candidate maturity entering 001-F

Passing 001-E means only:

> “This boundary is coherent enough to deserve an operational-principle test.”

It does not mean:

- state/actions are final;
- concept names are immutable;
- synchronizations are defined;
- implementation should be refactored;
- every future use belongs in the concept;
- the concept has passed the v0 discovery gate.

001-F is expected to remove or revise candidates whose operational principles become vague, compound, implementation-shaped, or dependent on other concepts.