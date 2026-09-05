# 004-E — Publication, Public Access, Schedule & Dispatch Hardening

Status: **Complete**  
Concept model maturity: **v0 specified; implementation execution in progress**  
Branch: **`concept-design/v0-implementation`**

## 1. Purpose

004-E executes the Publication, public-access, Schedule and Dispatch slice assigned by the [v0 Implementation Execution Handoff](knowledge/reconciliation/implementation-execution-handoff.md).

The package closes the most consequential remaining write-side/public-boundary mismatches without changing the accepted Concept Design model:

- [Publication](knowledge/concepts/publication.md) remains exact MaterialRef exposure history;
- [Schedule](knowledge/concepts/schedule.md) remains planner-authoritative placement state, with generation only a suggestion until explicitly applied;
- [Dispatch](knowledge/concepts/dispatch.md) remains exact recipient/message/performance evidence with semantic-round deduplication;
- public-sharing eligibility, lifecycle authorization, migration cutover and provider behavior remain application policy/infrastructure rather than new concepts.

004-E does not perform the broad semantic read-model/UI migration or compatibility retirement assigned to 004-F.

## 2. Exact Publication authority

The v0 deck archive now realizes Publication against the exact `DeckFile.id` ArtifactVersion and public surface key `deck-archive`.

A Publication identity never repoints from an old ArtifactVersion to a newer one. Exposure changes append `PublicationState` history:

```text
PUBLISHED -> UNPUBLISHED -> PUBLISHED ...
```

with actor/time provenance for native transitions and an expected-current-state check before the Publication head advances.

The collection-level `Conference.decksPublished` flag remains a compatibility/public-surface gate. It no longer substitutes for exact Publication state after cutover.

## 3. Public-sharing provenance

`deckShareable` remains the compatibility projection/input identified by Phase 003; it is not treated as Publication state or legal/presenter consent.

Target-native changes now append `ShareEligibilityChange` with:

- stable Submission/Proposal reference;
- affirmative or negative current policy result;
- actor reference;
- change time;
- predecessor history;
- current pointer on `Submission`.

The compatibility `deckShareable` field is projected from the new current change.

Revoking share eligibility commits the policy change first and enqueues/reuses `SYNC-008` Publication cleanup. Public resolution evaluates current eligibility immediately, so exposure does not remain authorized merely because cleanup has not yet converged.

## 4. Exact Publication eligibility

For the current deck-archive use case, an exact ArtifactVersion is publishable only when all of these hold:

1. it is the Deliverable's exact current ArtifactVersion;
2. its exact current Deliverable Assessment is `READY`;
3. current ShareEligibilityChange is affirmative;
4. current Selection is `SELECTED`;
5. no Withdrawal exists;
6. the command has the applicable Publication capability and lifecycle policy.

Readiness, sharing policy and Publication remain independent authorities.

A newly provided replacement ArtifactVersion therefore does not inherit the old version's readiness or Publication.

## 5. Exact public-token authorization rollback floor

The legacy resolver authorized any known historical `publicId` using mutable parent Submission state. That allowed a superseded ArtifactVersion to become reachable when a newer version was currently ready/shareable.

004-E replaces that authorization after Publication cutover with:

```text
publicId
  -> exact DeckFile
  -> exact Publication(deck-archive)
  -> current PublicationState == PUBLISHED
  -> exact current eligibility
  -> collection public-surface gate
```

An old token is denied as soon as its exact material loses eligibility, even before asynchronous cleanup appends `UNPUBLISHED`.

`PublicationPolicyCutover` is an implementation rollback marker. Once a Conference has crossed it, disabling the rollout feature flag cannot reactivate legacy parent-state authorization. This makes exact historical-public access a security rollback floor rather than a reversible experiment.

## 6. Publication cleanup convergence

004-E completes `SYNC-008` local convergence for the existing v0 eligibility-loss sources.

### Share-policy revocation

`ShareEligibilityChange(eligible=false)` atomically establishes durable cleanup work, then the worker appends `UNPUBLISHED` state to affected exact Publications.

### Participation exit

Selection exit and Withdrawal continue to be owned by 004-C. The 004-E migration adds a cutover-conditional database bridge that inserts `SYNC-008` work in the same source transaction when effective participation leaves the legacy `APPROVED` projection.

The source reference remains the immutable Selection Decision or Withdrawal identity. Publication cleanup cannot erase or roll back the source fact.

### Artifact replacement

When a Deliverable current ArtifactVersion advances after Publication cutover, another transaction-local bridge creates `SYNC-008` work for the superseded exact ArtifactVersion.

The old `publicId` is already denied by exact eligibility before this cleanup completes. Convergence then appends the truthful `UNPUBLISHED` state.

