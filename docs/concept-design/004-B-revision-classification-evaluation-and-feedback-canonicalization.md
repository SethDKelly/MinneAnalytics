# 004-B — Revision, Classification, Evaluation & Feedback Canonicalization

Status: **Complete**  
Concept model maturity: **v0 specified; implementation execution in progress**  
Branch: **`concept-design/v0-implementation`**

## 1. Purpose

004-B executes the first semantic write-cutover slice authorized by the Phase 003 reconciliation baseline. It prevents version-sensitive Evaluation history from being overwritten and establishes exact Revision identity as the implementation anchor for mutable Proposal content, Classification, and abstract Feedback.

The package also executes the SG-011 Vocabulary-history portion assigned to 004-B by the canonical semantic-gap baseline.

Canonical semantics remain owned by the Concept Catalog and the Phase 003 reconciliation targets. This file records implementation decisions and evidence; it does not redefine those rules.

## 2. Runtime realization

### Revision

`SubmissionRevision.id` is now the exact version-sensitive reference used by the canonical write path.

The canonical service:

- establishes an initial Revision together with exact Classification;
- appends successor Revisions against the expected current Revision head;
- records predecessor identity;
- supports deterministic command replay through a command key;
- rejects stale expected heads rather than creating an accidental branch;
- advances `Submission.currentRevisionId` atomically;
- refreshes the legacy current-content and ordinal projections from the accepted Revision.

The existing mutable Submission content remains a compatibility/current projection rather than a second Revision authority.

### Classification

`RevisionTerm` is the canonical exact `RevisionRef × TermRef` relation.

A Revision is accepted with its complete Term set in the same transaction. `SubmissionTheme` remains a current-Revision compatibility mirror for existing consumers; retained JSON `SubmissionRevision.themeIds` remains migration/compatibility evidence rather than canonical association authority.

### Evaluation

`Score.id` remains Evaluation identity, but uniqueness is no longer one Score per reviewer + Submission.

The 004-B migration introduces exact Evaluation identity derived from reviewer + exact Revision and removes the legacy database uniqueness that forced later rescoring to overwrite an earlier Revision-specific judgment.

Therefore:

- revising a judgment about the same exact Revision updates that Evaluation;
- judging a later Revision creates a distinct Evaluation;
- the earlier Evaluation remains historically true about its original Revision.

The canonical Evaluation history is a rollback floor: independent legacy writers that would collapse exact Revision history cannot safely regain authority after target-native Evaluation history exists.

### Feedback

ABSTRACT Feedback records exact `SubmissionRevision.id` when created through the 004-B writer. GENERAL Feedback remains Proposal/context-level where no exact Revision subject is intended.

004-B does not yet separate Feedback from legacy review-workflow/edit-opportunity and notification side effects; those remaining SG-017 concerns stay assigned to later Phase 004 packages.

### Vocabulary

`Theme.id` remains the stable TermRef. `TermState` now records append-only current label/availability history for target-native correction, retirement, and restoration.

`Theme.name` and `removedAt` are updated only as compatibility/current projections when canonical Vocabulary writes are enabled. Retirement does not delete historical Revision Classification references.

Coverage Target bounds remain outside TermState and were not absorbed into 004-B.

## 3. Migration and backfill

Checked-in migration:

`20260904002000_revision_classification_evaluation_feedback`

It adds Revision command/provenance support and exact Evaluation identity while replacing the legacy reviewer+Submission uniqueness with compatibility indexing.

Two explicit backfills are retained:

- `scripts/migrations/backfill-004-b-vocabulary.ts` — establishes current TermState seeds without fabricating historical term changes;
- `scripts/migrations/backfill-004-b.ts` — reconstructs supported Revision predecessor/current references, exact Classification, Evaluation subjects, and abstract Feedback subjects.

Backfill policy follows the Phase 003 no-fabrication rule:

- reconstructible exact references are established;
- a missing current Revision may receive a `BACKFILLED_CURRENT_STATE` baseline from durable current state;
- missing predecessor or exact historical subject evidence remains `expected-legacy-unknown`;
- conflicting current projections/references are blocking defects rather than silently repaired guesses.

## 4. Staged write cutover

The runtime switch remains:

`MINNE_V0_WRITE_REVISION_EVALUATION`

With the gate enabled, first-party write paths for initial Proposal creation, presenter Revision, scoring, exact abstract Feedback, Vocabulary mutation, and demo scoring use the canonical implementation services.

With the gate disabled, compatibility behavior remains available for staged deployment. This is not authorization to re-enable a history-erasing legacy Evaluation writer after canonical history has been accepted in a persistent environment.

## 5. Verification

004-B has dedicated executable verification for:

- initial exact Revision + Classification establishment;
- expected-head append;
- deterministic command replay;
- stale-head rejection;
- same-Revision Evaluation revision without duplicate identity;
- later-Revision Evaluation without erasing the prior Evaluation;
- exact Feedback→Revision attribution;
- current Submission/SubmissionTheme compatibility projection;
- Vocabulary correction, retirement, restoration, and stable Term identity.

The existing-database rehearsal applies the checked-in migration chain to the pre-004-A SQLite fixture and runs both 004-B backfills after baseline adoption.

## 6. CI exit evidence

GitHub Actions run **33889434184**, head `14ab6b794e284bd4e21daf87b40703d0780c2619`, completed successfully.

The same branch head passed:

1. dependency installation;
2. OKF validation;
3. 004-A migration-foundation verification;
4. Prisma schema validation;
5. the fresh checked-in migration chain;
6. migration baseline reporting;
7. Revision/Classification/Evaluation/Feedback semantic verification;
8. Vocabulary semantic verification;
9. pre-004-A SQLite baseline adoption;
10. Vocabulary backfill;
11. exact Revision/Classification/Evaluation/Feedback backfill;
12. lint;
13. optimized production build.

A build-only TypeScript relation-shape defect in the backfill was discovered during execution and corrected before this exit was accepted; the correction did not alter migration semantics.

## 7. Gap-state effect

004-B materially advances:

- SG-001 — exact Revision-bound Evaluation and non-erasure;
- SG-006 — exact Revision Classification;
- SG-011 — Vocabulary TermState history;
- SG-012 — exact current/predecessor Revision and compatibility ownership;
- the exact-subject portion of SG-017 — abstract Feedback.

These items are **not declared globally `verified-closed` here**. Semantic read cutover, first-party consumer migration, remaining compatibility authority retirement, rollback rehearsal, and final closure accounting remain owned by 004-F through 004-H.

004-B establishes the required canonical write/history and migration evidence for its slice.

## 8. Exit decision

004-B passes its package gate because exact Revision-sensitive history is now representable, target-native writers preserve that history, migration/backfill behavior is truthful and executable, and the complete branch-head CI gate is green.

Next package:

> **004-C — Selection, Withdrawal, Capacity & Deliverable Canonicalization**
