"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeMultiSelect } from "./ThemeMultiSelect";
import { TECHNICAL_LABELS } from "@/lib/constants";

type ThemeOption = { id: string; name: string };

type Props = {
  token: string;
  initial: {
    title: string;
    abstract: string;
    bio: string;
    technicalLevel: number;
    themeIds: string[];
    abstractVersion: number;
  };
  themes: ThemeOption[];
};

export function PresenterSubmissionEditor({ token, initial, themes }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [abstract, setAbstract] = useState(initial.abstract);
  const [bio, setBio] = useState(initial.bio);
  const [technicalLevel, setTechnicalLevel] = useState(initial.technicalLevel);
  const [themeIds, setThemeIds] = useState(initial.themeIds);
  const [changeNote, setChangeNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (themeIds.length === 0) {
      setError("Select at least one theme.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/presenter/submission", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        title,
        abstract,
        bio,
        technicalLevel,
        themeIds,
        changeNote: changeNote.trim() || undefined,
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setSuccess(
      `Revision saved (version ${data.abstractVersion}). The committee will review your updated submission.`
    );
    setChangeNote("");
    router.refresh();
  }

  return (
    <section className="card mt-6">
      <h3 className="font-bold text-minne-navy">Edit submission</h3>
      <p className="mt-2 text-sm text-gray-700">
        Update your title, abstract, bio, technical level, or themes. Current version:{" "}
        <strong>v{initial.abstractVersion}</strong>.
      </p>
      <form onSubmit={save} className="mt-4 space-y-4">
        <div>
          <label className="form-label" htmlFor="edit-title">
            Presentation title
          </label>
          <input
            id="edit-title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="edit-abstract">
            Abstract
          </label>
          <textarea
            id="edit-abstract"
            className="form-input"
            rows={6}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            required
            minLength={50}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="edit-bio">
            Short professional bio
          </label>
          <textarea
            id="edit-bio"
            className="form-input"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            minLength={20}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="edit-technical">
            Technical content level
          </label>
          <select
            id="edit-technical"
            className="form-input"
            value={technicalLevel}
            onChange={(e) => setTechnicalLevel(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}: {TECHNICAL_LABELS[n]}
              </option>
            ))}
          </select>
        </div>
        {themes.length > 0 && (
          <ThemeMultiSelect themes={themes} selected={themeIds} onChange={setThemeIds} />
        )}
        <div>
          <label className="form-label" htmlFor="edit-note">
            Summary of changes (optional)
          </label>
          <textarea
            id="edit-note"
            className="form-input"
            rows={2}
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder="e.g. Clarified methodology and outcomes"
          />
        </div>
        {error && (
          <p className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-900">
            {success}
          </p>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save revision"}
        </button>
      </form>
    </section>
  );
}
