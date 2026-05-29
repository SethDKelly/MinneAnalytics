import { NextResponse } from "next/server";
import type { MudacDivision } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";
import { MUDAC_DIVISIONS } from "@/lib/mudac/constants";
import { getExistingTeamDisplayIds } from "@/lib/mudac/queries";
import { generateTeamIds } from "@/lib/mudac/team-ids";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const division = body.division as MudacDivision;
  const count = Number(body.count ?? 0);
  if (!MUDAC_DIVISIONS.includes(division)) {
    return NextResponse.json({ error: "Invalid division" }, { status: 400 });
  }
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    return NextResponse.json({ error: "count must be 1–100" }, { status: 400 });
  }

  const event = director.event;
  const start = body.start !== undefined ? Number(body.start) : event.teamIdStart;
  const end = body.end !== undefined ? Number(body.end) : event.teamIdEnd;
  const increment =
    body.increment !== undefined ? Number(body.increment) : event.teamIdIncrement;
  const padWidth =
    body.padWidth !== undefined ? Number(body.padWidth) : event.teamIdPadWidth;
  const mode = body.mode !== undefined ? body.mode : event.idGenerationMode;

  if (start > end) {
    return NextResponse.json({ error: "start must be ≤ end" }, { status: 400 });
  }

  const existingDisplayIds = await getExistingTeamDisplayIds(director.eventId);
  const generated = generateTeamIds({
    mode,
    start,
    end,
    increment,
    padWidth,
    count,
    division,
    existingDisplayIds,
  });

  if (generated.length === 0) {
    return NextResponse.json(
      { error: "No available IDs in range — adjust settings or remove teams" },
      { status: 409 }
    );
  }

  if (generated.length < count) {
    return NextResponse.json(
      {
        error: `Only ${generated.length} ID(s) available in range`,
        partial: generated.length,
      },
      { status: 409 }
    );
  }

  const created = await prisma.$transaction(
    generated.map((row) =>
      prisma.mudacTeam.create({
        data: {
          eventId: director.eventId,
          displayId: row.displayId,
          division: row.division,
        },
      })
    )
  );

  await prisma.mudacEvent.update({
    where: { id: director.eventId },
    data: {
      teamIdStart: start,
      teamIdEnd: end,
      teamIdIncrement: increment,
      teamIdPadWidth: padWidth,
      idGenerationMode: mode,
    },
  });

  return NextResponse.json({ ok: true, teams: created, count: created.length });
}
