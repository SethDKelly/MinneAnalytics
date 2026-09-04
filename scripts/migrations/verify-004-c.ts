import { PrismaClient } from "@prisma/client";
import {
  CapacityUnavailableError,
  getCanonicalParticipation,
  projectCurrentDeckStatus,
  recordCanonicalDeckAssessment,
  recordCanonicalSelection,
  recordCanonicalWithdrawal,
  recordProvidedDeckArtifact,
} from "../../lib/concept-design/selection-participation-deliverable";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`004-C verification failed: ${message}`);
}

async function createSubmission(conferenceId: string, suffix: string, label: string) {
  return prisma.submission.create({
    data: {
      conferenceId,
      presenterTokenHash: `004-c-presenter-${label}-${suffix}`,
      firstName: label,
      lastName: "Presenter",
      degrees: JSON.stringify([]),
      jobTitle: "Engineer",
      organization: "Verification Org",
      title: `${label} proposal`,
      abstract: `A sufficiently long ${label} abstract for 004-C canonicalization verification.`,
      technicalLevel: 3,
      bio: `A sufficiently long ${label} presenter biography for verification.`,
      email: `${label.toLowerCase()}-${suffix}@example.com`,
      zipCode: "55401",
      phone: "5555555555",
      linkedinUrl: `https://example.com/${label.toLowerCase()}`,
      linkedinHasPhoto: false,
    },
  });
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const conference = await prisma.conference.create({
    data: {
      slug: `004-c-${suffix}`,
      name: "004-C verification",
      rooms: 1,
      sessionsPerRoom: 1,
      eodTrim: 0,
      graemeSlots: 0,
      submissionsOpen: true,
    },
  });
  const [a, b] = await Promise.all([
    createSubmission(conference.id, suffix, "Alpha"),
    createSubmission(conference.id, suffix, "Beta"),
  ]);
  const actorRef = `reviewer:004-c-${suffix}`;

  const selectedA = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: a.id,
    disposition: "SELECTED",
    actorRef,
    commandKey: `select-alpha-${suffix}`,
  });
  assert(selectedA.decision?.disposition === "SELECTED", "Alpha should receive a selected Decision");
  assert(!selectedA.replayed, "first Alpha Selection command should not replay");

  const alphaAfterSelect = await prisma.submission.findUniqueOrThrow({
    where: { id: a.id },
    include: {
      currentSelectionDecision: true,
      withdrawal: true,
      capacityAllocations: true,
      deliverables: true,
    },
  });
  assert(alphaAfterSelect.programStatus === "APPROVED", "Selection should project APPROVED");
  assert(alphaAfterSelect.currentSelectionDecisionId === selectedA.decision?.id, "current Selection pointer should advance");
  assert(alphaAfterSelect.capacityAllocations.filter((x) => !x.releasedAt).length === 1, "new effective participation should allocate Capacity atomically");
  assert(alphaAfterSelect.deliverables.some((x) => x.kindKey === "deck"), "new effective participation should create the deck Deliverable atomically");

  const replayA = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: a.id,
    disposition: "SELECTED",
    actorRef,
    commandKey: `select-alpha-${suffix}`,
  });
  assert(replayA.replayed, "repeated Selection command key should replay");
  assert(replayA.decision?.id === selectedA.decision?.id, "Selection replay should return original Decision");
  assert(
    (await prisma.capacityAllocation.count({ where: { submissionId: a.id, releasedAt: null } })) === 1,
    "Selection replay must not duplicate active Capacity allocation"
  );

  let capacityRejected = false;
  try {
    await recordCanonicalSelection({
      conferenceId: conference.id,
      submissionId: b.id,
      disposition: "SELECTED",
      actorRef,
      commandKey: `select-beta-full-${suffix}`,
    });
  } catch (error) {
    capacityRejected = error instanceof CapacityUnavailableError;
  }
  assert(capacityRejected, "second Selection should fail while the one-unit Pool is full");
  const betaAfterReject = await prisma.submission.findUniqueOrThrow({
    where: { id: b.id },
    include: { selectionDecisions: true, deliverables: true },
  });
  assert(betaAfterReject.programStatus === "PENDING", "failed Capacity precondition must not change compatibility Selection state");
  assert(betaAfterReject.selectionDecisions.length === 0, "failed Capacity precondition must not commit a Decision");
  assert(betaAfterReject.deliverables.length === 0, "failed Capacity precondition must not commit a Deliverable");

  const reserveA = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: a.id,
    disposition: "RESERVE",
    actorRef,
    commandKey: `reserve-alpha-${suffix}`,
  });
  assert(reserveA.decision?.predecessorDecisionId === selectedA.decision?.id, "later Selection should preserve predecessor Decision");
  assert(reserveA.cleanupPending === 0, "participation-exit cleanup should converge for local effects");
  assert(
    (await prisma.capacityAllocation.count({ where: { submissionId: a.id, releasedAt: null } })) === 0,
    "leaving effective participation should release active Capacity"
  );
  const alphaHistory = await prisma.selectionDecision.findMany({
    where: { submissionId: a.id },
    orderBy: { recordedAt: "asc" },
  });
  assert(alphaHistory.length === 2, "Selection history should retain selected and reserve Decisions");

  const selectedB = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: b.id,
    disposition: "SELECTED",
    actorRef,
    commandKey: `select-beta-${suffix}`,
  });
  assert(selectedB.decision?.disposition === "SELECTED", "Beta should enter participation after Capacity is released");
  assert(
    (await prisma.capacityAllocation.count({ where: { submissionId: b.id, releasedAt: null } })) === 1,
    "Beta should own one active allocation"
  );

  const withdrawnB = await recordCanonicalWithdrawal({
    submissionId: b.id,
    actorRef: `presenter:${b.id}`,
  });
  assert(!withdrawnB.replayed, "first Withdrawal should create immutable rescission history");
  assert(withdrawnB.cleanupPending === 0, "Withdrawal cleanup should converge without undoing the source fact");
  const betaAfterWithdrawal = await prisma.submission.findUniqueOrThrow({
    where: { id: b.id },
    include: { withdrawal: true, currentSelectionDecision: true },
  });
  assert(Boolean(betaAfterWithdrawal.withdrawal), "Withdrawal record must persist");
  assert(betaAfterWithdrawal.currentSelectionDecision?.disposition === "SELECTED", "Withdrawal must not rewrite Selection history");
  assert(betaAfterWithdrawal.programStatus === "WITHDRAWN", "Withdrawal should dominate the compatibility programStatus projection");
  assert(
    (await prisma.capacityAllocation.count({ where: { submissionId: b.id, releasedAt: null } })) === 0,
    "Withdrawal should release active Capacity through convergent cleanup"
  );

  await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: b.id,
    disposition: "NOT_SELECTED",
    actorRef,
    commandKey: `decline-withdrawn-beta-${suffix}`,
  });
  const betaComposed = await getCanonicalParticipation(b.id);
  assert(betaComposed?.withdrawn, "later organizer Decision must not erase Withdrawal");
  assert(betaComposed?.compatibilityStatus === "WITHDRAWN", "Withdrawal remains dominant in the compatibility projection");

  const artifact1 = await recordProvidedDeckArtifact({
    submissionId: a.id,
    filename: "alpha-v1.pdf",
    storagePath: `/tmp/004-c-${suffix}-alpha-v1.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 100,
  });
  assert(artifact1.version === 1, "first provided artifact should be version 1");
  assert((await projectCurrentDeckStatus(a.id)) === "SUBMITTED", "unassessed current artifact should project SUBMITTED");

  const concern = await recordCanonicalDeckAssessment({
    conferenceId: conference.id,
    submissionId: a.id,
    disposition: "CONCERN",
    reviewerRef: actorRef,
    detail: "Needs correction",
    commandKey: `alpha-concern-${suffix}`,
  });
  const ready = await recordCanonicalDeckAssessment({
    conferenceId: conference.id,
    submissionId: a.id,
    disposition: "READY",
    reviewerRef: actorRef,
    detail: "Ready for use",
    commandKey: `alpha-ready-${suffix}`,
  });
  assert(ready.assessment.predecessorAssessmentId === concern.assessment.id, "Assessment history should form an immutable chain on the exact ArtifactVersion");
  assert((await projectCurrentDeckStatus(a.id)) === "APPROVED", "READY should project legacy APPROVED for the current artifact");

  const artifact2 = await recordProvidedDeckArtifact({
    submissionId: a.id,
    filename: "alpha-v2.pdf",
    storagePath: `/tmp/004-c-${suffix}-alpha-v2.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 120,
  });
  assert(artifact2.version === 2, "replacement artifact should increment the logical version");
  assert(artifact2.predecessorArtifactId === artifact1.id, "replacement artifact should retain exact predecessor identity");
  assert((await projectCurrentDeckStatus(a.id)) === "SUBMITTED", "replacement artifact must not inherit prior readiness");

  const artifact1History = await prisma.deckFile.findUniqueOrThrow({
    where: { id: artifact1.id },
    include: { assessments: true, currentAssessment: true },
  });
  assert(artifact1History.assessments.length === 2, "prior ArtifactVersion should retain concern and ready history");
  assert(artifact1History.currentAssessment?.disposition === "READY", "prior exact ArtifactVersion readiness remains historically true");
  const deliverable = await prisma.deliverableRequirement.findUniqueOrThrow({
    where: { submissionId_kindKey: { submissionId: a.id, kindKey: "deck" } },
  });
  assert(deliverable.currentArtifactId === artifact2.id, "Deliverable current pointer should advance to replacement artifact");

  const cleanup = await prisma.synchronizationWork.findMany({
    where: { sourceRef: { in: [reserveA.decision!.id, withdrawnB.withdrawal.id] } },
  });
  assert(cleanup.length === 4, "participation exits should retain durable Capacity-release and Schedule-unplace work evidence");
  assert(cleanup.every((item) => item.state === "COMPLETED"), "local cleanup work should be idempotently completed");

  console.log("004-C Selection/Withdrawal/Capacity/Deliverable verification passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
