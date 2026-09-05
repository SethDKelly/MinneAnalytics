import { createHash } from "node:crypto";
import type { EmailTemplateKey } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendTemplateEmailStub } from "@/lib/email-stub";
import {
  mergeContextForAttendee,
  mergeContextForSubmission,
  renderEmail,
  type EmailRecipient,
} from "@/lib/email-templates";

export class DispatchPolicyError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DispatchPolicyError";
    this.code = code;
  }
}

function semanticRecipientKey(recipient: EmailRecipient): string {
  return recipient.kind === "submission"
    ? `submission:${recipient.submissionId}`
    : `attendee:${recipient.attendeeId}`;
}

function providerAttemptKey(input: {
  conferenceId: string;
  templateKey: EmailTemplateKey;
  round: number;
  recipient: EmailRecipient;
}) {
  const digest = createHash("sha256")
    .update(
      `${input.conferenceId}:${input.templateKey}:${input.round}:${semanticRecipientKey(input.recipient)}`
    )
    .digest("hex");
  return `dispatch_${digest}`;
}

function contentHash(email: string, subject: string, body: string) {
  return createHash("sha256")
    .update(JSON.stringify({ email, subject, body }))
    .digest("hex");
}

function assertDispatchLifecycle(
  conference: { status: "DRAFT" | "ACTIVE" | "ARCHIVED"; archiveRecord: { id: string } | null },
  templateKey: EmailTemplateKey
) {
  const archived = Boolean(conference.archiveRecord) || conference.status === "ARCHIVED";
  if (archived) {
    if (templateKey !== "CALL_FOR_FEEDBACK") {
      throw new DispatchPolicyError(
        "DISPATCH_NOT_POST_CLOSURE_SAFE",
        "This operational message is not permitted after archive closure"
      );
    }
    return;
  }
  if (conference.status !== "ACTIVE") {
    throw new DispatchPolicyError(
      "DISPATCH_CONTEXT_NOT_LIVE",
      "Operational dispatch is unavailable while the conference is in setup"
    );
  }
}

async function sentRecipientSets(
  conferenceId: string,
  templateKey: EmailTemplateKey,
  round: number
) {
  const rows = await prisma.emailSendRecord.findMany({
    where: { conferenceId, templateKey, round },
    select: { submissionId: true, attendeeId: true },
  });
  return {
    submissions: new Set(rows.flatMap((row) => (row.submissionId ? [row.submissionId] : []))),
    attendees: new Set(rows.flatMap((row) => (row.attendeeId ? [row.attendeeId] : []))),
  };
}

