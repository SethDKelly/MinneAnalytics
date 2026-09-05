# 005-A — Phase Authority, Scope, Release Criteria, Evidence Taxonomy & Change Control

Status: **Complete — Phase 005 qualification authority established**  
Branch: **`concept-design/v0-implementation`**  
Precondition: **004-H v0 semantic implementation exit complete**

## 1. Purpose

005-A establishes the authority boundary for Phase 005 before security, infrastructure, live-environment, provider, performance, UX or compatibility work proceeds.

Phase 005 starts from an accepted v0 semantic implementation. The governing rule is:

> **Qualify and harden the accepted v0 without silently redesigning it.**

005-A therefore defines:

1. what later Phase 005 subgroups may change;
2. what remains outside Phase 005 execution authority;
3. release/readiness terminology;
4. evidence classes and evidence strength;
5. environment scope and mutation authority;
6. change classification and stop/amend rules;
7. blocker/residual-risk disposition;
8. branch/release-candidate discipline;
9. minimum evidence records required from 005-B through 005-J.

005-A itself performs no application, schema, infrastructure or live-environment mutation.

## 2. Starting authority

The canonical v0 semantic baseline remains the accepted Phase 004 result:

- all 17 concepts formally specified;
- all required v0 synchronizations/application policies accepted;
- all `SG-001`–`SG-018` and `SG-P01`–`SG-P04` verified-closed in the supported runtime scope;
- canonical writers active and legacy independent writer authority retired;
- semantic first-party reads active;
- physical compatibility retained as subordinate projection/adapter state;
- migration, rollback and exact-public/protected-information floors preserved.

Phase 005 evidence may reveal a defect in that baseline. It may not redefine the baseline merely because newer operational code exists.

If qualification evidence contradicts accepted semantics, the affected work must stop and the narrowest canonical owner must be amended deliberately.

## 3. Phase 005 authority model

Phase 005 uses bounded package authority rather than blanket implementation authority.

### 3.1 Allowed after 005-A

005-A authorizes later subgroups to perform the following **only within their declared package scope and dependencies**:

- dependency/security upgrades that preserve accepted semantics;
- build/container/runtime hardening;
- infrastructure/configuration corrections that preserve the accepted runtime contract;
- diagnostic, test, observability and operational tooling;
- non-destructive migration/readiness tooling;
- approved qualification-environment deployment/migration exercises once 005-D dependencies are satisfied;
- real provider/integration qualification once 005-E dependencies and credentials/authorization are satisfied;
- performance/load/accessibility/usability fixes that do not change concept/synchronization/application-policy meaning;
- compatibility inventory and deprecation planning.

Every implementation change must still retain the full Phase 004 semantic/migration regression gate unless the package explicitly adds stricter evidence.

### 3.2 Not authorized by 005-A

005-A does **not** authorize:

- new Concept Design concepts;
- material changes to concept purpose, state, actions or invariants;
- material changes to accepted synchronizations or application-policy authority;
- independent legacy writer restoration;
- weakening exact Publication or protected-information rollback floors;
- destructive compatibility schema/route removal;
- a database-platform migration;
- horizontal multi-writer SQLite;
- broad product-feature implementation;
- production deployment or production data mutation;
- creation/rotation of real provider credentials without separate operational authority;
- generic Workflow, Audit, Authorization, event-sourcing or orchestration platforms merely for hardening symmetry.

005-I may classify future product/deprecation work, but classification is not implementation authorization.

## 4. Change classes

Every Phase 005 change must be classified before implementation.

### C0 — Documentation / evidence only

Examples:

- qualification plans;
- evidence records;
- risk registers;
- runbooks that do not alter executable behavior.

Authority:

- permitted inside the owning Phase 005 subgroup.

### C1 — Implementation refinement under accepted semantics

Examples:

- tests;
- error handling;
- observability;
- packaging corrections;
- performance implementation improvements that do not change domain behavior;
- accessibility corrections that preserve action semantics.

