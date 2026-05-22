import type { ReviewerRole } from "@prisma/client";

/** MinneAnalytics primary board — approval and scoring rights. */
export const BOARD_MEMBER_NAMES = [
  "Dan Atkins",
  "Sean Larson",
  "Graeme Thickins",
  "John Hogue",
] as const;

export function isBoard(role: ReviewerRole): boolean {
  return role === "BOARD";
}

export function isChair(role: ReviewerRole): boolean {
  return role === "CHAIR";
}

export function canScore(role: ReviewerRole): boolean {
  return role === "BOARD" || role === "CHAIR";
}

/** Final program acceptance (Pending / Backup → Approved). */
export function canApprove(role: ReviewerRole): boolean {
  return role === "BOARD";
}

export function canSetProgramStatus(role: ReviewerRole): boolean {
  return role === "BOARD";
}

/** Slide deck workflow after abstract approval. */
export function canManageDeck(role: ReviewerRole): boolean {
  return role === "BOARD" || role === "CHAIR";
}

export function canAccessSchedule(role: ReviewerRole): boolean {
  return role === "BOARD";
}

export function canAccessCommitteeDashboard(role: ReviewerRole): boolean {
  return role === "BOARD" || role === "CHAIR";
}

export function roleDisplayName(role: ReviewerRole): string {
  switch (role) {
    case "BOARD":
      return "Board member";
    case "CHAIR":
      return "Conference co-chair";
    default:
      return role;
  }
}

export function committeeDashboardTitle(role: ReviewerRole): string {
  return isBoard(role) ? "Board program dashboard" : "Co-chair program dashboard";
}
