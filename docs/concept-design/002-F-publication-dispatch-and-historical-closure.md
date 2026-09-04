# 002-F — Publication, Dispatch & Historical Closure

Status: **Complete**  
Concept model maturity: **v0 — formal specification in progress**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-G — Discovery Consolidation & Concept Candidate Gate](001-G-discovery-consolidation-and-concept-candidate-gate.md), [002-B](002-B-evaluation-disclosure-and-directed-response.md), [002-C](002-C-program-choice-participation-scarcity-and-representation-intent.md), and [002-E](002-E-deliverable-and-scheduling-execution.md)

## 1. Purpose

002-F formally specifies:

- [Publication](knowledge/concepts/publication.md)
- [Dispatch](knowledge/concepts/dispatch.md)
- [Archive](knowledge/concepts/archive.md)

The canonical concept nodes own current normative purpose, operational principle, abstract state, actions, intrinsic invariants, derived observations, and synchronization boundaries.

This phase record preserves only the design decisions, rejected alternatives, implementation-reconciliation observations, deferred synchronization questions, and exit review needed to audit those specifications.

Documentation authority remains governed by [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md), and implementation remains evidence rather than concept authority under [Concept Design Authority](knowledge/rules/concept-design-authority.md).

---

## 2. Entry conditions

Publication and Archive entered 002-F as admitted Phase 001 concepts.

Dispatch entered as the **last remaining admitted-provisional concept**, with the explicit condition that formal specification must preserve a performed-send center and must not expand into:

- reusable template authoring;
- provider transport;
- recipient-eligibility logic;
- broad Communication;
- recipient-directed review Feedback.

Phase 001 also established two terminology boundaries that 002-F had to preserve:

1. the historical phrase “slide archive” refers to public Publication behavior, not the internal Archive concept;
2. operational Dispatch history is distinct from the semantic content/purpose of Feedback.

The current implementation was consulted as evidence. In particular, `decksPublished`, `deckShareable`, `publicId`, `ConferenceStatus`, `archivedAt`, `EmailTemplate`, `ConferenceEmailBatch`, `EmailSendRecord`, template keys, email addresses, provider stubs, merge fields, and the `publish-archive` route were not treated as formal-state templates.

---

## 3. Formal-specification method

Each concept had to demonstrate:

1. independent state and concept-local actions;
2. explicit current-state versus historical-state semantics where public exposure or performed communication cannot be truthfully erased;
3. no duplication of Deliverable readiness, Selection, sharing/rights policy, or application lifecycle state;
4. provider/storage/UI neutrality;
5. clear separation between public exposure and internal closure;
6. clear separation between message semantics/content generation and the performed send;
7. explicit treatment of replacement/change over time;
8. no invention of generic communication, content-management, or conference-lifecycle infrastructure.

The subgroup was tested against three failure modes:

> **Publication must not become “anything visible outside the app.” Dispatch must not become “all communication.” Archive must not become “Conference status.”**

---

# 4. Publication design decisions

## D-002F-01 — Publication binds exposure to an exact MaterialRef

Publication intentionally refers to the exact material state that is made public.

This is important because a mutable source may later change. If public exposure merely points to “the current deck” or “latest artifact,” replacing that source can silently change public meaning without an explicit Publication action.

The formal Publication identity therefore has stable:

- `MaterialRef`;
- `PublicSurfaceRef`.

A replacement material state is published through a new Publication identity rather than by mutating `material(p)`.

---

## D-002F-02 — Publication current availability is reversible, historical exposure is not erasable

Publication supports:

- `Publish`;
- `Unpublish`;
- `Republish`.

Each availability transition appends immutable PublicationState history.

Unpublishing ends current public availability but cannot make the historical proposition “this material was previously public” false.

This differs from [Controlled Disclosure](knowledge/concepts/controlled-disclosure.md), where reveal to a participant is monotonic because the participant cannot unsee information. Publication current availability can be reversed, but its exposure history remains durable.

---

## D-002F-03 — Publication eligibility is composition, not Publication-owned state

The current application derives deck publication eligibility from facts including:

- organizer Selection;
- deck readiness;
- per-session shareability;
- event-level publication state;
- existence of a deck file.

Those remain application-composition inputs.

Publication itself does not duplicate:

- Selection;
- Withdrawal;
- Deliverable readiness;
- author/presenter sharing consent;
- rights/legal policy;
- file existence/storage state.

The action may be offered only when those external conditions are satisfied, but they are not intrinsic Publication state.

---

## D-002F-04 — Deliverable replacement must not silently repoint a Publication

002-E established version-specific Deliverable readiness.

