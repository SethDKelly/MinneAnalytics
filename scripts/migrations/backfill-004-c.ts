import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  PrismaClient,
  type ProgramStatus,
  type SelectionDisposition,
} from "@prisma/client";
import {
  capacityLimitFromConference,
  presenterActorRef,
  programStatusFromCanonical,
} from "../../lib/concept-design/selection-participation-deliverable";

const prisma = new PrismaClient();
const PROGRAM_CAPACITY_KEY = "program-slots";
const STANDARD_CAPACITY_CLASS = "standard";
const DECK_DELIVERABLE_KIND = "deck";

type Disposition =
  | "blocking-defect"
  | "expected-legacy-unknown"
  | "operator-normalization-required";

type Issue = {
  category: string;
  disposition: Disposition;
  contextRef: string | null;
  recordRef: string | null;
  gapId: string | null;
  detail: string;
};

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function safeTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function legacySelectionSeed(
  status: ProgramStatus,
  approvedAt: Date | null
): SelectionDisposition | null {
  if (status === "APPROVED") return "SELECTED";
  if (status === "BACKUP") return "RESERVE";
  if (status === "DECLINED") return "NOT_SELECTED";
  if (status === "WITHDRAWN" && approvedAt) return "SELECTED";
  return null;
}

async function main() {
  const apply = hasFlag("--apply");
  const now = new Date();
  const environment = arg("--environment") ?? process.env.NODE_ENV ?? "unknown";
  const contextRef = arg("--context") ?? null;
  const outDir = path.resolve(arg("--out-dir") ?? "artifacts/migrations");
  const outPath = path.join(outDir, `004-c-backfill-${safeTimestamp(now)}.json`);
  const issues: Issue[] = [];
  const counters = {
    conferencesInspected: 0,
    submissionsInspected: 0,
    selectionSeedsCreated: 0,
    withdrawalSeedsCreated: 0,
    capacityPoolsCreated: 0,
    capacityRatesCreated: 0,
    capacityAllocationsCreated: 0,
    deliverablesCreated: 0,
    artifactsLinked: 0,
    artifactPredecessorsLinked: 0,
    deliverableCurrentPointersSet: 0,
    assessmentsSeeded: 0,
  };

  const run = apply
    ? await prisma.migrationRun.create({
        data: {
          version: "004-C",
          kind: "PARTICIPATION_DELIVERABLE_CURRENT_STATE_BACKFILL",
          environment,
          contextRef,
          applicationCommit: process.env.GITHUB_SHA ?? null,
          schemaVersion: "20260904003000_selection_withdrawal_capacity_deliverable",
          status: "RUNNING",
        },
      })
    : null;

  const conferences = await prisma.conference.findMany({
    where: contextRef ? { id: contextRef } : undefined,
    include: {
      submissions: {
        include: {
          currentSelectionDecision: true,
          withdrawal: true,
          capacityAllocations: true,
          deliverables: true,
          deckFiles: { orderBy: [{ version: "asc" }, { uploadedAt: "asc" }] },
        },
      },
      capacityPools: {
        include: { classRates: true, allocations: true },
      },
    },
  });

  for (const conference of conferences) {
    counters.conferencesInspected += 1;
    counters.submissionsInspected += conference.submissions.length;
    const limit = capacityLimitFromConference(conference);
    if (limit < 0) {
      issues.push({
        category: "capacity-invalid-limit",
        disposition: "blocking-defect",
        contextRef: conference.id,
        recordRef: conference.id,
        gapId: "SG-004",
        detail: `Configured program Capacity limit is negative (${limit}).`,
      });
      continue;
    }

    for (const submission of conference.submissions) {
      const seedDisposition = legacySelectionSeed(
        submission.programStatus,
        submission.approvedAt
      );

      if (!submission.currentSelectionDecisionId && seedDisposition) {
        if (apply) {
          const decision = await prisma.selectionDecision.create({
            data: {
              conferenceId: conference.id,
              submissionId: submission.id,
              disposition: seedDisposition,
              decidedByRef: null,
              decidedAt: submission.approvedAt,
              provenance: "BACKFILLED_CURRENT_STATE",
            },
          });
          await prisma.submission.update({
            where: { id: submission.id },
            data: { currentSelectionDecisionId: decision.id },
          });
        }
        counters.selectionSeedsCreated += 1;
      }

      if (submission.programStatus === "WITHDRAWN" && !submission.withdrawal) {
        if (apply) {
          await prisma.withdrawalRecord.create({
            data: {
              submissionId: submission.id,
              withdrawnByRef: null,
              withdrawnAt: submission.withdrawnAt,
              provenance: "BACKFILLED_CURRENT_STATE",
            },
          });
        }
        counters.withdrawalSeedsCreated += 1;
      }
    }

    const refreshed = apply
      ? await prisma.submission.findMany({
          where: { conferenceId: conference.id },
          include: {
            currentSelectionDecision: true,
            withdrawal: true,
            capacityAllocations: true,
            deliverables: true,
            deckFiles: { orderBy: [{ version: "asc" }, { uploadedAt: "asc" }] },
          },
        })
      : conference.submissions.map((submission) => ({
          ...submission,
          currentSelectionDecision:
            submission.currentSelectionDecision ??
            (legacySelectionSeed(submission.programStatus, submission.approvedAt)
              ? {
                  id: `dry-selection:${submission.id}`,
                  disposition: legacySelectionSeed(
                    submission.programStatus,
                    submission.approvedAt
                  ),
                }
              : null),
          withdrawal:
            submission.withdrawal ??
            (submission.programStatus === "WITHDRAWN"
              ? { id: `dry-withdrawal:${submission.id}` }
              : null),
        }));

    const existingPool = apply
      ? await prisma.capacityPool.findUnique({
          where: {
            conferenceId_key: {
              conferenceId: conference.id,
              key: PROGRAM_CAPACITY_KEY,
            },
          },
          include: { classRates: true, allocations: true },
        })
      : conference.capacityPools.find((pool) => pool.key === PROGRAM_CAPACITY_KEY) ?? null;

    if (existingPool && existingPool.limitUnits !== limit) {
      issues.push({
        category: "capacity-pool-limit-conflict",
        disposition: "blocking-defect",
        contextRef: conference.id,
        recordRef: existingPool.id,
        gapId: "SG-004",
        detail: `Existing canonical Pool limit ${existingPool.limitUnits} conflicts with validated legacy configuration ${limit}.`,
      });
      continue;
    }

    let poolId = existingPool?.id ?? `dry-pool:${conference.id}`;
    if (!existingPool) {
      if (apply) {
        const pool = await prisma.capacityPool.create({
          data: {
            conferenceId: conference.id,
            key: PROGRAM_CAPACITY_KEY,
            limitUnits: limit,
            provenance: "BACKFILLED_CURRENT_STATE",
          },
        });
        poolId = pool.id;
      }
      counters.capacityPoolsCreated += 1;
    }

    const rate = apply
      ? await prisma.capacityClassRate.findUnique({
          where: {
            poolId_classRef: {
              poolId,
              classRef: STANDARD_CAPACITY_CLASS,
            },
          },
        })
      : existingPool?.classRates.find(
          (item) => item.classRef === STANDARD_CAPACITY_CLASS
        ) ?? null;

    if (rate && rate.units !== 1) {
      issues.push({
        category: "capacity-standard-rate-conflict",
        disposition: "blocking-defect",
        contextRef: conference.id,
        recordRef: poolId,
        gapId: "SG-004",
        detail: `Standard v0 Capacity rate is ${rate.units}; expected one unit.`,
      });
      continue;
    }
    if (!rate) {
      if (apply) {
        await prisma.capacityClassRate.create({
          data: { poolId, classRef: STANDARD_CAPACITY_CLASS, units: 1 },
        });
      }
      counters.capacityRatesCreated += 1;
    }

    const effective = refreshed.filter(
      (submission) =>
        submission.currentSelectionDecision?.disposition === "SELECTED" &&
        !submission.withdrawal
    );
    if (effective.length > limit) {
      issues.push({
        category: "capacity-migrated-overcommit",
        disposition: "blocking-defect",
        contextRef: conference.id,
        recordRef: poolId,
        gapId: "SG-004",
        detail: `${effective.length} effectively participating Proposals exceed the validated Capacity limit ${limit}; the Pool was not enlarged.`,
      });
      continue;
    }

    for (const submission of effective) {
      const active = apply
        ? await prisma.capacityAllocation.findFirst({
            where: { poolId, submissionId: submission.id, releasedAt: null },
          })
        : submission.capacityAllocations.find(
            (allocation) => allocation.poolId === poolId && !allocation.releasedAt
          ) ?? null;

      if (active) {
        if (
          active.classRef !== STANDARD_CAPACITY_CLASS ||
          active.unitsApplied !== 1
        ) {
          issues.push({
            category: "capacity-allocation-conflict",
            disposition: "blocking-defect",
            contextRef: conference.id,
            recordRef: active.id,
            gapId: "SG-004",
            detail: "Existing active Allocation does not match the v0 one-unit standard class.",
          });
        }
      } else {
        if (apply) {
          await prisma.capacityAllocation.create({
            data: {
              poolId,
              submissionId: submission.id,
              classRef: STANDARD_CAPACITY_CLASS,
              unitsApplied: 1,
              allocatedByRef: null,
              allocatedAt: null,
              provenance: "BACKFILLED_CURRENT_STATE",
            },
          });
        }
        counters.capacityAllocationsCreated += 1;
      }

      let deliverable = apply
        ? await prisma.deliverableRequirement.findUnique({
            where: {
              submissionId_kindKey: {
                submissionId: submission.id,
                kindKey: DECK_DELIVERABLE_KIND,
              },
            },
          })
        : submission.deliverables.find(
            (item) => item.kindKey === DECK_DELIVERABLE_KIND
          ) ?? null;

      if (!deliverable) {
        if (apply) {
          deliverable = await prisma.deliverableRequirement.create({
            data: {
              submissionId: submission.id,
              responsibleRef: presenterActorRef(submission.id),
              kindKey: DECK_DELIVERABLE_KIND,
              provenance: "BACKFILLED_CURRENT_STATE",
            },
          });
        } else {
          deliverable = {
            id: `dry-deliverable:${submission.id}`,
            submissionId: submission.id,
            responsibleRef: presenterActorRef(submission.id),
            kindKey: DECK_DELIVERABLE_KIND,
            currentArtifactId: null,
            provenance: "BACKFILLED_CURRENT_STATE",
            createdAt: now,
          };
        }
        counters.deliverablesCreated += 1;
      }

      const artifacts = submission.deckFiles;
      for (let index = 0; index < artifacts.length; index += 1) {
        const artifact = artifacts[index];
        const predecessor = index > 0 ? artifacts[index - 1] : null;
        if (artifact.deliverableId && artifact.deliverableId !== deliverable.id) {
          issues.push({
            category: "deliverable-artifact-owner-conflict",
            disposition: "blocking-defect",
            contextRef: conference.id,
            recordRef: artifact.id,
            gapId: "SG-007",
            detail: `ArtifactVersion is already attached to another Deliverable (${artifact.deliverableId}).`,
          });
          continue;
        }
        if (
          artifact.predecessorArtifactId &&
          artifact.predecessorArtifactId !== predecessor?.id
        ) {
          issues.push({
            category: "deliverable-artifact-chain-conflict",
            disposition: "blocking-defect",
            contextRef: conference.id,
            recordRef: artifact.id,
            gapId: "SG-007",
            detail: "Existing ArtifactVersion predecessor conflicts with logical version order.",
          });
          continue;
        }
        if (apply && !artifact.deliverableId) {
          await prisma.deckFile.update({
            where: { id: artifact.id },
            data: { deliverableId: deliverable.id },
          });
        }
        if (!artifact.deliverableId) counters.artifactsLinked += 1;
        if (apply && predecessor && !artifact.predecessorArtifactId) {
          await prisma.deckFile.update({
            where: { id: artifact.id },
            data: { predecessorArtifactId: predecessor.id },
          });
        }
        if (predecessor && !artifact.predecessorArtifactId) {
          counters.artifactPredecessorsLinked += 1;
        }
      }

      const latest = artifacts.at(-1) ?? null;
      if (latest) {
        if (
          deliverable.currentArtifactId &&
          deliverable.currentArtifactId !== latest.id
        ) {
          issues.push({
            category: "deliverable-current-artifact-conflict",
            disposition: "blocking-defect",
            contextRef: conference.id,
            recordRef: deliverable.id,
            gapId: "SG-007",
            detail: `Current Deliverable pointer conflicts with latest retained ArtifactVersion ${latest.id}.`,
          });
        } else if (!deliverable.currentArtifactId) {
          if (apply) {
            await prisma.deliverableRequirement.update({
              where: { id: deliverable.id },
              data: { currentArtifactId: latest.id },
            });
          }
          counters.deliverableCurrentPointersSet += 1;
        }

        const desiredAssessment =
          submission.deckStatus === "APPROVED"
            ? "READY"
            : submission.deckStatus === "CONCERN"
              ? "CONCERN"
              : null;
        const currentAssessment = apply
          ? latest.currentAssessmentId
            ? await prisma.deliverableAssessment.findUnique({
                where: { id: latest.currentAssessmentId },
              })
            : null
          : null;

        if (desiredAssessment) {
          if (
            currentAssessment &&
            currentAssessment.disposition !== desiredAssessment
          ) {
            issues.push({
              category: "deliverable-assessment-conflict",
              disposition: "blocking-defect",
              contextRef: conference.id,
              recordRef: latest.id,
              gapId: "SG-007",
              detail: `Current Assessment ${currentAssessment.disposition} conflicts with legacy current-state ${desiredAssessment}.`,
            });
          } else if (!latest.currentAssessmentId) {
            if (apply) {
              const assessment = await prisma.deliverableAssessment.create({
                data: {
                  artifactVersionId: latest.id,
                  disposition: desiredAssessment,
                  detail: null,
                  reviewedByRef: null,
                  reviewedAt: null,
                  provenance: "BACKFILLED_CURRENT_STATE",
                },
              });
              await prisma.deckFile.update({
                where: { id: latest.id },
                data: { currentAssessmentId: assessment.id },
              });
            }
            counters.assessmentsSeeded += 1;
          }
        } else if (submission.deckStatus === "REVIEWED") {
          issues.push({
            category: "deliverable-reviewed-legacy-residue",
            disposition: "expected-legacy-unknown",
            contextRef: conference.id,
            recordRef: latest.id,
            gapId: "SG-007",
            detail: "Legacy REVIEWED has no canonical concern/ready meaning; no Assessment was invented.",
          });
        } else if (
          submission.deckStatus === "SUBMITTED" &&
          latest.currentAssessmentId
        ) {
          issues.push({
            category: "deliverable-submitted-assessment-conflict",
            disposition: "blocking-defect",
            contextRef: conference.id,
            recordRef: latest.id,
            gapId: "SG-007",
            detail: "Legacy SUBMITTED conflicts with an existing exact current ArtifactVersion Assessment.",
          });
        }
      }
    }

    const parityRows = apply
      ? await prisma.submission.findMany({
          where: { conferenceId: conference.id },
          include: { currentSelectionDecision: true, withdrawal: true },
        })
      : refreshed;

    for (const submission of parityRows) {
      const canonicalProjection = programStatusFromCanonical({
        disposition: submission.currentSelectionDecision?.disposition ?? null,
        withdrawn: Boolean(submission.withdrawal),
      });
      if (canonicalProjection !== submission.programStatus) {
        issues.push({
          category: "participation-compatibility-parity",
          disposition: "blocking-defect",
          contextRef: conference.id,
          recordRef: submission.id,
          gapId: submission.withdrawal ? "SG-003" : "SG-002",
          detail: `Canonical Selection/Withdrawal projects ${canonicalProjection}, but legacy programStatus is ${submission.programStatus}.`,
        });
      }
    }
  }

  const blocking = issues.filter((issue) => issue.disposition === "blocking-defect").length;
  const unknown = issues.filter(
    (issue) => issue.disposition === "expected-legacy-unknown"
  ).length;
  const normalization = issues.filter(
    (issue) => issue.disposition === "operator-normalization-required"
  ).length;
  const status = blocking > 0 ? "BLOCKED" : "COMPLETE";

  const targetCounts = apply
    ? {
        selectionDecisions: await prisma.selectionDecision.count({
          where: contextRef ? { conferenceId: contextRef } : undefined,
        }),
        withdrawals: await prisma.withdrawalRecord.count({
          where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
        }),
        capacityPools: await prisma.capacityPool.count({
          where: contextRef ? { conferenceId: contextRef } : undefined,
        }),
        activeAllocations: await prisma.capacityAllocation.count({
          where: {
            releasedAt: null,
            ...(contextRef ? { submission: { conferenceId: contextRef } } : {}),
          },
        }),
        deliverables: await prisma.deliverableRequirement.count({
          where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
        }),
        assessments: await prisma.deliverableAssessment.count({
          where: contextRef
            ? { artifactVersion: { submission: { conferenceId: contextRef } } }
            : undefined,
        }),
      }
    : null;

  const report = {
    phase: "004-C",
    mode: apply ? "apply" : "dry-run",
    environment,
    contextRef,
    generatedAt: now.toISOString(),
    status,
    counters,
    issueCounts: {
      blocking,
      expectedLegacyUnknown: unknown,
      operatorNormalizationRequired: normalization,
      total: issues.length,
    },
    targetCounts,
    issues,
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (run) {
    for (const issue of issues) {
      await prisma.migrationIssue.create({
        data: {
          runId: run.id,
          category: issue.category,
          disposition: issue.disposition,
          contextRef: issue.contextRef,
          recordRef: issue.recordRef,
          gapId: issue.gapId,
          detail: issue.detail,
        },
      });
    }
    await prisma.migrationRun.update({
      where: { id: run.id },
      data: {
        status,
        completedAt: new Date(),
        sourceCountsJson: JSON.stringify({
          conferences: conferences.length,
          submissions: counters.submissionsInspected,
        }),
        targetCountsJson: JSON.stringify(targetCounts),
        provenanceCountsJson: JSON.stringify({
          selectionSeedsCreated: counters.selectionSeedsCreated,
          withdrawalSeedsCreated: counters.withdrawalSeedsCreated,
          allocationsCreated: counters.capacityAllocationsCreated,
          deliverablesCreated: counters.deliverablesCreated,
          assessmentsSeeded: counters.assessmentsSeeded,
          legacyUnknowns: unknown,
        }),
        issueCountsJson: JSON.stringify(report.issueCounts),
        invariantResultsJson: JSON.stringify({
          blockingDefects: blocking,
          capacityOvercommitDefects: issues.filter(
            (issue) => issue.category === "capacity-migrated-overcommit"
          ).length,
        }),
        paritySummaryJson: JSON.stringify({
          participationParityDefects: issues.filter(
            (issue) => issue.category === "participation-compatibility-parity"
          ).length,
        }),
      },
    });
  }

  console.log(outPath);
  if (blocking > 0) process.exitCode = 2;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
