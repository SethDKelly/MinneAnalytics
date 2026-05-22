"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeckStatusBadge, ProgramStatusBadge } from "./StatusBadge";
import { PROGRAM_STATUS_LABELS, DECK_STATUS_LABELS } from "@/lib/constants";
import { formatDegrees } from "@/lib/degrees";

type Props = {
  token: string;
  submission: {
    title: string;
    programStatus: string;
    deckStatus: string | null;
    degrees: string;
    conferenceName: string;
    deckFilename: string | null;
    deckVersion: number | null;
  };
};

export function PresenterPortal({ token, submission }: Props) {
  const router = useRouter();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canUpload = submission.programStatus === "APPROVED";
  const isWithdrawn = submission.programStatus === "WITHDRAWN";

  async function withdraw() {
    setLoading(true);
    const res = await fetch("/api/presenter/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setMessage("Withdraw failed");
    }
  }

  async function uploadDeck(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = new FormData(e.currentTarget);
    form.set("token", token);
    setLoading(true);
    const res = await fetch("/api/presenter/deck", { method: "POST", body: form });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      setMessage("Deck uploaded successfully.");
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Upload failed");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-minne-navy">Presenter portal</h1>
      <p className="mt-1 text-gray-700">{submission.conferenceName}</p>

      <div className="card mt-6 space-y-3">
        <h2 className="text-xl font-bold">{submission.title}</h2>
        <p className="text-sm text-gray-600">Degrees: {formatDegrees(submission.degrees)}</p>
        <div className="flex flex-wrap gap-3">
          <div>
            <span className="text-xs text-gray-500">Program status</span>
            <div className="mt-1">
              <ProgramStatusBadge status={submission.programStatus} />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Deck status</span>
            <div className="mt-1">
              <DeckStatusBadge status={submission.deckStatus} />
            </div>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm">{message}</p>
      )}

      {!isWithdrawn && (
        <section className="card mt-6">
          <h3 className="font-bold text-minne-navy">Withdraw talk</h3>
          <p className="mt-2 text-sm text-gray-700">
            You may withdraw at any time, including after approval. This removes your talk from
            active program consideration.
          </p>
          {!confirmWithdraw ? (
            <button
              type="button"
              className="btn-danger mt-4"
              onClick={() => setConfirmWithdraw(true)}
            >
              Withdraw submission
            </button>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-red-800">
                Confirm withdrawal?
                {submission.programStatus === "APPROVED" &&
                  " Your talk is currently approved."}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-danger"
                  disabled={loading}
                  onClick={withdraw}
                >
                  Yes, withdraw
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setConfirmWithdraw(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {isWithdrawn && (
        <p className="mt-6 text-sm text-gray-600">
          Status: {PROGRAM_STATUS_LABELS.WITHDRAWN}. Contact the program committee if you need
          assistance.
        </p>
      )}

      {canUpload && !isWithdrawn && (
        <section className="card mt-6">
          <h3 className="font-bold text-minne-navy">Slide deck</h3>
          <p className="mt-2 text-sm text-gray-700">
            After abstract approval, upload your presentation (PDF or PowerPoint). Deck workflow:{" "}
            {Object.values(DECK_STATUS_LABELS).join(" → ")}.
          </p>
          {submission.deckFilename && (
            <p className="mt-2 text-sm">
              Current file: <strong>{submission.deckFilename}</strong>
              {submission.deckVersion ? ` (v${submission.deckVersion})` : ""}
            </p>
          )}
          <form onSubmit={uploadDeck} className="mt-4">
            <input
              type="file"
              name="file"
              accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              required
              className="text-sm"
            />
            <button type="submit" className="btn-primary mt-3" disabled={loading}>
              {loading ? "Uploading…" : "Upload deck"}
            </button>
          </form>
        </section>
      )}

      {submission.programStatus === "PENDING" && (
        <p className="mt-6 text-sm text-gray-600">
          Your abstract is pending committee review. You will be able to upload a deck after
          core approval.
        </p>
      )}
    </div>
  );
}
