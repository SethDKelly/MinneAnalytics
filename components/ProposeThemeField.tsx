"use client";

import { useState } from "react";
import type { ThemeSource } from "@prisma/client";

export type ThemePickOption = {
  id: string;
  name: string;
  source: ThemeSource;
};

type Props = {
  conferenceSlug: string;
  selected: string[];
  onChange: (ids: string[]) => void;
  onThemeAdded: (theme: ThemePickOption) => void;
  max?: number;
  proposedBySubmissionId?: string;
};

export function ProposeThemeField({
  conferenceSlug,
  selected,
  onChange,
  onThemeAdded,
  max = 3,
  proposedBySubmissionId,
}: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function propose() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (selected.length >= max) {
      setError(`You can only select up to ${max} themes. Deselect one to add a new proposal.`);
      return;
    }
    setError(null);
    setLoading(true);
    const res = await fetch("/api/themes/propose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conferenceSlug,
        name: trimmed,
        proposedBySubmissionId,
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not add theme");
      return;
    }
    const theme = data.theme as ThemePickOption;
    onThemeAdded(theme);
    if (!selected.includes(theme.id)) {
      onChange([...selected, theme.id]);
    }
    setName("");
  }

  return (
    <div className="mt-3 rounded border border-dashed border-gray-300 bg-gray-50 p-3">
      <p className="text-sm font-medium text-minne-navy">Propose a new theme</p>
      <p className="mt-1 text-xs text-gray-600">
        Other speakers can use community themes you suggest. One new name per save.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="text"
          className="form-input min-w-[12rem] flex-1"
          placeholder="e.g. MLOps in production"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          className="btn-secondary"
          disabled={loading || !name.trim()}
          onClick={propose}
        >
          {loading ? "Adding…" : "Add theme"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-800">{error}</p>}
    </div>
  );
}
