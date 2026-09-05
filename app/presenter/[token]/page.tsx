import { notFound } from "next/navigation";
import { PresenterPortal } from "@/components/PresenterPortal";
import { getSubmissionByPresenterToken } from "@/lib/presenter-auth";
import { getSelectableThemes, themeOptionFromRow } from "@/lib/themes";
import { prisma } from "@/lib/db";
import {
  deliverableReadinessLabel,
  getSemanticConferenceSubmissions,
  participationLabel,
  selectionLabel,
} from "@/lib/concept-design/semantic-reads";
import { getRevisionEligibility } from "@/lib/concept-design/lifecycle-disclosure-policy";

export default async function PresenterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const submission = await getSubmissionByPresenterToken(token);
  if (!submission) notFound();

  const [themes, feedbackRows, semanticRows, revisionEligibility] = await Promise.all([
    getSelectableThemes(submission.conferenceId),
    prisma.presenterFeedback.findMany({
      where: { submissionId: submission.id },
      orderBy: { createdAt: "desc" },
      include: {
        reviewerAccess: { select: { label: true, role: true } },
        submissionRevision: { select: { id: true, version: true } },
      },
    }),
    getSemanticConferenceSubmissions(submission.conferenceId),
    getRevisionEligibility(submission),
  ]);
  const semanticSubmission = semanticRows.find((row) => row.id === submission.id);
  if (!semanticSubmission) notFound();

  const artifact = semanticSubmission.deliverables[0]?.currentArtifact ?? null;
  const semantic = semanticSubmission.semantic;
  const feedback = feedbackRows.map((feedbackRow) => ({
    id: feedbackRow.id,
    kind: feedbackRow.kind,
    body: feedbackRow.body,
    reviewerLabel:
      feedbackRow.reviewerAccess.label ?? feedbackRow.reviewerAccess.role.replace("_", " "),
    subjectRevisionRef: feedbackRow.submissionRevision?.id ?? null,
    subjectRevisionVersion:
      feedbackRow.submissionRevision?.version ?? feedbackRow.abstractVersion ?? null,
    createdAt: feedbackRow.createdAt.toISOString(),
  }));

  return (
    <PresenterPortal
      token={token}
      conferenceSlug={submission.conference.slug}
      submissionId={submission.id}
      themes={themes.map(themeOptionFromRow)}
      feedback={feedback}
      submission={{
        title: semanticSubmission.title,
        abstract: semanticSubmission.abstract,
        bio: semanticSubmission.bio,
        technicalLevel: semanticSubmission.technicalLevel,
        themeIds: semanticSubmission.themes.map((theme) => theme.themeId),
        currentRevisionRef: semantic.revision.currentRevisionRef,
        revisionOrdinal: semantic.revision.ordinal,
        selection: {
          disposition: semantic.selection.disposition,
          label: selectionLabel(semantic.selection.disposition),
        },
        participation: {
          effective: semantic.participation.effective,
          withdrawn: semantic.withdrawal.withdrawn,
          label: participationLabel(semantic.participation),
        },
        deliverable: {
          readiness: semantic.deliverable.readiness,
          label: deliverableReadinessLabel(semantic.deliverable.readiness),
          artifactRef: semantic.deliverable.currentArtifactVersionRef,
          filename: artifact?.filename ?? null,
          version: artifact?.version ?? null,
        },
        degrees: semanticSubmission.degrees,
        conferenceName: submission.conference.name,
        canEdit: revisionEligibility.allowed,
        editReasonCode: revisionEligibility.code,
        editReason: revisionEligibility.message,
        canUploadDeck: semantic.participation.effective,
      }}
    />
  );
}
