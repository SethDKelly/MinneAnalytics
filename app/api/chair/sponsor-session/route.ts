import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import { prisma } from "@/lib/db";
import { canSetSponsorSession, getReviewerByToken } from "@/lib/reviewer";

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const isSponsorSession = Boolean(body.isSponsorSession);

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canSetSponsorSession(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  try {
    await assertConferenceAcceptsMutations(reviewer.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      conferenceId: reviewer.conferenceId,
      programStatus: { not: "WITHDRAWN" },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: { isSponsorSession },
  });

  return NextResponse.json({ ok: true, isSponsorSession: updated.isSponsorSession });
}