export async function resolveCanonicalDispatchRecipients(input: {
  conferenceId: string;
  templateKey: EmailTemplateKey;
  round: number;
}) {
  if (!Number.isInteger(input.round) || input.round < 1) {
    throw new DispatchPolicyError("DISPATCH_ROUND_INVALID", "Dispatch round must be a positive integer");
  }

  const conference = await prisma.conference.findUnique({
    where: { id: input.conferenceId },
    include: { archiveRecord: true },
  });
  if (!conference) {
    throw new DispatchPolicyError("CONTEXT_NOT_FOUND", "Conference not found");
  }
  assertDispatchLifecycle(conference, input.templateKey);

  const sent = await sentRecipientSets(conference.id, input.templateKey, input.round);
  const recipients: EmailRecipient[] = [];

  if (input.templateKey === "ATTENDEE_REMINDER") {
    const attendees = await prisma.conferenceAttendee.findMany({
      where: { conferenceId: conference.id, cancelledAt: null },
      orderBy: { lastName: "asc" },
    });
    for (const attendee of attendees) {
      if (sent.attendees.has(attendee.id)) continue;
      recipients.push({
        kind: "attendee",
        attendeeId: attendee.id,
        email: attendee.email,
        label: `${attendee.firstName} ${attendee.lastName}`,
        context: mergeContextForAttendee(conference, attendee),
      });
    }
    return { conference, recipients };
  }

  const submissions = await prisma.submission.findMany({
    where: { conferenceId: conference.id },
    include: {
      currentSelectionDecision: true,
      withdrawal: true,
      deliverables: {
        where: { kindKey: "deck" },
        include: { currentArtifact: { include: { currentAssessment: true } } },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  for (const submission of submissions) {
    if (sent.submissions.has(submission.id)) continue;
    const disposition = submission.currentSelectionDecision?.disposition ?? null;
    const withdrawn = Boolean(submission.withdrawal);
    let eligible = false;

    if (input.templateKey === "CALL_FOR_DECK" || input.templateKey === "CALL_FOR_FEEDBACK") {
      eligible = disposition === "SELECTED" && !withdrawn;
    } else if (input.templateKey === "DECLINE") {
      eligible = disposition === "NOT_SELECTED" && !withdrawn;
    } else if (input.templateKey === "DECK_REMINDER") {
      const deck = submission.deliverables[0]?.currentArtifact ?? null;
      eligible =
        disposition === "SELECTED" &&
        !withdrawn &&
        (!deck || !deck.currentAssessment);
    }

    if (!eligible) continue;
    recipients.push({
      kind: "submission",
      submissionId: submission.id,
      email: submission.email,
      label: `${submission.firstName} ${submission.lastName} — ${submission.title}`,
      context: mergeContextForSubmission(conference, submission),
    });
  }

  return { conference, recipients };
}

type PreparedMessage = {
  recipient: EmailRecipient;
  providerAttemptKey: string;
  email: string;
  renderedSubject: string;
  renderedBody: string;
  contentHash: string;
};

export async function sendCanonicalTemplateBatch(params: {
  conferenceId: string;
  templateKey: EmailTemplateKey;
  round: number;
  sentByReviewerAccessId: string;
  customIntro?: string | null;
  recipientSubmissionIds?: string[];
  recipientAttendeeIds?: string[];
}): Promise<{
  batchId: string;
  recipientCount: number;
  failedCount: number;
  blockedCount: number;
  replayed: boolean;
}> {
  const { recipients: resolved } = await resolveCanonicalDispatchRecipients({
    conferenceId: params.conferenceId,
    templateKey: params.templateKey,
    round: params.round,
  });
  const template = await prisma.emailTemplate.findUniqueOrThrow({
    where: { templateKey: params.templateKey },
  });

  let recipients = resolved;
  if (params.recipientSubmissionIds?.length) {
    const allowed = new Set(params.recipientSubmissionIds);
    recipients = recipients.filter(
      (recipient) =>
        recipient.kind === "submission" && allowed.has(recipient.submissionId)
    );
  }
  if (params.recipientAttendeeIds?.length) {
    const allowed = new Set(params.recipientAttendeeIds);
    recipients = recipients.filter(
      (recipient) => recipient.kind === "attendee" && allowed.has(recipient.attendeeId)
    );
  }

  if (recipients.length === 0) {
    return {
      batchId: "",
      recipientCount: 0,
      failedCount: 0,
      blockedCount: 0,
      replayed: true,
    };
  }

  const prepared: PreparedMessage[] = recipients.map((recipient) => {
    const rendered = renderEmail(template, recipient.context, params.customIntro);
    return {
      recipient,
      providerAttemptKey: providerAttemptKey({
        conferenceId: params.conferenceId,
        templateKey: params.templateKey,
        round: params.round,
        recipient,
      }),
      email: recipient.email,
      renderedSubject: rendered.subject,
      renderedBody: rendered.body,
      contentHash: contentHash(recipient.email, rendered.subject, rendered.body),
    };
  });

  const existingAttempts = await prisma.dispatchAttempt.findMany({
    where: { providerAttemptKey: { in: prepared.map((message) => message.providerAttemptKey) } },
  });
  const existingByKey = new Map(
    existingAttempts.map((attempt) => [attempt.providerAttemptKey, attempt])
  );
  const newMessages = prepared.filter(
    (message) => !existingByKey.has(message.providerAttemptKey)
  );

  let newBatchId = "";
  if (newMessages.length > 0) {
    newBatchId = await prisma.$transaction(async (tx) => {
      const batch = await tx.conferenceEmailBatch.create({
        data: {
          conferenceId: params.conferenceId,
          templateKey: params.templateKey,
          round: params.round,
          sentByReviewerAccessId: params.sentByReviewerAccessId,
          recipientCount: 0,
          customIntro: params.customIntro?.trim() || null,
        },
      });
      for (const message of newMessages) {
        await tx.dispatchAttempt.create({
          data: {
            batchId: batch.id,
            conferenceId: params.conferenceId,
            templateKey: params.templateKey,
            round: params.round,
            submissionId:
              message.recipient.kind === "submission"
                ? message.recipient.submissionId
                : null,
            attendeeId:
              message.recipient.kind === "attendee" ? message.recipient.attendeeId : null,
            email: message.email,
            renderedSubject: message.renderedSubject,
            renderedBody: message.renderedBody,
            contentHash: message.contentHash,
            providerAttemptKey: message.providerAttemptKey,
            state: "PREPARED",
          },
        });
      }
      return batch.id;
    });
  }

  const attempts = await prisma.dispatchAttempt.findMany({
    where: { providerAttemptKey: { in: prepared.map((message) => message.providerAttemptKey) } },
    orderBy: { createdAt: "asc" },
  });

  let recipientCount = 0;
  let failedCount = 0;
  let blockedCount = 0;
  let replayed = newMessages.length === 0;

  for (const attempt of attempts) {
    if (attempt.state === "SUCCEEDED") {
      replayed = true;
      continue;
    }
    if (attempt.state === "UNCERTAIN" || attempt.state === "BLOCKED") {
      blockedCount += 1;
      continue;
    }

    try {
      sendTemplateEmailStub({
        to: attempt.email,
        subject: attempt.renderedSubject,
        body: attempt.renderedBody,
        templateKey: attempt.templateKey,
        round: attempt.round,
      });
    } catch (error) {
      failedCount += 1;
      await prisma.dispatchAttempt.update({
        where: { id: attempt.id },
        data: {
          state: "FAILED",
          lastError: error instanceof Error ? error.message : "Provider handoff failed",
        },
      });
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.dispatchAttempt.findUnique({ where: { id: attempt.id } });
      if (!current || current.state === "SUCCEEDED") return;
      if (current.state === "UNCERTAIN" || current.state === "BLOCKED") {
        throw new DispatchPolicyError(
          "DISPATCH_OUTCOME_UNCERTAIN",
          "An uncertain provider outcome must be reconciled before retry"
        );
      }

      const alreadySent = current.submissionId
        ? await tx.emailSendRecord.findFirst({
            where: {
              conferenceId: current.conferenceId,
              templateKey: current.templateKey,
              round: current.round,
              submissionId: current.submissionId,
            },
          })
        : await tx.emailSendRecord.findFirst({
            where: {
              conferenceId: current.conferenceId,
              templateKey: current.templateKey,
              round: current.round,
              attendeeId: current.attendeeId,
            },
          });

      const record =
        alreadySent ??
        (await tx.emailSendRecord.create({
          data: {
            batchId: current.batchId,
            conferenceId: current.conferenceId,
            templateKey: current.templateKey,
            round: current.round,
            submissionId: current.submissionId,
            attendeeId: current.attendeeId,
            email: current.email,
            renderedSubject: current.renderedSubject,
            renderedBody: current.renderedBody,
            contentHash: current.contentHash,
            sentAt: new Date(),
          },
        }));

      await tx.dispatchAttempt.update({
        where: { id: current.id },
        data: {
          state: "SUCCEEDED",
          lastError: null,
          sendRecordId: record.id,
          resolvedAt: new Date(),
        },
      });
      const count = await tx.emailSendRecord.count({ where: { batchId: current.batchId } });
      await tx.conferenceEmailBatch.update({
        where: { id: current.batchId },
        data: { recipientCount: count },
      });
    });
    recipientCount += 1;
  }

  const batchId =
    newBatchId || attempts[0]?.batchId || "";
  return { batchId, recipientCount, failedCount, blockedCount, replayed };
}
