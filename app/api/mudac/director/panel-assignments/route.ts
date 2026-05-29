import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const panelId = String(body.panelId ?? "");
  const judgeId = String(body.judgeId ?? "");
  const slotIndex = Number(body.slotIndex);

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  if (!Number.isInteger(slotIndex) || slotIndex < 0) {
    return NextResponse.json({ error: "Invalid slot index" }, { status: 400 });
  }

  const panel = await prisma.mudacJudgePanel.findFirst({
    where: { id: panelId, eventId: director.eventId },
    include: { slotRequirements: true },
  });
  if (!panel) {
    return NextResponse.json({ error: "Panel not found" }, { status: 404 });
  }

  const slotReq = panel.slotRequirements.find((s) => s.slotIndex === slotIndex);
  if (!slotReq) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  const judge = await prisma.mudacJudge.findFirst({
    where: { id: judgeId, eventId: director.eventId },
  });
  if (!judge || judge.revokedAt) {
    return NextResponse.json({ error: "Judge not found or revoked" }, { status: 404 });
  }

  const existingSlot = await prisma.mudacPanelAssignment.findUnique({
    where: { panelId_slotIndex: { panelId, slotIndex } },
  });
  if (existingSlot) {
    return NextResponse.json({ error: "Slot already assigned" }, { status: 409 });
  }

  const judgeOnOtherPanel = await prisma.mudacPanelAssignment.findFirst({
    where: { judgeId, panel: { eventId: director.eventId } },
  });
  if (judgeOnOtherPanel) {
    return NextResponse.json(
      { error: "Judge is already assigned to another panel" },
      { status: 409 }
    );
  }

  if (judge.judgeType !== slotReq.judgeType) {
    return NextResponse.json(
      {
        error: `Judge type (${judge.judgeType}) does not match slot requirement (${slotReq.judgeType})`,
        mismatch: true,
      },
      { status: 409 }
    );
  }

  const assignment = await prisma.mudacPanelAssignment.create({
    data: { panelId, judgeId, slotIndex },
    include: {
      judge: {
        select: { id: true, name: true, email: true, judgeType: true, revokedAt: true },
      },
    },
  });

  return NextResponse.json({ ok: true, assignment });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const panelId = String(body.panelId ?? "");
  const slotIndex = Number(body.slotIndex);

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const panel = await prisma.mudacJudgePanel.findFirst({
    where: { id: panelId, eventId: director.eventId },
  });
  if (!panel) {
    return NextResponse.json({ error: "Panel not found" }, { status: 404 });
  }

  await prisma.mudacPanelAssignment.deleteMany({
    where: { panelId, slotIndex },
  });

  return NextResponse.json({ ok: true });
}
