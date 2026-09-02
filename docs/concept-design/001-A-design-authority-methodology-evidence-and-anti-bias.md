# 001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules

Status: **Active discovery specification**  
Concept model maturity: **v0 — discovery**  
Branch: **`concept-design/v0-discovery`**

## 1. Purpose

This document establishes the rules under which MinneAnalytics will be retrofitted with a Daniel Jackson–style Concept Design model.

The repository already contains working software, implementation documentation, historical planning material, commit history, and evolving product behavior. Those artifacts are valuable evidence, but they must not silently determine the conceptual design.

The goal of this phase is therefore not to redescribe the current application in conceptual language. The goal is to recover the problems the application is intended to solve, discover the concepts that best address those problems, and only later compare that model with the implementation.

This document is the authority for the v0 discovery process. If a later discovery artifact conflicts with these rules, the conflict must be resolved explicitly rather than allowing implementation convenience or existing terminology to decide the matter implicitly.

---

## 2. Governing distinction: design versus implementation

Concept Design is concerned with the user-visible behavioral structure of software: the independent concepts users can understand, the purposes those concepts serve, their abstract state and actions, and the synchronizations that compose them into an application.

Implementation is concerned with how those behaviors are realized: frameworks, schemas, routes, modules, services, UI components, APIs, storage, authentication mechanisms, deployment architecture, and related engineering choices.

For the MinneAnalytics retrofit, these are intentionally separated.

### 2.1 Core authority rule

> **The existing implementation is evidence of historical design decisions and current behavior; it is not the authority that defines the conceptual model.**

Consequences:

- A database entity is not automatically a concept.
- A UI page or tab is not automatically a concept.
- A route or API resource is not automatically a concept.
- An enum or state machine is not automatically a concept boundary.
- A TypeScript type, Prisma model, React component, service, or library module is not automatically a concept.
- Existing naming may be retained, refined, split, merged, or rejected when the conceptual analysis warrants it.
- Existing implementation constraints may be recorded as realization constraints, but they must not be used to redefine a concept merely to make the model resemble the code.

### 2.2 Direction of authority

During v0 discovery, the repository may be read in the following direction:

```text
historical intent + user-visible behavior + product needs
                         ↓
                  concept discovery
                         ↓
               concept specifications
                         ↓
                  synchronizations
                         ↓
          implementation reconciliation
```

The following direction is explicitly disallowed as a default reasoning strategy:

```text
schema / routes / components / services
                 ↓
       inferred concept model
```

Implementation may reveal overlooked cases, contradictions, or important historical behavior. When that happens, the finding becomes evidence to evaluate, not an automatic design conclusion.

---

## 3. Concept Design model used by this repository

The retrofit adopts Daniel Jackson's Concept Design method as the primary design framework. The working interpretation for this repository is defined below so future contributors and agents operate from a common model.

### 3.1 Concept

A concept is an independent, coherent unit of user-facing behavior organized around a focused purpose.

A concept is not merely a domain noun. It must justify its existence by solving a recognizable problem for a user, actor, organization, or application context.

Each accepted concept should eventually contain:

- **Purpose** — the problem or need the concept addresses.
- **Operational Principle** — a representative story explaining how the concept fulfills that purpose.
- **Abstract State** — the minimal conceptual information necessary to explain the behavior.
- **Actions** — externally meaningful operations that inspect or change that state.
- **Concept criteria analysis** — evidence that the concept is sufficiently specific, complete, independent, and appropriately generic.
- **Provenance** — the evidence and design reasoning that led to the concept.
- **Open questions** — unresolved conceptual matters that must not be hidden in implementation assumptions.

### 3.2 Purpose

A purpose describes why a concept deserves to exist.

A good purpose should:

- describe a need rather than an implementation mechanism;
- be specific enough to distinguish the concept from neighboring concepts;
- be broad enough that the concept can completely satisfy the need;
- avoid embedding another concept's purpose;
- avoid references to framework, database, route, UI, or deployment choices.

Candidate concepts that cannot articulate a clear purpose remain hypotheses rather than accepted concepts.

### 3.3 Operational Principle

An operational principle is the archetypal behavioral story that demonstrates how the concept delivers its purpose.

It is not intended to enumerate every workflow or edge case. It should make the concept understandable without requiring knowledge of neighboring concepts or implementation details.

If an operational principle cannot be explained independently, that is evidence the proposed concept may be incorrectly bounded.

### 3.4 Abstract state and actions

Concept state describes what must conceptually be remembered for the behavior to make sense. It is not a database schema.

Concept actions describe meaningful operations on that state. They are not HTTP endpoints, UI buttons, functions, or event handlers.

