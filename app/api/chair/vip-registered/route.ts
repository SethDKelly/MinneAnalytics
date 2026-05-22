import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canSetVipRegistered, getReviewerByToken } from "@/lib/reviewer";

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const registered = Boolean(body.registered);

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canSetVipRegistered(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      conferenceId: reviewer.conferenceId,
      programStatus: "APPROVED",
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Approved submission not found" }, { status: 404 });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { vipRegistered: registered },
  });

  return NextResponse.json({ ok: true, vipRegistered: registered });
}
