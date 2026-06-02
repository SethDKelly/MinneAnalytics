import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
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

  try {
    await assertConferenceAcceptsMutations(reviewer.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
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

  const version = submission.abstractVersion;

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
      scoredAbstractVersion: version,
    },
    update: {
      value: roundScore(parsed.data.value),
      notes: parsed.data.notes ?? null,
      scoredAbstractVersion: version,
    },
  });

  return NextResponse.json({ ok: true, scoredAbstractVersion: version });
}
