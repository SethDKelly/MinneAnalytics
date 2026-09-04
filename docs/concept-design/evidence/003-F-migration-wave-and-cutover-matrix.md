# 003-F Migration Wave & Cutover Matrix

Status: historical implementation-planning evidence  
Canonical owner: [MinneAnalytics v0 Migration, Backfill & Rollout Execution Plan](../knowledge/reconciliation/migration-rollout-execution-plan.md)

This matrix records the ordered implementation waves considered and accepted in 003-F. It is not a second source of migration authority.

| Wave | Scope | Entry gate | Primary work | Exit gate | Rollback posture |
|---|---|---|---|---|---|
| F0 | migration discipline | Phase 003-A–E targets accepted | establish committed Prisma migration history, migration/backfill commands, backup/restore rehearsal, current invariant baseline, consumer inventory | reproducible current-schema baseline + tested restore + versioned migration path | full application/schema behavior rollback while no native target writes exist |
| F1 | additive schema | F0 complete | add nullable/backward-compatible target history/reference tables/fields plus migration provenance and durable-work support | legacy application still runs; target schema deploys without destructive cleanup | leave additive schema in place if application rolls back |
| F2.1 | Revision references | F1 complete | predecessor/current Revision links; current-state baseline Revision only where exact snapshot is absent | each in-scope active Proposal has one exact current Revision | rollback reads; preserve created target references/records |
| F2.2 | Classification | exact Revisions | reconstruct Revision↔Term from historical `themeIds`; compare current relation to `SubmissionTheme` | no missing active Term refs; differences classified | preserve target relations; legacy reads remain available |
| F2.3 | Evaluation/Feedback refs | exact Revisions | bind unambiguous Scores and ABSTRACT Feedback to exact Revision | ambiguous rows explicitly legacy-unknown/quarantined; no false attribution | retain legacy rows and mappings; do not delete target refs |
| F3.1 | Selection/Withdrawal seeds | reference groundwork validated | decompose current `programStatus` with no invented Clear/prior disposition | compatibility projection explainable for non-ambiguous rows | seeds remain additive; legacy reads still primary |
| F3.2 | Capacity seed | Selection/Withdrawal seed | establish accepted Pool and one-unit allocations for effective participants | committed <= limit; otherwise blocking operator reconciliation | no silent limit inflation; remove no truth |
| F3.3 | Deliverable seed | participation refs | establish Requirements; map current `APPROVED`/`CONCERN`; keep `REVIEWED` as residue | exact artifact/readiness relationship validated | legacy deckStatus still readable |
| F3.4 | Vocabulary/Coverage | Terms stable | seed current TermState; migrate explicit coherent targets | no invented history; absent target distinct from zero | additive |
| F3.5 | Availability | context identified | seed only valid bounded Windows | every cutover context has valid Window or remains compatibility-scoped | compatibility window fields remain |
| F3.6 | Archive | current state | seed currently archived contexts from surviving evidence | no fabricated archive event time/actor | additive; Archive record never erased after native use |
| F3.7 | Publication/share | exact artifacts | seed only exact currently exposed latest eligible material; classify share provenance | exact public set can be enumerated and validated | exact-public authorization becomes rollback floor at cutover |
| F3.8 | Disclosure | review contexts | classify legacy in-flight exposure as unknown; do not fabricate concealed/revealed | native staging strategy ready for post-cutover contexts/Revisions | legacy cohort remains explicit compatibility scope |
| F3.9 | Dispatch | historical sends | retain stable IDs/recipients; exact old message remains unknown | no mutable template content asserted as historical send | additive |
| F4 | validation/quarantine | F2/F3 scripts complete | rerun backfills; emit reports; classify pass/legacy-unknown/operator-required/blocking-defect | zero blocking defects for the slice being cut over | no authority movement yet |
| F5-W1 | Revision/Classification/Evaluation/Feedback writes | F4 refs pass | semantic Revision/Evaluation writes; current projection maintained | new Revision cannot overwrite prior Evaluation; first-party write tests pass | reads may remain legacy; canonical writes/history retained |
| F5-W2 | Selection/Withdrawal/Capacity/Deliverable writes | Capacity passes | TX-A entry + TX-B exit; program/deck compatibility projection | no legacy organizer Withdrawal; hard Capacity enforced | revert reads, not independent writers |
| F5-W3 | Window/Archive/action policy writes | policy data valid | action-specific gating; monotonic Archive; suspension-only boolean | no routine unarchive; Window boundary tests pass | maintenance mode preferable to re-enabling unsafe legacy policy writes |
| F5-W4 | Disclosure writes | native review scope defined | persistent identity/aggregate staging/reveal | retry-safe monotonic reveal | reveal history is irreversible truth |
| F5-W5 | Sharing/Publication writes + public resolver | exact artifact/public backfill passes | provenance-aware share changes; exact Publish/Unpublish; exact resolver | old `publicId` cannot bypass exact Publication | public authorization hardening is rollback floor |
| F5-W6 | Schedule | expected-base support | generator returns proposal; accepted apply is transactional | stale proposal conflicts instead of overwriting | current authoritative placements remain recoverable |
| F5-W7 | Dispatch | exact message/attempt storage ready | provider-neutral prepared send + exact message evidence + round dedupe | uncertain outcome blocked; same-round retry idempotent | do not blindly retry uncertain attempts |
| F6 | shadow reads | relevant write/backfill slice active | compute semantic vs legacy read models side by side | zero unexplained differences in scope; all differences classified | disable semantic read while keeping canonical writes |
| F7 | first-party read/UI cutover | F6 pass | public → review → presenter → organizer → schedule → communications → history consumers | first-party consumer inventory migrated for slice | read rollback to compatibility projection remains available |
| F8 | legacy mutation retirement | first-party semantic writes complete | legacy endpoints become narrow adapters/read-only projections; ambiguous writes rejected | no independent legacy writer remains for migrated scope | do not re-enable raw writers after canonical history exists |
| F9 | contract/destructive cleanup | full removal gate | optionally remove obsolete fields/enums/routes/indexes after dependency proof | reverse/forward repair plan + backup/restore + no consumer dependency | destructive reverse migration only if it preserves canonical history |

