"use client";

import { useState } from "react";

type Props = {
  token: string;
  submissionId: string;
  abstractVersion: number;
  disabled?: boolean;
  onSent?: () => void;
};

export function ReviewFeedbackForm({
  token,
  submissionId,
  abstractVersion,
  disabled,
  onSent,
}: Props) {
  const [kind, setKind] = useState<"ABSTRACT" | "GENERAL">("ABSTRACT");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Enter feedback for the presenter.");
      return;
    }
    setError(null);
    setSaving(true);
    const res = await fetch("/api/review/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, kind, body: trimmed }),
    });
    setSaving(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not send feedback");
      return;
    }
    setSuccess(true);
    setBody("");
    onSent?.();
  }

  return (
    <div className="mt-4 rounded border border-amber-200 bg-amber-50/50 p-4">
      <h4 className="text-sm font-bold text-minne-navy">Feedback to presenter</h4>
      <p className="mt-1 text-xs text-gray-600">
        Visible on the presenter portal (not the same as private committee score notes).
        {kind === "ABSTRACT" && ` Tagged for abstract version v${abstractVersion}.`}
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name={`feedback-kind-${submissionId}`}
            checked={kind === "ABSTRACT"}
            disabled={disabled || saving}
            onChange={() => setKind("ABSTRACT")}
          />
          Abstract changes
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name={`feedback-kind-${submissionId}`}
            checked={kind === "GENERAL"}
            disabled={disabled || saving}
            onChange={() => setKind("GENERAL")}
          />
          General feedback
        </label>
      </div>
      <textarea
        className="form-input mt-2"
        rows={3}
        placeholder="Suggestions for improving the abstract or other comments for the speaker…"
        value={body}
        disabled={disabled || saving}
        onChange={(e) => {
          setBody(e.target.value);
          setSuccess(false);
        }}
      />
      {error && <p className="mt-2 text-xs text-red-800">{error}</p>}
      {success && (
        <p className="mt-2 text-xs text-green-800">Feedback sent to presenter.</p>
      )}
      <button
        type="button"
        className="btn-secondary mt-2"
        disabled={disabled || saving}
        onClick={send}
      >
        {saving ? "Sending…" : "Send feedback to presenter"}
      </button>
    </div>
  );
}
