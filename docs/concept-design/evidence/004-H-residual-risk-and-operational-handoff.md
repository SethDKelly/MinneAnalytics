# 004-H — Residual Risk & Operational Handoff

Status: **Phase 004 exit evidence**  
Branch: **`concept-design/v0-implementation`**

## 1. Purpose

Separate semantic implementation closure from operational facts that have not yet been demonstrated in a live deployment.

The Phase 004 exit decision must not turn missing live-environment evidence into either:

- a false production-readiness claim; or
- an artificial reopening of already-verified Concept Design semantic gaps.

## 2. Exit boundary

004-H may accept the v0 semantic implementation while explicitly withholding a production-release decision.

The repository/CI evidence proves:

- fresh database migration and semantic reconciliation;
- recognized pre-004-A database backup/restore/baseline adoption/migration/reconciliation;
- target-native runtime semantics across 004-B through 004-H;
- compatibility repair and read rollback;
- Terraform structural validity for the current dev topology;
- optimized Next.js production build;
- production Docker image build.

It does **not** prove that the currently mounted AWS dev EFS database has already followed that path.

## 3. Live AWS/EFS qualification remains unexecuted

004-G/004-H deliberately do not mutate the current AWS dev environment.

Therefore the following remain live operational obligations:

1. deploy the accepted image/configuration through the migration-safe dev workflow;
2. allow the bootstrap to classify the mounted SQLite database;
3. if it is a recognized pre-004-A database without `_prisma_migrations`, explicitly authorize the one-time baseline-adoption path;
4. retain the backup/restore rehearsal evidence created before adoption;
5. inspect the 004-B/004-C/004-D/004-E/004-H backfill reports for blocking defects or legacy-unknown classifications;
6. verify the application starts and serves expected organizer/reviewer/presenter/public flows after migration;
7. retain canonical writers and exact Publication authorization floors if semantic-read rollback is required.

An unrecognized non-empty database must continue to fail closed rather than be guessed into a migration generation.

## 4. SQLite deployment topology

The current dev posture remains a single ECS task with SQLite on EFS.

The deployment policy stops the old task before the new task performs migration/bootstrap. This brief outage is intentional and is part of the correctness boundary.

Phase 004 does not authorize horizontally scaled multi-writer SQLite. A future availability/scaling requirement that needs concurrent writers should be treated as an architecture change, not silently enabled by raising ECS desired count.

## 5. Dependency/security triage

The successful Phase 004 CI installation currently reports npm audit findings during `npm ci`.

These findings were not the subject of the Concept Design semantic reconciliation and were not individually assessed for reachability or exploitability in Phase 004.

Before a production-release decision, dependency/security work should:

- run and preserve an explicit dependency audit/SBOM result;
- classify findings by runtime reachability and severity;
- upgrade/remediate where supported;
- document accepted residual risk where immediate remediation is not feasible;
- retest the full Phase 004 semantic/migration gate after dependency upgrades.

A green semantic implementation gate must not be misread as a dependency-vulnerability waiver.

## 6. Provider/integration qualification

The repository's Dispatch execution currently exercises the existing email provider stub while preserving exact message/attempt/send evidence semantics.

The semantic model is provider-neutral, but production provider qualification remains separate operational work. A real provider integration must preserve:

- stable provider idempotency identity where supported;
- known-success vs known-failure vs uncertain-outcome classification;
- no blind retry after uncertain handoff;
- exact rendered message evidence;
- same-round semantic uniqueness.

Likewise, production storage/infrastructure changes must preserve exact ArtifactVersion/resource-boundary recovery semantics rather than replacing them with implicit success assumptions.

## 7. Feedback notification behavior

004-H deliberately removes the old hidden coupling in which recording Feedback also changed `abstractReviewStatus` and directly sent an email.

The v0 Feedback command is now record-only.

If product requirements call for automatic presenter notification later, implement it as an explicit independent Dispatch purpose/synchronization. Do not restore direct email as part of Feedback and do not make notification success a precondition for the Feedback fact.

This is a product/operational follow-on, not an open SG-017 semantic defect.

## 8. Compatibility deprecation remains evidence-driven

004-G retained compatibility projections and adapter URLs because they still provide rollback value and because repository evidence cannot prove absence of external consumers.

Future physical cleanup should occur only after:

- semantic-read rollback is no longer required for the relevant surface;
- external-consumer/deprecation evidence exists;
- migration/history evidence is preserved;
- destructive migration rollback consequences are understood.

No cleanup deadline is invented by 004-H.

## 9. Recommended next planning boundary

The next body of work should be planned as **post-v0 operational qualification and product hardening**, not as a continuation of unresolved Phase 004 semantic implementation.

A future phase may include live deployment qualification, dependency/security hardening, provider integration, operational observability, performance/load testing, accessibility/usability validation, and product backlog work—but should be subdivided deliberately before execution.

004-H does not pre-authorize those changes.