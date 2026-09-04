# 002-C — Program Choice, Participation, Scarcity & Representation Intent

Status: **Complete**  
Concept model maturity: **v0 — formal specification in progress**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-G — Discovery Consolidation & Concept Candidate Gate](001-G-discovery-consolidation-and-concept-candidate-gate.md), [002-A](002-A-offer-change-and-temporal-availability.md), and [002-B](002-B-evaluation-disclosure-and-directed-response.md)

## 1. Purpose

002-C formally specifies:

- [Selection](knowledge/concepts/selection.md)
- [Withdrawal](knowledge/concepts/withdrawal.md)
- [Capacity](knowledge/concepts/capacity.md)
- [Coverage Target](knowledge/concepts/coverage-target.md)

The canonical concept nodes own the current normative abstract state, actions, intrinsic invariants, derived observations, and synchronization boundaries.

This phase record intentionally preserves only the design decisions, rejected alternatives, implementation-reconciliation observations, deferred synchronization questions, and exit review needed to audit those specifications.

Documentation authority remains governed by [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md), and implementation remains evidence rather than concept authority under [Concept Design Authority](knowledge/rules/concept-design-authority.md).

---

## 2. Entry conditions

Selection, Withdrawal, and Capacity entered 002-C as admitted Phase 001 candidates.

Coverage Target entered as **admitted-provisional** with one explicit falsification condition:

> Formal specification must preserve target-only authority and must not reintroduce observed composition, gap/excess, warnings, or visualization state as authoritative Coverage Target state.

The current implementation was consulted only as evidence. In particular, `ProgramStatus`, `withdrawnAt`, capacity snapshots, theme target fields, theme-count helpers, status-change routes, sponsorship flags, and heatmaps were not treated as formal-state templates.

---

## 3. Formal-specification method

Each concept had to demonstrate:

1. focused abstract state that can exist independently of the other three concepts;
2. complete concept-local actions;
3. intrinsic invariants that protect the purpose without importing MinneAnalytics workflow policy;
4. a clear distinction between authoritative state and derived observations;
5. preservation of independently meaningful histories;
6. explicit synchronization boundaries rather than cross-concept state copying;
7. no automatic promotion of current enum values, counts, warnings, or UI states into the conceptual model.

The subgroup was also tested for one particularly dangerous accidental merge:

> **Program choice, current participation, hard scarcity, and representation goals must not become one “program status/planning” concept merely because organizers reason about them together.**

---

## 4. Design decisions

### D-002C-01 — Selection owns organizer decision history, not effective participation

Selection now records immutable organizer decision events for a `(selection context, candidate)` pair.

The formal dispositions are:

- selected;
- reserve;
- not selected.

Undecided is represented by absence of a decision or by an explicit clearing event, not by a separate intrinsic `PENDING` status.

This keeps Selection focused on consequential organizer choice.

**Rejected alternative:** reproduce the current `ProgramStatus` enum as the Selection lifecycle. That would reintroduce Withdrawal into organizer decision state and collapse separate actors/histories.

---

### D-002C-02 — Later Selection changes append history rather than rewrite it

Promotion from reserve to selected is represented by a later Decision whose predecessor is the prior reserve Decision.

Likewise, later reconsideration can record a new selected/reserve/not-selected outcome.

An explicit `Clear` action records that a prior organizer disposition is no longer current while retaining the decision history.

This is intentionally different from storing only one mutable current enum value.

---

### D-002C-03 — Selection does not derive its decision from Evaluation

Evaluation may inform organizer reasoning, but aggregate scores or individual judgments do not create Selection state.

A user with decision authority performs the Selection action.

This preserves the historical design principle that evaluation and consequential organizer authority are different responsibilities and prevents the demo-only synthetic-score behavior from contaminating the conceptual model.

---

### D-002C-04 — Withdrawal is a monotonic originator rescission fact

Withdrawal records one durable rescission for a participation/commitment reference.

It does not change a Selection Decision.

A candidate can therefore have both:

- a truthful organizer history saying it was selected; and
- a truthful originator history saying participation was later withdrawn.

The application may derive that the candidate is not currently participating, but neither concept rewrites the other.

---

### D-002C-05 — No intrinsic `Unwithdraw`

Current evidence establishes the ability to withdraw, including after organizer approval, but does not establish a user-facing reinstatement lifecycle.

002-C therefore does not invent an `Unwithdraw` action.

If future product behavior permits re-entry after withdrawal, the design must decide explicitly whether that means:

- a new participation/commitment;
- a reinstatement concept/action with retained history; or
- another focused behavior.

It must not silently erase the original Withdrawal.

---

### D-002C-06 — Effective participation remains derived composition

Questions such as:

- “Is this candidate currently in the active program?”
- “Should this item appear in the schedule queue?”
- “Should it still consume capacity?”

cannot be answered by Selection or Withdrawal alone.

They require application composition over organizer decision, Withdrawal, and possibly event/lifecycle policy.

002-C therefore does not introduce `EffectiveParticipation`, `ProgramState`, or another coordinating concept.

---

### D-002C-07 — Capacity is a hard finite-allocation concept

