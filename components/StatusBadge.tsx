import {
  ABSTRACT_REVIEW_STATUS_LABELS,
  DECK_STATUS_LABELS,
  PROGRAM_STATUS_LABELS,
} from "@/lib/constants";

const programColors: Record<string, string> = {
  PENDING: "bg-gray-200 text-gray-800",
  APPROVED: "bg-green-100 text-green-900",
  DECLINED: "bg-red-100 text-red-900",
  BACKUP: "bg-amber-100 text-amber-900",
  WITHDRAWN: "bg-slate-200 text-slate-700",
};

const deckColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-900",
  REVIEWED: "bg-indigo-100 text-indigo-900",
  APPROVED: "bg-green-100 text-green-900",
  CONCERN: "bg-orange-100 text-orange-900",
};

export function ProgramStatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge ${programColors[status] ?? "bg-gray-100"}`}>
      {PROGRAM_STATUS_LABELS[status] ?? status}
    </span>
  );
}

const abstractReviewColors: Record<string, string> = {
  CURRENT: "bg-gray-100 text-gray-800",
  FEEDBACK_PENDING: "bg-amber-100 text-amber-900",
  REVISED: "bg-blue-100 text-blue-900",
  ACKNOWLEDGED: "bg-indigo-100 text-indigo-900",
};

export function AbstractReviewStatusBadge({ status }: { status: string }) {
  if (status === "CURRENT") return null;
  return (
    <span
      className={`status-badge ${abstractReviewColors[status] ?? "bg-gray-100"}`}
    >
      {ABSTRACT_REVIEW_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function DeckStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-gray-500">No deck</span>;
  return (
    <span className={`status-badge ${deckColors[status] ?? "bg-gray-100"}`}>
      {DECK_STATUS_LABELS[status] ?? status}
    </span>
  );
}
