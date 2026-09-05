import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertLiveOperationalContext } from "@/lib/concept-design/lifecycle-disclosure-policy";
import { generateAssignments } from "@/lib/schedule/generate";
import { sessionSlotIds } from "@/lib/schedule/template";

export class SchedulePolicyError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SchedulePolicyError";
    this.code = code;
  }
}

export class ScheduleBaseConflictError extends Error {
  readonly code = "SCHEDULE_STALE_BASE";

  constructor(message = "The schedule changed after this proposal was generated") {
    super(message);
    this.name = "ScheduleBaseConflictError";
  }
}

export type ScheduleProposalAssignment = {
  placementId: string;
  submissionId: string;
};

function fingerprintPlacementState(
  rows: Array<{ id: string; slotId: string; roomId: string; submissionId: string | null }>
) {
  const normalized = rows
    .map((row) => ({
      placementId: row.id,
      slotId: row.slotId,
      roomId: row.roomId,
      submissionId: row.submissionId,
    }))
    .sort((a, b) => a.placementId.localeCompare(b.placementId));
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

async function loadSessionPlacements(
  client: Prisma.TransactionClient | typeof prisma,
  conferenceId: string
) {
  const [slots, placements] = await Promise.all([
    client.scheduleSlot.findMany({
      where: { conferenceId },
      orderBy: { sortOrder: "asc" },
    }),
    client.schedulePlacement.findMany({
      where: { conferenceId },
      include: { slot: true },
      orderBy: { id: "asc" },
    }),
  ]);
  const sessionIds = new Set(sessionSlotIds(slots));
  return placements.filter(
    (placement) =>
      placement.slot.slotType === "SESSION" && sessionIds.has(placement.slotId)
  );
}

async function loadSchedulableTalks(
  client: Prisma.TransactionClient | typeof prisma,
  conferenceId: string
) {
  const submissions = await client.submission.findMany({
    where: { conferenceId },
    select: {
      id: true,
      technicalLevel: true,
      isSoftSkill: true,
      currentSelectionDecision: { select: { disposition: true } },
      withdrawal: { select: { id: true } },
    },
  });
  return submissions
    .filter(
      (submission) =>
        submission.currentSelectionDecision?.disposition === "SELECTED" &&
        !submission.withdrawal
    )
    .map((submission) => ({
      id: submission.id,
      technicalLevel: submission.technicalLevel,
      isSoftSkill: submission.isSoftSkill,
    }));
}

export async function generateCanonicalScheduleProposal(conferenceId: string) {
  const conference = await prisma.conference.findUnique({
    where: { id: conferenceId },
    include: { archiveRecord: true },
  });
  if (!conference) {
    throw new SchedulePolicyError("CONTEXT_NOT_FOUND", "Conference not found");
  }
  try {
    assertLiveOperationalContext(conference);
  } catch (error) {
    if (error instanceof Error && "code" in error) throw error;
    throw new SchedulePolicyError("SCHEDULE_CONTEXT_NOT_LIVE", "Schedule generation requires live operation");
  }

  const [talks, placements] = await Promise.all([
    loadSchedulableTalks(prisma, conferenceId),
    loadSessionPlacements(prisma, conferenceId),
  ]);
  const baseFingerprint = fingerprintPlacementState(placements);
  const result = generateAssignments(
    talks,
    placements.map((placement) => ({
      placementId: placement.id,
      slotId: placement.slotId,
      roomId: placement.roomId,
    }))
  );

  return {
    baseFingerprint,
    assignments: result.assigned,
    unassigned: result.unassigned,
    capacity: placements.length,
  };
}

export async function applyCanonicalScheduleProposal(input: {
  conferenceId: string;
  expectedBaseFingerprint: string;
  assignments: ScheduleProposalAssignment[];
}) {
  return prisma.$transaction(async (tx) => {
    const conference = await tx.conference.findUnique({
      where: { id: input.conferenceId },
      include: { archiveRecord: true },
    });
    if (!conference) {
      throw new SchedulePolicyError("CONTEXT_NOT_FOUND", "Conference not found");
    }
    assertLiveOperationalContext(conference);

    const placements = await loadSessionPlacements(tx, conference.id);
    const actualFingerprint = fingerprintPlacementState(placements);
    if (actualFingerprint !== input.expectedBaseFingerprint) {
      throw new ScheduleBaseConflictError();
    }

    const placementIds = new Set(placements.map((placement) => placement.id));
    const seenPlacements = new Set<string>();
    const seenSubmissions = new Set<string>();
    for (const assignment of input.assignments) {
      if (!placementIds.has(assignment.placementId)) {
        throw new SchedulePolicyError(
          "SCHEDULE_PROPOSAL_INVALID_PLACEMENT",
          "A proposed assignment references a non-session placement"
        );
      }
      if (seenPlacements.has(assignment.placementId)) {
        throw new SchedulePolicyError(
          "SCHEDULE_PROPOSAL_DUPLICATE_PLACEMENT",
          "A proposal cannot assign two talks to one placement"
        );
      }
      if (seenSubmissions.has(assignment.submissionId)) {
        throw new SchedulePolicyError(
          "SCHEDULE_PROPOSAL_DUPLICATE_TALK",
          "A proposal cannot place one talk more than once"
        );
      }
      seenPlacements.add(assignment.placementId);
      seenSubmissions.add(assignment.submissionId);
    }

    if (seenSubmissions.size > 0) {
      const submissions = await tx.submission.findMany({
        where: { id: { in: [...seenSubmissions] }, conferenceId: conference.id },
        select: {
          id: true,
          currentSelectionDecision: { select: { disposition: true } },
          withdrawal: { select: { id: true } },
        },
      });
      const eligible = new Set(
        submissions
          .filter(
            (submission) =>
              submission.currentSelectionDecision?.disposition === "SELECTED" &&
              !submission.withdrawal
          )
          .map((submission) => submission.id)
      );
      const invalid = [...seenSubmissions].filter((id) => !eligible.has(id));
      if (invalid.length > 0) {
        throw new SchedulePolicyError(
          "SCHEDULE_PROPOSAL_INELIGIBLE_TALK",
          "The proposal contains a talk that is no longer effectively participating"
        );
      }
    }

    await tx.schedulePlacement.updateMany({
      where: {
        conferenceId: conference.id,
        slot: { slotType: "SESSION" },
      },
      data: { submissionId: null },
    });
    for (const assignment of input.assignments) {
      await tx.schedulePlacement.update({
        where: { id: assignment.placementId },
        data: { submissionId: assignment.submissionId },
      });
    }

    const after = await loadSessionPlacements(tx, conference.id);
    return {
      applied: input.assignments.length,
      capacity: placements.length,
      newBaseFingerprint: fingerprintPlacementState(after),
    };
  });
}

export async function applyCanonicalManualPlacement(input: {
  conferenceId: string;
  placementId: string;
  submissionId: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const conference = await tx.conference.findUnique({
      where: { id: input.conferenceId },
      include: { archiveRecord: true },
    });
    if (!conference) {
      throw new SchedulePolicyError("CONTEXT_NOT_FOUND", "Conference not found");
    }
    assertLiveOperationalContext(conference);

    const target = await tx.schedulePlacement.findFirst({
      where: { id: input.placementId, conferenceId: conference.id },
      include: { slot: true },
    });
    if (!target) {
      throw new SchedulePolicyError("SCHEDULE_PLACEMENT_NOT_FOUND", "Placement not found");
    }
    if (target.slot.slotType !== "SESSION") {
      throw new SchedulePolicyError(
        "SCHEDULE_PLACEMENT_NOT_SESSION",
        "Only session slots accept talks"
      );
    }

    if (input.submissionId === null) {
      await tx.schedulePlacement.update({
        where: { id: target.id },
        data: { submissionId: null },
      });
      return { ok: true };
    }

    const submission = await tx.submission.findFirst({
      where: { id: input.submissionId, conferenceId: conference.id },
      select: {
        id: true,
        currentSelectionDecision: { select: { disposition: true } },
        withdrawal: { select: { id: true } },
      },
    });
    if (
      !submission ||
      submission.currentSelectionDecision?.disposition !== "SELECTED" ||
      submission.withdrawal
    ) {
      throw new SchedulePolicyError(
        "SCHEDULE_TALK_INELIGIBLE",
        "Only effectively participating talks may be scheduled"
      );
    }

    const occupantId = target.submissionId;
    const sourcePlacement = await tx.schedulePlacement.findFirst({
      where: { submissionId: submission.id, conferenceId: conference.id },
    });

    if (sourcePlacement && sourcePlacement.id !== target.id) {
      if (occupantId && occupantId !== submission.id) {
        await tx.schedulePlacement.update({
          where: { id: sourcePlacement.id },
          data: { submissionId: occupantId },
        });
      } else {
        await tx.schedulePlacement.update({
          where: { id: sourcePlacement.id },
          data: { submissionId: null },
        });
      }
    } else if (occupantId && occupantId !== submission.id) {
      await tx.schedulePlacement.update({
        where: { id: target.id },
        data: { submissionId: null },
      });
    }

    await tx.schedulePlacement.updateMany({
      where: {
        conferenceId: conference.id,
        submissionId: submission.id,
        id: { not: target.id },
      },
      data: { submissionId: null },
    });
    await tx.schedulePlacement.update({
      where: { id: target.id },
      data: { submissionId: submission.id },
    });
    return { ok: true };
  });
}
