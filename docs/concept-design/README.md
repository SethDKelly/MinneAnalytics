# MinneAnalytics Concept Design

This directory contains the repository's Daniel Jackson–style Concept Design retrofit.

## Current status

- **Concept model maturity:** v0 — discovery
- **Working branch:** `concept-design/v0-discovery`
- **Current phase:** 001 — Discovery & Archaeology
- **Completed:**
  - 001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules
  - 001-B — Historical Intent Reconstruction & Repository Archaeology
  - 001-C — Problem, Actor-Need & Purpose Inventory
  - 001-D — Candidate Concept Discovery & Boundary Hypotheses
  - 001-E — Concept Criteria, Independence & Genericity Review
- **Next:** 001-F — Operational Principle Development

## Design authority

The Concept Design model describes MinneAnalytics' intended behavioral structure independently of the current implementation.

Existing code, schemas, routes, UI organization, APIs, and architecture documentation are evidence of implemented behavior and historical decisions. They are not, by themselves, authoritative definitions of concepts or concept boundaries.

During v0 discovery, conflicts between recovered intent, current behavior, future intent, implementation, and new design hypotheses must be recorded rather than silently resolved in favor of the existing implementation.

See [001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules](001-A-design-authority-methodology-evidence-and-anti-bias.md) for the governing methodology.

## Working progression

### 001 — Discovery & Archaeology

1. **001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules** — complete
2. **001-B — Historical Intent Reconstruction & Repository Archaeology** — complete
3. **001-C — Problem, Actor-Need & Purpose Inventory** — complete
4. **001-D — Candidate Concept Discovery & Boundary Hypotheses** — complete
5. **001-E — Concept Criteria, Independence & Genericity Review** — complete
6. **001-F — Operational Principle Development** — next
7. **001-G — Discovery Consolidation & Concept Candidate Gate**

Later phases will specify surviving concepts, define application composition and synchronizations, reconcile the conceptual model against the existing implementation, and consolidate a canonical v0 baseline. Their exact subdivision will be determined from the discovery results rather than fixed prematurely.

## 001-B archaeology baseline

001-B reconstructs historical product intent without promoting implementation structures into concepts. Its central finding is that current documentation alone is not a complete design-history source: both the original implementation plan and the detailed conference-v2 planning/backlog documents were intentionally removed after their implementation milestones, so immutable repository history remains first-class evidence.

### 001-B artifacts

- [001-B — Historical Intent Reconstruction & Repository Archaeology](001-B-historical-intent-reconstruction-and-repository-archaeology.md) — synthesis and exit review
- [Source Register](evidence/001-B-source-register.md) — evidence classes, sources, weights, and cautions
- [Repository Timeline](evidence/001-B-repository-timeline.md) — chronological intent reconstruction
- [Historical Intent Ledger](evidence/001-B-intent-ledger.md) — normalized behavioral intent and explicit non-intent observations
- [Terminology, Contradictions & Exclusions](evidence/001-B-terminology-contradictions-and-exclusions.md) — inherited vocabulary risks, unresolved evidence, and implementation/demo exclusions

## 001-C purpose baseline

001-C inserts an explicit problem/need/purpose layer between repository archaeology and concept discovery. This prevents the retrofit from simply renaming current tables, enums, roles, or pages as concepts.

The baseline contains:

- **27 implementation-neutral problems**;
- **12 behavioral actor roles** defined by responsibility rather than current role enums;
- actor-specific needs and cross-actor tensions;
- **26 purpose candidates** with explicit scope/non-goals;
- a traceability mapping covering all 52 positive 001-B intent observations;
- explicit preservation of every relevant 001-B ambiguity and implementation/demo exclusion.

### 001-C artifacts

- [001-C — Problem, Actor-Need & Purpose Inventory](001-C-problem-actor-need-and-purpose-inventory.md) — synthesis and exit review
- [Problem Inventory](evidence/001-C-problem-inventory.md) — implementation-neutral problem statements
- [Actor-Need Inventory](evidence/001-C-actor-needs.md) — behavioral actors, needs, and tensions
- [Purpose Inventory](evidence/001-C-purpose-inventory.md) — purpose candidates, non-goals, overlap, and consolidation tests
- [Traceability Matrix](evidence/001-C-traceability-matrix.md) — 001-B intent → problem → actor need → purpose disposition

## 001-D candidate baseline

