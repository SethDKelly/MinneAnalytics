import type { EmailTemplateKey } from "@prisma/client";
import { NextResponse } from "next/server";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/email-templates";
import {
  DispatchPolicyError,
  resolveCanonicalDispatchRecipients,
} from "@/lib/concept-design/dispatch-authority";
import { hasApplicationCapability } from "@/lib/concept-design/lifecycle-disclosure-policy";
import { getReviewerByToken } from "@/lib/reviewer";

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
  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !hasApplicationCapability(reviewer.role, "DISPATCH_OPERATIONAL")) {
    return NextResponse.json({ error: "Dispatch access required", code: "CAPABILITY_DENIED" }, { status: 403 });
  }

  try {
    const { recipients } = await resolveCanonicalDispatchRecipients({
      conferenceId: reviewer.conferenceId,
      templateKey,
      round,
    });
    return NextResponse.json({
      semantic: {
        purpose: templateKey,
        round,
        recipients: recipients.map((recipient) => ({
          kind: recipient.kind,
          recipientRef:
            recipient.kind === "submission"
              ? `submission:${recipient.submissionId}`
              : `attendee:${recipient.attendeeId}`,
          id: recipient.kind === "submission" ? recipient.submissionId : recipient.attendeeId,
          endpoint: recipient.email,
          label: recipient.label,
        })),
      },
      // Transitional alias for the existing communications client shape.
      recipients: recipients.map((recipient) => ({
        kind: recipient.kind,
        id: recipient.kind === "submission" ? recipient.submissionId : recipient.attendeeId,
        email: recipient.email,
        label: recipient.label,
      })),
    });
  } catch (error) {
    if (error instanceof DispatchPolicyError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    throw error;
  }
}
