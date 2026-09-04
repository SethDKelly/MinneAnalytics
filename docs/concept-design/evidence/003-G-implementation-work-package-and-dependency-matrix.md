# 003-G Implementation Work Package & Dependency Matrix

Historical audit evidence for the Phase 004 execution handoff.

## Work packages

| Package | Primary F-wave coverage | Depends on | Main implementation surfaces | Main gaps | Required exit evidence |
|---|---|---|---|---|---|
| 004-A Migration Discipline, Baseline & Additive Schema Foundation | F0/F1 | 003-G gate | Prisma migrations, migration/backfill tooling, CI, backup/restore, additive schema | enables all | committed migration baseline; restore rehearsal; additive schema; run-report format; no semantic cutover |
| 004-B Revision, Classification, Evaluation & Feedback Canonicalization | F2 + F5-W1 | 004-A | Revision relations, Score exact Revision relation/uniqueness, Classification relation, Feedback reference, compatibility projections | SG-001, SG-006, SG-011, SG-012, SG-017 part | exact current Revision; idempotent backfill; R1/R2 Evaluation preservation test; parity reports |
| 004-C Selection, Withdrawal, Capacity & Deliverable Canonicalization | F3 + F5-W2 | 004-B | Selection/Withdrawal histories, Capacity ledger, Deliverable/Assessment, durable work, compatibility program/deck projections | SG-002, SG-003, SG-004, SG-007, SG-018 part | concurrency Capacity test; Withdrawal cleanup recovery; exact artifact assessment; no raw legacy writer |
| 004-D Availability, Archive, Authority & Disclosure Policy Implementation | F3 + F5-W3/W4 | 004-C | Availability Window, policy services/capabilities, Archive record, edit exception, disclosure state/reveal | SG-005, SG-010, SG-013, SG-017 part, SG-P01–P03 | half-open boundary tests; monotonic Archive; reveal retry; legacy cohort behavior; capability reason codes |
| 004-E Publication, Public Access, Schedule & Dispatch Hardening | F5-W5/W6/W7 | 004-D | share provenance, Publication history, public resolver, schedule proposal/apply, Dispatch messages/attempts | SG-008, SG-009, SG-014, SG-015, SG-016, SG-P04 | old-publicId denial test; exact publication tests; stale schedule apply conflict; provider uncertainty/idempotency tests |
| 004-F Semantic Read Models, API/UI Cutover & Compatibility Retirement | F6/F7/F8 | 004-E | semantic read composition, first-party components/routes, error codes, compatibility adapters | interface portions of all SGs | zero unexplained parity defects; first-party semantic reads/writes; raw compatibility writes eliminated |
| 004-G Migration Validation, Rollback Rehearsal & Legacy Cleanup Gate | F4/F9 + cross-slice | 004-F | migration reports, consumer inventory, cleanup migrations, recovery procedures | closure governance for all | invariant/scenario suite; backup restore; projection repair; removal decisions; legacy-unknown terminal disposition |
| 004-H Phase 004 Consolidation & v0 Implementation Exit Review | consolidation | 004-G | documentation, closure ledger, final runtime audit | all | every SG/SG-P verified-closed or explicitly deferred; no competing supported writer; Phase 004 gate |

## Hard dependency rationale

### 004-A before semantic slices

Target writes cannot be deployed safely before versioned schema history, repeatable migrations, backup/restore and additive target structures exist.

### 004-B before 004-C

Revision is the exact version-sensitive anchor used by Evaluation and Classification. Establishing it early removes the immediate Evaluation-overwrite risk and gives later read models a reliable subject identity.

### 004-C before 004-D

Operational participation truth must be independent before lifecycle/edit/disclosure policy is applied broadly. Otherwise policy risks continuing to key off the old combined `programStatus` state.

### 004-D before 004-E

Publication and operational communication require settled authority/lifecycle rules. Controlled Disclosure/public policy boundaries must be active before visibility-sensitive surfaces are cut over.

### 004-E before 004-F

Public, schedule and dispatch semantic writers must exist before first-party semantic read/API/UI cutover can rely on them.

### 004-F before 004-G

Legacy cleanup cannot be assessed until first-party consumers have actually left competing legacy interfaces.

## Cross-package constraints

- No package may introduce one table/service/API per concept merely for naming symmetry.
- Every package may retain physically combined aggregates when semantic ownership remains unambiguous.
- Schema expansion is permitted in 004-A onward; destructive schema removal remains gated until 004-G.
- Canonical history created in one package becomes a rollback floor for later packages where the canonical baselines require it.
- A later package may discover an implementation defect in an earlier package and return to that package's target; it may not silently weaken the canonical rule.

## Phase 004 branch posture

Recommended implementation branch: `concept-design/v0-implementation`, created from the 003-G gate commit.

The Phase 001–003 design record should remain stable. Runtime implementation evidence should be added without rewriting historical reasoning solely to match code.