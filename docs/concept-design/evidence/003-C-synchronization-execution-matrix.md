# 003-C — Synchronization Execution Matrix

Historical/audit evidence for [003-C](../003-C-synchronization-transaction-idempotency-and-recovery-architecture.md). Canonical execution rules live in [`knowledge/reconciliation/synchronization-transaction-recovery-target.md`](../knowledge/reconciliation/synchronization-transaction-recovery-target.md).

| Rule / operation | Source authority | Execution class | Atomic set / follow-up | Failure result | Idempotency basis |
|---|---|---|---|---|---|
| Offer + initial Revision + Classification | accepted Offer command | TX-A | Proposal + first Revision + complete Revision↔Term set + current projections | whole command fails | command key + Proposal/current-head uniqueness |
| Revise + Classification | Revision | TX-A | successor Revision + complete Classification set + current pointer/projections | whole command fails; prior head remains | command key + expected current Revision |
| Evaluation + aggregate reveal | Evaluation | TX-A while local | Evaluation + conditional Disclosure reveal | whole local bundle fails; no partial reveal | evaluator+Revision uniqueness; reveal `still concealed` condition |
| Selection enters effective participation | Selection | TX-A | Decision + Capacity Allocation + first required Deliverable + compatibility status | no selected success if Capacity fails | command key + expected Decision head + Allocation uniqueness |
| Selection exits effective participation | Selection | TX-B | Decision + compatibility projection + durable cleanup work | decision remains; cleanup retries | command key + work key per effect |
| Withdrawal | Withdrawal | TX-B | Withdrawal + compatibility projection + release/unplace/unpublish work | Withdrawal remains immediately true | one Withdrawal per participation + work keys |
| Capacity release | Capacity target effect | TX-B effect | release active Allocation | already released/no allocation is success/no-op | Allocation release conditionality |
| Schedule unplace | Schedule target effect | TX-B effect | clear current placement if present | already unplaced is success/no-op | Proposal/Schedule semantic target |
| Publication unpublish on eligibility loss | Publication target effect | TX-B effect | append `unpublished` only if currently published | already unpublished is success/no-op | Publication head + source/effect work key |
| Feedback + notification | Feedback | TX-C | Feedback commit first; notification Dispatch independent | Feedback remains even if send fails | Feedback command identity + Dispatch dedupe |
| Approval + notification | Selection | TX-C | Selection bundle first; notification Dispatch independent | Selection remains | Dispatch semantic round key |
| Schedule generator | Schedule planner acceptance | TX-A at apply only | generated proposal is read-only; accepted complete delta applied transactionally | no partial clear/repopulate | command key + expected schedule/base version |
| Dispatch provider handoff | Dispatch intent | TX-D | durable exact message/recipient attempt then provider; SendRecord only on known handoff | failure/unknown reconciled separately | recipient+context+key+round + provider key when supported |
| Deliverable upload | Deliverable Provide | TX-D | durable bytes then ArtifactVersion metadata transaction; orphan cleanup on DB failure | no ArtifactVersion points to missing bytes | upload command/content identity + immutable storage location |
| canonical→legacy compatibility write | canonical owner | same transaction when local | update canonical state plus projection | transaction fails rather than divergent local state | canonical event/command key |

## Current-code reconciliation observations

### Program status

`app/api/chair/program-status/route.ts` updates `Submission.programStatus` first, then performs demo-score population and approval email separately. The target separates the canonical Selection/Capacity/Deliverable transaction from optional notification and demo-only side effects.

### Withdrawal

`app/api/presenter/withdraw/route.ts` is already request-idempotent at the legacy status level, but it has no independent Withdrawal record and no durable cleanup obligations. Target semantics preserve that idempotent user experience while making the source fact immutable and cleanup convergent.

### Schedule generation

`app/api/schedule/generate/route.ts` clears all session placements before assigning generated results one row at a time. A failure can therefore leave partial authoritative state. Target generation is non-mutating until accepted, then applies the complete accepted delta transactionally.

### Dispatch

`lib/email-send.ts` creates Batch/SendRecord rows before invoking the email stub. For a real provider this can record a performed send before handoff succeeds, and a timeout can make replay ambiguous. Target behavior introduces durable prepared attempt/evidence separate from canonical performed SendRecord.

### File upload

`app/api/presenter/deck/route.ts` saves bytes before creating `DeckFile` metadata, then updates `deckStatus` separately. The target retains storage-first safety for bytes but requires orphan cleanup/idempotency and a transaction for ArtifactVersion plus compatibility projection.