The SQLite triggers are persistence/recovery mechanisms, not Concept Design synchronizations or new domain concepts.

## 7. Post-Archive Publication policy

004-E preserves the accepted Phase 003 distinction between Archive and Publication.

An authorized publisher may:

- Publish/Republish exact eligible event material after Archive;
- Unpublish exact material after Archive whenever exposure should end.

Doing so does not reopen the Conference and does not permit ordinary active-work mutation.

## 8. Schedule generation becomes proposal-only

The legacy generator cleared authoritative placements before calculating replacements and then updated assignments one row at a time.

Under the 004-E Schedule gate, generation is now non-mutating.

It returns:

- a complete generated assignment proposal;
- unassigned Proposal references;
- available session-cell capacity;
- a deterministic fingerprint of the authoritative session-placement base observed during generation.

The fingerprint covers stable placement identity, slot, room and current occupant. Generation itself changes no Schedule state.

## 9. Expected-base atomic Schedule apply

A new explicit apply boundary accepts the generated assignments plus the expected base fingerprint.

Within one database transaction it:

1. requires live/non-Archive operation;
2. reloads authoritative session placements;
3. rejects when the base fingerprint changed;
4. validates unique placement and Proposal assignments;
5. rechecks that every proposed talk is still effectively participating;
6. clears/replaces the accepted session-placement set atomically;
7. returns the new authoritative base fingerprint.

A stale proposal therefore cannot partially clear or overwrite a planner's intervening work.

Manual placement/move/swap operations remain available, but the canonical path now applies the same `MANAGE_SCHEDULE`, lifecycle and effective-participation constraints.

No `ScheduleDraft`, workflow state machine or stored generation proposal concept was introduced.

## 10. Exact Dispatch preparation

Canonical operational email Dispatch now prepares durable exact evidence before provider handoff.

Semantic send identity is:

```text
(conference, template/purpose, round, stable recipient)
```

where recipient identity is the stable Submission or Attendee reference, not the mutable email address.

The prepared `DispatchAttempt` stores:

- Conference/purpose/round;
- stable recipient reference;
- exact destination endpoint;
- exact rendered subject;
- exact rendered body;
- content hash;
- deterministic provider-attempt key;
- attempt/outcome state.

The migration adds database uniqueness for the same semantic round/recipient key so alternate writers cannot create duplicate attempts accidentally.

## 11. Provider outcome and retry semantics

The current local email stub is synchronous, but 004-E hardens the state contract needed by a future real provider:

- `PREPARED` — exact evidence exists before handoff;
- `SUCCEEDED` — handoff is known successful and links to one canonical `EmailSendRecord`;
- `FAILED` — known failure may be retried using the originally prepared endpoint/message;
- `UNCERTAIN` — outcome cannot be proven and blind resend is blocked;
- `BLOCKED` — operational reconciliation is required before another attempt.

A successful native send creates an exact SendRecord containing rendered subject/body/hash and links it from the attempt.

The verifier explicitly injects an `UNCERTAIN` attempt and proves retry does not create a SendRecord or resend.

## 12. Same-round idempotency and intentional repeat

A performed same-round recipient Dispatch is idempotent.

`includeAlreadyEmailed=true` is rejected on the canonical route because it conflicts with semantic-round uniqueness. If the application intentionally wants to contact the same recipient again, it must use a new round.

This preserves the useful historical distinction:

```text
round 1 retry != round 2 intentional repeat
```

without inventing a generic messaging workflow.

## 13. Dispatch lifecycle policy

The canonical Dispatch route now consumes `DISPATCH_OPERATIONAL` rather than borrowing Selection/program-status authority.

During live operation, current v0 templates resolve audiences from canonical state.

After Archive:

- ordinary operational sends such as `CALL_FOR_DECK` are rejected;
- the explicitly classified `CALL_FOR_FEEDBACK` purpose remains allowed for eligible retained participants.

This realizes the action-specific post-closure policy introduced by 004-D without weakening Archive.

## 14. Additive migration and truthful backfill

Checked-in migration:

`20260904005000_publication_schedule_dispatch_hardening`

It adds:

- the Publication cutover marker table;
- Dispatch same-round semantic uniqueness indexes;
- cutover-conditional SYNC-008 enqueue bridges for participation exit and ArtifactVersion replacement.

Backfill entrypoint:

`npm run db:004-e:backfill`

The backfill follows the no-fabrication rules:

