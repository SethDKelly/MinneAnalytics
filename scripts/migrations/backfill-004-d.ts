import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PROPOSAL_OFFER_WINDOW_KEY } from "../../lib/concept-design/lifecycle-disclosure-policy";

const prisma = new PrismaClient();

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

type CutoverRow = {
  conference_id: string;
  disclosure_cutover_at: Date | string;
};

type CountRow = { count: bigint | number };

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

function sameInstant(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return a === b;
  return a.getTime() === b.getTime();
}

async function cutoverFor(conferenceId: string): Promise<CutoverRow | null> {
  const rows = await prisma.$queryRawUnsafe<CutoverRow[]>(
    'SELECT conference_id, disclosure_cutover_at FROM "ConferencePolicyCutover" WHERE conference_id = ? LIMIT 1',
    conferenceId
  );
  return rows[0] ?? null;
}

async function policyCount(table: "ConferencePolicyCutover" | "RevisionExceptionPolicy") {
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    `SELECT COUNT(*) AS count FROM "${table}"`
  );
  return Number(rows[0]?.count ?? 0);
}

async function main() {
  const apply = hasFlag("--apply");
  const now = new Date();
  const environment = arg("--environment") ?? process.env.NODE_ENV ?? "unknown";
  const contextRef = arg("--context") ?? null;
  const outDir = path.resolve(arg("--out-dir") ?? "artifacts/migrations");
  const outPath = path.join(outDir, `004-d-backfill-${safeTimestamp(now)}.json`);

  const issues: Issue[] = [];
  const counters = {
    conferencesInspected: 0,
    availabilityWindowsCreated: 0,
    archiveRecordsCreated: 0,
    disclosureCutoversCreated: 0,
    revisionExceptionsCreated: 0,
    legacyRevisionExceptionSignals: 0,
  };

  const run = apply
    ? await prisma.migrationRun.create({
        data: {
          version: "004-D",
          kind: "AVAILABILITY_ARCHIVE_DISCLOSURE_POLICY_SEED",
          environment,
          contextRef,
          applicationCommit: process.env.GITHUB_SHA ?? null,
          schemaVersion: "20260904004000_availability_archive_authority_disclosure",
          status: "RUNNING",
        },
      })
    : null;

  const conferences = await prisma.conference.findMany({
    where: contextRef ? { id: contextRef } : undefined,
    include: {
      archiveRecord: true,
      availabilityWindows: {
        where: { opportunityKey: PROPOSAL_OFFER_WINDOW_KEY },
        take: 1,
      },
      submissions: {
        where: { abstractReviewStatus: "FEEDBACK_PENDING" },
        select: { id: true, currentRevisionId: true },
      },
      _count: { select: { controlledDisclosures: true } },
    },
  });

  for (const conference of conferences) {
    counters.conferencesInspected += 1;
    const existingWindow = conference.availabilityWindows[0] ?? null;
    const legacyOpens = conference.submissionsOpenAt;
    const legacyCloses = conference.submissionsCloseAt;

    if (existingWindow) {
      if (
        legacyOpens &&
        legacyCloses &&
        (!sameInstant(existingWindow.opensAt, legacyOpens) ||
          !sameInstant(existingWindow.closesAt, legacyCloses))
      ) {
        issues.push({
          category: "availability-window-conflict",
          disposition: "blocking-defect",
          contextRef: conference.id,
          recordRef: existingWindow.id,
          gapId: "SG-013",
          detail:
            "Canonical proposal-offer AvailabilityWindow differs from retained Conference timestamp projections.",
        });
      }
    } else if (legacyOpens && legacyCloses) {
      if (legacyOpens >= legacyCloses) {
        issues.push({
          category: "availability-window-invalid",
          disposition: "blocking-defect",
          contextRef: conference.id,
          recordRef: conference.id,
          gapId: "SG-013",
          detail: "Legacy submission-window bounds do not satisfy opensAt < closesAt.",
        });
      } else {
        if (apply) {
          await prisma.availabilityWindow.create({
            data: {
              conferenceId: conference.id,
              opportunityKey: PROPOSAL_OFFER_WINDOW_KEY,
              opensAt: legacyOpens,
              closesAt: legacyCloses,
              provenance: "BACKFILLED_CURRENT_STATE",
              observedAt: now,
            },
          });
        }
        counters.availabilityWindowsCreated += 1;
      }
    } else {
      issues.push({
        category: "availability-window-unconfigured",
        disposition: "operator-normalization-required",
        contextRef: conference.id,
        recordRef: conference.id,
        gapId: "SG-013",
        detail:
          legacyOpens || legacyCloses
            ? "Only one legacy submission-window bound exists; no sentinel bound was invented."
            : "No durable submission-window bounds exist; the context remains unavailable for canonical Proposal Offer until an operator defines them.",
      });
    }

    if (conference.status === "ARCHIVED") {
      if (!conference.archiveRecord) {
        if (apply) {
          await prisma.archiveRecord.create({
            data: {
              conferenceId: conference.id,
              archivedByRef: null,
              archivedAt: conference.archivedAt,
              provenance: "BACKFILLED_CURRENT_STATE",
              observedAt: now,
            },
          });
        }
        counters.archiveRecordsCreated += 1;
        if (!conference.archivedAt) {
          issues.push({
            category: "archive-occurrence-provenance-unknown",
            disposition: "expected-legacy-unknown",
            contextRef: conference.id,
            recordRef: conference.id,
            gapId: "SG-014",
            detail:
              "Conference is currently archived but the historical closure instant/actor is not recoverable; migration observation time was not substituted for the Archive event time.",
          });
        }
      }
    } else {
      if (conference.archiveRecord) {
        issues.push({
          category: "archive-state-conflict",
          disposition: "blocking-defect",
          contextRef: conference.id,
          recordRef: conference.archiveRecord.id,
          gapId: "SG-014",
          detail:
            "A durable ArchiveRecord exists while the compatibility Conference status is not ARCHIVED; target policy forbids reopening.",
        });
      } else if (conference.archivedAt) {
        issues.push({
          category: "archive-projection-conflict",
          disposition: "blocking-defect",
          contextRef: conference.id,
          recordRef: conference.id,
          gapId: "SG-014",
          detail:
            "Conference has archivedAt provenance while current status is not ARCHIVED; operator reconciliation is required before lifecycle cutover.",
        });
      }
    }

    const cutover = await cutoverFor(conference.id);
    if (!cutover) {
      if (conference._count.controlledDisclosures > 0) {
        issues.push({
          category: "disclosure-cutover-missing-after-native-state",
          disposition: "blocking-defect",
          contextRef: conference.id,
          recordRef: conference.id,
          gapId: "SG-005",
          detail:
            "ControlledDisclosure rows already exist but no disclosure cutover boundary is recorded; do not guess which relationships are legacy-unknown.",
        });
      } else {
        if (apply) {
          await prisma.$executeRawUnsafe(
            'INSERT INTO "ConferencePolicyCutover" (conference_id, disclosure_cutover_at) VALUES (?, ?)',
            conference.id,
            now
          );
        }
        counters.disclosureCutoversCreated += 1;
      }
    }

    for (const submission of conference.submissions) {
      counters.legacyRevisionExceptionSignals += 1;
      issues.push({
        category: "revision-exception-not-inferred",
        disposition: "expected-legacy-unknown",
        contextRef: conference.id,
        recordRef: submission.id,
        gapId: "SG-P01",
        detail:
          "Legacy FEEDBACK_PENDING state was retained as compatibility evidence only; no explicit Revision exception was fabricated from it.",
      });
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
        proposalOfferWindows: await prisma.availabilityWindow.count({
          where: {
            opportunityKey: PROPOSAL_OFFER_WINDOW_KEY,
            ...(contextRef ? { conferenceId: contextRef } : {}),
          },
        }),
        archiveRecords: await prisma.archiveRecord.count({
          where: contextRef ? { conferenceId: contextRef } : undefined,
        }),
        controlledDisclosures: await prisma.controlledDisclosure.count({
          where: contextRef ? { conferenceId: contextRef } : undefined,
        }),
        policyCutovers: await policyCount("ConferencePolicyCutover"),
        revisionExceptions: await policyCount("RevisionExceptionPolicy"),
      }
    : null;

  const report = {
    phase: "004-D",
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
        sourceCountsJson: JSON.stringify({ conferences: conferences.length }),
        targetCountsJson: JSON.stringify(targetCounts),
        provenanceCountsJson: JSON.stringify({
          availabilityWindowsCreated: counters.availabilityWindowsCreated,
          archiveRecordsCreated: counters.archiveRecordsCreated,
          disclosureCutoversCreated: counters.disclosureCutoversCreated,
          fabricatedRevisionExceptions: counters.revisionExceptionsCreated,
        }),
        issueCountsJson: JSON.stringify(report.issueCounts),
        invariantResultsJson: JSON.stringify({ blockingDefects: blocking }),
        paritySummaryJson: JSON.stringify({
          availabilityConflicts: issues.filter((x) => x.category === "availability-window-conflict").length,
          archiveConflicts: issues.filter((x) => x.category.startsWith("archive-") && x.disposition === "blocking-defect").length,
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
