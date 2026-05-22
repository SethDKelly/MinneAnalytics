import { NextResponse } from "next/server";
import type { ProgramStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { autoPopulateDemoScores } from "@/lib/demo-scores";
import { emailAbstractApproved } from "@/lib/email-stub";
import { canApprove, canSetProgramStatus, getReviewerByToken } from "@/lib/reviewer";

const ALLOWED: ProgramStatus[] = [
  "APPROVED",
  "DECLINED",
  "BACKUP",
  "PENDING",
];

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const status = body.status as ProgramStatus;

  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canSetProgramStatus(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (status === "APPROVED" && !canApprove(reviewer.role)) {
    return NextResponse.json({ error: "Core approval required" }, { status: 403 });
  }

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, conferenceId: reviewer.conferenceId },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (status === "APPROVED" && !canApprove(reviewer.role)) {
    return NextResponse.json(
      { error: "Only MinneAnalytics board members can approve talks" },
      { status: 403 }
    );
  }

  const fromBackup = submission.programStatus === "BACKUP" && status === "APPROVED";
  const fromPending = submission.programStatus === "PENDING" && status === "APPROVED";

  if (
    status === "APPROVED" &&
    !fromBackup &&
    !fromPending
  ) {
    return NextResponse.json(
      { error: "Can only approve from Pending or Backup" },
      { status: 400 }
    );
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      programStatus: status,
      approvedAt: status === "APPROVED" ? new Date() : null,
      withdrawnAt: null,
    },
  });

  if (status === "APPROVED" || status === "DECLINED") {
    await autoPopulateDemoScores(
      submissionId,
      reviewer.conferenceId,
      status
    );
  }

  if (status === "APPROVED") {
    emailAbstractApproved({
      email: submission.email,
      presenterName: `${submission.firstName} ${submission.lastName}`,
      title: submission.title,
      presenterPortalUrl:
        "Use the presenter portal link from your original submission confirmation email.",
    });
  }

  return NextResponse.json({ ok: true });
}
