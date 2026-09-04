# 003-C — Failure, Idempotency & Recovery Matrix

Historical/audit evidence for [003-C](../003-C-synchronization-transaction-idempotency-and-recovery-architecture.md). Canonical retry/recovery rules live in [`knowledge/reconciliation/idempotency-recovery-baseline.md`](../knowledge/reconciliation/idempotency-recovery-baseline.md).

| Failure point | Truth that may already exist | Safe recovery | Unsafe recovery |
|---|---|---|---|
| request fails before TX-A commit | none from command | retry same command key | creating a second command identity without checking |
| TX-A commits but response is lost | complete authoritative bundle | return/reuse committed result via command key/current state | appending another Revision/Decision/etc. |
| Withdrawal source commits before cleanup | Withdrawal + work items | immediately project not participating; retry release/unplace/unpublish | deleting Withdrawal or restoring old program status |
| Selection-exit commits before cleanup | new Decision + work items | derive latest Selection; retry cleanup | reverting Decision because target cleanup failed |
| Capacity release crashes after release but before work completion | Allocation already released | detect released state; mark work complete | recording a second release event/provenance |
| Schedule unplace crashes after update | activity already unplaced | observe no placement; complete work | moving another activity or replaying stale full schedule |
| Publication unpublish response lost | unpublished state may already exist | expected-head/state read; adopt existing state | append duplicate publication state blindly |
| Evaluation save retries | Evaluation may exist for exact Revision | unique evaluator+Revision / command key returns same Evaluation | overwrite an older-Revision Evaluation |
| Controlled Disclosure reveal retries | first reveal may exist | preserve original reveal actor/time; no-op success | rewrite reveal provenance |
| generated schedule computed against stale base | no authoritative mutation yet | reject/recompute before apply | clear current placements and force generated result |
| accepted schedule apply crashes after commit | full placement delta committed | same command key returns committed apply result | apply delta again without expected-base protection |
| external provider known failure before handoff | no canonical performed send | retry same semantic attempt | create new round merely to bypass dedupe |
| external provider timeout / unknown result | delivery may or may not have occurred | provider reconciliation/idempotency or blocked manual resolution | blind automatic resend where duplicate delivery is possible |
| SendRecord committed but application response lost | canonical performed handoff exists | return same semantic send result | duplicate SendRecord or endpoint-only dedupe |
| file bytes stored, DB commit fails | orphan bytes | detect/remove or retain as staged orphan pending cleanup | expose object as ArtifactVersion without DB record |
| DB ArtifactVersion exists but client response lost | committed exact artifact version | recognize upload operation/result on retry | create unintended new logical version solely due retry |
| compatibility projection diverges after canonical cutover | canonical owner remains truth | repair canonical→legacy | infer new canonical history from stale projection |

## Recovery severity classes

### R1 — automatic
Use for deterministic local idempotent effects such as Capacity release, Schedule unplace, compatibility projection repair, and already-revealed Disclosure.

### R2 — read/reconcile then retry
Use for uncertain local commit/response cases such as state-chain appends or schedule batch application.

### R3 — blocked/operational
Use where external provider outcome is unknown and replay can duplicate a real-world effect.

### R4 — data-integrity quarantine
Use when migration/runtime state violates a hard invariant (for example missing exact Revision reference, Capacity over-allocation, broken history chain). Do not silently repair by fabricating history.

## Retry metadata boundary

Attempt count, next-attempt time, error text, lease/processing state, and operator notes are implementation operations metadata. They do not become concept-local state or a generic business Workflow.