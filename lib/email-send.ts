import type { EmailTemplateKey } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendTemplateEmailStub } from "@/lib/email-stub";
import {
  conferenceMergeBase,
  mergeContextForAttendee,
  mergeContextForSubmission,
  renderEmail,
  resolveEmailRecipients,
  type EmailRecipient,
} from "@/lib/email-templates";

export async function sendTemplateBatch(params: {
  conferenceId: string;
  templateKey: EmailTemplateKey;
  round: number;
  sentByReviewerAccessId: string;
  customIntro?: string | null;
  includeAlreadyEmailed?: boolean;
  recipientSubmissionIds?: string[];
  recipientAttendeeIds?: string[];
}): Promise<{ batchId: string; recipientCount: number }> {
  const conference = await prisma.conference.findUniqueOrThrow({
    where: { id: params.conferenceId },
  });
  const template = await prisma.emailTemplate.findUniqueOrThrow({
    where: { templateKey: params.templateKey },
  });

  let recipients = await resolveEmailRecipients(
    conference,
    params.templateKey,
    params.round,
    { includeAlreadyEmailed: params.includeAlreadyEmailed }
  );

  if (params.recipientSubmissionIds?.length) {
    const idSet = new Set(params.recipientSubmissionIds);
    recipients = recipients.filter(
      (r) => r.kind === "submission" && idSet.has(r.submissionId)
    );
  }
  if (params.recipientAttendeeIds?.length) {
    const idSet = new Set(params.recipientAttendeeIds);
    recipients = recipients.filter(
      (r) => r.kind === "attendee" && idSet.has(r.attendeeId)
    );
  }

  if (recipients.length === 0) {
    return { batchId: "", recipientCount: 0 };
  }

  const sentAt = new Date();
  const batch = await prisma.conferenceEmailBatch.create({
    data: {
      conferenceId: params.conferenceId,
      templateKey: params.templateKey,
      round: params.round,
      sentByReviewerAccessId: params.sentByReviewerAccessId,
      recipientCount: recipients.length,
      customIntro: params.customIntro?.trim() || null,
    },
  });

  for (const recipient of recipients) {
    const { subject, body } = renderEmail(
      template,
      recipient.context,
      params.customIntro
    );
    await prisma.emailSendRecord.create({
      data: {
        batchId: batch.id,
        conferenceId: params.conferenceId,
        templateKey: params.templateKey,
        round: params.round,
        submissionId: recipient.kind === "submission" ? recipient.submissionId : null,
        attendeeId: recipient.kind === "attendee" ? recipient.attendeeId : null,
        email: recipient.email,
        sentAt,
      },
    });
    sendTemplateEmailStub({
      to: recipient.email,
      subject,
      body,
      templateKey: params.templateKey,
      round: params.round,
    });
  }

  return { batchId: batch.id, recipientCount: recipients.length };
}

export async function previewTemplateEmail(params: {
  conferenceId: string;
  templateKey: EmailTemplateKey;
  submissionId?: string;
  attendeeId?: string;
  customIntro?: string | null;
}): Promise<{
  subject: string;
  body: string;
  recipientLabel: string;
  recipientEmail: string;
}> {
  const conference = await prisma.conference.findUniqueOrThrow({
    where: { id: params.conferenceId },
  });
  const template = await prisma.emailTemplate.findUniqueOrThrow({
    where: { templateKey: params.templateKey },
  });

  let recipient: EmailRecipient | null = null;

  if (params.attendeeId) {
    const attendee = await prisma.conferenceAttendee.findFirst({
      where: { id: params.attendeeId, conferenceId: params.conferenceId },
    });
    if (attendee) {
      recipient = {
        kind: "attendee",
        attendeeId: attendee.id,
        email: attendee.email,
        label: `${attendee.firstName} ${attendee.lastName}`,
        context: mergeContextForAttendee(conference, attendee),
      };
    }
  } else if (params.submissionId) {
    const submission = await prisma.submission.findFirst({
      where: { id: params.submissionId, conferenceId: params.conferenceId },
    });
    if (submission) {
      recipient = {
        kind: "submission",
        submissionId: submission.id,
        email: submission.email,
        label: `${submission.firstName} ${submission.lastName} — ${submission.title}`,
        context: mergeContextForSubmission(conference, submission),
      };
    }
  }

  if (!recipient) {
    const list = await resolveEmailRecipients(
      conference,
      params.templateKey,
      1,
      { includeAlreadyEmailed: true }
    );
    recipient = list[0] ?? null;
  }

  if (!recipient) {
    const fallback = {
      ...conferenceMergeBase(conference),
      presenterName: "Sample Presenter",
      firstName: "Sample",
      lastName: "Presenter",
      title: "Sample Talk Title",
      presenterPortalUrl: "…",
      attendeeName: "Sample Attendee",
      cancelUrl: "…",
    };
    const rendered = renderEmail(template, fallback, params.customIntro);
    return {
      subject: rendered.subject,
      body: "No eligible recipients found for preview.",
      recipientLabel: "(none)",
      recipientEmail: "",
    };
  }

  const rendered = renderEmail(template, recipient.context, params.customIntro);
  return {
    subject: rendered.subject,
    body: rendered.body,
    recipientLabel: recipient.label,
    recipientEmail: recipient.email,
  };
}
