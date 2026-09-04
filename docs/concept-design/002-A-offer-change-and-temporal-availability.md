# 002-A — Offer, Change & Temporal Availability

Status: **Complete**  
Concept model maturity: **v0 — formal specification in progress**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-G — Discovery Consolidation & Concept Candidate Gate](001-G-discovery-consolidation-and-concept-candidate-gate.md)

## 1. Purpose

002-A formally specifies the first Phase 002 concept group:

- [Proposal](knowledge/concepts/proposal.md)
- [Revision](knowledge/concepts/revision.md)
- [Availability Window](knowledge/concepts/availability-window.md)

The canonical concept nodes own their current purpose, operational principle, abstract state, actions, intrinsic invariants, derived observations, and concept-local boundaries.

This phase record intentionally does **not** restate those specifications in full. It records the design decisions, rejected alternatives, unresolved composition questions, and exit review needed to audit how the canonical nodes reached their 002-A form.

Documentation authority remains governed by [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md). Implementation remains evidence rather than design authority under [Concept Design Authority](knowledge/rules/concept-design-authority.md).

---

## 2. Entry conditions

002-A entered with all three candidates having survived Phase 001 purpose, boundary, criteria, and operational-principle review.

- Proposal entered as **admitted**.
- Revision entered as **admitted**.
- Availability Window entered as **admitted-provisional**, with the explicit condition that formal specification must prove behavior richer and more user-recognizable than generic timestamp configuration.

The current implementation was consulted only to test compatibility and edge cases. In particular, current `Submission`, `abstractVersion`, `SubmissionRevision`, `submissionsOpen`, `submissionsOpenAt`, `submissionsCloseAt`, `ProgramStatus`, and `AbstractReviewStatus` structures were not treated as specification templates.

---

## 3. Formal-specification method

For each concept, 002-A required:

1. a minimal abstract state sufficient to support the accepted purpose;
2. mutation actions whose effects can be explained without neighboring concept internals;
3. intrinsic invariants that protect the concept's own correctness;
4. derived observations distinguished from authoritative state;
5. explicit exclusions for application policy and synchronization behavior;
6. no product-code changes merely to make the implementation resemble the specification.

The group was also tested for accidental duplication. In particular, the specification avoids storing the same mutable content or lifecycle status authoritatively in both Proposal and Revision.

---

## 4. Design decisions

### D-002A-01 — Proposal is the durable offer/reference, not a mutable content container

Proposal needs enough state to establish that an originator offered a particular subject, but it does not need to own the subject's internal content representation.

The canonical state therefore binds a fresh Proposal identity to:

- an originator reference; and
- an opaque subject reference.

The subject reference may later participate in Revision or other concepts without Proposal knowing those concepts' state.

**Rejected alternative:** copying current `Submission` fields into Proposal and making Proposal the owner of title/abstract/version/status/deck/theme/etc. That would simply rebrand the implementation aggregate and undo the Phase 001 decomposition.

---

### D-002A-02 — Proposal has no intrinsic update, deletion, withdrawal, or selection action

The intrinsic Proposal action set contains `Offer` only.

Changing the represented mutable form belongs to [Revision](knowledge/concepts/revision.md). Originator rescission belongs to [Withdrawal](knowledge/concepts/withdrawal.md). Organizer choice belongs to [Selection](knowledge/concepts/selection.md).

There is no intrinsic Proposal deletion action because erasing the Proposal would destroy the durable historical fact that the offer existed. Application presentation may hide or exclude an offer through composed state without deleting its Proposal identity.

---

### D-002A-03 — Revision is a linear append-only history

Revision formalizes the sequence already implied by the accepted operational principle:

- one initial revision establishes history for a subject;
- every later revision extends the current revision;
- earlier revisions are immutable;
- each tracked subject has exactly one current revision;
- the predecessor relation forms one acyclic linear chain per subject.

Revision numbers are not authoritative state. Sequence position can be derived from the predecessor chain.

**Rejected alternative:** branch/merge semantics. No current or historical need establishes collaborative branching as part of this concept. Future evidence may reopen this choice explicitly.

---

