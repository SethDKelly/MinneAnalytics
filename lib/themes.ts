import type { Theme, ThemeSource } from "@prisma/client";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  establishInitialTermState,
  recordTermState,
} from "@/lib/concept-design/vocabulary";
import { prisma } from "@/lib/db";

export function slugifyThemeName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "theme";
}

export function formatThemeDisplayName(theme: {
  name: string;
  removedAt: Date | null;
  currentTermState?: { label: string; availability: "AVAILABLE" | "RETIRED" } | null;
}): string {
  const label = theme.currentTermState?.label ?? theme.name;
  const retired = theme.currentTermState
    ? theme.currentTermState.availability === "RETIRED"
    : Boolean(theme.removedAt);
  return retired ? `${label} (removed)` : label;
}

export async function getSelectableThemes(conferenceId: string) {
  const semanticReads = isImplementationGateEnabled("semanticReads");
  return prisma.theme.findMany({
    where: semanticReads
      ? {
          conferenceId,
          currentTermState: { is: { availability: "AVAILABLE" } },
        }
      : { conferenceId, removedAt: null },
    orderBy: [{ source: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: semanticReads ? { currentTermState: true } : undefined,
  });
}

export async function getConferenceThemesForAdmin(conferenceId: string) {
  const semanticReads = isImplementationGateEnabled("semanticReads");
  if (!semanticReads) {
    return prisma.theme.findMany({
      where: { conferenceId },
      orderBy: [{ removedAt: "asc" }, { source: "asc" }, { sortOrder: "asc" }],
      include: { _count: { select: { submissions: true } } },
    });
  }

  const themes = await prisma.theme.findMany({
    where: { conferenceId },
    orderBy: [{ source: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: {
      currentTermState: true,
      _count: { select: { submissions: true } },
    },
  });
  return themes.sort((a, b) => {
    const aRetired = a.currentTermState?.availability === "RETIRED" ? 1 : 0;
    const bRetired = b.currentTermState?.availability === "RETIRED" ? 1 : 0;
    return aRetired - bRetired || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
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
    include: { currentTermState: true },
  });
  const canonicalWrites = isImplementationGateEnabled("revisionEvaluationWrites");

  if (existing) {
    const retired = canonicalWrites
      ? existing.currentTermState?.availability === "RETIRED"
      : Boolean(existing.removedAt);
    if (retired) {
      if (canonicalWrites) {
        return prisma.$transaction(async (tx) => {
          await tx.theme.update({
            where: { id: existing.id },
            data: {
              proposedAt: new Date(),
              proposedBySubmissionId:
                params.proposedBySubmissionId ?? existing.proposedBySubmissionId,
            },
          });
          if (!existing.currentTermState) {
            await establishInitialTermState(tx, {
              themeId: existing.id,
              label: existing.name,
              availability: existing.removedAt ? "RETIRED" : "AVAILABLE",
              recordedByRef: params.proposedBySubmissionId ?? null,
              provenance: "BACKFILLED_CURRENT_STATE",
              observedAt: new Date(),
            });
          }
          await recordTermState(tx, {
            themeId: existing.id,
            label: params.name.trim(),
            availability: "AVAILABLE",
            recordedByRef: params.proposedBySubmissionId ?? null,
          });
          return tx.theme.findUniqueOrThrow({ where: { id: existing.id } });
        });
      }
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

  if (canonicalWrites) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.theme.create({
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
      await establishInitialTermState(tx, {
        themeId: created.id,
        label: created.name,
        recordedByRef: params.proposedBySubmissionId ?? null,
      });
      return tx.theme.findUniqueOrThrow({ where: { id: created.id } });
    });
  }

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
  currentTermState?: { label: string } | null;
}) {
  return {
    id: theme.id,
    name: theme.currentTermState?.label ?? theme.name,
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
