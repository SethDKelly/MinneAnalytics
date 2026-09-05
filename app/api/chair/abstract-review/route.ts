import { NextResponse } from "next/server";
import type { AbstractReviewStatus } from "@prisma/client";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import {
  ApplicationPolicyError,
  grantRevisionException,
  hasApplicationCapability,
  revokeRevisionException,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import { prisma } from "@/lib/db";
import { canSetProgramStatus, getReviewerByToken } from "@/lib/reviewer";

const ACTIONS = [
  "acknowledge",
  "clear",
  "request-revision",
  "revoke-revision-exception",
] as const;

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const action = String(body.action ?? "") as (typeof ACTIONS)[number];

  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lifecycleWrites = isImplementationGateEnabled("lifecycleDisclosureWrites");
  if (
    lifecycleWrites &&
    (action === "request-revision" || action === "revoke-revision-exception")
  ) {
    if (!hasApplicationCapability(reviewer.role, "GIVE_FEEDBACK")) {
      return NextResponse.json(
        { error: "Revision exception authority is not available", code: "CAPABILITY_DENIED" },
        { status: 403 }
      );
    }
    if (!isImplementationGateEnabled("revisionEvaluationWrites")) {
      return NextResponse.json(
        {
          error: "Revision exceptions require canonical Revision writes",
          code: "DEPENDENCY_GATE_REQUIRED",
        },
        { status: 409 }
      );
    }

    try {
      if (action === "request-revision") {
        const result = await grantRevisionException({
          conferenceId: reviewer.conferenceId,
          submissionId,
          reviewerAccessId: reviewer.id,
        });
        await prisma.submission.update({
          where: { id: submissionId },
          data: { abstractReviewStatus: "FEEDBACK_PENDING" },
        });
        return NextResponse.json({
          ok: true,
          revisionException: {
            revisionId: result.revisionId,
            grantedAt: result.grantedAt,
          },
          abstractReviewStatus: "FEEDBACK_PENDING",
        });
      }

      await revokeRevisionException({
        conferenceId: reviewer.conferenceId,
        submissionId,
      });
      return NextResponse.json({ ok: true, revisionException: null });
    } catch (error) {
      if (error instanceof ApplicationPolicyError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.code === "SUBMISSION_NOT_FOUND" ? 404 : 409 }
        );
      }
      throw error;
    }
  }

  if (!canSetProgramStatus(reviewer.role)) {
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
  } else if (action === "clear") {
    if (submission.abstractReviewStatus !== "ACKNOWLEDGED") {
      return NextResponse.json(
        { error: "Only acknowledged submissions can be cleared to current" },
        { status: 400 }
      );
    }
    nextStatus = "CURRENT";
  } else {
    return NextResponse.json(
      {
        error: "Revision exceptions require the 004-D policy gate",
        code: "POLICY_GATE_REQUIRED",
      },
      { status: 409 }
    );
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