### D-002A-04 — Revision records provenance but does not grant authority

Each revision records the actor reference and instant associated with its creation.

This is intrinsic provenance: later inspection can identify who/what recorded the form and when.

It does **not** mean Revision decides whether that actor was permitted to act. Authorization remains application policy unless a future independently user-visible delegation concept is discovered.

---

### D-002A-05 — Revision does not define “meaningful change”

The concept permits a later `Form` value that happens to equal the current form.

Whether a no-op save should be suppressed is application policy/realization. Making Revision compute domain-specific semantic differences would make the generic concept depend on the structure of every possible Form.

---

### D-002A-06 — Availability Window owns a governed opportunity interval

Availability Window is not a generic clock, calendar, or scheduler.

Its independent state is:

- a stable Window identity;
- an opaque opportunity reference;
- an opening instant;
- a closing instant.

That is enough to answer the user-recognizable question: *when is this governed opportunity ordinarily available?*

---

### D-002A-07 — Window phase is derived, not stored

The canonical interval is half-open:

`[opensAt, closesAt)`

At observation time `now`:

- before `opensAt` → upcoming;
- from `opensAt` until but excluding `closesAt` → open;
- at or after `closesAt` → closed.

This removes ambiguity at the closing boundary and avoids creating another mutable `OPEN/CLOSED` status that could contradict the interval.

Timezone remains a display/input-normalization concern around instants rather than intrinsic concept state.

---

### D-002A-08 — Current manual submission-open state is not promoted into the concept

The current implementation combines interval fields with a `submissionsOpen` flag and conference lifecycle rules.

002-A does not infer an intrinsic manual enabled/disabled flag merely from that implementation.

If a future user need requires pausing an otherwise-open opportunity while preserving its published interval, or separately suspending/reopening access, that behavior should be rediscovered explicitly. It must not be silently added to Availability Window because a current implementation boolean exists.

---

### D-002A-09 — Rescheduling does not imply built-in interval version history

Availability Window supports changing the currently declared interval through `Reschedule`.

The concept does not currently preserve every previous interval as its own version history. No recovered need establishes that lifecycle strongly enough to make it intrinsic.

If historical deadline/window changes later become a user-facing audit requirement, the design should add explicit provenance/version behavior rather than assuming it is already present.

---

### D-002A-10 — Availability Window's provisional admission is resolved

The Phase 001 concern was that Availability Window might collapse into “two timestamps.”

The formal specification demonstrates a coherent independent unit:

- a durable referable governed opportunity;
- a constrained non-empty interval;
- `Define` and `Reschedule` actions;
- a precise upcoming/open/closed derived lifecycle;
- a boundary independent from the governed action, authorization, calendar infrastructure, and conference lifecycle.

Availability Window therefore exits 002-A as **specified**, not provisionally admitted.

---

### D-002A-11 — Edit/offer eligibility remains composition

002-A deliberately does not create a `Mutability`, `EditStatus`, `SubmissionState`, or `Permission` concept.

A later MinneAnalytics synchronization may use facts such as:

- a relevant Availability Window being open;
- application authority policy;
- Selection/Withdrawal or other application state;
- explicit exceptional unlock policy;

to determine whether Proposal `Offer` or Revision `Revise` is invokable in a particular workflow.

Those rules are not intrinsic invariants of Proposal, Revision, or Availability Window.

---

### D-002A-12 — Proposal→Revision initialization remains a synchronization question

It is plausible that MinneAnalytics will synchronize a successful Proposal `Offer` with Revision `Initialize`, using the newly offered subject and its initial form.

002-A does not make that synchronization canonical yet because Phase 002 is specifying independent concepts first. The synchronization should be tested alongside the broader composition model after the relevant concepts have formal specifications.

Proposal therefore remains complete even when used for an immutable subject that never acquires Revision history.

---

## 5. Cross-concept boundary result

