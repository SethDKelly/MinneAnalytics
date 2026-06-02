import type { EmailTemplateKey, ProgramStatus, ThemeSource } from "@prisma/client";
import { formatThemeDisplayName } from "@/lib/themes";
import {
  buildScoresSummary,
  degreesDisplay,
  type ExportRow,
} from "@/lib/export-csv";
import { aggregateCurrentVersion } from "@/lib/rescoring";

type ThemeJoin = {
  theme: { name: string; source: ThemeSource; removedAt: Date | null };
};

type ScoreRow = {
  value: number;
  notes: string | null;
  scoredAbstractVersion: number | null;
  reviewerAccessId: string;
};

type FeedbackRow = {
  kind: string;
  body: string;
  createdAt: Date;
  abstractVersion: number | null;
};

type EmailSendRow = {
  templateKey: EmailTemplateKey;
  round: number;
  sentAt: Date;
};

export type SubmissionForExport = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  programStatus: ProgramStatus;
  deckStatus: string | null;
  deckShareable: boolean;
  vipRegistered: boolean;
  isSponsorSession: boolean;
  technicalLevel: number;
  abstractVersion: number;
  abstractReviewStatus: string;
  degrees: string;
  createdAt: Date;
  scores: ScoreRow[];
  themes: ThemeJoin[];
  presenterFeedback: FeedbackRow[];
  emailSendRecords: EmailSendRow[];
};

export function buildExportRows(
  submissions: SubmissionForExport[],
  labelById: Record<string, string>
): ExportRow[] {
  return submissions.map((s) => {
    const agg = aggregateCurrentVersion(
      s.scores,
      s.abstractVersion
    );
    const themeNames = s.themes.map((t) => formatThemeDisplayName(t.theme));
    const themeSources = s.themes.map((t) => t.theme.source).join("; ");

    const feedbackSummary =
      s.presenterFeedback.length === 0
        ? ""
        : s.presenterFeedback
            .map((f) => {
              const tag =
                f.kind === "ABSTRACT" && f.abstractVersion != null
                  ? `v${f.abstractVersion}`
                  : f.kind;
              const excerpt =
                f.body.length > 80 ? `${f.body.slice(0, 80)}…` : f.body;
              return `${tag}: ${excerpt}`;
            })
            .join(" | ");

    const emailSendsSummary =
      s.emailSendRecords.length === 0
        ? ""
        : s.emailSendRecords
            .map(
              (e) =>
                `${e.templateKey} r${e.round} (${e.sentAt.toISOString().slice(0, 10)})`
            )
            .join(" | ");

    return {
      id: s.id,
      title: s.title,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      organization: s.organization,
      programStatus: s.programStatus,
      deckStatus: s.deckStatus,
      deckShareable: s.deckShareable,
      vipRegistered: s.vipRegistered,
      isSponsorSession: s.isSponsorSession,
      technicalLevel: s.technicalLevel,
      abstractVersion: s.abstractVersion,
      abstractReviewStatus: s.abstractReviewStatus,
      aggregateAverage: agg.average,
      aggregateCount: agg.count,
      degrees: degreesDisplay(s.degrees),
      themeNames: themeNames.join("; "),
      themeSources,
      feedbackCount: s.presenterFeedback.length,
      feedbackSummary,
      emailSendsSummary,
      createdAt: s.createdAt.toISOString(),
      scoresSummary: buildScoresSummary(
        s.scores.map((sc) => ({
          label: labelById[sc.reviewerAccessId] ?? "Reviewer",
          value: sc.value,
          notes: sc.notes,
          scoredAbstractVersion: sc.scoredAbstractVersion,
          abstractVersion: s.abstractVersion,
        }))
      ),
    };
  });
}
