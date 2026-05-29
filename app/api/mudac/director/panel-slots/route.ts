import { NextResponse } from "next/server";
import type { MudacJudgeType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";
import { MUDAC_JUDGE_TYPE_LABELS } from "@/lib/mudac/constants";

const JUDGE_TYPES = Object.keys(MUDAC_JUDGE_TYPE_LABELS) as MudacJudgeType[];

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const panelId = String(body.panelId ?? "");
  const slotIndex = Number(body.slotIndex);
  const judgeType = body.judgeType as MudacJudgeType;

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  if (!Number.isInteger(slotIndex) || slotIndex < 0) {
    return NextResponse.json({ error: "Invalid slot index" }, { status: 400 });
  }
  if (!JUDGE_TYPES.includes(judgeType)) {
    return NextResponse.json({ error: "Invalid judge type" }, { status: 400 });
  }

  const panel = await prisma.mudacJudgePanel.findFirst({
    where: { id: panelId, eventId: director.eventId },
  });
  if (!panel) {
    return NextResponse.json({ error: "Panel not found" }, { status: 404 });
  }

  const slot = await prisma.mudacPanelSlotRequirement.findUnique({
    where: { panelId_slotIndex: { panelId, slotIndex } },
  });
  if (!slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  const updated = await prisma.mudacPanelSlotRequirement.update({
    where: { id: slot.id },
    data: { judgeType },
  });

  return NextResponse.json({ ok: true, slot: updated });
}
