"use client";

import { VARIETY_COLORS, VARIETY_LABELS } from "@/lib/constants";
import type { ScheduleTalk } from "@/lib/schedule/types";

const DRAG_TYPE = "application/x-minne-talk";

export function talkDragId(id: string) {
  return id;
}

export function setTalkDragData(e: React.DragEvent, talkId: string) {
  e.dataTransfer.setData(DRAG_TYPE, talkId);
  e.dataTransfer.setData("text/plain", talkId);
  e.dataTransfer.effectAllowed = "move";
}

export function getTalkDragData(e: React.DragEvent): string | null {
  return e.dataTransfer.getData(DRAG_TYPE) || e.dataTransfer.getData("text/plain") || null;
}

type Props = {
  talk: ScheduleTalk;
  compact?: boolean;
  draggable?: boolean;
};

export function TalkCard({ talk, compact, draggable = true }: Props) {
  const color = VARIETY_COLORS[talk.technicalLevel] ?? "bg-gray-100 border-gray-300";
  const degrees = talk.degrees.length ? talk.degrees.join(", ") : "—";

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => draggable && setTalkDragData(e, talk.id)}
      className={`rounded border p-2 text-left shadow-sm ${color} ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${compact ? "text-[10px] leading-tight" : "text-xs"}`}
    >
      <div className={compact ? "font-semibold" : "font-bold text-minne-navy"}>
        {talk.firstName} {talk.lastName}
        {degrees !== "—" && (
          <span className="font-normal text-gray-700"> · {degrees}</span>
        )}
      </div>
      <div className="text-gray-800">{talk.jobTitle}</div>
      <div className="text-gray-600">{talk.organization}</div>
      <div
        className={`my-1 text-center font-black text-minne-navy ${
          compact ? "text-lg" : "text-2xl"
        }`}
      >
        {talk.technicalLevel}
      </div>
      <div className={`font-semibold text-minne-navy ${compact ? "line-clamp-2" : ""}`}>
        {talk.title}
      </div>
      {!compact && (
        <div className="mt-1 text-[10px] text-gray-600">
          {VARIETY_LABELS[talk.technicalLevel]}
          {talk.isSoftSkill ? " · Soft skill" : ""}
        </div>
      )}
    </div>
  );
}
