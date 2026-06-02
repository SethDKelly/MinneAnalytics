import { prisma } from "./db";
import { hashToken } from "./tokens";

export {
  adminDashboardTitle,
  canAccessAdmin,
  canAccessCommitteeDashboard,
  canAccessSchedule,
  canApprove,
  canArchiveConference,
  canExportCsv,
  canManageConferenceSettings,
  canManageDeck,
  canManageThemes,
  canMutateActiveConference,
  canPublishDeckArchive,
  canScore,
  canSetDeckShareable,
  canSetVipRegistered,
  canSetProgramStatus,
  canSetSponsorSession,
  canViewHistoricalCommittee,
  committeeDashboardTitle,
  isAdmin,
  isBoard,
  isChair,
  roleCapabilitySummary,
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
