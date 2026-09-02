# 001-B Evidence — Source Register

Status: **Complete for 001-B baseline**  
Scope: MinneAnalytics historical-intent reconstruction through `main` at `088e154cdecfb36f36377fa63d3928c6ab3130ae`

## 1. Purpose

This register identifies the sources used by 001-B, classifies their evidentiary role, and records how much authority they should carry during later Concept Design discovery.

A source's usefulness for understanding current implementation is not the same as its usefulness for discovering concept boundaries.

---

## 2. Source classes

| Class | Meaning |
|---|---|
| **HI** | Historical intent — explains what problem/behavior was intended at a point in time |
| **CB** | Current behavior — documents or demonstrates behavior currently exposed by the application |
| **IA** | Implementation artifact — records technical realization; useful cautiously during concept discovery |
| **FI** | Future intent — documents needs not yet fully realized |
| **DA** | Demo accommodation — behavior primarily present to make the proof of concept easy to demonstrate |
| **EA** | Engineering/deployment artifact — realization/environment evidence with low concept-boundary authority |

---

## 3. Primary sources

### SR-001 — Initial implementation plan

- **Path:** `docs/IMPLEMENTATION_PLAN.md`
- **Ref:** `2a16e25d371de8d48c9fc48f4ff2d24fb894114d`
- **Class:** HI + IA
- **Weight for purpose discovery:** **High**
- **Weight for concept boundaries:** **Medium**

Why it matters:

- earliest recoverable explicit product scope;
- records proposal intake, scoring, ranking/capacity, approval/backups, withdrawal, deck workflow, schedule building;
- explicitly permits presenter withdrawal after approval;
- preserves early actor vocabulary (`Scorer`, `Chair`, `Core`, `Presenter`).

Caution:

- organized as implementation phases;
- mixes product intent with framework/schema/route choices;
- status enums should not be inherited as concept boundaries.

### SR-002 — Initial repository state

- **Commit:** `2a16e25d371de8d48c9fc48f4ff2d24fb894114d`
- **Class:** HI + IA
- **Weight for purpose discovery:** **Medium-high**
- **Weight for concept boundaries:** **Low-medium**

Why it matters:

- confirms the initial plan was not merely speculative; substantial workflow behavior was present from the first commit;
- useful to separate original scope from later additions.

### SR-003 — Board/co-chair authority correction

- **Commit:** `57892705a18da793bcbe726a7344c4d60ea0f8fd`
- **Message:** `Add board vs co-chair roles for scoring, approval, and deck review.`
- **Class:** HI + CB
- **Weight for purpose discovery:** **High**

Why it matters:

- records deliberate replacement of `SCORER` / `CORE` with organization-based authority;
- preserves the distinction between evaluation authority and consequential program authority.

### SR-004 — Post-conference archive and demo hardening

- **Commit:** `7a994056171aa4661f15b1dab038ddd6a76f6173`
- **Class:** HI + CB + DA
- **Weight for purpose discovery:** **High for publication/history; low for hardening mechanics**

Why it matters:

- extends lifecycle into post-conference publication;
- introduces per-session shareability and public archive controls;
- adds operational export and abuse-control behavior.

Caution:

- rate limiting/honeypot and some email-stub work are engineering/demo concerns, not necessarily concepts.

### SR-005 — VIP event registration flag

- **Commit:** `5d9f017bef6b286ec84eb70144fd3cb136c76342`
- **Class:** HI + CB
- **Weight for purpose discovery:** **Medium**

Why it matters:

- documents an operational need adjacent to program selection: knowing whether approved presenters completed an associated registration action.

### SR-006 — Synthetic demo scoring

- **Commit:** `b0d7e76f95afb4f3210b43f235949949bea2bf3a`
- **Class:** DA
- **Weight for purpose discovery:** **Very low / exclusion evidence**

Why it matters:

- demonstrates why archaeology must distinguish demo coherence from durable product semantics.

Explicit exclusion:

- do not infer that approval/decline should create scores or that evaluation is causally derived from program decisions.

### SR-007 — Developer documentation consolidation

- **Commit:** `40cca260e164272ce571be93f6d6e3b77971ab48`
- **Class:** HI about documentation lifecycle
- **Weight for purpose discovery:** **High as provenance evidence**

