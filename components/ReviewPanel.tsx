"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProgramStatusBadge } from "./StatusBadge";
import type { SubmissionListItem } from "@/lib/submissions";
import type { ReviewerRole } from "@prisma/client";
import { isBoard, roleDisplayName } from "@/lib/roles";
import { EMPTY_AGGREGATE } from "@/lib/scoring";
import { TECHNICAL_LABELS } from "@/lib/constants";
import {
  SCORE_MAX,
  SCORE_MIN,
  SCORE_STEP,
  formatScore,
  roundScore,
} from "@/lib/scoring-scale";

type Props = {
  token: string;
  label: string;
  role: ReviewerRole;
  needsScore: SubmissionListItem[];
  scored: SubmissionListItem[];
};

export function ReviewPanel({ token, label, role, needsScore, scored }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function saveScore(submissionId: string, value: number, notes: string) {
    setSaving(submissionId);
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        submissionId,
        value: roundScore(value),
        notes: notes || undefined,
      }),
    });
    setSaving(null);
    if (res.ok) router.refresh();
  }

  const total = needsScore.length + scored.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-minne-navy">Abstract review</h1>
      <p className="mt-1 text-gray-700">
        {label} · {roleDisplayName(role)} — score each talk once on a 0.0–1.0 scale (0.1
        increments). Newest submissions appear first; after you save a score, the talk moves
        to the scored queue below.
      </p>
      <p className="mt-2 text-sm">
        <Link href={`/chair/${token}`} className="text-minne-navy underline">
          Open program dashboard
        </Link>
        {isBoard(role)
          ? " to approve talks and review decks."
          : " to review committee rankings and slide decks (approval is board-only)."}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        {needsScore.length} awaiting your score · {scored.length} scored by you · {total}{" "}
        total
      </p>

      <ReviewSection
        title="Needs your score"
        description="Sorted by submission date (newest first)"
        items={needsScore}
        emptyMessage="You have scored every submission in the queue."
        expanded={expanded}
        setExpanded={setExpanded}
        saving={saving}
        onSave={saveScore}
        showMyScore={false}
      />

      <ReviewSection
        title="Scored by you"
        description="Talks you have already scored — newest submissions first within this list"
        items={scored}
        emptyMessage="No scores saved yet. Completed talks will appear here."
        expanded={expanded}
        setExpanded={setExpanded}
        saving={saving}
        onSave={saveScore}
        showMyScore
        className="mt-10 border-t border-gray-200 pt-8"
      />
    </div>
  );
}

function ReviewSection({
  title,
  description,
  items,
  emptyMessage,
  expanded,
  setExpanded,
  saving,
  onSave,
  showMyScore,
  className = "mt-8",
}: {
  title: string;
  description: string;
  items: SubmissionListItem[];
  emptyMessage: string;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  saving: string | null;
  onSave: (id: string, value: number, notes: string) => void;
  showMyScore: boolean;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="text-xl font-bold text-minne-navy">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm italic text-gray-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <TalkReviewCard
              key={item.id}
              item={item}
              expanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              saving={saving === item.id}
              onSave={onSave}
              showMyScore={showMyScore}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function TalkReviewCard({
  item,
  expanded,
  onToggle,
  saving,
  onSave,
  showMyScore,
}: {
  item: SubmissionListItem;
  expanded: boolean;
  onToggle: () => void;
  saving: boolean;
  onSave: (id: string, value: number, notes: string) => void;
  showMyScore: boolean;
}) {
  const agg = item.aggregate ?? EMPTY_AGGREGATE;
  const submitted = new Date(item.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <li
      className={`card ${showMyScore ? "border-l-4 border-l-green-600" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-minne-navy">{item.title}</h3>
          <p className="text-sm text-gray-600">
            {item.firstName} {item.lastName} · {item.organization} · Technical:{" "}
            {item.technicalLevel} ({TECHNICAL_LABELS[item.technicalLevel]})
          </p>
          <p className="mt-1 text-xs text-gray-500">Submitted {submitted}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {showMyScore && item.myScore && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-900">
              Your score: {formatScore(item.myScore.value)}
            </span>
          )}
          <ProgramStatusBadge status={item.programStatus} />
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-700">
        Committee aggregate:{" "}
        <strong>avg {agg.average.toFixed(2)}</strong> ({agg.count} scorer
        {agg.count === 1 ? "" : "s"}, sum {agg.sum.toFixed(1)})
      </p>
      <button
        type="button"
        className="mt-2 text-sm text-minne-navy underline"
        onClick={onToggle}
      >
        {expanded ? "Hide" : showMyScore ? "Edit" : "Score"} talk
      </button>
      {expanded && item.abstract && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.abstract}</p>
      )}
      {expanded && (
        <ScoreForm
          submissionId={item.id}
          initialValue={item.myScore?.value}
          initialNotes={item.myScore?.notes ?? ""}
          saving={saving}
          onSave={onSave}
        />
      )}
    </li>
  );
}

function ScoreForm({
  submissionId,
  initialValue,
  initialNotes,
  saving,
  onSave,
}: {
  submissionId: string;
  initialValue?: number;
  initialNotes: string;
  saving: boolean;
  onSave: (id: string, value: number, notes: string) => void;
}) {
  const [value, setValue] = useState<number>(
    typeof initialValue === "number" ? roundScore(initialValue) : 0.5
  );
  const [notes, setNotes] = useState(initialNotes);
  const [touched, setTouched] = useState(typeof initialValue === "number");

  const steps = Array.from(
    { length: (SCORE_MAX - SCORE_MIN) / SCORE_STEP + 1 },
    (_, i) => roundScore(SCORE_MIN + i * SCORE_STEP)
  );

  return (
    <div className="mt-4 border-t pt-4">
      <label className="form-label" htmlFor={`score-slider-${submissionId}`}>
        Your score: <strong className="text-minne-navy">{formatScore(value)}</strong>
        <span className="ml-2 font-normal text-gray-600">
          (0.0 = do not select · 1.0 = top choice)
        </span>
      </label>
      <input
        id={`score-slider-${submissionId}`}
        type="range"
        min={SCORE_MIN}
        max={SCORE_MAX}
        step={SCORE_STEP}
        value={value}
        onChange={(e) => {
          setValue(roundScore(parseFloat(e.target.value)));
          setTouched(true);
        }}
        className="mt-2 w-full accent-minne-navy"
      />
      <div className="mt-1 flex justify-between text-[10px] text-gray-500">
        {steps.map((s) => (
          <span key={s}>{formatScore(s)}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {steps.map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded px-2 py-0.5 text-xs ${
              value === s
                ? "bg-minne-navy text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
            onClick={() => {
              setValue(s);
              setTouched(true);
            }}
          >
            {formatScore(s)}
          </button>
        ))}
      </div>
      <textarea
        className="form-input mt-3"
        rows={2}
        placeholder="Notes for the committee (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        type="button"
        className="btn-primary mt-2"
        disabled={!touched || saving}
        onClick={() => onSave(submissionId, value, notes)}
      >
        {saving ? "Saving…" : "Save score"}
      </button>
    </div>
  );
}
