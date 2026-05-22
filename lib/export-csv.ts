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
  technicalLevel: number;
  aggregateAverage: number;
  aggregateCount: number;
  degrees: string;
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
    "technical_level",
    "avg_score",
    "scorer_count",
    "degrees",
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
        r.technicalLevel,
        r.aggregateAverage.toFixed(2),
        r.aggregateCount,
        r.degrees,
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
  scores: { label: string; value: number; notes: string | null }[]
): string {
  return scores
    .map((s) => `${s.label}:${formatScore(s.value)}${s.notes ? `(${s.notes})` : ""}`)
    .join(" | ");
}

export function degreesDisplay(raw: string): string {
  return formatDegrees(raw);
}
