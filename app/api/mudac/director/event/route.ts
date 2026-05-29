import { NextResponse } from "next/server";
import type { MudacEventStatus, MudacIdGenerationMode, MudacPanelAggregateMode } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";
import { MUDAC_EVENT_STATUSES } from "@/lib/mudac/constants";
import { hashRegistrationCode } from "@/lib/mudac/registration-code";

const AGGREGATE_MODES: MudacPanelAggregateMode[] = ["SUM", "MEAN"];
const ID_MODES: MudacIdGenerationMode[] = ["SEQUENTIAL", "RANDOM"];

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    const status = body.status as MudacEventStatus;
    if (!MUDAC_EVENT_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status;
  }

  if (body.registrationOpen !== undefined) {
    data.registrationOpen = Boolean(body.registrationOpen);
  }

  if (body.registrationCode !== undefined) {
    const code = String(body.registrationCode ?? "").trim();
    data.registrationCodeHash = code ? hashRegistrationCode(code) : null;
  }

  if (body.scoringLocked !== undefined) {
    data.scoringLocked = Boolean(body.scoringLocked);
  }

  if (body.judgesPerPanel !== undefined) {
    const n = Number(body.judgesPerPanel);
    if (!Number.isInteger(n) || n < 1 || n > 12) {
      return NextResponse.json({ error: "judgesPerPanel must be 1–12" }, { status: 400 });
    }
    data.judgesPerPanel = n;
  }

  if (body.panelAggregateMode !== undefined) {
    const mode = body.panelAggregateMode as MudacPanelAggregateMode;
    if (!AGGREGATE_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid panel aggregate mode" }, { status: 400 });
    }
    data.panelAggregateMode = mode;
  }

  if (body.idGenerationMode !== undefined) {
    const mode = body.idGenerationMode as MudacIdGenerationMode;
    if (!ID_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid ID generation mode" }, { status: 400 });
    }
    data.idGenerationMode = mode;
  }

  if (body.teamIdStart !== undefined) {
    data.teamIdStart = Number(body.teamIdStart);
  }
  if (body.teamIdEnd !== undefined) {
    data.teamIdEnd = Number(body.teamIdEnd);
  }
  if (body.teamIdIncrement !== undefined) {
    const inc = Number(body.teamIdIncrement);
    if (!Number.isInteger(inc) || inc < 1) {
      return NextResponse.json({ error: "teamIdIncrement must be ≥ 1" }, { status: 400 });
    }
    data.teamIdIncrement = inc;
  }
  if (body.teamIdPadWidth !== undefined) {
    const w = Number(body.teamIdPadWidth);
    if (!Number.isInteger(w) || w < 1 || w > 6) {
      return NextResponse.json({ error: "teamIdPadWidth must be 1–6" }, { status: 400 });
    }
    data.teamIdPadWidth = w;
  }

  const updated = await prisma.mudacEvent.update({
    where: { id: director.eventId },
    data,
  });

  return NextResponse.json({ ok: true, event: updated });
}
