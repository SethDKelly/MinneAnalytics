# 001-B Evidence — Historical Intent Ledger

Status: **Complete for 001-B baseline**  
Purpose: normalized record of historically supported behavioral intent for use by 001-C and later discovery phases.

## 1. How to use this ledger

Each entry records a historically supported need, policy, or behavioral distinction without asserting a final Concept Design boundary.

The `Purpose signal` column is deliberately phrased as a problem or desired outcome rather than as a concept name.

Confidence means confidence that the repository genuinely intended the behavior—not confidence that the current implementation model is conceptually correct.

---

## 2. Core workflow intent

| ID | Recovered intent | Actor(s) | Purpose signal | Evidence | Confidence |
|---|---|---|---|---|---|
| IL-001 | A prospective speaker can offer a presentation for consideration. | Submitter / presenter | Provide a way for outside participants to offer candidate program content. | Initial implementation plan `2a16e25...` | High |
| IL-002 | Committee participants can record independent numeric judgments and private notes about candidate talks. | Evaluator | Preserve individual committee judgment for later comparison and decision support. | Initial plan; current review workflow | High |
| IL-003 | Program decision makers can compare candidate talks while reasoning about finite program capacity. | Board / program authority | Choose a feasible set of sessions rather than evaluating candidates in isolation. | Initial plan; capacity behavior | High |
| IL-004 | Candidate talks may be accepted, declined, retained as backups, and backups may later be promoted. | Program authority | Preserve decision flexibility while constructing the program. | Initial plan | High |
| IL-005 | A presenter may withdraw even after a talk has been approved. | Presenter | Preserve originator agency after committee action. | Initial plan and current behavior | High |
| IL-006 | Accepted presenters can provide presentation materials for committee handling. | Presenter | Deliver the artifact required for the eventual conference session. | Initial plan/current deck workflow | High |
| IL-007 | Committee members can assess whether submitted presentation materials are ready, require attention, or are approved. | Board / co-chair | Establish operational readiness of presentation materials separately from talk selection. | Initial plan/current deck workflow | High |
| IL-008 | Selected talks can be assigned to rooms/time slots automatically and then manually rearranged. | Program planner | Produce a usable schedule while retaining human control over final placement. | Initial plan/current schedule builder | High |

---

## 3. Authority and governance intent

| ID | Recovered intent | Actor(s) | Purpose signal | Evidence | Confidence |
|---|---|---|---|---|---|
| IL-009 | More people may evaluate talks than are allowed to approve/decline or construct the schedule. | Board / co-chair | Separate participation in judgment from authority to make consequential program decisions. | Commit `57892705...` | High |
| IL-010 | Deck review authority may be shared more broadly than program approval authority. | Board / co-chair | Delegate operational review without delegating all program governance. | Commit `57892705...` | High |
| IL-011 | Site administration is intentionally separate from ordinary board/co-chair conference work. | Site administrator | Manage conference configuration and governance without conflating it with committee evaluation. | Commit `8439ffca...`; current architecture | High |
| IL-012 | Submission availability is controlled by configurable conference windows and lifecycle state. | Administrator / submitter | Allow or prevent participation according to event timing and lifecycle. | Commit `8439ffca...`; current behavior | High |
| IL-013 | Archived conferences remain available for authorized historical review while ordinary mutations stop. | Board / administrator | Preserve institutional history after an event ceases to be active. | Commit `8439ffca...`; current architecture | High |
| IL-014 | Current token-based access is a prototype mechanism, not durable identity intent. | Committee users / presenter | Establish who is acting without binding the behavioral model to opaque URLs. | Current roadmap and architecture | High |
| IL-015 | Future governance should support explicit conflict-of-interest declaration/exclusion. | Evaluator / program authority | Prevent conflicted evaluators from participating in inappropriate judgments. | Current roadmap | Medium-high (future) |

---

## 4. Iteration, history, and evaluation applicability

| ID | Recovered intent | Actor(s) | Purpose signal | Evidence | Confidence |
|---|---|---|---|---|---|
| IL-016 | Presenters can revise selected submission content while policy permits. | Presenter | Correct or improve proposed content without creating an unrelated replacement submission. | v2 plan; commit `54ebf8bc...` | High |
| IL-017 | Previous versions of revised content remain available as immutable historical snapshots. | Presenter / evaluator / board | Preserve what existed when earlier actions or judgments were made. | v2 plan; commit `02acafda...` | High |
| IL-018 | Committee actors can see which version they are reviewing and inspect revision history/differences. | Evaluator / board | Make change over time visible rather than silently replacing prior content. | Commit `02acafda...` | High |
| IL-019 | A score records the version of the abstract that was evaluated. | Evaluator | Preserve the context in which a judgment was formed. | v2 plan; commit `5b59f44a...` | High |
| IL-020 | A prior score may remain historically stored but stop contributing to the current aggregate after the content changes. | Evaluator / board | Distinguish historical judgment from currently applicable judgment. | v2 plan; commit `5b59f44a...` | High |
| IL-021 | A reviewer whose prior score is stale is surfaced for rescoring. | Evaluator | Bring changed material back to the evaluator's attention when prior judgment no longer applies to the current version. | commit `5b59f44a...` | High |
| IL-022 | The board can acknowledge that revised content has been reviewed. | Board | Record committee recognition of a change independently of whether every previous score is preserved or replaced. | v2 plan/current behavior | Medium-high |
| IL-023 | Approved-talk editing is currently locked but was explicitly left open for future board-authorized unlocking. | Presenter / board | Allow controlled post-selection changes without treating the demo lock as a permanent invariant. | final v2 plan; current roadmap | High for future intent |

