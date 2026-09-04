# 002-B — Evaluation, Disclosure & Directed Response

Status: **Complete**  
Concept model maturity: **v0 — formal specification in progress**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [002-A — Offer, Change & Temporal Availability](002-A-offer-change-and-temporal-availability.md)

## 1. Purpose

002-B formally specifies the second Phase 002 concept group:

- [Evaluation](knowledge/concepts/evaluation.md)
- [Controlled Disclosure](knowledge/concepts/controlled-disclosure.md)
- [Feedback](knowledge/concepts/feedback.md)

The canonical concept nodes own their current purpose, operational principle, abstract state, actions, intrinsic invariants, derived observations, and synchronization boundaries.

This phase record records only the decisions, rejected alternatives, implementation-reconciliation observations, and exit review needed to audit why those canonical specifications took their 002-B form.

Documentation authority remains governed by [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md). Implementation remains evidence rather than design authority under [Concept Design Authority](knowledge/rules/concept-design-authority.md).

---

## 2. Entry conditions

002-B entered with:

- Evaluation — **admitted** by 001-G;
- Feedback — **admitted** by 001-G;
- Controlled Disclosure — **admitted-provisional** by 001-G.

Controlled Disclosure carried the explicit condition that formal specification must preserve staged-exposure semantics and avoid becoming:

- generic role/access-control infrastructure;
- generic confidentiality/data-classification state;
- permanent anonymity;
- conflict-of-interest/recusal management.

Historical intent also established several high-confidence separations:

- private evaluator notes are not presenter-visible Feedback;
- presenter identity may be concealed and explicitly revealed;
- committee aggregates may remain concealed until an evaluator records an independent current judgment;
- bias-reduction policy is configurable rather than intrinsic to Evaluation;
- prior judgments about earlier content revisions remain historically meaningful even when they no longer participate in current aggregation.

The current implementation was consulted to test those semantics, but current `Score`, `scoredAbstractVersion`, `PresenterFeedback`, `AbstractReviewStatus`, `blindReviewEnabled`, queue partitioning, route structure, and masking helpers were not used as specification templates.

---

## 3. Formal-specification method

For each concept, 002-B required:

1. minimal concept-local authoritative state;
2. actions that fulfill the accepted operational principle without neighboring concept internals;
3. intrinsic invariants distinct from application policy;
4. explicit provenance where historical interpretation depends on who/what/when;
5. derived observations kept separate from authoritative state;
6. current implementation status/queue/visibility behavior decomposed rather than promoted;
7. no product-code refactor.

The group was specifically tested for three accidental mergers:

```text
Evaluation + aggregate/ranking
Evaluation + information visibility
Evaluation private notes + Feedback
```

All three mergers are rejected.

---

## 4. Design decisions

### D-002B-01 — Evaluation is judgment about an exact referable subject state

Evaluation records:

- the evaluator;
- the exact subject reference judged;
- the judgment itself;
- optional private evaluator context;
- recording/change provenance.

The subject reference is stable for the Evaluation identity.

Where MinneAnalytics needs version-sensitive judgment, the application can use a [Revision](knowledge/concepts/revision.md) identity as the Evaluation subject.

This directly preserves the historical fact:

> an Evaluation of revision N remains truthful about revision N after revision N+1 becomes current.

**Rejected alternative:** bind Evaluation only to a mutable Proposal and store a separate intrinsic `scoredVersion/current/stale` state. That would make Evaluation depend on Revision/application-currentness semantics and recreate the current implementation coupling.

---

### D-002B-02 — Evaluation owns opaque Judgment, not `Score`

`Judgment` is an abstract value.

The current numeric 0.0–1.0 scale, rubric representation, sorting, ranking, and aggregate average are application realizations/policies.

Evaluation therefore remains usable if MinneAnalytics later adopts:

- multi-dimensional rubric judgments;
- ordinal recommendations;
- qualitative assessments;
- another scoring scale.

