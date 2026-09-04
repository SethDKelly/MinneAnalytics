---
type: Disclosure & Publication Policy Baseline
title: MinneAnalytics v0 Disclosure, Sharing & Publication Policy Baseline
description: Canonical implementation policy for blind-review disclosure staging/reveal and public-sharing/publication eligibility in the v0 reconciliation architecture.
tags: [concept-design, implementation-reconciliation, controlled-disclosure, publication, sharing, policy, v0]
status: stable
authority: canonical
phase: 003-D
sources:
  - { id: phase, resource: ../../003-D-authority-lifecycle-disclosure-and-operational-policy-reconciliation.md, title: 003-D Authority Lifecycle Disclosure & Operational Policy Reconciliation }
  - { id: matrix, resource: ../../evidence/003-D-disclosure-publication-policy-matrix.md, title: 003-D Disclosure & Publication Policy Matrix }
  - { id: disclosure, resource: ../concepts/controlled-disclosure.md, title: Controlled Disclosure }
  - { id: publication, resource: ../concepts/publication.md, title: Publication }
  - { id: execution, resource: synchronization-transaction-recovery-target.md, title: MinneAnalytics v0 Synchronization Transaction & Recovery Target }
---
# Purpose

Define the concrete v0 application policy around two high-consequence visibility boundaries:

1. when review information is staged or intentionally revealed to an evaluator; and
2. when exact event material is eligible to become or remain public.

The underlying concept semantics remain owned by [Controlled Disclosure](../concepts/controlled-disclosure.md) and [Publication](../concepts/publication.md).

# Blind-review policy modes

`blindReviewEnabled` remains an application configuration input rather than Controlled Disclosure state.

## Blind review disabled

The application does not create staged disclosure relationships merely to represent ordinary visibility. Presenter identity and aggregate information may be shown according to normal review access policy.

No fabricated `Reveal` event is needed when information was never intentionally staged as concealed.

## Blind review enabled

The application establishes separate disclosure relationships for separately controlled information items. At minimum v0 distinguishes presenter identity from peer/committee aggregate information.

# Information-key policy

The target uses stable application information-key semantics rather than embedding UI fields into Controlled Disclosure.

## Presenter identity

Semantic information key: `review.presenter-identity`.

- participant: evaluator/reviewer (`ReviewerAccess.id` in the current realization);
- context: the evaluator's review relationship with the durable Proposal/context;
- information: presenter identity/contact bundle for that Proposal.

Identity information is Proposal-level rather than Revision-level because changing abstract content does not create a new presenter identity.

## Peer/committee aggregate

Semantic information key: `review.peer-aggregate` scoped to the exact Revision whose peer Evaluation data is being summarized.

- participant: evaluator/reviewer;
- context: review context for the Proposal/exact Revision;
- information: aggregate/peer judgment information for one exact Revision.

A later Revision therefore has a new aggregate disclosure item. Prior reveal of the old Revision's aggregate does not automatically reveal aggregate information about the new Revision.

# Staging policy

When blind review is enabled and an evaluator is given an active review context:

- stage presenter identity if the evaluator has not already received that Proposal-level staged relation;
- stage peer aggregate for each exact Revision when that aggregate information becomes relevant to review;
- preserve existing reveal history instead of recreating/reconcealing it.

Staging may be eager when the review context is established or lazy immediately before first protected read, provided the final state is semantically equivalent and cannot race into unrecorded exposure.

# Explicit identity reveal policy

A reviewer may intentionally reveal presenter identity before recording an Evaluation when all of these hold:

- blind review is enabled;
- the reviewer has `RECORD_EVALUATION` access to the Proposal/context;
- the presenter-identity disclosure relation is staged and concealed;
- context is live and review access is valid;
- the request is an explicit reveal action, not a passive page render.

The reveal must persist actor/time provenance and is monotonic.

A retry returns the already-revealed relationship and must not overwrite the first reveal provenance.

This preserves the current product's optional identity-reveal behavior while making it auditable and truthful.

# Peer aggregate reveal policy

Peer/committee aggregate information has no manual bypass in v0.

For an exact Revision, reveal occurs only when the evaluator successfully records/revises the applicable current Evaluation and SYNC-003 policy conditions pass.

The reveal is performed atomically with the local Evaluation transaction when both owners share the database.

If the Proposal receives a new Revision:

- the prior Evaluation remains historical;
- the prior aggregate reveal remains historical;
- the new Revision's aggregate disclosure relation remains concealed until the evaluator records an applicable Evaluation for that new Revision.

This preserves the present anti-anchoring intent without storing a mutable `scoresVisible` workflow flag.

# Blind-mode configuration locking

Changing blind-review mode after protected review activity has begun can create irreversible information exposure and must not be treated as an ordinary settings toggle.

Target policy:

- routine configuration changes are allowed only before any relevant staged disclosure/Evaluation activity exists;
- switching blind review **on** after identity/peer data may already have been visible is not allowed as a way to pretend prior visibility did not occur;
- switching blind review **off** after staging has begun requires an explicit high-consequence operation that records/reveals affected staged relationships consistently before broad visibility changes.

For v0, the preferred implementation is to lock routine `blindReviewEnabled` changes once review activity starts. A future explicit bulk-reveal operation may be designed if operationally needed.

# Legacy disclosure cutover

Historical identity reveals were console-logged rather than durably recorded. Migration therefore cannot assert that an unrevealed target record means the reviewer never saw identity.

003-F must use the 003-B legacy-unknown rule for in-flight legacy review cohorts.

