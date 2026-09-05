import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { DECK_ARCHIVE_SURFACE_KEY } from "../../lib/concept-design/publication-public-access";

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

type CountRow = { count: bigint | number };
type CutoverRow = { conference_id: string; cutover_at: Date | string };

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

async function publicationCutoverFor(conferenceId: string) {
  const rows = await prisma.$queryRawUnsafe<CutoverRow[]>(
    'SELECT conference_id, cutover_at FROM "PublicationPolicyCutover" WHERE conference_id = ? LIMIT 1',
    conferenceId
  );
  return rows[0] ?? null;
}

async function publicationCutoverCount() {
  const rows = await prisma.$queryRawUnsafe<CountRow[]>(
    'SELECT COUNT(*) AS count FROM "PublicationPolicyCutover"'
  );
  return Number(rows[0]?.count ?? 0);
}

async function main() {
  const apply = hasFlag("--apply");
  const now = new Date();
  const environment = arg("--environment") ?? process.env.NODE_ENV ?? "unknown";
  const contextRef = arg("--context") ?? null;
  const outDir = path.resolve(arg("--out-dir") ?? "artifacts/migrations");
  const outPath = path.join(outDir, `004-e-backfill-${safeTimestamp(now)}.json`);

  const issues: Issue[] = [];
  const counters = {
    conferencesInspected: 0,
    submissionsInspected: 0,
    shareEligibilitySeedsCreated: 0,
    publicationSeedsCreated: 0,
    publicationStateSeedsCreated: 0,
    publicationCutoversCreated: 0,
    legacyDispatchMessagesUnknown: 0,
    schedulePlacementsValidated: 0,
  };

  const run = apply
    ? await prisma.migrationRun.create({
        data: {
          version: "004-E",
          kind: "PUBLICATION_SCHEDULE_DISPATCH_SEED",
          environment,
          contextRef,
          applicationCommit: process.env.GITHUB_SHA ?? null,
          schemaVersion: "20260904005000_publication_schedule_dispatch_hardening",
          status: "RUNNING",
        },
      })
    : null;

  const conferences = await prisma.conference.findMany({
    where: contextRef ? { id: contextRef } : undefined,
    include: {
      publications: {
        where: { publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY },
        include: { currentState: true },
      },
      submissions: {
        include: {
          currentSelectionDecision: true,
          withdrawal: true,
          currentShareEligibilityChange: true,
          shareEligibilityChanges: true,
          deliverables: {
            where: { kindKey: "deck" },
            include: {
              currentArtifact: { include: { currentAssessment: true } },
            },
          },
        },
      },
      schedulePlacements: {
        where: { submissionId: { not: null }, slot: { slotType: "SESSION" } },
        include: {
          submission: {
            include: { currentSelectionDecision: true, withdrawal: true },
          },
        },
      },
      emailSendRecords: {
        where: {
          OR: [
            { renderedSubject: null },
            { renderedBody: null },
            { contentHash: null },
          ],
        },
        select: { id: true },
      },
    },
  });

  for (const conference of conferences) {
    counters.conferencesInspected += 1;
    const existingCutover = await publicationCutoverFor(conference.id);

    if (!existingCutover && conference.publications.length > 0) {
      issues.push({
        category: "publication-cutover-missing-after-canonical-state",
        disposition: "blocking-defect",
        contextRef: conference.id,
        recordRef: conference.id,
        gapId: "SG-008",
        detail:
          "Exact Publication rows already exist without a Publication cutover boundary; migration cannot infer whether they are authoritative or experimental.",
      });
    }

    for (const submission of conference.submissions) {
      counters.submissionsInspected += 1;
      let shareChange = submission.currentShareEligibilityChange;

      if (!shareChange) {
        if (submission.shareEligibilityChanges.length > 0) {
          issues.push({
            category: "share-policy-current-pointer-missing",
            disposition: "blocking-defect",
            contextRef: conference.id,
            recordRef: submission.id,
            gapId: "SG-P04",
            detail:
              "ShareEligibilityChange history exists but no current policy pointer is set; migration will not guess the terminal history row.",
          });
        } else {
          if (apply) {
            shareChange = await prisma.$transaction(async (tx) => {
              const change = await tx.shareEligibilityChange.create({
                data: {
                  submissionId: submission.id,
                  eligible: submission.deckShareable,
                  changedByRef: null,
                  changedAt: null,
                  provenance: "BACKFILLED_CURRENT_STATE",
                },
              });
              await tx.submission.update({
                where: { id: submission.id },
                data: { currentShareEligibilityChangeId: change.id },
              });
              return change;
            });
          }
          counters.shareEligibilitySeedsCreated += 1;
          issues.push({
            category: "legacy-share-policy-provenance-unknown",
            disposition: "expected-legacy-unknown",
            contextRef: conference.id,
            recordRef: submission.id,
            gapId: "SG-P04",
            detail:
              `Legacy deckShareable=${submission.deckShareable} was treated only as the current policy input; no actor, historical change time, or presenter consent was fabricated.`,
          });
        }
      } else if (shareChange.eligible !== submission.deckShareable) {
        issues.push({
          category: "share-policy-projection-conflict",
          disposition: "blocking-defect",
          contextRef: conference.id,
          recordRef: submission.id,
          gapId: "SG-P04",
          detail:
            "Canonical current share-eligibility state conflicts with the retained deckShareable compatibility projection.",
        });
      }

      if (!conference.decksPublished || existingCutover || conference.publications.length > 0) {
        continue;
      }

      const deliverable = submission.deliverables[0] ?? null;
      const artifact = deliverable?.currentArtifact ?? null;
      const selected = submission.currentSelectionDecision?.disposition === "SELECTED";
      const withdrawn = Boolean(submission.withdrawal);
      const shareEligible = shareChange?.eligible ?? submission.deckShareable;
      const ready = artifact?.currentAssessment?.disposition === "READY";

      if (!artifact || !selected || withdrawn || !shareEligible || !ready) continue;

      if (apply) {
        await prisma.$transaction(async (tx) => {
          const publication = await tx.publication.create({
            data: {
              conferenceId: conference.id,
              deckFileId: artifact.id,
              publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY,
              provenance: "BACKFILLED_CURRENT_STATE",
            },
          });
          const state = await tx.publicationState.create({
            data: {
              publicationId: publication.id,
              availability: "PUBLISHED",
              recordedByRef: null,
              recordedAt: null,
              provenance: "BACKFILLED_CURRENT_STATE",
            },
          });
          await tx.publication.update({
            where: { id: publication.id },
            data: { currentStateId: state.id },
          });
        });
      }
      counters.publicationSeedsCreated += 1;
      counters.publicationStateSeedsCreated += 1;
    }

    if (conference.decksPublished && !existingCutover) {
      issues.push({
        category: "legacy-publication-event-history-unknown",
        disposition: "expected-legacy-unknown",
        contextRef: conference.id,
        recordRef: conference.id,
        gapId: "SG-008",
        detail:
          "The legacy collection-level published flag preserves current exposure intent but does not prove when each exact deck was historically published; exact current seeds use backfilled-current-state provenance only.",
      });
    }

    for (const placement of conference.schedulePlacements) {
      counters.schedulePlacementsValidated += 1;
      const submission = placement.submission;
      if (
        !submission ||
        submission.currentSelectionDecision?.disposition !== "SELECTED" ||
        submission.withdrawal
      ) {
        issues.push({
          category: "schedule-placement-ineligible",
          disposition: "blocking-defect",
          contextRef: conference.id,
          recordRef: placement.id,
          gapId: "SG-014",
          detail:
            "An authoritative current session placement references a Proposal that is not effectively participating. No generator acceptance or replacement placement was fabricated.",
        });
      }
    }

    for (const send of conference.emailSendRecords) {
      counters.legacyDispatchMessagesUnknown += 1;
      issues.push({
        category: "dispatch-rendered-message-unknown",
        disposition: "expected-legacy-unknown",
        contextRef: conference.id,
        recordRef: send.id,
        gapId: "SG-015",
        detail:
          "Legacy send evidence lacks the exact immutable rendered subject/body/content hash. Mutable current templates were not used to fabricate historical MessageRef content.",
      });
    }

    if (!existingCutover && conference.publications.length === 0) {
      if (apply) {
        await prisma.$executeRawUnsafe(
          'INSERT INTO "PublicationPolicyCutover" (conference_id, cutover_at) VALUES (?, ?)',
          conference.id,
          now
        );
      }
      counters.publicationCutoversCreated += 1;
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
        shareEligibilityChanges: await prisma.shareEligibilityChange.count({
          where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
        }),
        publications: await prisma.publication.count({
          where: contextRef
            ? { conferenceId: contextRef, publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY }
            : { publicSurfaceKey: DECK_ARCHIVE_SURFACE_KEY },
        }),
        publicationStates: await prisma.publicationState.count({
          where: contextRef
            ? { publication: { conferenceId: contextRef } }
            : undefined,
        }),
        publicationCutovers: await publicationCutoverCount(),
        dispatchAttempts: await prisma.dispatchAttempt.count({
          where: contextRef ? { conferenceId: contextRef } : undefined,
        }),
      }
    : null;

  const report = {
    phase: "004-E",
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
          shareEligibilitySeedsCreated: counters.shareEligibilitySeedsCreated,
          publicationSeedsCreated: counters.publicationSeedsCreated,
          publicationStateSeedsCreated: counters.publicationStateSeedsCreated,
          publicationCutoversCreated: counters.publicationCutoversCreated,
          legacyDispatchMessagesUnknown: counters.legacyDispatchMessagesUnknown,
        }),
        issueCountsJson: JSON.stringify(report.issueCounts),
        invariantResultsJson: JSON.stringify({
          blockingDefects: blocking,
          ineligibleSchedulePlacements: issues.filter(
            (issue) => issue.category === "schedule-placement-ineligible"
          ).length,
        }),
        paritySummaryJson: JSON.stringify({
          sharePolicyProjectionConflicts: issues.filter(
            (issue) => issue.category === "share-policy-projection-conflict"
          ).length,
          publicationCutoverConflicts: issues.filter(
            (issue) => issue.category === "publication-cutover-missing-after-canonical-state"
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
