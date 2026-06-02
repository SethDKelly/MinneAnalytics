import { formatThemeDisplayName } from "./themes";
import { prisma } from "./db";
import { getSelectableThemes, getConferenceThemesForAdmin } from "./themes";

export { getSelectableThemes, getConferenceThemesForAdmin };

/** @deprecated Use getSelectableThemes or getConferenceThemesForAdmin */
export async function getConferenceThemes(conferenceId: string) {
  return getSelectableThemes(conferenceId);
}

export async function getSubmissionsWithThemes(conferenceId: string) {
  return prisma.submission.findMany({
    where: { conferenceId },
    include: {
      scores: true,
      themes: {
        select: {
          themeId: true,
          theme: { select: { id: true, name: true, slug: true, removedAt: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getArchivedConferences() {
  return prisma.conference.findMany({
    where: { status: "ARCHIVED" },
    orderBy: { archivedAt: "desc" },
    include: {
      _count: { select: { submissions: true } },
    },
  });
}

export async function getPublicConferences() {
  return prisma.conference.findMany({
    where: { status: { in: ["ACTIVE", "ARCHIVED"] } },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      status: true,
      decksPublished: true,
      submissionsOpen: true,
      submissionsOpenAt: true,
      submissionsCloseAt: true,
      timezone: true,
    },
  });
}

export function themeNamesForSubmission(
  themes: { theme: { name: string; removedAt: Date | null } }[]
): string[] {
  return themes.map((t) => formatThemeDisplayName(t.theme));
}
