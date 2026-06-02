import type { EmailTemplateKey } from "@prisma/client";
import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
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
  if (!reviewer || !canSetProgramStatus(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  try {
    await assertConferenceAcceptsMutations(reviewer.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
  }

  let round = typeof body.round === "number" ? body.round : 1;
  if (templateKey === "DECLINE" && body.round == null) {
    round = await getNextDeclineRound(reviewer.conferenceId);
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
