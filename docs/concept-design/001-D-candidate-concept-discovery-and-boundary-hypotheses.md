# 001-D — Candidate Concept Discovery & Boundary Hypotheses

Status: **Complete**  
Concept model maturity: **v0 — discovery**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-C — Problem, Actor-Need & Purpose Inventory](001-C-problem-actor-need-and-purpose-inventory.md)

## 1. Purpose

001-D converts the implementation-neutral purposes established in 001-C into a **testable candidate concept decomposition**.

This is the first phase that intentionally proposes concept names and boundaries.

It does **not** canonize them.

The phase asks:

> Which purpose or related set of purposes can plausibly be satisfied by one coherent, independently understandable behavioral concept, and which relationships are better represented through synchronization or application policy?

The result is a candidate set that 001-E must attempt to falsify using Daniel Jackson's concept criteria: specificity, completeness, independence, and genericity.

---

## 2. Governing rules

### D-01 — Candidate names are hypotheses

A familiar noun such as `Proposal`, `Evaluation`, `Selection`, or `Schedule` is not accepted because it sounds domain-correct. It must survive later criteria and operational-principle review.

### D-02 — Implementation structure remains non-authoritative

No candidate is justified by:

- Prisma model boundaries;
- enum boundaries;
- route/API organization;
- page/dashboard structure;
- token/role implementation;
- current component/service boundaries.

### D-03 — Interaction does not imply merger

If two purposes interact heavily but can be independently explained, the default test is composition through synchronization rather than one combined concept.

### D-04 — Glue purposes should not become glue concepts automatically

A purpose that primarily expresses a relationship among concepts may be represented through synchronization/application policy instead of a standalone concept.

This rule is applied especially to:

- edit eligibility;
- evaluation freshness/applicability;
- externally authoritative fact ingestion.

### D-05 — One implementation object may decompose into many candidates

This phase explicitly permits one existing implementation object to map across multiple concepts when the purposes differ.

### D-06 — One candidate may tentatively serve multiple purposes

Where genericity suggests one coherent behavior, 001-D may propose a merged candidate and carry a split test into 001-E.

### D-07 — Provenance cannot be solved by one global log alone

Historical truth required for a concept's own correct behavior remains intrinsic to that concept. A cross-cutting Audit Trail candidate may complement but not replace it.

---

## 3. 001-D artifacts

This phase produces:

- [Candidate Concept Inventory](evidence/001-D-candidate-concept-inventory.md)
- [Concept Boundary Hypotheses](evidence/001-D-boundary-hypotheses.md)
- [Purpose → Candidate Traceability](evidence/001-D-purpose-to-candidate-traceability.md)
- [Composition Signals & Explicit Non-Concepts](evidence/001-D-composition-signals-and-non-concepts.md)

Together they define the v0 candidate baseline for 001-E.

---

## 4. Candidate concept baseline

001-D proposes **21 candidate concepts**.

### Strong candidates

1. **CC-001 — Proposal**
2. **CC-002 — Revision**
3. **CC-003 — Evaluation**
4. **CC-004 — Disclosure**
5. **CC-005 — Feedback**
6. **CC-006 — Selection**
7. **CC-007 — Retraction**
8. **CC-011 — Capacity**
9. **CC-012 — Classification**
10. **CC-013 — Vocabulary**
11. **CC-014 — Deliverable**
12. **CC-015 — Schedule**
13. **CC-016 — Publication**
14. **CC-017 — Archive**

### Provisional candidates

15. **CC-008 — Availability Window**
16. **CC-009 — Authorization**
17. **CC-010 — Coverage**
18. **CC-018 — Communication**
19. **CC-019 — Export**
20. **CC-020 — Obligation**

### Exploratory candidate

21. **CC-021 — Audit Trail**

The status describes confidence in the **boundary**, not importance of the underlying user need.

For example, delegated authority is a very strong need even though `Authorization` remains provisional as a standalone concept.

---

## 5. Purposes intentionally represented by composition rather than direct candidates

### 5.1 Mutable-content eligibility

001-C PU-003 does not become a `Mutability` or `EditStatus` concept.

Preferred 001-D hypothesis:

```text
Revision behavior
+ temporal availability where applicable
+ delegated authorization where applicable
+ application-specific state/policy
→ whether revision action is currently permitted
```

This prevents Revision from inheriting current conference-specific status rules.

### 5.2 Evaluation applicability after revision

001-C PU-005 does not become `Validity`, `Freshness`, or `Rescore` as a standalone concept.

Preferred hypothesis:

```text
Evaluation refers to the revision/subject it judged
Revision identifies what is current
application synchronization/policy decides present participation
```

An older Evaluation therefore remains historical truth rather than being mutated into “invalid.”

### 5.3 External authoritative facts

001-C PU-024 does not become a provider/integration concept.

Preferred hypothesis:

```text
external authoritative source
        ↓ synchronization / adapter
concept that owns the behavioral fact
        ↓
preserve source/provenance
```

Examples may include Obligation fulfillment, scheduling demand, attendance, or capacity inputs.

---

