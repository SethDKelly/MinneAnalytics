import type { MudacDivision, MudacEventStatus, MudacJudgeType } from "@prisma/client";

export const MUDAC_DIVISION_LABELS: Record<MudacDivision, string> = {
  UNDERGRADUATE: "Undergraduate",
  GRADUATE: "Graduate",
  POST_GRADUATE: "Post-graduate",
};

export const MUDAC_STATUS_LABELS: Record<MudacEventStatus, string> = {
  DRAFT: "Draft",
  REGISTRATION_OPEN: "Registration open",
  JUDGING: "Judging",
  LOCKED: "Locked",
  ARCHIVED: "Archived",
};

export const MUDAC_JUDGE_TYPE_LABELS: Record<MudacJudgeType, string> = {
  ACADEMIC: "Academic",
  INDUSTRY_BUSINESS: "Industry (business)",
  INDUSTRY_TECHNICAL: "Industry (technical)",
  GENERAL: "General",
};

export const MUDAC_EVENT_STATUSES: MudacEventStatus[] = [
  "DRAFT",
  "REGISTRATION_OPEN",
  "JUDGING",
  "LOCKED",
  "ARCHIVED",
];

export const MUDAC_DIVISIONS: MudacDivision[] = [
  "UNDERGRADUATE",
  "GRADUATE",
  "POST_GRADUATE",
];