An implementation may realize a single conceptual action through multiple technical operations, or one technical operation may participate in several conceptual actions.

### 3.5 Independence

Concepts should be independently understandable and useful.

A concept must not require direct knowledge of another concept in order to define its own purpose and operational principle. Application behavior that coordinates independent concepts belongs in synchronizations.

### 3.6 Synchronization

A synchronization describes application-specific coordination among otherwise-independent concepts.

Synchronizations are the preferred place for rules such as:

- when an action in one concept should trigger an action in another;
- when the state of one concept constrains participation in another;
- how two independent histories become jointly relevant to a workflow;
- how MinneAnalytics-specific policy composes reusable concepts.

A synchronization is not evidence that the participating concepts should be merged.

---

## 4. Retrofit evidence model

Because MinneAnalytics predates the Concept Design model, all major discoveries must distinguish what kind of evidence supports them.

### 4.1 Evidence classes

The following evidence classes are used during v0 discovery.

#### A. Historical intent

Evidence of what the project was trying to accomplish at a point in time.

Examples:

- original implementation plans;
- requirement notes preserved in repository history;
- commit messages describing the problem being addressed;
- issue or pull-request rationale;
- documentation that explains desired user behavior rather than implementation mechanics.

Historical intent is valuable even when later implementation changed.

#### B. Current user-visible behavior

Behavior observable by a user or actor in the current application.

Examples:

- a presenter can revise an abstract;
- a reviewer must rescore after a relevant revision;
- a board member may approve while a co-chair may not;
- a published deck may be excluded from the public archive.

Current behavior establishes what the system presently does, not necessarily what the concept model should prescribe.

#### C. Current implementation artifact

Technical realization of behavior.

Examples:

- Prisma models;
- enum values;
- API routes;
- React components;
- authorization helpers;
- storage layout;
- framework conventions.

Implementation artifacts are useful during reconciliation and may reveal hidden edge cases. They carry the lowest authority for discovering concept boundaries.

#### D. Future intent

Documented behavior or capability not yet realized.

Examples:

- roadmap items;
- planned conflict-of-interest handling;
- future SSO;
- planned external integrations.

Future intent may reveal purposes that current implementation does not yet satisfy.

#### E. New design hypothesis

A conclusion proposed during Concept Design analysis that is not merely restating an existing artifact.

Examples:

- selection and retraction may be independent concepts;
- evaluation validity may synchronize with revision rather than belong to revision;
- controlled disclosure may be independent from evaluation.

A hypothesis remains provisional until tested against the concept criteria and available evidence.

### 4.2 Evidence hierarchy

For concept discovery, the default evidentiary preference is:

1. user/problem intent;
2. user-visible behavior;
3. historical evolution and rationale;
4. future intent;
5. implementation details.

This hierarchy is not a truth ranking. Implementation is often the strongest evidence of what the software currently does. The hierarchy exists specifically to prevent the realization from dictating the conceptual decomposition.

### 4.3 Provenance requirement

Substantive discovery records should identify their provenance using one or more evidence classes.

A lightweight record may use the following form:

```markdown
### D-### — Observation title

**Statement:** ...

**Evidence class:** Historical intent | Current behavior | Implementation | Future intent | Design hypothesis

**Sources:** ...

**Concept implications:** ...

**Status:** observed | hypothesis | accepted | rejected | superseded | deferred
```

Not every sentence requires this ceremony. It is required where the distinction between observed behavior and new design conclusion would otherwise become ambiguous.

---

## 5. Anti-bias rules

The following rules apply throughout v0 discovery.

### AB-01 — No implementation-noun promotion

A technical or existing domain noun does not become a concept merely because the repository uses it extensively.

Examples requiring independent justification include `Submission`, `Score`, `Theme`, `Reviewer`, `ProgramStatus`, `DeckStatus`, `Conference`, and similarly named artifacts.

### AB-02 — Purpose before structure

Candidate concepts are first justified by purpose and operational principle. Abstract state is modeled only after the behavioral purpose is sufficiently clear.

### AB-03 — No schema-first modeling

Prisma models and persistence relationships must not be used as the initial source for concept identification.

They may be examined during implementation reconciliation or when a discovery question specifically requires confirmation of existing behavior.

### AB-04 — No UI-boundary modeling

Pages, tabs, dashboards, queues, forms, and widgets are presentations of behavior. They do not define concept boundaries.

### AB-05 — No route/API-boundary modeling

HTTP resources and endpoint groupings are realization decisions. Concept actions may cross, combine, or subdivide API boundaries.

### AB-06 — No role-name assumption

Existing role names do not automatically define conceptual actors or authority semantics.