| Concept | Owns | Explicitly does not own |
|---|---|---|
| [Proposal](knowledge/concepts/proposal.md) | durable offer identity; originator reference; offered-subject reference | mutable forms/history; edit permission; selection; withdrawal; evaluation; schedule; publication |
| [Revision](knowledge/concepts/revision.md) | immutable forms; linear sequence; current revision; actor/time provenance | authorization; edit eligibility; evaluation freshness; acknowledgement; branching/merge |
| [Availability Window](knowledge/concepts/availability-window.md) | governed opportunity reference; explicit interval; derived temporal phase | governed action; authority; event lifecycle; manual pause/override; timezone/calendar infrastructure |

The three concepts can therefore be specified independently without direct access to each other's internal state.

---

## 6. Implementation-reconciliation observations retained for later

002-A does **not** change product code, but it records several likely reconciliation questions for the later implementation phase:

- current `Submission` appears to combine Proposal identity with mutable subject content and many unrelated downstream concerns;
- current abstract-version fields and `SubmissionRevision` likely realize substantial parts of Revision but must be checked against the new append-only linear specification;
- current `submissionsOpen` plus opening/closing timestamps/lifecycle checks represent a more coupled realization than Availability Window alone;
- current edit-policy state in `AbstractReviewStatus` should not be assumed to map to Revision state;
- current `ProgramStatus.WITHDRAWN` must not be used later to erase Selection history or Proposal identity.

These are **reconciliation observations**, not implementation-change authorizations.

---

## 7. Deferred/open questions

None blocks 002-A exit.

### OQ-002A-01 — Concrete subject-reference composition

Phase 002 synchronization work must determine how a Proposal's opaque `SubjectRef` is connected to the mutable subject initialized in Revision without duplicating authoritative content.

### OQ-002A-02 — Branching or rollback

No current evidence requires Revision branching, merging, or a special rollback action. A user can conceptually create a new revision whose Form resembles an earlier one without moving the current pointer backward. True branch/merge requirements require rediscovery.

### OQ-002A-03 — Window pauses/reopenings/multiple periods

Current formal behavior supports rescheduling one interval and allows multiple Window identities to exist. A future requirement for pause/resume, recurrence, or multi-period opportunity semantics should be tested as new concept behavior rather than added opportunistically.

### OQ-002A-04 — Historical window-change audit

Current concept state does not retain old intervals after `Reschedule`. If users later need to answer “what deadline was published at time X?”, that becomes explicit provenance/history work.

---

## 8. Documentation/OKF result

002-A follows the cross-reference-first documentation contract:

- the three canonical concept nodes contain the formal specifications;
- this phase record contains review reasoning and decisions rather than duplicate specifications;
- future phases should link to those nodes rather than restating their state/actions/invariants;
- the knowledge update log records the promotion.

No fourth specification layer was created.

---

## 9. Exit criteria

- [x] Proposal has formal abstract state.
- [x] Proposal has a complete intrinsic action set for its purpose.
- [x] Proposal intrinsic invariants and exclusions are explicit.
- [x] Revision has formal append-only linear state/history.
- [x] Revision initialization and append actions are specified.
- [x] Revision provenance is separated from authorization.
- [x] Evaluation freshness and edit eligibility remain outside Revision.
- [x] Availability Window has formal state/actions/invariants.
- [x] Temporal boundary semantics are unambiguous.
- [x] Availability phase is derived rather than duplicated as authoritative status.
- [x] Availability Window's Phase 001 provisional condition is resolved positively.
- [x] Current implementation fields were treated as evidence rather than specification authority.
- [x] Likely synchronizations are identified but not prematurely made canonical.
- [x] No application/domain refactor was performed.
- [x] Canonical nodes, index/navigation, and knowledge log can be advanced coherently.

### Phase result

**002-A passes.**

Proposal, Revision, and Availability Window are formally specified at the current v0 maturity level and are ready to participate in later synchronization/composition design.

---

## 10. Immediate next phase

**002-B — Evaluation, Disclosure & Directed Response**

002-B should formally specify:

- [Evaluation](knowledge/concepts/evaluation.md)
- [Controlled Disclosure](knowledge/concepts/controlled-disclosure.md)
- [Feedback](knowledge/concepts/feedback.md)

Controlled Disclosure retains its Phase 001 provisional condition and should be either resolved or demoted during that subgroup.