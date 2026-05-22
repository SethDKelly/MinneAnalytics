"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CapacityWidget } from "./CapacityWidget";
import { DeckStatusBadge, ProgramStatusBadge } from "./StatusBadge";
import type { CapacitySnapshot } from "@/lib/capacity";
import type { SubmissionListItem } from "@/lib/submissions";
import { EMPTY_AGGREGATE } from "@/lib/scoring";
import { formatScore } from "@/lib/scoring-scale";
import { TECHNICAL_LABELS } from "@/lib/constants";
import type { ReviewerRole } from "@prisma/client";
import { isBoard, roleDisplayName } from "@/lib/roles";

type SubmissionDetail = SubmissionListItem & {
  abstract: string;
  email: string;
};

type Props = {
  token: string;
  role: ReviewerRole;
  label: string;
  dashboardTitle: string;
  items: SubmissionDetail[];
  capacity: CapacitySnapshot;
  allScores: Record<string, { reviewer: string; value: number; notes: string | null }[]>;
};

export function ChairDashboard({
  token,
  role,
  label,
  dashboardTitle,
  items: initialItems,
  capacity: initialCapacity,
  allScores,
}: Props) {
  const router = useRouter();
  const items = initialItems;
  const capacity = initialCapacity;
  const [loading, setLoading] = useState<string | null>(null);
  const board = isBoard(role);

  async function setStatus(submissionId: string, status: string) {
    setLoading(submissionId + status);
    const res = await fetch("/api/chair/program-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, status }),
    });
    setLoading(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "Action failed");
    }
  }

  async function setDeckStatus(submissionId: string, deckStatus: string) {
    setLoading(submissionId + deckStatus);
    const res = await fetch("/api/chair/deck-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, submissionId, deckStatus }),
    });
    setLoading(null);
    if (res.ok) router.refresh();
    else {
      const data = await res.json();
      alert(data.error ?? "Deck update failed");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-minne-navy">{dashboardTitle}</h1>
      <p className="mt-1 text-gray-700">
        {label} · {roleDisplayName(role)} — submissions sorted by committee average
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/review/${token}`} className="btn-secondary">
          Score abstracts
        </Link>
        {board && (
          <Link href={`/schedule/${token}`} className="btn-primary text-white no-underline">
            Schedule builder
          </Link>
        )}
      </div>

      <div className="mt-6">
        <CapacityWidget cap={capacity} />
      </div>

      {board ? (
        <p className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          As a <strong>board member</strong>, you may approve talks, mark backups or declines,
          and update deck status for approved sessions.
        </p>
      ) : (
        <p className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          As a <strong>conference co-chair</strong>, you may score abstracts and review slide
          decks. Program approval is reserved for the MinneAnalytics board (Dan Atkins, Sean
          Larson, Graeme Thickins, John Hogue).
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {items.map((item) => {
          const agg = item.aggregate ?? EMPTY_AGGREGATE;
          return (
            <li key={item.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-minne-navy">{item.title}</h2>
                  <p className="text-sm text-gray-600">
                    {item.firstName} {item.lastName} · {item.organization} · {item.email}
                  </p>
                  <p className="mt-1 text-sm">
                    Technical {item.technicalLevel}:{" "}
                    {TECHNICAL_LABELS[item.technicalLevel]}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ProgramStatusBadge status={item.programStatus} />
                  <DeckStatusBadge status={item.deckStatus} />
                  <span className="text-sm font-semibold text-minne-navy">
                    Score: avg {agg.average.toFixed(2)} ({agg.count} reviewer
                    {agg.count === 1 ? "" : "s"}, sum {agg.sum.toFixed(1)})
                  </span>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-sm text-gray-800">{item.abstract}</p>

              {allScores[item.id]?.length > 0 && (
                <ul className="mt-3 space-y-1 rounded bg-gray-50 p-3 text-xs">
                  {allScores[item.id].map((s, i) => (
                    <li key={i}>
                      <strong>{s.reviewer}:</strong> {formatScore(s.value)}
                      {s.notes ? ` — ${s.notes}` : ""}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {board && item.programStatus === "PENDING" && (
                  <>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!!loading}
                      onClick={() => setStatus(item.id, "APPROVED")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={!!loading}
                      onClick={() => setStatus(item.id, "BACKUP")}
                    >
                      Mark backup
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={!!loading}
                      onClick={() => setStatus(item.id, "DECLINED")}
                    >
                      Decline
                    </button>
                  </>
                )}
                {board && item.programStatus === "BACKUP" && (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!!loading}
                    onClick={() => setStatus(item.id, "APPROVED")}
                  >
                    Promote to approved
                  </button>
                )}
                {item.programStatus === "APPROVED" && (
                  <>
                    <span className="self-center text-sm font-semibold text-gray-600">
                      Slide deck:
                    </span>
                    {!item.deckStatus && (
                      <span className="self-center text-xs text-gray-500 italic">
                        Awaiting upload or not yet submitted
                      </span>
                    )}
                    {(["REVIEWED", "APPROVED", "CONCERN"] as const).map((ds) => (
                      <button
                        key={ds}
                        type="button"
                        className="btn-secondary text-xs"
                        disabled={!!loading || item.deckStatus == null}
                        title={
                          item.deckStatus == null
                            ? "Available after presenter uploads a deck"
                            : undefined
                        }
                        onClick={() => setDeckStatus(item.id, ds)}
                      >
                        Mark deck {ds.toLowerCase()}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
