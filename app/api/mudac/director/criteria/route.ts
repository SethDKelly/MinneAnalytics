import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";
import { getNextCriterionSortOrder } from "@/lib/mudac/queries";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const maxPoints = Number(body.maxPoints ?? 10);
  const weight = Number(body.weight ?? 1);
  if (!Number.isInteger(maxPoints) || maxPoints < 1 || maxPoints > 100) {
    return NextResponse.json({ error: "maxPoints must be 1–100" }, { status: 400 });
  }
  if (Number.isNaN(weight) || weight <= 0 || weight > 10) {
    return NextResponse.json({ error: "weight must be 0–10" }, { status: 400 });
  }

  const sortOrder = await getNextCriterionSortOrder(director.eventId);

  const criterion = await prisma.mudacScoringCriterion.create({
    data: {
      eventId: director.eventId,
      sortOrder,
      name,
      description: body.description ? String(body.description).trim() : null,
      maxPoints,
      weight,
    },
  });

  return NextResponse.json({ ok: true, criterion });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const criterionId = String(body.criterionId ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const existing = await prisma.mudacScoringCriterion.findFirst({
    where: { id: criterionId, eventId: director.eventId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Criterion not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    data.name = name;
  }
  if (body.description !== undefined) {
    data.description = body.description ? String(body.description).trim() : null;
  }
  if (body.maxPoints !== undefined) {
    const maxPoints = Number(body.maxPoints);
    if (!Number.isInteger(maxPoints) || maxPoints < 1 || maxPoints > 100) {
      return NextResponse.json({ error: "maxPoints must be 1–100" }, { status: 400 });
    }
    data.maxPoints = maxPoints;
  }
  if (body.weight !== undefined) {
    const weight = Number(body.weight);
    if (Number.isNaN(weight) || weight <= 0 || weight > 10) {
      return NextResponse.json({ error: "weight must be 0–10" }, { status: 400 });
    }
    data.weight = weight;
  }

  const criterion = await prisma.mudacScoringCriterion.update({
    where: { id: criterionId },
    data,
  });

  return NextResponse.json({ ok: true, criterion });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const criterionId = String(body.criterionId ?? "");

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const existing = await prisma.mudacScoringCriterion.findFirst({
    where: { id: criterionId, eventId: director.eventId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Criterion not found" }, { status: 404 });
  }

  await prisma.mudacScoringCriterion.delete({ where: { id: criterionId } });

  const remaining = await prisma.mudacScoringCriterion.findMany({
    where: { eventId: director.eventId },
    orderBy: { sortOrder: "asc" },
  });
  for (let i = 0; i < remaining.length; i++) {
    await prisma.mudacScoringCriterion.update({
      where: { id: remaining[i].id },
      data: { sortOrder: i + 1 },
    });
  }

  return NextResponse.json({ ok: true });
}
