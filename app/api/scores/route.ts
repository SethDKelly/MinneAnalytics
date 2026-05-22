import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canScore, getReviewerByToken } from "@/lib/reviewer";
import { roundScore } from "@/lib/scoring-scale";
import { scoreSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const parsed = scoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canScore(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: parsed.data.submissionId,
      conferenceId: reviewer.conferenceId,
      programStatus: { not: "WITHDRAWN" },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  await prisma.score.upsert({
    where: {
      submissionId_reviewerAccessId: {
        submissionId: parsed.data.submissionId,
        reviewerAccessId: reviewer.id,
      },
    },
    create: {
      submissionId: parsed.data.submissionId,
      reviewerAccessId: reviewer.id,
      value: roundScore(parsed.data.value),
      notes: parsed.data.notes ?? null,
    },
    update: {
      value: roundScore(parsed.data.value),
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
