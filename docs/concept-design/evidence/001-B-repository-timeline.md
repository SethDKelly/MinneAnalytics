# 001-B Evidence — Repository Timeline

Status: **Complete for 001-B baseline**  
Purpose: chronological reconstruction of product-intent changes without treating commit boundaries as concept boundaries.

## 1. Reading rule

This timeline records **what changed and what problem signal it provides**.

A commit is not a concept. Several commits may refine one user need, and one commit may contain several unrelated behaviors.

---

## 2. Chronology

### 2026-05-22 — Initial end-to-end proof of concept

#### `2a16e25d371de8d48c9fc48f4ff2d24fb894114d` — Initial commit

Historical plan already includes:

- public presentation submission;
- scoring from private committee URLs;
- aggregate ranking;
- program capacity reasoning;
- pending/approved/declined/backup/withdrawn states;
- manual approval and backup promotion;
- presenter withdrawal, including after approval;
- deck upload and review states;
- automatic schedule draft generation plus manual drag/drop adjustment.

**Intent signal:** MinneAnalytics begins as an end-to-end conference-program workflow, not merely a CFP intake form.

**Caution:** implementation plan and code are co-located in the first commit, so original implementation structure must not be mistaken for independently validated concept structure.

---

### 2026-05-22 — Setup portability

#### `20242fb64c76a269005fd19647a9b7ececa04f42`

Adds macOS/Linux bootstrap paths.

**Intent signal:** engineering accessibility only; little concept-design weight.

---

### 2026-05-22 — Authority corrected to real organizational roles

#### `57892705a18da793bcbe726a7344c4d60ea0f8fd`

Replaces `SCORER` / `CORE` with board and co-chair responsibility:

- all board/co-chair members score;
- both groups review decks;
- board members approve and schedule;
- co-chairs cannot approve.

**Intent signal:** evaluation participation and consequential program authority are deliberately different responsibilities.

**Terminology signal:** early capability-oriented role names are not durable domain vocabulary.

---

### 2026-05-22 — Post-conference publication and operational hardening

#### `7a994056171aa4661f15b1dab038ddd6a76f6173`

Adds:

- public slide/deck archive;
- board publish controls;
- per-session non-shareable flag;
- dedicated deck queue/download;
- CSV export;
- public-form abuse controls;
- email stubs;
- additional public pages.

**Intent signal:** accepted conference content gains a post-event public lifecycle, and publication eligibility is narrower than acceptance alone.

**Representation/engineering signal:** CSV, rate limiting, and facsimile pages should not automatically create concepts.

---

### 2026-05-22 — Associated registration tracking

#### `5d9f017bef6b286ec84eb70144fd3cb136c76342`

Adds VIP-event registration state for approved talks and exposes it to board/co-chair workflows and export.

**Intent signal:** program organizers need to know whether selected presenters have completed an associated operational obligation.

---

### 2026-05-22 — Synthetic scores for demonstration coherence

#### `b0d7e76f95afb4f3210b43f235949949bea2bf3a`

Creates high synthetic scores for approved demo rows and low scores for declined demo rows.

**Intent signal:** none assumed.

**Demo signal:** this is explicitly for demo consistency and must be excluded from later behavioral-purpose inference.

---

### 2026-05-22 — Historical rationale begins disappearing from current docs

#### `40cca260e164272ce571be93f6d6e3b77971ab48`

Removes the original phased implementation plan and replaces it with developer documentation:

- architecture;
- routing;
- demo walkthrough;
- development;
- contributing.

**Archaeology signal:** current docs become better current-state documentation but worse evidence of the original problem decomposition.

---

### 2026-05-22 — Documentation usability only

#### `1216dd5bc471e1b03e033697b1c992acecfa195b`

Reorganizes setup documentation by operating system.

**Intent signal:** engineering/documentation only.

---

### 2026-05-22 — Administrative and program-composition expansion

