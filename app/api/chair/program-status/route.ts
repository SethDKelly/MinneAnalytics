import { NextResponse } from "next/server";
import type { ProgramStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import { autoPopulateDemoScores } from "@/lib/demo-scores";
import { emailAbstractApproved } from "@/lib/email-stub";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  ApplicationPolicyError,
  assertLiveOperationalContext,
  hasApplicationCapability,
  reviewerActorRef,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import {
  processPublicationCleanupForSource,
} from "@/lib/concept-design/publication-public-access";
import {
  CapacityConfigurationError,
  CapacityUnavailableError,
  recordCanonicalSelection,
  selectionDispositionFromProgramStatus,
  SelectionHeadConflictError,
} from "@/lib/concept-design/selection-participation-deliverable";
import { getConferenceThemesForAdmin } from "@/lib/themes";
import { getConferenceSubmissions } from "@/lib/conference-data";
import {
  approvedThemeSaturationWarning,
  computeThemeStats,
} from "@/lib/theme-stats";
import { canApprove, canSetProgramStatus, getReviewerByToken } from "@/lib/reviewer";

const ALLOWED: ProgramStatus[] = [
  "APPROVED",
  "DECLINED",
  "BACKUP",
  "PENDING",
];

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const submissionId = String(body.submissionId ?? "");
  const status = body.status as ProgramStatus;

  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lifecycleWrites = isImplementationGateEnabled("lifecycleDisclosureWrites");
  if (lifecycleWrites) {
    if (!hasApplicationCapability(reviewer.role, "DECIDE_SELECTION")) {
      return NextResponse.json(
        { error: "Selection decisions are not permitted", code: "CAPABILITY_DENIED" },
        { status: 403 }
      );
    }
    if (!isImplementationGateEnabled("selectionParticipationWrites")) {
      return NextResponse.json(
        {
          error: "004-D Selection policy requires canonical participation writes",
          code: "DEPENDENCY_GATE_REQUIRED",
        },
        { status: 409 }
      );
    }
    try {
      assertLiveOperationalContext(reviewer.conference);
    } catch (error) {
      if (error instanceof ApplicationPolicyError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 403 }
        );
      }
      throw error;
    }
  } else {
    if (!canSetProgramStatus(reviewer.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (status === "APPROVED" && !canApprove(reviewer.role)) {
      return NextResponse.json({ error: "Core approval required" }, { status: 403 });
    }
    try {
      await assertConferenceAcceptsMutations(reviewer.conferenceId);
    } catch {
      return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
    }
  }

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, conferenceId: reviewer.conferenceId },
    include: {
      themes: { select: { themeId: true } },
      currentSelectionDecision: true,
      withdrawal: true,
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const force = Boolean(body.force);

  if (status === "APPROVED" && !force) {
    const [themes, subs] = await Promise.all([
      getConferenceThemesForAdmin(reviewer.conferenceId),
      getConferenceSubmissions(reviewer.conferenceId),
    ]);
    const stats = computeThemeStats(
      themes,
      subs.map((s) => ({
        programStatus: s.programStatus,
        themes: s.themes.map((t) => ({ themeId: t.themeId })),
      }))
    );
    const warning = approvedThemeSaturationWarning(
      stats,
      submission.themes.map((t) => t.themeId)
    );
    if (warning) {
      return NextResponse.json({ warning, requiresConfirm: true }, { status: 409 });
    }
  }

  const canonicalWrites = isImplementationGateEnabled("selectionParticipationWrites");

  if (canonicalWrites) {
    const currentDisposition = submission.currentSelectionDecision?.disposition ?? null;
    if (
      status === "APPROVED" &&
      currentDisposition !== null &&
      currentDisposition !== "RESERVE" &&
      currentDisposition !== "SELECTED"
    ) {
      return NextResponse.json(
        { error: "Can only approve from undecided or reserve consideration" },
        { status: 400 }
      );
    }
    if (
      status === "APPROVED" &&
      submission.withdrawal &&
      currentDisposition !== "SELECTED"
    ) {
      return NextResponse.json(
        { error: "A withdrawn submission cannot re-enter participation" },
        { status: 409 }
      );
    }

    const headerKey = request.headers.get("Idempotency-Key")?.trim();
    const bodyKey = String(body.commandKey ?? "").trim();
    const commandKey = headerKey || bodyKey || null;
    const actorRef = reviewerActorRef(reviewer.id);

    try {
      const result = await recordCanonicalSelection({
        conferenceId: reviewer.conferenceId,
        submissionId,
        disposition: selectionDispositionFromProgramStatus(status),
        actorRef,
        commandKey,
      });

      let cleanupPending = result.cleanupPending;
      if (result.decision) {
        await processPublicationCleanupForSource(result.decision.id, actorRef);
        cleanupPending = await prisma.synchronizationWork.count({
          where: { sourceRef: result.decision.id, state: { not: "COMPLETED" } },
        });
      }

      if (status === "APPROVED" || status === "DECLINED") {
        await autoPopulateDemoScores(
          submissionId,
          reviewer.conferenceId,
          status
        );
      }

      if (status === "APPROVED" && !submission.withdrawal && !result.replayed) {
        emailAbstractApproved({
          email: submission.email,
          presenterName: `${submission.firstName} ${submission.lastName}`,
          title: submission.title,
          presenterPortalUrl:
            "Use the presenter portal link from your original submission confirmation email.",
        });
      }

      return NextResponse.json({
        ok: true,
        decisionId: result.decision?.id ?? null,
        replayed: result.replayed,
        cleanupPending,
      });
    } catch (error) {
      if (
        error instanceof CapacityUnavailableError ||
        error instanceof CapacityConfigurationError ||
        error instanceof SelectionHeadConflictError
      ) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 409 }
        );
      }
      throw error;
    }
  }

  const fromBackup = submission.programStatus === "BACKUP" && status === "APPROVED";
  const fromPending = submission.programStatus === "PENDING" && status === "APPROVED";

  if (status === "APPROVED" && !fromBackup && !fromPending) {
    return NextResponse.json(
      { error: "Can only approve from Pending or Backup" },
      { status: 400 }
    );
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      programStatus: status,
      approvedAt: status === "APPROVED" ? new Date() : null,
      withdrawnAt: null,
    },
  });

  if (status === "APPROVED" || status === "DECLINED") {
    await autoPopulateDemoScores(
      submissionId,
      reviewer.conferenceId,
      status
    );
  }

  if (status === "APPROVED") {
    emailAbstractApproved({
      email: submission.email,
      presenterName: `${submission.firstName} ${submission.lastName}`,
      title: submission.title,
      presenterPortalUrl:
        "Use the presenter portal link from your original submission confirmation email.",
    });
  }

  return NextResponse.json({ ok: true });
}
