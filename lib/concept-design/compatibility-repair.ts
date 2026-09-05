import type { DeckStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { programStatusFromCanonical } from "@/lib/concept-design/selection-participation-deliverable";

function projectedDeckStatus(input: {
  artifactId: string | null;
  assessmentDisposition: "CONCERN" | "READY" | null;
}): DeckStatus | null {
  if (!input.artifactId) return null;
  if (input.assessmentDisposition === "READY") return "APPROVED";
  if (input.assessmentDisposition === "CONCERN") return "CONCERN";
  return "SUBMITTED";
}

export type CompatibilityRepairResult = {
  conferenceId: string;
  repairedSubmissions: number;
  skippedWithoutCanonicalRevision: number;
};

/**
 * Repairs retained denormalized compatibility projections from canonical owners.
 *
 * This function is deliberately one-way. It never creates or mutates canonical
 * Revision, Classification, Selection, Withdrawal, Deliverable, Assessment, or
 * ShareEligibility history.
 */
export async function repairConferenceCompatibilityProjections(
  conferenceId: string
): Promise<CompatibilityRepairResult> {
  const submissions = await prisma.submission.findMany({
    where: { conferenceId },
    include: {
      currentRevision: {
        include: { revisionTerms: { select: { themeId: true } } },
      },
      currentSelectionDecision: true,
      withdrawal: true,
      currentShareEligibilityChange: true,
      deliverables: {
        where: { kindKey: "deck" },
        take: 1,
        include: {
          currentArtifact: { include: { currentAssessment: true } },
        },
      },
    },
  });

  let repairedSubmissions = 0;
  let skippedWithoutCanonicalRevision = 0;

  for (const submission of submissions) {
    const revision = submission.currentRevision;
    if (!revision) {
      skippedWithoutCanonicalRevision += 1;
      continue;
    }

    const deliverable = submission.deliverables[0] ?? null;
    const artifact = deliverable?.currentArtifact ?? null;
    const deckStatus = projectedDeckStatus({
      artifactId: artifact?.id ?? null,
      assessmentDisposition: artifact?.currentAssessment?.disposition ?? null,
    });
    const programStatus = programStatusFromCanonical({
      disposition: submission.currentSelectionDecision?.disposition ?? null,
      withdrawn: Boolean(submission.withdrawal),
    });
    const deckShareable =
      submission.currentShareEligibilityChange?.eligible ?? submission.deckShareable;
    const themeIds = revision.revisionTerms.map((term) => term.themeId);

    await prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submission.id },
        data: {
          title: revision.title,
          abstract: revision.abstract,
          bio: revision.bio,
          technicalLevel: revision.technicalLevel,
          abstractVersion: revision.version,
          programStatus,
          deckStatus,
          deckShareable,
        },
      });
      await tx.submissionTheme.deleteMany({ where: { submissionId: submission.id } });
      if (themeIds.length > 0) {
        await tx.submissionTheme.createMany({
          data: themeIds.map((themeId) => ({ submissionId: submission.id, themeId })),
        });
      }
    });

    repairedSubmissions += 1;
  }

  return {
    conferenceId,
    repairedSubmissions,
    skippedWithoutCanonicalRevision,
  };
}
