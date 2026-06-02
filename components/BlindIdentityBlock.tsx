"use client";

import { useState } from "react";
import type { PresenterIdentity } from "@/lib/review-blind";

type Props = {
  token: string;
  submissionId: string;
  blindReviewEnabled: boolean;
};

export function BlindIdentityBlock({
  token,
  submissionId,
  blindReviewEnabled,
}: Props) {
  const [identity, setIdentity] = useState<PresenterIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!blindReviewEnabled) return null;

  async function reveal() {
    setError(null);
    setLoading(true);
    const res = await fetch(
      `/api/review/submissions/${submissionId}/identity?token=${encodeURIComponent(token)}`
    );
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not load identity");
      return;
    }
    setIdentity(data.identity);
  }

  function hide() {
    setIdentity(null);
  }

  if (identity) {
    return (
      <p className="text-sm text-gray-600">
        {identity.firstName} {identity.lastName} · {identity.organization} ·{" "}
        {identity.email}{" "}
        <button type="button" className="text-minne-navy underline" onClick={hide}>
          Hide identity
        </button>
      </p>
    );
  }

  return (
    <div className="text-sm text-gray-600">
      <span className="italic">Presenter identity hidden to reduce bias.</span>{" "}
      <button
        type="button"
        className="text-minne-navy underline"
        disabled={loading}
        onClick={reveal}
      >
        {loading ? "Loading…" : "Reveal identity"}
      </button>
      {error && <span className="ml-2 text-red-800">{error}</span>}
    </div>
  );
}
