import { formatThemeDisplayName } from "./themes";
import { prisma } from "./db";
import { getSelectableThemes, getConferenceThemesForAdmin } from "./themes";
import { PROPOSAL_OFFER_WINDOW_KEY } from "./concept-design/lifecycle-disclosure-policy";
import { getSemanticConferenceSubmissions } from "./concept-design/semantic-reads";

export { getSelectableThemes, getConferenceThemesForAdmin };

/** @deprecated Use getSelectableThemes or getConferenceThemesForAdmin */
export async function getConferenceThemes(conferenceId: string) {
  return getSelectableThemes(conferenceId);
}

/** @deprecated First-party consumers should use getSemanticConferenceSubmissions directly. */
export async function getSubmissionsWithThemes(conferenceId: string) {
  return getSemanticConferenceSubmissions(conferenceId);
}

export async function getArchivedConferences() {
  return prisma.conference.findMany({
    where: { archiveRecord: { isNot: null } },
    orderBy: { archiveRecord: { archivedAt: "desc" } },
    include: {
      archiveRecord: true,
      _count: { select: { submissions: true } },
    },
  });
}

export async function getPublicConferences() {
  const conferences = await prisma.conference.findMany({
    where: {
      OR: [{ status: "ACTIVE" }, { archiveRecord: { isNot: null } }],
    },
    orderBy: { name: "asc" },
    include: {
      archiveRecord: true,
      availabilityWindows: {
        where: { opportunityKey: PROPOSAL_OFFER_WINDOW_KEY },
        take: 1,
      },
    },
  });
  return conferences.map((conference) => ({
    id: conference.id,
    slug: conference.slug,
    name: conference.name,
    status: conference.archiveRecord ? ("ARCHIVED" as const) : conference.status,
    archiveRecord: conference.archiveRecord,
    decksPublished: conference.decksPublished,
    submissionsOpen: conference.submissionsOpen,
    submissionsOpenAt: conference.availabilityWindows[0]?.opensAt ?? conference.submissionsOpenAt,
    submissionsCloseAt:
      conference.availabilityWindows[0]?.closesAt ?? conference.submissionsCloseAt,
    timezone: conference.timezone,
    availabilityWindows: conference.availabilityWindows,
  }));
}

export function themeNamesForSubmission(
  themes: { theme: { name: string; removedAt: Date | null } }[]
): string[] {
  return themes.map((theme) => formatThemeDisplayName(theme.theme));
}
