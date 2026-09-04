import { NextResponse } from "next/server";
import type { DeckStatus, DeliverableAssessmentDisposition } from "@prisma/client";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import { prisma } from "@/lib/db";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  DeliverableHeadConflictError,
  DeliverableUnavailableError,
  LegacyDeckStatusUnsupportedError,
  projectCurrentDeckStatus,
  recordCanonicalDeckAssessment,
} from "@/lib/concept-design/selection-participation-deliverable";
import { canManageDeck, getReviewerByToken } from "@/lib/reviewer";

const ALLOWED: DeckStatus[] = ["SUBMITTED", "REVIEWED", "APPROVED", "CONCERN"];

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const deckStatus = body.deckStatus as DeckStatus;

  if (!ALLOWED.includes(deckStatus)) {
    return NextResponse.json({ error: "Invalid deck status" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canManageDeck(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertConferenceAcceptsMutations(reviewer.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
  }

  const canonicalWrites = isImplementationGateEnabled("selectionParticipationWrites");
  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      conferenceId: reviewer.conferenceId,
      ...(canonicalWrites ? {} : { programStatus: "APPROVED" as const }),
    },
    include: canonicalWrites
      ? { currentSelectionDecision: true, withdrawal: true }
      : undefined,
  });
  if (!submission) {
    return NextResponse.json({ error: "Approved submission not found" }, { status: 404 });
  }

  if (canonicalWrites) {
    const participation = submission as typeof submission & {
      currentSelectionDecision?: { disposition: string | null } | null;
      withdrawal?: { id: string } | null;
    };
    if (
      participation.currentSelectionDecision?.disposition !== "SELECTED" ||
      participation.withdrawal
    ) {
      return NextResponse.json(
        { error: "Deck review requires current effective participation" },
        { status: 403 }
      );
    }

    if (deckStatus === "REVIEWED") {
      const error = new LegacyDeckStatusUnsupportedError();
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 409 }
      );
    }

    if (deckStatus === "SUBMITTED") {
      const projected = await projectCurrentDeckStatus(submissionId);
      if (!projected) {
        return NextResponse.json({ error: "No deck uploaded yet" }, { status: 400 });
      }
      if (projected !== "SUBMITTED") {
        return NextResponse.json(
          {
            error: "SUBMITTED cannot erase an exact current ArtifactVersion assessment",
            code: "DELIVERABLE_ASSESSMENT_EXISTS",
          },
          { status: 409 }
        );
      }
      await prisma.submission.update({
        where: { id: submissionId },
        data: { deckStatus: "SUBMITTED" },
      });
      return NextResponse.json({ ok: true, replayed: true });
    }

    const disposition: DeliverableAssessmentDisposition =
      deckStatus === "APPROVED" ? "READY" : "CONCERN";
    const headerKey = request.headers.get("Idempotency-Key")?.trim();
    const bodyKey = String(body.commandKey ?? "").trim();

    try {
      const result = await recordCanonicalDeckAssessment({
        conferenceId: reviewer.conferenceId,
        submissionId,
        disposition,
        reviewerRef: `reviewer:${reviewer.id}`,
        detail: body.detail == null ? null : String(body.detail),
        commandKey: headerKey || bodyKey || null,
      });
      return NextResponse.json({
        ok: true,
        assessmentId: result.assessment.id,
        replayed: result.replayed,
      });
    } catch (error) {
      if (
        error instanceof DeliverableHeadConflictError ||
        error instanceof DeliverableUnavailableError
      ) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 409 }
        );
      }
      throw error;
    }
  }

  if (!submission.deckStatus && deckStatus !== "SUBMITTED") {
    return NextResponse.json({ error: "No deck uploaded yet" }, { status: 400 });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { deckStatus },
  });

  return NextResponse.json({ ok: true });
}