#### `8439ffcafd73e8868ace846f9e0f6d6b1b08116f`

Adds:

- `ADMIN` responsibility;
- conference submission windows;
- conference lifecycle administration;
- theme taxonomy and coverage targets;
- theme selection on submission;
- chair Balance and History views;
- theme filtering/gap analysis;
- saturation warning during approval;
- database-backed upcoming-conference listing.

**Intent signal:** product expands from a single conference decision flow into configurable conference operations with administrative authority, temporal availability, classification, composition goals, and historical review.

---

## 3. v2 branch — explicit second-generation problem discovery

### 2026-06-02 — v2 plan and presenter revision foundation

#### `54ebf8bcaef23672af979d3937ce7157038c243a`

Adds a detailed v2 plan and implements presenter revision foundation.

The plan explicitly describes the previous system as optimized for a **one-shot CFP → score → approve flow** and identifies gaps around:

- presenter edits;
- presenter-visible committee feedback;
- immutable revision lineage;
- rescoring/re-review;
- community-proposed themes;
- bias-reduced evaluation;
- sponsor-session operation;
- board communications;
- richer program-composition visualization.

**Intent signal:** the product changes from a mostly linear workflow into a longitudinal, iterative decision process.

**Design-rationale signal:** v2 explicitly creates an abstract-review lifecycle separate from program placement state because overloading `ProgramStatus` further was considered undesirable.

---

### 2026-06-02 — Community taxonomy

#### `4f0c9d289d09cddad46e79b0a5e5acc8e5aef3bf`

Adds presenter-proposed themes with source and soft-removal semantics.

**Intent signal:** vocabulary should be extensible by participants, reusable immediately, and still subject to governance.

#### `44ef2787af2d0a1f667472c9fb1651ae058307e1`

Completes admin moderation UI.

**Intent signal:** community creation and administrative governance coexist rather than requiring all taxonomy creation to originate centrally.

---

### 2026-06-02 — Presenter-visible committee feedback

#### `49ecb748ac60b76777e218af0adcbfaa84e0d80c`

Adds a separate feedback path from committee to presenter.

**Intent signal:** private evaluation notes and communication intended for the presenter solve different problems.

---

### 2026-06-02 — Bias-reduced review

#### `729889008c61e233de60a504dfb8a460d3841ecb`

Adds:

- identity masking before scoring;
- explicit identity reveal;
- aggregate masking before own score;
- chair list partitioning around whether the viewer has scored.

**Intent signal:** review quality depends partly on regulating what information an evaluator sees before forming an independent judgment.

---

### 2026-06-02 — Revision lineage becomes committee-visible

#### `02acafda3ecaacfd9baa024d7c8a8e4352dbefb8`

Adds:

- revision history API/UI;
- version badges;
- stale-score summaries;
- seeded version-history scenario.

**Intent signal:** historical versions remain meaningful after the live proposal changes.

---

### 2026-06-02 — Evaluation becomes version-aware

#### `5b59f44a454b9e22247029c3c31924c08a0100b3`

Adds:

- score-to-abstract-version association;
- needs-rescore queue;
- strict current-version aggregate behavior;
- board mark-revision-reviewed action.

**Intent signal:** the existence of a judgment and the applicability of that judgment to current content are separate questions.

**Chronology signal:** lineage visibility and rescoring applicability were introduced in separate sequential changes, useful evidence for later boundary analysis.

---

### 2026-06-02 — Sponsor classification becomes an ordinary board action

#### `4cb46a0197c2582f646529e500efac7751e49243`

Adds board sponsor-session toggle, filtering, badges, and seeded sponsor example.

**Intent signal:** sponsor treatment is operational classification that affects program labeling/capacity, not merely hidden configuration.

---

### 2026-06-02 — Board communication gains durable history

#### `929917719a8d94f51d35a42c1cf00cb5a00b3178`

Adds:

- reusable global templates;
- recipient resolution;
- per-conference batch history;
- decline rounds;
- duplicate prevention;
- Communications UI;
- stub delivery.

