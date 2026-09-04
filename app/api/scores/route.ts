import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import {
  CanonicalRevisionUnavailableError,
  recordCanonicalEvaluation,
} from "@/lib/concept-design/revision-evaluation";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
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

  const value = roundScore(parsed.data.value);
  const notes = parsed.data.notes ?? null;

  if (isImplementationGateEnabled("revisionEvaluationWrites")) {
    try {
      const result = await recordCanonicalEvaluation({
        submissionId: submission.id,
        reviewerAccessId: reviewer.id,
        value,
        notes,
      });
      return NextResponse.json({
        ok: true,
        evaluationId: result.evaluation.id,
        submissionRevisionId: result.revisionId,
        scoredAbstractVersion: result.revisionVersion,
      });
    } catch (error) {
      if (error instanceof CanonicalRevisionUnavailableError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 409 }
        );
      }
      throw error;
    }
  }

  const legacyRows = await prisma.score.findMany({
    where: {
      submissionId: submission.id,
      reviewerAccessId: reviewer.id,
    },
    orderBy: { updatedAt: "desc" },
    take: 2,
  });
  if (
    legacyRows.length > 1 ||
    legacyRows.some((row) => row.submissionRevisionId || row.exactEvaluationKey)
  ) {
    return NextResponse.json(
      {
        error: "Canonical Evaluation history exists; legacy score authority cannot be restored",
        code: "CANONICAL_EVALUATION_ROLLBACK_FLOOR",
      },
      { status: 409 }
    );
  }

  const version = submission.abstractVersion;
  if (legacyRows[0]) {
    await prisma.score.update({
      where: { id: legacyRows[0].id },
      data: {
        value,
        notes,
        scoredAbstractVersion: version,
      },
    });
  } else {
    await prisma.score.create({
      data: {
        submissionId: submission.id,
        reviewerAccessId: reviewer.id,
        value,
        notes,
        scoredAbstractVersion: version,
      },
    });
  }

  return NextResponse.json({ ok: true, scoredAbstractVersion: version });
}
