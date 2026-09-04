# 003-A — Semantic Gap Register

Status: **Supporting reconciliation evidence**  
Canonical disposition: [003-A Semantic Gap Baseline](../knowledge/reconciliation/semantic-gap-baseline.md)

## Purpose

Refine the 002-G handoff into evidence-backed semantic gaps with stable IDs, impact, likely recoverability, and later Phase 003 owner. This register records current observations; the canonical gap baseline owns current priority/disposition.

## Severity vocabulary

- **High** — current mutation/persistence can erase independent truth, violate a hard invariant, or expose materially unintended state.
- **Medium-high** — substantial semantic mismatch with migration/compatibility implications but lower immediate truth-loss risk.
- **Medium** — boundary/policy mismatch that should be reconciled before implementation authorization.

Recoverability:

- **Backfillable** — current persisted data appears sufficient for deterministic reconstruction.
- **Partially backfillable** — some current state can be mapped, but historical detail has already been lost or was never captured.
- **Forward-only** — reliable history should begin after migration; old details must not be fabricated.
- **Policy decision** — not primarily a data backfill problem.

## Detailed gaps

### SG-001 — Revision-specific Evaluation history is overwritten

**Severity:** High  
**Refines:** 002-G IR-003  
**Owner:** 003-B, then 003-F

Evidence:

- `Score` is unique by `(submissionId, reviewerAccessId)`.
- score POST uses upsert and updates the same row's value/notes/`scoredAbstractVersion` when the reviewer scores again.
- currentness helpers compare the mutable version number to `Submission.abstractVersion`.

Impact:

A judgment originally made about Revision N can disappear when the same evaluator records a judgment for Revision N+1. This contradicts the canonical Evaluation requirement that the old judgment remains a valid historical Evaluation of the exact old Revision.

Recoverability: **Partially backfillable.** The current Score can be mapped to the Revision indicated by `scoredAbstractVersion`, but overwritten prior values are not recoverable from current state unless external/history evidence exists.

### SG-002 — Selection Decision history is absent

**Severity:** High  
**Refines:** IR-002  
**Owner:** 003-B/003-F

Evidence:

- `Submission.programStatus` stores one mutable organizer/participation state.
- program-status route overwrites it and updates/clears `approvedAt`.
- no immutable organizer Decision rows exist.

Impact:

Reserve→selected, selected→declined/cleared, and similar histories are not durably representable as the canonical Selection chain.

Recoverability: **Forward-only / partially backfillable.** Current disposition can seed the latest Decision; prior decision history must not be invented.

### SG-003 — Withdrawal is not independent from Selection

**Severity:** High  
**Refines:** IR-002, IR-006  
**Owner:** 003-B/003-C/003-F

Evidence:

- presenter withdrawal writes `programStatus=WITHDRAWN` + `withdrawnAt`.
- organizer program-status updates set `withdrawnAt=null` while overwriting `programStatus`.

Impact:

A source-authoritative originator Withdrawal can be erased by later organizer activity, violating independent histories and the 002-G failure-semantics contract.

Recoverability: **Partially backfillable.** Existing currently-withdrawn rows can seed Withdrawal; historical withdrawals already cleared may not be reconstructible.

### SG-004 — Capacity is projection/configuration rather than authoritative allocation

**Severity:** High  
**Refines:** IR-005  
**Owner:** 003-B/003-C

Evidence:

- Conference stores room/session/trim/sponsor configuration.
- `computeCapacity` derives slot/target/count snapshots.
- Selection approval does not create durable Pool/Allocation state or fail on a Capacity allocation invariant.

Impact:

The accepted hard scarcity invariant cannot currently be enforced or audited independently of counts and schedule/config assumptions.

Recoverability: **Backfillable for current allocations subject to target design**, but historical allocate/release events are forward-only unless other evidence exists.

### SG-005 — Controlled Disclosure history is not durable

**Severity:** High  
**Refines:** IR-016  
**Owner:** 003-B/003-D/003-F

Evidence:

- conference-level `blindReviewEnabled` controls policy.
- `review-blind.ts` masks identity and aggregate values dynamically.
- identity reveal endpoint logs reveal to console only.
- aggregate visibility is recomputed from whether the viewer has a current score.

Impact:

The application cannot durably answer whether a specific participant/context/information tuple was staged or revealed. A reveal can also appear to become concealed again when current-score conditions change unless the information item is reinterpreted as a new revision-specific item.

Recoverability: **Forward-only** for historical reveals absent durable logs. Existing policy state can seed future staging behavior.

### SG-006 — Classification authority is not exact Revision↔Term state

