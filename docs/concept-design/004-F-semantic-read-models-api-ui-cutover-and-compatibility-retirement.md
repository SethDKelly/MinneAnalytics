# 004-F — Semantic Read Models, API/UI Cutover & Compatibility Retirement

Status: **Complete**  
Concept model maturity: **v0 specified; implementation execution in progress**  
Branch: **`concept-design/v0-implementation`**

## 1. Purpose

004-F executes the consumer/read side of the Phase 003 reconciliation target.

004-B through 004-E established canonical write-side persistence, histories, policy and external-boundary behavior. 004-F prevents the application from continuing to interpret legacy compatibility projections as domain truth after those write cutovers.

The package therefore moves first-party:

- semantic read composition;
- reviewer queues and protected-information presentation;
- presenter state and action eligibility;
- organizer program/deck state and action contracts;
- Capacity and Schedule consumers;
- Dispatch audiences and preview semantics;
- Proposal availability and Archive views;
- CSV/export representations;

onto the accepted canonical owners.

004-F does **not** physically delete compatibility columns, enums or legacy adapter routes. Destructive cleanup remains owned by 004-G.

## 2. Governing distinction — authority retirement is not storage deletion

A compatibility field may remain persisted without remaining semantically authoritative.

After 004-F, first-party consumers treat fields such as these as compatibility/migration surfaces only:

- `programStatus`;
- `abstractVersion`;
- mutable current Submission content fields;
- `abstractReviewStatus`;
- `SubmissionTheme`;
- `deckStatus`;
- `deckShareable`;
- legacy Conference submission-window timestamps;
- lifecycle projection fields.

The canonical read model may expose projected compatibility aliases for transitional clients, but application decisions do not derive from those aliases once semantic reads are enabled.

No steady-state bidirectional repair is introduced. Canonical state wins; compatibility divergence is evidence to inspect, not a reason to overwrite canonical truth.

## 3. Shared semantic submission read model

004-F introduces `lib/concept-design/semantic-reads.ts` as the shared implementation read-composition boundary.

For each Proposal/Submission it composes:

- exact current Revision identity and content;
- exact current Revision Classification;
- current Selection Decision;
- independent Withdrawal;
- derived effective participation;
- current exact-Revision Evaluation aggregate;
- retained historical Evaluations for applicability/rescore analysis;
- Deliverable Requirement, exact current ArtifactVersion and current Assessment;
- current ShareEligibilityChange;
- exact current Publication for the deck-archive surface;
- compatibility parity observations.

This module is an implementation read model, not a new Concept Design concept or alternate normative specification.

## 4. Revision and Classification read authority

Current title, abstract, biography and technical level now come from the exact current `SubmissionRevision` when semantic reads are enabled.

Current theme Classification comes from the exact `RevisionTerm` set for that Revision.

`Submission.abstractVersion`, mutable Submission content fields and `SubmissionTheme` remain compatibility projections only.

This matters beyond the program list: Schedule display/generation and Dispatch message context now also consume the exact current Revision content instead of stale parent projections.

## 5. Evaluation applicability and reviewer queues

Reviewer queue state is no longer inferred from integer version equality alone.

The exact rule is now:

```text
current
  iff Evaluation.submissionRevisionId == current RevisionRef
```

A retained Evaluation for a predecessor Revision is classified as `revision-changed` and appears in **Needs rescore**.

An Evaluation whose legacy exact subject is unknown appears as `legacy-subject-unknown` rather than being silently accepted as current.

Recording an Evaluation for the exact current Revision moves the Proposal into the current/scored queue without erasing earlier Revision-bound Evaluations.

## 6. Explicit protected-information states

Reviewer presentation no longer relies on blank strings or nullable display conventions to imply protected information.

004-F introduces discriminated view states for:

- presenter identity: `visible` / `concealed`;
- committee aggregate: `visible` / `concealed` with an explicit reason.

In blind review, the current-Revision committee aggregate remains concealed until the viewer has an Evaluation for that exact Revision.

The client renders the protected state directly rather than reconstructing disclosure policy from missing text.

## 7. Presenter portal semantic cutover

The presenter portal now presents independent semantic state:

- Selection;
- Participation;
- exact current Revision;
- Deliverable readiness.

It no longer presents `ProgramStatus`, `AbstractReviewStatus` and `DeckStatus` as three domain states.