Authority:

- permitted within the owning subgroup after its dependencies are satisfied;
- requires regression evidence.

### C2 — Security / dependency / infrastructure hardening preserving semantics

Examples:

- dependency upgrades;
- secret/configuration exposure correction;
- container hardening;
- Terraform/ECS/network corrections;
- provider SDK upgrade preserving the accepted Dispatch contract.

Authority:

- permitted only in the subgroup that owns the concern;
- requires explicit risk/evidence record and full affected regression gate;
- if semantic behavior changes, reclassify to C4 and stop.

### C3 — Qualification-environment execution or mutation

Examples:

- deploying the accepted release candidate to approved AWS dev/staging;
- classifying/migrating the mounted SQLite database;
- executing backup/restore rehearsal;
- provider handoff using approved non-production credentials;
- controlled load tests.

Authority:

- only when the owning subgroup explicitly authorizes the named environment;
- requires preflight, backup/rollback where applicable, evidence retention and stop conditions;
- production is excluded from C3 unless separately authorized after the 005-J gate.

### C4 — Semantic/design change

Examples:

- new concept state or action;
- changing Withdrawal monotonicity;
- changing exact-Revision Evaluation identity;
- making Feedback own notification success;
- changing Publication eligibility authority;
- turning an operational status into domain authority.

Authority:

- **not authorized as Phase 005 hardening**;
- stop the affected package;
- amend the narrowest canonical concept/synchronization/policy owner;
- create a deliberate implementation authorization after the design amendment.

### C5 — Product/topology/destructive compatibility change

Examples:

- new product workflow;
- horizontal scaling architecture;
- database replacement;
- removing retained compatibility columns/routes;
- large UI/product redesign.

Authority:

- not authorized by 005-A;
- may be admitted/planned by 005-I or a later explicit design phase;
- requires a separate execution gate.

## 5. Stop-and-amend rules

A subgroup must stop the affected change when any of the following occurs:

1. a test or environment observation contradicts an accepted concept invariant;
2. a security fix requires changing semantic authority rather than implementation mechanics;
3. a provider limitation would require violating Dispatch idempotency/uncertainty rules;
4. a scaling fix would require unsupported concurrent multi-writer SQLite;
5. a UX correction requires new workflow/domain state rather than presentation mechanics;
6. a migration cannot preserve a Phase 004 rollback floor;
7. a compatibility removal lacks consumer/rollback evidence;
8. a live database is non-empty but does not match a recognized migration shape;
9. evidence is ambiguous enough that proceeding would require inventing history or state;
10. a package starts depending on work owned by a later subgroup without an explicit dependency amendment.

The response to a stop condition is not “make the code pass.” It is:

```text
observe contradiction
      ↓
identify narrowest authority owner
      ↓
classify C4/C5 if necessary
      ↓
amend design/plan intentionally
      ↓
issue bounded implementation authority
      ↓
resume with new evidence
```

## 6. Environment taxonomy

Phase 005 distinguishes execution environments because evidence is not portable by assumption.

### ENV-L — local/disposable

- developer machine or disposable database;
- useful for iteration;
- not environment-qualification evidence.

### ENV-CI — hermetic CI

- reproducible automated checks;
- validates code, migrations, simulated rollback, container build and deterministic fixtures;
- cannot prove mounted AWS data/provider/network behavior.

### ENV-Q — approved qualification environment

Examples:

- AWS dev;
- staging;
- another explicitly named non-production environment with representative infrastructure/data boundaries.

ENV-Q evidence may support production readiness when the qualified scope is representative and limitations are explicit.

### ENV-P — production

- real production environment/data/provider credentials;
- no Phase 005 subgroup before 005-J receives ENV-P mutation authority merely from this plan;
- production deployment is a separate release action after an appropriate readiness approval.

Environment identity must be recorded in every environment-specific evidence artifact.

## 7. Evidence strength taxonomy

Evidence strength is independent from change class.