No such alternative is invented into the current product; the abstraction merely avoids treating today's numeric encoding as the concept.

---

### D-002B-03 — An evaluator may revise their judgment about the same exact subject

Evaluation supports `Revise` for the Evaluation's attributed evaluator.

Evaluator and subject references remain stable while judgment/private context may change.

The actor equality requirement is semantic attribution, not RBAC:

- an Evaluation represents *that evaluator's* judgment;
- another actor cannot use `Revise` to turn it into someone else's judgment.

Authentication and action authorization remain application concerns.

---

### D-002B-04 — Evaluation does not intrinsically version every evaluator edit

002-B does not add an append-only change history for modifications to the same Evaluation judgment/context.

Historical evidence strongly requires preserving judgments about *earlier subject revisions*. That is satisfied by stable exact-subject attribution and separate Evaluations of later subject revisions.

Evidence does not currently establish an independently user-facing need to inspect every intermediate edit an evaluator made to the same judgment.

If such audit/history becomes required, it should be modeled explicitly rather than assumed to exist because generic auditing is desirable.

---

### D-002B-05 — Evaluation private context remains distinct from Feedback

Evaluation may store optional evaluator-facing private context.

That context is not Feedback and is never automatically exposed to the subject originator merely because a Feedback feature exists.

The application may allow an evaluator to author similar wording in both places, but the purpose and audience differ:

```text
Evaluation.privateContext
    = context supporting the evaluator's own judgment

Feedback.content
    = response intentionally addressed to a recipient
```

This preserves the strong historical intent that private score notes and presenter-visible feedback are different behaviors.

---

### D-002B-06 — Evaluation currentness/freshness remains composition

Evaluation has no intrinsic:

- `current`;
- `stale`;
- `needs score`;
- `needs rescore`;
- aggregate-eligibility status.

A later MinneAnalytics synchronization/application rule can compare:

- `Evaluation.subject`; and
- the currently applicable [Revision](knowledge/concepts/revision.md)

to determine whether that Evaluation participates in current aggregation or appears in a rescore work view.

This preserves the distinction between historical truth and present applicability.

---

### D-002B-07 — Controlled Disclosure owns one staged exposure relationship

Controlled Disclosure is formally scoped to one tuple:

```text
(participant, context, information)
```

It does not own the information itself.

The same participant/context may therefore have independent disclosure records for different information items.

In the current review experience, presenter identity and peer/committee aggregate information are conceptually separate `InformationRef`s even though both are currently described under “blind review.”

This prevents a single global hidden/revealed state from coupling unrelated information.

---

### D-002B-08 — Controlled Disclosure is monotonic

`Stage` creates a concealed exposure relationship.

`Reveal` records that the staged information was disclosed in that context.

There is no intrinsic `HideAgain`/`Reconceal` action.

Once information has been disclosed to a person in a context, the historical fact that disclosure occurred cannot truthfully be reversed by changing a UI visibility flag.

Later loss of general access to the source information is a separate authorization/lifecycle concern.

---

### D-002B-09 — Reveal policy remains outside Controlled Disclosure

Controlled Disclosure records exposure state; it does not decide why reveal is allowed.

A reveal may be triggered by:

- an explicit participant action permitted by application policy;
- a synchronization after another condition becomes true;
- another policy-controlled process.

For example, MinneAnalytics may later synchronize a current [Evaluation](knowledge/concepts/evaluation.md) with disclosure of peer aggregate information.

Controlled Disclosure does not need to understand Evaluation internals to support that composition.

---

### D-002B-10 — `blindReviewEnabled` is application policy, not concept state

The current product can disable blind-review behavior for a conference/context.

002-B does not add `enabled/disabled` to Controlled Disclosure.

When staged exposure is not desired, the application simply need not create/use the relevant Disclosure relationship for that information/context.

This keeps configuration policy outside the reusable concept.

---

### D-002B-11 — Controlled Disclosure is not conflict management

Future conflict-of-interest/recusal behavior may influence disclosure policy, but the concept does not own:

- conflicts;
- declarations;
- recusals;
- conflict review;
- assignment exclusion.

Those concerns must be rediscovered or composed separately if they become user-facing behavior.

---

### D-002B-12 — Controlled Disclosure's provisional admission is resolved

Formal specification proves a focused independent lifecycle:

1. identify one participant/context/information relationship;
2. establish it as concealed;
3. reveal it when an external condition permits;
4. preserve disclosure as a monotonic historical fact.

This is materially narrower than generic authorization or confidentiality infrastructure.

Controlled Disclosure therefore exits 002-B as **specified**.

---

### D-002B-13 — Feedback is an immutable directed-response record

Feedback records:

- source;
- recipient/audience;
- exact subject;
- communicated content;
- recording time.

Once provided, those fields are immutable under the current concept.

Multiple Feedback items may concern the same subject/recipient; newer Feedback does not overwrite what was previously communicated.

**Rejected alternative:** one mutable “latest feedback” value on a Proposal/Submission. That would destroy communication history and couple Feedback to the current aggregate record.

---

### D-002B-14 — Feedback can target an exact Revision without owning Revision

When feedback concerns a specific mutable-content state, its `SubjectRef` may be that [Revision](knowledge/concepts/revision.md) identity.

Feedback therefore does not need an intrinsic `abstractVersion` field or knowledge of Revision internals.

The exact subject reference is sufficient to preserve historical context.

---

### D-002B-15 — Feedback does not imply Revision

Receiving Feedback does not intrinsically mean:

- a Revision is required;
- a Revision will occur;
- the Feedback is unresolved until a Revision occurs;
- another actor has acknowledged the change.

Those are workflow/application policies.

This rejects the current `AbstractReviewStatus` coupling as a conceptual boundary.

---

### D-002B-16 — Feedback does not own delivery

Feedback is the durable directed response itself.

It does not own:

- email transport;
- notification attempts;
- retries;
- recipient resolution;
- batches/rounds;
- send outcomes.

Those concerns belong to [Dispatch](knowledge/concepts/dispatch.md) or later application composition.

A future synchronization may create a Dispatch to notify a recipient that Feedback exists; that does not make the Feedback record itself a send record.

---

### D-002B-17 — Feedback edit/delete/redaction is not invented

Current evidence does not establish a user-facing lifecycle for editing, retracting, redacting, or deleting already-provided Feedback.

002-B therefore defines only `Provide`.

If legal/privacy/operational requirements later demand redaction or correction semantics, they must be introduced explicitly with clear historical behavior rather than silently mutating the current concept.

---

## 5. Cross-concept boundary result

| Concept | Owns | Explicitly does not own |
|---|---|---|
| [Evaluation](knowledge/concepts/evaluation.md) | evaluator attribution; exact judged subject; opaque judgment; optional private context; latest change provenance | aggregate/ranking; currentness/freshness; Selection; Feedback; disclosure policy; work queues |
| [Controlled Disclosure](knowledge/concepts/controlled-disclosure.md) | participant/context/information exposure relationship; concealed/revealed state; reveal provenance | information contents; RBAC; authentication; confidentiality classification; conflict/recusal; Evaluation |
| [Feedback](knowledge/concepts/feedback.md) | immutable source/recipient/subject/content/time directed response | private notes; Evaluation; required Revision; workflow status; email/delivery; acknowledgement |

The three concepts therefore remain independently understandable despite being heavily composed in the current review workflow.

---

## 6. Implementation-reconciliation observations retained for later

002-B records the following mismatches/signals for later reconciliation without changing application code now.

### IR-002B-01 — Current `Score` combines several concerns

Current realization carries numeric judgment, evaluator identity, private notes, and subject-version applicability fields together.

Later reconciliation should compare that aggregate realization against:

- canonical Evaluation state;
- exact Revision subject references;
- application aggregation/freshness policy.

No immediate schema split is authorized here.