Edit availability is derived by the server policy function and includes the reason/code when editing is unavailable.

Withdrawal is explicitly presented as independent from the organizer Selection history.

Deck replacement is presented as creation of a new ArtifactVersion whose readiness does not inherit from the predecessor.

## 8. Organizer action-oriented API/UI cutover

The first-party chair UI no longer uses generic status mutation as its primary action contract.

004-F adds:

### Selection action endpoint

Accepts a `SelectionDisposition` or explicit clear and delegates to the canonical Selection writer.

The UI exposes actions such as:

- Select;
- Reserve;
- Not selected;
- Clear Selection decision.

### Deliverable Assessment endpoint

Accepts only canonical Assessment dispositions:

- `READY`;
- `CONCERN`.

The legacy `REVIEWED` deck state has no first-party semantic action path.

The old generic `program-status` and `deck-status` routes remain compatibility adapters for 004-G inventory/removal review.

## 9. Chair state presentation

The organizer program/deck screens now label independent state rather than compressing it into generic badges.

Program rows expose:

- Selection;
- Participation;
- Deck readiness;
- Sharing eligibility where relevant;
- VIP operational state separately.

Deck rows expose:

- exact current ArtifactVersion;
- Deliverable readiness;
- sharing eligibility;
- exact Publication availability.

The collection-level `decksPublished` compatibility flag remains only in the role accepted by 004-E: a public-surface collection gate, not exact Publication identity/state.

## 10. Capacity semantic read

The Capacity display path now validates the canonical Pool and active Allocation state and derives participation counts from Selection + Withdrawal.

A `programStatus` projection cannot remove an actually selected/non-withdrawn Proposal from the first-party Capacity display.

Where a canonical Pool exists, 004-F also treats missing active Allocation for an effective participant as an invariant failure rather than silently reverting to a status count.

## 11. Schedule consumer and interaction cutover

The Schedule pool derives eligibility from effective participation.

Displayed and generated title/technical content comes from the exact current Revision.

The UI now makes the 004-E proposal/acceptance boundary visible:

1. **Generate proposal** computes without mutating authoritative placements;
2. the proposal is explicitly labeled non-authoritative;
3. **Accept proposal** calls the expected-base atomic apply boundary;
4. stale-base rejection discards the proposal and reloads authoritative state;
5. manual drag/drop invalidates the pending generated proposal.

This removes the previous interaction implication that generation itself changed the Schedule.

## 12. Dispatch consumer cutover

Dispatch recipient resolution now consumes semantic state:

- Selection/Participation for selected audiences;
- exact Deliverable readiness for deck reminders;
- exact current Revision content for rendered Proposal title.

The recipient-list and preview endpoints use the canonical Dispatch resolver and `DISPATCH_OPERATIONAL` capability.

The first-party communications UI removes `includeAlreadyEmailed` semantics and exposes the accepted round model explicitly:

```text
same round = retry / idempotent replay
new round  = intentional repeat contact
```

Exact prepared/performed message evidence remains owned by the 004-E Dispatch runtime.

## 13. Availability and Archive read cutover

The public submission page, upcoming-events page and admin lifecycle view now consume:

- the durable Proposal-offer AvailabilityWindow;
- ArchiveRecord;
- the separate manual suspension policy.

Historical conference discovery uses durable ArchiveRecord existence rather than treating mutable lifecycle presentation alone as closure authority.

The old synchronous timestamp-based helper remains only as a deprecated compatibility path.

## 14. Export semantic cutover

CSV export now leads with semantic fields including:

- Proposal reference;
- Selection disposition;
- Withdrawal;
- effective participation;
- current exact Revision reference/version;
- Deliverable readiness;
- exact ArtifactVersion reference;
- sharing eligibility;
- Publication availability;
- current-Revision Evaluation aggregate;
- exact Revision Classification names;
- Evaluation subject references.

Legacy fields remain at the tail of the CSV under explicit `compat_*` names for migration/consumer-transition evidence.

The export therefore preserves compatibility visibility without mislabeling compatibility projections as the primary business meaning.

## 15. Compatibility parity evidence

The semantic read model records stored-versus-projected parity for key retained fields:

- ProgramStatus;
- abstract version ordinal;
- DeckStatus;
- deck sharing flag.

A mismatch is surfaced as reconciliation evidence. It does not cause the compatibility value to win.

The detailed consumer inventory is recorded in:

