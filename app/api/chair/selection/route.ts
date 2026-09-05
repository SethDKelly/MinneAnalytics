import { NextResponse } from "next/server";
import type { SelectionDisposition } from "@prisma/client";
import { themeSelectionCoverageAdvisory } from "@/lib/concept-design/coverage-targets";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  ApplicationPolicyError,
  assertLiveOperationalContext,
  hasApplicationCapability,
  reviewerActorRef,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import {
  CapacityConfigurationError,
  CapacityUnavailableError,
  recordCanonicalSelection,
  SelectionHeadConflictError,
} from "@/lib/concept-design/selection-participation-deliverable";
import { prisma } from "@/lib/db";
import { getReviewerByToken } from "@/lib/reviewer";

const DISPOSITIONS = new Set<SelectionDisposition>([
  "SELECTED",
  "RESERVE",
  "NOT_SELECTED",
]);

export async function POST(request: Request) {
  if (!isImplementationGateEnabled("selectionParticipationWrites")) {
    return NextResponse.json(
      { error: "Canonical Selection writes are not enabled", code: "DEPENDENCY_GATE_REQUIRED" },
      { status: 409 }
    );
  }

  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const requested = body.disposition == null ? null : String(body.disposition);
  const disposition = requested as SelectionDisposition | null;
  if (disposition !== null && !DISPOSITIONS.has(disposition)) {
    return NextResponse.json(
      { error: "Invalid Selection disposition", code: "SELECTION_DISPOSITION_INVALID" },
      { status: 400 }
    );
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasApplicationCapability(reviewer.role, "DECIDE_SELECTION")) {
    return NextResponse.json(
      { error: "Selection decisions are not permitted", code: "CAPABILITY_DENIED" },
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

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, conferenceId: reviewer.conferenceId },
    include: {
      currentSelectionDecision: true,
      withdrawal: true,
      currentRevision: { include: { revisionTerms: true } },
    },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!submission.currentRevision) {
    return NextResponse.json(
      { error: "Canonical current Revision required", code: "CANONICAL_REVISION_REQUIRED" },
      { status: 409 }
    );
  }
  if (submission.withdrawal && disposition === "SELECTED") {
    return NextResponse.json(
      { error: "A withdrawn Proposal cannot re-enter participation", code: "PARTICIPATION_WITHDRAWN" },
      { status: 409 }
    );
  }

  if (disposition === "SELECTED" && !body.force) {
    const advisory = await themeSelectionCoverageAdvisory(
      reviewer.conferenceId,
      submission.currentRevision.revisionTerms.map((term) => term.themeId)
    );
    if (advisory) {
      return NextResponse.json(
        {
          warning: advisory.message,
          advisoryBasis: advisory.basis,
          requiresConfirm: true,
        },
        { status: 409 }
      );
    }
  }

  const commandKey =
    request.headers.get("Idempotency-Key")?.trim() ||
    String(body.commandKey ?? "").trim() ||
    null;
  try {
    const result = await recordCanonicalSelection({
      conferenceId: reviewer.conferenceId,
      submissionId,
      disposition,
      actorRef: reviewerActorRef(reviewer.id),
      commandKey,
    });
    return NextResponse.json({
      ok: true,
      semantic: {
        selection: {
          decisionRef: result.decision?.id ?? null,
          disposition: result.decision?.disposition ?? null,
        },
        cleanupPending: result.cleanupPending,
      },
      replayed: result.replayed,
    });
  } catch (error) {
    if (
      error instanceof CapacityUnavailableError ||
      error instanceof CapacityConfigurationError ||
      error instanceof SelectionHeadConflictError
    ) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 409 });
    }
    throw error;
  }
}
