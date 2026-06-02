import { NextResponse } from "next/server";
import type { AbstractReviewStatus } from "@prisma/client";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import { prisma } from "@/lib/db";
import { canSetProgramStatus, getReviewerByToken } from "@/lib/reviewer";

const ACTIONS = ["acknowledge", "clear"] as const;

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const action = String(body.action ?? "") as (typeof ACTIONS)[number];

  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canSetProgramStatus(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  try {
    await assertConferenceAcceptsMutations(reviewer.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
  }

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, conferenceId: reviewer.conferenceId },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let nextStatus: AbstractReviewStatus;
  if (action === "acknowledge") {
    if (submission.abstractReviewStatus !== "REVISED") {
      return NextResponse.json(
        { error: "Only revised submissions can be marked reviewed" },
        { status: 400 }
      );
    }
    nextStatus = "ACKNOWLEDGED";
  } else {
    if (submission.abstractReviewStatus !== "ACKNOWLEDGED") {
      return NextResponse.json(
        { error: "Only acknowledged submissions can be cleared to current" },
        { status: 400 }
      );
    }
    nextStatus = "CURRENT";
  }

  const updated = await prisma.submission.update({
    where: { id: submission.id },
    data: {
      abstractReviewStatus: nextStatus,
      abstractVersionAcknowledgedAt:
        action === "acknowledge" ? new Date() : submission.abstractVersionAcknowledgedAt,
    },
  });

  return NextResponse.json({
    ok: true,
    abstractReviewStatus: updated.abstractReviewStatus,
  });
}