- legacy `deckShareable` becomes only a `BACKFILLED_CURRENT_STATE` share-policy observation; actor/time and presenter consent remain unknown;
- when the legacy collection is currently published, only the exact current ArtifactVersion with canonical selected/non-withdrawn/share-eligible/READY evidence receives a current Publication seed;
- superseded historical deck files are never seeded merely because a `publicId` exists;
- a legacy collection publish flag does not manufacture identical historical publish times for every deck;
- legacy SendRecords with missing rendered content remain `expected-legacy-unknown`; current templates are not replayed to fabricate old MessageRefs;
- current Schedule placements are validated against canonical effective participation; migration does not pretend they were generated/accepted through the new proposal boundary;
- Publication cutover is recorded only after the current state is reconcilable.

Machine-readable evidence is retained in the existing `MigrationRun`/`MigrationIssue` infrastructure.

## 15. Runtime verification scenarios

`scripts/migrations/verify-004-e.ts` proves the high-risk package semantics on target-native state:

1. native share-policy changes retain actor/time provenance;
2. bulk Publication creates exact Publication identities for two eligible current ArtifactVersions;
3. exact current public tokens resolve;
4. replacement ArtifactVersion makes the old token immediately unauthorized;
5. replacement creates durable `SYNC-008` cleanup in the source transaction;
6. cleanup appends `UNPUBLISHED` rather than deleting/repointing Publication;
7. a replacement cannot inherit readiness or Publication;
8. after a new READY Assessment and explicit publish, only the new token resolves;
9. share revocation removes public eligibility immediately and converges to `UNPUBLISHED`;
10. Schedule generation produces a proposal without changing authoritative placements;
11. an intervening manual placement makes the old proposal stale;
12. stale apply is rejected without partial mutation;
13. a fresh proposal applies atomically;
14. Dispatch round 1 creates exact rendered message evidence and linked successful attempts;
15. same-round repeat creates no duplicate SendRecords;
16. round 2 deliberately permits repeat contact;
17. an injected `UNCERTAIN` round blocks resend and does not fabricate performance evidence;
18. participation exit creates Publication cleanup while preserving 004-C Schedule cleanup;
19. post-Archive exact Publication/Republish remains permitted;
20. post-Archive ordinary operational Dispatch is blocked;
21. post-Archive `CALL_FOR_FEEDBACK` remains permitted.

## 16. CI exit evidence

GitHub Actions run **33933444823**, head `3a7c20f6b016ec1262336a58e878e854d3d9f059`, completed successfully.

The implementation head passed:

1. dependency installation;
2. OKF validation;
3. migration-foundation verification;
4. Prisma schema validation;
5. complete six-migration fresh deployment;
6. baseline migration reporting;
7. both 004-B semantic verifiers;
8. 004-C participation/Deliverable verification;
9. 004-D lifecycle/authority/disclosure verification;
10. 004-E Publication/Schedule/Dispatch verification;
11. pre-existing database baseline adoption;
12. the full 004-B through 004-E semantic backfill sequence;
13. lint;
14. optimized production build.

An earlier run reached every semantic and migration gate successfully but found one TypeScript inference issue in the new Schedule apply adapter. The repair explicitly typed the parsed assignment collection and changed no persistence or domain semantics. The subsequent full run above passed.

## 17. Gap-state effect

004-E materially implements its assigned runtime work:

- **SG-008 — Publication identity/history:** exact ArtifactVersion Publication identities and append-only current exposure history are authoritative after cutover;
- **SG-009 — historical public artifact access:** known old `publicId`s no longer authorize from parent current state after cutover;
- **SG-014 — Schedule generation:** generation is non-mutating and accepted apply uses expected-base atomicity;
- **SG-015 — Dispatch message evidence:** native sends preserve exact rendered endpoint/message/hash evidence before provider handoff;
- **SG-016 — Dispatch resend semantics:** same-round send is idempotent and intentional repeat requires another round;
- **SG-P04 — Publication share/rights:** target-native share-policy changes retain provenance without misrepresenting the legacy boolean as consent.

These items are **not globally `verified-closed` by 004-E alone**. 004-F still owns semantic read/UI/API cutover and first-party compatibility retirement. 004-G/004-H own cross-slice migration validation, rollback rehearsal, consumer inventory, destructive-cleanup eligibility and final closure accounting.

## 18. Exit decision

004-E passes because:

- public authorization is exact-material and remains hardened after cutover rollback;
- Publication state is independent, historical and non-repointing;
- eligibility loss denies exposure immediately and converges durably;
- post-Archive Publication behavior follows explicit policy without reopening the event;
- Schedule generation cannot mutate authoritative state before planner acceptance;
- stale Schedule proposals fail without partial replacement;
- native Dispatch captures exact prepared/performed evidence with round-safe idempotency;
- uncertain provider outcomes do not trigger blind resend;
- migration preserves current behavior where supportable without inventing historical publication/share/message facts;
- fresh and pre-existing database paths plus production build are green.

Next package:

> **004-F — Semantic Read Models, API/UI Cutover & Compatibility Retirement**
