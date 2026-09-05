# 004-F — Semantic Read Parity & Drift Evidence

Status: **Implementation evidence**  
Phase: **004-F — Semantic Read Models, API/UI Cutover & Compatibility Retirement**

## Purpose

Record evidence that first-party semantic reads do not merely agree with healthy compatibility projections; they remain correct when those projections are deliberately wrong.

This is stronger than an equality-only shadow test because it demonstrates that canonical owners, not legacy fields, determine the result.

## Verification entrypoint

```text
npm run db:004-f:verify
```

CI runs this verifier with all previously migrated write gates plus:

```text
MINNE_V0_SEMANTIC_READS=true
```

## Adversarial drift scenario

The verifier creates target-native semantic state in dependency order:

1. live Conference plus canonical Proposal-offer AvailabilityWindow;
2. Proposal with initial exact Revision and Classification;
3. Evaluation bound to exact Revision 1;
4. successor Revision 2 with changed title, abstract, biography, technical level and Classification;
5. Selection `SELECTED` and effective participation;
6. current deck ArtifactVersion;
7. exact `READY` Deliverable Assessment;
8. affirmative ShareEligibilityChange.

It then intentionally corrupts retained compatibility/current-projection state:

- `programStatus = PENDING`;
- stale Submission title, abstract, biography and technical level;
- `abstractVersion = 999`;
- `abstractReviewStatus = FEEDBACK_PENDING`;
- `deckStatus = CONCERN`;
- `deckShareable = false`;
- `SubmissionTheme` reset to the prior Revision's Theme;
- legacy Conference submission-window timestamps placed outside the canonical open Window.

No repair is performed before the semantic reads are exercised.

## Required results under deliberate drift

The verifier proves:

- Proposal availability follows the canonical AvailabilityWindow rather than drifted timestamp mirrors;
- current `RevisionRef` and ordinal resolve to Revision 2, not `abstractVersion=999`;
- displayed title and technical level come from exact Revision 2, not stale Submission fields;
- current Classification comes from Revision 2 `RevisionTerm` state, not `SubmissionTheme`;
- Selection remains `SELECTED` and participation remains effective despite `programStatus=PENDING`;
- Deliverable remains `ready` despite `deckStatus=CONCERN`;
- sharing remains eligible despite `deckShareable=false`;
- parity metadata flags the intentionally divergent compatibility projections;
- the retained Revision-1 Evaluation is classified as `revision-changed`, not discarded or treated as current;
- reviewer queue places that Proposal into `Needs rescore` until an exact Revision-2 Evaluation is recorded;
- after the Revision-2 Evaluation, the same Proposal moves to the current/scored queue;
- Capacity still counts the effective participant;
- deck queue still reports exact current ArtifactVersion readiness/sharing;
- Schedule pool includes the effective participant and shows the Revision-2 title/technical level;
- Dispatch `CALL_FOR_DECK` audience includes the effective participant and renders the Revision-2 title.

## Observed CI evidence

GitHub Actions run **33937439077**, implementation head
`fcf80fc86a6eb57ed46b441a9d9cc26578131f39`, passed the full 004-F verifier after the final type correction.

The verifier's machine-readable console evidence included:

```text
ok: true
priorEvaluationClassified: revision-changed
compatibilityDriftDetected.programStatus: true
compatibilityDriftDetected.abstractVersion: true
compatibilityDriftDetected.deckShareable: true
capacityApprovedCount: 1
scheduleTitle: Revision two canonical title
dispatchTitle: Revision two canonical title
```

The same run also passed:

- OKF validation;
- migration-foundation verification;
- Prisma schema validation;
- the complete six-migration fresh deployment;
- all 004-B, 004-C, 004-D and 004-E semantic verifiers;
- the existing-database baseline-adoption and semantic-backfill rehearsal;
- lint;
- production build with semantic reads enabled.

## Compiler repair history

Two build-only defects surfaced after the semantic/migration gates were already green:

1. a reviewer client imported display helpers from the server semantic-read module, causing a transitive `node:crypto` browser-bundle dependency;
2. the protected aggregate compatibility alias was typed as an impossible intersection between the base non-null aggregate and a nullable concealed value.

Both repairs were integration/type-boundary changes only. They did not alter persistence, canonical semantics, migration behavior or the drift assertions.

## Parity interpretation

Compatibility equality remains useful operational evidence, but 004-F intentionally does **not** define equality as semantic authority.

A mismatch means:

- canonical state is still used by first-party consumers;
- the mismatch must be surfaced for migration/operations review;
- no automatic bidirectional repair may silently let the compatibility field win.

004-G owns the cross-environment parity evidence needed to determine whether a given compatibility field/adapter is eligible for physical removal.

## Conclusion

The 004-F verifier demonstrates genuine read-authority cutover: canonical reads survive known compatibility drift while still exposing that drift for reconciliation. This satisfies the consumer-side authority objective without prematurely deleting rollback/compatibility surfaces.