import { DEGREE_OPTIONS } from "./constants";

export function parseDegreesJson(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((d): d is string => typeof d === "string");
  } catch {
    return [];
  }
}

export function serializeDegrees(degrees: string[]): string {
  const valid = degrees.filter((d) =>
    (DEGREE_OPTIONS as readonly string[]).includes(d)
  );
  const unique = [...new Set(valid)];
  if (unique.includes("None") && unique.length > 1) {
    return JSON.stringify(["None"]);
  }
  return JSON.stringify(unique.length ? unique : ["None"]);
}

export function formatDegrees(raw: string): string {
  const list = parseDegreesJson(raw);
  return list.length ? list.join(", ") : "None";
}
