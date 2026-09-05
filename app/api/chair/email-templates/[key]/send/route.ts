import type { EmailTemplateKey } from "@prisma/client";
import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import {
  DispatchPolicyError,
  sendCanonicalTemplateBatch,
} from "@/lib/concept-design/dispatch-authority";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import { hasApplicationCapability } from "@/lib/concept-design/lifecycle-disclosure-policy";
import { sendTemplateBatch } from "@/lib/email-send";
import { EMAIL_TEMPLATE_KEYS, getNextDeclineRound } from "@/lib/email-templates";
import { canSetProgramStatus, getReviewerByToken } from "@/lib/reviewer";

export async function POST(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params;
  const templateKey = key as EmailTemplateKey;
  if (!EMAIL_TEMPLATE_KEYS.includes(templateKey)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  const body = await request.json();
  const token = String(body.token ?? "");

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let round = typeof body.round === "number" ? body.round : 1;
  if (templateKey === "DECLINE" && body.round == null) {
    round = await getNextDeclineRound(reviewer.conferenceId);
  }

  if (isImplementationGateEnabled("dispatchWrites")) {
    if (!hasApplicationCapability(reviewer.role, "DISPATCH_OPERATIONAL")) {
      return NextResponse.json({ error: "Dispatch capability required" }, { status: 403 });
    }
    if (body.includeAlreadyEmailed) {
      return NextResponse.json(
        {
          error: "Intentional repeat contact requires a new dispatch round",
          code: "DISPATCH_NEW_ROUND_REQUIRED",
        },
        { status: 409 }
      );
    }

    try {
      const result = await sendCanonicalTemplateBatch({
        conferenceId: reviewer.conferenceId,
        templateKey,
        round,
        sentByReviewerAccessId: reviewer.id,
        customIntro: body.customIntro ?? null,
        recipientSubmissionIds: Array.isArray(body.recipientSubmissionIds)
          ? body.recipientSubmissionIds.map(String)
          : undefined,
        recipientAttendeeIds: Array.isArray(body.recipientAttendeeIds)
          ? body.recipientAttendeeIds.map(String)
          : undefined,
      });

      if (result.blockedCount > 0 && result.recipientCount === 0) {
        return NextResponse.json(
          {
            error: "One or more provider outcomes are uncertain and require reconciliation",
            code: "DISPATCH_OUTCOME_UNCERTAIN",
            ...result,
            round,
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        ok: result.failedCount === 0 && result.blockedCount === 0,
        ...result,
        round,
      });
    } catch (error) {
      if (error instanceof DispatchPolicyError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 409 }
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

  const result = await sendTemplateBatch({
    conferenceId: reviewer.conferenceId,
    templateKey,
    round,
    sentByReviewerAccessId: reviewer.id,
    customIntro: body.customIntro ?? null,
    includeAlreadyEmailed: Boolean(body.includeAlreadyEmailed),
    recipientSubmissionIds: Array.isArray(body.recipientSubmissionIds)
      ? body.recipientSubmissionIds.map(String)
      : undefined,
    recipientAttendeeIds: Array.isArray(body.recipientAttendeeIds)
      ? body.recipientAttendeeIds.map(String)
      : undefined,
  });

  if (result.recipientCount === 0) {
    return NextResponse.json(
      { error: "No eligible recipients for this send" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    batchId: result.batchId,
    recipientCount: result.recipientCount,
    round,
  });
}