**Intent signal:** communication behavior includes intent/audience/history semantics beyond the transport provider.

---

### 2026-06-02 — Program-composition information gains heatmap representations

#### `928e887a69d405ccb0a38e30908ccf1b7a6c1f9e`

Adds theme/status and technicality/theme heatmaps.

**Intent signal:** program composition is important to decision makers.

**Concept caution:** the heatmap itself is a presentation form; the underlying need predates the visualization.

---

### 2026-06-02 — v2 completion

#### `5405d95ff55e4713407381d5609702fbda6a5740`

Completes v2 documentation/export/polish and records approved-talk edit unlock as deferred.

The final v2 plan preserves open-policy history including:

- self-service pending edits;
- strict current-version score averages;
- co-chair feedback authority;
- post-CFP edit allowances;
- single review-status enum chosen for demo simplicity;
- immediate publication of presenter-proposed themes with later moderation;
- aggregate masking before own score;
- explicit identity reveal;
- manual rather than automatic deck-call communication.

**Intent signal:** several current behaviors are explicitly policy choices, and at least one modeling choice (`AbstractReviewStatus` versus separate rescore flag) is documented as a simplification.

---

### 2026-06-02 — v2 merge

#### `53ff890b777a6f291b762896195acbadfe1e5e4e`

Merges `feature/conference-demo-v2` to `main`.

**Provenance signal:** useful branch boundary; no independent concept implication.

---

### 2026-06-02 — v2 rationale removed from current branch

#### `7d943641cc53d072bab0ce4aed8520ecd173dd49`

Removes implementation plan and backlog documents and consolidates architecture/roadmap/guides.

**Archaeology signal:** immutable historical refs are required to understand why v2 behaviors exist.

---

## 4. Engineering deployment epoch

### 2026-06-05 — AWS dev deployment

#### `fa69c0613f55557ee3d69c86c0a9d9f8fceb23d8`

Adds Docker/ECS Fargate, GitHub Actions OIDC, deployment modes, and deployment docs while preserving local SQLite demo operation.

**Intent signal for Concept Design:** realization environment is intentionally replaceable/separable from user-facing behavior.

**Primary classification:** engineering.

#### `de440a2376c6a2cadfeb5610f53279e319f73ba6`

Fixes OIDC repository casing.

**Classification:** engineering/documentation only.

#### `7471be63296074752d00b2b33286b559c012dbef`

Documents canonical GitHub/AWS naming.

**Classification:** engineering/documentation only.

#### `088e154cdecfb36f36377fa63d3928c6ab3130ae`

Merges dev deployment branch into `main`.

**Provenance signal:** this is the `main` base from which Concept Design v0 discovery was branched.

---

## 5. Cross-epoch evolution summary

The product's historical direction can be summarized without naming concepts:

```text
one-shot proposal workflow
        ↓
organizational authority refinement
        ↓
post-event publication + operational tracking
        ↓
administration + configurable event governance
        ↓
iterative revision / feedback / version-aware evaluation
        ↓
controlled disclosure + richer program composition
        ↓
durable communications and historical records
        ↓
future identity, conflict, registration, attendance, audit, and attendee feedback
```

This evolutionary structure is the primary handoff from repository archaeology into 001-C.

---

## 6. Chronological gaps and anomalies

### Missing v2 Phase 7

The surviving v2 plan and commit sequence jump from Phase 6 to Phase 8.

No concept or behavioral conclusion should be inferred from the missing number.

### Planning dates versus commit dates

The v2 plan revision log records planning changes on May 21, while commits implementing the plan landed June 2.

Treat plan revision dates as design chronology and commit dates as repository chronology.

### Merge history versus feature history

Some feature commits were created on a branch and later merged. Timeline reasoning should follow behavioral commit ancestry rather than assuming `main` first-parent chronology alone reflects when a need was discovered.