For example, `BOARD`, `CHAIR`, and `ADMIN` may be implementations of authority relationships rather than concepts themselves.

### AB-07 — Preserve independent histories

When two facts can independently remain meaningful over time, the analysis must consider whether the current implementation has collapsed separate concepts into a single state variable or lifecycle.

### AB-08 — Synchronize rather than couple

When a candidate concept requires another concept only because of MinneAnalytics-specific policy, prefer testing that relationship as a synchronization before merging the concepts.

### AB-09 — Avoid retrofit conservatism

A conceptual result is not invalid merely because realizing it would require substantial refactoring.

Migration cost belongs to implementation reconciliation and planning, not concept acceptance.

### AB-10 — Avoid novelty bias

The opposite error is also prohibited. A new decomposition is not better merely because it differs from the implementation.

Existing terminology or structure may remain correct when it survives purpose, operational-principle, independence, completeness, and genericity analysis.

### AB-11 — Record disagreement instead of forcing closure

When evidence is contradictory or a boundary is genuinely uncertain, record the uncertainty. Do not force a premature concept definition for the sake of completing a phase.

### AB-12 — Distinguish policy from intrinsic behavior

Rules specific to MinneAnalytics conference operations should be tested as synchronizations or application policy before being embedded inside otherwise generic concepts.

### AB-13 — Distinguish identity from authority

Mechanisms that establish who an actor is must not automatically define what that actor may do. Authentication realization and behavioral authority are separate concerns unless concept analysis establishes otherwise.

### AB-14 — Do not let current limitations define purpose

Prototype constraints, omitted production features, demo shortcuts, and temporary infrastructure must not narrow the purpose of a concept unless the limitation is itself part of the intended user-visible behavior.

### AB-15 — Historical sequence informs but does not dictate decomposition

The order in which features were implemented can reveal when distinct user problems were discovered. It is evidence, not proof, that each historical feature corresponds to a separate concept.

---

## 6. Discovery source policy

### 6.1 Preferred early-discovery sources

Early concept discovery should emphasize:

- original and historical planning documents;
- repository README/product descriptions across time;
- user-facing walkthroughs;
- roadmap and requirement descriptions;
- commit messages with behavioral rationale;
- issue/PR discussions that explain why behavior was introduced;
- externally meaningful current workflows.

### 6.2 Sources used cautiously during discovery

The following may be consulted when necessary to confirm behavioral details but must not drive concept decomposition:

- business-logic functions;
- API request/response semantics;
- persistence state and constraints;
- validation logic;
- permission helpers;
- current internal state machines.

### 6.3 Sources deferred until reconciliation

Systematic analysis of the following is deferred until a conceptual baseline exists:

- file/module boundaries;
- component organization;
- database normalization;
- route architecture;
- framework layering;
- deployment topology;
- infrastructure implementation.

---

## 7. Discovery workflow

The v0 retrofit proceeds in a deliberately one-way sequence before reconciliation.

### Stage 1 — Recover intent

Identify the problems, actors, decisions, and behavioral needs reflected in repository history and user-facing documentation.

Output examples:

- source register;
- repository timeline;
- intent ledger;
- actor-needs inventory;
- problem inventory;
- contradiction register.

### Stage 2 — Generate concept candidates

Translate recovered needs into candidate purposes and candidate concepts.

At this stage:

- names are provisional;
- implementation compatibility is irrelevant;
- multiple competing decompositions may coexist;
- concept candidates must identify the problem they claim to solve.

### Stage 3 — Test concept boundaries

Evaluate candidates for:

- specificity;
- completeness;
- independence;
- genericity;
- quality of operational principle;
- whether apparent coupling belongs in synchronization instead.

Candidates may be split, merged, renamed, rejected, or deferred.

### Stage 4 — Specify surviving concepts

Define:

- purpose;
- operational principle;
- abstract state;
- actions;
- invariants where conceptually necessary;
- provenance;
- unresolved questions.

### Stage 5 — Compose the application

Define MinneAnalytics-specific synchronizations among the independent concepts.

Only after this stage should the conceptual model be treated as sufficiently stable for systematic implementation comparison.

### Stage 6 — Reconcile with implementation

Compare the conceptual baseline with current implementation and classify findings such as:

- aligned realization;
- implementation conflation;
- accidental coupling;
- missing conceptual behavior;
- implementation-only behavior;
- over-specialization;
- under-modeled concept;
- naming mismatch;
- migration constraint;
- deliberate prototype shortcut.

Reconciliation findings do not automatically modify the concept model. They may instead create implementation debt or prompt a separate design review.

---

## 8. Candidate concept acceptance gates

A candidate should not be promoted to the canonical concept set until the following questions can be answered satisfactorily.

