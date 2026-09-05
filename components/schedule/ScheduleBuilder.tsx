"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { TalkCard, getTalkDragData } from "./TalkCard";
import { VARIETY_COLORS, VARIETY_LABELS } from "@/lib/constants";
import type { ScheduleState } from "@/lib/schedule/types";
import type { ScheduleProposalAssignment } from "@/lib/concept-design/schedule-authority";
import {
  isFullWidthSlotType,
  kickoffLabelForRoom,
} from "@/lib/schedule/template";

type Props = {
  token: string;
  plannerLabel: string;
  initial: ScheduleState;
};

type PendingProposal = {
  baseFingerprint: string;
  assignments: ScheduleProposalAssignment[];
  unassigned: string[];
  capacity: number;
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
  const [proposal, setProposal] = useState<PendingProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/schedule?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const data = await res.json();
      setState((previous) => ({
        conferenceName: data.conferenceName ?? previous.conferenceName,
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
    if (!res.ok) {
      setProposal(null);
      setMessage(data.error ?? "Generate failed");
      return;
    }
    if (!data.proposal || data.requiresApply !== true) {
      setProposal(null);
      setMessage(
        "This server is still using legacy mutating generation. Enable canonical Schedule writes before semantic UI cutover."
      );
      await refresh();
      return;
    }
    setProposal(data.proposal as PendingProposal);
    setMessage(
      `Proposal ready: ${data.assigned} placements, ${data.unassigned} unassigned, ${data.capacity} session cells. The authoritative schedule has not changed.`
    );
  }

  async function applyProposal() {
    if (!proposal) return;
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/schedule/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        expectedBaseFingerprint: proposal.baseFingerprint,
        assignments: proposal.assignments,
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      if (data.code === "SCHEDULE_STALE_BASE") {
        setProposal(null);
        await refresh();
        setMessage(
          "The authoritative schedule changed after this proposal was generated. The proposal was discarded; generate a fresh one."
        );
        return;
      }
      setMessage(data.error ?? "Could not apply schedule proposal");
      return;
    }
    setProposal(null);
    await refresh();
    setMessage(`Applied ${data.applied} proposed placements atomically.`);
  }

  async function moveTalk(submissionId: string | null, placementId: string) {
    setProposal(null);
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
    return state.placements.find((placement) => placement.slotId === slotId && placement.roomId === roomId);
  }

  function handleDropOnPlacement(placementId: string, event: React.DragEvent) {
    event.preventDefault();
    setDragOverId(null);
    const talkId = getTalkDragData(event);
    if (talkId) moveTalk(talkId, placementId);
  }

  function handleDropOnPool(event: React.DragEvent) {
    event.preventDefault();
    setDragOverId(null);
    const talkId = getTalkDragData(event);
    if (!talkId) return;
    const from = state.placements.find((placement) => placement.submission?.id === talkId);
    if (from) moveTalk(null, from.id);
  }

  const sessionSlots = state.slots.filter((slot) => slot.slotType === "SESSION");
  const scheduledCount = state.placements.filter((placement) =>
    sessionSlots.some((slot) => slot.id === placement.slotId && placement.submission)
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
              className="btn-secondary"
              disabled={loading || state.approvedCount === 0}
              onClick={generate}
            >
              {loading ? "Working…" : proposal ? "Regenerate proposal" : "Generate proposal"}
            </button>
            {proposal && (
              <>
                <button type="button" className="btn-primary" disabled={loading} onClick={applyProposal}>
                  Accept proposal
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={loading}
                  onClick={() => {
                    setProposal(null);
                    setMessage("Generated proposal discarded; authoritative placements were unchanged.");
                  }}
                >
                  Discard
                </button>
              </>
            )}
          </div>
        </div>
        {proposal && (
          <div className="mx-auto mt-3 max-w-[1600px] rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
            <strong>Generated proposal — not yet authoritative.</strong>{" "}
            {proposal.assignments.length} proposed placements · {proposal.unassigned.length} unassigned.
            Manual drag/drop changes discard this proposal because its expected base is no longer current.
          </div>
        )}
        {message && (
          <p className="mx-auto mt-3 max-w-[1600px] text-sm text-minne-navy">{message}</p>
        )}
        <p className="mx-auto mt-2 max-w-[1600px] text-xs text-gray-600">
          {state.approvedCount} participating talks · {scheduledCount} scheduled ·{" "}
          {state.unscheduled.length} in pool · 30-minute sessions · drag talks into grid cells or
          back to the pool
        </p>
      </div>

      <div className="mx-auto flex max-w-[1600px] gap-4 p-4">
        <aside
          className="w-64 shrink-0"
          onDragOver={(event) => {
            event.preventDefault();
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
                <p className="text-xs text-gray-500 italic">All participating talks are placed.</p>
              ) : (
                state.unscheduled.map((talk) => <TalkCard key={talk.id} talk={talk} compact />)
              )}
            </div>
          </div>

          <div className="mt-4 rounded bg-white p-3 text-[10px] shadow-sm">
            <h3 className="mb-2 font-bold text-minne-navy">Variety legend</h3>
            {[1, 2, 3, 4, 5].map((level) => (
              <div key={level} className="mb-1 flex items-center gap-2">
                <span className={`inline-block h-3 w-8 rounded border ${VARIETY_COLORS[level]}`} />
                <span>
                  {level}: {VARIETY_LABELS[level]}
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
                    <tr key={slot.id} className={isRegistration ? "bg-slate-300" : "bg-gray-200"}>
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
                          <td key={room.id} className="border bg-slate-50 p-2 text-center align-middle">
                            {label ? (
                              <span className="text-sm font-bold text-minne-navy">{label}</span>
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
                            isOver
                              ? "bg-minne-navy/10 ring-2 ring-minne-navy ring-inset"
                              : "bg-white"
                          }`}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOverId(placement.id);
                          }}
                          onDragLeave={() => setDragOverId(null)}
                          onDrop={(event) => handleDropOnPlacement(placement.id, event)}
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
