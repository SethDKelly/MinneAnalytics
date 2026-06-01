import type { MudacDivision, MudacPanelAggregateMode } from "@prisma/client";
import { computeJudgeSubtotal, maxPossibleSubtotal, type CriterionForScoring } from "@/lib/mudac/scoring";

export type RankingNormalization = "PANEL" | "JUDGE_NORMALIZED" | "Z_SCORE";

export type ScorecardDetail = {
  judgeId: string;
  judgeName: string;
  submitted: boolean;
  subtotal: number;
  normalizedSubtotal: number;
  scores: Array<{
    criterionId: string;
    criterionName: string;
    value: number;
    maxPoints: number;
  }>;
};

export type PresentationAggregate = {
  presentationId: string;
  teamDisplayId: string;
  division: MudacDivision;
  panelId: string;
  panelLabel: string;
  judgesExpected: number;
  judgesSubmitted: number;
  complete: boolean;
  judgeScorecards: ScorecardDetail[];
  panelScore: number;
  judgeNormalizedPanelScore: number;
};

export type DivisionRanking = {
  division: MudacDivision;
  rows: Array<
    PresentationAggregate & {
      rank: number;
      displayScore: number;
      zScore: number | null;
    }
  >;
};

type RawScorecard = {
  judge: { id: string; name: string };
  submittedAt: Date | null;
  scores: Array<{
    value: number;
    criterionId: string;
    criterion: { id: string; name: string; maxPoints: number; weight: number };
  }>;
};

type RawPresentation = {
  id: string;
  panelId: string;
  panel: { label: string };
  team: { displayId: string; division: MudacDivision };
  scorecards: RawScorecard[];
};

export function buildScorecardDetail(
  scorecard: RawScorecard,
  criteria: CriterionForScoring[],
  maxPossible: number
): ScorecardDetail {
  const byCriterion = new Map(scorecard.scores.map((s) => [s.criterionId, s]));
  const scores = criteria.map((c) => {
    const row = byCriterion.get(c.id);
    return {
      criterionId: c.id,
      criterionName: row?.criterion.name ?? c.id,
      value: row?.value ?? 0,
      maxPoints: c.maxPoints,
    };
  });

  const subtotal = computeJudgeSubtotal(
    criteria.map((c) => {
      const row = byCriterion.get(c.id);
      return { value: row?.value ?? 0, weight: c.weight };
    })
  );

  return {
    judgeId: scorecard.judge.id,
    judgeName: scorecard.judge.name,
    submitted: Boolean(scorecard.submittedAt),
    subtotal,
    normalizedSubtotal: maxPossible > 0 ? Math.round((subtotal / maxPossible) * 1000) / 10 : 0,
    scores,
  };
}

export function aggregatePanelScore(
  subtotals: number[],
  mode: MudacPanelAggregateMode
): number {
  if (subtotals.length === 0) return 0;
  const sum = subtotals.reduce((a, b) => a + b, 0);
  const value = mode === "MEAN" ? sum / subtotals.length : sum;
  return Math.round(value * 100) / 100;
}

export function buildPresentationAggregate(
  presentation: RawPresentation,
  criteria: CriterionForScoring[],
  panelAggregateMode: MudacPanelAggregateMode,
  judgesExpected: number
): PresentationAggregate {
  const maxPossible = maxPossibleSubtotal(criteria);
  const judgeScorecards = presentation.scorecards.map((sc) =>
    buildScorecardDetail(sc, criteria, maxPossible)
  );
  const submittedCards = judgeScorecards.filter((j) => j.submitted);
  const subtotals = submittedCards.map((j) => j.subtotal);
  const normalizedSubtotals = submittedCards.map((j) => j.normalizedSubtotal);

  return {
    presentationId: presentation.id,
    teamDisplayId: presentation.team.displayId,
    division: presentation.team.division,
    panelId: presentation.panelId,
    panelLabel: presentation.panel.label,
    judgesExpected,
    judgesSubmitted: submittedCards.length,
    complete: submittedCards.length >= judgesExpected && judgesExpected > 0,
    judgeScorecards,
    panelScore: aggregatePanelScore(subtotals, panelAggregateMode),
    judgeNormalizedPanelScore: aggregatePanelScore(
      normalizedSubtotals,
      panelAggregateMode
    ),
  };
}

