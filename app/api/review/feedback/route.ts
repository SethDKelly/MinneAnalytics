import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import { prisma } from "@/lib/db";
import { emailPresenterFeedback } from "@/lib/email-stub";
import { canScore, getReviewerByToken } from "@/lib/reviewer";
import { presenterFeedbackSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = presenterFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join("; ") },
      { status: 400 }
    );
  }

  const reviewer = await getReviewerByToken(parsed.data.token);
  if (!reviewer || !canScore(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertConferenceAcceptsMutations(reviewer.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: parsed.data.submissionId,
      conferenceId: reviewer.conferenceId,
      programStatus: { not: "WITHDRAWN" },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const exactWrites = isImplementationGateEnabled("revisionEvaluationWrites");
  const isAbstract = parsed.data.kind === "ABSTRACT";
  if (exactWrites && isAbstract && !submission.currentRevisionId) {
    return NextResponse.json(
      {
        error: "An exact current revision is required for abstract feedback",
        code: "CANONICAL_REVISION_REQUIRED",
      },
      { status: 409 }
    );
  }

  const abstractVersion = isAbstract ? submission.abstractVersion : null;
  const submissionRevisionId =
    exactWrites && isAbstract ? submission.currentRevisionId : null;

  const feedback = await prisma.$transaction(async (tx) => {
    const row = await tx.presenterFeedback.create({
      data: {
        submissionId: submission.id,
        reviewerAccessId: reviewer.id,
        kind: parsed.data.kind,
        body: parsed.data.body.trim(),
        abstractVersion,
        submissionRevisionId,
      },
    });

    if (
      submission.abstractReviewStatus !== "REVISED" &&
      submission.abstractReviewStatus !== "ACKNOWLEDGED"
    ) {
      await tx.submission.update({
        where: { id: submission.id },
        data: { abstractReviewStatus: "FEEDBACK_PENDING" },
      });
    }

    return row;
  });

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  emailPresenterFeedback({
    email: submission.email,
    presenterName: submission.firstName,
    title: submission.title,
    presenterPortalUrl: `${base}/presenter/ (use your private link from submission confirmation)`,
    kind: parsed.data.kind,
  });

  const nextStatus =
    submission.abstractReviewStatus === "REVISED" ||
    submission.abstractReviewStatus === "ACKNOWLEDGED"
      ? submission.abstractReviewStatus
      : "FEEDBACK_PENDING";

  return NextResponse.json({
    ok: true,
    feedbackId: feedback.id,
    submissionRevisionId: feedback.submissionRevisionId,
    abstractReviewStatus: nextStatus,
  });
}
