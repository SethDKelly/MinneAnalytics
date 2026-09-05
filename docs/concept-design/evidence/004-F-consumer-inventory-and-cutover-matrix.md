# 004-F — First-Party Consumer Inventory & Cutover Matrix

Status: **Implementation evidence**  
Phase: **004-F — Semantic Read Models, API/UI Cutover & Compatibility Retirement**  
Branch: **`concept-design/v0-implementation`**

This evidence records which first-party consumers were moved from legacy compatibility fields to the canonical semantic read model during 004-F. It is not a new normative design layer; current authority remains in the Phase 003 reconciliation nodes.

## Cutover rule

004-F distinguishes **semantic-authority retirement** from **physical storage deletion**.

A compatibility column or adapter may remain present for external compatibility or rollback, but a first-party consumer is considered cut over only when its user-visible decisions derive from the canonical owner rather than the compatibility projection.

Physical deletion remains prohibited until 004-G validates the cleanup/removal gate.

## Consumer matrix

| Consumer / surface | Legacy authority before 004-F | 004-F semantic source | Result |
|---|---|---|---|
| Shared conference submission composition | `Submission` current fields, `programStatus`, `deckStatus`, `abstractVersion`, `SubmissionTheme` | exact current `SubmissionRevision`, `RevisionTerm`, Selection + Withdrawal, exact current-Revision Evaluations, Deliverable/Assessment, ShareEligibilityChange, exact Publication | **cut over** |
| Reviewer queue | integer `scoredAbstractVersion == abstractVersion` | evaluator Evaluation subject `submissionRevisionId == current RevisionRef` | **cut over** |
| Reviewer aggregate display | version-filtered Score projection plus null/blank masking | current exact-Revision aggregate + explicit protected-information state | **cut over** |
| Reviewer identity display | blank/masked presenter strings | explicit `visible` / `concealed` identity state | **cut over** |
| Presenter portal | ProgramStatus + AbstractReviewStatus + DeckStatus | Selection, Participation, Deliverable readiness, exact Revision, server-derived edit eligibility | **cut over** |
| Chair program list | ProgramStatus / DeckStatus / current Submission fields | exact current Revision + Selection + Participation + Deliverable + Sharing semantic labels | **cut over** |
| Chair Selection actions | generic program-status mutation route | action-oriented Selection disposition endpoint | **cut over** |
| Chair Deliverable review | generic deck-status mutation including `REVIEWED` | action-oriented exact ArtifactVersion Assessment (`READY` / `CONCERN`) | **cut over** |
| Capacity widget/counts | counts inferred from ProgramStatus | Capacity Pool/active Allocation validation + effective participation | **cut over** |
| Deck queue | `programStatus`, `deckStatus`, `deckShareable`, latest deck | effective participation + exact current ArtifactVersion + current Assessment + ShareEligibilityChange + Publication | **cut over** |
| Public deck archive/file | mutable parent Submission state | exact `DeckFile -> Publication -> PublicationState -> exact eligibility` after Publication cutover | **already hardened in 004-E; preserved** |
| Schedule pool | `programStatus=APPROVED` | effective participation | **cut over** |
| Schedule displayed/generated content | mutable `Submission.title` / `technicalLevel` | exact current Revision title / technical level | **cut over** |
| Schedule generation interaction | mutating generate-and-refresh mental model | explicit non-authoritative proposal + expected-base atomic apply | **cut over** |
| Dispatch audience | ProgramStatus / DeckStatus recipient queries | Selection/Participation/Deliverable semantic state | **cut over** |
| Dispatch message context | mutable Submission title | exact current Revision title | **cut over** |
| Dispatch repeat control | `includeAlreadyEmailed` bypass | explicit semantic round; same-round idempotent, new round intentional repeat | **cut over** |
| Dispatch preview | legacy recipient resolver | canonical Dispatch audience resolver | **cut over** |
| Proposal submission page | Conference status + legacy timestamp mirrors | durable AvailabilityWindow + ArchiveRecord + suspension policy | **cut over** |
| Upcoming/public conference list | Conference status/timestamps | ArchiveRecord + AvailabilityWindow projection | **cut over** |
| Admin availability/archive view | Conference status/timestamps | ArchiveRecord + AvailabilityWindow projection | **cut over** |
| Historical conference discovery | `Conference.status=ARCHIVED` | durable ArchiveRecord existence | **cut over** |
| CSV export | ProgramStatus, DeckStatus, integer revision/status fields as primary meaning | semantic Proposal/Selection/Participation/Revision/Deliverable/Sharing/Publication/Evaluation columns | **cut over** |

## Compatibility surfaces deliberately retained

004-F does **not** physically remove:

- `Submission.programStatus`;
- `Submission.abstractVersion`;
- current mutable Submission content projections;
- `Submission.abstractReviewStatus`;
- `SubmissionTheme` current mirror;
- `Submission.deckStatus`;
- `Submission.deckShareable`;
- Conference submission-window timestamp mirrors;
- `Conference.status` / `archivedAt` compatibility views;
- legacy generic organizer mutation routes;
- compatibility CSV columns.

Their remaining reasons are bounded:

1. external/legacy API compatibility;
2. reversible read rollout where the canonical rollback floor permits it;
3. migration parity/diagnostics;
4. 004-G cleanup assessment.

None is intended to regain first-party semantic authority after the 004-F cutover.

## Legacy adapters still present

The generic `program-status` and `deck-status` route families remain transitional adapters. The first-party chair UI no longer uses them for Selection or Deliverable review.

Likewise, integer-version helper functions and the synchronous legacy submission-window helper remain for migration/external compatibility but are no longer the first-party decision path.

## Scope conclusion

004-F successfully moved the principal presenter, reviewer, organizer, scheduling, communication, public-availability, deck, and export consumers to semantic owners while retaining compatibility storage for 004-G review.

This matrix therefore supports **authority retirement**, not destructive schema cleanup.