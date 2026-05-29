import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireDirector } from "@/lib/mudac/auth";

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const judgeId = String(body.judgeId ?? "");
  const revoke = body.revoke !== false;

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const judge = await prisma.mudacJudge.findFirst({
    where: { id: judgeId, eventId: director.eventId },
  });
  if (!judge) {
    return NextResponse.json({ error: "Judge not found" }, { status: 404 });
  }

  if (revoke) {
    await prisma.$transaction([
      prisma.mudacPanelAssignment.deleteMany({ where: { judgeId } }),
      prisma.mudacJudge.update({
        where: { id: judgeId },
        data: { revokedAt: new Date() },
      }),
    ]);
  } else {
    await prisma.mudacJudge.update({
      where: { id: judgeId },
      data: { revokedAt: null },
    });
  }

  return NextResponse.json({ ok: true });
}
