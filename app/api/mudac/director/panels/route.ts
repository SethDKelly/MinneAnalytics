import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";
import { createPanelWithSlots } from "@/lib/mudac/panels";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const label = String(body.label ?? "").trim();
  if (!label) {
    return NextResponse.json({ error: "Panel label is required" }, { status: 400 });
  }

  const panel = await createPanelWithSlots(
    director.eventId,
    label,
    director.event.judgesPerPanel
  );

  const full = await prisma.mudacJudgePanel.findUnique({
    where: { id: panel.id },
    include: {
      slotRequirements: { orderBy: { slotIndex: "asc" } },
      assignments: {
        include: {
          judge: {
            select: { id: true, name: true, email: true, judgeType: true, revokedAt: true },
          },
        },
        orderBy: { slotIndex: "asc" },
      },
    },
  });

  return NextResponse.json({ ok: true, panel: full });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const panelId = String(body.panelId ?? "");

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

  const label = body.label !== undefined ? String(body.label).trim() : undefined;
  if (label !== undefined && !label) {
    return NextResponse.json({ error: "Panel label is required" }, { status: 400 });
  }

  const updated = await prisma.mudacJudgePanel.update({
    where: { id: panelId },
    data: label !== undefined ? { label } : {},
  });

  return NextResponse.json({ ok: true, panel: updated });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const panelId = String(body.panelId ?? "");

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

  await prisma.mudacJudgePanel.delete({ where: { id: panelId } });

  return NextResponse.json({ ok: true });
}
