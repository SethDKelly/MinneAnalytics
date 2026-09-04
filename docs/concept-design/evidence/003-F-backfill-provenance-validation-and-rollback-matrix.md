# 003-F Backfill Provenance, Validation & Rollback Matrix

Status: historical implementation-planning evidence  
Canonical owner: [MinneAnalytics v0 Backfill, Validation & Reversibility Baseline](../knowledge/reconciliation/backfill-validation-reversibility-baseline.md)

This matrix records accepted migration interpretations and gates. It does not supersede the canonical baseline.

| Area | Source evidence | Target treatment | Provenance | Blocking condition | Rollback note |
|---|---|---|---|---|---|
| Proposal | `Submission.id` | reuse identity | historical/current source identity | duplicate/corrupt ID impossible to resolve | identity is retained; no replacement rollback needed |
| current Revision | matching `SubmissionRevision(submissionId, abstractVersion)` | set exact currentRevisionRef | backfilled-historical when exact row exists | no exact current Revision and no safe baseline can be established | additive ref can remain during read rollback |
| missing current Revision snapshot | current Submission content | create one migration-baseline current Revision without invented actor/predecessor/event time | backfilled-current-state | cannot establish one coherent current content state | never describe baseline as full historical chain |
| Revision predecessor | version ordering with contiguous evidence | link exact predecessor | backfilled-historical | cycles/duplicate ordinal/ambiguous ordering | preserve links; do not invent missing middle rows |
| Revision Classification | `SubmissionRevision.themeIds` + Theme IDs | exact Revision↔Term relation | backfilled-historical | missing Term ref for active current Classification | current legacy join remains compatibility mirror |
| current `SubmissionTheme` | current join | compare/project current Revision classification | compatibility | unexplained mismatch at cutover | repair projection from canonical after write cutover |
| Evaluation | Score + trustworthy `scoredAbstractVersion` | bind Score to exact Revision | backfilled-historical/current surviving record | exact subject ambiguous for record expected to be canonical | ambiguous row remains compatibility-only; no fake old Evaluation |
| overwritten prior Evaluation | no durable row | no backfill | legacy-unknown | non-blocking if target starts native history and UI does not imply recovery | cannot be restored by rollback |
| Feedback | kind + `abstractVersion` | ABSTRACT → exact Revision; GENERAL → Proposal/context | backfilled-historical where exact | missing exact Revision for ABSTRACT row | retain legacy Feedback; quarantine exact link |
| Selection | `programStatus` + supported `approvedAt` | latest Decision seed | backfilled-current-state | projection cannot explain current supported state | legacy read remains until normalized |
| Withdrawal | `WITHDRAWN` + `withdrawnAt`/current state | independent Withdrawal seed | backfilled-current-state | current withdrawn state cannot be represented truthfully | Withdrawal record, once native, is rollback floor |
| erased Selection/Withdrawal history | no durable evidence | no backfill | legacy-unknown | non-blocking | never invent transitions |
| Capacity Pool | rooms/session config minus trims | operator-validated finite Pool | backfilled-current-state/config seed | invalid/negative/unaccepted limit | block Selection/Capacity write cutover |
| Capacity Allocation | migrated effective participation | one-unit active Allocation | backfilled-current-state | committed > Pool or duplicate required allocation | never inflate Pool silently |
| Vocabulary | Theme current name + removedAt | current TermState | backfilled-current-state | invalid/missing stable Term identity | older labels/transitions remain unknown |
| Coverage Target | nonzero coherent target bounds | explicit Target | backfilled-current-state | incoherent bound for target intended to migrate | `0/0` defaults to no target, not zero-width |
| Availability Window | both timestamps present and ordered | Window seed | backfilled-current-state | missing/invalid bounds for context entering canonical Offer policy | context remains compatibility-scoped until normalized |
| `submissionsOpen` | boolean | manual suspension only | compatibility-policy input | none by itself | cannot reopen canonical Window |
| Deliverable Requirement | migrated effective participant | Requirement seed | backfilled-current-state | obligation applicability cannot be determined | operator normalization may be required |
| DeckFile | existing ID/version | reuse ArtifactVersion | historical source identity | version collisions/corrupt relation | exact file history preserved |
| deck `APPROVED` | latest file + status | `ready` Assessment seed | backfilled-current-state | no exact latest file | do not attach readiness to Proposal alone |
| deck `CONCERN` | latest file + status | `concern` Assessment seed | backfilled-current-state | no exact latest file | same |
| deck `SUBMITTED` | latest file | no final Assessment; awaiting-review derived | current state | none | compatible |
| deck `REVIEWED` | legacy enum only | no canonical Assessment; legacy residue | legacy-unknown/unsupported residue | non-blocking with explicit UI behavior | native commands never recreate REVIEWED |
| share eligibility | `deckShareable` | current policy input | backfilled-current-state | none; provenance must be explicit | legacy `true` is not presenter consent |
| Publication | current `decksPublished` + exact latest eligible DeckFile | exact published Publication seed | backfilled-current-state | exact currently exposed material cannot be established | public resolver remains compatibility-scoped until fixed |
| prior Publication history | event-wide timestamps/flags only | no inferred exact history | legacy-unknown | non-blocking | do not infer old files/public intervals |
| Archive | current archived state + surviving `archivedAt` | closure seed | backfilled-current-state | cannot represent current closure without fabricated occurrence data | record migration time separately from unknown event time |
| erased Archive/reopen history | cleared legacy provenance | no backfill | legacy-unknown | non-blocking | cannot be recreated |
| identity Disclosure for existing review context | no durable reveal record | legacy in-flight cohort | legacy-unknown | non-blocking if old cohort isolated | absence of Reveal must not mean unseen |
| peer aggregate on new Revision after cutover | new exact Revision | native staged disclosure | native | staging/reveal invariant failure | monotonic Reveal cannot be rolled back |
| historical Dispatch message | Batch/SendRecord + mutable template only | preserve recipient/send metadata, no exact content claim | legacy-unknown for message | non-blocking | mutable template cannot be copied as historical message |
| new Dispatch | exact prepared message + stable recipient/round | native SendRecord/message evidence | native | inability to enforce round/idempotency/uncertainty semantics | uncertain provider outcome is rollback floor |
| Schedule current placements | existing placement rows | retain authoritative state | current/historical existing | duplicate/corrupt room-slot constraints | proposal/apply migration is behavior-only |
| compatibility `programStatus` | canonical Selection + Withdrawal | derived projection | compatibility | mismatch not classified | repair from canonical after cutover |
| compatibility `deckStatus` | current artifact Assessment | derived projection where native | compatibility | `REVIEWED` unexplained as native | preserve residue until migrated/retired |
| `abstractReviewStatus` | legacy row | legacy-only read residue | compatibility | must not block semantic cutover if target read model exists | never re-enable as canonical action gate |

