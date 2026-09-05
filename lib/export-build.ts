import type { EmailTemplateKey } from "@prisma/client";
import type { SemanticConferenceSubmission } from "@/lib/concept-design/semantic-reads";
import { selectionLabel } from "@/lib/concept-design/semantic-reads";
import {
  buildEvaluationsSummary,
  degreesDisplay,
  type ExportRow,
} from "@/lib/export-csv";

export type FeedbackExportRow = {
  submissionId: string;
  kind: string;
  body: string;
  createdAt: Date;
  submissionRevisionId: string | null;
  submissionRevisionVersion: number | null;
};

export type DispatchExportRow = {
  submissionId: string | null;
  templateKey: EmailTemplateKey;
  round: number;
  sentAt: Date;
};

export function buildExportRows(
  submissions: SemanticConferenceSubmission[],
  labelById: Record<string, string>,
  feedbackRows: FeedbackExportRow[],
  dispatchRows: DispatchExportRow[]
): ExportRow[] {
  const feedbackBySubmission = new Map<string, FeedbackExportRow[]>();
  for (const feedback of feedbackRows) {
    const current = feedbackBySubmission.get(feedback.submissionId) ?? [];
    current.push(feedback);
    feedbackBySubmission.set(feedback.submissionId, current);
  }
  const sendsBySubmission = new Map<string, DispatchExportRow[]>();
  for (const send of dispatchRows) {
    if (!send.submissionId) continue;
    const current = sendsBySubmission.get(send.submissionId) ?? [];
    current.push(send);
    sendsBySubmission.set(send.submissionId, current);
  }

  return submissions.map((submission) => {
    const feedback = feedbackBySubmission.get(submission.id) ?? [];
    const sends = sendsBySubmission.get(submission.id) ?? [];
    const feedbackSummary = feedback
      .map((row) => {
        const subject =
          row.kind === "ABSTRACT"
            ? row.submissionRevisionId
              ? `Revision ${row.submissionRevisionVersion ?? "?"} (${row.submissionRevisionId})`
              : "ABSTRACT legacy-subject-unknown"
            : row.kind;
        const excerpt = row.body.length > 80 ? `${row.body.slice(0, 80)}…` : row.body;
        return `${subject}: ${excerpt}`;
      })
      .join(" | ");
    const emailSendsSummary = sends
      .map(
        (send) =>
          `${send.templateKey} r${send.round} (${send.sentAt.toISOString().slice(0, 10)})`
      )
      .join(" | ");

    return {
      id: submission.id,
      title: submission.title,
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      organization: submission.organization,
      selectionDisposition: selectionLabel(submission.semantic.selection.disposition),
      withdrawn: submission.semantic.withdrawal.withdrawn,
      effectiveParticipation: submission.semantic.participation.effective,
      currentRevisionRef: submission.semantic.revision.currentRevisionRef ?? "",
      currentRevisionVersion: submission.semantic.revision.ordinal,
      deliverableReadiness: submission.semantic.deliverable.readiness,
      artifactVersionRef: submission.semantic.deliverable.currentArtifactVersionRef ?? "",
      sharingEligible: submission.semantic.sharing.eligible,
      publicationAvailability: submission.semantic.publication.availability,
      vipRegistered: submission.vipRegistered,
      isSponsorSession: submission.isSponsorSession,
      technicalLevel: submission.technicalLevel,
      aggregateAverage: submission.semantic.evaluation.aggregate.average,
      aggregateCount: submission.semantic.evaluation.aggregate.count,
      degrees: degreesDisplay(submission.degrees),
      themeNames: submission.themes.map((theme) => theme.theme.name).join("; "),
      feedbackCount: feedback.length,
      feedbackSummary,
      emailSendsSummary,
      createdAt: submission.createdAt.toISOString(),
      evaluationsSummary: buildEvaluationsSummary(
        submission.evaluationHistory.map((evaluation) => ({
          label: labelById[evaluation.reviewerAccessId] ?? "Reviewer",
          value: evaluation.value,
          notes: evaluation.notes,
          subjectRevisionRef: evaluation.submissionRevisionId,
          currentRevisionRef: submission.semantic.revision.currentRevisionRef,
        }))
      ),
      compatProgramStatus: submission.compatibility.storedProgramStatus,
      compatDeckStatus: submission.compatibility.storedDeckStatus ?? "",
      compatAbstractReviewStatus: submission.abstractReviewStatus,
      compatAbstractVersion: submission.compatibility.storedAbstractVersion,
      compatDeckShareable: submission.compatibility.storedDeckShareable,
    };
  });
}
