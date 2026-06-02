import { NextResponse } from "next/server";
import { buildExportRows } from "@/lib/export-build";
import { submissionsToCsv } from "@/lib/export-csv";
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

  const subs = await prisma.submission.findMany({
    where: { conferenceId: reviewer.conferenceId },
    include: {
      scores: true,
      themes: {
        select: {
          theme: { select: { name: true, source: true, removedAt: true } },
        },
      },
      presenterFeedback: {
        select: {
          kind: true,
          body: true,
          createdAt: true,
          abstractVersion: true,
        },
        orderBy: { createdAt: "asc" },
      },
      emailSendRecords: {
        select: { templateKey: true, round: true, sentAt: true },
        orderBy: { sentAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const accessList = await prisma.reviewerAccess.findMany({
    where: { conferenceId: reviewer.conferenceId },
    select: { id: true, label: true, role: true },
  });
  const labelById = Object.fromEntries(
    accessList.map((a) => [a.id, a.label ?? a.role])
  );

  const rows = buildExportRows(subs, labelById);
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
