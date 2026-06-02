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
      revisions: { orderBy: { version: "asc" } },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const themeIds = new Set<string>();
  for (const rev of submission.revisions) {
    try {
      const ids = JSON.parse(rev.themeIds) as string[];
      if (Array.isArray(ids)) ids.forEach((id) => themeIds.add(id));
    } catch {
      /* ignore */
    }
  }

  const themes =
    themeIds.size > 0
      ? await prisma.theme.findMany({
          where: { id: { in: [...themeIds] } },
          select: { id: true, name: true },
        })
      : [];
  const themeNamesById = Object.fromEntries(themes.map((t) => [t.id, t.name]));

  const rows = submission.revisions.map((r) => revisionToRow(r, themeNamesById));

  return NextResponse.json({
    submissionId: submission.id,
    currentVersion: submission.abstractVersion,
    abstractReviewStatus: submission.abstractReviewStatus,
    revisions: rows,
    diffs: diffRevisions(rows),
  });
}
