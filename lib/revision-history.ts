import type { Score, SubmissionRevision } from "@prisma/client";

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
  committeeSize: number;
  staleScoreCount: number;
  mayBeStale: boolean;
  latestChangedFields: string[];
};

export function countStaleScores(
  scores: Pick<Score, "updatedAt">[],
  lastPresenterEditAt: Date | null
): number {
  if (!lastPresenterEditAt || scores.length === 0) return 0;
  const editMs = lastPresenterEditAt.getTime();
  return scores.filter((s) => s.updatedAt.getTime() < editMs).length;
}

export function computeScoreVersionSummary(
  submission: {
    abstractVersion: number;
    abstractReviewStatus: string;
    lastPresenterEditAt: Date | null;
  },
  scores: Pick<Score, "updatedAt">[],
  committeeSize: number,
  latestChangedFields: string[] = []
): ScoreVersionSummary {
  const staleScoreCount = countStaleScores(scores, submission.lastPresenterEditAt);
  const mayBeStale =
    staleScoreCount > 0 ||
    (submission.abstractReviewStatus === "REVISED" && scores.length > 0);
  return {
    abstractVersion: submission.abstractVersion,
    abstractReviewStatus: submission.abstractReviewStatus,
    scoreCount: scores.length,
    committeeSize,
    staleScoreCount,
    mayBeStale,
    latestChangedFields,
  };
}

export function formatScoreVersionSummary(summary: ScoreVersionSummary): string {
  const parts: string[] = [];
  if (summary.scoreCount > 0) {
    parts.push(
      `${summary.scoreCount} of ${summary.committeeSize} reviewer${
        summary.committeeSize === 1 ? "" : "s"
      } scored`
    );
  }
  if (summary.mayBeStale) {
    if (summary.staleScoreCount > 0) {
      parts.push(
        `${summary.staleScoreCount} score${
          summary.staleScoreCount === 1 ? "" : "s"
        } may predate the latest edit`
      );
    } else if (summary.abstractReviewStatus === "REVISED") {
      parts.push("committee scores may predate the latest revision");
    }
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
