# 002-D — Vocabulary & Classification

Status: **Complete**  
Concept model maturity: **v0 — formal specification in progress**  
Branch: **`concept-design/v0-discovery`**  
Depends on: [001-G — Discovery Consolidation & Concept Candidate Gate](001-G-discovery-consolidation-and-concept-candidate-gate.md), [002-A](002-A-offer-change-and-temporal-availability.md), and [002-C](002-C-program-choice-participation-scarcity-and-representation-intent.md)

## 1. Purpose

002-D formally specifies:

- [Vocabulary](knowledge/concepts/vocabulary.md)
- [Classification](knowledge/concepts/classification.md)

The canonical concept nodes own the current normative purpose, operational principle, abstract state, actions, intrinsic invariants, derived observations, and synchronization boundaries.

This phase record intentionally preserves only the decisions, rejected alternatives, implementation-reconciliation observations, deferred composition questions, and exit review needed to audit those specifications.

Documentation authority remains governed by [Documentation Authority & Cross-Reference Rules](knowledge/rules/documentation-authority.md), and implementation remains evidence rather than concept authority under [Concept Design Authority](knowledge/rules/concept-design-authority.md).

---

## 2. Entry conditions

Vocabulary and Classification both entered 002-D as admitted Phase 001 concepts.

Phase 001 had already rejected the current `Theme` implementation boundary as a conceptual boundary because it combines at least three different behavioral purposes:

1. reusable term lifecycle and governance;
2. association of subjects with reusable terms;
3. desired collection representation targets.

002-C formally specified the third concern as [Coverage Target](knowledge/concepts/coverage-target.md). 002-D therefore had to prove that Vocabulary and Classification can each be specified independently without reassembling `Theme` under a different name.

The current implementation was consulted only as evidence. In particular, `Theme`, `ThemeSource`, `SubmissionTheme`, slug generation, `targetMin`/`targetMax`, `removedAt`, sort order, the three-theme UI limit, community proposal routes, and revision snapshots were not treated as formal-state templates.

---

## 3. Formal-specification method

The subgroup required both concepts to demonstrate:

1. independent abstract state;
2. complete concept-local actions;
3. intrinsic invariants that do not inspect the neighboring concept's internals;
4. stable historical meaning when Vocabulary changes;
5. separation between current association state and reusable-term governance;
6. no duplication of Coverage Target or Selection state;
7. an explicit treatment of revision-sensitive classification without merging Classification into Revision;
8. implementation neutrality around names such as Theme, category, tag, source, slug, and conference.

The central test was:

> **Can a Term change or retire without rewriting the subjects that historically reference it, and can a subject's classification change without changing the Term itself?**

The answer must be yes for the concepts to remain independent.

---

## 4. Design decisions

### D-002D-01 — Vocabulary owns stable Term identity, not label identity

A reusable term must remain the same referable Term when a steward corrects or renames its wording.

Vocabulary therefore distinguishes:

- stable `Term` identity; and
- the current/historical wording recorded through `TermState`.

**Rejected alternative:** identify a term solely by slug or current label. That would make correction/rename indistinguishable from deleting one term and creating another, weakening historical interpretation.

---

### D-002D-02 — Vocabulary preserves an append-only lifecycle history

Each Term has a linear chain of immutable `TermState` records.

The current state determines:

- current label; and
- whether the Term is `available` or `retired`.

`Contribute`, `Correct`, `Retire`, and `Restore` append state rather than rewrite prior state.

This history is intrinsic because the accepted Vocabulary purpose explicitly includes correction, retirement/restoration, and historical continuity of terms.

---

### D-002D-03 — Contribution and stewardship remain one concept

002-D does not split participant contribution from steward governance merely because different actors may perform those actions.

Both behaviors act on the same Term identity and tell one coherent lifecycle story:

`Contribute → Correct* → Retire ↔ Restore`

Who may invoke each action remains application authority policy.

---

### D-002D-04 — Contribution creates an available reusable term

