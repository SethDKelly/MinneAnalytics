---
type: Design Rule
title: Documentation Authority & Cross-Reference Rules
description: Canonical rules for documentation ownership, cross-reference-first authoring, controlled repetition, lifecycle, and drift prevention.
tags: [documentation, authority, okf, drift-control, agent-context]
status: stable
authority: canonical
sources:
  - id: okf-spec
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
    title: Open Knowledge Format v0.2 specification
  - id: discovery-method
    resource: ../../001-A-design-authority-methodology-evidence-and-anti-bias.md
    title: 001-A Design Authority, Methodology, Evidence & Anti-Bias Rules
---
# Purpose

Keep MinneAnalytics design knowledge internally consistent, cheap for humans and agents to retrieve, and resistant to documentation drift.

The governing principle is:

> **State a normative rule once at its canonical owner; elsewhere, link to it instead of restating it.**

# Authority model

## Canonical knowledge

A document with `authority: canonical` owns the normative statement of the knowledge within its declared scope.

When two documents appear to disagree, the canonical knowledge node governs unless a later canonical node explicitly supersedes it.

## Phase and evidence records

The numbered files and evidence artifacts under `docs/concept-design/` preserve how the design was discovered and reviewed. They are provenance and audit records.

They may contain earlier or more verbose statements of a rule, candidate, or decision. Once that knowledge is promoted to a canonical node in this bundle, the phase/evidence record no longer owns the current normative wording.

## Implementation documentation

Architecture, routing, schema, API, and implementation documentation describe realization and current behavior. They do not override canonical Concept Design knowledge merely because the implementation differs.

Implementation differences are resolved during explicit reconciliation work.

# Cross-reference-first authoring

1. Before restating a rule, concept boundary, invariant, terminology definition, or accepted decision, locate its canonical knowledge node.
2. Prefer a markdown link plus the minimum local explanation necessary to make the current document understandable.
3. Do not duplicate canonical lists of rules, states, actions, or invariants merely for convenience.
4. If a document needs several related facts, link to the narrowest canonical nodes rather than copying a large parent document.
5. Use indexes for discovery and progressive disclosure; do not turn index files into alternate specifications.

# Permitted repetition

Repetition is permitted when one of these conditions holds:

- an architecture/design option must be independently auditable without requiring the reviewer to reconstruct its assumptions from many files;
- a safety, migration, or compatibility constraint would be materially easier to miss if represented only by a link;
- a short local summary is necessary to explain why a referenced rule matters in the current context.

When repeating canonical knowledge:

- identify it as a summary, assumption, or consequence rather than a new authority;
- link to the canonical owner;
- do not introduce materially different wording that changes the rule's meaning;
- if independent auditability requires a full restatement, explicitly state that the canonical source governs if wording diverges.

# Canonical ownership rules

- One normative rule or concept property should have one canonical owner.
- A concept owns its purpose, operational principle, abstract state, actions, and intrinsic invariants once those are accepted.
- Cross-concept behavior belongs to synchronization/application-composition knowledge, not duplicated inside every participating concept.
- Historical evidence owns observations and provenance, not normative design conclusions.
- Derived views and reports do not become authoritative state merely because they are frequently referenced.

# OKF metadata rules

Canonical knowledge documents SHOULD include:

- `type` — required by OKF;
- `title` and `description` — concise discovery metadata;
- `tags` — cross-cutting retrieval labels when useful;
- `status` — `draft`, `stable`, or `deprecated`;
- `authority` — project extension such as `canonical` or `supporting`;
- `sources` — the primary evidence or prior design records from which the knowledge was derived.

Do not use `verified` unless an actual verification event occurred. Do not manufacture human verification metadata merely because a document was generated in response to a request.

# Link rules

- Prefer ordinary markdown links so the knowledge graph remains usable without custom tooling.
- Prefer relative links inside the repository because this bundle is nested within the repository and should remain directly browsable on GitHub.
- Link to the canonical node, not to an index entry that merely links onward.
- Broken local links are repository defects even though base OKF consumers are required to tolerate them; MinneAnalytics validation is intentionally stricter.

# Lifecycle and supersession

When canonical knowledge changes materially:

1. update the canonical owner;
2. preserve relevant historical reasoning in phase/evidence records rather than rewriting history;
3. add an entry to the nearest applicable `log.md`;
4. update links whose local interpretation materially changed;
5. mark obsolete knowledge `deprecated` and link to its replacement instead of deleting it when existing references or historical interpretation require preservation.

# Agent/context discipline

Agents should begin with [`../index.md`](../index.md), load only the rules/concepts relevant to the current task, and follow links as needed.

Do not preload the entire historical discovery tree unless the task is explicitly archaeological, contradictory evidence must be resolved, or a canonical node points back to the record for deeper provenance.

This progressive-disclosure rule is intended to reduce context bloat without hiding authority.
