import type { ReviewerRole } from "@prisma/client";
import { prisma } from "./db";
import { hashToken } from "./tokens";

export async function getReviewerByToken(token: string) {
  const access = await prisma.reviewerAccess.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { conference: true },
  });
  if (!access) return null;
  if (access.expiresAt && access.expiresAt < new Date()) return null;
  return access;
}

export function canApprove(role: ReviewerRole): boolean {
  return role === "CORE";
}

export function canSetProgramStatus(role: ReviewerRole): boolean {
  return role === "CHAIR" || role === "CORE";
}

export function canManageDeck(role: ReviewerRole): boolean {
  return role === "CHAIR" || role === "CORE";
}