### E0 — assertion / plan

Examples:

- prose intention;
- unchecked checklist;
- architectural expectation.

E0 cannot satisfy a qualification criterion.

### E1 — static/repository evidence

Examples:

- code/configuration inspection;
- lockfile/SBOM snapshot;
- Terraform validation;
- policy/configuration inventory.

Useful for structure and provenance, but not runtime proof.

### E2 — reproducible isolated runtime evidence

Examples:

- unit/integration/semantic tests;
- hermetic migration rehearsal;
- application/container build;
- local provider emulator/stub;
- automated accessibility/static tests.

Normally produced in ENV-CI.

### E3 — approved qualification-environment evidence

Examples:

- actual AWS dev/staging deployment;
- mounted EFS database classification/migration;
- backup/restore against that environment;
- real provider sandbox handoff;
- representative end-to-end/browser/load exercise.

E3 is required wherever the criterion depends on infrastructure, mounted data, external provider, real network or environment configuration.

### E4 — production observation

Examples:

- post-release health/incident/performance evidence from ENV-P.

E4 may strengthen future confidence, but 005-J must not require impossible post-release evidence as a prerequisite to deciding whether a release candidate is production-ready unless a specific controlled production qualification step is separately authorized.

## 8. Evidence domains

Evidence records should also tag their concern domain:

- `SEC` — dependency/supply-chain/secrets/runtime security;
- `DEPLOY` — artifact/infrastructure/configuration/deployment;
- `DATA` — migration/backfill/backup/restore/rollback;
- `EXT` — provider/storage/external integration;
- `OPS` — observability/diagnostics/incident/recovery;
- `PERF` — performance/load/concurrency/resilience/scaling;
- `UX` — accessibility/usability/browser/device/end-to-end;
- `COMPAT` — compatibility/deprecation/external consumers;
- `SEM` — semantic-regression evidence protecting Phase 004 closure.

The domain tag does not change authority; it makes coverage/audit easier.

## 9. Required evidence record fields

Any evidence used by 005-J for a readiness claim must identify, where applicable:

- evidence ID/title;
- owning subgroup;
- change class;
- evidence strength (`E1`–`E4`);
- evidence domain;
- repository commit SHA;
- container/release artifact digest or immutable identity when relevant;
- environment (`ENV-L`, `ENV-CI`, named `ENV-Q`, or `ENV-P`);
- timestamp/run ID;
- operator or automation identity where relevant;
- exact command/check/scenario performed;
- result (`PASS`, `FAIL`, `BLOCKED`, `ACCEPTED-RISK`, `NOT-APPLICABLE`);
- produced artifacts/reports;
- known limitations/unknowns;
- rollback/recovery relevance;
- redaction handling for secrets/protected data.

A screenshot, log excerpt or green badge without subject/environment/artifact identity is supporting material, not a complete qualification record.

## 10. Readiness terminology

The following terms are not interchangeable.

### Semantic implementation accepted

Already established by 004-H.

Means:

- accepted v0 semantics are implemented and verified in the declared runtime scope.

Does **not** mean production ready.

### Build-valid

Means:

- source, migrations, tests and production artifact build successfully for the referenced commit.

### Deployment-ready artifact

Means:

- an immutable artifact/configuration set has passed the 005-B/005-C requirements needed to deploy safely to an approved qualification environment.

Does not prove mounted data has migrated.

### Environment-qualified

Means:

- the named ENV-Q environment has successfully completed its required deployment/migration/provider/smoke qualification for the declared scope.

Qualification is environment-specific.

### Operationally ready

Means:

- required observability, recovery/runbooks, incident diagnostics and supported rollback/repair procedures are available for the declared scope.

### Release candidate (RC)

Means:

- one immutable commit/artifact/configuration set is selected for final Phase 005 evidence consolidation;
- evidence must refer to that RC or to an explicitly justified equivalent artifact.

A moving branch name is not sufficient RC identity.