Why it matters:

- explicitly removes the original implementation plan after the PoC stabilizes;
- establishes that current docs intentionally omit some earlier rationale.

### SR-008 — Administration, submission windows, themes, and chair analytics

- **Commit:** `8439ffcafd73e8868ace846f9e0f6d6b1b08116f`
- **Class:** HI + CB
- **Weight for purpose discovery:** **High**

Why it matters:

- introduces site administration distinct from board/co-chair work;
- adds conference lifecycle, submission windows, theme governance, coverage targets, historical review, and multi-conference listing behavior.

### SR-009 — Conference v2 implementation plan

- **Path:** `docs/conference-v2-implementation-plan.md`
- **Initial ref:** `54ebf8bcaef23672af979d3937ce7157038c243a`
- **Completed ref:** `5405d95ff55e4713407381d5609702fbda6a5740`
- **Class:** HI + IA
- **Weight for purpose discovery:** **Very high**
- **Weight for concept boundaries:** **Medium; recommendations remain provisional**

Why it matters:

- contains explicit problem statement rather than only a feature list;
- identifies the prior product as a "one-shot CFP → score → approve flow";
- separates goals and non-goals;
- records user flows, policy alternatives, open questions, and chosen demo policies;
- explicitly distinguishes private score notes from presenter feedback;
- explicitly chooses version-aware score participation;
- records identity/aggregate masking rationale;
- records historical-preservation policies for revisions and themes.

Caution:

- contains proposed data model and route design;
- some choices are marked tentative/recommended for demo simplicity;
- current implementation is evidence that some choices shipped, not proof that the chosen decomposition is conceptually optimal.

### SR-010 — Community-theme implementation

- **Commits:**
  - `4f0c9d289d09cddad46e79b0a5e5acc8e5aef3bf`
  - `44ef2787af2d0a1f667472c9fb1651ae058307e1`
- **Class:** HI + CB
- **Weight for purpose discovery:** **High**

Why it matters:

- demonstrates intentional movement from fixed admin taxonomy to community-proposed vocabulary with moderation;
- soft removal preserves historical use.

### SR-011 — Committee feedback implementation

- **Commit:** `49ecb748ac60b76777e218af0adcbfaa84e0d80c`
- **Class:** HI + CB
- **Weight for purpose discovery:** **Very high**

Why it matters:

- commit message explicitly calls presenter feedback separate from private score notes;
- strong evidence that the same text-bearing UI/domain region contains different user purposes.

### SR-012 — Bias-reduced review implementation

- **Commit:** `729889008c61e233de60a504dfb8a460d3841ecb`
- **Class:** HI + CB
- **Weight for purpose discovery:** **Very high**

Why it matters:

- establishes default identity masking, explicit reveal, and aggregate masking before own score;
- provides direct evidence of information-exposure policy motivated by independent judgment.

### SR-013 — Revision lineage visibility

- **Commit:** `02acafda3ecaacfd9baa024d7c8a8e4352dbefb8`
- **Class:** HI + CB
- **Weight for purpose discovery:** **Very high**

Why it matters:

- makes version history and stale-score context visible to committee actors;
- demonstrates that prior content remains meaningful after edits.

### SR-014 — Version-aware rescoring

- **Commit:** `5b59f44a454b9e22247029c3c31924c08a0100b3`
- **Class:** HI + CB
- **Weight for purpose discovery:** **Very high**

Why it matters:

- explicitly binds evaluation applicability to abstract version;
- current-version-only aggregates are a deliberate policy choice.

### SR-015 — Sponsor session operational control

- **Commit:** `4cb46a0197c2582f646529e500efac7751e49243`
- **Class:** HI + CB
- **Weight for purpose discovery:** **Medium-high**

Why it matters:

- converts sponsorship from seeded/internal state into board-managed operational classification;
- affects capacity accounting and program labeling.

### SR-016 — Communication templates and send tracking

- **Commit:** `929917719a8d94f51d35a42c1cf00cb5a00b3178`
- **Class:** HI + CB + DA for delivery transport
- **Weight for purpose discovery:** **High**

Why it matters:

- establishes template intent, audience resolution, batches, decline rounds, history, and deduplication;
- console/stub delivery is explicitly replaceable.

