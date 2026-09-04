# Synchronization & Application Composition

This directory owns canonical MinneAnalytics composition knowledge that intentionally does **not** belong inside any one concept.

Use the [v0 Synchronization & Composition Contract](minneanalytics-v0.md) for the current cross-concept model.

# Authority split

Cross-concept behavior is classified into four kinds:

1. **Synchronization** — one application operation or source-state transition coordinates actions owned by multiple concepts.
2. **Application policy** — a predicate or rule decides whether an action may be offered or accepted; it does not create another concept's state by itself.
3. **Derived projection** — a fact/view is computed from authoritative concept state and is not persisted as another source of truth.
4. **Implementation reconciliation** — current code differs from the accepted model and must be evaluated before implementation authority moves.

Do not create a generic Workflow, ProgramStatus, or coordinator concept merely to hold these relationships.

# Reference discipline

Concept nodes remain authoritative for their own state/actions/invariants. Synchronization nodes reference those owners and specify only cross-concept coordination. If a synchronization appears to require one concept to inspect or mutate another concept's internals, revisit the composition rather than weakening concept independence.

# Current status

Phase 002-G established the v0 synchronization/application-composition contract. Phase 003 reconciled that contract against implementation and authorized bounded Phase 004 execution.

Phase 004 is now in progress on `concept-design/v0-implementation`. 004-A established only additive migration/schema/recovery substrate; the synchronization contract itself is unchanged and semantic authority begins moving only in later packages under the [Implementation Execution Handoff](../reconciliation/implementation-execution-handoff.md).