The current evidence supports participant-contributed terms becoming reusable without a separate pending-moderation lifecycle.

`Contribute` therefore establishes an `available` Term.

002-D does **not** invent a `proposed`, `pending`, or `approved` Vocabulary state.

If later product requirements introduce moderation-before-use, that behavior must be designed explicitly rather than inferred from the current `source` field.

---

### D-002D-05 — Vocabulary does not require globally unique wording

Term labels are not intrinsic unique identifiers.

Deduplication, synonym management, normalization, slug collision handling, case folding, aliases, and merge behavior are not currently independent Vocabulary semantics.

The application may reject or redirect semantically duplicate contributions, but the generic concept does not equate identity with normalized text.

**Rejected alternative:** adopt the implementation's unique `(conference, slug)` constraint as the conceptual identity rule.

---

### D-002D-06 — Vocabulary has retirement, not destructive deletion

An established Term has no intrinsic hard-delete action.

Retirement removes it from ordinary future reuse while preserving:

- stable identity;
- historical wording/state;
- external references held by Classification or other concepts.

This preserves the historical-interpretation purpose that motivated Vocabulary in Phase 001.

The current implementation's ability to hard-delete an unused Theme is retained as a reconciliation difference rather than promoted into the concept.

---

### D-002D-07 — Term correction does not change availability

`Correct` changes wording while retaining the current available/retired state.

This prevents a textual correction from implicitly restoring a retired term or retiring an available one.

Availability changes require the explicit `Retire` or `Restore` actions.

---

### D-002D-08 — Classification owns only the current subject↔Term relation

Classification's authoritative state is the set:

`classified ⊆ SubjectRef × TermRef`

`Classify` adds a pair and `Unclassify` removes a pair.

Classification does not own:

- Term wording;
- Term lifecycle;
- representation targets;
- selection decisions;
- counts or heatmaps;
- mutable subject content.

This is deliberately smaller than the current `Theme` aggregate.

---

### D-002D-09 — Classification does not automatically gain its own change history

The current Phase 001 evidence establishes the need to add/change/remove associations and preserve historical interpretability of retired terms. It does not independently establish a universal audit trail of every `Classify`/`Unclassify` action.

002-D therefore models current classification state rather than an append-only association ledger.

Where historical classification matters because the subject itself is versioned, the application can classify an immutable/version-specific subject reference.

If a future product need requires reconstructing every classification edit independently of subject versioning, that would justify an explicit extension rather than being silently assumed now.

---

### D-002D-10 — Vocabulary retirement must not cascade-delete Classification

Retiring a Term means:

> do not ordinarily offer this Term for new reuse.

It does **not** mean:

> pretend the Term never described existing subjects.

Existing Classification associations therefore remain intact and interpretable after retirement.

Application composition may require `Vocabulary.available(term)` before allowing a new `Classify` action while permitting existing associations to remain.

This rule preserves historical semantics without making Classification inspect Vocabulary internals intrinsically.

---

### D-002D-11 — Classification remains neutral about which kind of subject is classified

`SubjectRef` is opaque.

For MinneAnalytics this leaves a deliberate composition choice:

- classify a durable [Proposal](knowledge/concepts/proposal.md), if classification is intended to follow the offer across revisions; or
- classify an exact [Revision](knowledge/concepts/revision.md), if classification is part of the version-specific form that was actually reviewed.

Classification itself should not decide that application-specific semantic choice.

---

### D-002D-12 — Current revision snapshots create a strong version-sensitive classification signal

The present implementation includes theme IDs in revision-change detection and revision snapshots.

That is evidence that MinneAnalytics historically treated theme/category changes as part of the revised proposal state.

002-D does not respond by merging Classification into Revision.

Instead it carries forward the synchronization/composition question:

> Should MinneAnalytics classify exact Revision identities, or should Revision snapshots record a projection of Classification attached elsewhere?

The answer belongs in application composition and synchronization design after all relevant concepts are specified.

---

### D-002D-13 — Classification cardinality limits are application policy

