import { NextResponse } from "next/server";
import { getConferenceSubmissions } from "@/lib/conference-data";
import {
  buildScoresSummary,
  degreesDisplay,
  submissionsToCsv,
  type ExportRow,
} from "@/lib/export-csv";
import { aggregateScores } from "@/lib/scoring";
import { canExportCsv, getReviewerByToken } from "@/lib/reviewer";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canExportCsv(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subs = await getConferenceSubmissions(reviewer.conferenceId);
  const accessList = await prisma.reviewerAccess.findMany({
    where: { conferenceId: reviewer.conferenceId },
    select: { id: true, label: true, role: true },
  });
  const labelById = Object.fromEntries(
    accessList.map((a) => [a.id, a.label ?? a.role])
  );

  const rows: ExportRow[] = subs.map((s) => {
    const agg = aggregateScores(s.scores.map((sc) => sc.value));
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
      technicalLevel: s.technicalLevel,
      aggregateAverage: agg.average,
      aggregateCount: agg.count,
      degrees: degreesDisplay(s.degrees),
      createdAt: s.createdAt.toISOString(),
      scoresSummary: buildScoresSummary(
        s.scores.map((sc) => ({
          label: labelById[sc.reviewerAccessId] ?? "Reviewer",
          value: sc.value,
          notes: sc.notes,
        }))
      ),
    };
  });

  const csv = submissionsToCsv(rows);
  const conference = await prisma.conference.findUnique({
    where: { id: reviewer.conferenceId },
    select: { slug: true },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${conference?.slug ?? "conference"}-submissions.csv"`,
    },
  });
}
