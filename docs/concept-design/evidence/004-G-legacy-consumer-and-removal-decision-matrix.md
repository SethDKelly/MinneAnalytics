# 004-G — Legacy Consumer & Removal Decision Matrix

Status: **Accepted cleanup gate evidence**  
Branch: **`concept-design/v0-implementation`**

## 1. Decision rule

004-G distinguishes three different things that must not be conflated:

1. **legacy semantic authority** — old state may decide domain truth independently;
2. **compatibility projection** — old shape is retained but is derived from canonical owners;
3. **physical residue** — old column/enum/route remains present even though it has no canonical authority.

The removal gate is not satisfied merely because a field is old. Physical removal requires positive evidence that first-party behavior no longer depends on it, rollback value is exhausted, external compatibility exposure is understood, security/history cannot regress, and deletion provides enough benefit to justify an irreversible schema/contract contraction.

004-G's central decision is:

> **Retire legacy authority now; retain useful compatibility physically. No destructive schema contraction is authorized in 004-G.**

## 2. Matrix

| Surface | Current semantic role | First-party dependency after 004-F | Rollback / external value | Risk if removed now | 004-G disposition | Future removal trigger |
| --- | --- | --- | --- | --- | --- | --- |
| Phase 004 write feature flags | Former staged rollout switches | first-party writers call guarded canonical paths | none as writer rollback; dangerous if treated as authority switches | could reactivate legacy writers if false retained old meaning | **authority switch retired now**; write gates hard-locked canonical-on | code may later remove dead flag plumbing after 004-H/maintenance review |
| `Submission.programStatus` | projection of Selection + Withdrawal | no longer first-party semantic authority | useful for controlled read rollback and unknown external clients | deleting removes a verified rollback representation | **retain projection** | external inventory + end of read-rollback window |
| `/api/chair/program-status` | legacy-shaped organizer endpoint | first-party chair UI uses Selection endpoint | possible undocumented client compatibility | URL deletion could break external callers; direct legacy branch is now unreachable | **retain as canonical adapter** | explicit API deprecation window and consumer evidence |
| `Submission.abstractVersion` | current Revision ordinal projection | exact RevisionRef is semantic authority | useful compatibility/read rollback; external CSV/API familiarity | deleting complicates rollback and historic consumer support | **retain projection** | after external ordinal consumers are retired |
| mutable Submission `title` / `abstract` / `bio` / `technicalLevel` | current Revision convenience projection | first-party semantic reads use exact current Revision | efficient compatibility/read rollback and legacy query shape | deleting forces wider query migration with little semantic benefit | **retain projection** | separate performance/storage justification after rollback window |
| `SubmissionTheme` | current Revision Classification projection | current Classification authority is exact `RevisionTerm` | useful rollback/current-query compatibility | deletion removes repairable current projection while history is already canonical elsewhere | **retain projection** | external/current-query inventory proves unused |
| `Submission.abstractReviewStatus` | pre-concept review workflow/status residue | no canonical semantic owner; first-party reviewer views use Evaluation applicability | possible external/report compatibility only | destructive removal not justified without external inventory | **retain non-authoritative residue** | explicit consumer search + deprecation; then destructive migration if worthwhile |
| `Score.scoredAbstractVersion` and related ordinal migration fields | migration/compatibility evidence for legacy Evaluation subject | exact `submissionRevisionId` is canonical subject | supports legacy-unknown classification and migration auditability | removal can erase provenance needed to explain old data | **retain migration evidence** | only after historic audit requirements explicitly expire |
| `Submission.deckStatus` | projection of current ArtifactVersion + Assessment | first-party deck UI uses Deliverable readiness | read rollback + external compatibility | deletion removes tested rollback projection | **retain projection** | after rollback/external compatibility window |
| `DeckStatus.REVIEWED` enum value | non-canonical historic residue | no first-party semantic action creates it | legacy database/API decoding compatibility | enum contraction is destructive and yields little present benefit | **retain residue, never create canonically** | later compatibility cleanup migration after inventory |
| `/api/chair/deck-status` | legacy-shaped deck-review endpoint | first-party UI uses Deliverable Assessment endpoint | possible external client compatibility | deleting endpoint without inventory is avoidable breakage | **retain as canonical adapter** | explicit API deprecation + consumer proof |
| `Submission.deckShareable` | projection of current ShareEligibilityChange | sharing decisions use canonical change history | read rollback/current compatibility | deletion weakens rollback and legacy exports | **retain projection** | after compatibility window and external inventory |
| `Conference.decksPublished` | collection/surface-level public presentation gate | still intentionally used as collection gate, not Publication identity | active application-policy value | removal would change accepted collection behavior | **retain intentionally** | only if collection gate is redesigned canonically |
| Conference `status` / mode projections | application lifecycle/configuration presentation | ArchiveRecord is monotonic closure authority; status still useful setup/display policy | operational compatibility | deleting would conflate Archive with broader lifecycle mode | **retain intentionally** | only through separate lifecycle redesign |
| `submissionsOpen`, `submissionsOpenAt`, `submissionsCloseAt` | legacy/current availability compatibility inputs/projections | canonical AvailabilityWindow + suspension policy drive migrated first-party reads | migration, admin compatibility and current representation | deletion before full admin/API retirement gives little benefit | **retain compatibility** | after all administration and external consumers use canonical Window/suspension model |
| `DeckFile.publicId` | stable address/token compatibility | exact Publication controls authorization | required locator for public URL | removal would break public identifiers and is not merely legacy authority | **retain intentionally** | only with separate public-address redesign/migration |
| mutable parent-state public authorization fallback | old authorization mechanism | no legitimate first-party need after Publication cutover | none | security regression if restored | **permanently retired** | no rollback trigger; exact Publication floor is irreversible |
| legacy direct Revision/Evaluation writer fallback branches | old independent write authority | canonical writer is always selected after 004-G gate semantics | none | would erase/overwrite history semantics if reactivated | **unreachable; authority retired** | delete dead code in later maintenance once 004-H closes evidence |
| legacy direct Selection/Withdrawal writer fallback branches | old generic status mutation authority | canonical Selection/Withdrawal writers selected | none | reactivation collapses independent concepts/history | **unreachable; authority retired** | later dead-code removal |
| legacy direct Schedule mutation fallback | old generator-is-authority behavior | canonical proposal/apply path selected | none | reactivation permits partial/destructive schedule rewrite | **unreachable; authority retired** | later dead-code removal |
| legacy Dispatch send fallback | old perform/record ordering and same-round bypass behavior | canonical Dispatch path selected | none | reactivation weakens idempotency/evidence | **unreachable; authority retired** | later dead-code removal |
| `prisma db push` package command | disposable local schema convenience | no persistent deployment dependency | useful only for explicitly disposable/local experiments | deleting is unnecessary; using in production is dangerous | **retain local-only command; production use retired** | optional future tooling simplification |
| container startup `prisma db push` | former production schema path | none | none | bypasses committed migration history | **removed now** | never restore for persistent environments |
| migration/backfill scripts | migration and evidence infrastructure | deployment bootstrap uses backfills; audits need them | high historical/recovery value | deletion destroys reproducibility and recovery evidence | **retain** | no routine cleanup; archive only through explicit future migration-history policy |
| checked-in pre-004-A SQLite fixture | legacy adoption rehearsal input | CI adoption rehearsal uses it | high verification value | deletion removes executable legacy-upgrade evidence | **retain test fixture** | replace only with equivalent deterministic fixture |
| `SEED_ON_START` | fresh-environment convenience | deployment may optionally use it | useful fresh bootstrap | unsafe against non-empty persistent database | **retain but hard-limit to fresh DB** | optional future dev tooling redesign |
| `MINNE_ALLOW_LEGACY_BASELINE_ADOPTION` | one-time explicit adoption authorization | normally false | necessary only for pre-migration live DB adoption | leaving permanently true normalizes exceptional path | **retain explicit one-deployment switch, default false** | remove after every supported persistent environment has migration history |
| `MINNE_V0_SEMANTIC_READS` | reversible read cutover switch | semantic reads default on | intentional controlled read rollback | removing before operational confidence window eliminates reversible read behavior | **retain read rollback switch** | 004-H or later ops evidence explicitly ends rollback window |
| `MINNE_RUN_SEMANTIC_BACKFILLS` | deployment bootstrap control | default on in deployment | recovery/diagnostic control | disabling casually can leave target incomplete | **retain operational switch, deploy true** | only after all supported environments are permanently canonicalized and startup backfill is no longer needed |

