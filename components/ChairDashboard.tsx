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

type SubmissionDetail = SubmissionListItem & {
  abstract: string;
  email: string;
};

type Props = {
  token: string;
  role: ReviewerRole;
  label: string;
  items: SubmissionDetail[];
  capacity: CapacitySnapshot;
  allScores: Record<string, { reviewer: string; value: number; notes: string | null }[]>;
};

export function ChairDashboard({
  token,
  role,
  label,
  items: initialItems,
  capacity: initialCapacity,
  allScores,
}: Props) {
  const router = useRouter();
  const items = initialItems;
  const capacity = initialCapacity;
  const [loading, setLoading] = useState<string | null>(null);
  const isCore = role === "CORE";

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
      <h1 className="text-3xl font-bold text-minne-navy">Program chair dashboard</h1>
      <p className="mt-1 text-gray-700">
        {label} ({role}) — submissions sorted by aggregate score
      </p>
      <Link href={`/schedule/${token}`} className="btn-primary mt-4 inline-block">
        Open schedule builder
      </Link>

      <div className="mt-6">
        <CapacityWidget cap={capacity} />
      </div>

      {isCore && (
        <p className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          You have <strong>core approver</strong> access: use Approve on Pending talks or Promote
          on Backup talks.
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
                  {item.firstName} {item.lastName} · {item.organization} ·{" "}
                  {item.email}
                </p>
                <p className="mt-1 text-sm">
                  Technical {item.technicalLevel}: {TECHNICAL_LABELS[item.technicalLevel]}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <ProgramStatusBadge status={item.programStatus} />
                <DeckStatusBadge status={item.deckStatus} />
                <span className="text-sm font-semibold text-minne-navy">
                  Score: avg {agg.average.toFixed(2)} ({agg.count} scorer
                  {agg.count === 1 ? "" : "s"}, sum {agg.sum.toFixed(1)})
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-800 line-clamp-3">{item.abstract}</p>

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
              {item.programStatus === "PENDING" && (
                <>
                  {isCore && (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!!loading}
                      onClick={() => setStatus(item.id, "APPROVED")}
                    >
                      Approve (core)
                    </button>
                  )}
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
              {item.programStatus === "BACKUP" && isCore && (
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!!loading}
                  onClick={() => setStatus(item.id, "APPROVED")}
                >
                  Promote to approved
                </button>
              )}
              {item.programStatus === "APPROVED" && item.deckStatus && (
                <>
                  <span className="text-sm text-gray-600 self-center">Deck:</span>
                  {(["REVIEWED", "APPROVED", "CONCERN"] as const).map((ds) => (
                    <button
                      key={ds}
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={!!loading}
                      onClick={() => setDeckStatus(item.id, ds)}
                    >
                      {ds}
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