**Severity:** High  
**Refines:** IR-004  
**Owner:** 003-B/003-F

Evidence:

- `SubmissionTheme` stores current submission-level associations.
- edits delete/recreate these joins.
- `SubmissionRevision.themeIds` stores historical term IDs as JSON snapshots.

Impact:

Canonical v0 Classification uses exact Revision identity. Current relational queries see only current proposal-level associations, while history is embedded and not directly constrained as Revision↔Term relations.

Recoverability: **Backfillable** for revisions whose `themeIds` snapshots are complete; v1 backfill logic already captures current themes into initial revisions.

### SG-007 — Deliverable readiness is detached from ArtifactVersion

**Severity:** High  
**Refines:** IR-007  
**Owner:** 003-B/003-F

Evidence:

- `DeckFile` is versioned.
- `Submission.deckStatus` is one mutable readiness/status value.
- new upload resets `deckStatus` to `SUBMITTED`; review route updates the same submission-level value.

Impact:

Current readiness can be associated operationally with the latest file but historical concern/ready determinations are not attached to exact artifact versions and are overwritten.

Recoverability: **Partially backfillable.** Current status can seed an Assessment for the current DeckFile when interpretation is safe; prior assessment history is generally forward-only.

### SG-008 — Publication lacks exact MaterialRef identity/history

**Severity:** High  
**Refines:** IR-009  
**Owner:** 003-B/003-D/003-F

Evidence:

- conference-level `decksPublished` gate.
- public listing dynamically selects latest deck of currently approved/shareable/ready submissions.
- no Publication row or exposure-state history exists.

Impact:

Replacing source material or changing current eligibility can change what the public collection means without an explicit Publication identity/state transition.

Recoverability: **Partially backfillable.** Currently exposed latest eligible files can seed initial Publication state; historical exposure intervals/materials are not fully known.

### SG-009 — Historical public file access is ambiguous

**Severity:** High  
**Refines:** IR-010  
**Owner:** 003-B/003-D

Evidence:

- listing chooses latest DeckFile.
- direct public resolver accepts a `publicId` and authorizes it using the parent submission/conference's current eligibility without checking that this DeckFile is the exact current/published material.

Impact:

A known old public ID may expose an older artifact even though the public listing presents only the latest file.

Recoverability: **Policy decision + forward target.** Later design must state whether historical artifact access is intentional.

### SG-010 — Archive closure provenance is erasable

**Severity:** High  
**Refines:** IR-013  
**Owner:** 003-B/003-D/003-F

Evidence:

- `ConferenceStatus` includes DRAFT/ACTIVE/ARCHIVED.
- admin route sets `archivedAt` when archived and clears it when another status is chosen.

Impact:

Canonical Archive is monotonic retained closure; current reopen-style mutation can erase evidence that closure occurred.

Recoverability: **Partially backfillable.** Current archived contexts are known; previously reopened closure events may be irrecoverable.

### SG-011 — Vocabulary state history is overwritten/deleted

**Severity:** High  
**Refines:** implicit IR-018 taxonomy side  
**Owner:** 003-B/003-F

Evidence:

- Theme name and `removedAt` are mutable fields.
- restoration clears `removedAt` on the same row, which preserves identity but not prior state events.
- admin DELETE hard-deletes an unused term.

Impact:

Canonical Vocabulary retains stable Term identity and append-only wording/availability history. Current rename/retire/restore events cannot all be reconstructed.

Recoverability: **Partially backfillable / forward-only history.** Existing Theme IDs are good candidate TermRefs.

### SG-012 — Current Revision projection duplicates canonical history state

**Severity:** Medium-high  
**Refines:** IR-001/IR-003  
**Owner:** 003-B

Evidence:

- current title/abstract/bio/technicalLevel and integer `abstractVersion` are stored on Submission.
- immutable snapshots also live in `SubmissionRevision`.

Impact:

Two persistence representations can drift unless one is explicitly authoritative and the other is a controlled projection/denormalization.

Recoverability: **Backfillable.** Current revision rows and current submission fields can be compared/migrated.

### SG-013 — Availability Window authority is split

**Severity:** Medium-high  
**Refines:** IR-015  
**Owner:** 003-B/003-D

Evidence:

- timestamp interval plus `submissionsOpen` boolean plus Conference status all determine availability.
- helper treats closing as `now > closeAt`, while canonical interval is half-open `[opensAt, closesAt)`.
- presenter edit path does not use the submission-window helper and instead relies on status/review rules + active conference.

Impact:

There is no single authoritative interpretation of interval versus override/exception policy, and exact boundary/edit behavior is ambiguous.

