import type { SchedulableTalk } from "./balance";
import { pickBestTalk } from "./balance";

export type PlacementTarget = {
  placementId: string;
  slotId: string;
  roomId: string;
};

export type GenerateResult = {
  assigned: { submissionId: string; placementId: string }[];
  unassigned: string[];
};

/**
 * Assign approved talks to session cells, balancing technical variety per time row.
 */
export function generateAssignments(
  talks: SchedulableTalk[],
  sessionCells: PlacementTarget[]
): GenerateResult {
  const bySlot = new Map<string, PlacementTarget[]>();
  for (const cell of sessionCells) {
    const list = bySlot.get(cell.slotId) ?? [];
    list.push(cell);
    bySlot.set(cell.slotId, list);
  }

  const slotOrder = [...bySlot.keys()];
  const pool = [...talks];
  const assigned: GenerateResult["assigned"] = [];
  const used = new Set<string>();

  for (const slotId of slotOrder) {
    const cells = bySlot.get(slotId)!;
    const shuffled = shuffle(cells);
    const levelsInSlot: number[] = [];

    for (const cell of shuffled) {
      const available = pool.filter((t) => !used.has(t.id));
      const pick = pickBestTalk(available, levelsInSlot);
      if (!pick) break;

      used.add(pick.id);
      levelsInSlot.push(pick.technicalLevel);
      assigned.push({ submissionId: pick.id, placementId: cell.placementId });
    }
  }

  const unassigned = talks.filter((t) => !used.has(t.id)).map((t) => t.id);
  return { assigned, unassigned };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