002-F extends that precision downstream: when a ready ArtifactVersion is published, the Publication should refer to that exact ArtifactVersion or another immutable public material representation.

If a replacement ArtifactVersion later becomes current:

- the prior Publication continues to describe the exact material that was exposed;
- application policy can unpublish it;
- the replacement may be published separately after its own readiness/eligibility is established.

This prevents stale readiness and mutable “latest” pointers from collapsing into Publication.

---

## D-002F-05 — Collection publication is composition unless the collection itself is an exact MaterialRef

The current product has a conference-level `decksPublished` switch and dynamically derives which deck items appear in the public collection.

002-F does not introduce a separate `PublicationCollection` concept.

Two implementation strategies remain compatible with the concept:

1. explicit item Publications within a public surface; or
2. a Publication whose `MaterialRef` identifies an immutable collection snapshot.

A dynamically changing query result should not be treated as an immutable published material identity without making that behavior explicit.

---

## D-002F-06 — Public delivery mechanics are outside Publication

URLs, public IDs, file reads, HTTP routes, CDN behavior, caching, download headers, and storage paths are realization concerns.

They implement access to currently published material but do not define Publication semantics.

---

# 5. Dispatch design decisions

## D-002F-07 — Dispatch owns performed-send evidence, not reusable message authoring

Dispatch formalizes a completed operational communication action through:

- Batch identity;
- semantic context/key/round;
- initiating actor/time;
- one immutable SendRecord per recipient actually sent;
- exact endpoint and message instance for that recipient.

A reusable template can help produce `MessageRef` values, but the template lifecycle is not Dispatch state.

This resolves the Phase 001 concern that Communication might become an umbrella concept.

---

## D-002F-08 — Exact rendered message evidence matters more than mutable template identity

A performed-send history should be able to answer:

> What exact message was sent to this recipient?

A mutable template key alone cannot reliably answer that after later template edits.

The formal SendRecord therefore references the exact immutable message instance supplied for that recipient.

This may be represented as stored content, a content-addressed object, immutable message snapshot, or another implementation mechanism. The concept does not require a specific persistence format.

---

## D-002F-09 — Semantic duplicate protection is `(context, key, round, recipient)`

Dispatch uses an application-supplied `DispatchKey` and `RoundRef` to distinguish semantic communication occurrences.

Within the same semantic `(context, key, round)`:

- a recipient has at most one SendRecord;
- repeated attempts recognize that recipient as already sent;
- already-sent recipients are skipped rather than contacted again accidentally.

A later round can intentionally contact the same recipient again.

This preserves the historical requirement for dedupe while allowing deliberate later rounds.

---

## D-002F-10 — Recipient identity and endpoint are distinct

Duplicate semantics attach to stable `RecipientRef`, while SendRecord also preserves the actual `EndpointRef` used for the performed send.

Changing an email address therefore does not make a recipient “new” for the same semantic round, while historical inspection can still identify the address/endpoint actually targeted.

This keeps Dispatch provider-neutral and avoids equating person/participant identity with an email string.

---

## D-002F-11 — Preview is derived observation, not a persisted draft lifecycle

The accepted operational principle includes inspection before commitment.

Dispatch therefore supports a non-mutating `Preview` observation over supplied candidate deliveries, showing:

- candidate messages/endpoints;
- already-sent recipients;
- sendable recipients.

002-F does not invent persistent Draft, Approval, or Template-editing state merely because a UI can preview a send.

---

## D-002F-12 — Recipient eligibility remains upstream composition

Dispatch does not decide who should receive:

- a deck call;
- a decline notice;
- an attendee reminder;
- a feedback request;
- another operational communication.

Application composition resolves the audience from Selection, Deliverable, Withdrawal, registration/attendance facts, lifecycle state, or other sources and supplies the result to Dispatch.

This prevents Dispatch from embedding MinneAnalytics-specific business rules.

---

## D-002F-13 — Provider delivery confirmation is not yet intrinsic

The current implementation records that a send was performed and invokes an email stub; it does not model provider acknowledgement, bounce, retry, delivery, or read receipts.

The formal `Dispatch` action therefore represents committed handoff to the delivery mechanism and preserves performed-send evidence.

If future users need operational delivery tracking, retry queues, bounce handling, or delivery receipts as first-class workflow, that should be explicitly designed rather than inferred into v0.

---

## D-002F-14 — Dispatch provisional admission is resolved positively

Dispatch now demonstrates an independent lifecycle and invariant set:

- performed Batch state;
- immutable per-recipient SendRecords;
- exact message/endpoint evidence;
- semantic round identity;
- intrinsic same-round duplicate protection;
- provider neutrality;
- external recipient eligibility/template generation.

