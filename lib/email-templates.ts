import type {
  Conference,
  ConferenceAttendee,
  EmailTemplate,
  EmailTemplateKey,
  Submission,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = [
  "CALL_FOR_DECK",
  "DECK_REMINDER",
  "DECLINE",
  "ATTENDEE_REMINDER",
  "CALL_FOR_FEEDBACK",
];

export const TEMPLATE_DESCRIPTIONS: Record<EmailTemplateKey, string> = {
  CALL_FOR_DECK: "Ask approved presenters to upload slide decks.",
  DECK_REMINDER: "Remind approved presenters who have not uploaded or need a deck refresh.",
  DECLINE: "Notify presenters their talk was not accepted (supports multiple rounds).",
  ATTENDEE_REMINDER:
    "Remind registered attendees to cancel if they cannot attend so waitlist can advance.",
  CALL_FOR_FEEDBACK: "Request post-event feedback from approved presenters.",
};

export type MergeContext = Record<string, string>;

export type EmailRecipient =
  | {
      kind: "submission";
      submissionId: string;
      email: string;
      label: string;
      context: MergeContext;
    }
  | {
      kind: "attendee";
      attendeeId: string;
      email: string;
      label: string;
      context: MergeContext;
    };

const DEMO_EVENT_DATE = "September 18–19, 2027";
const DEMO_VENUE = "Minneapolis Convention Center";

export function renderEmailTemplate(
  template: string,
  context: MergeContext
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => context[key] ?? "");
}

export function conferenceMergeBase(conference: Pick<Conference, "name" | "slug">): MergeContext {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return {
    conferenceName: conference.name,
    eventDate: DEMO_EVENT_DATE,
    venue: DEMO_VENUE,
    conferenceUrl: `${siteUrl}/submit/${conference.slug}`,
  };
}

export function mergeContextForSubmission(
  conference: Pick<Conference, "name" | "slug">,
  submission: Pick<
    Submission,
    "firstName" | "lastName" | "title" | "email"
  >,
  extras: MergeContext = {}
): MergeContext {
  const presenterName = `${submission.firstName} ${submission.lastName}`;
  return {
    ...conferenceMergeBase(conference),
    presenterName,
    firstName: submission.firstName,
    lastName: submission.lastName,
    title: submission.title,
    email: submission.email,
    presenterPortalUrl:
      "Use the private presenter link from your original submission confirmation email.",
    declineReason: "",
    ...extras,
  };
}

export function mergeContextForAttendee(
  conference: Pick<Conference, "name" | "slug">,
  attendee: Pick<ConferenceAttendee, "firstName" | "lastName" | "email" | "id">
): MergeContext {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return {
    ...conferenceMergeBase(conference),
    attendeeName: `${attendee.firstName} ${attendee.lastName}`,
    firstName: attendee.firstName,
    lastName: attendee.lastName,
    email: attendee.email,
    cancelUrl: `${siteUrl}/attendee/cancel/${attendee.id}?demo=1`,
  };
}

export async function getSentSubmissionIds(
  conferenceId: string,
  templateKey: EmailTemplateKey,
  round: number
): Promise<Set<string>> {
  const rows = await prisma.emailSendRecord.findMany({
    where: {
      conferenceId,
      templateKey,
      round,
      submissionId: { not: null },
    },
    select: { submissionId: true },
  });
  return new Set(rows.map((r) => r.submissionId!).filter(Boolean));
}

export async function getSentAttendeeIds(
  conferenceId: string,
  templateKey: EmailTemplateKey,
  round: number
): Promise<Set<string>> {
  const rows = await prisma.emailSendRecord.findMany({
    where: {
      conferenceId,
      templateKey,
      round,
      attendeeId: { not: null },
    },
    select: { attendeeId: true },
  });
  return new Set(rows.map((r) => r.attendeeId!).filter(Boolean));
}

export async function getNextDeclineRound(conferenceId: string): Promise<number> {
  const max = await prisma.conferenceEmailBatch.aggregate({
    where: { conferenceId, templateKey: "DECLINE" },
    _max: { round: true },
  });
  return (max._max.round ?? 0) + 1;
}