## 6. Major decomposition findings

### 6.1 `Submission` is not the concept model

The current implementation's `Submission` aggregate is explicitly rejected as a candidate boundary.

Its historical responsibilities distribute across at least:

- Proposal;
- Revision;
- Selection;
- Retraction;
- Classification;
- Capacity-related classification/accounting;
- Obligation;
- Deliverable;
- associated authority and availability policy.

This is the clearest demonstration that the retrofit is not a renaming exercise.

---

### 6.2 `ProgramStatus` likely flattens independent histories

Current values combine organizer-originated decisions and originator-originated withdrawal.

001-D's preferred hypothesis separates:

- **Selection** — organizer inclusion/non-inclusion/reserve decision;
- **Retraction** — originator rescission of participation.

The effective application question “is this session currently participating?” may depend on both.

This preserves the historically supported fact that a proposal can have been selected and later retracted.

---

### 6.3 `AbstractReviewStatus` is decomposed rather than redesigned as another enum

The current/demo workflow states span several independent concerns:

- revision history;
- presenter-directed feedback;
- evaluation freshness relative to revision;
- organizational acknowledgement of a change.

001-D does not replace the enum with a cleaner conceptual enum.

Instead:

- Revision owns change history;
- Feedback owns intentional originator-facing response;
- Evaluation owns judgment;
- Revision↔Evaluation composition owns current-applicability behavior;
- acknowledgement remains unresolved until a singular purpose can be established.

---

### 6.4 `Theme` decomposes into three behavioral areas

The existing `Theme` structure contains at least three distinct purposes:

1. **Vocabulary** — which reusable descriptive terms exist and how they evolve/govern.
2. **Classification** — which terms describe a particular subject.
3. **Coverage** — what representation organizers desire and observe across a collection.

001-D therefore rejects “Theme” as a concept boundary.

The preferred model also treats technicality as another possible Coverage dimension rather than creating a second composition concept.

---

### 6.5 Evaluation, disclosure, and feedback stay separate

Although these behaviors appear together in committee review UI, 001-D proposes three candidates:

- **Evaluation** — independent judgment;
- **Disclosure** — controlled information exposure/reveal;
- **Feedback** — intentional response intended for another actor.

Private evaluator notes remain part of Evaluation context rather than Feedback.

The fact that all three occur on one review screen is explicitly ignored for boundary purposes.

---

### 6.6 Acceptance, deliverable readiness, and publication stay separate

The downstream flow is not treated as one status progression.

Preferred candidates:

- **Selection** — should the candidate participate?
- **Deliverable** — has required material been provided and is it operationally ready?
- **Publication** — should eligible material be intentionally exposed publicly?

An approved talk can lack a ready deck. A ready deck can still be non-shareable. Those independently meaningful facts support separate boundaries.

---

### 6.7 Public archive and historical archive are different concepts

Repository language uses “archive” for two distinct ideas.

001-D separates:

- **Publication** — public exposure of eligible post-event material;
- **Archive** — retaining completed-event state internally while ordinary mutation ends.

This avoids a concept with two incompatible audiences and purposes.

---

### 6.8 Program formation is composition, not a `Program` god concept

The act of building a program composes:

- Evaluation information;
- Selection;
- Capacity;
- Coverage;
- Classification;
- Retraction/participation state;
- later Schedule allocation.

001-D does **not** create a broad `Program` candidate whose purpose is “manage all of this.”

The workflow may be unified in UI while remaining conceptually modular.

---

## 7. Important tentative merges

001-D intentionally proposes several **merged candidate hypotheses** so 001-E can test whether the generic behavior is coherent.

### Feedback

Tentatively spans:

- committee → content originator feedback today;
- attendee → organizer/session feedback in future intent.

The generic purpose is intentional response about a subject to an intended recipient/audience.

001-E must split if a shared operational principle becomes vague or heavily conditional.

### Coverage

Tentatively combines:

- desired representation/targets;
- observed collection composition/assessment.

001-E must test whether `Target` and `Composition Assessment` are independently complete concepts.

### Vocabulary

Tentatively combines:

- participant contribution of new terms;
- authorized stewardship/moderation of terms.

001-E must test whether contribution is a separate concept or naturally part of vocabulary evolution.

### Communication

Tentatively combines:

- reusable message/template definition;
- recipient eligibility and preview;
- performed sends/batches;
- dedupe/rounds/history.

001-E must explicitly test a split into `Message Template` and `Dispatch`/`Campaign`.

---

## 8. Provisional concept-vs-policy candidates

### Availability Window

The behavior may be independently recognizable and reusable: define when an action is available and expose whether that interval is open.

But it may prove to be configuration/policy on governed actions rather than a concept.

### Authorization

The need to distinguish delegated authority is durable and very strong.

The unresolved question is whether MinneAnalytics exposes enough user-facing state/actions around authority for it to be a Concept Design concept, or whether it remains application-wide policy around other concepts.

### Export

Users recognize export as a coherent action, but it may have too little durable state of its own and therefore belong as an affordance across concepts.

### Obligation