Dispatch therefore exits 002-F as **specified**, resolving the final Phase 001 provisional condition.

---

# 6. Archive design decisions

## D-002F-15 — Archive owns closure, not a general application lifecycle

Archive answers one narrow question:

> Has this working context been closed into retained internal history?

It does not model setup/draft/active/etc. states.

A context not archived by Archive is merely `notArchived`; it is not intrinsically `ACTIVE`.

This prevents the current `ConferenceStatus` enum from becoming the concept boundary.

---

## D-002F-16 — Archive is monotonic in v0

The accepted purpose is closure into retained history.

Archive therefore has one intrinsic action:

`Archive(context, actor, at)`

and no `Unarchive`, `Restore`, or `Reopen` action.

Once recorded, the closure actor/time are immutable.

The current implementation can move a conference away from `ARCHIVED` and clear `archivedAt`; that behavior is retained as a reconciliation question rather than accepted as concept semantics without an independently recovered reopen purpose.

---

## D-002F-17 — Archive does not snapshot or own child concept state

Archive does not duplicate Proposal, Evaluation, Selection, Deliverable, Schedule, Dispatch, Publication, or other state into a universal archive object.

Instead:

- concept-local histories remain with their concepts;
- Archive records closure of the containing working context;
- application synchronization can block ordinary mutations while preserving historical inspection.

This avoids a new historical god object and remains consistent with the Phase 001 provenance model.

---

## D-002F-18 — Internal Archive and public Publication are orthogonal

Archive does not publish anything.

Publication does not imply closure.

Depending on application policy:

- material may be public before Archive;
- public material may remain published after Archive;
- material may be published after Archive;
- Archive may contain no public material at all.

The two concepts therefore require synchronization/policy only where MinneAnalytics wants a specific event workflow.

---

# 7. Cross-concept boundary result

| Concept | Owns | Explicitly does not own |
|---|---|---|
| [Publication](knowledge/concepts/publication.md) | exact public MaterialRef; public surface; publish/unpublish/republish history | readiness; Selection; share consent; storage/URLs; internal closure |
| [Dispatch](knowledge/concepts/dispatch.md) | performed Batch/SendRecord history; exact recipient endpoint/message; semantic round dedupe | templates; Feedback; recipient eligibility; provider delivery pipeline; business rules |
| [Archive](knowledge/concepts/archive.md) | monotonic internal closure fact and provenance | public access; child concept state; backup/retention infrastructure; general lifecycle enum |

The three concepts are independently understandable and operable without accessing one another's internal representations.

---

# 8. Implementation-reconciliation observations retained for later

## IR-002F-01 — Current deck publication uses a mutable collection gate

`Conference.decksPublished` controls public archive availability globally, while actual items are dynamically derived from current Selection, deck status, shareability, and latest-file lookup.

Formal Publication instead binds exposure to exact MaterialRefs.

Later reconciliation must decide whether the application should persist explicit item Publication state, publish an immutable collection snapshot, or intentionally retain a dynamic collection policy while preserving exact public-material history elsewhere.

---

## IR-002F-02 — Old deck public IDs may remain authorized more broadly than the current listing implies

The public archive listing selects only the latest deck file, but `loadDeckFileForPublic(publicId)` authorizes a requested DeckFile by checking the Submission/conference's current publication/shareability/approval state rather than verifying that the requested file is the current published artifact.

As a result, a known older `publicId` may remain accessible while the submission is currently approved/shareable and its deck status is approved.

Formal Publication makes the intended exposed MaterialRef explicit. Later implementation reconciliation should decide whether access to historical file versions is intentional or should be constrained to explicitly published material.

---

## IR-002F-03 — Current public “archive” terminology conflicts with canonical Archive

The `publish-archive` route is public Publication behavior.

Canonical `Archive` now means retained internal closure/history only.

Implementation/UI naming may need clarification later to avoid reintroducing terminology drift.

---

## IR-002F-04 — Current Dispatch persistence is a strong boundary match

`ConferenceEmailBatch` and `EmailSendRecord` already preserve:

- batch identity;
- template/semantic key;
- round;
- initiating actor;
- recipient identity/reference;
- destination email;
- send time.

This provides strong implementation evidence that performed operational send history is independently meaningful.

---

## IR-002F-05 — Current send history does not preserve exact rendered message content

`EmailSendRecord` stores the template key/round/recipient but not the exact rendered subject/body sent.

Because templates are mutable, later template edits can make historical reconstruction ambiguous.

Formal Dispatch requires an immutable exact `MessageRef` per SendRecord. Later reconciliation should add an appropriate message snapshot/reference without necessarily duplicating large content inefficiently.

---

