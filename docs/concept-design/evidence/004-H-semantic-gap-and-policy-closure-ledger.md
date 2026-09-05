# 004-H — Semantic Gap & Policy Closure Ledger

Status: **Final Phase 004 closure evidence**  
Branch: **`concept-design/v0-implementation`**  
Runtime verification head: **`2c31aa883d284e8e5fa1fff030ef826376a59b22`**  
Runtime verification run: **GitHub Actions 33941160189**

## 1. Purpose

This ledger supplies the final per-gap disposition required by the canonical [Implementation Closure & Evidence Baseline](../knowledge/reconciliation/implementation-closure-evidence-baseline.md).

Each `SG-001`–`SG-018` and `SG-P01`–`SG-P04` must end Phase 004 as:

- `verified-closed`;
- `explicitly-deferred`; or
- `blocked`.

The supported closure scope is the repository-defined v0 runtime exercised through fresh and recognized-legacy SQLite migration paths, target-native command/read behavior, compatibility repair/read rollback, and the production container build. It does **not** claim that the current AWS EFS database has already been migrated.

## 2. Result

| Class | Count |
|---|---:|
| `verified-closed` | 22 |
| `explicitly-deferred` | 0 |
| `blocked` | 0 |

Historical `legacy-unknown` evidence remains only where the accepted migration baseline explicitly permits it. No supported interface treats those unknowns as known history.

## 3. Semantic-gap closure ledger

| ID | Final state | Runtime closure basis | Retained compatibility / historical condition |
|---|---|---|---|
| **SG-001 — Evaluation history** | **verified-closed** | 004-B established exact Revision-bound Evaluation identity/history and evaluator+Revision uniqueness; 004-F derives applicability from exact current Revision; CI proves R2 evaluation does not overwrite R1. | Overwritten pre-cutover evaluation history remains `legacy-unknown`; no false exact attribution is fabricated. |
| **SG-002 — Selection history** | **verified-closed** | 004-C established append-preserving Selection Decision history and current-head semantics; generic status endpoints are canonical adapters; 004-F reads Selection semantically. | `programStatus` remains a compatibility projection from Selection + Withdrawal. |
| **SG-003 — Withdrawal independence** | **verified-closed** | 004-C established monotonic independent Withdrawal, source-authoritative commit, and convergent cleanup; later Selection cannot erase Withdrawal; 004-G locks legacy writer rollback out. | `withdrawnAt`/`programStatus` remain subordinate projections where retained. |
| **SG-004 — Capacity authority** | **verified-closed** | 004-C established finite Pool/Allocation/Release persistence, hard allocation precondition, concurrent-entry protection, and idempotent release; 004-F uses semantic participation/capacity reads. | Dashboard counts are derived and no longer Capacity authority. |
| **SG-005 — Controlled Disclosure history** | **verified-closed** | 004-D established durable participant/context/information staging, monotonic Reveal, independent presenter-identity vs exact-Revision aggregate information, and blind-mode locking; 004-F exposes explicit protected-information state. | Pre-cutover exposure may remain a legacy-unknown cohort rather than fabricated concealed/revealed history. |
| **SG-006 — Revision Classification** | **verified-closed** | 004-B established exact Revision↔Term relations and immutable historical sets; 004-F reads the current exact Revision classification; 004-G repairs current `SubmissionTheme` from canonical Classification. | `SubmissionTheme` remains a current-Revision compatibility mirror. |
| **SG-007 — Deliverable readiness** | **verified-closed** | 004-C established exact ArtifactVersion Assessment history and replacement-version reset semantics; 004-F reads current ArtifactVersion+Assessment; 004-G repairs `deckStatus` only as projection. | Legacy `REVIEWED` may remain historical enum residue but target-native writes do not use it as readiness authority. |
| **SG-008 — Publication identity/history** | **verified-closed** | 004-E established exact MaterialRef Publication identity and PublicationState history; publication eligibility cleanup is durable/convergent; 004-F lists exact published material. | Conference/public-surface flags remain compatibility/policy inputs, not Publication identity. |
| **SG-009 — Historical public artifact access** | **verified-closed** | 004-E exact-token resolver requires the exact material to have an eligible published Publication; superseded `publicId` cannot inherit current parent authorization; 004-G proves this is an irreversible security rollback floor. | Old tokens may remain addresses but confer no authorization without exact Publication state. |
| **SG-010 — Archive provenance** | **verified-closed** | 004-D established independent monotonic Archive closure with provenance and action-specific post-Archive policy; ordinary mutation cannot erase closure. | Erased historical reopen activity before cutover remains unknown; compatibility Conference status is not closure authority. |
| **SG-011 — Vocabulary history** | **verified-closed** | 004-B established stable Term identity and append-only TermState history; 004-H completed first-party selectable/admin reads through current TermState and keeps retirement referentially safe. | `Theme.name`/`removedAt` remain current compatibility projections for rollback/external compatibility. |
| **SG-012 — Proposal/Revision projection** | **verified-closed** | 004-B made `SubmissionRevision.id` and current Revision pointer authoritative; 004-F reads exact current Revision semantics under deliberate mutable-row drift; 004-G canonical→compatibility repair is one-way. | Mutable current Submission content and `abstractVersion` remain denormalized rollback projections. |
| **SG-013 — Availability Window** | **verified-closed** | 004-D established bounded half-open Window authority, suspension-only legacy boolean policy, lifecycle gating, and explicit edit exceptions; 004-F consumes reasoned semantic eligibility. | Legacy timestamps/boolean can remain compatibility inputs/projections only where mapped by policy. |
| **SG-014 — Schedule generation** | **verified-closed** | 004-E changed generation to non-mutating proposal plus expected-base atomic apply; stale-base conflicts are verified; 004-F Schedule UI/API consumes proposal/apply semantics. | Existing placement storage remains the Schedule realization; generator is not authority. |
| **SG-015 — Dispatch message evidence** | **verified-closed** | 004-E captures exact rendered recipient message, content hash, provider-attempt identity/state, and performed SendRecord only after known handoff; CI verifies the evidence chain. | Historical messages whose rendered content was never retained remain `legacy-unknown`. |
| **SG-016 — Dispatch resend semantics** | **verified-closed** | 004-E enforces stable recipient + purpose/key + round uniqueness, retry idempotency, new round for intentional repeat, and blocked/uncertain provider outcome handling. | Legacy `includeAlreadyEmailed` semantics are not canonical resend authority. |
| **SG-017 — Feedback coupling** | **verified-closed** | 004-B preserved exact Revision reference; 004-D separated revision-edit exceptions from Feedback; 004-H made Feedback creation record-only: it no longer mutates `abstractReviewStatus` and no longer directly sends email. The 004-H verifier proves workflow projection unchanged and no send evidence created. | `abstractReviewStatus` remains compatibility residue, not Feedback/edit authority. Automatic presenter notification is intentionally absent from the v0 Feedback command; any future notification must be an independent Dispatch purpose rather than a hidden Feedback side effect. |
| **SG-018 — Coverage/Vocabulary co-location** | **verified-closed** | 004-H made `CoverageTarget` the runtime owner for explicit theme coverage bounds, separated Coverage capability from Vocabulary capability, uses semantic effective participation for observation, and explicitly distinguishes no-target advisory policy from target bounds. Organizer reads and Selection warnings survive deliberate `Theme.target*` drift. | `Theme.targetMin/targetMax` remain compatibility/read-rollback projections. Legacy `0/0` means no explicit target; coherent nonzero legacy bounds are current-state seeded; incoherent bounds block migration. |

