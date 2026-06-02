import type { EmailTemplateKey } from "@prisma/client";
import { prisma } from "@/lib/db";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/email-templates";

export type EmailBatchSummary = {
  id: string;
  round: number;
  sentAt: string;
  recipientCount: number;
  sentByLabel: string;
  customIntro: string | null;
};

export type TemplateCommunicationsRow = {
  templateKey: EmailTemplateKey;
  name: string;
  description: string;
  lastBatch: EmailBatchSummary | null;
  batches: EmailBatchSummary[];
  nextDeclineRound: number;
};

export async function getCommunicationsOverview(
  conferenceId: string
): Promise<TemplateCommunicationsRow[]> {
  const [templates, batches, declineMax] = await Promise.all([
    prisma.emailTemplate.findMany({ orderBy: { templateKey: "asc" } }),
    prisma.conferenceEmailBatch.findMany({
      where: { conferenceId },
      include: {
        sentBy: { select: { label: true, role: true } },
      },
      orderBy: { sentAt: "desc" },
    }),
    prisma.conferenceEmailBatch.aggregate({
      where: { conferenceId, templateKey: "DECLINE" },
      _max: { round: true },
    }),
  ]);

  const byKey = new Map<EmailTemplateKey, typeof batches>();
  for (const key of EMAIL_TEMPLATE_KEYS) {
    byKey.set(
      key,
      batches.filter((b) => b.templateKey === key)
    );
  }

  const nextDeclineRound = (declineMax._max.round ?? 0) + 1;

  const templateByKey = Object.fromEntries(templates.map((t) => [t.templateKey, t]));

  return EMAIL_TEMPLATE_KEYS.flatMap((key) => {
    const t = templateByKey[key];
    if (!t) return [];
    const keyBatches = byKey.get(t.templateKey) ?? [];
    const summaries: EmailBatchSummary[] = keyBatches.map((b) => ({
      id: b.id,
      round: b.round,
      sentAt: b.sentAt.toISOString(),
      recipientCount: b.recipientCount,
      sentByLabel: b.sentBy.label ?? b.sentBy.role,
      customIntro: b.customIntro,
    }));
    return [
      {
        templateKey: t.templateKey,
        name: t.name,
        description: t.description,
        lastBatch: summaries[0] ?? null,
        batches: summaries,
        nextDeclineRound,
      },
    ];
  });
}
