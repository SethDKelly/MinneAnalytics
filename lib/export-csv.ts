import { formatDegrees } from "./degrees";
import { formatScore } from "./scoring-scale";

export type ExportRow = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  selectionDisposition: string;
  withdrawn: boolean;
  effectiveParticipation: boolean;
  currentRevisionRef: string;
  currentRevisionVersion: number;
  deliverableReadiness: string;
  artifactVersionRef: string;
  sharingEligible: boolean;
  publicationAvailability: string;
  vipRegistered: boolean;
  isSponsorSession: boolean;
  technicalLevel: number;
  aggregateAverage: number;
  aggregateCount: number;
  degrees: string;
  themeNames: string;
  feedbackCount: number;
  feedbackSummary: string;
  emailSendsSummary: string;
  createdAt: string;
  evaluationsSummary: string;
  compatProgramStatus: string;
  compatDeckStatus: string;
  compatAbstractReviewStatus: string;
  compatAbstractVersion: number;
  compatDeckShareable: boolean;
};

function escapeCsv(value: string | number | boolean | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function submissionsToCsv(rows: ExportRow[]): string {
  const headers = [
    "proposal_ref",
    "title",
    "first_name",
    "last_name",
    "email",
    "organization",
    "selection_disposition",
    "withdrawn",
    "effective_participation",
    "current_revision_ref",
    "current_revision_version",
    "deliverable_readiness",
    "artifact_version_ref",
    "sharing_eligible",
    "publication_availability",
    "vip_registered",
    "is_sponsor_session",
    "technical_level",
    "avg_evaluation_current_revision",
    "evaluation_count_current_revision",
    "degrees",
    "theme_names_current_revision",
    "feedback_count",
    "feedback_summary",
    "dispatch_sends",
    "submitted_at",
    "evaluations",
    "compat_program_status",
    "compat_deck_status",
    "compat_abstract_review_status",
    "compat_abstract_version",
    "compat_deck_shareable",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.title,
        row.firstName,
        row.lastName,
        row.email,
        row.organization,
        row.selectionDisposition,
        row.withdrawn,
        row.effectiveParticipation,
        row.currentRevisionRef,
        row.currentRevisionVersion,
        row.deliverableReadiness,
        row.artifactVersionRef,
        row.sharingEligible,
        row.publicationAvailability,
        row.vipRegistered,
        row.isSponsorSession,
        row.technicalLevel,
        row.aggregateAverage.toFixed(2),
        row.aggregateCount,
        row.degrees,
        row.themeNames,
        row.feedbackCount,
        row.feedbackSummary,
        row.emailSendsSummary,
        row.createdAt,
        row.evaluationsSummary,
        row.compatProgramStatus,
        row.compatDeckStatus,
        row.compatAbstractReviewStatus,
        row.compatAbstractVersion,
        row.compatDeckShareable,
      ]
        .map(escapeCsv)
        .join(",")
    ),
  ];
  return lines.join("\r\n");
}

export function buildEvaluationsSummary(
  evaluations: {
    label: string;
    value: number;
    notes: string | null;
    subjectRevisionRef: string | null;
    currentRevisionRef: string | null;
  }[]
): string {
  return evaluations
    .map((evaluation) => {
      const subject = evaluation.subjectRevisionRef
        ? `@${evaluation.subjectRevisionRef}${
            evaluation.currentRevisionRef &&
            evaluation.subjectRevisionRef !== evaluation.currentRevisionRef
              ? "!prior"
              : ""
          }`
        : "@legacy-subject-unknown";
      return `${evaluation.label}:${formatScore(evaluation.value)}${subject}${
        evaluation.notes ? `(${evaluation.notes})` : ""
      }`;
    })
    .join(" | ");
}

/** @deprecated 004-F export callers should use buildEvaluationsSummary. */
export function buildScoresSummary(
  scores: {
    label: string;
    value: number;
    notes: string | null;
    scoredAbstractVersion?: number | null;
    abstractVersion?: number;
  }[]
): string {
  return scores
    .map((score) => {
      const version =
        score.scoredAbstractVersion != null && score.abstractVersion != null
          ? `@v${score.scoredAbstractVersion}${
              score.scoredAbstractVersion < score.abstractVersion ? "!" : ""
            }`
          : "";
      return `${score.label}:${formatScore(score.value)}${version}${
        score.notes ? `(${score.notes})` : ""
      }`;
    })
    .join(" | ");
}

export function degreesDisplay(raw: string): string {
  return formatDegrees(raw);
}
