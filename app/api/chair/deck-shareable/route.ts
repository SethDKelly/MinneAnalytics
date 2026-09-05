import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import {
  hasApplicationCapability,
  reviewerActorRef,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  PublicationPolicyError,
  recordShareEligibilityChange,
  usesExactPublicationAuthorization,
} from "@/lib/concept-design/publication-public-access";
import { prisma } from "@/lib/db";
import { canSetDeckShareable, getReviewerByToken } from "@/lib/reviewer";

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const shareable = Boolean(body.shareable);

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canonicalWrites =
    isImplementationGateEnabled("publicationWrites") ||
    (await usesExactPublicationAuthorization(reviewer.conferenceId));

  if (canonicalWrites) {
    if (!hasApplicationCapability(reviewer.role, "SET_PUBLIC_SHARING_POLICY")) {
      return NextResponse.json({ error: "Public-sharing capability required" }, { status: 403 });
    }
    try {
      const result = await recordShareEligibilityChange({
        conferenceId: reviewer.conferenceId,
        submissionId,
        eligible: shareable,
        actorRef: reviewerActorRef(reviewer.id),
      });
      return NextResponse.json({
        ok: true,
        shareEligibilityChangeId: result.change?.id ?? null,
        deckShareable: shareable,
        replayed: result.replayed,
        cleanupPending: result.cleanupPending,
      });
    } catch (error) {
      if (error instanceof PublicationPolicyError) {
        const status = error.code.endsWith("NOT_FOUND") ? 404 : 409;
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status }
        );
      }
      throw error;
    }
  }

  if (!canSetDeckShareable(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  try {
    await assertConferenceAcceptsMutations(reviewer.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      conferenceId: reviewer.conferenceId,
      programStatus: "APPROVED",
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Approved submission not found" }, { status: 404 });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { deckShareable: shareable },
  });

  return NextResponse.json({ ok: true, deckShareable: shareable });
}
