import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getJudgeByToken } from "@/lib/mudac/auth";
import {
  canJudgeSubmitScores,
  computeJudgeSubtotal,
  validateCriterionValue,
} from "@/lib/mudac/scoring";
import { mudacScorecardSchema } from "@/lib/mudac/validation";
import { clientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limit = checkRateLimit(`mudac-score:${ip}`);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${limit.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = mudacScorecardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join("; ") },
        { status: 400 }
      );
    }

    const { token, presentationId, scores, notes, submit } = parsed.data;

    const judge = await getJudgeByToken(token);
    if (!judge) {
      return NextResponse.json({ error: "Invalid judge token" }, { status: 403 });
    }

    const scoring = canJudgeSubmitScores(judge.event);
    if (!scoring.ok) {
      return NextResponse.json({ error: scoring.message }, { status: 403 });
    }

    const presentation = await prisma.mudacPresentation.findFirst({
      where: {
        id: presentationId,
        eventId: judge.eventId,
        panel: { assignments: { some: { judgeId: judge.id } } },
      },
    });
    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    const criteria = await prisma.mudacScoringCriterion.findMany({
      where: { eventId: judge.eventId },
      orderBy: { sortOrder: "asc" },
    });

    if (scores.length !== criteria.length) {
      return NextResponse.json(
        { error: `Provide a score for all ${criteria.length} criteria` },
        { status: 400 }
      );
    }

    const criterionById = new Map(criteria.map((c) => [c.id, c]));
    const validated: Array<{ criterionId: string; value: number; weight: number }> = [];

    for (const row of scores) {
      const criterion = criterionById.get(row.criterionId);
      if (!criterion) {
        return NextResponse.json({ error: "Unknown criterion" }, { status: 400 });
      }
      const check = validateCriterionValue(row.value, criterion.maxPoints);
      if (!check.ok) {
        return NextResponse.json({ error: check.message }, { status: 400 });
      }
      validated.push({
        criterionId: criterion.id,
        value: row.value,
        weight: criterion.weight,
      });
    }

    const subtotal = computeJudgeSubtotal(validated);

    const existing = await prisma.mudacJudgeScorecard.findUnique({
      where: {
        presentationId_judgeId: {
          presentationId,
          judgeId: judge.id,
        },
      },
    });

    const scorecard = await prisma.$transaction(async (tx) => {
      const card =
        existing ??
        (await tx.mudacJudgeScorecard.create({
          data: {
            presentationId,
            judgeId: judge.id,
          },
        }));

      for (const row of validated) {
        await tx.mudacCriterionScore.upsert({
          where: {
            scorecardId_criterionId: {
              scorecardId: card.id,
              criterionId: row.criterionId,
            },
          },
          create: {
            scorecardId: card.id,
            criterionId: row.criterionId,
            value: row.value,
          },
          update: { value: row.value },
        });
      }

      const updateData: { notes?: string | null; submittedAt?: Date | null } = {};
      if (notes !== undefined) updateData.notes = notes || null;
      if (submit === true) updateData.submittedAt = new Date();
      if (submit === false) updateData.submittedAt = null;

      return tx.mudacJudgeScorecard.update({
        where: { id: card.id },
        data: updateData,
        include: {
          scores: { include: { criterion: true } },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      scorecard,
      subtotal,
      submitted: Boolean(scorecard.submittedAt),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save scorecard" }, { status: 500 });
  }
}