## 4. Policy-gap closure ledger

| ID | Final state | Runtime closure basis | Retained condition |
|---|---|---|---|
| **SG-P01 — Edit eligibility** | **verified-closed** | 004-D/004-F compose presenter ownership, Availability Window, lifecycle/Archive, decision lock, and exact scoped Revision exception on the server. Feedback itself no longer grants edit authority. | Legacy review/status fields may remain projections but are not the edit command authority. |
| **SG-P02 — Capability authority** | **verified-closed** | 004-D introduced action-oriented capabilities for consequential commands; later packages use those boundaries for Selection, lifecycle/disclosure, Schedule, Publication, Dispatch, Vocabulary, Coverage and related actions. 004-H explicitly separates `MANAGE_VOCABULARY` from `MANAGE_COVERAGE_TARGETS`. | `ADMIN`/`BOARD`/`CHAIR` remain assignment labels; they are not Concept state. |
| **SG-P03 — Archive/post-event operations** | **verified-closed** | 004-D defines action-specific closure policy; 004-E verifies post-Archive-safe Publication/Dispatch behavior while ordinary mutation remains denied; 004-G preserves recovery operations without reopening the Conference. | Historical reads/exports and recovery convergence remain intentionally available after closure. |
| **SG-P04 — Sharing/publication policy** | **verified-closed** | 004-D/004-E preserve share-eligibility provenance, require affirmative eligibility without auto-publish, bind exposure to exact Publication, and trigger exact-material cleanup on eligibility loss; 004-G locks exact Publication authorization as a rollback floor. | `deckShareable` remains a compatibility projection/policy observation and is not inferred legal consent. |

## 5. Why accepted historical unknowns do not block closure

The accepted migration model explicitly prohibits inventing history that the pre-retrofit application never retained. Therefore closure does not require fabrication of:

- overwritten prior Evaluation judgments;
- pre-cutover Controlled Disclosure exposure history;
- erased historical Archive/reopen provenance;
- old Vocabulary wording/availability transitions;
- exact rendered content for historical Dispatches;
- Publication history for superseded artifacts merely because an old public token exists.

Those records remain unknown or current-state seeded with provenance as designed. Closure is valid because target-native truth is now captured prospectively and supported interfaces do not claim historical certainty that does not exist.

## 6. Compatibility is not an open semantic gap

004-G intentionally retained low-cost compatibility surfaces after disabling their independent authority.

Examples include:

- `programStatus`;
- mutable current Submission content;
- `abstractVersion`;
- `SubmissionTheme`;
- `deckStatus`;
- `deckShareable`;
- `Theme.name` / `removedAt` / target-bound projections;
- compatibility-shaped API URLs.

Their presence does not make the associated gaps open because:

1. canonical writes remain permanently authoritative;
2. semantic reads are the normal first-party path;
3. compatibility values can be repaired canonical→compatibility;
4. read rollback cannot restore legacy write authority;
5. exact public/protected-information security floors remain active.

## 7. Final closure classification

There are **no semantic or policy items explicitly deferred from Phase 004**.

There are **no blocked semantic or policy items**.

All 22 items are `verified-closed` in the declared supported v0 runtime scope.

Production/live-environment qualification is deliberately tracked outside this SG/SG-P ledger because absence of a live AWS deployment is not evidence that the accepted semantic implementation is incomplete.