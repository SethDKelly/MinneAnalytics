import type { MudacDivision, MudacIdGenerationMode } from "@prisma/client";

export function formatTeamDisplayId(value: number, padWidth: number): string {
  const width = Math.max(1, padWidth);
  return String(value).padStart(width, "0");
}

export type TeamIdGenerationInput = {
  mode: MudacIdGenerationMode;
  start: number;
  end: number;
  increment: number;
  padWidth: number;
  count: number;
  division: MudacDivision;
  existingDisplayIds: Set<string>;
};

export type GeneratedTeam = {
  displayId: string;
  division: MudacDivision;
};

function sequentialCandidates(
  start: number,
  end: number,
  increment: number,
  padWidth: number
): string[] {
  const ids: string[] = [];
  if (increment <= 0) return ids;
  for (let n = start; n <= end; n += increment) {
    ids.push(formatTeamDisplayId(n, padWidth));
  }
  return ids;
}

function randomCandidates(start: number, end: number, padWidth: number): string[] {
  const pool = new Set<string>();
  for (let n = start; n <= end; n++) {
    pool.add(formatTeamDisplayId(n, padWidth));
  }
  return [...pool];
}

export function generateTeamIds(input: TeamIdGenerationInput): GeneratedTeam[] {
  const { mode, start, end, increment, padWidth, count, division, existingDisplayIds } =
    input;

  if (count <= 0) return [];
  if (start > end) return [];

  const pool =
    mode === "SEQUENTIAL"
      ? sequentialCandidates(start, end, increment, padWidth)
      : randomCandidates(start, end, padWidth);

  const available = pool.filter((id) => !existingDisplayIds.has(id));

  if (mode === "RANDOM") {
    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count).map((displayId) => ({ displayId, division }));
  }

  return available.slice(0, count).map((displayId) => ({ displayId, division }));
}
