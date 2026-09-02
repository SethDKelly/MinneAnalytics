# MinneAnalytics Concept Design

This directory contains the repository's Daniel Jackson–style Concept Design retrofit.

## Current status

- **Concept model maturity:** v0 — discovery
- **Working branch:** `concept-design/v0-discovery`
- **Current phase:** 001 — Discovery & Archaeology
- **Completed:**
  - 001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules
  - 001-B — Historical Intent Reconstruction & Repository Archaeology
- **Next:** 001-C — Problem, Actor-Need & Purpose Inventory

## Design authority

The Concept Design model describes MinneAnalytics' intended behavioral structure independently of the current implementation.

Existing code, schemas, routes, UI organization, APIs, and architecture documentation are evidence of implemented behavior and historical decisions. They are not, by themselves, authoritative definitions of concepts or concept boundaries.

During v0 discovery, conflicts between recovered intent, current behavior, future intent, implementation, and new design hypotheses must be recorded rather than silently resolved in favor of the existing implementation.

See [001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules](001-A-design-authority-methodology-evidence-and-anti-bias.md) for the governing methodology.

## Working progression

### 001 — Discovery & Archaeology

1. **001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules** — complete
2. **001-B — Historical Intent Reconstruction & Repository Archaeology** — complete
3. **001-C — Problem, Actor-Need & Purpose Inventory** — next
4. **001-D — Candidate Concept Discovery & Boundary Hypotheses**
5. **001-E — Concept Criteria, Independence & Genericity Review**
6. **001-F — Operational Principle Development**
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

These artifacts are evidence inputs to 001-C. They do not constitute the canonical concept set.

## Branch discipline

The v0 discovery branch is documentation/design work unless a later reconciliation phase explicitly authorizes implementation changes. Concept discovery must not opportunistically refactor the application to fit provisional hypotheses.
