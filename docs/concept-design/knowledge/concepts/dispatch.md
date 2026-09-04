---
type: Concept Design Concept
title: Dispatch
description: Provider-neutral performed operational sends with exact per-recipient message snapshots, durable batch/send history, and semantic duplicate/round protection.
tags: [concept-design, concept, dispatch, communication, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-F
concept_id: CC-018
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: criteria, resource: ../../evidence/001-E-criteria-scorecard.md, title: 001-E Concept Criteria Scorecard }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-F-publication-dispatch-and-historical-closure.md, title: 002-F Publication, Dispatch & Historical Closure }
---
# Purpose

Perform an operational send to a resolved audience while preserving what was sent, to whom, under which semantic send/round, and enough durable history to prevent accidental duplicate sends.

# Operational Principle

An organizer has a resolved audience and exact messages prepared for those recipients. Before committing, they can inspect the candidate recipients and message content. They dispatch the operational communication. Dispatch records one immutable batch plus the exact message and destination used for each recipient actually sent. If the same semantic send/round is attempted again, recipients already sent in that round are recognized and skipped, while a later round can intentionally contact the same recipient again.

# Abstract State

Let `Batch` be the set of performed dispatch batches and `SendRecord` the set of immutable performed-recipient-send records.

For each `b ∈ Batch`, Dispatch records:

- `context(b): DispatchContextRef` — the application context in which the operational send occurred;
- `key(b): DispatchKey` — the application-supplied semantic send purpose;
- `round(b): RoundRef` — the application-supplied semantic round/campaign occurrence;
- `sentBy(b): ActorRef`;
- `sentAt(b): Instant`.

For each `r ∈ SendRecord`, Dispatch records:

- `batchOf(r): Batch`;
- `recipient(r): RecipientRef` — the stable recipient identity used for duplicate semantics;
- `endpoint(r): EndpointRef` — the actual destination used for this send, such as an email address or another provider-neutral delivery endpoint;
- `message(r): MessageRef` — an immutable reference/snapshot of the exact message content supplied for this recipient;
- `recordedAt(r): Instant`.

`DispatchContextRef`, `DispatchKey`, `RoundRef`, `ActorRef`, `RecipientRef`, `EndpointRef`, and `MessageRef` are abstract. Dispatch does not define recipient eligibility, template authoring, provider transport, Feedback semantics, Selection state, Deliverable state, or identity management.

The application is responsible for making `MessageRef` refer to the actual message instance intended for this recipient. A mutable template identifier alone is insufficient historical evidence of what was sent if the template can later change.

# Actions

## `Preview(context, key, round, deliveries) -> preview`

**Intent:** inspect the candidate operational send without mutating Dispatch state.

`deliveries` is a finite set of tuples `(recipient, endpoint, message)`.

**Derived result:**

- `alreadySent` — candidate recipients for whom a SendRecord already exists in the same `(context, key, round)`;
- `sendable` — candidates not already sent in that semantic round;
- exact endpoint/message references supplied for each candidate.

`Preview` is an observation, not persisted draft state. Reusable template editing, merge-field editing, recipient-resolution logic, and UI confirmation remain outside Dispatch.

## `Dispatch(context, key, round, deliveries, actor, at) -> batch`

**Intent:** perform one operational batch while automatically protecting against duplicate recipient sends within the same semantic round.

**Requires:**

- context, key, round, actor, and recording instant are supplied;
- `deliveries` is finite;
- no recipient appears more than once in the supplied candidate set;
- every candidate has an endpoint and exact message reference;
- after excluding recipients already sent in the same `(context, key, round)`, at least one recipient remains.

Whether the recipients are eligible, whether the actor may send, and how messages were rendered are application composition/policy.

**Effects:**

- computes `sendable` by excluding candidate recipients with prior SendRecords in the same `(context, key, round)`;
- creates a fresh Batch `b` recording context/key/round/actor/time;
- for each sendable candidate, creates one immutable SendRecord linked to `b` with the supplied recipient, endpoint, message, and recording instant;
- creates no SendRecord for already-sent candidates;
- leaves all prior Batch and SendRecord state unchanged.

The action models the application's committed handoff of the message to its delivery mechanism. Provider-level delivery confirmation, bounce processing, retry queues, and eventual delivery receipts are not currently intrinsic Dispatch state.

# Intrinsic Invariants

1. Every Batch has exactly one context, semantic key, round, initiating actor, and send instant.
2. Every SendRecord belongs to exactly one Batch and records exactly one recipient, endpoint, and exact message instance.
3. Batch and SendRecord records are immutable after creation.
4. Within one `(DispatchContextRef, DispatchKey, RoundRef)`, a `RecipientRef` has at most one SendRecord.
5. Duplicate protection is based on stable semantic recipient identity, not merely the endpoint string; changing an email address does not make the same recipient unsent for the same semantic round.
6. A different `RoundRef` may intentionally create a later SendRecord for the same recipient and semantic key.
7. Dispatch does not infer eligibility from Selection, Deliverable, Withdrawal, attendee registration, or any other concept.
8. Dispatch does not own reusable template definitions, merge-field syntax, provider credentials, SMTP/API transport, retry/backoff behavior, or provider delivery receipts.
9. Dispatch does not create or alter [Feedback](feedback.md); a Feedback record may motivate a notification, but recipient-directed review response and operational send history remain distinct concepts.
10. Dispatch does not require one communication provider or endpoint type.
11. Preview/confirmation does not create a persistent Dispatch draft lifecycle in v0.

# Derived Observations

For a semantic send `(context, key, round)`:

- `sentRecipients(context,key,round)` is the set of recipients appearing in SendRecords whose Batch has that context/key/round;
- `alreadySent(recipient,context,key,round)` holds exactly when the recipient is in that set;
- a candidate recipient is `sendable` for that semantic round iff they are not already sent;
- batch recipient count is derived from SendRecords linked to that Batch.

Dispatch can therefore support idempotent repeated attempts and later rounds without owning the upstream eligibility query.

# Synchronization Boundary

Dispatch composes with neighboring concepts and application state without reading their internals:

- [Deliverable](deliverable.md) state may determine who should receive a call/reminder;
- [Selection](selection.md), [Withdrawal](withdrawal.md), registration/attendance facts, or other application state may resolve an eligible audience;
- [Feedback](feedback.md) may trigger a separate notification Dispatch while retaining its own semantic record;
- [Archive](archive.md) or lifecycle policy may disable new sends while preserving historical Batch/SendRecord inspection;
- reusable templates and message rendering may supply exact per-recipient `MessageRef` values but do not become Dispatch state.

The current `ConferenceEmailBatch` and `EmailSendRecord` structures are strong implementation evidence for the concept boundary. Later reconciliation should strengthen one gap: the implementation records template key/round/recipient but not an immutable snapshot/reference of the exact rendered subject/body sent to each recipient, so later template edits can weaken historical reconstruction.

# Provisional Gate Resolution

**Resolved and specified in 002-F.** Dispatch survives its Phase 001 provisional condition because it has independently meaningful performed-send state, semantic round/deduplication invariants, exact per-recipient send evidence, and a clear provider-neutral boundary. Template lifecycle, recipient eligibility, Feedback, and transport remain external rather than expanding the concept.