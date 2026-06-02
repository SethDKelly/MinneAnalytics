import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clientIp, checkRateLimit } from "@/lib/rate-limit";
import {
  isBlindReviewEnabled,
  logIdentityReveal,
} from "@/lib/review-blind";
import { canScore, getReviewerByToken } from "@/lib/reviewer";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await context.params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  const ip = clientIp(request);
  const limit = checkRateLimit(`reveal-identity:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limit.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canScore(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      conferenceId: reviewer.conferenceId,
      programStatus: { not: "WITHDRAWN" },
    },
    include: { conference: { select: { blindReviewEnabled: true } } },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isBlindReviewEnabled(submission.conference)) {
    return NextResponse.json({
      identity: {
        firstName: submission.firstName,
        lastName: submission.lastName,
        organization: submission.organization,
        email: submission.email,
      },
    });
  }

  logIdentityReveal(reviewer.id, submission.id);

  return NextResponse.json({
    identity: {
      firstName: submission.firstName,
      lastName: submission.lastName,
      organization: submission.organization,
      email: submission.email,
    },
  });
}
