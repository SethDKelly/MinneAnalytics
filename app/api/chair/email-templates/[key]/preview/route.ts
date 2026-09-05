import type { EmailTemplateKey } from "@prisma/client";
import { NextResponse } from "next/server";
import { EMAIL_TEMPLATE_KEYS, renderEmail } from "@/lib/email-templates";
import {
  DispatchPolicyError,
  resolveCanonicalDispatchRecipients,
} from "@/lib/concept-design/dispatch-authority";
import { hasApplicationCapability } from "@/lib/concept-design/lifecycle-disclosure-policy";
import { getReviewerByToken } from "@/lib/reviewer";
import { prisma } from "@/lib/db";

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
  const customIntro = searchParams.get("customIntro") ?? undefined;
  const round = Math.max(1, Number(searchParams.get("round") ?? "1") || 1);
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !hasApplicationCapability(reviewer.role, "DISPATCH_OPERATIONAL")) {
    return NextResponse.json(
      { error: "Dispatch access required", code: "CAPABILITY_DENIED" },
      { status: 403 }
    );
  }

  try {
    const [{ recipients }, template] = await Promise.all([
      resolveCanonicalDispatchRecipients({
        conferenceId: reviewer.conferenceId,
        templateKey,
        round,
      }),
      prisma.emailTemplate.findUniqueOrThrow({ where: { templateKey } }),
    ]);
    const recipient = recipients[0] ?? null;
    if (!recipient) {
      return NextResponse.json({
        preview: {
          subject: "",
          body: "No semantically eligible recipients exist in this round.",
          recipientLabel: "(none)",
          recipientEmail: "",
        },
      });
    }
    const rendered = renderEmail(template, recipient.context, customIntro);
    return NextResponse.json({
      preview: {
        subject: rendered.subject,
        body: rendered.body,
        recipientLabel: recipient.label,
        recipientEmail: recipient.email,
      },
      semantic: {
        purpose: templateKey,
        round,
        recipientRef:
          recipient.kind === "submission"
            ? `submission:${recipient.submissionId}`
            : `attendee:${recipient.attendeeId}`,
      },
    });
  } catch (error) {
    if (error instanceof DispatchPolicyError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    throw error;
  }
}