### SR-017 — Coverage heatmaps

- **Commit:** `928e887a69d405ccb0a38e30908ccf1b7a6c1f9e`
- **Class:** CB + IA
- **Weight for purpose discovery:** **Low-medium**

Why it matters:

- confirms program-composition analysis is important enough to receive multiple representations.

Caution:

- heatmaps are primarily a visualization realization of an already-existing coverage/balance need.

### SR-018 — v2 completion and CSV/documentation polish

- **Commit:** `5405d95ff55e4713407381d5609702fbda6a5740`
- **Class:** CB + IA
- **Weight for purpose discovery:** **Medium**

Why it matters:

- marks the v2 planned behavior substantially complete;
- preserves final planning choices and one explicitly deferred item: approved-talk unlock.

### SR-019 — v2 merge

- **PR:** `#1 — Feature/conference demo v2`
- **Merge commit:** `53ff890b777a6f291b762896195acbadfe1e5e4e`
- **Class:** provenance
- **Weight for purpose discovery:** **Low**

Why it matters:

- establishes the branch boundary and merge point for the second behavioral expansion.

### SR-020 — Post-v2 documentation consolidation

- **Commit:** `7d943641cc53d072bab0ce4aed8520ecd173dd49`
- **Class:** provenance
- **Weight for purpose discovery:** **Very high as archaeology evidence**

Why it matters:

- removes v2 implementation-plan and backlog documents after merge;
- current `main` cannot be treated as the complete design rationale corpus.

### SR-021 — Historical conference backlog

- **Path:** `docs/conference-backlog.md`
- **Ref:** `54ebf8bcaef23672af979d3937ce7157038c243a`
- **Class:** FI
- **Weight for future-purpose discovery:** **High**

Why it matters:

- gives explicit problem statements for room-based attendee feedback and Sched integration;
- distinguishes attendee feedback from committee feedback;
- distinguishes attendee preference/room demand from internal schedule balancing.

### SR-022 — Current architecture

- **Path:** `docs/architecture.md`
- **Ref:** `main`
- **Class:** CB + IA
- **Weight for current-behavior confirmation:** **Very high**
- **Weight for concept boundaries:** **Low-medium**

Why it matters:

- canonical description of current shipped behavior;
- useful for checking whether historical intent survived implementation.

### SR-023 — Current demo walkthrough

- **Path:** `docs/exploring-the-demo.md`
- **Ref:** `main`
- **Class:** CB
- **Weight for purpose discovery:** **High**

Why it matters:

- presents behavior in actor-visible sequence instead of source-code structure;
- useful to validate current operational workflows.

### SR-024 — Current roadmap

- **Path:** `docs/roadmap.md`
- **Ref:** `main`
- **Class:** FI
- **Weight for future-purpose discovery:** **High**

Why it matters:

- preserves structured identity, COI, approved-edit unlock, production communications, registration/Sched integration, activity audit, multi-conference scale, reporting, and attendee-feedback needs.

### SR-025 — AWS dev deployment work

- **Commit:** `fa69c0613f55557ee3d69c86c0a9d9f8fceb23d8`
- **Follow-up commits:** `de440a2376c6a2cadfeb5610f53279e319f73ba6`, `7471be63296074752d00b2b33286b559c012dbef`
- **Class:** EA
- **Weight for purpose discovery:** **Very low**

Why it matters:

- confirms local demo and deployed dev realization are intentionally separable;
- otherwise primarily engineering evidence.

---

## 4. Source precedence for later phases

When later phases encounter a discrepancy, use this sequence:

1. explicit problem statement / user need in historical or current planning;
2. current user-visible behavior;
3. repeated historical policy across multiple sources;
4. future-intent source if the question concerns expected extensibility;
5. implementation artifacts only to clarify actual realization;
6. demo accommodations never override product-intent evidence.

No precedence rule automatically decides a concept boundary. It only governs evidence interpretation.

---

## 5. Preservation rule

Historical files that were intentionally deleted from `main` remain legitimate design evidence when referenced by immutable commit SHA.

The Concept Design retrofit should cite those historical refs directly rather than copying the deleted implementation plans back into current product documentation as if they were still authoritative plans.