## 3. Why no destructive schema migration is approved

004-F proved first-party semantic authority no longer belongs to the retained compatibility fields. 004-G then proved those fields can be reconstructed from canonical owners and can support a controlled read rollback without changing canonical history.

That creates an asymmetry:

- the **semantic cost** of retaining them is low because they are subordinate projections;
- the **operational value** of retaining them remains non-zero because they provide a rollback representation and possible external compatibility;
- the **benefit of deleting them now** is largely aesthetic/schema-minimization;
- the **cost of deleting them now** is irreversible compatibility and rollback contraction.

Therefore destructive removal does not pass the 004-G benefit/risk threshold.

## 4. API compatibility decision

Old generic endpoints such as `program-status` and `deck-status` are not first-party design contracts anymore, but URL compatibility has independent value.

004-G does not have evidence of every external caller outside the repository. Deleting those endpoints would therefore claim knowledge the repository cannot supply.

The safe disposition is:

```text
old endpoint shape
        ↓
canonical adapter
        ↓
canonical writer / history
```

not:

```text
old endpoint shape
        ↓
legacy direct mutation
```

and not premature URL deletion.

## 5. Dead legacy branches versus retained adapters

Some source branches remain syntactically present behind historical write gates. 004-G changes the central gate semantics so write-authority gates always return true. Those branches are therefore unreachable through deployment configuration.

They may be physically removed in a later maintenance cleanup after 004-H because doing so would be code simplification, not semantic cutover. Their presence does not represent retained authority.

## 6. Read rollback window

The only deliberate authority switch left reversible is semantic read selection.

Before disabling semantic reads, operators must:

1. run the bounded canonical-to-compatibility repair;
2. verify parity and investigate defects/legacy-unknowns;
3. disable only `MINNE_V0_SEMANTIC_READS`;
4. keep canonical writers enabled;
5. keep exact Publication authorization active.

This window is the strongest reason not to contract compatibility storage in 004-G.

## 7. Final cleanup gate decision

### Approved now

- remove production `prisma db push` behavior;
- make persistent deployment use checked-in migrations and semantic backfills;
- hard-lock canonical writer authority against feature-flag rollback;
- keep exact Publication authorization on its irreversible security floor;
- make legacy baseline adoption explicit and fail closed by default;
- prevent destructive seed on existing data;
- prevent old/new ECS tasks from concurrently touching shared SQLite during migration;
- provide and verify canonical-to-compatibility repair;
- reduce Docker context and make image migration tooling self-contained.

### Not approved now

- dropping compatibility columns;
- deleting compatibility enums/values such as `REVIEWED`;
- deleting generic compatibility API routes;
- deleting migration/backfill evidence;
- deleting legacy fixtures used for upgrade rehearsal;
- removing the semantic-read rollback switch.

### Gate conclusion

**Legacy semantic authority is retired. Physical compatibility is intentionally retained. No destructive schema cleanup is required for Phase 004 to proceed to its final exit review.**