---

## 5. Feedback and information-exposure intent

| ID | Recovered intent | Actor(s) | Purpose signal | Evidence | Confidence |
|---|---|---|---|---|---|
| IL-024 | Private score notes are not presenter-visible feedback. | Evaluator / presenter | Allow private evaluation context without accidentally communicating it to the proposer. | v2 problem statement; commit `49ecb748...` | Very high |
| IL-025 | Committee members can send presenter-visible feedback independently of their private score notes. | Evaluator / presenter | Tell presenters what should change or provide general guidance without conflating communication with scoring rationale. | v2 plan; commit `49ecb748...` | Very high |
| IL-026 | Presenter identity is hidden by default during bias-reduced review. | Evaluator | Reduce the influence of identity/context before substantive evaluation. | v2 plan; commit `72988900...` | High |
| IL-027 | Identity can be explicitly revealed when context is needed. | Evaluator | Support legitimate contextual/conflict checks without abandoning bias-reduction policy entirely. | v2 plan; commit `72988900...` | High |
| IL-028 | Committee aggregates are withheld from a reviewer until that reviewer has recorded their own current judgment. | Evaluator / board | Reduce anchoring on others' scores before independent judgment. | v2 plan; commit `72988900...`; current behavior | High |
| IL-029 | Bias-reduced review can be disabled per conference in the current product. | Administrator / evaluator | Treat disclosure behavior as configurable policy rather than an unconditional property of evaluation. | v2/current architecture | High |

---

## 6. Classification, vocabulary, and program-composition intent

| ID | Recovered intent | Actor(s) | Purpose signal | Evidence | Confidence |
|---|---|---|---|---|---|
| IL-030 | Candidate talks can be associated with one or more themes/categories. | Presenter / board | Describe program subject matter in a way that supports discovery and composition analysis. | commit `8439ffca...`; current behavior | High |
| IL-031 | Administrators can manage the available conference taxonomy and representation targets. | Administrator | Govern shared vocabulary and desired program coverage. | commit `8439ffca...` | High |
| IL-032 | Presenters can propose new theme labels that other submitters can reuse. | Presenter | Allow the vocabulary to evolve from participant input rather than requiring all labels to be predeclared centrally. | v2 plan; commit `4f0c9d28...` | High |
| IL-033 | Administrators can moderate community-proposed labels after creation. | Administrator | Preserve governance while permitting decentralized vocabulary creation. | commits `4f0c9d28...`, `44ef2787...` | High |
| IL-034 | Removing a theme from future selection should not destroy its historical association with already-tagged talks. | Administrator / board | Preserve historical interpretability when the vocabulary changes. | v2 plan; community-theme implementation | High |
| IL-035 | Theme targets and technicality distributions provide decision support for program composition. | Board / co-chair | Help construct a balanced/representative program rather than selecting solely by aggregate score. | commit `8439ffca...`; v2 heatmap work | High |
| IL-036 | Exceeding a theme target produces a warning rather than automatically prohibiting approval. | Board | Inform human program judgment without making representation targets the sole decision authority. | commit `8439ffca...`; current behavior | Medium-high |
| IL-037 | Sponsor sessions are explicitly identifiable and affect capacity accounting differently from community sessions. | Board | Distinguish different classes of program commitments when reasoning about available capacity. | initial capacity plan; commit `4cb46a01...` | High |

---

## 7. Publication, communication, and operational continuity