Capacity now owns:

- finite Pool limits;
- class-sensitive future allocation rates;
- Allocation records;
- release of allocations.

`committed`, `remaining`, and `saturated` are derived from the active Allocation ledger.

An Allocation cannot exceed the currently remaining finite pool.

This gives Capacity a real independent operational invariant rather than treating it as only a dashboard calculation.

---

### D-002C-08 — Capacity classes are generic accounting references

The current product distinguishes sponsor/community-related planning concerns, but those labels do not define the Capacity concept.

Capacity therefore uses opaque `ClassRef` values with unit rates.

An application can map domain commitment types to Capacity classes without the concept knowing what “sponsor,” “community,” or another future class means.

Changing a class rate applies prospectively: existing allocations retain the units actually charged when they were made.

---

### D-002C-09 — Capacity cannot be resized below active commitments

A Pool may be resized, but its new limit must remain at least the currently committed amount.

This preserves the finite-pool invariant rather than allowing silent negative remaining capacity.

If a future product explicitly needs overbooking/oversubscription, that is new behavior requiring a deliberate design change rather than an accidental consequence of mutable configuration.

---

### D-002C-10 — Selection and Capacity remain separate despite likely synchronization

A later MinneAnalytics synchronization may make successful Selection contingent on a Capacity allocation, or may allocate immediately after a selected Decision.

002-C does not choose that transaction boundary yet.

This matters because the two concepts answer different questions:

- Selection: **What did the organizer decide?**
- Capacity: **What scarce commitment units are currently allocated?**

Keeping both facts independent allows later composition to decide how failures, reservations, or retries should behave.

---

### D-002C-11 — Withdrawal may release Capacity, but does not own release state

A Withdrawal may later trigger release of a Capacity Allocation.

That is a synchronization signal, not an intrinsic Withdrawal effect.

This prevents Withdrawal from needing knowledge of which pools a participation consumes or how many units its class costs.

---

### D-002C-12 — Coverage Target owns desired representation only

Coverage Target now identifies:

- a collection;
- a dimension;
- a bucket/value within that dimension;
- a representation measure;
- a desired lower bound, upper bound, or range.

It deliberately does not store actual observed representation.

Actual composition belongs to application projection over authoritative source concepts such as Selection and Classification/other attributes.

---

### D-002C-13 — Coverage Target supports count/proportion-style measures without owning measurement logic

The formal target references an opaque `MeasureRef`.

This permits a target to describe, for example:

- an item count;
- a proportion;
- another non-negative comparable representation measure;

without making Coverage Target compute the observed measure itself.

The application or a later reusable measurement design supplies the observed scalar.

---

### D-002C-14 — Coverage Target bounds are soft planning intent unless composition says otherwise

Crossing a Coverage Target bound does not intrinsically prevent Selection.

Given an externally supplied observed value, Coverage Target can support derived comparison such as below/within/above target. But whether that comparison creates:

- a warning;
- a confirmation prompt;
- a review requirement;
- no intervention at all;

belongs to application policy.

This preserves human program judgment rather than letting representation targets become hidden automatic decision authority.

---

### D-002C-15 — Capacity and Coverage Target intentionally have different normative force

This subgroup establishes a useful architectural distinction:

- **Capacity** expresses hard finite scarcity: an intrinsic allocation cannot exceed the pool.
- **Coverage Target** expresses desired representation: exceeding or missing a target does not intrinsically make an organizer action invalid.

They may both appear in one planning UI, but their semantics are intentionally different.

---

### D-002C-16 — Coverage Target adjustment/removal history is not yet intrinsic

Coverage Target supports establish, adjust, and remove behavior.

The current formal specification does not preserve every prior target value as an intrinsic history.

Historical target evolution may later be captured through broader audit/provenance behavior if it becomes a genuine user need. 002-C does not manufacture that lifecycle merely because historical design records themselves value provenance.

---

### D-002C-17 — Coverage Target provisional admission is resolved

Coverage Target's Phase 001 concern was whether it could avoid duplicating observed composition.

The formal model resolves this positively:

- target state contains only desired bounds and their semantic coordinates;
- observed composition is external input;
- comparisons are derived;
- warnings/heatmaps are presentation/application behavior;
- Selection remains independent.

Coverage Target therefore exits 002-C as **specified**.

---

## 5. Cross-concept boundary result

| Concept | Owns | Explicitly does not own |
|---|---|---|
| [Selection](knowledge/concepts/selection.md) | organizer Decision history; current disposition projection | Withdrawal; Evaluation; Capacity allocation; observed coverage; Schedule/Deliverable/Publication |
| [Withdrawal](knowledge/concepts/withdrawal.md) | durable originator rescission fact and provenance | Selection reversal; organizer removal; capacity release; schedule cleanup; reinstatement |
| [Capacity](knowledge/concepts/capacity.md) | finite pools; class rates; allocations; releases; hard remaining-capacity invariant | candidate choice; representation goals; schedule placement; domain class meanings |
| [Coverage Target](knowledge/concepts/coverage-target.md) | desired representation coordinates and bounds | observed composition; gaps/excess state; warnings; heatmaps; automatic selection decisions |

