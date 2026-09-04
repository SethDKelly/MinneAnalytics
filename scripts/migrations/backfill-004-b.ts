import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, type MigrationProvenance } from "@prisma/client";
import { exactEvaluationKey } from "../../lib/concept-design/revision-evaluation";

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

function normalize(ids: string[]): string[] {
  return [...new Set(ids)].sort();
}

function parseThemeIds(raw: string): string[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
      return null;
    }
    return normalize(value);
  } catch {
    return null;
  }
}

function sameStrings(a: string[], b: string[]): boolean {
  const left = normalize(a);
  const right = normalize(b);
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function revisionMatchesCurrent(
  submission: {
    title: string;
    abstract: string;
    bio: string;
    technicalLevel: number;
  },
  revision: {
    title: string;
    abstract: string;
    bio: string;
    technicalLevel: number;
  }
): boolean {
  return (
    submission.title === revision.title &&
    submission.abstract === revision.abstract &&
    submission.bio === revision.bio &&
    submission.technicalLevel === revision.technicalLevel
  );
}

async function createRevisionTerms(revisionId: string, themeIds: string[]) {
  const existing = await prisma.revisionTerm.findMany({
    where: { submissionRevisionId: revisionId },
    select: { themeId: true },
  });
  const existingIds = existing.map((row) => row.themeId);
  if (existingIds.length > 0) return existingIds;

  for (const themeId of themeIds) {
    await prisma.revisionTerm.create({
      data: { submissionRevisionId: revisionId, themeId },
    });
  }
  return themeIds;
}

async function main() {
  const apply = hasFlag("--apply");
  const now = new Date();
  const environment = arg("--environment") ?? process.env.NODE_ENV ?? "unknown";
  const contextRef = arg("--context") ?? null;
  const outDir = path.resolve(arg("--out-dir") ?? "artifacts/migrations");
  const outPath = path.join(outDir, `004-b-backfill-${safeTimestamp(now)}.json`);
  const whereSubmission = contextRef ? { conferenceId: contextRef } : undefined;

  const issues: Issue[] = [];
  const counters = {
    submissionsInspected: 0,
    currentRevisionPointersSet: 0,
    currentStateRevisionsCreated: 0,
    predecessorLinksSet: 0,
    revisionTermSetsCreated: 0,
    evaluationsBound: 0,
    feedbackBound: 0,
  };

  const run = apply
    ? await prisma.migrationRun.create({
        data: {
          version: "004-B",
          kind: "EXACT_REVISION_BACKFILL",
          environment,
          contextRef,
          applicationCommit: process.env.GITHUB_SHA ?? null,
          schemaVersion: "20260904002000_revision_classification_evaluation_feedback",
          status: "RUNNING",
        },
      })
    : null;

  const themes = await prisma.theme.findMany({
    where: contextRef ? { conferenceId: contextRef } : undefined,
    select: { id: true },
  });
  const validThemeIds = new Set(themes.map((theme) => theme.id));

  const submissions = await prisma.submission.findMany({
    where: whereSubmission,
    include: {
      themes: true,
      revisions: {
        orderBy: [{ version: "asc" }, { createdAt: "asc" }],
        include: { revisionTerms: true },
      },
      scores: true,
      presenterFeedback: true,
    },
  });

  for (const submission of submissions) {
    counters.submissionsInspected += 1;
    const revisions = [...submission.revisions];

    for (const revision of revisions) {
      if (apply && !revision.provenance) {
        await prisma.submissionRevision.update({
          where: { id: revision.id },
          data: { provenance: "BACKFILLED_HISTORICAL" as MigrationProvenance },
        });
      }

      if (revision.version <= 1 || revision.predecessorRevisionId) continue;
      const predecessor = revisions.find((candidate) => candidate.version === revision.version - 1);
      if (!predecessor) {
        issues.push({
          category: "revision-history-gap",
          disposition: "expected-legacy-unknown",
          contextRef: submission.conferenceId,
          recordRef: revision.id,
          gapId: "SG-012",
          detail: `Revision v${revision.version} has no reconstructible v${revision.version - 1} predecessor; no predecessor was invented.`,
        });
        continue;
      }
      if (apply) {
        await prisma.submissionRevision.update({
          where: { id: revision.id },
          data: { predecessorRevisionId: predecessor.id },
        });
      }
      revision.predecessorRevisionId = predecessor.id;
      counters.predecessorLinksSet += 1;
    }

    let current = revisions.find((revision) => revision.version === submission.abstractVersion);
    if (current && !revisionMatchesCurrent(submission, current)) {
      issues.push({
        category: "current-revision-mismatch",
        disposition: "blocking-defect",
        contextRef: submission.conferenceId,
        recordRef: submission.id,
        gapId: "SG-012",
        detail: `Revision v${submission.abstractVersion} exists but does not match the mutable Submission current-content projection.`,
      });
      current = undefined;
    }

    if (!current && !revisions.some((revision) => revision.version === submission.abstractVersion)) {
      const currentThemeIds = normalize(submission.themes.map((row) => row.themeId));
      if (apply) {
        current = await prisma.submissionRevision.create({
          data: {
            submissionId: submission.id,
            version: submission.abstractVersion,
            title: submission.title,
            abstract: submission.abstract,
            bio: submission.bio,
            technicalLevel: submission.technicalLevel,
            themeIds: JSON.stringify(currentThemeIds),
            changedFields: JSON.stringify([]),
            changeNote: null,
            provenance: "BACKFILLED_CURRENT_STATE",
            observedAt: now,
          },
        });
      } else {
        current = {
          id: `dry-run:${submission.id}:v${submission.abstractVersion}`,
          submissionId: submission.id,
          predecessorRevisionId: null,
          version: submission.abstractVersion,
          title: submission.title,
          abstract: submission.abstract,
          bio: submission.bio,
          technicalLevel: submission.technicalLevel,
          themeIds: JSON.stringify(currentThemeIds),
          changedFields: JSON.stringify([]),
          changeNote: null,
          createdAt: now,
          commandKey: null,
          provenance: "BACKFILLED_CURRENT_STATE",
          observedAt: now,
        };
      }
      counters.currentStateRevisionsCreated += 1;
    }

    if (!current) continue;

    if (submission.currentRevisionId && submission.currentRevisionId !== current.id) {
      issues.push({
        category: "current-revision-pointer-conflict",
        disposition: "blocking-defect",
        contextRef: submission.conferenceId,
        recordRef: submission.id,
        gapId: "SG-012",
        detail: `Existing currentRevisionId ${submission.currentRevisionId} conflicts with resolved current Revision ${current.id}.`,
      });
      continue;
    }

    if (!submission.currentRevisionId && apply) {
      await prisma.submission.update({
        where: { id: submission.id },
        data: { currentRevisionId: current.id },
      });
    }
    if (!submission.currentRevisionId) counters.currentRevisionPointersSet += 1;

    const revisionsForTerms = apply
      ? await prisma.submissionRevision.findMany({
          where: { submissionId: submission.id },
          include: { revisionTerms: true },
        })
      : revisions;

    for (const revision of revisionsForTerms) {
      const snapshotThemeIds = parseThemeIds(revision.themeIds);
      if (!snapshotThemeIds) {
        issues.push({
          category: "revision-classification-invalid-snapshot",
          disposition: "blocking-defect",
          contextRef: submission.conferenceId,
          recordRef: revision.id,
          gapId: "SG-006",
          detail: "Revision themeIds is not a valid JSON string array.",
        });
        continue;
      }
      const missing = snapshotThemeIds.filter((id) => !validThemeIds.has(id));
      if (missing.length > 0) {
        issues.push({
          category: "revision-classification-missing-term",
          disposition: "blocking-defect",
          contextRef: submission.conferenceId,
          recordRef: revision.id,
          gapId: "SG-006",
          detail: `Revision references missing Theme/Term IDs: ${missing.join(", ")}`,
        });
        continue;
      }

      const existingTermIds = revision.revisionTerms?.map((row) => row.themeId) ?? [];
      if (existingTermIds.length > 0 && !sameStrings(existingTermIds, snapshotThemeIds)) {
        issues.push({
          category: "revision-classification-conflict",
          disposition: "blocking-defect",
          contextRef: submission.conferenceId,
          recordRef: revision.id,
          gapId: "SG-006",
          detail: "Existing exact RevisionTerm set conflicts with the retained revision snapshot.",
        });
        continue;
      }
      if (existingTermIds.length === 0 && snapshotThemeIds.length > 0) {
        if (apply) await createRevisionTerms(revision.id, snapshotThemeIds);
        counters.revisionTermSetsCreated += 1;
      }
    }

    const currentThemeSnapshot = parseThemeIds(current.themeIds);
    const currentMirror = normalize(submission.themes.map((row) => row.themeId));
    if (currentThemeSnapshot && !sameStrings(currentThemeSnapshot, currentMirror)) {
      issues.push({
        category: "current-classification-parity",
        disposition: "blocking-defect",
        contextRef: submission.conferenceId,
        recordRef: submission.id,
        gapId: "SG-006",
        detail: "Current Revision classification snapshot differs from SubmissionTheme compatibility projection.",
      });
    }

    for (const score of submission.scores) {
      if (score.submissionRevisionId) continue;
      if (score.scoredAbstractVersion == null) {
        issues.push({
          category: "evaluation-subject-unknown",
          disposition: "expected-legacy-unknown",
          contextRef: submission.conferenceId,
          recordRef: score.id,
          gapId: "SG-001",
          detail: "Legacy Score has no scoredAbstractVersion; exact historical Evaluation subject is unknown.",
        });
        continue;
      }
      const subject = (apply ? await prisma.submissionRevision.findUnique({
        where: { submissionId_version: { submissionId: submission.id, version: score.scoredAbstractVersion } },
      }) : revisions.find((revision) => revision.version === score.scoredAbstractVersion)) ?? null;
      if (!subject) {
        issues.push({
          category: "evaluation-subject-unknown",
          disposition: "expected-legacy-unknown",
          contextRef: submission.conferenceId,
          recordRef: score.id,
          gapId: "SG-001",
          detail: `Legacy Score references abstract version ${score.scoredAbstractVersion}, but no exact Revision can be resolved.`,
        });
        continue;
      }
      if (apply) {
        await prisma.score.update({
          where: { id: score.id },
          data: {
            submissionRevisionId: subject.id,
            exactEvaluationKey: exactEvaluationKey(score.reviewerAccessId, subject.id),
          },
        });
      }
      counters.evaluationsBound += 1;
    }

    for (const feedback of submission.presenterFeedback) {
      if (feedback.kind !== "ABSTRACT" || feedback.submissionRevisionId) continue;
      if (feedback.abstractVersion == null) {
        issues.push({
          category: "feedback-subject-unknown",
          disposition: "expected-legacy-unknown",
          contextRef: submission.conferenceId,
          recordRef: feedback.id,
          gapId: "SG-017",
          detail: "ABSTRACT Feedback has no abstractVersion; exact historical subject is unknown.",
        });
        continue;
      }
      const subject = (apply ? await prisma.submissionRevision.findUnique({
        where: { submissionId_version: { submissionId: submission.id, version: feedback.abstractVersion } },
      }) : revisions.find((revision) => revision.version === feedback.abstractVersion)) ?? null;
      if (!subject) {
        issues.push({
          category: "feedback-subject-unknown",
          disposition: "expected-legacy-unknown",
          contextRef: submission.conferenceId,
          recordRef: feedback.id,
          gapId: "SG-017",
          detail: `ABSTRACT Feedback references abstract version ${feedback.abstractVersion}, but no exact Revision can be resolved.`,
        });
        continue;
      }
      if (apply) {
        await prisma.presenterFeedback.update({
          where: { id: feedback.id },
          data: { submissionRevisionId: subject.id },
        });
      }
      counters.feedbackBound += 1;
    }
  }

  const blocking = issues.filter((issue) => issue.disposition === "blocking-defect").length;
  const unknown = issues.filter((issue) => issue.disposition === "expected-legacy-unknown").length;
  const status = blocking > 0 ? "BLOCKED" : "COMPLETE";

  const targetCounts = apply
    ? {
        currentRevisionPointers: await prisma.submission.count({
          where: { ...whereSubmission, currentRevisionId: { not: null } },
        }),
        revisionTerms: await prisma.revisionTerm.count({
          where: contextRef ? { submissionRevision: { submission: { conferenceId: contextRef } } } : undefined,
        }),
        exactEvaluations: await prisma.score.count({
          where: {
            ...(contextRef ? { submission: { conferenceId: contextRef } } : {}),
            submissionRevisionId: { not: null },
          },
        }),
        exactAbstractFeedback: await prisma.presenterFeedback.count({
          where: {
            ...(contextRef ? { submission: { conferenceId: contextRef } } : {}),
            kind: "ABSTRACT",
            submissionRevisionId: { not: null },
          },
        }),
      }
    : null;

  const report = {
    phase: "004-B",
    mode: apply ? "apply" : "dry-run",
    environment,
    contextRef,
    generatedAt: now.toISOString(),
    status,
    counters,
    issueCounts: { blocking, expectedLegacyUnknown: unknown, total: issues.length },
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
        sourceCountsJson: JSON.stringify({ submissions: submissions.length }),
        targetCountsJson: JSON.stringify(targetCounts),
        provenanceCountsJson: JSON.stringify({
          currentStateRevisionsCreated: counters.currentStateRevisionsCreated,
          historicalRevisionsAdopted: submissions.reduce((sum, submission) => sum + submission.revisions.length, 0),
          legacyUnknowns: unknown,
        }),
        issueCountsJson: JSON.stringify(report.issueCounts),
        invariantResultsJson: JSON.stringify({ blockingDefects: blocking }),
        paritySummaryJson: JSON.stringify({ currentClassificationBlockingDefects: issues.filter((issue) => issue.category === "current-classification-parity").length }),
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
