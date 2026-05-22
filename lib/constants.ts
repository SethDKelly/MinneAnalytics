export const DEGREE_OPTIONS = [
  "None",
  "Associate",
  "MS",
  "MA",
  "MBA",
  "MEng",
  "PhD",
  "JD",
  "MD",
  "DDS",
  "Other",
] as const;

export type DegreeOption = (typeof DEGREE_OPTIONS)[number];

export const TECHNICAL_LABELS: Record<number, string> = {
  1: "Not technical",
  2: "Mostly non-technical",
  3: "Mixed",
  4: "Technical",
  5: "Highly technical",
};

export const PROGRAM_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DECLINED: "Declined",
  BACKUP: "Backup",
  WITHDRAWN: "Withdrawn",
};

/** Maps technical level 1–5 to schedule variety bands (Data Tech style). */
export const VARIETY_LABELS: Record<number, string> = {
  1: "Business",
  2: "Mostly business",
  3: "Mix of biz & tech",
  4: "Leans technical",
  5: "Mostly technical",
};

export const VARIETY_COLORS: Record<number, string> = {
  1: "bg-emerald-200 border-emerald-400",
  2: "bg-emerald-100 border-emerald-300",
  3: "bg-amber-100 border-amber-300",
  4: "bg-orange-100 border-orange-300",
  5: "bg-red-200 border-red-400",
};

export const DECK_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  REVIEWED: "Reviewed",
  APPROVED: "Approved",
  CONCERN: "Concern",
};
