import type { ReviewerRole } from "@prisma/client";
import { prisma } from "./db";
import { hashToken } from "./tokens";

export {
  canAccessCommitteeDashboard,
  canAccessSchedule,
  canApprove,
  canExportCsv,
  canManageDeck,
  canPublishDeckArchive,
  canScore,
  canSetDeckShareable,
  canSetVipRegistered,
  canSetProgramStatus,
  committeeDashboardTitle,
  isBoard,
  isChair,
  roleDisplayName,
} from "./roles";

export async function getReviewerByToken(token: string) {
  const access = await prisma.reviewerAccess.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { conference: true },
  });
  if (!access) return null;
  if (access.expiresAt && access.expiresAt < new Date()) return null;
  return access;
}
