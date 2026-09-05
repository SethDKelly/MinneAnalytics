"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SponsorSessionBadge } from "./StatusBadge";
import { BlindIdentityBlock } from "./BlindIdentityBlock";
import { RescoreIndicator } from "./RescoreIndicator";
import { RevisionBadge } from "./RevisionBadge";
import { SubmissionRevisionHistory } from "./SubmissionRevisionHistory";
import { ReviewFeedbackForm } from "./ReviewFeedbackForm";
import type { ReviewSubmissionItem } from "@/lib/review-blind";
import type { ReviewerRole } from "@prisma/client";
import { isBoard, roleDisplayName } from "@/lib/roles";
import { TECHNICAL_LABELS } from "@/lib/constants";
import {
  SCORE_MAX,
  SCORE_MIN,
  SCORE_STEP,
  formatScore,
  roundScore,
} from "@/lib/scoring-scale";
import { participationLabel, selectionLabel } from "@/lib/concept-design/semantic-reads";

type Props = {
  token: string;
  label: string;
  role: ReviewerRole;
  blindReviewEnabled: boolean;
  needsScore: ReviewSubmissionItem[];
  needsRescore: ReviewSubmissionItem[];
  scored: ReviewSubmissionItem[];
};

export function ReviewPanel({
  token,
  label,
  role,
  blindReviewEnabled,
  needsScore,
  needsRescore,
  scored,
}: Props) {
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

  const total = needsScore.length + needsRescore.length + scored.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-minne-navy">Abstract review</h1>
      <p className="mt-1 text-gray-700">
        {label} · {roleDisplayName(role)} — each Evaluation is bound to the exact current
        Revision. A later Revision returns the talk to <strong>Needs rescore</strong> without
        overwriting the earlier Evaluation.
      </p>
      <p className="mt-2 text-sm">
        <Link href={`/chair/${token}`} className="text-minne-navy underline">
          Open program dashboard
        </Link>
        {isBoard(role)
          ? " to make Selection decisions and review Deliverables."
          : " to review committee results and Deliverables."}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        {needsScore.length} never evaluated · {needsRescore.length} need evaluation for the
        current Revision · {scored.length} current · {total} total
      </p>
      {blindReviewEnabled && (
        <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          Blind review is on. Presenter identity is an explicitly concealed information state;
          committee aggregates remain concealed until you have an Evaluation for this exact
          Revision. Reveal identity only when needed for conflict checking.
        </p>
      )}

      <ReviewSection
        blindReviewEnabled={blindReviewEnabled}
        title="Needs your evaluation"
        description="No Evaluation by you exists for this Proposal"
        items={needsScore}
        emptyMessage="Every active Proposal has an Evaluation by you."
        expanded={expanded}
        setExpanded={setExpanded}
        saving={saving}
        onSave={saveScore}
        showMyScore={false}
        token={token}
      />

      {needsRescore.length > 0 && (
        <ReviewSection
          blindReviewEnabled={blindReviewEnabled}
          title="Needs rescore"
          description="Your retained Evaluation is for a prior Revision or has legacy-unknown subject identity"
          items={needsRescore}
          emptyMessage=""
          expanded={expanded}
          setExpanded={setExpanded}
          saving={saving}
          onSave={saveScore}
          showMyScore
          rescoreMode
          token={token}
          className="mt-10 border-t border-gray-200 pt-8"
        />
      )}

      <ReviewSection
        title="Current evaluations"
        description="Your Evaluation subject matches the exact current Revision"
        items={scored}
        emptyMessage="No current Evaluations saved yet."
        expanded={expanded}
        setExpanded={setExpanded}
        saving={saving}
        onSave={saveScore}
        showMyScore
        token={token}
        blindReviewEnabled={blindReviewEnabled}
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
  rescoreMode = false,
  token,
  blindReviewEnabled,
  className = "mt-8",
}: {
  title: string;
  description: string;
  items: ReviewSubmissionItem[];
  emptyMessage: string;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  saving: string | null;
  onSave: (id: string, value: number, notes: string) => void;
  showMyScore: boolean;
  rescoreMode?: boolean;
  token: string;
  blindReviewEnabled: boolean;
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
              token={token}
              blindReviewEnabled={blindReviewEnabled}
              item={item}
              expanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              saving={saving === item.id}
              onSave={onSave}
              showMyScore={showMyScore}
              rescoreMode={rescoreMode}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function SemanticPill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
      {label}
    </span>
  );
}