The current public workflow permits up to three themes.

That is a MinneAnalytics policy, not an intrinsic property of Classification.

The generic concept supports any finite set of Term associations unless application policy constrains it.

Likewise, required minimum classification, mutually exclusive terms, hierarchy rules, and dimension-specific cardinality are not intrinsic without further evidence.

---

### D-002D-14 — Coverage Target remains separate from Vocabulary

Current `Theme` rows store `targetMin` and `targetMax` next to term identity and lifecycle fields.

002-D explicitly rejects that coupling.

Desired representation bounds belong to [Coverage Target](knowledge/concepts/coverage-target.md).

A Coverage Target may use a Term as an application-defined bucket/value, but the target is not state of the Term itself.

This allows the same Vocabulary term to exist without any representation target and allows targets over dimensions that are not Vocabulary terms.

---

### D-002D-15 — Observed composition remains derived from Classification + Selection/application state

Classification can answer which Terms currently describe which supplied subjects.

It does not own collection-level counts.

Observed representation for program planning is derived by selecting the relevant application collection and projecting its Classification/attribute state.

That observed value can then be compared against Coverage Target.

002-D therefore does not introduce `ThemeStats`, `ClassificationCount`, `Balance`, or another authoritative aggregate concept.

---

### D-002D-16 — Implementation source labels are provenance/policy, not Vocabulary states

Current Theme rows have `ADMIN` or `PRESENTER` source values, and administration can change a presenter-created term's source to `ADMIN`.

The formal Vocabulary model instead records actor/time provenance for each lifecycle state.

It does not create a permanent conceptual source enum or interpret source promotion as a Term lifecycle transition.

If future governance needs distinguish community-originated, steward-curated, verified, or approved Terms behaviorally, that should be designed from the actual user need rather than from the current enum.

---

### D-002D-17 — Vocabulary scoping is represented by an opaque VocabularyRef

Terms can belong to a vocabulary/context, but Vocabulary does not currently own the lifecycle of the vocabulary container itself.

A `VocabularyRef` therefore scopes a Term without introducing another `Taxonomy`, `Conference Vocabulary`, or `Category Set` concept.

Application composition determines whether the reference corresponds to a conference, event series, organization-wide catalog, or another context.

---

## 5. Cross-concept boundary result

| Concept | Owns | Explicitly does not own |
|---|---|---|
| [Vocabulary](knowledge/concepts/vocabulary.md) | stable Term identity; wording/availability history; contribute/correct/retire/restore | subject associations; Coverage Target bounds; Selection; slug/order/source enums; conference ownership |
| [Classification](knowledge/concepts/classification.md) | current SubjectRef↔TermRef association relation | Term lifecycle; term wording; target bounds; observed composition authority; Revision history; Selection |

The concepts remain independently understandable:

- Vocabulary can evolve even if no subjects are currently classified.
- Classification can add/remove associations without changing any Term.
- Term retirement does not erase existing Classification.

---

## 6. Implementation-reconciliation observations retained for later

### IR-002D-01 — Current `Theme` mixes three formal concepts

The current row combines:

- Vocabulary fields (`name`, `source`, `removedAt`, identity);
- Coverage Target fields (`targetMin`, `targetMax`);
- relationships used by Classification (`SubmissionTheme`).

Later implementation reconciliation should determine whether this persistence aggregate remains acceptable as a physical storage optimization or creates problematic semantic coupling.

Concept Design does not require one table per concept.

### IR-002D-02 — Current Theme hard deletion differs from durable Vocabulary identity

The admin route hard-deletes a Theme when there are no current SubmissionTheme associations and soft-removes it otherwise.

Formal Vocabulary instead uses retirement for established Terms.

Later reconciliation should decide whether unused-term deletion is merely an implementation cleanup that can be mapped safely or whether production semantics should preserve all contributed Terms.

### IR-002D-03 — Current removed terms already approximate retirement behavior

Selectable-theme queries exclude `removedAt` terms while administration/history can still inspect them.

