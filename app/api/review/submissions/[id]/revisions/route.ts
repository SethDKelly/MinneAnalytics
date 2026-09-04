import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  diffRevisions,
  revisionToRow,
} from "@/lib/revision-history";
import { canScore, getReviewerByToken } from "@/lib/reviewer";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await context.params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canScore(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      conferenceId: reviewer.conferenceId,
      programStatus: { not: "WITHDRAWN" },
    },
    select: {
      id: true,
      abstractVersion: true,
      abstractReviewStatus: true,
      lastPresenterEditAt: true,
      revisions: {
        orderBy: { version: "asc" },
        include: {
          revisionTerms: {
            include: { theme: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const legacyThemeIds = new Set<string>();
  for (const revision of submission.revisions) {
    if (revision.revisionTerms.length > 0) continue;
    try {
      const ids = JSON.parse(revision.themeIds) as string[];
      if (Array.isArray(ids)) ids.forEach((id) => legacyThemeIds.add(id));
    } catch {
      /* unresolved legacy snapshot remains empty in this view */
    }
  }

  const legacyThemes =
    legacyThemeIds.size > 0
      ? await prisma.theme.findMany({
          where: { id: { in: [...legacyThemeIds] } },
          select: { id: true, name: true },
        })
      : [];
  const themeNamesById = Object.fromEntries(
    legacyThemes.map((theme) => [theme.id, theme.name])
  );

  const rows = submission.revisions.map((revision) => {
    const exactNamesById = Object.fromEntries(
      revision.revisionTerms.map(({ theme }) => [theme.id, theme.name])
    );
    return revisionToRow(
      revision,
      revision.revisionTerms.length > 0 ? exactNamesById : themeNamesById
    );
  });

  return NextResponse.json({
    submissionId: submission.id,
    currentVersion: submission.abstractVersion,
    abstractReviewStatus: submission.abstractReviewStatus,
    revisions: rows,
    diffs: diffRevisions(rows),
  });
}
