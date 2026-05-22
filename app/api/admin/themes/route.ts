import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canManageThemes, getReviewerByToken } from "@/lib/reviewer";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

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

  const slug = String(body.slug ?? "").trim() || slugify(name);
  const targetMin = Math.max(0, Number(body.targetMin) || 0);
  const targetMax = Math.max(0, Number(body.targetMax) || 0);

  const maxOrder = await prisma.theme.aggregate({
    where: { conferenceId: reviewer.conferenceId },
    _max: { sortOrder: true },
  });

  const theme = await prisma.theme.create({
    data: {
      conferenceId: reviewer.conferenceId,
      name,
      slug,
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

  const theme = await prisma.theme.update({
    where: { id: themeId },
    data: {
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      targetMin:
        body.targetMin !== undefined ? Math.max(0, Number(body.targetMin) || 0) : undefined,
      targetMax:
        body.targetMax !== undefined ? Math.max(0, Number(body.targetMax) || 0) : undefined,
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
  });
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  await prisma.theme.delete({ where: { id: themeId } });
  return NextResponse.json({ ok: true });
}
