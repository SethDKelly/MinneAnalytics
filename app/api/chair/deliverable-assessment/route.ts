import { NextResponse } from "next/server";
import type { DeliverableAssessmentDisposition } from "@prisma/client";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  ApplicationPolicyError,
  assertLiveOperationalContext,
  hasApplicationCapability,
  reviewerActorRef,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import {
  DeliverableHeadConflictError,
  DeliverableUnavailableError,
  recordCanonicalDeckAssessment,
} from "@/lib/concept-design/selection-participation-deliverable";
import { getReviewerByToken } from "@/lib/reviewer";

const DISPOSITIONS = new Set<DeliverableAssessmentDisposition>(["READY", "CONCERN"]);

export async function POST(request: Request) {
  if (!isImplementationGateEnabled("selectionParticipationWrites")) {
    return NextResponse.json(
      { error: "Canonical Deliverable writes are not enabled", code: "DEPENDENCY_GATE_REQUIRED" },
      { status: 409 }
    );
  }

  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const disposition = String(body.disposition ?? "") as DeliverableAssessmentDisposition;
  if (!DISPOSITIONS.has(disposition)) {
    return NextResponse.json(
      { error: "Assessment must be READY or CONCERN", code: "DELIVERABLE_ASSESSMENT_INVALID" },
      { status: 400 }
    );
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasApplicationCapability(reviewer.role, "REVIEW_DELIVERABLE")) {
    return NextResponse.json(
      { error: "Deliverable review is not permitted", code: "CAPABILITY_DENIED" },
      { status: 403 }
    );
  }
  try {
    assertLiveOperationalContext(reviewer.conference);
  } catch (error) {
    if (error instanceof ApplicationPolicyError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 403 });
    }
    throw error;
  }

  const commandKey =
    request.headers.get("Idempotency-Key")?.trim() ||
    String(body.commandKey ?? "").trim() ||
    null;
  try {
    const result = await recordCanonicalDeckAssessment({
      conferenceId: reviewer.conferenceId,
      submissionId,
      disposition,
      reviewerRef: reviewerActorRef(reviewer.id),
      detail: body.detail == null ? null : String(body.detail),
      commandKey,
    });
    return NextResponse.json({
      ok: true,
      semantic: {
        deliverable: {
          assessmentRef: result.assessment.id,
          disposition: result.assessment.disposition,
          artifactVersionRef: result.assessment.artifactVersionId,
        },
      },
      replayed: result.replayed,
    });
  } catch (error) {
    if (
      error instanceof DeliverableHeadConflictError ||
      error instanceof DeliverableUnavailableError
    ) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    throw error;
  }
}