| ID | Recovered intent | Actor(s) | Purpose signal | Evidence | Confidence |
|---|---|---|---|---|---|
| IL-038 | Post-conference publication is controlled separately from talk approval. | Board / public audience | Decide which ready materials become publicly accessible after the event. | commit `7a994056...`; current archive behavior | High |
| IL-039 | Individual approved sessions can be excluded from public publication even when the archive itself is published. | Board / presenter / public | Respect per-session sharing constraints within a broader published collection. | commit `7a994056...` | High |
| IL-040 | Standard communications can be represented as reusable templates with merge fields. | Board | Send repeatable event communications consistently. | v2 plan; commit `92991771...` | High |
| IL-041 | A communication action has an eligible recipient set that can be previewed before send. | Board | Know who will receive an operational message before committing it. | v2 plan/current Communications workflow | High |
| IL-042 | Communication sends preserve per-conference batch/recipient history. | Board / audit | Know what was sent, to whom, and when. | commit `92991771...` | High |
| IL-043 | Decline communications can occur in multiple rounds and avoid duplicate delivery within the same round. | Board | Support incremental program decisions without repeatedly notifying the same recipients accidentally. | commit `92991771...` | High |
| IL-044 | Delivery transport is replaceable; current console/stub delivery is not the durable behavior. | Board / operations | Preserve communication semantics independently of email-provider engineering. | v2 plan/current roadmap | High |
| IL-045 | CSV/reporting exports expose important conference state/history to external operational workflows. | Board / operations | Carry conference decisions and historical context outside the interactive UI. | initial/v2 exports; roadmap reporting API | Medium-high |

---

## 8. Registration, attendance, and future audience intent

| ID | Recovered intent | Actor(s) | Purpose signal | Evidence | Confidence |
|---|---|---|---|---|---|
| IL-046 | Organizers track whether approved presenters completed an associated VIP/event registration step. | Board / co-chair / presenter | Detect missing operational obligations after program selection. | commit `5d9f017b...` | Medium-high |
| IL-047 | Future integration may obtain registration state from external systems rather than manual toggles. | Operations / external system | Avoid duplicating an operational fact already authoritative elsewhere. | current roadmap | Medium (future) |
| IL-048 | Future schedule operations may consume attendee session choices, room capacity, attendance, and waitlist data from Sched. | Board / attendee / external system | Make scheduling decisions informed by actual demand rather than only internal program attributes. | historical backlog; current roadmap | Medium-high (future) |
| IL-049 | Future in-room audience feedback is intentionally distinct from committee feedback and post-event communications. | Attendee / board | Capture immediate audience reaction tied to a session/room/time. | historical backlog; current roadmap | Medium-high (future) |
| IL-050 | External systems may be authoritative for some operational facts while MinneAnalytics remains authoritative for others. | Operations / external system | Compose conference workflow across system boundaries without assuming all truth originates locally. | Sched backlog/roadmap | Medium-high (future) |

---

## 9. Provenance and audit intent

| ID | Recovered intent | Actor(s) | Purpose signal | Evidence | Confidence |
|---|---|---|---|---|---|
| IL-051 | Important historical facts are repeatedly preserved instead of overwritten: revisions, stale scores, removed themes, send history, archived conferences. | Board / presenter / administrator | Reconstruct why current state exists and what earlier actors saw/did. | repeated across v2/current behavior | Very high |
| IL-052 | Future work explicitly calls for an append-only committee activity audit. | Board / administrator | Extend traceability beyond the histories already preserved in feature-specific workflows. | current roadmap | High for future intent |

---

## 10. Explicit non-intent / demo accommodations

These entries are deliberately included so 001-C does not accidentally turn them into needs.

| ID | Observation | Why it is excluded from durable intent |
|---|---|---|
| IL-X01 | Approval/decline creates synthetic high/low scores in demo data/flows. | Commit message explicitly says this exists for demo consistency. It does not establish a real relationship where decisions generate evaluations. |
| IL-X02 | Committee and presenter access is represented by long opaque URL tokens. | Roadmap explicitly plans structured identity/SSO for committee access. Token shape is a demo authentication mechanism. |
| IL-X03 | SQLite and local upload storage are used in the demo. | Production roadmap/deployment work treats data/storage realization as replaceable. |
| IL-X04 | Email is delivered to console through a stub. | Provider replacement is explicitly planned; durable intent lies in communication semantics/history. |
| IL-X05 | Data Tech seed values use particular room counts, sponsor ranges, people, talks, and conference years. | Demo fixtures/examples are not general product requirements. |
| IL-X06 | Current tabs/pages/routes partition workflows in a particular way. | UI/routing structure is implementation evidence, not user-need authority. |
| IL-X07 | Heatmaps use particular matrices/color scales. | Visualization form is not the same thing as the underlying program-composition need. |

---

## 11. Handoff to 001-C

001-C should transform this ledger into:

1. actor-neutral and actor-specific problem statements;
2. explicit actor needs;
3. candidate **purposes** phrased without implementation structure;
4. overlap/duplication analysis among purposes;
5. scope boundaries showing what each purpose does **not** attempt to solve.

001-C must not mechanically convert each IL entry into a concept. Multiple ledger entries may support one purpose; one ledger entry may reveal several purposes; some entries may ultimately be application policy rather than concept behavior.
