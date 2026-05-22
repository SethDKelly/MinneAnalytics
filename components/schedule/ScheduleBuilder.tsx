"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { TalkCard, getTalkDragData } from "./TalkCard";
import { VARIETY_COLORS, VARIETY_LABELS } from "@/lib/constants";
import type { ScheduleState } from "@/lib/schedule/types";
import {
  isFullWidthSlotType,
  kickoffLabelForRoom,
} from "@/lib/schedule/template";

type Props = {
  token: string;
  plannerLabel: string;
  initial: ScheduleState;
};

export function ScheduleBuilder({ token, plannerLabel, initial }: Props) {
  const [state, setState] = useState<ScheduleState>({
    ...initial,
    approvedCount: initial.approvedCount ?? 0,
    rooms: initial.rooms ?? [],
    slots: initial.slots ?? [],
    placements: initial.placements ?? [],
    unscheduled: initial.unscheduled ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/schedule?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const data = await res.json();
      setState((prev) => ({
        conferenceName: data.conferenceName ?? prev.conferenceName,
        rooms: data.rooms ?? [],
        slots: data.slots ?? [],
        placements: data.placements ?? [],
        unscheduled: data.unscheduled ?? [],
        approvedCount: data.approvedCount ?? 0,
      }));
    }
  }, [token]);

  async function generate() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/schedule/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setMessage(
        `Generated ${data.assigned} placements (${data.unassigned} talks unassigned — ${data.capacity} session slots available).`
      );
      await refresh();
    } else {
      setMessage(data.error ?? "Generate failed");
    }
  }

  async function moveTalk(submissionId: string | null, placementId: string) {
    const res = await fetch("/api/schedule/placement", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, placementId, submissionId }),
    });
    if (res.ok) await refresh();
    else {
      const data = await res.json();
      setMessage(data.error ?? "Could not update schedule");
    }
  }

  function placementAt(slotId: string, roomId: string) {
    return state.placements.find((p) => p.slotId === slotId && p.roomId === roomId);
  }

  function handleDropOnPlacement(placementId: string, e: React.DragEvent) {
    e.preventDefault();
    setDragOverId(null);
    const talkId = getTalkDragData(e);
    if (talkId) moveTalk(talkId, placementId);
  }

  function handleDropOnPool(e: React.DragEvent) {
    e.preventDefault();
    setDragOverId(null);
    const talkId = getTalkDragData(e);
    if (!talkId) return;
    const from = state.placements.find((p) => p.submission?.id === talkId);
    if (from) moveTalk(null, from.id);
  }

  const sessionSlots = state.slots.filter((s) => s.slotType === "SESSION");
  const scheduledCount = state.placements.filter((p) =>
    sessionSlots.some((s) => s.id === p.slotId && p.submission)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-minne-navy/20 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-minne-navy">Schedule builder</h1>
            <p className="text-sm text-gray-600">
              {state.conferenceName} · {plannerLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/chair/${token}`} className="btn-secondary text-sm">
              ← Chair dashboard
            </Link>
            <button
              type="button"
              className="btn-primary"
              disabled={loading || state.approvedCount === 0}
              onClick={generate}
            >
              {loading ? "Generating…" : "Generate schedule"}
            </button>
          </div>
        </div>
        {message && (
          <p className="mx-auto mt-3 max-w-[1600px] text-sm text-minne-navy">{message}</p>
        )}
        <p className="mx-auto mt-2 max-w-[1600px] text-xs text-gray-600">
          {state.approvedCount} approved talks · {scheduledCount} scheduled ·{" "}
          {state.unscheduled.length} in pool · 30-minute sessions · drag talks into grid cells or
          back to the pool
        </p>
      </div>

      <div className="mx-auto flex max-w-[1600px] gap-4 p-4">
        <aside
          className="w-64 shrink-0"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverId("pool");
          }}
          onDragLeave={() => setDragOverId(null)}
          onDrop={handleDropOnPool}
        >
          <div
            className={`sticky top-4 rounded-lg border-2 border-dashed p-3 ${
              dragOverId === "pool"
                ? "border-minne-navy bg-minne-navy/5"
                : "border-gray-300 bg-white"
            }`}
          >
            <h2 className="text-sm font-bold text-minne-navy">Unscheduled talks</h2>
            <p className="mb-3 text-[10px] text-gray-600">
              Drag onto the grid, or drop here to remove from schedule.
            </p>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto">
              {state.unscheduled.length === 0 ? (
                <p className="text-xs text-gray-500 italic">All approved talks are placed.</p>
              ) : (
                state.unscheduled.map((talk) => (
                  <TalkCard key={talk.id} talk={talk} compact />
                ))
              )}
            </div>
          </div>

          <div className="mt-4 rounded bg-white p-3 text-[10px] shadow-sm">
            <h3 className="mb-2 font-bold text-minne-navy">Variety legend</h3>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="mb-1 flex items-center gap-2">
                <span
                  className={`inline-block h-3 w-8 rounded border ${VARIETY_COLORS[n]}`}
                />
                <span>
                  {n}: {VARIETY_LABELS[n]}
                </span>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-28 border bg-minne-navy p-2 text-left text-white">
                  Time
                </th>
                {state.rooms.map((room) => (
                  <th
                    key={room.id}
                    className="min-w-[130px] border border-minne-navy/30 bg-minne-navy p-2 text-center font-semibold text-white"
                  >
                    {room.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.slots.map((slot) => {
                if (isFullWidthSlotType(slot.slotType)) {
                  const isRegistration = slot.slotType === "REGISTRATION";
                  return (
                    <tr
                      key={slot.id}
                      className={isRegistration ? "bg-slate-300" : "bg-gray-200"}
                    >
                      <td
                        colSpan={state.rooms.length + 1}
                        className={`border px-3 py-2 text-center font-bold uppercase tracking-wide ${
                          isRegistration ? "text-minne-navy text-sm" : "text-gray-700"
                        }`}
                      >
                        {slot.label}
                      </td>
                    </tr>
                  );
                }

                if (slot.slotType === "KICKOFF") {
                  return (
                    <tr key={slot.id} className="bg-slate-100">
                      <td className="sticky left-0 z-10 border bg-amber-100 p-2 align-middle font-bold text-minne-navy">
                        {slot.label}
                      </td>
                      {state.rooms.map((room) => {
                        const label = kickoffLabelForRoom(room.name);
                        return (
                          <td
                            key={room.id}
                            className="border bg-slate-50 p-2 text-center align-middle"
                          >
                            {label ? (
                              <span className="text-sm font-bold text-minne-navy">
                                {label}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }

                return (
                  <tr key={slot.id}>
                    <td className="sticky left-0 z-10 border bg-amber-100 p-2 align-top font-bold text-minne-navy">
                      {slot.label}
                    </td>
                    {state.rooms.map((room) => {
                      const placement = placementAt(slot.id, room.id);
                      if (!placement) return <td key={room.id} className="border bg-gray-50" />;
                      const isOver = dragOverId === placement.id;
                      return (
                        <td
                          key={room.id}
                          className={`border align-top p-1 transition-colors ${
                            isOver ? "bg-minne-navy/10 ring-2 ring-minne-navy ring-inset" : "bg-white"
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverId(placement.id);
                          }}
                          onDragLeave={() => setDragOverId(null)}
                          onDrop={(e) => handleDropOnPlacement(placement.id, e)}
                        >
                          {placement.submission ? (
                            <TalkCard talk={placement.submission} compact />
                          ) : (
                            <div className="flex min-h-[88px] items-center justify-center rounded border border-dashed border-gray-200 text-[10px] text-gray-400">
                              Drop talk
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