## Validation severity

| Severity | Meaning | Cutover behavior |
|---|---|---|
| PASS | target fact supported and invariant-valid | proceed |
| EXPECTED-UNKNOWN | missing history is inherently unrecoverable and has explicit compatibility semantics | proceed for affected slice if UI/API is truthful |
| NORMALIZE | operator/product normalization required | affected context/slice remains on compatibility path |
| BLOCK | target correctness/security invariant cannot be guaranteed | no canonical cutover for affected slice |

## Required pre-cutover reports

Each in-scope Conference/context should have a generated report covering at least:

- Proposal and current Revision counts;
- Revision chain anomalies;
- Classification missing-term anomalies;
- exact Evaluation mappings and ambiguous legacy Scores;
- Selection/Withdrawal projection parity;
- Pool limit, active Allocation count, committed units;
- Deliverable/artifact/Assessment mapping and legacy `REVIEWED` residues;
- Window validity;
- Coverage targets migrated/skipped;
- Archive seed/provenance classification;
- exact currently public MaterialRefs and public resolver parity;
- legacy disclosure-cohort count;
- historical Dispatch records lacking exact message evidence;
- semantic-vs-compatibility parity differences classified by reason.

## Rollback invariants

The following must remain true even when a release is behaviorally rolled back:

1. native Selection Decisions are not deleted;
2. Withdrawal remains monotonic;
3. exact-Revision Evaluations already created are retained;
4. Controlled Disclosure Reveal remains revealed;
5. Capacity Allocation/Release history is retained;
6. exact ArtifactVersion Assessments remain attached to the same file;
7. exact Publication history is retained;
8. Archive closure is retained;
9. exact new Dispatch message evidence is retained;
10. source-authoritative TX-B cleanup continues or remains recoverable;
11. public-file authorization does not regress to mutable-parent authorization.

## Destructive cleanup evidence required

Before a later implementation phase drops a compatibility column/table/enum/path, the change must show:

- zero first-party write dependencies;
- zero unsupported read dependencies or an intentional adapter;
- no external/documented consumer dependency;
- canonical state coverage for supported active rows;
- accepted disposition for legacy-unknown rows;
- successful projection-repair test;
- successful backup/restore rehearsal;
- rollback strategy that preserves canonical history;
- documentation/test updates removing claims of legacy authority.