import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  presenterActorRef,
  recordCanonicalWithdrawal,
} from "@/lib/concept-design/selection-participation-deliverable";
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

  if (isImplementationGateEnabled("selectionParticipationWrites")) {
    const result = await recordCanonicalWithdrawal({
      submissionId: submission.id,
      actorRef: presenterActorRef(submission.id),
    });
    return NextResponse.json({
      ok: true,
      withdrawalId: result.withdrawal.id,
      replayed: result.replayed,
      cleanupPending: result.cleanupPending,
    });
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