The four concepts remain understandable and operable without direct access to one another's internal state.

---

## 6. Implementation-reconciliation observations retained for later

The current application remains useful evidence but exposes several likely reconciliation areas.

### IR-002C-01 — `ProgramStatus` conflates organizer and originator state

Current implementation represents pending/approved/declined/backup/withdrawn in one field.

Presenter withdrawal writes `WITHDRAWN`, while organizer status changes can subsequently write another status and clear `withdrawnAt`.

The formal model instead preserves Selection and Withdrawal independently.

### IR-002C-02 — Current Selection persistence does not preserve decision history

The current status route replaces `programStatus` and conditionally updates `approvedAt`.

Formal Selection now requires immutable Decision history, including reserve promotion and explicit clearing.

### IR-002C-03 — Demo scoring side effects must not survive as Selection semantics

Current approval/decline changes invoke demo auto-scoring for consistency.

That is a known demo accommodation and is not part of Selection synchronization authority.

### IR-002C-04 — Current Capacity is primarily a computed snapshot

Current capacity logic derives raw slots, trimmed slots, sponsor/community target ranges, and counts from configuration/current submissions.

Formal Capacity instead defines a finite Pool plus explicit Allocation/Release behavior.

Later reconciliation must determine whether the production design needs a true allocation ledger, whether Schedule opportunities establish pool limits, and how existing configuration maps to classes/rates.

### IR-002C-05 — Current target rows mix desired and observed composition in one view model

Theme-stat helpers combine target minimum/maximum values with pending/approved/declined/backup counts.

The formal model deliberately separates those sources: Coverage Target owns desired bounds; actual counts are derived from Selection plus Classification.

### IR-002C-06 — Current saturation warning is consistent with soft Coverage Target semantics

The status route may warn and require explicit confirmation when approving into a saturated theme, but the organizer can force the action.

That supports treating representation target comparison as decision support rather than intrinsic Selection prohibition.

### IR-002C-07 — Current sponsor flags are not concept boundaries

Sponsor-related configuration and flags may map to Capacity class/accounting policy, but `isSponsorSession` is not itself a Capacity concept property.

---

## 7. Synchronization signals carried forward

002-C does not yet make these canonical synchronizations, but formal specifications now make the likely relationships precise enough for later composition review:

1. **Selection → Capacity** — a selected Decision may require or trigger allocation.
2. **Selection clearing/change → Capacity** — leaving selected state may release or alter an allocation.
3. **Withdrawal → effective participation** — withdrawn participation should cease to count as active according to application policy.
4. **Withdrawal → Capacity** — withdrawal may release active allocation.
5. **Withdrawal → Schedule** — withdrawal may make an existing placement invalid/remove it.
6. **Selection + Classification/attributes → observed composition** — derive current representation.
7. **Observed composition + Coverage Target → planning assessment** — derive below/within/above target.
8. **Coverage assessment → Selection experience** — optional warning/confirmation, not automatic decision.
9. **Schedule opportunity structure → Capacity configuration** — schedule topology may inform pool limits without becoming Capacity state.
10. **Authority/lifecycle policy → all mutation eligibility** — remains application composition.

These should be tested after the relevant participating concepts are formally specified rather than encoded prematurely here.

---

## 8. Rejected concept additions

002-C does not introduce:

- Program;
- Program Status;
- Effective Participation;
- Decision Queue;
- Score Ranking;
- Sponsorship;
- Composition;
- Coverage Gap;
- Balance;
- Saturation Warning;
- Overbooking;
- Allocation Eligibility;
- Replacement Candidate;
- Reinstatement.

Some are derived views or synchronization consequences; others lack an independently evidenced purpose/lifecycle.

---

## 9. Exit review

### Selection

- focused purpose: **pass**
- complete state/actions: **pass**
- independent decision history: **pass**
- separation from Withdrawal/Evaluation: **pass**
- implementation-neutral: **pass**

**Result: specified.**

### Withdrawal

- focused originator-agency purpose: **pass**
- monotonic durable state: **pass**
- independent from Selection: **pass**
- no invented reinstatement semantics: **pass**
- implementation-neutral: **pass**

**Result: specified.**

### Capacity

- finite scarce-resource purpose: **pass**
- allocation/release behavior: **pass**
- hard intrinsic capacity invariant: **pass**
- independent from Selection/Schedule: **pass**
- domain-class neutrality: **pass**

**Result: specified.**

### Coverage Target

- focused planning-intent purpose: **pass**
- desired-bound state only: **pass**
- observed composition excluded: **pass**
- soft decision-support boundary preserved: **pass**
- provisional-condition resolution: **pass**

**Result: specified; Phase 001 provisional condition resolved positively.**

---

## 10. 002-C exit decision

**002-C passes.**

The canonical Concept Design model now distinguishes:

- organizer choice from originator rescission;
- effective participation from either source fact;
- hard finite scarcity from soft representation intent;
- desired representation from observed composition;
- authoritative concept state from dashboard/warning projections.

No application/domain refactoring is authorized by this phase.

The next subgroup is **002-D — Vocabulary & Classification**.