### 8.1 Purpose gate

- What problem does this concept solve?
- Is that problem recognizable without referencing the current application structure?
- Is the purpose distinct from neighboring candidates?

### 8.2 Operational-principle gate

- Can a short user-visible story demonstrate the concept fulfilling its purpose?
- Can that story be understood without another concept's internal state?

### 8.3 Specificity gate

- Is the concept focused on one coherent purpose?
- Has unrelated functionality been grouped merely because the implementation stores it together?

### 8.4 Completeness gate

- Does the concept contain enough behavior to actually solve its stated purpose?
- Has essential behavior been pushed into another concept only because of current implementation boundaries?

### 8.5 Independence gate

- Can the concept be specified independently?
- Could its application-specific interactions be expressed through synchronizations?

### 8.6 Genericity gate

- Is the concept unnecessarily specialized to MinneAnalytics terminology or current conference policy?
- Would a more general formulation preserve the same purpose without becoming vague?

### 8.7 Provenance gate

- Which observations or needs led to this concept?
- Which parts are recovered intent versus new design conclusions?
- Are contradictory sources documented?

---

## 9. Documentation authority during v0

During the discovery branch, documentation has three maturity levels.

### 9.1 Discovery evidence

Historical observations, intent records, contradictions, and problem inventories.

These describe evidence and are authoritative only for what was observed or recovered.

### 9.2 Design hypotheses

Candidate concepts, tentative boundaries, alternative decompositions, and proposed synchronizations.

These are explicitly non-canonical until accepted through review.

### 9.3 Canonical concept design

Concept specifications and synchronizations that have passed the acceptance gates and have been included in the v0 conceptual baseline.

Only canonical design artifacts are intended to become behavioral design authority after the v0 branch is consolidated and merged.

---

## 10. Branch and change discipline

The `concept-design/v0-discovery` branch is a design branch, not a refactoring branch.

Until the implementation-reconciliation stage explicitly authorizes otherwise:

- do not change Prisma schema;
- do not rename implementation domain objects to match candidate concepts;
- do not restructure routes or components based on discovery hypotheses;
- do not alter application behavior to make it conform to an unfinished model;
- do not perform opportunistic technical refactoring as part of Concept Design documentation commits.

If implementation defects are discovered, record them separately unless they prevent the design investigation itself.

This preserves a clean experimental boundary: v0 discovers and specifies the design before asking the implementation to conform to it.

---

## 11. Initial v0 work structure

The initial work is organized as:

### 001 — Discovery & Archaeology

- **001-A — Design Authority, Methodology, Evidence & Anti-Bias Rules**
- **001-B — Historical Intent Reconstruction & Repository Archaeology**
- **001-C — Problem, Actor-Need & Purpose Inventory**
- **001-D — Candidate Concept Discovery & Boundary Hypotheses**
- **001-E — Concept Criteria, Independence & Genericity Review**
- **001-F — Operational Principle Development**
- **001-G — Discovery Consolidation & Concept Candidate Gate**

Later phases are expected to cover canonical concept specification, synchronization/composition, implementation reconciliation, and v0 consolidation. Their exact subdivision should be determined from what 001 discovers rather than fixed prematurely.

---

## 12. 001-A exit criteria

001-A is complete when:

- [x] Concept Design is explicitly established as separate from implementation architecture.
- [x] The current implementation is classified as evidence rather than conceptual authority.
- [x] The repository has a defined evidence taxonomy and provenance policy.
- [x] Anti-implementation-bias rules are explicit.
- [x] Candidate concept acceptance gates are defined.
- [x] Synchronization is established as the mechanism for application-specific composition of independent concepts.
- [x] Branch discipline prevents premature implementation refactoring.
- [x] The next activity is historical intent reconstruction rather than schema or code modeling.

---

## 13. Immediate next phase

The next work item is:

**001-B — Historical Intent Reconstruction & Repository Archaeology**

001-B should walk the repository from its earliest recoverable planning state through the current branch and produce a provenance-rich record of how product needs emerged and changed. It should reconstruct intent without converting each historical feature or implementation artifact directly into a concept.

The expected result is an evidence base from which 001-C and later concept discovery can proceed without depending on memory or current implementation structure.

---

## 14. Method references

Primary methodology reference:

- Daniel Jackson, *The Essence of Software: Why Concepts Matter for Great Design*.
- Essence of Software Concept Design materials: https://essenceofsoftware.com/

The repository's interpretation may add process mechanisms needed for a brownfield retrofit—especially evidence provenance, historical archaeology, and implementation anti-bias controls—while preserving the core Concept Design distinction between concepts and their engineering realization.
