"use client";

import { useState } from "react";
import type { RevisionDiff, RevisionRow } from "@/lib/revision-history";
import { REVISION_FIELD_LABELS } from "@/lib/revision-history";

type Props = {
  token: string;
  submissionId: string;
  currentVersion: number;
};

type Payload = {
  revisions: RevisionRow[];
  diffs: RevisionDiff[];
  currentVersion: number;
  abstractReviewStatus: string;
};

export function SubmissionRevisionHistory({
  token,
  submissionId,
  currentVersion,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Payload | null>(null);

  async function load() {
    if (data) {
      setOpen((v) => !v);
      return;
    }
    setError(null);
    setLoading(true);
    const res = await fetch(
      `/api/review/submissions/${submissionId}/revisions?token=${encodeURIComponent(token)}`
    );
    setLoading(false);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not load revision history");
      return;
    }
    setData(json);
    setOpen(true);
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        type="button"
        className="text-sm text-minne-navy underline"
        disabled={loading}
        onClick={load}
      >
        {loading
          ? "Loading history…"
          : open
            ? "Hide revision history"
            : `View revision history (v${currentVersion})`}
      </button>
      {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      {open && data && (
        <div className="mt-3 space-y-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm">
          {data.revisions.length === 0 ? (
            <p className="italic text-gray-600">No revision snapshots stored yet.</p>
          ) : (
            <ol className="space-y-3">
              {[...data.revisions].reverse().map((rev) => (
                <li key={rev.version} className="rounded bg-white p-3 shadow-sm">
                  <p className="font-semibold text-minne-navy">
                    Version {rev.version}
                    {rev.version === data.currentVersion && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        (current)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(rev.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {rev.changedFields.length > 0 && rev.version > 1 && (
                    <p className="mt-1 text-xs text-gray-700">
                      Changed:{" "}
                      {rev.changedFields
                        .map((f) => REVISION_FIELD_LABELS[f] ?? f)
                        .join(", ")}
                    </p>
                  )}
                  {rev.changeNote && (
                    <p className="mt-1 text-xs italic text-gray-600">
                      Presenter note: {rev.changeNote}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-gray-800">
                    {rev.abstract}
                  </p>
                </li>
              ))}
            </ol>
          )}
          {data.diffs.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Field changes
              </p>
              <ul className="space-y-2">
                {data.diffs.map((d, i) => (
                  <li key={`${d.field}-${i}`} className="rounded bg-white p-2 text-xs">
                    <strong>{d.label}</strong>
                    <p className="mt-1 text-gray-600 line-through">{truncate(d.before)}</p>
                    <p className="mt-0.5 text-gray-900">{truncate(d.after)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function truncate(text: string, max = 280): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}
