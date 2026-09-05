import { NextResponse } from "next/server";
import {
  ApplicationPolicyError,
  hasApplicationCapability,
  revealPresenterIdentity,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
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

  if (isImplementationGateEnabled("lifecycleDisclosureWrites")) {
    if (!hasApplicationCapability(reviewer.role, "RECORD_EVALUATION")) {
      return NextResponse.json(
        { error: "Identity reveal is not permitted", code: "CAPABILITY_DENIED" },
        { status: 403 }
      );
    }

    try {
      const disclosure = await revealPresenterIdentity({
        conferenceId: reviewer.conferenceId,
        reviewerAccessId: reviewer.id,
        submissionId,
      });
      const submission = await prisma.submission.findFirst({
        where: { id: submissionId, conferenceId: reviewer.conferenceId },
      });
      if (!submission) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({
        identity: {
          firstName: submission.firstName,
          lastName: submission.lastName,
          organization: submission.organization,
          email: submission.email,
        },
        disclosureState: disclosure.mode,
      });
    } catch (error) {
      if (error instanceof ApplicationPolicyError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.code === "REVIEW_CONTEXT_NOT_FOUND" ? 404 : 403 }
        );
      }
      throw error;
    }
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
