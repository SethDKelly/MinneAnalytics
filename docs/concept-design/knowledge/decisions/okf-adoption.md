---
type: Design Decision
title: Adopt OKF as the Concept Design Knowledge Layer
description: Adopt OKF v0.2 for canonical Concept Design knowledge while preserving phase records as audit history and keeping application architecture independent from documentation structure.
tags: [okf, knowledge-architecture, documentation, concept-design]
status: stable
authority: canonical
sources:
  - id: okf-spec
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md
    title: Open Knowledge Format v0.2 specification
  - id: phase-001-f
    resource: ../../001-F-operational-principle-development.md
    title: 001-F Operational Principle Development
---
# Decision

MinneAnalytics adopts Open Knowledge Format (OKF) v0.2 as the repository-native format for the **canonical Concept Design knowledge layer**.

The OKF bundle root is `docs/concept-design/knowledge/`.

The existing numbered phase records and evidence files remain outside the bundle as historical design records and provenance sources.

# Why now

Phase 001 has already produced enough evidence and candidate structure to know what knowledge must remain durable, but formal concept specifications and implementation reconciliation have not yet begun.

Adopting the knowledge format now therefore avoids two later costs:

- migrating many accepted concept specifications after they become entrenched;
- allowing canonical design rules to spread through repeated prose before authority and reference rules exist.

# Why OKF fits

OKF provides the properties needed by this design process without prescribing runtime architecture:

- plain markdown plus YAML frontmatter;
- Git-native versioning and review;
- explicit provenance, lifecycle, and trust metadata;
- progressive-disclosure `index.md` files;
- graph relationships through normal markdown links;
- producer-defined metadata extensions;
- no required schema registry, server, SDK, or vendor runtime.

MinneAnalytics uses custom metadata such as `authority` where useful while remaining compatible with OKF consumers that ignore unknown fields.

# Authority architecture

The repository now distinguishes three layers:

1. **Canonical knowledge** — compact OKF nodes in this bundle.
2. **Historical design record** — numbered phase/evidence documents explaining how the knowledge was discovered and reviewed.
3. **Implementation record** — code and implementation documentation describing current realization.

Canonical knowledge should link to its major historical sources. Historical records should not be rewritten to mimic the current canonical wording merely to remove disagreement; they preserve the reasoning path.

# Application-code decision

Do **not** refactor application/domain code merely to adopt OKF.

OKF is a knowledge representation format, not a domain architecture. Refactoring the application now would risk letting a documentation change prematurely determine implementation before concept specification, synchronization design, and reconciliation have established what semantic changes are actually required.

Permitted immediate code changes are limited to repository/documentation tooling such as validation and CI enforcement. Product-semantic refactors remain deferred to explicit implementation reconciliation.

# Migration strategy

- Keep 001-A through 001-F and their evidence artifacts intact as audit history.
- Establish canonical documentation and Concept Design authority rules in the OKF bundle.
- Use 001-G to promote the surviving discovery candidates into compact OKF concept nodes.
- From 001-G forward, numbered phase documents should primarily record deltas, review reasoning, alternatives, and exit decisions; they should link to canonical nodes for settled rules instead of restating them wholesale.
- Phase 002 concept specification should update the canonical concept nodes with abstract state/actions rather than create a second complete specification elsewhere.
- Later synchronization/composition knowledge should receive its own canonical nodes rather than being duplicated inside concept documents.

# Validation

Repository validation is intentionally stricter than base OKF conformance:

- every non-reserved markdown file in the bundle must have YAML frontmatter with `type`;
- the bundle root declares OKF v0.2;
- nested `index.md` and `log.md` files follow reserved-file rules;
- local markdown links must resolve;
- canonical project knowledge uses explicit `authority` metadata.

This validation guards structural drift. Semantic drift remains governed by the [Documentation Authority & Cross-Reference Rules](../rules/documentation-authority.md).
