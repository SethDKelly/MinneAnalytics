import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAssignments } from "@/lib/schedule/generate";
import { ensureScheduleGrid } from "@/lib/schedule/grid";
import { sessionSlotIds } from "@/lib/schedule/template";
import { getSchedulePlanner } from "@/lib/schedule/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const planner = await getSchedulePlanner(token);
  if (!planner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureScheduleGrid(planner.conferenceId);

  const [talks, slots, placements] = await Promise.all([
    prisma.submission.findMany({
      where: {
        conferenceId: planner.conferenceId,
        programStatus: "APPROVED",
      },
      select: {
        id: true,
        technicalLevel: true,
        isSoftSkill: true,
      },
    }),
    prisma.scheduleSlot.findMany({
      where: { conferenceId: planner.conferenceId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.schedulePlacement.findMany({
      where: {
        conferenceId: planner.conferenceId,
        slot: { slotType: "SESSION" },
      },
    }),
  ]);

  const sessionIds = new Set(sessionSlotIds(slots));
  const sessionCells = placements
    .filter((p) => sessionIds.has(p.slotId))
    .map((p) => ({
      placementId: p.id,
      slotId: p.slotId,
      roomId: p.roomId,
    }));

  await prisma.schedulePlacement.updateMany({
    where: {
      conferenceId: planner.conferenceId,
      slot: { slotType: "SESSION" },
    },
    data: { submissionId: null },
  });

  const result = generateAssignments(talks, sessionCells);

  for (const { submissionId, placementId } of result.assigned) {
    await prisma.schedulePlacement.update({
      where: { id: placementId },
      data: { submissionId },
    });
  }

  return NextResponse.json({
    assigned: result.assigned.length,
    unassigned: result.unassigned.length,
    capacity: sessionCells.length,
  });
}