export async function resolveEmailRecipients(
  conference: Conference,
  templateKey: EmailTemplateKey,
  round: number,
  options: { includeAlreadyEmailed?: boolean } = {}
): Promise<EmailRecipient[]> {
  const includeAlready = options.includeAlreadyEmailed ?? false;
  const sentSubmissions = includeAlready
    ? new Set<string>()
    : await getSentSubmissionIds(conference.id, templateKey, round);
  const sentAttendees = includeAlready
    ? new Set<string>()
    : await getSentAttendeeIds(conference.id, templateKey, round);

  const recipients: EmailRecipient[] = [];

  if (templateKey === "ATTENDEE_REMINDER") {
    const attendees = await prisma.conferenceAttendee.findMany({
      where: { conferenceId: conference.id, cancelledAt: null },
      orderBy: { lastName: "asc" },
    });
    for (const a of attendees) {
      if (sentAttendees.has(a.id)) continue;
      recipients.push({
        kind: "attendee",
        attendeeId: a.id,
        email: a.email,
        label: `${a.firstName} ${a.lastName}`,
        context: mergeContextForAttendee(conference, a),
      });
    }
    return recipients;
  }

  let submissions: Submission[] = [];
  if (templateKey === "CALL_FOR_DECK" || templateKey === "CALL_FOR_FEEDBACK") {
    submissions = await prisma.submission.findMany({
      where: { conferenceId: conference.id, programStatus: "APPROVED" },
    });
  } else if (templateKey === "DECK_REMINDER") {
    submissions = await prisma.submission.findMany({
      where: {
        conferenceId: conference.id,
        programStatus: "APPROVED",
        OR: [{ deckStatus: null }, { deckStatus: "SUBMITTED" }],
      },
    });
  } else if (templateKey === "DECLINE") {
    submissions = await prisma.submission.findMany({
      where: { conferenceId: conference.id, programStatus: "DECLINED" },
    });
  }

  for (const s of submissions) {
    if (sentSubmissions.has(s.id)) continue;
    recipients.push({
      kind: "submission",
      submissionId: s.id,
      email: s.email,
      label: `${s.firstName} ${s.lastName} — ${s.title}`,
      context: mergeContextForSubmission(conference, s),
    });
  }

  return recipients;
}

export function renderEmail(
  template: Pick<EmailTemplate, "subjectTemplate" | "bodyTemplate" | "templateKey">,
  context: MergeContext,
  customIntro?: string | null
): { subject: string; body: string } {
  let bodyTemplate = template.bodyTemplate;
  if (template.templateKey === "DECLINE" && customIntro?.trim()) {
    bodyTemplate = `${customIntro.trim()}\n\n${bodyTemplate}`;
  }
  return {
    subject: renderEmailTemplate(template.subjectTemplate, context),
    body: renderEmailTemplate(bodyTemplate, context),
  };
}

export const DEFAULT_EMAIL_TEMPLATES: Array<{
  templateKey: EmailTemplateKey;
  name: string;
  description: string;
  subjectTemplate: string;
  bodyTemplate: string;
}> = [
  {
    templateKey: "CALL_FOR_DECK",
    name: "Call for deck upload",
    description: TEMPLATE_DESCRIPTIONS.CALL_FOR_DECK,
    subjectTemplate: "Upload your slide deck — {{conferenceName}}",
    bodyTemplate:
      "Hi {{presenterName}},\n\nCongratulations — \"{{title}}\" is on the {{conferenceName}} program. Please upload your slide deck using your presenter portal:\n\n{{presenterPortalUrl}}\n\nEvent: {{eventDate}} at {{venue}}.\n\nThank you,\nMinneAnalytics Program Committee",
  },
  {
    templateKey: "DECK_REMINDER",
    name: "Deck upload reminder",
    description: TEMPLATE_DESCRIPTIONS.DECK_REMINDER,
    subjectTemplate: "Reminder: slide deck needed — {{conferenceName}}",
    bodyTemplate:
      "Hi {{presenterName}},\n\nThis is a friendly reminder to upload (or refresh) your deck for \"{{title}}\" before {{eventDate}}.\n\n{{presenterPortalUrl}}\n\nThank you,\nMinneAnalytics",
  },
  {
    templateKey: "DECLINE",
    name: "Decline — talk not accepted",
    description: TEMPLATE_DESCRIPTIONS.DECLINE,
    subjectTemplate: "Update on your {{conferenceName}} submission",
    bodyTemplate:
      "Hi {{presenterName}},\n\nThank you for submitting \"{{title}}\" to {{conferenceName}}. After committee review we are unable to include this talk in the program this year.\n\nWe encourage you to submit again next year.\n\nThank you,\nMinneAnalytics Program Committee",
  },
  {
    templateKey: "ATTENDEE_REMINDER",
    name: "Attendee reminder",
    description: TEMPLATE_DESCRIPTIONS.ATTENDEE_REMINDER,
    subjectTemplate: "{{conferenceName}} is approaching — confirm your attendance",
    bodyTemplate:
      "Hi {{attendeeName}},\n\n{{conferenceName}} is coming up on {{eventDate}} at {{venue}}.\n\nIf you can no longer attend, please cancel so we can offer your seat to the waitlist:\n\n{{cancelUrl}}\n\nSee you there,\nMinneAnalytics",
  },
  {
    templateKey: "CALL_FOR_FEEDBACK",
    name: "Call for feedback",
    description: TEMPLATE_DESCRIPTIONS.CALL_FOR_FEEDBACK,
    subjectTemplate: "Share your feedback — {{conferenceName}}",
    bodyTemplate:
      "Hi {{presenterName}},\n\nThank you for presenting \"{{title}}\" at {{conferenceName}}. We'd appreciate a few minutes of your feedback on the event:\n\n{{conferenceUrl}}\n\nThank you,\nMinneAnalytics",
  },
];
