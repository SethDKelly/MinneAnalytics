import { NextResponse } from "next/server";
import { buildExportRows } from "@/lib/export-build";
import { submissionsToCsv } from "@/lib/export-csv";
import { getConferenceSubmissions } from "@/lib/conference-data";
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

  const [submissions, accessList, feedbackRows, dispatchRows, conference] =
    await Promise.all([
      getConferenceSubmissions(reviewer.conferenceId),
      prisma.reviewerAccess.findMany({
        where: { conferenceId: reviewer.conferenceId },
        select: { id: true, label: true, role: true },
      }),
      prisma.presenterFeedback.findMany({
        where: { submission: { conferenceId: reviewer.conferenceId } },
        select: {
          submissionId: true,
          kind: true,
          body: true,
          createdAt: true,
          submissionRevisionId: true,
          submissionRevision: { select: { version: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.emailSendRecord.findMany({
        where: {
          conferenceId: reviewer.conferenceId,
          submissionId: { not: null },
        },
        select: {
          submissionId: true,
          templateKey: true,
          round: true,
          sentAt: true,
        },
        orderBy: { sentAt: "asc" },
      }),
      prisma.conference.findUnique({
        where: { id: reviewer.conferenceId },
        select: { slug: true },
      }),
    ]);

  const labelById = Object.fromEntries(
    accessList.map((access) => [access.id, access.label ?? access.role])
  );
  const rows = buildExportRows(
    submissions,
    labelById,
    feedbackRows.map((feedback) => ({
      submissionId: feedback.submissionId,
      kind: feedback.kind,
      body: feedback.body,
      createdAt: feedback.createdAt,
      submissionRevisionId: feedback.submissionRevisionId,
      submissionRevisionVersion: feedback.submissionRevision?.version ?? null,
    })),
    dispatchRows
  );
  const csv = submissionsToCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${
        conference?.slug ?? "conference"
      }-semantic-export.csv"`,
    },
  });
}