### Production-ready

May be declared only by 005-J for an explicitly qualified scope when:

- required security risk is resolved/accepted;
- deployment and live-data qualification is sufficient;
- provider/integration behavior is qualified where in scope;
- operational recovery is adequate;
- performance/scaling limits are understood;
- critical UX/accessibility blockers are addressed or explicitly scoped;
- residual risk is named and accepted by the gate.

Production-ready is an approval state for a release candidate. It is not proof that deployment occurred.

### Production-released

Means:

- a specifically approved RC was actually deployed to ENV-P through the authorized release process.

This is an operational fact separate from 005-J's readiness decision.

## 11. Release-blocker taxonomy

Phase 005 uses four final dispositions.

### BLOCKER

Prevents the affected readiness claim.

Examples:

- critical/high reachable vulnerability without accepted mitigation;
- unrecognized live database shape;
- failed restore rehearsal where restore is required;
- provider uncertainty semantics violated;
- exact public/protected-information floor regression;
- data integrity/invariant failure;
- inability to diagnose/recover a required critical path;
- unacceptable performance within declared supported load.

### ACCEPTED-RISK

A known residual risk accepted explicitly for the declared scope with:

- owner;
- rationale;
- mitigation/monitoring;
- expiry/review trigger where appropriate.

Accepted risk cannot be used to waive a Concept Design invariant or security rollback floor.

### OUT-OF-SCOPE

A concern intentionally excluded from the production-ready scope.

The exclusion must be visible in the readiness statement; it cannot be hidden as “not tested.”

### BACKLOG

Non-blocking future work with no current readiness claim attached.

Product-feature requests normally land here or in 005-I classification rather than being implemented during qualification.

## 12. Security/change-control rule

Security has authority to block release but not to silently redefine semantics.

For dependency/security findings:

```text
finding
  ↓
severity + reachability + affected surface
  ↓
remediate under C1/C2 if semantics preserved
  ↓
full affected regression
```

If remediation requires C4/C5 change:

```text
finding
  ↓
record blocker / residual exposure
  ↓
stop implementation
  ↓
design/topology/product decision
```

Do not use `npm audit fix --force`, broad dependency replacement, or framework migration as an unreviewed authority shortcut.

## 13. Live-environment mutation rule

No live qualification mutation occurs until the owning subgroup has:

1. named the target ENV-Q environment;
2. identified the exact RC/commit/artifact;
3. completed required predecessor gates;
4. defined preflight and stop conditions;
5. defined backup/restore or rollback strategy where data/configuration can be changed;
6. defined evidence capture/redaction;
7. confirmed production is not being mutated under ENV-Q authority.

For the AWS/EFS migration path, 005-D must preserve the 004-G bootstrap rule:

- classify before mutation;
- fail closed on unrecognized non-empty databases;
- one-time baseline adoption only for the recognized pre-004-A shape;
- backup and restore rehearsal before adoption;
- committed migrations/backfills only;
- canonical writer/security floors remain active during any semantic-read rollback.

## 14. Branch and release-candidate discipline

Phase 005 may continue planning/implementation on `concept-design/v0-implementation` unless a later subgroup intentionally creates a release/qualification branch.

Branch names are navigation, not evidence identity.

Before environment qualification or 005-J consolidation, the candidate must be pinned by immutable identifiers such as:

- Git commit SHA;
- container image digest;
- Terraform/configuration revision;
- migration set/version;
- provider/configuration version where relevant.

If the candidate changes materially after qualification, affected evidence must be rerun or explicitly shown to remain applicable.

## 15. Evidence currency

Evidence becomes stale when a material dependency changes, including:

- application/runtime code affecting the tested property;
- dependency/security upgrade affecting the surface;
- container base/runtime change;
- Terraform/infrastructure change;
- database migration/backfill change;
- provider SDK/configuration change;
- environment configuration change;
- material load/profile change;
- UI behavior change affecting the tested workflow.

