---
type: Concept Design Concept
title: Archive
description: Monotonic closure of a working context into retained internal history, distinct from public publication and broader lifecycle state.
tags: [concept-design, concept, archive, history, closure, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-F
concept_id: CC-017
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-F-publication-dispatch-and-historical-closure.md, title: 002-F Publication, Dispatch & Historical Closure }
---
# Purpose

Close a working context into retained internal history so ordinary active mutation can end without deleting the context or conflating internal retention with public exposure.

# Operational Principle

An operator determines that a working context has completed active operation and archives it. Archive records that closure and its provenance. The same context remains referable for historical inspection, while application policy can prevent ordinary ongoing mutations in concepts scoped to that context. Archiving does not publish anything and does not erase the state that existed before closure.

# Abstract State

Let `ArchivedContext` be the set of archived working-context references.

For each `c ∈ ArchivedContext`, Archive records:

- `archivedBy(c): ActorRef`;
- `archivedAt(c): Instant`.

`ContextRef` and `ActorRef` are abstract. Archive does not define the internal state of the context, its child concepts, persistence/storage mechanisms, public audience access, or an application-wide lifecycle enum.

A context that is not in `ArchivedContext` is simply not archived by this concept. That does not imply it is necessarily in an application state named `ACTIVE`; draft/setup and other lifecycle states remain outside Archive.

# Actions

## `Archive(context, actor, at)`

**Intent:** mark a completed working context as retained historical context.

**Requires:**

- `context ∉ ArchivedContext`;
- context, actor, and recording instant are supplied.

Whether the context is operationally ready to close and whether the actor has closure authority are application policy/composition.

**Effects:**

- adds `context` to `ArchivedContext`;
- records the archiving actor and instant;
- does not mutate or delete state owned by other concepts.

# Intrinsic Invariants

1. A context is archived at most once in the current v0 model.
2. `archivedBy(c)` and `archivedAt(c)` are immutable once Archive records closure.
3. Archive is monotonic: v0 has no intrinsic `Unarchive`, `Restore`, or `Reopen` action.
4. Archiving never deletes the context or concept-local histories associated with it.
5. Archive does not itself mutate Proposal, Evaluation, Selection, Deliverable, Schedule, Dispatch, Publication, or any other neighboring concept.
6. Archive does not imply public availability; [Publication](publication.md) remains independently authoritative for public exposure.
7. Archive is not a backup, storage-tier, data-retention-period, legal-hold, or disaster-recovery concept.
8. Archive does not define a general `DRAFT/ACTIVE/ARCHIVED` application lifecycle. It owns only the closure-to-retained-history fact.

# Derived Observations

For a working context `c`:

- `archived(c)` iff `c ∈ ArchivedContext`;
- `notArchived(c)` iff `c ∉ ArchivedContext`.

Application views may combine `archived(c)` with other lifecycle/policy state to label a context or decide which operations remain available. Those labels and decisions are not additional Archive state.

# Synchronization Boundary

Archive is intended to be composed as a closure signal:

- application policy may reject ordinary concept mutations when their owning context is archived;
- historical read paths may remain available for concepts scoped to an archived context;
- [Dispatch](dispatch.md) may become ineligible for new sends while its prior send history remains inspectable;
- [Publication](publication.md) may remain published, be unpublished, or be published after archival depending on application policy; Archive does not decide that relationship;
- export/report projections may continue to inspect archived contexts without becoming Archive state.

The current `ConferenceStatus` implementation is broader than this concept because it includes `DRAFT`, `ACTIVE`, and `ARCHIVED`, and currently permits later status changes that can clear `archivedAt`. Later reconciliation must decide whether product policy truly supports reopening an archived conference. If so, that behavior requires an explicit lifecycle design rather than silently weakening Archive's retained-closure semantics.

# Formal Specification Decision

**Specified in 002-F.** Archive is a monotonic internal closure fact with durable provenance. It gates later application behavior through synchronization but does not own neighboring concept state, public Publication, or a general conference lifecycle.