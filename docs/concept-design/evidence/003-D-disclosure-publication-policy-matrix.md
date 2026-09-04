# 003-D — Disclosure & Publication Policy Matrix

Purpose: preserve implementation evidence and policy reasoning behind the canonical [Disclosure, Sharing & Publication Policy Baseline](../knowledge/reconciliation/disclosure-publication-policy-baseline.md).

This file is historical evidence, not normative authority.

## Blind-review implementation evidence

| Current surface | Current behavior | Reconciliation conclusion |
|---|---|---|
| `Conference.blindReviewEnabled` | one global boolean | remains application configuration, not Controlled Disclosure state |
| `maskReviewSubmissionItem` | identity removed while blind; aggregate hidden until reviewer has current score | strong evidence for two different information items |
| identity reveal endpoint | reviewer with `canScore` can explicitly reveal identity before scoring | preserve as explicit identity Reveal policy |
| `logIdentityReveal` | console-only audit line | insufficient for monotonic disclosure history |
| aggregate visibility | recomputed via `viewerHasCurrentScore` | replace with exact-Revision staged/revealed relation plus current-Evaluation policy |

## Information-item decomposition

### Presenter identity

Target application key: `review.presenter-identity`.

- Proposal-level identity information;
- separate per evaluator/review context;
- explicit Reveal is permitted while review access is valid;
- no Evaluation prerequisite;
- once revealed, remains revealed in that review context.

### Peer/committee aggregate

Target application key: `review.peer-aggregate` for an exact Revision.

- Revision-specific because current peer judgment changes when the content changes;
- no v0 manual reveal bypass;
- reveal follows successful current Evaluation through SYNC-003;
- new Revision means a new concealed aggregate relation until evaluator evaluates that Revision.

## Blind-mode transition analysis

Changing blind mode after review starts has irreversible consequences.

| Transition | Risk | Target policy |
|---|---|---|
| off → on after review activity | reviewers may already know identity/aggregate | routine transition prohibited; cannot restore ignorance |
| on → off after staging | would disclose all protected information | routine transition prohibited; future explicit bulk reveal must record affected reveals |
| setup-time on/off | no protected review activity yet | permitted by configuration capability |

Preferred v0 implementation: lock ordinary blind-mode edits once protected review/Evaluation activity exists.

## Legacy disclosure migration

Historical explicit identity reveal was not persisted, so migration cannot distinguish:

- never revealed;
- revealed and forgotten by the application;
- currently visible due to blind mode being off.

Target treatment:

- new review contexts after cutover use native Disclosure records;
- legacy in-flight contexts retain legacy-unknown provenance where necessary;
- no fabricated historical reveal instant or actor.

## Public-sharing implementation evidence

| Current surface | Current behavior | Reconciliation conclusion |
|---|---|---|
| `Submission.deckShareable` | defaults true; Board can toggle | compatibility share-policy input, not Publication or proven presenter consent |
| `canSetDeckShareable` | Board-only | initial `SET_PUBLIC_SHARING_POLICY` mapping may remain |
| `Conference.decksPublished` | event-wide switch | compatibility public-surface gate, not exact Publication history |
| publish route | Board-only, ACTIVE-only | retain publisher authority; permit action-specific post-Archive policy |
| public listing | latest deck of APPROVED + deck APPROVED + shareable | replace mutable latest derivation with exact published MaterialRefs |
| public token resolver | accepts any historical DeckFile if parent current state passes | conflicts with exact-material Publication and must be corrected |

## Share-policy provenance

Current default `deckShareable=true` has no actor/time evidence.

Migration rule:

- preserve it as legacy current-state policy when compatibility requires;
- do not label it historical affirmative consent;
- native future share-policy changes should retain actor/time provenance;
- no presenter-consent lifecycle is invented absent product evidence.

## Publication eligibility matrix

| Condition | Required for Publish/Republish? | Owner |
|---|---:|---|
| exact MaterialRef exists | yes | implementation/material storage |
| exact artifact ready when applicable | yes | Deliverable |
| share-policy affirmative | yes | application policy |
| participation/public-policy eligible | yes | application composition |
| publisher capability | yes | authority policy |
| Archive absent | no | lifecycle policy explicitly permits post-event Publication |
| event-wide collection switch | compatibility/presentation-dependent | application/public-surface policy |

## Post-Archive publication decision

The public slide archive is plausibly a post-event behavior. The target therefore permits:

- exact eligible Publish/Republish after Archive;
- Unpublish after Archive at any time;
- no reopening of ordinary event mutation merely to publish materials.

This is a deliberate refinement over the current `assertConferenceAcceptsMutations` gate.

## Replacement artifact decision

Target default for event decks:

1. new DeckFile becomes the current ArtifactVersion;
2. old exact artifact does not silently remain the current intended public deck;
3. old Publication becomes ineligible and is unpublished through SYNC-008 if necessary;
4. replacement requires its own readiness Assessment;
5. replacement requires a new explicit Publication action.

Multiple intentionally public historical versions would require a separate product decision.

## Historical public-ID finding

`loadDeckFileForPublic(publicId)` currently checks parent Conference/Submission current eligibility but does not require that the requested historical DeckFile itself is the currently listed/latest deck.

Target resolver rule:

`public token -> exact MaterialRef -> currently published Publication -> current eligibility`.

A token alone is never public authority.

## Gap disposition

- SG-005 — disclosure policy target-designed; persistence/runtime open.
- SG-008 — exact Publication eligibility policy target-designed; runtime open.
- SG-009 — target access rule defined; runtime open.
- SG-P04 — share-policy authority/provenance target-designed; migration/runtime open.
- SG-P03 publication/disclosure portion — target-designed.

## Non-concepts reaffirmed

No new concept is introduced for:

- BlindReview;
- Consent;
- RightsGrant;
- Confidentiality;
- PublicArchive;
- DisclosureWorkflow.

If future requirements introduce a true user-managed consent/grant lifecycle, it should be rediscovered explicitly rather than inferred from `deckShareable`.