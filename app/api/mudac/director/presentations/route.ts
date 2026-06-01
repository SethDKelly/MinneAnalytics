import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const teamId = String(body.teamId ?? "");
  const panelId = String(body.panelId ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const team = await prisma.mudacTeam.findFirst({
    where: { id: teamId, eventId: director.eventId },
  });
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const panel = await prisma.mudacJudgePanel.findFirst({
    where: { id: panelId, eventId: director.eventId },
  });
  if (!panel) {
    return NextResponse.json({ error: "Panel not found" }, { status: 404 });
  }

  const existing = await prisma.mudacPresentation.findUnique({
    where: { eventId_teamId: { eventId: director.eventId, teamId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Team is already assigned to a panel" },
      { status: 409 }
    );
  }

  const presentation = await prisma.mudacPresentation.create({
    data: {
      eventId: director.eventId,
      panelId,
      teamId,
    },
    include: {
      team: true,
      panel: { select: { id: true, label: true } },
      scorecards: true,
    },
  });

  return NextResponse.json({ ok: true, presentation });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const presentationId = String(body.presentationId ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const presentation = await prisma.mudacPresentation.findFirst({
    where: { id: presentationId, eventId: director.eventId },
  });
  if (!presentation) {
    return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
  }

  await prisma.mudacPresentation.delete({ where: { id: presentationId } });

  return NextResponse.json({ ok: true });
}
