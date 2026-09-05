"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SelectionDisposition } from "@prisma/client";
import type { DeliverableReadiness } from "@/lib/concept-design/semantic-reads";
import { PresenterFeedbackList } from "./PresenterFeedbackList";
import { PresenterSubmissionEditor } from "./PresenterSubmissionEditor";
import { formatDegrees } from "@/lib/degrees";
import type { ThemePickOption } from "./ThemeMultiSelect";

type Props = {
  token: string;
  conferenceSlug: string;
  submission: {
    title: string;
    currentRevisionRef: string | null;
    revisionOrdinal: number;
    selection: { disposition: SelectionDisposition | null; label: string };
    participation: { effective: boolean; withdrawn: boolean; label: string };
    deliverable: {
      readiness: DeliverableReadiness;
      label: string;
      artifactRef: string | null;
      filename: string | null;
      version: number | null;
    };
    degrees: string;
    conferenceName: string;
    canEdit: boolean;
    editReasonCode: string;
    editReason: string;
    canUploadDeck: boolean;
    abstract: string;
    bio: string;
    technicalLevel: number;
    themeIds: string[];
  };
  themes: ThemePickOption[];
  submissionId: string;
  feedback: {
    id: string;
    kind: "ABSTRACT" | "GENERAL";
    body: string;
    reviewerLabel: string;
    subjectRevisionRef: string | null;
    subjectRevisionVersion: number | null;
    createdAt: string;
  }[];
};

function stateClass(value: string) {
  if (value === "Selected" || value === "Participating" || value === "Ready") {
    return "bg-green-100 text-green-900";
  }
  if (value === "Withdrawn" || value === "Not selected" || value === "Changes requested") {
    return "bg-red-100 text-red-900";
  }
  return "bg-gray-100 text-gray-800";
}

export function PresenterPortal({
  token,
  conferenceSlug,
  submission,
  themes,
  submissionId,
  feedback,
}: Props) {
  const router = useRouter();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isWithdrawn = submission.participation.withdrawn;

  async function withdraw() {
    setLoading(true);
    const res = await fetch("/api/presenter/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error ?? "Withdraw failed");
    }
  }

  async function uploadDeck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = new FormData(event.currentTarget);
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
        <p className="text-xs text-gray-500">
          Revision v{submission.revisionOrdinal}
          {submission.currentRevisionRef ? ` · ${submission.currentRevisionRef}` : ""}
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div>
            <span className="text-gray-500">Selection</span>
            <div className={`mt-1 rounded px-2 py-1 font-semibold ${stateClass(submission.selection.label)}`}>
              {submission.selection.label}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Participation</span>
            <div className={`mt-1 rounded px-2 py-1 font-semibold ${stateClass(submission.participation.label)}`}>
              {submission.participation.label}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Deck</span>
            <div className={`mt-1 rounded px-2 py-1 font-semibold ${stateClass(submission.deliverable.label)}`}>
              {submission.deliverable.label}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm">{message}</p>
      )}

      {feedback.length > 0 && !isWithdrawn && (
        <PresenterFeedbackList
          feedback={feedback.map((row) => ({
            id: row.id,
            kind: row.kind,
            body: row.body,
            reviewerLabel: row.reviewerLabel,
            abstractVersion: row.subjectRevisionVersion,
            createdAt: row.createdAt,
          }))}
        />
      )}

      {submission.canEdit && !isWithdrawn && (
        <PresenterSubmissionEditor
          token={token}
          conferenceSlug={conferenceSlug}
          submissionId={submissionId}
          themes={themes}
          initial={{
            title: submission.title,
            abstract: submission.abstract,
            bio: submission.bio,
            technicalLevel: submission.technicalLevel,
            themeIds: submission.themeIds,
            abstractVersion: submission.revisionOrdinal,
          }}
        />
      )}

      {!submission.canEdit && !isWithdrawn && submission.editReason && (
        <p className="mt-6 rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Abstract editing is unavailable: {submission.editReason}
          <span className="ml-1 text-xs text-gray-500">({submission.editReasonCode})</span>
        </p>
      )}

      {!isWithdrawn && (
        <section className="card mt-6">
          <h3 className="font-bold text-minne-navy">Withdraw talk</h3>
          <p className="mt-2 text-sm text-gray-700">
            Withdrawal is independent from the committee&apos;s Selection decision. It ends your
            current participation without erasing that decision history.
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
                {submission.selection.disposition === "SELECTED" &&
                  " Your talk is currently selected."}
              </p>
              <div className="flex gap-2">
                <button type="button" className="btn-danger" disabled={loading} onClick={withdraw}>
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
          Participation: Withdrawn. Contact the program committee if you need assistance.
        </p>
      )}

      {submission.canUploadDeck && !isWithdrawn && (
        <section className="card mt-6">
          <h3 className="font-bold text-minne-navy">Slide deck</h3>
          <p className="mt-2 text-sm text-gray-700">
            Uploading a replacement creates a new ArtifactVersion. Review readiness applies to the
            exact current file and does not carry forward automatically.
          </p>
          {submission.deliverable.filename && (
            <p className="mt-2 text-sm">
              Current file: <strong>{submission.deliverable.filename}</strong>
              {submission.deliverable.version ? ` (v${submission.deliverable.version})` : ""}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Current deck state: {submission.deliverable.label}
          </p>
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

      {submission.selection.disposition === null && submission.canEdit && !isWithdrawn && (
        <p className="mt-6 text-sm text-gray-600">
          No committee Selection decision has been recorded yet. You may update the current
          Revision while the application edit policy allows it.
        </p>
      )}
    </div>
  );
}
