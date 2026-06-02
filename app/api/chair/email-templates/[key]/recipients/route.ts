import type { EmailTemplateKey } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EMAIL_TEMPLATE_KEYS, resolveEmailRecipients } from "@/lib/email-templates";
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
  const round = Number(searchParams.get("round") ?? "1");
  const includeAlreadyEmailed = searchParams.get("includeAlreadyEmailed") === "1";

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canSetProgramStatus(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  const conference = await prisma.conference.findUniqueOrThrow({
    where: { id: reviewer.conferenceId },
  });

  const recipients = await resolveEmailRecipients(
    conference,
    templateKey,
    round,
    { includeAlreadyEmailed }
  );

  return NextResponse.json({
    recipients: recipients.map((r) => ({
      kind: r.kind,
      id: r.kind === "submission" ? r.submissionId : r.attendeeId,
      email: r.email,
      label: r.label,
    })),
  });
}