### IR-002B-02 — Current aggregate visibility is computed from Evaluation freshness

Current blind-review helpers expose committee aggregates after the viewer has a current-version score.

Conceptually this is a synchronization/application policy:

```text
current applicable Evaluation condition
    → Reveal(peer aggregate disclosure)
```

It is not an Evaluation invariant and not an intrinsic Controlled Disclosure reveal rule.

### IR-002B-03 — Current identity reveal is not persisted as domain state

The current identity endpoint logs the reveal but does not persist a durable disclosure relation.

Later reconciliation should decide whether the product needs durable disclosure provenance consistent with the canonical concept, especially if conflict/audit requirements become stronger.

002-B does not authorize that implementation change yet.

### IR-002B-04 — Current `PresenterFeedback` already has a strong independent realization

Current implementation persists presenter-visible Feedback separately from `Score.notes`, which is directionally aligned with the concept boundary.

However, the route also changes `AbstractReviewStatus` and sends an email stub.

Later reconciliation should treat those effects as application synchronization/Dispatch concerns rather than Feedback's intrinsic state.

### IR-002B-05 — Current `AbstractReviewStatus` remains an implementation simplification

`FEEDBACK_PENDING`, `REVISED`, and `ACKNOWLEDGED` compose several independent concerns.

002-B reinforces the earlier decision not to promote that enum into the concept model.

---

## 7. Synchronization signals handed forward

002-B preserves but does not canonize these likely relationships:

1. **Revision → Evaluation applicability**  
   A new current Revision may make older Evaluation records non-current for an application aggregate/workflow.

2. **Evaluation → Controlled Disclosure**  
   Recording a qualifying Evaluation may permit or trigger reveal of peer/aggregate information.

3. **Explicit participant action → Controlled Disclosure**  
   A participant may reveal identity/context information when application policy permits.

4. **Feedback → Revision opportunity**  
   Feedback may prompt or unlock a later Revision, but does not intrinsically require one.

5. **Feedback → Dispatch**  
   Providing Feedback may trigger notification delivery through Dispatch.

6. **Archive/lifecycle/authority policy → action eligibility**  
   Application policy may determine whether Evaluation, Reveal, or Feedback actions are currently invokable.

These remain synchronization/application-design inputs for later Phase 002/003 work.

---

## 8. 002-B exit review

### Evaluation

- [x] focused purpose preserved;
- [x] exact judged subject represented;
- [x] evaluator attribution stable;
- [x] numeric `Score` representation abstracted away;
- [x] private context separated from Feedback;
- [x] current/stale/rescore/aggregate state excluded;
- [x] action set remains concept-local.

**Result:** specified.

### Controlled Disclosure

- [x] staged exposure represented as an independent relationship;
- [x] concealed/revealed state is minimal and precise;
- [x] reveal is monotonic;
- [x] reveal policy is external;
- [x] generic RBAC/confidentiality excluded;
- [x] conflict/recusal excluded;
- [x] multiple information items can be independently staged;
- [x] Phase 001 provisional condition resolved.

**Result:** specified.

### Feedback

- [x] source/recipient/subject/content provenance represented;
- [x] directed communication distinguished from private notes;
- [x] exact Revision may be referenced without coupling;
- [x] immutable communication history preserved;
- [x] Revision obligation excluded;
- [x] workflow status excluded;
- [x] transport/delivery excluded.

**Result:** specified.

### Group exit

- [x] canonical nodes updated rather than duplicated in this phase record;
- [x] current implementation used as evidence, not authority;
- [x] derived/workflow state kept out of concept authority;
- [x] synchronization signals retained without premature canonization;
- [x] no implementation/domain refactor performed.

**002-B passes.**

---

## 9. Immediate next subgroup

**002-C — Program Choice, Participation, Scarcity & Representation Intent**

Formalize:

- Selection;
- Withdrawal;
- Capacity;
- Coverage Target.

Coverage Target remains provisionally admitted and must either prove an independent formal specification centered on desired representation or be demoted.