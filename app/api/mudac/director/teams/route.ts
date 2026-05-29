import { NextResponse } from "next/server";
import type { MudacDivision } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";
import { MUDAC_DIVISIONS } from "@/lib/mudac/constants";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const displayId = String(body.displayId ?? "").trim();
  const division = body.division as MudacDivision;
  if (!displayId) {
    return NextResponse.json({ error: "displayId is required" }, { status: 400 });
  }
  if (!MUDAC_DIVISIONS.includes(division)) {
    return NextResponse.json({ error: "Invalid division" }, { status: 400 });
  }

  const existing = await prisma.mudacTeam.findUnique({
    where: {
      eventId_displayId: { eventId: director.eventId, displayId },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Team ID already exists" }, { status: 409 });
  }

  const team = await prisma.mudacTeam.create({
    data: {
      eventId: director.eventId,
      displayId,
      division,
      name: body.name ? String(body.name).trim() : null,
    },
  });

  return NextResponse.json({ ok: true, team });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const teamId = String(body.teamId ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const existing = await prisma.mudacTeam.findFirst({
    where: { id: teamId, eventId: director.eventId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.displayId !== undefined) {
    const displayId = String(body.displayId).trim();
    if (!displayId) {
      return NextResponse.json({ error: "displayId is required" }, { status: 400 });
    }
    if (displayId !== existing.displayId) {
      const clash = await prisma.mudacTeam.findUnique({
        where: {
          eventId_displayId: { eventId: director.eventId, displayId },
        },
      });
      if (clash) {
        return NextResponse.json({ error: "Team ID already exists" }, { status: 409 });
      }
    }
    data.displayId = displayId;
  }

  if (body.division !== undefined) {
    const division = body.division as MudacDivision;
    if (!MUDAC_DIVISIONS.includes(division)) {
      return NextResponse.json({ error: "Invalid division" }, { status: 400 });
    }
    data.division = division;
  }

  if (body.name !== undefined) {
    data.name = body.name ? String(body.name).trim() : null;
  }

  const team = await prisma.mudacTeam.update({
    where: { id: teamId },
    data,
  });

  return NextResponse.json({ ok: true, team });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const teamId = String(body.teamId ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const existing = await prisma.mudacTeam.findFirst({
    where: { id: teamId, eventId: director.eventId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  await prisma.mudacTeam.delete({ where: { id: teamId } });

  return NextResponse.json({ ok: true });
}
