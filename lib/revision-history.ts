import type { Score, SubmissionRevision } from "@prisma/client";
import {
  countScoresAtCurrentVersion,
  countStaleScoresByVersion,
} from "./rescoring";

export const REVISION_FIELD_LABELS: Record<string, string> = {
  title: "Title",
  abstract: "Abstract",
  bio: "Bio",
  technicalLevel: "Technical level",
  themes: "Themes",
};

export type RevisionRow = {
  version: number;
  createdAt: string;
  changeNote: string | null;
  changedFields: string[];
  title: string;
  abstract: string;
  bio: string;
  technicalLevel: number;
  themeIds: string[];
  themeNames?: string[];
};

export type RevisionDiff = {
  field: string;
  label: string;
  before: string;
  after: string;
};

export function parseChangedFields(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function parseThemeIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function revisionToRow(
  rev: SubmissionRevision,
  themeNamesById?: Record<string, string>
): RevisionRow {
  const themeIds = parseThemeIds(rev.themeIds);
  return {
    version: rev.version,
    createdAt: rev.createdAt.toISOString(),
    changeNote: rev.changeNote,
    changedFields: parseChangedFields(rev.changedFields),
    title: rev.title,
    abstract: rev.abstract,
    bio: rev.bio,
    technicalLevel: rev.technicalLevel,
    themeIds,
    themeNames: themeNamesById
      ? themeIds.map((id) => themeNamesById[id] ?? id)
      : undefined,
  };
}

export function diffRevisions(rows: RevisionRow[]): RevisionDiff[] {
  const sorted = [...rows].sort((a, b) => a.version - b.version);
  const diffs: RevisionDiff[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const curr = sorted[i]!;
    for (const field of curr.changedFields) {
      if (field === "themes") {
        const before = (prev.themeNames ?? prev.themeIds).join(", ") || "(none)";
        const after = (curr.themeNames ?? curr.themeIds).join(", ") || "(none)";
        diffs.push({
          field,
          label: REVISION_FIELD_LABELS[field] ?? field,
          before,
          after,
        });
        continue;
      }
      if (field === "technicalLevel") {
        diffs.push({
          field,
          label: REVISION_FIELD_LABELS[field] ?? field,
          before: String(prev.technicalLevel),
          after: String(curr.technicalLevel),
        });
        continue;
      }
      const key = field as keyof Pick<RevisionRow, "title" | "abstract" | "bio">;
      if (key in prev && key in curr) {
        diffs.push({
          field,
          label: REVISION_FIELD_LABELS[field] ?? field,
          before: String(prev[key]),
          after: String(curr[key]),
        });
      }
    }
  }
  return diffs;
}

export type ScoreVersionSummary = {
  abstractVersion: number;
  abstractReviewStatus: string;
  scoreCount: number;
  currentScoreCount: number;
  committeeSize: number;
  staleScoreCount: number;
  mayBeStale: boolean;
  latestChangedFields: string[];
};

export function computeScoreVersionSummary(
  submission: {
    abstractVersion: number;
    abstractReviewStatus: string;
  },
  scores: Pick<Score, "scoredAbstractVersion">[],
  committeeSize: number,
  latestChangedFields: string[] = []
): ScoreVersionSummary {
  const currentScoreCount = countScoresAtCurrentVersion(
    scores,
    submission.abstractVersion
  );
  const staleScoreCount = countStaleScoresByVersion(
    scores,
    submission.abstractVersion
  );
  const mayBeStale =
    staleScoreCount > 0 ||
    (submission.abstractReviewStatus === "REVISED" && currentScoreCount < scores.length);
  return {
    abstractVersion: submission.abstractVersion,
    abstractReviewStatus: submission.abstractReviewStatus,
    scoreCount: scores.length,
    currentScoreCount,
    committeeSize,
    staleScoreCount,
    mayBeStale,
    latestChangedFields,
  };
}

export function formatScoreVersionSummary(summary: ScoreVersionSummary): string {
  const parts: string[] = [];
  if (summary.currentScoreCount > 0 || summary.scoreCount > 0) {
    parts.push(
      `${summary.currentScoreCount} of ${summary.committeeSize} reviewer${
        summary.committeeSize === 1 ? "" : "s"
      } scored v${summary.abstractVersion}`
    );
  }
  if (summary.staleScoreCount > 0) {
    parts.push(
      `${summary.staleScoreCount} score${
        summary.staleScoreCount === 1 ? "" : "s"
      } on older version${summary.staleScoreCount === 1 ? "" : "s"}`
    );
  } else if (summary.mayBeStale && summary.abstractReviewStatus === "REVISED") {
    parts.push("awaiting rescores on latest revision");
  }
  if (summary.latestChangedFields.length > 0) {
    const labels = summary.latestChangedFields.map(
      (f) => REVISION_FIELD_LABELS[f] ?? f
    );
    parts.push(`Latest change: ${labels.join(", ")}`);
  }
  if (parts.length === 0) {
    return summary.abstractVersion > 1 ? "Presenter revision on file" : "Initial submission";
  }
  return parts.join(" · ");
}
