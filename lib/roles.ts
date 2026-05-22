import type { ReviewerRole } from "@prisma/client";

/** MinneAnalytics primary board — program approval and scoring. */
export const BOARD_MEMBER_NAMES = [
  "Dan Atkins",
  "Sean Larson",
  "Graeme Thickins",
  "John Hogue",
] as const;

export function isAdmin(role: ReviewerRole): boolean {
  return role === "ADMIN";
}

export function isBoard(role: ReviewerRole): boolean {
  return role === "BOARD";
}

export function isChair(role: ReviewerRole): boolean {
  return role === "CHAIR";
}

/** Site operator: conferences, submission windows, theme taxonomy, lifecycle. */
export function canAccessAdmin(role: ReviewerRole): boolean {
  return role === "ADMIN";
}

export function canManageConferenceSettings(role: ReviewerRole): boolean {
  return role === "ADMIN";
}

export function canManageThemes(role: ReviewerRole): boolean {
  return role === "ADMIN";
}

export function canArchiveConference(role: ReviewerRole): boolean {
  return role === "ADMIN";
}

/** Committee scoring queue. */
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

export function canSetDeckShareable(role: ReviewerRole): boolean {
  return role === "BOARD";
}

export function canSetVipRegistered(role: ReviewerRole): boolean {
  return role === "BOARD" || role === "CHAIR";
}

export function canPublishDeckArchive(role: ReviewerRole): boolean {
  return role === "BOARD";
}

export function canAccessSchedule(role: ReviewerRole): boolean {
  return role === "BOARD";
}

export function canAccessCommitteeDashboard(role: ReviewerRole): boolean {
  return role === "BOARD" || role === "CHAIR";
}

export function canExportCsv(role: ReviewerRole): boolean {
  return role === "BOARD" || role === "CHAIR";
}

/** Read-only historical data across archived conferences. */
export function canViewHistoricalCommittee(role: ReviewerRole): boolean {
  return role === "BOARD" || role === "ADMIN";
}

export function canMutateActiveConference(role: ReviewerRole): boolean {
  return role === "BOARD" || role === "CHAIR";
}

export function roleDisplayName(role: ReviewerRole): string {
  switch (role) {
    case "ADMIN":
      return "Site administrator";
    case "BOARD":
      return "Board member";
    case "CHAIR":
      return "Conference co-chair";
    default:
      return role;
  }
}

export function committeeDashboardTitle(role: ReviewerRole): string {
  if (isBoard(role)) return "Board program dashboard";
  if (isChair(role)) return "Co-chair program dashboard";
  return "Committee dashboard";
}

export function adminDashboardTitle(): string {
  return "Site administration";
}

/** Human-readable RBAC summary for UI hints. */
export function roleCapabilitySummary(role: ReviewerRole): string {
  switch (role) {
    case "ADMIN":
      return "Manage conference settings, submission windows, themes, and archive lifecycle. Does not score or approve talks.";
    case "BOARD":
      return "Score, approve or decline talks, review decks, build schedule, and publish the public slide archive.";
    case "CHAIR":
      return "Score and review decks. Cannot approve talks, publish archive, or edit schedule.";
    default:
      return "";
  }
}
