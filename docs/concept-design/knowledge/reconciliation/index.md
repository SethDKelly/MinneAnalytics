---
type: Implementation Reconciliation Index
title: Implementation Reconciliation
description: Canonical entrypoint for mapping the accepted v0 Concept Design model to the existing MinneAnalytics implementation and its semantic gaps.
tags: [concept-design, implementation-reconciliation, architecture-mapping]
status: stable
authority: canonical
phase: 003-A
---
# Implementation Reconciliation

Use this directory for current normative conclusions about how the existing implementation relates to the accepted Concept Design model.

Concept semantics remain owned by the [Concept Catalog](../concepts/), and cross-concept behavior remains owned by the [MinneAnalytics v0 Synchronization & Composition Contract](../synchronizations/minneanalytics-v0.md). This directory owns neither of those definitions; it maps implementation realization and reconciliation obligations to them.

# Current canonical reconciliation knowledge

* [v0 Implementation Ownership Map](minneanalytics-v0-implementation-ownership.md) — semantic ownership of current models, fields, helpers, routes, and projections across the 17 concepts.
* [003-A Semantic Gap Baseline](semantic-gap-baseline.md) — prioritized reconciliation gaps that later Phase 003 work must resolve, retain explicitly, or defer with rationale.

# Historical audit evidence

Detailed implementation observations and source-path inventories remain in the Phase 003-A historical record:

* [003-A — Concept-to-Implementation Ownership Map & Semantic Gap Register](../../003-A-concept-to-implementation-ownership-map-and-semantic-gap-register.md)
* [Implementation Surface Inventory](../../evidence/003-A-implementation-surface-inventory.md)
* [Concept-to-Implementation Ownership Matrix](../../evidence/003-A-concept-to-implementation-ownership-matrix.md)
* [Semantic Gap Register](../../evidence/003-A-semantic-gap-register.md)

# Authority rule

A physical implementation aggregate may realize several concepts, policies, synchronizations, and projections. Reconciliation must preserve semantic ownership and history without assuming one table/service/route per concept.
