"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  computeJudgeSubtotal,
  maxPossibleSubtotal,
} from "@/lib/mudac/scoring";

type CriterionRow = {
  id: string;
  sortOrder: number;
  name: string;
  maxPoints: number;
  weight: number;
};

type Props = {
  token: string;
  presentationId: string;
  teamDisplayId: string;
  divisionLabel: string;
  panelLabel: string;
  scoringLocked: boolean;
  criteria: CriterionRow[];
  initialScores: Record<string, number>;
  initialNotes: string;
  initialSubmitted: boolean;
};

function clampScore(value: number, maxPoints: number): number {
  const v = Math.round(value * 10) / 10;
  return Math.min(maxPoints, Math.max(0, v));
}

function CriterionScoreRow({
  criterion,
  value,
  disabled,
  onChange,
}: {
  criterion: CriterionRow;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const step = 0.5;

  function adjust(delta: number) {
    onChange(clampScore(value + delta, criterion.maxPoints));
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-minne-navy">
            {criterion.sortOrder}. {criterion.name}
          </p>
          <p className="text-xs text-gray-500">0 – {criterion.maxPoints} points</p>
        </div>
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          <button
            type="button"
            disabled={disabled}
            onClick={() => adjust(-step)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-semibold text-minne-navy hover:bg-gray-100 disabled:opacity-50"
            aria-label={`Decrease ${criterion.name}`}
          >
            −
          </button>
          <input
            type="number"
            min={0}
            max={criterion.maxPoints}
            step={0.1}
            inputMode="decimal"
            disabled={disabled}
            value={value}
            onChange={(e) =>
              onChange(clampScore(Number(e.target.value), criterion.maxPoints))
            }
            className="form-input w-20 text-center text-base sm:w-24"
            aria-label={`Score for ${criterion.name}`}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => adjust(step)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-semibold text-minne-navy hover:bg-gray-100 disabled:opacity-50"
            aria-label={`Increase ${criterion.name}`}
          >
            +
          </button>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={criterion.maxPoints}
        step={0.1}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(clampScore(Number(e.target.value), criterion.maxPoints))}
        className="mt-4 h-3 w-full cursor-pointer accent-minne-navy disabled:opacity-50"
        aria-label={`Slider for ${criterion.name}`}
      />
    </div>
  );
}

export function MudacJudgeScorecardForm({
  token,
  presentationId,
  teamDisplayId,
  divisionLabel,
  panelLabel,
  scoringLocked,
  criteria,
  initialScores,
  initialNotes,
  initialSubmitted,
}: Props) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [notes, setNotes] = useState(initialNotes);
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const liveSubtotal = useMemo(
    () =>
      computeJudgeSubtotal(
        criteria.map((c) => ({
          value: scores[c.id] ?? 0,
          weight: c.weight,
        }))
      ),
    [criteria, scores]
  );

  const maxTotal = useMemo(() => maxPossibleSubtotal(criteria), [criteria]);

  async function save(submit: boolean) {
    setError(null);
    setLoading(submit ? "submit" : "draft");

    const res = await fetch("/api/mudac/scorecards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        presentationId,
        scores: criteria.map((c) => ({
          criterionId: c.id,
          value: scores[c.id] ?? 0,
        })),
        notes: notes || undefined,
        submit,
      }),
    });

    setLoading(null);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not save scorecard");
      return;
    }

    setSubmitted(Boolean(data.submitted));
    router.refresh();
    if (submit) {
      router.push(`/mudac/judge/${token}`);
    }
  }

  const readOnly = scoringLocked;

  return (
    <div className="pb-28 sm:pb-0">
      <p className="text-sm text-gray-600">
        <Link href={`/mudac/judge/${token}`} className="text-minne-navy underline">
          ← Back to teams
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-bold text-minne-navy sm:text-3xl">
        Score team {teamDisplayId}
      </h1>
      <p className="mt-1 text-gray-700">
        {divisionLabel} · {panelLabel}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Judges see team ID and division only — not school names.
      </p>

      {scoringLocked && (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Scoring is locked. You can view scores but cannot change them.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save(true);
        }}
      >
        {criteria.map((c) => (
          <CriterionScoreRow
            key={c.id}
            criterion={c}
            value={scores[c.id] ?? 0}
            disabled={readOnly}
            onChange={(v) => setScores((s) => ({ ...s, [c.id]: v }))}
          />
        ))}

        <label className="card block p-4 text-sm">
          <span className="form-label">Notes (optional)</span>
          <textarea
            name="notes"
            rows={3}
            disabled={readOnly}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input mt-2 w-full text-base"
          />
        </label>

        <div className="card hidden p-4 sm:block">
          <p className="text-sm font-medium text-minne-navy">
            Your subtotal: {liveSubtotal} / {maxTotal}
            {submitted && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                Submitted
              </span>
            )}
          </p>
          {!readOnly && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary min-h-11"
                disabled={loading !== null}
                onClick={() => save(false)}
              >
                {loading === "draft" ? "Saving…" : "Save draft"}
              </button>
              <button
                type="submit"
                className="btn-primary min-h-11"
                disabled={loading !== null}
              >
                {loading === "submit" ? "Submitting…" : "Submit scorecard"}
              </button>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:hidden">
            <p className="text-center text-sm font-medium text-minne-navy">
              Subtotal: {liveSubtotal} / {maxTotal}
              {submitted && (
                <span className="ml-2 text-xs text-green-700">(submitted)</span>
              )}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn-secondary min-h-12 w-full"
                disabled={loading !== null}
                onClick={() => save(false)}
              >
                {loading === "draft" ? "…" : "Save draft"}
              </button>
              <button
                type="submit"
                className="btn-primary min-h-12 w-full"
                disabled={loading !== null}
              >
                {loading === "submit" ? "…" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
