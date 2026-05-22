import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const submission = await prisma.submission.findUnique({
    where: { presenterTokenHash: hashToken(token) },
  });
  if (!submission) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (submission.programStatus === "WITHDRAWN") {
    return NextResponse.json({ ok: true });
  }

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      programStatus: "WITHDRAWN",
      withdrawnAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
