import type { EmailTemplateKey } from "@prisma/client";
import { NextResponse } from "next/server";
import { previewTemplateEmail } from "@/lib/email-send";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/email-templates";
import { canSetProgramStatus, getReviewerByToken } from "@/lib/reviewer";

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params;
  const templateKey = key as EmailTemplateKey;
  if (!EMAIL_TEMPLATE_KEYS.includes(templateKey)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const submissionId = searchParams.get("submissionId") ?? undefined;
  const attendeeId = searchParams.get("attendeeId") ?? undefined;
  const customIntro = searchParams.get("customIntro") ?? undefined;

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canSetProgramStatus(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  const preview = await previewTemplateEmail({
    conferenceId: reviewer.conferenceId,
    templateKey,
    submissionId,
    attendeeId,
    customIntro,
  });

  return NextResponse.json({ preview });
}
