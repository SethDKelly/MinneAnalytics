# 001-D Evidence — Purpose → Candidate Concept Traceability

Status: **Complete for 001-D candidate baseline**  
Purpose: show how every 001-C purpose is represented in the 001-D decomposition without forcing one-purpose-to-one-concept correspondence.

## 1. Interpretation

A purpose may be satisfied by:

- one candidate concept;
- several concepts composed by synchronization/policy;
- an exploratory future candidate;
- no standalone candidate because the purpose is primarily compositional.

That outcome is intentional. A concept should be independently coherent, not merely a container for every purpose statement.

---

## 2. Purpose disposition matrix

| Purpose | 001-D disposition | Candidate(s) / composition | Rationale |
|---|---|---|---|
| PU-001 durable offer | Direct candidate | CC-001 Proposal | Stable offered subject has focused independent meaning. |
| PU-002 preserve mutable history | Direct candidate | CC-002 Revision | Version/change lineage is independently meaningful. |
| PU-003 govern change eligibility | Composition | CC-002 Revision + CC-008 Availability Window? + CC-009 Authorization? + application synchronization/policy | Change preservation and reasons change is allowed should not be conflated. |
| PU-004 independent judgment | Direct candidate | CC-003 Evaluation | Judgment remains distinct from collective choice and disclosure. |
| PU-005 judgment applicability | Composition | CC-003 Evaluation ↔ CC-002 Revision synchronization/policy | Historical judgment remains; current applicability depends on relation to current revision. |
| PU-006 controlled exposure | Direct candidate | CC-004 Disclosure | Exposure/reveal has a purpose separate from judgment. |
| PU-007 originator-directed review response | Direct candidate | CC-005 Feedback | Directed response is separated from private evaluation context. |
| PU-008 consequential choice | Direct candidate | CC-006 Selection | Organizer choice is independently meaningful. |
| PU-009 continuing originator agency | Direct candidate | CC-007 Retraction | Originator rescission remains independent of organizer choice. |
| PU-010 delegated authority | Provisional candidate | CC-009 Authorization | Durable need is clear; concept-vs-policy boundary remains open. |
| PU-011 desired collection composition | Combined candidate | CC-010 Coverage | Tentatively combined with assessment under one coverage purpose. |
| PU-012 legible actual composition | Combined candidate | CC-010 Coverage | Assessment half of Coverage; split remains a 001-E test. |
| PU-013 heterogeneous scarce capacity | Direct candidate | CC-011 Capacity | Scarcity/accounting exists before schedule placement and apart from choice. |
| PU-014 associate shared classifications | Direct candidate | CC-012 Classification | Item association distinct from vocabulary management. |
| PU-015 extend vocabulary | Combined candidate | CC-013 Vocabulary | Participant creation tentatively part of evolving vocabulary lifecycle. |
| PU-016 govern vocabulary | Combined candidate | CC-013 Vocabulary | Steward moderation tentatively shares vocabulary purpose. |
| PU-017 downstream material readiness | Direct candidate | CC-014 Deliverable | Artifact provision/readiness is distinct from selection/publication. |
| PU-018 constrained place/time allocation | Direct candidate | CC-015 Schedule | Placement remains stable across changing heuristics/inputs. |
| PU-019 intentional public exposure | Direct candidate | CC-016 Publication | Public sharing intent differs from readiness and historical access. |
| PU-020 retained read-only completed event | Direct candidate | CC-017 Archive | Internal historical retention differs from publication. |
| PU-021 repeatable operational communication | Combined/provisional candidate | CC-018 Communication | One-concept hypothesis retained with explicit Template/Dispatch split test. |
| PU-022 portable external representation | Provisional candidate | CC-019 Export | Could survive as a concept or collapse to a cross-concept affordance. |
| PU-023 downstream obligation completion | Provisional candidate | CC-020 Obligation | Current example is narrow but underlying requirement state is source-independent. |
| PU-024 external authoritative facts | Composition/future boundary | Synchronizations/adapters into CC-020 Obligation, CC-015 Schedule, CC-011 Capacity, future attendee concepts; provenance retained | Third-party/system source is not promoted to a user-facing concept yet. |
| PU-025 session-specific audience response | Generic/future use of candidate | CC-005 Feedback | Tests Feedback genericity across actor pairs; future-only behavior. |
| PU-026 reconstruct why current state exists | Dual-layer | intrinsic histories within owning concepts + exploratory CC-021 Audit Trail | Global audit must not replace histories required by individual concepts. |

---

## 3. Purpose coverage result

All 26 001-C purpose candidates have an explicit 001-D disposition.