This is compatible with the formal available/retired distinction, although current persistence does not preserve a full retirement/restoration history.

### IR-002D-04 — Current presenter contribution is immediately reusable

`findOrCreatePresenterTheme` creates a presenter-originated Theme directly and may restore a removed Theme when the same normalized slug is proposed.

That supports the current formal decision not to invent a pending-moderation state.

The automatic slug-based reuse/restore behavior remains application policy to be reconciled later.

### IR-002D-05 — Current Classification relation is close to formal present-state shape

`SubmissionTheme` is a unique `(submissionId, themeId)` relation and therefore resembles the formal set-valued Classification relation.

However, foreign-key cascade semantics and exact subject identity are implementation choices, not intrinsic Classification rules.

### IR-002D-06 — Current revision snapshots include theme IDs

Theme IDs participate in revision change detection and snapshots.

This creates a significant synchronization question for later design: whether version-specific MinneAnalytics classification should attach directly to Revision identities or be projected into Revision history from a Proposal-level Classification relation.

The formal concepts remain independent under either composition.

### IR-002D-07 — Current target bounds must not remain term authority by accident

Because `targetMin`/`targetMax` physically live on Theme, implementation reconciliation must ensure future code does not treat Coverage Target lifecycle as inseparable from Vocabulary lifecycle merely due to schema co-location.

---

## 7. Synchronization/composition signals carried forward

002-D does not make the following application synchronizations canonical yet, but carries them into the Phase 002 handoff:

1. **Vocabulary availability → Classification eligibility** — new associations may require an available Term.
2. **Vocabulary retirement → Classification preservation** — retirement must not erase existing associations.
3. **Proposal/Revision → Classification subject choice** — MinneAnalytics must decide whether classifications attach to durable offers or exact versions.
4. **Revision creation/edit → Classification projection** — if categories are part of the versioned proposal form, Classification changes may synchronize with Revision creation.
5. **Selection + Classification → observed program composition** — derive selected representation.
6. **Observed composition + Coverage Target → representation assessment** — derive below/within/above target.
7. **Availability Window + authority → Vocabulary contribution eligibility** — current contribution timing/authority are application policy.
8. **Archive → mutation eligibility** — archived contexts may prohibit Vocabulary/Classification mutations through later application composition.

These relationships should be reviewed after Deliverable, Schedule, Publication, Dispatch, and Archive are formally specified.

---

## 8. Rejected concept additions

002-D does not introduce:

- Theme;
- Taxonomy;
- Tag;
- Category Set;
- Term Proposal;
- Term Moderation;
- Synonym;
- Alias;
- Classification History;
- Classification Count;
- Theme Source;
- Theme Balance;
- Topic Coverage;
- Category Approval;
- Term Ownership.

Some may become future concepts if independent user-facing purposes emerge. Current evidence does not justify them as separate concepts now.

---

## 9. Exit review

### Vocabulary

- focused reusable-term lifecycle purpose: **pass**
- stable identity independent of label: **pass**
- complete contribution/stewardship actions: **pass**
- retirement/restoration history: **pass**
- independence from Classification/Coverage Target: **pass**
- implementation-neutral: **pass**

**Result: specified.**

### Classification

- focused association purpose: **pass**
- minimal complete add/remove state: **pass**
- independence from Vocabulary lifecycle: **pass**
- retirement-safe historical interpretation: **pass**
- version-sensitive composition path preserved: **pass**
- implementation-neutral: **pass**

**Result: specified.**

---

## 10. 002-D exit decision

**002-D passes.**

The canonical Concept Design model now distinguishes:

- stable Term identity from mutable wording;
- reusable-term lifecycle from subject classification;
- term retirement from association deletion;
- Classification from Revision history while preserving a version-sensitive composition path;
- Vocabulary from Coverage Target even when the current schema co-locates them;
- current association state from derived collection composition.

No application/domain refactoring is authorized by this phase.

The next subgroup is **002-E — Deliverable & Scheduling Execution**.