- `evidence/004-F-consumer-inventory-and-cutover-matrix.md`

The adversarial parity evidence is recorded in:

- `evidence/004-F-semantic-read-parity-evidence.md`

## 16. Adversarial drift verification

`scripts/migrations/verify-004-f.ts` deliberately establishes correct canonical state and then corrupts multiple compatibility projections.

It proves that first-party reads continue to return:

- exact current Revision content and Classification;
- current Selection/effective participation;
- exact Deliverable readiness;
- current share eligibility;
- Revision-aware reviewer applicability;
- Capacity participation;
- deck queue state;
- Schedule content;
- Dispatch message context;
- canonical Proposal availability.

The verifier also proves the mismatches are visible through parity metadata.

This distinguishes genuine authority cutover from simple agreement between duplicated fields.

## 17. CI exit evidence

GitHub Actions run **33937439077**, implementation head
`fcf80fc86a6eb57ed46b441a9d9cc26578131f39`, completed successfully.

The green run passed:

1. dependency installation;
2. OKF validation;
3. migration-foundation verification;
4. Prisma schema validation;
5. complete six-migration fresh deployment;
6. migration baseline reporting;
7. both 004-B semantic verifiers;
8. 004-C participation/Deliverable verification;
9. 004-D lifecycle/authority/disclosure verification;
10. 004-E Publication/Schedule/Dispatch verification;
11. 004-F semantic-read drift verification;
12. pre-existing database baseline adoption;
13. the complete 004-B through 004-E semantic backfill sequence;
14. lint with no warnings/errors;
15. optimized production build with semantic reads enabled.

Two earlier build attempts found only integration/type-boundary defects after all semantic/migration gates were already green:

- a client component accidentally imported a server semantic module that transitively required `node:crypto`;
- a protected aggregate type intersected a non-null base property with a nullable concealed alias.

Both were corrected without altering canonical persistence or semantic behavior.

## 18. Compatibility retirement posture

004-F retires legacy authority from the first-party consumers enumerated in the cutover evidence, but intentionally retains physical compatibility surfaces.

This package does **not** authorize deletion of:

- compatibility columns;
- old enums;
- generic legacy routes;
- migration/backfill evidence;
- fallback readers whose removal still requires consumer inventory/rollback validation.

004-G must decide each removal independently using migration parity, rollback rehearsal and consumer evidence.

In particular, disabling a read feature gate must never reactivate a writer or security path that crossed an irreversible rollback floor such as exact Publication authorization.

## 19. Gap-state effect

004-F materially completes the first-party read/consumer portion of the remaining Phase 003 reconciliation gaps and policies, especially:

- SG-001 — exact Revision-bound Evaluation interpretation;
- SG-002 / SG-003 — Selection and Withdrawal presentation as independent state;
- SG-004 — Capacity read authority;
- SG-005 — explicit controlled/protected information presentation;
- SG-006 — exact Revision Classification reads;
- SG-007 — exact Deliverable readiness reads;
- SG-008 / SG-009 — exact Publication consumer presentation preserved from 004-E;
- SG-013 — canonical AvailabilityWindow reads;
- SG-014 — explicit Schedule proposal/accept interaction;
- SG-015 / SG-016 — semantic Dispatch audience/round presentation;
- SG-P01 / SG-P02 / SG-P03 / SG-P04 — policy-derived action eligibility and separated semantic state.

These are still not globally `verified-closed` solely by 004-F. 004-G owns cross-environment migration validation, rollback rehearsal, residual-consumer inventory and destructive-cleanup eligibility. 004-H owns final Phase 004 closure accounting.

## 20. Exit decision

004-F passes because:

- canonical reads survive deliberately incorrect compatibility projections;
- first-party presenter/reviewer/organizer views no longer interpret generic legacy status fields as domain truth;
- exact Revision identity governs content, Classification and Evaluation applicability;
- protected information is represented explicitly rather than by blank/null convention;
- first-party Selection and Deliverable mutations are action-oriented;
- Capacity, Schedule, Dispatch, public availability and export consumers resolve from canonical owners;
- retained compatibility fields are visibly subordinate and parity-observable;
- no destructive cleanup was performed prematurely;
- fresh and existing-database paths, semantic verifiers, lint and production build are green.

Next package:

> **004-G — Migration Validation, Rollback Rehearsal & Legacy Cleanup Gate**