function TalkReviewCard({
  token,
  blindReviewEnabled,
  item,
  expanded,
  onToggle,
  saving,
  onSave,
  showMyScore,
  rescoreMode = false,
}: {
  token: string;
  blindReviewEnabled: boolean;
  item: ReviewSubmissionItem;
  expanded: boolean;
  onToggle: () => void;
  saving: boolean;
  onSave: (id: string, value: number, notes: string) => void;
  showMyScore: boolean;
  rescoreMode?: boolean;
}) {
  const outdated =
    rescoreMode ||
    item.myEvaluationState === "revision-changed" ||
    item.myEvaluationState === "legacy-subject-unknown";
  const submitted = new Date(item.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <li
      className={`card ${
        outdated
          ? "border-l-4 border-l-orange-500"
          : showMyScore
            ? "border-l-4 border-l-green-600"
            : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-minne-navy">{item.title}</h3>
            <RevisionBadge version={item.semantic.revision.ordinal} />
            {item.isSponsorSession && <SponsorSessionBadge />}
            {outdated && <RescoreIndicator version={item.semantic.revision.ordinal} />}
          </div>
          {item.identityState.state === "concealed" ? (
            <BlindIdentityBlock token={token} submissionId={item.id} blindReviewEnabled />
          ) : (
            <p className="text-sm text-gray-600">
              {item.identityState.value.firstName} {item.identityState.value.lastName} ·{" "}
              {item.identityState.value.organization} · Technical: {item.technicalLevel} (
              {TECHNICAL_LABELS[item.technicalLevel]})
            </p>
          )}
          {item.identityState.state === "concealed" && (
            <p className="text-sm text-gray-600">
              Technical: {item.technicalLevel} ({TECHNICAL_LABELS[item.technicalLevel]})
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">Submitted {submitted}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {showMyScore && item.myScore && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                outdated
                  ? "bg-orange-100 text-orange-900"
                  : "bg-green-100 text-green-900"
              }`}
            >
              Your Evaluation: {formatScore(item.myScore.value)}
              {outdated ? " · prior/unknown Revision subject" : " · current Revision"}
            </span>
          )}
          <SemanticPill label={`Selection: ${selectionLabel(item.semantic.selection.disposition)}`} />
          <SemanticPill label={`Participation: ${participationLabel(item.semantic.participation)}`} />
        </div>
      </div>

      {item.aggregateState.state === "visible" ? (
        <p className="mt-2 text-sm text-gray-700">
          Current-Revision aggregate:{" "}
          <strong>avg {item.aggregateState.value.average.toFixed(2)}</strong> ({
            item.aggregateState.value.count
          } evaluator{item.aggregateState.value.count === 1 ? "" : "s"}, sum{" "}
          {item.aggregateState.value.sum.toFixed(1)})
        </p>
      ) : (
        <p className="mt-2 text-sm italic text-gray-600">
          Committee aggregate concealed until you record an Evaluation for this exact Revision.
        </p>
      )}

      <button type="button" className="mt-2 text-sm text-minne-navy underline" onClick={onToggle}>
        {expanded ? "Hide" : outdated ? "Rescore" : showMyScore ? "Edit" : "Score"} talk
      </button>
      {expanded && item.abstract && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.abstract}</p>
      )}
      {expanded && (
        <>
          <ScoreForm
            submissionId={item.id}
            initialValue={item.myScore?.value}
            initialNotes={item.myScore?.notes ?? ""}
            saving={saving}
            onSave={onSave}
          />
          <ReviewFeedbackForm
            token={token}
            submissionId={item.id}
            abstractVersion={item.semantic.revision.ordinal}
          />
          <SubmissionRevisionHistory
            token={token}
            submissionId={item.id}
            currentVersion={item.semantic.revision.ordinal}
          />
        </>
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
    (_, index) => roundScore(SCORE_MIN + index * SCORE_STEP)
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
        onChange={(event) => {
          setValue(roundScore(parseFloat(event.target.value)));
          setTouched(true);
        }}
        className="mt-2 w-full accent-minne-navy"
      />
      <div className="mt-1 flex justify-between text-[10px] text-gray-500">
        {steps.map((step) => (
          <span key={step}>{formatScore(step)}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            className={`rounded px-2 py-0.5 text-xs ${
              value === step
                ? "bg-minne-navy text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
            onClick={() => {
              setValue(step);
              setTouched(true);
            }}
          >
            {formatScore(step)}
          </button>
        ))}
      </div>
      <textarea
        className="form-input mt-3"
        rows={2}
        placeholder="Private notes for the committee only (optional)"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <button
        type="button"
        className="btn-primary mt-2"
        disabled={!touched || saving}
        onClick={() => onSave(submissionId, value, notes)}
      >
        {saving ? "Saving…" : "Save evaluation"}
      </button>
    </div>
  );
}
