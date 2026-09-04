import { NextResponse } from "next/server";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  establishInitialTermState,
  recordTermState,
} from "@/lib/concept-design/vocabulary";
import { prisma } from "@/lib/db";
import { canManageThemes, getReviewerByToken } from "@/lib/reviewer";
import { slugifyThemeName } from "@/lib/themes";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const name = String(body.name ?? "").trim();

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canManageThemes(reviewer.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim() || slugifyThemeName(name);
  const targetMin = Math.max(0, Number(body.targetMin) || 0);
  const targetMax = Math.max(0, Number(body.targetMax) || 0);

  const maxOrder = await prisma.theme.aggregate({
    where: { conferenceId: reviewer.conferenceId },
    _max: { sortOrder: true },
  });

  const canonicalWrites = isImplementationGateEnabled("revisionEvaluationWrites");
  const theme = canonicalWrites
    ? await prisma.$transaction(async (tx) => {
        const created = await tx.theme.create({
          data: {
            conferenceId: reviewer.conferenceId,
            name,
            slug,
            source: "ADMIN",
            targetMin,
            targetMax,
            sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
          },
        });
        await establishInitialTermState(tx, {
          themeId: created.id,
          label: created.name,
          recordedByRef: reviewer.id,
        });
        return tx.theme.findUniqueOrThrow({ where: { id: created.id } });
      })
    : await prisma.theme.create({
        data: {
          conferenceId: reviewer.conferenceId,
          name,
          slug,
          source: "ADMIN",
          targetMin,
          targetMax,
          sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        },
      });

  return NextResponse.json({ ok: true, theme });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const themeId = String(body.themeId ?? "");

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canManageThemes(reviewer.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const existing = await prisma.theme.findFirst({
    where: { id: themeId, conferenceId: reviewer.conferenceId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  const name = body.name !== undefined ? String(body.name).trim() : undefined;
  if (name !== undefined && !name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const targetMin =
    body.targetMin !== undefined ? Math.max(0, Number(body.targetMin) || 0) : undefined;
  const targetMax =
    body.targetMax !== undefined ? Math.max(0, Number(body.targetMax) || 0) : undefined;
  const source = body.source === "ADMIN" ? ("ADMIN" as const) : undefined;
  const availability =
    body.removed === true ? ("RETIRED" as const) :
    body.removed === false ? ("AVAILABLE" as const) : undefined;

  if (isImplementationGateEnabled("revisionEvaluationWrites") && (name || availability)) {
    const theme = await prisma.$transaction(async (tx) => {
      if (targetMin !== undefined || targetMax !== undefined || source !== undefined) {
        await tx.theme.update({
          where: { id: themeId },
          data: { targetMin, targetMax, source },
        });
      }
      await recordTermState(tx, {
        themeId,
        label: name,
        availability,
        recordedByRef: reviewer.id,
      });
      return tx.theme.findUniqueOrThrow({ where: { id: themeId } });
    });
    return NextResponse.json({ ok: true, theme });
  }

  const theme = await prisma.theme.update({
    where: { id: themeId },
    data: {
      name,
      targetMin,
      targetMax,
      removedAt:
        body.removed === true ? new Date() : body.removed === false ? null : undefined,
      source,
    },
  });

  return NextResponse.json({ ok: true, theme });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const themeId = searchParams.get("themeId");

  if (!token || !themeId) {
    return NextResponse.json({ error: "Missing token or themeId" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canManageThemes(reviewer.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const existing = await prisma.theme.findFirst({
    where: { id: themeId, conferenceId: reviewer.conferenceId },
    include: { _count: { select: { submissions: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  if (isImplementationGateEnabled("revisionEvaluationWrites")) {
    await prisma.$transaction(async (tx) => {
      await recordTermState(tx, {
        themeId,
        availability: "RETIRED",
        recordedByRef: reviewer.id,
      });
    });
    return NextResponse.json({ ok: true, softRemoved: true });
  }

  if (existing._count.submissions > 0) {
    await prisma.theme.update({
      where: { id: themeId },
      data: { removedAt: new Date() },
    });
    return NextResponse.json({ ok: true, softRemoved: true });
  }

  await prisma.theme.delete({ where: { id: themeId } });
  return NextResponse.json({ ok: true, softRemoved: false });
}
