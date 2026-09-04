---
type: Concept Design Concept
title: Deliverable
description: A required artifact whose successive provided versions are reviewed for operational readiness without conflating readiness with selection or publication.
tags: [concept-design, concept, deliverable, readiness, formal-specification]
status: stable
authority: canonical
maturity: specified
phase: 002-E
concept_id: CC-014
sources:
  - { id: purpose, resource: ../../evidence/001-C-purpose-inventory.md, title: 001-C Purpose Inventory }
  - { id: principle, resource: ../../evidence/001-F-operational-principles.md, title: 001-F Operational Principles }
  - { id: gate, resource: ../decisions/001-g-discovery-gate.md, title: 001-G Discovery Gate Decision }
  - { id: specification, resource: ../../002-E-deliverable-and-scheduling-execution.md, title: 002-E Deliverable & Scheduling Execution }
---
# Purpose

Obtain a required artifact and establish whether the currently provided artifact is operationally ready for its intended downstream use.

# Operational Principle

A responsible party has a Deliverable requirement for a subject. They provide an artifact, which becomes the current artifact version while any earlier provided versions remain historically identifiable. A reviewer evaluates the current version and may record a concern or establish it as ready. If a replacement artifact is later provided, earlier review remains true about the version that was reviewed, but readiness of the replacement must be established independently.

# Abstract State

Let `Deliverable` be the set of deliverable identities, `ArtifactVersion` the set of immutable provided-version records, and `Assessment` the set of immutable readiness-assessment records.

For each `d ∈ Deliverable`, Deliverable records:

- `subject(d): SubjectRef` — the subject or commitment for which the artifact is required;
- `responsible(d): ActorRef` — the party responsible for satisfying the requirement;
- `kind(d): ArtifactKindRef` — the kind/purpose of artifact required;
- `currentArtifact(d): ArtifactVersion?` — absent until an artifact has been provided.

For each `a ∈ ArtifactVersion`, Deliverable records:

- `deliverableOf(a): Deliverable`;
- `artifactOf(a): ArtifactRef` — an opaque reference to the provided artifact;
- `providedBy(a): ActorRef`;
- `providedAt(a): Instant`;
- `predecessorArtifact(a): ArtifactVersion?` — absent only for the first provided version.

For each `q ∈ Assessment`, Deliverable records:

- `artifactVersionOf(q): ArtifactVersion`;
- `disposition(q) ∈ {concern, ready}`;
- `detail(q): Detail?` — optional reviewer context, including concern explanation;
- `reviewedBy(q): ActorRef`;
- `reviewedAt(q): Instant`;
- `predecessorAssessment(q): Assessment?` — the preceding assessment of the same artifact version, if any.

For each assessed ArtifactVersion `a`, `currentAssessment(a): Assessment` identifies its latest readiness assessment.

`SubjectRef`, `ActorRef`, `ArtifactKindRef`, `ArtifactRef`, and `Detail` are abstract. Deliverable does not define file storage, MIME types, upload transport, Selection, Publication, or application authority.

# Actions

## `Require(subject, responsible, kind) -> deliverable`

**Intent:** establish a durable artifact requirement.

**Requires:**

- subject, responsible-party, and artifact-kind references are supplied.

Whether another concept or workflow is allowed to create the requirement is application composition.

**Effects:**

- creates a fresh Deliverable identity `d`;
- records the supplied subject, responsible party, and artifact kind;
- leaves `currentArtifact(d)` absent.

## `Provide(deliverable, artifact, actor, at) -> artifactVersion`

**Intent:** provide or replace the artifact intended to satisfy a Deliverable.

**Requires:**

- `deliverable ∈ Deliverable`;
- artifact, actor, and recording instant are supplied.

File validation, authorization, and whether provision is currently permitted are application/implementation concerns.

**Effects:**

- creates a fresh immutable ArtifactVersion `a`;
- records the supplied artifact and provenance;
- records `deliverableOf(a) = deliverable`;
- if `currentArtifact(deliverable)` existed, records it as `predecessorArtifact(a)`; otherwise leaves the predecessor absent;
- sets `currentArtifact(deliverable) = a`;
- leaves all prior ArtifactVersions and Assessments unchanged.

