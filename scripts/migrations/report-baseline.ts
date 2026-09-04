import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { getImplementationGateSnapshot } from "../../lib/concept-design/implementation-gates";

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function safeTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const now = new Date();
  const environment = arg("--environment") ?? process.env.NODE_ENV ?? "unknown";
  const contextRef = arg("--context") ?? null;
  const outDir = path.resolve(arg("--out-dir") ?? "artifacts/migrations");
  const outPath = path.join(outDir, `004-a-baseline-${safeTimestamp(now)}.json`);

  const whereConference = contextRef ? { id: contextRef } : undefined;
  const whereSubmission = contextRef ? { conferenceId: contextRef } : undefined;

  const [
    conferences,
    submissions,
    revisions,
    scores,
    themes,
    deckFiles,
    feedback,
    schedulePlacements,
    sendRecords,
    availabilityWindows,
    selectionDecisions,
    withdrawals,
    capacityPools,
    capacityAllocations,
    coverageTargets,
    termStates,
    revisionTerms,
    deliverableRequirements,
    deliverableAssessments,
    disclosures,
    publications,
    publicationStates,
    archiveRecords,
    synchronizationWork,
    dispatchAttempts,
  ] = await Promise.all([
    prisma.conference.count({ where: whereConference }),
    prisma.submission.count({ where: whereSubmission }),
    prisma.submissionRevision.count({
      where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
    }),
    prisma.score.count({
      where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
    }),
    prisma.theme.count({ where: contextRef ? { conferenceId: contextRef } : undefined }),
    prisma.deckFile.count({
      where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
    }),
    prisma.presenterFeedback.count({
      where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
    }),
    prisma.schedulePlacement.count({
      where: contextRef ? { conferenceId: contextRef } : undefined,
    }),
    prisma.emailSendRecord.count({
      where: contextRef ? { conferenceId: contextRef } : undefined,
    }),
    prisma.availabilityWindow.count({
      where: contextRef ? { conferenceId: contextRef } : undefined,
    }),
    prisma.selectionDecision.count({
      where: contextRef ? { conferenceId: contextRef } : undefined,
    }),
    prisma.withdrawalRecord.count({
      where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
    }),
    prisma.capacityPool.count({ where: contextRef ? { conferenceId: contextRef } : undefined }),
    prisma.capacityAllocation.count({
      where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
    }),
    prisma.coverageTarget.count({ where: contextRef ? { conferenceId: contextRef } : undefined }),
    prisma.termState.count({
      where: contextRef ? { theme: { conferenceId: contextRef } } : undefined,
    }),
    prisma.revisionTerm.count({
      where: contextRef ? { submissionRevision: { submission: { conferenceId: contextRef } } } : undefined,
    }),
    prisma.deliverableRequirement.count({
      where: contextRef ? { submission: { conferenceId: contextRef } } : undefined,
    }),
    prisma.deliverableAssessment.count({
      where: contextRef
        ? { artifactVersion: { submission: { conferenceId: contextRef } } }
        : undefined,
    }),
    prisma.controlledDisclosure.count({
      where: contextRef ? { conferenceId: contextRef } : undefined,
    }),
    prisma.publication.count({ where: contextRef ? { conferenceId: contextRef } : undefined }),
    prisma.publicationState.count({
      where: contextRef ? { publication: { conferenceId: contextRef } } : undefined,
    }),
    prisma.archiveRecord.count({ where: contextRef ? { conferenceId: contextRef } : undefined }),
    prisma.synchronizationWork.count(),
    prisma.dispatchAttempt.count({ where: contextRef ? { conferenceId: contextRef } : undefined }),
  ]);

  const report = {
    reportVersion: "004-A.v1",
    generatedAt: now.toISOString(),
    environment,
    contextRef,
    applicationCommit: process.env.GITHUB_SHA ?? process.env.APP_COMMIT ?? null,
    semanticGates: getImplementationGateSnapshot(),
    sourceCounts: {
      conferences,
      submissions,
      revisions,
      scores,
      themes,
      deckFiles,
      feedback,
      schedulePlacements,
      sendRecords,
    },
    additiveTargetCounts: {
      availabilityWindows,
      selectionDecisions,
      withdrawals,
      capacityPools,
      capacityAllocations,
      coverageTargets,
      termStates,
      revisionTerms,
      deliverableRequirements,
      deliverableAssessments,
      disclosures,
      publications,
      publicationStates,
      archiveRecords,
      synchronizationWork,
      dispatchAttempts,
    },
    assertions: {
      noSemanticGateImplicitlyEnabled: Object.values(getImplementationGateSnapshot()).every(
        (enabled) => !enabled
      ),
      note:
        "004-A reports structure only. Target tables are not expected to be populated until later backfill/cutover packages.",
    },
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(outPath);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