## Accepted ordering rationale

1. **Exact Revision identity first** because Evaluation and Classification depend on it.
2. **Selection/Withdrawal before Capacity operational cutover** because effective participation is their derived input.
3. **Capacity before authoritative selected-entry writes** because over-allocation is a hard invariant.
4. **Deliverable exact readiness before exact Publication** because public eligibility depends on the exact artifact.
5. **Publication backfill before public resolver cutover** so public access can become exact-material based without a gap.
6. **Canonical writes before semantic reads** so interfaces never depend on state that is not being maintained correctly.
7. **Legacy mutation retirement before destructive field removal** so physical cleanup cannot accidentally become the authority transition.

## Explicitly rejected rollout shapes

### Big-bang schema + application rewrite
Rejected because it maximizes rollback ambiguity, consumer breakage, and data-loss risk.

### Delete old fields immediately after backfill
Rejected because read/API/UI consumers still depend on them and some target histories are legacy-unknown.

### Read target state while continuing independent legacy writes
Rejected as permanent architecture because divergence becomes unavoidable.

### Re-enable raw legacy writers as rollback after canonical history begins
Rejected because mutable `programStatus`, one-row `Score`, `abstractReviewStatus`, and similar fields can contradict or erase newly captured truth.

### Invent missing history to avoid null/unknown states
Rejected by the migration truth rule.

### Require database-engine migration before semantic reconciliation
Rejected as unnecessary. SQLite/Prisma can support the planned semantic migration if versioned migrations, backup discipline, and concurrency constraints are handled correctly.