001-D is the first phase to propose concept names and boundaries. It produces a **testable, non-canonical candidate decomposition** derived from the 001-C purposes rather than from the implementation.

The baseline entered 001-E with **21 candidates**:

- **Strong:** Proposal, Revision, Evaluation, Disclosure, Feedback, Selection, Retraction, Capacity, Classification, Vocabulary, Deliverable, Schedule, Publication, Archive.
- **Provisional:** Availability Window, Authorization, Coverage, Communication, Export, Obligation.
- **Exploratory:** Audit Trail.

Key 001-D decomposition findings included:

- `Submission` is not a concept boundary;
- `ProgramStatus` likely flattens Selection and Retraction histories;
- `AbstractReviewStatus` decomposes across Revision, Feedback, Evaluation composition, and unresolved acknowledgement;
- `Theme` decomposes into Vocabulary, Classification, and Coverage;
- Evaluation, Disclosure, and Feedback remain distinct despite sharing review UI;
- Selection, Deliverable readiness, and Publication remain distinct downstream decisions;
- public publication and internal completed-event Archive are distinct;
- `Program` and `Conference` are not accepted as coordinating god concepts.

### 001-D artifacts

- [001-D — Candidate Concept Discovery & Boundary Hypotheses](001-D-candidate-concept-discovery-and-boundary-hypotheses.md) — synthesis and exit review
- [Candidate Concept Inventory](evidence/001-D-candidate-concept-inventory.md) — 21 candidate hypotheses, purpose basis, proposed scope, and alternatives
- [Concept Boundary Hypotheses](evidence/001-D-boundary-hypotheses.md) — explicit split/merge/composition tests
- [Purpose → Candidate Traceability](evidence/001-D-purpose-to-candidate-traceability.md) — disposition of every 001-C purpose and inherited implementation noun
- [Composition Signals & Explicit Non-Concepts](evidence/001-D-composition-signals-and-non-concepts.md) — likely synchronization signals, application-policy signals, and rejected accidental concepts

## 001-E criteria baseline

001-E adversarially tests every 001-D candidate for **specificity, completeness, independence, and genericity** rather than preserving the candidate list by default.

The review changes the set materially:

- **13** candidates survive substantially as proposed;
- **5** survive only after material rename/narrowing/replacement;
- **3** are demoted from the current v0 concept set.

### 001-F candidate set — 18

**Strong:**

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

**Provisional-strong:**

- Controlled Disclosure
- Dispatch

**Provisional:**

- Availability Window
- Coverage Target
- Registration

### Demoted from the current concept set

- **Authorization** — retained as application-wide authority policy/composition concern; future delegation/grant behavior may justify rediscovery.
- **Export** — retained as cross-concept representation/projection capability rather than authoritative concept state.
- **Audit Trail** — retained as provenance design rule plus future cross-concept audit signal.

### Major 001-E corrections

- `Disclosure` → **Controlled Disclosure** to avoid generic access-control semantics.
- `Retraction` → **Withdrawal** to describe originator participation agency precisely.
- `Coverage` → **Coverage Target**; actual composition is derived from Selection + Classification/attributes rather than duplicated concept state.
- `Communication` → **Dispatch** to separate operational sends from Feedback and current template storage.
- `Obligation` → **Registration** because the generalized obligation umbrella was too broad for the evidence.
- effective participation, evaluation freshness, edit eligibility, actual composition, coverage gaps, publication eligibility, and dispatch recipient eligibility remain **derived/composed behavior**, not new concepts.

### 001-E artifacts

- [001-E — Concept Criteria, Independence & Genericity Review](001-E-concept-criteria-independence-and-genericity-review.md) — synthesis and exit review
- [Concept Criteria Scorecard](evidence/001-E-criteria-scorecard.md) — all 21 candidate dispositions
- [Independence & Composition Review](evidence/001-E-independence-and-composition-review.md) — direct-dependency tests and retained composition signals
- [Genericity & Boundary Decisions](evidence/001-E-genericity-and-boundary-decisions.md) — under/over-generalization corrections and naming decisions
- [Surviving Candidate Baseline](evidence/001-E-surviving-candidate-baseline.md) — authoritative candidate handoff into 001-F

Passing 001-E does not make these candidates canonical. 001-F must still attempt to falsify each one through a concise, natural operational principle.

## Branch discipline

The v0 discovery branch is documentation/design work unless a later reconciliation phase explicitly authorizes implementation changes. Concept discovery must not opportunistically refactor the application to fit provisional hypotheses.
