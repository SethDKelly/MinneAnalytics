# 002-G — Implementation Reconciliation Register

Status: **Handoff register**  
Authority: implementation-reconciliation evidence; does not override canonical concept/synchronization knowledge.

## Purpose

Record the highest-value semantic mismatches and ambiguity areas between the accepted v0 Concept Design model and the current implementation so Phase 003 can investigate them deliberately rather than refactor by directory analogy.

Priority reflects semantic risk, not coding effort.

| ID | Priority | Area | Current implementation signal | Accepted model / reconciliation question |
|---|---|---|---|---|
| IR-001 | High | Submission aggregate | `Submission` owns mutable content, program/deck/withdrawal/classification flags | Map fields/behavior to Proposal, Revision, Selection, Withdrawal, Deliverable, Classification without assuming one table per concept |
| IR-002 | High | Program status | `ProgramStatus` combines pending/approved/declined/backup/withdrawn | Preserve Selection and Withdrawal histories independently; derive effective participation |
| IR-003 | High | Revision-aware evaluation | score row stores abstract version/current workflow uses status fields | Bind current Evaluation to exact Revision; derive aggregate/currentness instead of mutating stale/current state |
| IR-004 | High | Classification versioning | current join is submission-level while revision snapshots include theme IDs | Implement the accepted v0 mapping: Classification SubjectRef = exact Revision, including copy-forward/new-set behavior on revision |
| IR-005 | High | Capacity | current behavior is primarily configuration/count snapshots | Determine whether/where to introduce durable Pool/Allocation/Release state and coordinated Selection transaction semantics |
| IR-006 | High | Withdrawal cleanup | current single status can erase/reverse withdrawal semantics | Withdrawal must remain authoritative; capacity/schedule/publication cleanup must converge without rewriting it |
| IR-007 | High | Deliverable readiness | `deckStatus` is stored on Submission separately from versioned DeckFile | Bind readiness assessment to exact ArtifactVersion and preserve assessment history |
| IR-008 | Medium-High | Schedule generation | generation route clears and directly rewrites placements | Preserve planner authority: generation should produce explicit/applyable placement changes rather than silently own Schedule |
| IR-009 | High | Public material identity | public listing follows latest file/current flags | Publication must identify exact MaterialRef; decide explicit item publications vs immutable collection snapshot vs intentionally dynamic policy |
| IR-010 | High | Historical public file access | known older `publicId` may remain accessible while current submission is eligible | Decide whether historical artifact access is intentional; authorize only explicitly published material if not |
| IR-011 | Medium-High | Dispatch message evidence | send records store template key/round/recipient but not exact rendered message | Preserve immutable MessageRef/snapshot for performed sends without unnecessary content duplication |
| IR-012 | Medium | Dispatch same-round resend | `includeAlreadyEmailed` can conflict with unique same-round recipient constraints | Same-round attempts should be idempotent; intentional repeat contact uses a new RoundRef |
| IR-013 | High | Archive reversibility | `ConferenceStatus` can move away from ARCHIVED and clear `archivedAt` | Determine whether reopen is a true requirement; never erase historical Archive closure if reopen is supported |
| IR-014 | Medium | Archive/public terminology | public deck feature is called `publish-archive` | Rename/reframe implementation/UI terminology so Archive means internal closure and Publication means public exposure |
| IR-015 | Medium | Availability | booleans and timestamps coexist in conference state | Map to Availability Window plus explicit application exceptions without duplicating `open` state inconsistently |
| IR-016 | Medium | Disclosure/workflow flags | blind-review/global/status mechanics mix visibility and review workflow | Preserve participant/context/information Controlled Disclosure relations and derive visibility from them/policy |
| IR-017 | Medium | Feedback workflow | feedback persistence is separate but route also mutates review status and sends notification | Keep Feedback semantic record independent; model edit opportunity and notification as composition/Dispatch |
| IR-018 | Medium | Coverage | theme rows mix target bounds with observed counts in helper/view behavior | Keep Coverage Target authoritative only for desired bounds; derive observed/prospective composition from current Revision Classification + effective participation |
| IR-019 | Medium | Authority | BOARD/CHAIR/ADMIN helpers gate many operations | Keep as application authority policy unless user-managed delegation lifecycle emerges; do not create Authorization concept merely to mirror helpers |
| IR-020 | Deferred | Registration | VIP flag and attendee registration behaviors are not one accepted concept | Keep deferred signal; do not fold into unrelated concepts during refactor |
| IR-021 | Deferred | Global audit | concept-local histories exist; no accepted cross-concept Audit Trail | Preserve intrinsic histories first; rediscover global audit only from a user-facing purpose |
| IR-022 | Deferred | Export/reporting | current export endpoints project source state | Keep projection capability unless saved/versioned/scheduled report definitions become a real lifecycle |

## Reconciliation constraints

Phase 003 must not assume that each Concept Design concept requires:

- its own database table;
- its own service;
- its own route namespace;
- a one-to-one migration from current fields;
- immediate elimination of every aggregate persistence structure.

A current aggregate may remain physically useful if semantic ownership, history, invariants, and synchronization behavior are preserved.

## Investigation order

Recommended order for Phase 003:

1. map current fields/routes/helpers to concept ownership and derived projections;
2. identify semantic loss or accidental coupling;
3. choose target persistence/reference identities;
4. define transactional/convergent synchronization implementation boundaries;
5. plan migration/backfill/compatibility;
6. only then authorize code changes.

## Exit condition

This register is complete enough to hand Phase 002 into implementation reconciliation. Items may be refined, split, or closed as Phase 003 obtains stronger implementation evidence.