function zScores(values: number[]): number[] {
  if (values.length < 2) return values.map(() => 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  if (std < 1e-6) return values.map(() => 0);
  return values.map((v) => Math.round(((v - mean) / std) * 100) / 100);
}

export function displayScoreForRow(
  row: PresentationAggregate,
  normalization: RankingNormalization
): number {
  switch (normalization) {
    case "JUDGE_NORMALIZED":
      return row.judgeNormalizedPanelScore;
    case "Z_SCORE":
      return row.panelScore;
    default:
      return row.panelScore;
  }
}

export function buildDivisionRankings(
  presentations: RawPresentation[],
  criteria: CriterionForScoring[],
  panelAggregateMode: MudacPanelAggregateMode,
  judgesPerPanel: number,
  normalization: RankingNormalization,
  divisions: MudacDivision[]
): DivisionRanking[] {
  const aggregates = presentations.map((p) =>
    buildPresentationAggregate(p, criteria, panelAggregateMode, judgesPerPanel)
  );

  return divisions.map((division) => {
    const inDivision = aggregates.filter((a) => a.division === division);
    const baseScores = inDivision.map((r) => displayScoreForRow(r, normalization));

    const zByPresentation =
      normalization === "Z_SCORE"
        ? Object.fromEntries(
            inDivision.map((row, i) => [row.presentationId, zScores(baseScores)[i]])
          )
        : {};

    const ranked = inDivision
      .map((row) => {
        const displayScore =
          normalization === "Z_SCORE"
            ? (zByPresentation[row.presentationId] ?? 0)
            : displayScoreForRow(row, normalization);
        return {
          ...row,
          displayScore,
          zScore: normalization === "Z_SCORE" ? displayScore : null,
        };
      })
      .sort((a, b) => {
        if (b.displayScore !== a.displayScore) return b.displayScore - a.displayScore;
        return a.teamDisplayId.localeCompare(b.teamDisplayId);
      })
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }));

    return { division, rows: ranked };
  });
}

export function buildRankingsFromAggregates(
  aggregates: PresentationAggregate[],
  normalization: RankingNormalization,
  divisions: MudacDivision[]
): DivisionRanking[] {
  return divisions.map((division) => {
    const inDivision = aggregates.filter((a) => a.division === division);
    const baseScores = inDivision.map((r) => displayScoreForRow(r, normalization));

    const zByPresentation =
      normalization === "Z_SCORE"
        ? Object.fromEntries(
            inDivision.map((row, i) => [row.presentationId, zScores(baseScores)[i]])
          )
        : {};

    const ranked = inDivision
      .map((row) => {
        const displayScore =
          normalization === "Z_SCORE"
            ? (zByPresentation[row.presentationId] ?? 0)
            : displayScoreForRow(row, normalization);
        return {
          ...row,
          displayScore,
          zScore: normalization === "Z_SCORE" ? displayScore : null,
        };
      })
      .sort((a, b) => {
        if (b.displayScore !== a.displayScore) return b.displayScore - a.displayScore;
        return a.teamDisplayId.localeCompare(b.teamDisplayId);
      })
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }));

    return { division, rows: ranked };
  });
}

export function presentationsToCsv(
  rankings: DivisionRanking[],
  panelAggregateMode: MudacPanelAggregateMode
): string {
  const headers = [
    "division",
    "rank",
    "team_id",
    "panel",
    "panel_aggregate_mode",
    "panel_score",
    "judges_submitted",
    "judges_expected",
    "complete",
    "judge_scores",
  ];
  const lines = [headers.join(",")];

  for (const block of rankings) {
    for (const row of block.rows) {
      const judgePart = row.judgeScorecards
        .map((j) => `${j.judgeName}:${j.subtotal}${j.submitted ? "" : "(draft)"}`)
        .join("; ");
      lines.push(
        [
          block.division,
          row.rank,
          row.teamDisplayId,
          csvEscape(row.panelLabel),
          panelAggregateMode,
          row.panelScore,
          row.judgesSubmitted,
          row.judgesExpected,
          row.complete ? "yes" : "no",
          csvEscape(judgePart),
        ].join(",")
      );
    }
  }
  return lines.join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