A newly current ArtifactVersion has no readiness assessment merely because an earlier version was ready.

## `FlagConcern(deliverable, reviewer, detail, at) -> assessment`

**Intent:** record that the currently provided artifact is not yet ready and preserve the concern against the exact artifact version reviewed.

**Requires:**

- `deliverable ∈ Deliverable`;
- `currentArtifact(deliverable)` exists;
- reviewer and recording instant are supplied.

**Effects:**

- lets `a = currentArtifact(deliverable)`;
- appends a fresh Assessment `q` for `a` with disposition `concern`;
- records the supplied detail and provenance;
- links to the prior `currentAssessment(a)` when one exists;
- sets `currentAssessment(a) = q`;
- leaves the artifact and all earlier state unchanged.

## `MarkReady(deliverable, reviewer, detail?, at) -> assessment`

**Intent:** establish that the currently provided artifact is ready for its intended downstream use.

**Requires:**

- `deliverable ∈ Deliverable`;
- `currentArtifact(deliverable)` exists;
- reviewer and recording instant are supplied.

Whether a particular review process or authority is required before this action is application policy.

**Effects:**

- lets `a = currentArtifact(deliverable)`;
- appends a fresh Assessment `q` for `a` with disposition `ready`;
- records optional detail and provenance;
- links to the prior `currentAssessment(a)` when one exists;
- sets `currentAssessment(a) = q`;
- leaves the artifact and all earlier state unchanged.

# Intrinsic Invariants

1. Every Deliverable refers to exactly one subject, responsible party, and artifact kind; those references are stable within this concept.
2. Each ArtifactVersion belongs to exactly one Deliverable and identifies exactly one provided artifact.
3. Per Deliverable, provided ArtifactVersions form one acyclic linear chain ending at `currentArtifact(d)`.
4. ArtifactVersion records are immutable after creation.
5. Each Assessment belongs to exactly one ArtifactVersion and is immutable after creation.
6. Per ArtifactVersion, Assessment history is a single acyclic linear chain ending at `currentAssessment(a)` when assessments exist.
7. Readiness is version-specific. An Assessment of one ArtifactVersion never establishes readiness of a later ArtifactVersion.
8. Providing a replacement artifact never deletes earlier artifacts, concerns, or readiness determinations.
9. Deliverable does not intrinsically require that its subject be selected, scheduled, or publicly publishable.
10. Deliverable has no intrinsic file-format, storage-provider, upload-size, email-notification, or public-sharing semantics.
11. Deliverable does not use `SUBMITTED`, `REVIEWED`, `APPROVED`, or `CONCERN` as a single mutable status lifecycle; supplied/readiness observations are derived from versioned artifact and Assessment state.

# Derived Observations

For `d ∈ Deliverable`:

- `provided(d)` iff `currentArtifact(d)` exists;
- `awaitingProvision(d)` iff no current artifact exists;
- `awaitingReview(d)` iff a current artifact exists and has no Assessment;
- `ready(d)` iff the current artifact has a current Assessment whose disposition is `ready`;
- `hasConcern(d)` iff the current artifact has a current Assessment whose disposition is `concern`.

A Deliverable can have historical ready/concern assessments on earlier ArtifactVersions while its current artifact is awaiting review.

# Synchronization Boundary

Deliverable composes with neighboring concepts without absorbing their state:

- [Selection](selection.md) may cause a Deliverable requirement to be established, but Selection is not Deliverable state;
- [Withdrawal](withdrawal.md) may affect whether provision/review remains operationally useful, without deleting Deliverable history;
- [Publication](publication.md) may require a ready current artifact before public exposure, but `ready(d)` does not itself publish anything;
- [Dispatch](dispatch.md) may later send calls/reminders about outstanding Deliverables without becoming part of Deliverable;
- application policy decides who may provide/review artifacts and what file/content validation is required.

The current deck workflow is one instance of this concept. `DeckFile` versions provide useful implementation evidence, but the formal model binds readiness assessments to the exact provided ArtifactVersion rather than relying on a status stored separately on the broader submission aggregate.

# Formal Specification Decision

**Specified in 002-E.** Deliverable is a durable requirement with immutable provided-artifact history and version-specific readiness assessment. It remains independent from Selection, Publication, file storage, and communication.