Later packages must identify which prior evidence is invalidated and rerun it rather than assuming transitive validity.

## 16. Package-specific authority after 005-A

### 005-B

Authorized to perform C0–C2 dependency/security/runtime hardening on the repository branch, provided accepted semantics are preserved and regression evidence is rerun.

Not authorized for ENV-Q data migration, real production credentials or production deployment.

### 005-C

Authorized after 005-B baseline acceptance to perform C0–C2 artifact/infrastructure/configuration hardening and non-production deployment preflight mechanics.

Not authorized to claim mounted database migration success.

### 005-D

May authorize bounded C3 execution against a specifically named ENV-Q environment after 005-B and 005-C pass.

005-D does not receive ENV-P authority from this decision.

### 005-E

May perform C1–C3 provider/storage/integration qualification using approved non-production credentials/environments after its prerequisites are met.

Provider limitations cannot override the accepted Dispatch/ArtifactVersion contracts.

### 005-F

Authorized for C0–C2 observability/diagnostic/recovery/runbook work and controlled non-production recovery exercises.

### 005-G

Authorized for bounded non-production load/concurrency/resilience tests and C1/C2 performance corrections that preserve topology/semantics.

A database/topology change is C5 and must stop for separate design.

### 005-H

Authorized for accessibility/usability/browser/device qualification and C1 presentation/interaction corrections that preserve semantic action/state meaning.

### 005-I

Authorized to inventory/classify compatibility and product/deprecation findings.

It does not receive destructive-cleanup or new-feature implementation authority from 005-A.

### 005-J

Authorized to consolidate evidence and issue the final readiness disposition.

It may approve a production-ready RC for an explicit scope, but actual ENV-P deployment remains a separately authorized release action.

## 17. Phase 005 minimum exit evidence

005-J cannot issue a production-ready decision unless the qualified scope includes current evidence covering, as applicable:

1. `SEC` — dependency/supply-chain/secrets/runtime security;
2. `DEPLOY` — immutable artifact and infrastructure/configuration readiness;
3. `DATA` — real approved-environment migration/backfill/backup/restore evidence where persistent data is in scope;
4. `EXT` — real provider/storage integration evidence where those integrations are in scope;
5. `OPS` — diagnostics, incident/recovery/runbook readiness;
6. `PERF` — supported load/concurrency/resilience limits;
7. `UX` — critical end-to-end/accessibility/browser/device coverage;
8. `COMPAT` — retained compatibility/external-consumer disposition;
9. `SEM` — complete Phase 004 semantic/migration regression protection after the final material changes.

Where a domain is legitimately excluded, 005-J must state it as `OUT-OF-SCOPE`; silence is not evidence.

## 18. 005-A exit decision

005-A passes because:

- Phase 005 authority is bounded by change class and subgroup ownership;
- semantic/design changes have an explicit stop-and-amend path;
- environments are distinguished and production is not implicitly authorized;
- evidence strength prevents CI from masquerading as live qualification;
- readiness terms distinguish semantic acceptance, build validity, deployment readiness, environment qualification, operational readiness, production readiness and actual release;
- blocker/residual-risk dispositions are explicit;
- later package authorities and dependencies are named;
- release-candidate evidence must use immutable artifact identity;
- evidence invalidation/currency is explicit;
- destructive compatibility cleanup and product/topology expansion remain outside automatic authority.

Therefore:

> **005-A is complete.**
>
> **Bounded Phase 005 qualification/hardening authority is established for 005-B through 005-J under this contract.**
>
> **No production deployment, semantic redesign, destructive compatibility cleanup or topology migration is authorized by this gate.**

## 19. Handoff

Next: **005-B — Dependency, Supply-Chain, Secrets & Runtime Security Qualification**.

005-B should begin from the dependency/security findings already called out by 004-H, establish a reproducible security inventory/SBOM, classify findings by severity and reachability, and make only bounded C1/C2 corrections that preserve the accepted v0 semantics.