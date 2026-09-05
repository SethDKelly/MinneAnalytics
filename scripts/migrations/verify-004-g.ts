import { PrismaClient } from "@prisma/client";
import {
  appendCanonicalRevision,
  establishInitialRevision,
} from "../../lib/concept-design/revision-evaluation";
import {
  recordCanonicalDeckAssessment,
  recordCanonicalSelection,
  recordProvidedDeckArtifact,
} from "../../lib/concept-design/selection-participation-deliverable";
import { recordShareEligibilityChange, usesExactPublicationAuthorization } from "../../lib/concept-design/publication-public-access";
import { repairConferenceCompatibilityProjections } from "../../lib/concept-design/compatibility-repair";
import { getSemanticConferenceSubmissions } from "../../lib/concept-design/semantic-reads";
import { isImplementationGateEnabled } from "../../lib/concept-design/implementation-gates";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`004-G verification failed: ${message}`);
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const conference = await prisma.conference.create({
    data: {
      slug: `004-g-${suffix}`,
      name: "004-G rollback verification",
      status: "ACTIVE",
      rooms: 2,
      sessionsPerRoom: 2,
      eodTrim: 0,
      graemeSlots: 0,
      submissionsOpen: true,
    },
  });
  const [termA, termB] = await Promise.all([
    prisma.theme.create({
      data: {
        conferenceId: conference.id,
        slug: `004-g-a-${suffix}`,
        name: "004-G Term A",
      },
    }),
    prisma.theme.create({
      data: {
        conferenceId: conference.id,
        slug: `004-g-b-${suffix}`,
        name: "004-G Term B",
      },
    }),
  ]);

  const submission = await prisma.$transaction(async (tx) => {
    const created = await tx.submission.create({
      data: {
        conferenceId: conference.id,
        presenterTokenHash: `004-g-presenter-${suffix}`,
        firstName: "Rollback",
        lastName: "Verifier",
        degrees: JSON.stringify([]),
        jobTitle: "Engineer",
        organization: "Verification Org",
        title: "Initial compatibility title",
        abstract: "A sufficiently long initial abstract for the 004-G rollback and projection repair verifier.",
        technicalLevel: 2,
        bio: "A sufficiently long initial presenter biography for 004-G verification.",
        email: `004-g-${suffix}@example.com`,
        zipCode: "55401",
        phone: "5555555555",
        linkedinUrl: `https://example.com/004-g-${suffix}`,
        linkedinHasPhoto: false,
        themes: { create: [{ themeId: termA.id }] },
      },
    });
    const revision = await establishInitialRevision(tx, {
      submissionId: created.id,
      snapshot: {
        title: created.title,
        abstract: created.abstract,
        bio: created.bio,
        technicalLevel: created.technicalLevel,
        themeIds: [termA.id],
      },
    });
    return { ...created, currentRevisionId: revision.id };
  });

  const v2 = await appendCanonicalRevision({
    submissionId: submission.id,
    expectedRevisionId: submission.currentRevisionId,
    commandKey: `004-g-revision-${suffix}`,
    requireExpectedHead: true,
    snapshot: {
      title: "Canonical rollback title",
      abstract: "A sufficiently long canonical second abstract used to prove compatibility repair and read rollback.",
      bio: "A sufficiently long canonical second presenter biography for the 004-G verifier.",
      technicalLevel: 4,
      themeIds: [termB.id],
    },
    changedFields: ["title", "abstract", "bio", "technicalLevel", "themes"],
    changeNote: "004-G rollback verifier",
  });

  const actorRef = `reviewer:004-g-${suffix}`;
  const selection = await recordCanonicalSelection({
    conferenceId: conference.id,
    submissionId: submission.id,
    disposition: "SELECTED",
    actorRef,
    commandKey: `004-g-select-${suffix}`,
  });
  assert(selection.decision?.disposition === "SELECTED", "canonical Selection should be established");

  const artifact = await recordProvidedDeckArtifact({
    submissionId: submission.id,
    filename: "004-g-ready.pdf",
    storagePath: `/tmp/004-g-${suffix}.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 100,
  });
  await recordCanonicalDeckAssessment({
    conferenceId: conference.id,
    submissionId: submission.id,
    disposition: "READY",
    reviewerRef: actorRef,
    commandKey: `004-g-ready-${suffix}`,
  });
  await recordShareEligibilityChange({
    conferenceId: conference.id,
    submissionId: submission.id,
    eligible: true,
    actorRef,
  });

  const historyBefore = {
    revisions: await prisma.submissionRevision.count({ where: { submissionId: submission.id } }),
    decisions: await prisma.selectionDecision.count({ where: { submissionId: submission.id } }),
    assessments: await prisma.deliverableAssessment.count({ where: { artifactVersionId: artifact.id } }),
    sharing: await prisma.shareEligibilityChange.count({ where: { submissionId: submission.id } }),
  };

  await prisma.$transaction(async (tx) => {
    await tx.submissionTheme.deleteMany({ where: { submissionId: submission.id } });
    await tx.submissionTheme.create({ data: { submissionId: submission.id, themeId: termA.id } });
    await tx.submission.update({
      where: { id: submission.id },
      data: {
        title: "INTENTIONALLY DRIFTED TITLE",
        abstract: "INTENTIONALLY DRIFTED ABSTRACT",
        bio: "INTENTIONALLY DRIFTED BIO",
        technicalLevel: 1,
        abstractVersion: 99,
        programStatus: "DECLINED",
        deckStatus: "REVIEWED",
        deckShareable: false,
      },
    });
  });

  const firstRepair = await repairConferenceCompatibilityProjections(conference.id);
  assert(firstRepair.repairedSubmissions === 1, "projection repair should repair the canonicalized Proposal");
  assert(firstRepair.skippedWithoutCanonicalRevision === 0, "canonicalized Proposal should not be skipped");

  const repaired = await prisma.submission.findUniqueOrThrow({
    where: { id: submission.id },
    include: { themes: true },
  });
  assert(repaired.title === "Canonical rollback title", "current content must repair from exact current Revision");
  assert(repaired.abstractVersion === 2, "ordinal compatibility projection must repair from Revision");
  assert(repaired.programStatus === "APPROVED", "programStatus must repair from Selection plus Withdrawal");
  assert(repaired.deckStatus === "APPROVED", "deckStatus must repair from exact current ArtifactVersion Assessment");
  assert(repaired.deckShareable, "sharing projection must repair from ShareEligibilityChange");
  assert(repaired.themes.length === 1 && repaired.themes[0].themeId === termB.id, "SubmissionTheme must repair from exact current Classification");

  const historyAfter = {
    revisions: await prisma.submissionRevision.count({ where: { submissionId: submission.id } }),
    decisions: await prisma.selectionDecision.count({ where: { submissionId: submission.id } }),
    assessments: await prisma.deliverableAssessment.count({ where: { artifactVersionId: artifact.id } }),
    sharing: await prisma.shareEligibilityChange.count({ where: { submissionId: submission.id } }),
  };
  assert(JSON.stringify(historyAfter) === JSON.stringify(historyBefore), "projection repair must not create, erase, or rewrite canonical history");

  const previousReadGate = process.env.MINNE_V0_SEMANTIC_READS;
  process.env.MINNE_V0_SEMANTIC_READS = "false";
  const compatibilityRead = (await getSemanticConferenceSubmissions(conference.id)).find(
    (item) => item.id === submission.id
  );
  assert(compatibilityRead?.semantic.readSource === "compatibility-fallback", "explicit read rollback should use compatibility projection");
  assert(compatibilityRead?.title === "Canonical rollback title", "repaired compatibility read should preserve current title");
  assert(compatibilityRead?.programStatus === "APPROVED", "repaired compatibility read should preserve Selection projection");
  assert(compatibilityRead?.semantic.participation.effective, "repaired compatibility read should preserve effective participation");
  assert(compatibilityRead?.deckStatus === "APPROVED", "repaired compatibility read should preserve Deliverable readiness projection");
  assert(compatibilityRead?.deckShareable, "repaired compatibility read should preserve share eligibility projection");
  assert(compatibilityRead?.themes.length === 1 && compatibilityRead.themes[0].themeId === termB.id, "repaired compatibility read should preserve Classification projection");

  const writeGateNames = [
    "MINNE_V0_WRITE_REVISION_EVALUATION",
    "MINNE_V0_WRITE_SELECTION_PARTICIPATION",
    "MINNE_V0_WRITE_LIFECYCLE_DISCLOSURE",
    "MINNE_V0_WRITE_PUBLICATION",
    "MINNE_V0_WRITE_SCHEDULE",
    "MINNE_V0_WRITE_DISPATCH",
  ];
  for (const name of writeGateNames) process.env[name] = "false";
  assert(isImplementationGateEnabled("revisionEvaluationWrites"), "Revision/Evaluation write authority must not roll back");
  assert(isImplementationGateEnabled("selectionParticipationWrites"), "Selection/Participation write authority must not roll back");
  assert(isImplementationGateEnabled("lifecycleDisclosureWrites"), "lifecycle/disclosure write authority must not roll back");
  assert(isImplementationGateEnabled("publicationWrites"), "Publication write authority must not roll back");
  assert(isImplementationGateEnabled("scheduleWrites"), "Schedule write authority must not roll back");
  assert(isImplementationGateEnabled("dispatchWrites"), "Dispatch write authority must not roll back");
  assert(!isImplementationGateEnabled("semanticReads"), "semantic read authority must remain explicitly reversible");
  assert(await usesExactPublicationAuthorization(conference.id), "public authorization must remain on the exact-publication rollback floor");

  const secondRepair = await repairConferenceCompatibilityProjections(conference.id);
  assert(secondRepair.repairedSubmissions === 1, "projection repair should be safely repeatable");
  const afterSecondRepair = await prisma.submission.findUniqueOrThrow({ where: { id: submission.id } });
  assert(afterSecondRepair.currentRevisionId === v2.revision.id, "repeat repair must not move the canonical Revision head");
  assert(artifact.id === (await prisma.deliverableRequirement.findUniqueOrThrow({
    where: { submissionId_kindKey: { submissionId: submission.id, kindKey: "deck" } },
  })).currentArtifactId, "repeat repair must not move the canonical ArtifactVersion head");

  if (previousReadGate == null) delete process.env.MINNE_V0_SEMANTIC_READS;
  else process.env.MINNE_V0_SEMANTIC_READS = previousReadGate;

  console.log(
    JSON.stringify(
      {
        ok: true,
        conferenceId: conference.id,
        proposalRef: submission.id,
        currentRevisionRef: v2.revision.id,
        projectionRepair: firstRepair,
        readRollbackSource: compatibilityRead?.semantic.readSource,
        canonicalHistoryPreserved: historyAfter,
        writerRollbackFloorsLocked: true,
        exactPublicationAuthorizationFloor: true,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