### Direct or combined candidate coverage

PU-001, PU-002, PU-004, PU-006 through PU-023, and future PU-025 map to one or more candidate concepts.

### Primarily compositional purposes

- PU-003 — mutable-content eligibility;
- PU-005 — judgment applicability after revision;
- PU-024 — externally authoritative facts.

These are deliberately represented through relationships/policy among concepts rather than standalone “glue concepts.”

### Dual-layer historical purpose

PU-026 is represented both:

- intrinsically, where concept history is required for correct behavior;
- exploratorily through CC-021 Audit Trail for future cross-concept organizational activity history.

---

## 4. 001-B inherited noun disposition

This section ensures the candidate set is not merely a renamed implementation model.

| Inherited noun / structure | 001-D disposition |
|---|---|
| `Submission` | Not a concept boundary. Offered subject → CC-001 Proposal; revisions, selection, retraction, classification, obligations, deliverables, etc. remain separate. |
| `ProgramStatus` | Not a concept lifecycle. Organizer decision → CC-006 Selection; originator withdrawal → CC-007 Retraction; undecided/current effective UI state may be derived. |
| `AbstractReviewStatus` | Not a concept lifecycle. Revision → CC-002; feedback → CC-005; evaluation freshness → CC-002↔CC-003 composition; acknowledgement unresolved. |
| `Score` | Current representation of CC-003 Evaluation plus subject/revision reference; numeric scale is not the concept purpose. |
| `Score.notes` | Private context within Evaluation, not Feedback. |
| `PresenterFeedback` | Current specialized realization of CC-005 Feedback. |
| `Theme` | Decomposed: CC-013 Vocabulary term + CC-012 Classification association + CC-010 Coverage policy/assessment. |
| `targetMin` / `targetMax` | Candidate state signal for CC-010 Coverage, not Vocabulary. |
| theme/technicality heatmaps | Representation of CC-010 Coverage, not concepts. |
| `isSponsorSession` | Current class/property affecting CC-011 Capacity accounting; no Sponsor concept inferred. |
| capacity widget/formula | Representation/configuration of CC-011 Capacity; seed numbers excluded. |
| `DeckStatus` | Current realization signal for CC-014 Deliverable readiness, not a canonical lifecycle. |
| public deck archive | CC-016 Publication, not CC-017 Archive. |
| archived conference/history | CC-017 Archive, not CC-016 Publication. |
| Communications tab | UI surface for CC-018 Communication; not a boundary. |
| `EmailTemplate` / batches / send records | Candidate state split test inside CC-018 Communication. |
| CSV export | Current realization of CC-019 Export; CSV format excluded from concept. |
| `vipRegistered` | Current realization signal for CC-020 Obligation. |
| Sched/Eventbrite/Cvent integrations | Synchronization/engineering mechanisms supplying facts; no provider-specific concept. |
| `/schedule` builder | UI realization of CC-015 Schedule. |
| `BOARD`, `CHAIR`, `ADMIN` | Organizational participation/authority contexts; not concept names. They may constrain actions through CC-009 Authorization or application policy. |
| opaque tokens / future SSO | Authentication realization; explicitly outside concept set. |
| `Conference` | Application/event context and scoping object; no broad concept accepted. |

---

## 5. Candidate merge/split tests carried to 001-E

| Test | Candidates | Question |
|---|---|---|
| MT-001 | CC-002 Revision | Independent concept or intrinsic Proposal history? |
| MT-002 | CC-004 Disclosure | Independent concept or Evaluation policy? |
| MT-003 | CC-005 Feedback | Generic feedback or split review/audience concepts? |
| MT-004 | CC-008 Availability Window | Concept or application configuration/policy? |
| MT-005 | CC-009 Authorization | Concept or application policy/synchronization? |
| MT-006 | CC-010 Coverage | One target+assessment concept or two concepts? |
| MT-007 | CC-013 Vocabulary | One contribution+governance concept or split? |
| MT-008 | CC-018 Communication | One concept or Template + Dispatch/Campaign? |
| MT-009 | CC-019 Export | Concept or cross-concept affordance? |
| MT-010 | CC-020 Obligation | Generic enough beyond VIP registration? |
| MT-011 | CC-021 Audit Trail | Real concept, future concept, or provenance tenet only? |

---

## 6. Traceability gate

001-D is traceable enough for 001-E when:

- every 001-C purpose has a disposition;
- every candidate can cite at least one purpose;
- compositional purposes are explicitly represented rather than silently dropped;
- implementation nouns have a documented disposition;
- provisional candidates have a specific falsification question.

This artifact satisfies that gate for the 001-D baseline.
