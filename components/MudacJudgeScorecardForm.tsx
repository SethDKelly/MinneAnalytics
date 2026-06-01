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
    <div>
      <p className="text-sm text-gray-600">
        <Link href={`/mudac/judge/${token}`} className="text-minne-navy underline">
          ← Back to teams
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold text-minne-navy">Score team {teamDisplayId}</h1>
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
        className="card mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save(true);
        }}
      >
        {criteria.map((c) => (
          <div key={c.id} className="border-b border-gray-100 pb-4 last:border-0">
            <label className="block text-sm font-semibold text-minne-navy">
              {c.sortOrder}. {c.name}
              <span className="ml-2 font-normal text-gray-500">
                (0–{c.maxPoints} pts)
              </span>
            </label>
            <input
              type="number"
              min={0}
              max={c.maxPoints}
              step={0.1}
              required
              disabled={readOnly}
              value={scores[c.id] ?? 0}
              onChange={(e) =>
                setScores((s) => ({ ...s, [c.id]: Number(e.target.value) }))
              }
              className="form-input mt-2 w-32"
            />
          </div>
        ))}

        <label className="block text-sm">
          <span className="form-label">Notes (optional)</span>
          <textarea
            name="notes"
            rows={3}
            disabled={readOnly}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input mt-1 w-full"
          />
        </label>

        <p className="text-sm font-medium text-minne-navy">
          Your subtotal: {liveSubtotal} / {maxTotal}
          {submitted && (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
              Submitted
            </span>
          )}
        </p>

        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={loading !== null}
              onClick={() => save(false)}
            >
              {loading === "draft" ? "Saving…" : "Save draft"}
            </button>
            <button type="submit" className="btn-primary" disabled={loading !== null}>
              {loading === "submit" ? "Submitting…" : "Submit scorecard"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