Recoverability: **Policy decision.** Existing timestamps/config can map to target state.

### SG-014 — Schedule generator directly owns authoritative replacement

**Severity:** Medium-high  
**Refines:** IR-008  
**Owner:** 003-C/003-E

Evidence:

- generation route clears current session placements then writes algorithm output immediately.
- manual placement route supports planner move/swap/unplace.

Impact:

Current generated output bypasses the canonical explicit acceptance distinction and can replace planner-controlled state wholesale.

Recoverability: **No data migration required**; architecture/UX command-boundary change.

### SG-015 — Dispatch cannot reconstruct exact sent message

**Severity:** Medium-high  
**Refines:** IR-011  
**Owner:** 003-B/003-F

Evidence:

- EmailSendRecord stores key/round/recipient/endpoint/time.
- rendered subject/body come from mutable EmailTemplate plus context and are not persisted as immutable message evidence.

Impact:

Later template changes weaken the ability to prove what exact message a recipient received.

Recoverability: **Forward-only** for exact historical content unless logs/provider evidence exist.

### SG-016 — Dispatch same-round resend semantics conflict

**Severity:** Medium-high  
**Refines:** IR-012  
**Owner:** 003-C/003-E

Evidence:

- send API accepts `includeAlreadyEmailed`.
- persistence enforces same conference/key/round/submission-or-attendee uniqueness.

Impact:

The API suggests repeat delivery can be requested while persistence encodes idempotence.

Recoverability: **No backfill; command/API semantics decision.** Canonical contract chooses idempotent same-round behavior and new RoundRef for intentional repeat contact.

### SG-017 — Feedback is coupled to workflow and notification

**Severity:** Medium-high  
**Refines:** IR-017  
**Owner:** 003-C/003-D/003-E

Evidence:

- Feedback row is created transactionally with possible `abstractReviewStatus=FEEDBACK_PENDING` mutation.
- route directly invokes presenter-feedback email stub after commit.

Impact:

Feedback semantic record, edit opportunity/work projection, and Dispatch notification are not independently coordinated.

Recoverability: **No historical migration required for separation**, though current statuses need compatibility interpretation.

### SG-018 — Coverage Target and warning policy are mixed with Vocabulary row

**Severity:** Medium-high  
**Refines:** IR-018  
**Owner:** 003-B/003-D/003-E

Evidence:

- `Theme.targetMin/targetMax` co-locate desired bounds with term state.
- `targetMax === 0` causes helper to use an unrelated default saturation threshold rather than clearly representing a zero upper bound versus no target.
- observed counts are computed from current program statuses and SubmissionTheme joins.

Impact:

Physical co-location is acceptable, but target identity/absence semantics and projection inputs must be explicit under the canonical Coverage Target model.

Recoverability: **Backfillable/policy decision**, subject to defining how current zero values should be interpreted.

## Policy gaps

### SG-P01 — Edit eligibility composition

Current presenter edit eligibility is encoded in `canPresenterEditSubmission` using ProgramStatus/AbstractReviewStatus and separately requires an ACTIVE conference. Initial submission uses the submission-window helper, but edits do not. 003-D must determine the intended Availability Window + Feedback exception + Selection/Withdrawal + Archive policy rather than mechanically reusing current statuses.

### SG-P02 — Role/capability authority

`lib/roles.ts` centralizes capability helpers reasonably well, but routes still contain some role-specific wording and duplicate checks. 003-D should map these to policy capabilities while retaining the decision not to create Authorization as a concept.

### SG-P03 — Post-Archive operations

`assertConferenceAcceptsMutations` rejects all ordinary mutation outside ACTIVE. Canonical Archive allows application policy to define deliberate post-closure operations such as Publication/reporting/possibly Dispatch. 003-D must enumerate those exceptions.

### SG-P04 — Share/rights provenance

`deckShareable` affects public exposure but is one mutable Submission boolean. 003-D must decide who controls it, what changes mean, and whether provenance/history is required for publication safety.

## Newly sharpened findings versus 002-G

003-A materially strengthens the earlier handoff in four places:

1. IR-003 is now explicit that current score upsert can **destroy prior Revision-specific Evaluation values**, not merely mislabel freshness.
2. IR-016 is now explicit that Controlled Disclosure has **no durable participant/context/information reveal record**.
3. Vocabulary history is elevated as its own semantic-loss gap rather than being hidden inside general taxonomy reconciliation.
4. Availability reconciliation now records the exact interval-boundary and edit-window asymmetry rather than treating the issue as only “boolean plus timestamps.”

These findings justify target design work in 003-B–003-D but still do not authorize runtime changes in 003-A.
