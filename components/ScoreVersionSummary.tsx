import type { ScoreVersionSummary } from "@/lib/revision-history";
import { formatScoreVersionSummary } from "@/lib/revision-history";
import { RevisionBadge } from "./RevisionBadge";

export function ScoreVersionSummaryLine({
  summary,
}: {
  summary: ScoreVersionSummary;
}) {
  return (
    <p
      className={`mt-1 text-xs ${
        summary.mayBeStale ? "text-amber-900" : "text-gray-600"
      }`}
    >
      <RevisionBadge version={summary.abstractVersion} />{" "}
      {formatScoreVersionSummary(summary)}
    </p>
  );
}