VIP registration suggests a broader downstream-requirement concept, but current evidence is narrow. Future externally sourced registration/operational obligations provide genericity pressure rather than current proof.

---

## 9. Provenance conclusion: dual layer, not one answer

001-C identified provenance as one of the strongest recurring needs.

001-D's preferred hypothesis is deliberately dual-layered.

### Intrinsic history

Concepts retain historical facts required for their own correct behavior.

Examples:

- Revision must preserve versions;
- Evaluation must preserve what subject/revision was judged;
- Vocabulary must preserve enough retirement/history to interpret old classifications;
- Communication must preserve send history required for duplicate/round semantics.

### Cross-concept audit

A future **Audit Trail** concept may record consequential activity across the application for organizational review:

- who acted;
- what they did;
- what subject/context was involved;
- when it happened.

The Audit Trail candidate is exploratory because the broad user-facing capability is primarily roadmap intent today.

A global audit log cannot substitute for intrinsic histories.

---

## 10. Candidate composition shape

The preferred 001-D structure is approximately:

```text
                     ┌───────────────┐
                     │   Proposal    │
                     └──────┬────────┘
                            │
             ┌──────────────┼───────────────┐
             │              │               │
         Revision       Evaluation     Classification
             │              │               │
             │          Disclosure       Vocabulary
             │              │
             └──── application syncs ───────┘

Feedback       Selection       Retraction       Capacity
                    │              │               │
                    └──── effective program ───────┘
                           │
                        Coverage
                           │
                        Schedule

Selection ──→ Deliverable ──→ Publication

Archive       Communication       Export       Obligation

Availability? / Authorization? compose around actions
Audit Trail? observes consequential actions cross-concept
```

This is a reasoning aid, not a canonical synchronization diagram.

---

## 11. Explicit non-concepts carried forward

001-D denies automatic concept status to:

- Conference;
- Submission;
- Program;
- Reviewer / Presenter / Board / Chair / Admin;
- Theme;
- Score;
- ProgramStatus;
- AbstractReviewStatus;
- DeckStatus;
- Blind Review;
- rescore/needs-score queues;
- heatmaps/charts/widgets;
- dashboards/tabs/routes/APIs;
- token or SSO mechanism;
- Sponsor;
- TechnicalLevel;
- VIP Registration as the generalized concept name;
- CSV;
- provider/integration names.

These may participate as actors, instances, attributes, policies, representations, context, or engineering realizations without becoming concepts.

---

## 12. What 001-E must attempt to falsify

001-E should not simply score the candidate list positively. It should actively try to disprove the boundaries.

Priority tests:

1. **Revision** — concept or intrinsic Proposal history?
2. **Disclosure** — concept or Evaluation policy?
3. **Feedback** — one generic concept or review/audience split?
4. **Selection + Retraction** — confirm independent histories versus unified lifecycle.
5. **Availability Window** — concept or configuration/policy?
6. **Authorization** — concept or policy/synchronization layer?
7. **Coverage** — one target+assessment concept or two?
8. **Vocabulary** — one contribution+governance concept or two?
9. **Capacity** — independently complete before scheduling?
10. **Communication** — one concept or Template + Dispatch/Campaign?
11. **Export** — concept or stateless affordance?
12. **Obligation** — sufficiently generic beyond VIP registration?
13. **Audit Trail** — current/future concept or provenance tenet only?
14. **Proposal** — sufficiently narrow without becoming an anemic data holder?
15. **Archive** — coherent historical-retention concept independent of a broad Conference lifecycle?

The criteria review should be willing to reject, merge, split, rename, or demote candidates.

---

## 13. 001-D exit review

### Exit criteria

- [x] Every 001-C purpose has an explicit 001-D disposition.
- [x] Every candidate cites purpose evidence rather than implementation structure.
- [x] Strong split signals from 001-B/001-C are represented as explicit boundary hypotheses.
- [x] Purposes that primarily express composition are not mechanically promoted to glue concepts.
- [x] Candidate merges have explicit split alternatives for 001-E.
- [x] Provisional concept-vs-policy boundaries are visible.
- [x] Known future intent constrains genericity without being mislabeled as shipped behavior.
- [x] Provenance is represented as intrinsic history plus an exploratory cross-cutting audit hypothesis.
- [x] Current implementation nouns/status/page boundaries are explicitly denied automatic concept status.
- [x] No implementation code/refactor was performed.

### Phase result

**001-D passes.**

The repository now has a purpose-derived candidate concept model that differs materially from the existing implementation organization while remaining traceable to historical/user-visible needs.

The candidate set is intentionally falsifiable rather than canonical.

---

## 14. Immediate next phase

The next work item is:

**001-E — Concept Criteria, Independence & Genericity Review**

001-E should evaluate every candidate against:

- specificity;
- completeness;
- independence;
- genericity;
- neighboring split/merge alternatives;
- whether apparent dependencies can be represented by synchronizations;
- whether a candidate has enough coherent user-visible behavior to justify concept status.

The output should be a reduced/refined candidate set suitable for operational-principle development in 001-F.