Newly established review contexts after target cutover can receive native Controlled Disclosure records. Existing current visibility may be represented as observed compatibility state only when the evidence is truthful about what is known.

# Public-sharing policy boundary

Publication eligibility separates three different questions:

1. **Is the exact material operationally ready?** — Deliverable.
2. **Is public sharing of this material/participation permitted by application rights/share policy?** — application policy.
3. **Did an authorized publisher intentionally expose this exact material?** — Publication.

None substitutes for another.

# Share-eligibility policy

`deckShareable` remains a compatibility input during migration but does not itself become Publication state.

For target behavior:

- public sharing must have an explicit current affirmative policy result;
- negative/revoked sharing immediately makes affected public material ineligible and triggers SYNC-008 unpublish convergence;
- an affirmative sharing result does not automatically publish anything;
- the actor/source and change time should be retained because changing public-sharing eligibility is consequential.

The current repository does not demonstrate presenter-managed consent as a distinct product behavior. 003-D therefore does **not** invent a presenter-consent concept or claim that the existing boolean represents legal consent.

Initial v0 authority may remain `SET_PUBLIC_SHARING_POLICY` for the current Board role mapping. If future requirements establish presenter-originated consent/rights grants, that becomes an additional policy input rather than rewriting Publication semantics.

# Legacy default-true rule

Current `deckShareable` defaults to `true`.

An untouched legacy `true` must not be described as a historical affirmative actor decision because no such provenance exists.

At migration/cutover it may be treated as a legacy current-state policy input where existing behavior must be preserved, but new target-native policy changes should retain provenance.

Whether production cutover requires explicit reconfirmation of legacy shareability is a rollout/product-policy decision for 003-F; migration must not manufacture consent provenance.

# Publication eligibility

An exact MaterialRef is eligible for `Publish`/Republish only when all applicable conditions pass:

- actor has `PUBLISH_MATERIAL`;
- exact MaterialRef exists and is accessible to the application;
- when material is a Deliverable ArtifactVersion, the exact version is currently `ready` or otherwise explicitly eligible;
- public-sharing policy is affirmative;
- participation/Selection/Withdrawal policy permits exposure;
- no rights/safety/application block applies;
- lifecycle policy permits the publication action.

Eligibility is evaluated against the exact MaterialRef, not mutable latest-deck state.

# Publication after Archive

Archive and Publication remain independent.

V0 policy permits an authorized organizer to publish/republish exact eligible event material after Archive because the public slide archive may reasonably be established as a post-event activity.

This does **not** reopen the Conference or permit ordinary active-work mutations.

`UNPUBLISH_MATERIAL` remains available after Archive whenever public exposure must end.

# Eligibility-loss policy

When currently published material becomes ineligible—for example due to:

- sharing policy revocation;
- Withdrawal/participation loss under the accepted public policy;
- explicit rights/safety block;
- exact-artifact eligibility loss;

the authoritative source policy change commits first and creates/reuses SYNC-008 work to unpublish affected Publication identities.

User-facing public listing must derive from authoritative Publication + eligibility truth and should not continue listing material merely because cleanup work is pending.

# Replacement ArtifactVersion policy

Providing a new ArtifactVersion does not automatically mutate or repoint an existing Publication.

The application must decide whether the prior exact ArtifactVersion remains eligible/public.

For the current event-deck use case, the preferred v0 policy is:

- a replacement current deck ends eligibility of the superseded artifact as the current public deck;
- SYNC-008 unpublishes the old Publication if necessary;
- the replacement must receive its own readiness Assessment and explicit Publication action before exposure.

A future historical-material/public-version feature may deliberately keep multiple versions public, but that is not inferred by default.

# Historical public-ID rule

A public delivery token (`DeckFile.publicId`) does not grant public eligibility by itself.

The resolver for a public token must verify that the exact MaterialRef represented by that token has an applicable currently published Publication and passes current eligibility policy.

It must not authorize an arbitrary historical DeckFile merely because the parent Proposal's latest/current state is publishable.

This is the target resolution of SG-009.

# Publication collection switch

The current event-wide `decksPublished` flag may remain as a compatibility/public-surface policy input during rollout.

It must not replace exact Publication records.

After canonical cutover, toggling collection visibility can be implemented as:

- a public-surface gate over exact Publication state; and/or
- explicit bulk Publish/Unpublish commands with normal provenance and idempotency.

003-E/003-F choose the compatibility behavior. The flag itself is not evidence that every deck was published at the same time.

# High-consequence enforcement

The following must be server-side and durably attributable:

- explicit identity Reveal;
- disabling blind review after staging has begun, if a future explicit operation permits it;
- share-eligibility changes;
- Publish/Republish;
- Unpublish.

A UI checkbox or hidden component is never sufficient enforcement.

# Gap disposition

This baseline resolves the design portion of:

- SG-005 — Controlled Disclosure history/policy;
- SG-008 — exact Publication identity/eligibility interaction;
- SG-009 — historical public artifact access;
- SG-P04 — public sharing/rights policy authority/provenance;
- disclosure/publication portions of SG-P03.

The gaps remain implementation-open until migration/runtime verification.

# Non-goals

003-D does not define:

- generic confidentiality/RBAC;
- presenter legal-contract/rights lifecycle not evidenced by the repository;
- provider/CDN/storage behavior;
- permanent anonymity;
- automatic publication merely because a deck is ready/shareable.

# Handoff

003-E must define how concealed/revealed state, exact public material, legacy shareability, publication collection controls, and denied/pending cleanup states appear in APIs/UI. 003-F must define the legacy-cohort cutover, provenance backfill, public-access verification, and rollout checks.