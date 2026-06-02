import { formatDegrees } from "./degrees";
import { formatScore } from "./scoring-scale";

export type ExportRow = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  programStatus: string;
  deckStatus: string | null;
  deckShareable: boolean;
  vipRegistered: boolean;
  isSponsorSession: boolean;
  technicalLevel: number;
  abstractVersion: number;
  abstractReviewStatus: string;
  aggregateAverage: number;
  aggregateCount: number;
  degrees: string;
  themeNames: string;
  themeSources: string;
  feedbackCount: number;
  feedbackSummary: string;
  emailSendsSummary: string;
  createdAt: string;
  scoresSummary: string;
};

function escapeCsv(value: string | number | boolean | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function submissionsToCsv(rows: ExportRow[]): string {
  const headers = [
    "id",
    "title",
    "first_name",
    "last_name",
    "email",
    "organization",
    "program_status",
    "deck_status",
    "deck_shareable",
    "vip_registered",
    "is_sponsor_session",
    "technical_level",
    "abstract_version",
    "abstract_review_status",
    "avg_score_current_version",
    "scorer_count_current_version",
    "degrees",
    "theme_names",
    "theme_sources",
    "feedback_count",
    "feedback_summary",
    "email_sends",
    "submitted_at",
    "scores",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.title,
        r.firstName,
        r.lastName,
        r.email,
        r.organization,
        r.programStatus,
        r.deckStatus ?? "",
        r.deckShareable,
        r.vipRegistered,
        r.isSponsorSession,
        r.technicalLevel,
        r.abstractVersion,
        r.abstractReviewStatus,
        r.aggregateAverage.toFixed(2),
        r.aggregateCount,
        r.degrees,
        r.themeNames,
        r.themeSources,
        r.feedbackCount,
        r.feedbackSummary,
        r.emailSendsSummary,
        r.createdAt,
        r.scoresSummary,
      ]
        .map(escapeCsv)
        .join(",")
    ),
  ];
  return lines.join("\r\n");
}

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
    .map((s) => {
      const ver =
        s.scoredAbstractVersion != null && s.abstractVersion != null
          ? `@v${s.scoredAbstractVersion}${s.scoredAbstractVersion < s.abstractVersion ? "!" : ""}`
          : "";
      return `${s.label}:${formatScore(s.value)}${ver}${s.notes ? `(${s.notes})` : ""}`;
    })
    .join(" | ");
}

export function degreesDisplay(raw: string): string {
  return formatDegrees(raw);
}