## IR-002F-06 — `includeAlreadyEmailed` conflicts with same-round persistence semantics

The current send API can request `includeAlreadyEmailed`, but `EmailSendRecord` has uniqueness constraints per conference/template/round/submission or attendee.

Attempting to resend the same recipient in the same semantic round therefore conflicts with the durable uniqueness model unless implementation behavior changes elsewhere.

Formal Dispatch resolves the semantic ambiguity by treating same-round repeated attempts as idempotent and requiring a distinct `RoundRef` for intentional repeat contact.

---

## IR-002F-07 — Current Archive implementation is broader and reversible

`ConferenceStatus` includes `DRAFT`, `ACTIVE`, and `ARCHIVED`; changing status away from `ARCHIVED` clears `archivedAt`.

Formal Archive is narrower and monotonic.

Later reconciliation must determine whether reopening archived contexts is a true product requirement. If yes, it should be modeled deliberately rather than by mutating away historical closure evidence.

---

## IR-002F-08 — Current archive mutation guard supports closure synchronization

Many current mutation paths use `assertConferenceAcceptsMutations`, which permits mutation only while conference status is `ACTIVE`.

That implementation pattern is compatible with using Archive/lifecycle state as an application-level mutation gate, although formal Archive itself does not own those neighboring actions.

---

# 9. Synchronization signals carried forward

002-F does not yet make these canonical synchronizations, but the formal concept set now supports precise later composition:

1. **Deliverable.ready + sharing/rights policy → Publication eligibility**.
2. **Publication material choice → exact Deliverable ArtifactVersion or other exact MaterialRef**.
3. **Selection/Withdrawal changes → possible Publication unpublish/ineligibility policy**.
4. **Archive → mutation gating** for concepts scoped to the archived context.
5. **Archive ↔ Publication policy** — independent by default; event policy may coordinate timing.
6. **Deliverable outstanding state → Dispatch recipient eligibility**.
7. **Selection/Withdrawal/registration state → Dispatch recipient eligibility**.
8. **Feedback creation → optional notification Dispatch** without merging Feedback into Dispatch.
9. **Archive/lifecycle state → Dispatch eligibility** for new operational sends.
10. **Reusable template/message-rendering subsystem → exact MessageRef input to Dispatch**.
11. **Dispatch SendRecord → operational communication history/projections**.
12. **Publication/Archive/Dispatch → export/report projections** without creating an Export concept.

These belong in 002-G synchronization consolidation rather than individual concept invariants.

---

# 10. Rejected concept additions

002-F does not introduce:

- Public Archive;
- Publication Collection;
- Shareability;
- Rights Manager;
- Website;
- Public Link;
- Communication;
- Email;
- Email Template;
- Message Draft;
- Campaign;
- Delivery Provider;
- Delivery Receipt;
- Notification;
- Retry Queue;
- Conference Lifecycle;
- Retention Policy;
- Backup;
- Restore/Reopen.

Some are implementation/support structures; some are policy; others remain future concept signals requiring independently evidenced purpose and lifecycle.

---

# 11. Exit review

## Publication

- focused public-exposure purpose: **pass**
- exact material identity: **pass**
- reversible current availability with durable history: **pass**
- separation from Deliverable/Archive: **pass**
- implementation neutrality: **pass**

**Result: specified.**

## Dispatch

- focused performed-send purpose: **pass**
- durable Batch/SendRecord state: **pass**
- semantic dedupe/round behavior: **pass**
- exact message/endpoint evidence: **pass**
- separation from templates/eligibility/Feedback/provider: **pass**
- provisional-condition resolution: **pass**

**Result: specified; Phase 001 provisional condition resolved positively.**

## Archive

- focused internal-closure purpose: **pass**
- monotonic retained-history semantics: **pass**
- separation from Publication: **pass**
- no child-state duplication/god object: **pass**
- implementation neutrality: **pass**

**Result: specified.**

---

# 12. 002-F exit decision

**002-F passes.**

All 17 concepts admitted by the Phase 001-G gate are now formally specified, and all four Phase 001 provisional admissions have resolved positively:

- Availability Window — resolved in 002-A;
- Controlled Disclosure — resolved in 002-B;
- Coverage Target — resolved in 002-C;
- Dispatch — resolved in 002-F.

The formal model now cleanly distinguishes:

- operational readiness from public exposure;
- exact public material from mutable source state;
- current public availability from historical exposure;
- recipient-directed Feedback from performed operational Dispatch;
- reusable message generation from send history;
- public Publication from internal Archive closure;
- Archive closure from a broad conference lifecycle.

No application/domain refactoring is authorized by this phase.

The next subgroup is **002-G — Formal Specification Consolidation & Synchronization Handoff**.