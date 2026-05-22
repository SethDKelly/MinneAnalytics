import type { SlotType } from "@prisma/client";

/** Bump when DEFAULT_SLOT_TEMPLATE changes so existing conferences resync. */
export const SCHEDULE_TEMPLATE_VERSION = 2;

export const DEFAULT_ROOMS = [
  "Theater",
  "Cafeteria / Sandy's Place",
  "Alaska",
  "Nokomis",
  "Harriet",
  "Bde Maka Ska",
  "Minnetonka",
  "Proverb / Edison",
] as const;

export type SlotTemplate = {
  label: string;
  slotType: SlotType;
};

/**
 * Data Tech–style full day: morning registration/kickoff, 30-minute sessions,
 * 15-minute breaks, lunch, networking.
 */
export const DEFAULT_SLOT_TEMPLATE: SlotTemplate[] = [
  { label: "8:00 AM — Registration", slotType: "REGISTRATION" },
  { label: "9:00 AM", slotType: "KICKOFF" },
  { label: "Break · 9:15 AM – 9:30 AM", slotType: "BREAK" },
  { label: "9:30 AM – 10:00 AM", slotType: "SESSION" },
  { label: "Break · 10:00 AM – 10:15 AM", slotType: "BREAK" },
  { label: "10:15 AM – 10:45 AM", slotType: "SESSION" },
  { label: "Break · 10:45 AM – 11:00 AM", slotType: "BREAK" },
  { label: "11:00 AM – 11:30 AM", slotType: "SESSION" },
  { label: "Break · 11:30 AM – 11:45 AM", slotType: "BREAK" },
  { label: "11:45 AM – 12:15 PM", slotType: "SESSION" },
  { label: "Lunch in Cafeteria · 12:15 PM – 1:15 PM", slotType: "LUNCH" },
  { label: "1:15 PM – 1:45 PM", slotType: "SESSION" },
  { label: "Break · 1:45 PM – 2:00 PM", slotType: "BREAK" },
  { label: "2:00 PM – 2:30 PM", slotType: "SESSION" },
  { label: "Break · 2:30 PM – 2:45 PM", slotType: "BREAK" },
  { label: "2:45 PM – 3:15 PM", slotType: "SESSION" },
  { label: "Break · 3:15 PM – 3:30 PM", slotType: "BREAK" },
  { label: "3:30 PM – 4:00 PM", slotType: "SESSION" },
  { label: "Networking social · 4:00 PM", slotType: "NETWORKING" },
];

/** Static labels for the 9:00 AM kickoff row (per room). */
export const KICKOFF_CELL_LABELS: Record<string, string> = {
  Theater: "Applied AI",
  "Cafeteria / Sandy's Place": "Kickoff",
};

export function kickoffLabelForRoom(roomName: string): string | null {
  return KICKOFF_CELL_LABELS[roomName] ?? null;
}

export function isFullWidthSlotType(slotType: SlotType | string): boolean {
  return (
    slotType === "REGISTRATION" ||
    slotType === "BREAK" ||
    slotType === "LUNCH" ||
    slotType === "NETWORKING"
  );
}

export function sessionSlotIds(
  slots: { id: string; slotType: SlotType }[]
): string[] {
  return slots.filter((s) => s.slotType === "SESSION").map((s) => s.id);
}

export function templateMatchesExisting(
  slots: { label: string; sortOrder: number }[]
): boolean {
  if (slots.length !== DEFAULT_SLOT_TEMPLATE.length) return false;
  const sorted = [...slots].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.every(
    (s, i) => s.label === DEFAULT_SLOT_TEMPLATE[i].label
  );
}
