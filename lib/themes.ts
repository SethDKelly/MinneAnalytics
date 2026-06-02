import type { Theme, ThemeSource } from "@prisma/client";
import { prisma } from "@/lib/db";

export function slugifyThemeName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "theme";
}

export function formatThemeDisplayName(theme: { name: string; removedAt: Date | null }): string {
  return theme.removedAt ? `${theme.name} (removed)` : theme.name;
}

export async function getSelectableThemes(conferenceId: string) {
  return prisma.theme.findMany({
    where: { conferenceId, removedAt: null },
    orderBy: [{ source: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getConferenceThemesForAdmin(conferenceId: string) {
  return prisma.theme.findMany({
    where: { conferenceId },
    orderBy: [{ removedAt: "asc" }, { source: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { submissions: true } } },
  });
}

/** Find existing theme by slug (case-insensitive) or create presenter-proposed theme. */
export async function findOrCreatePresenterTheme(params: {
  conferenceId: string;
  name: string;
  proposedBySubmissionId?: string | null;
}): Promise<Theme> {
  const slug = slugifyThemeName(params.name);
  const existing = await prisma.theme.findFirst({
    where: {
      conferenceId: params.conferenceId,
      slug,
    },
  });
  if (existing) {
    if (existing.removedAt) {
      return prisma.theme.update({
        where: { id: existing.id },
        data: {
          removedAt: null,
          name: params.name.trim(),
          proposedAt: new Date(),
          proposedBySubmissionId: params.proposedBySubmissionId ?? existing.proposedBySubmissionId,
        },
      });
    }
    return existing;
  }

  const maxOrder = await prisma.theme.aggregate({
    where: { conferenceId: params.conferenceId },
    _max: { sortOrder: true },
  });

  return prisma.theme.create({
    data: {
      conferenceId: params.conferenceId,
      name: params.name.trim(),
      slug,
      source: "PRESENTER",
      proposedAt: new Date(),
      proposedBySubmissionId: params.proposedBySubmissionId ?? null,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
}

export function themeOptionFromRow(theme: {
  id: string;
  name: string;
  source: ThemeSource;
}) {
  return {
    id: theme.id,
    name: theme.name,
    source: theme.source,
  };
}

export async function resolveThemeIdsForSubmit(
  conferenceId: string,
  themeIds: string[],
  proposedThemeName?: string | null,
  proposedBySubmissionId?: string
): Promise<string[]> {
  const ids = [...themeIds];
  const trimmed = proposedThemeName?.trim();
  if (!trimmed) return ids;

  const theme = await findOrCreatePresenterTheme({
    conferenceId,
    name: trimmed,
    proposedBySubmissionId,
  });

  if (!ids.includes(theme.id)) {
    if (ids.length >= 3) {
      throw new Error("Select at most three themes (including a new proposal)");
    }
    ids.push(theme.id);
  }
  return ids;
}
