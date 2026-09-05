import { NextResponse } from "next/server";
import type { ConferenceStatus } from "@prisma/client";
import {
  ApplicationPolicyError,
  applyConferencePolicyPatch,
  hasApplicationCapability,
  reviewerActorRef,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import { prisma } from "@/lib/db";
import {
  canArchiveConference,
  canManageConferenceSettings,
  getReviewerByToken,
} from "@/lib/reviewer";

const STATUSES: ConferenceStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

function parseOptionalDate(value: unknown): Date | null {
  if (value === null || value === "") return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new ApplicationPolicyError("INVALID_DATE", "Invalid date value");
  }
  return parsed;
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canManageConferenceSettings(reviewer.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  if (isImplementationGateEnabled("lifecycleDisclosureWrites")) {
    const availabilityRequested =
      body.submissionsOpen !== undefined ||
      body.submissionsOpenAt !== undefined ||
      body.submissionsCloseAt !== undefined;
    if (
      availabilityRequested &&
      !hasApplicationCapability(reviewer.role, "MANAGE_AVAILABILITY")
    ) {
      return NextResponse.json(
        { error: "Availability management is not permitted", code: "CAPABILITY_DENIED" },
        { status: 403 }
      );
    }

    if (
      (body.timezone !== undefined || body.blindReviewEnabled !== undefined) &&
      !hasApplicationCapability(reviewer.role, "MANAGE_CONTEXT_SETTINGS")
    ) {
      return NextResponse.json(
        { error: "Context settings management is not permitted", code: "CAPABILITY_DENIED" },
        { status: 403 }
      );
    }

    let status: ConferenceStatus | undefined;
    if (body.status !== undefined) {
      status = body.status as ConferenceStatus;
      if (!STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const capability = status === "ARCHIVED" ? "ARCHIVE_CONTEXT" : "MANAGE_CONTEXT_SETTINGS";
      if (!hasApplicationCapability(reviewer.role, capability)) {
        return NextResponse.json(
          { error: "Lifecycle transition is not permitted", code: "CAPABILITY_DENIED" },
          { status: 403 }
        );
      }
    }

    try {
      const conference = await applyConferencePolicyPatch({
        conferenceId: reviewer.conferenceId,
        actorRef: reviewerActorRef(reviewer.id),
        patch: {
          ...(body.submissionsOpen !== undefined
            ? { submissionsOpen: Boolean(body.submissionsOpen) }
            : {}),
          ...(body.submissionsOpenAt !== undefined
            ? { submissionsOpenAt: parseOptionalDate(body.submissionsOpenAt) }
            : {}),
          ...(body.submissionsCloseAt !== undefined
            ? { submissionsCloseAt: parseOptionalDate(body.submissionsCloseAt) }
            : {}),
          ...(body.timezone !== undefined ? { timezone: String(body.timezone) } : {}),
          ...(body.blindReviewEnabled !== undefined
            ? { blindReviewEnabled: Boolean(body.blindReviewEnabled) }
            : {}),
          ...(status ? { status } : {}),
        },
      });
      return NextResponse.json({ ok: true, conference });
    } catch (error) {
      if (error instanceof ApplicationPolicyError) {
        const badRequest = new Set([
          "INVALID_DATE",
          "AVAILABILITY_WINDOW_INCOMPLETE",
          "AVAILABILITY_WINDOW_INVALID",
        ]);
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: badRequest.has(error.code) ? 400 : 409 }
        );
      }
      throw error;
    }
  }

  const data: Record<string, unknown> = {};

  if (body.submissionsOpen !== undefined) {
    data.submissionsOpen = Boolean(body.submissionsOpen);
  }
  if (body.submissionsOpenAt !== undefined) {
    data.submissionsOpenAt = body.submissionsOpenAt
      ? new Date(String(body.submissionsOpenAt))
      : null;
  }
  if (body.submissionsCloseAt !== undefined) {
    data.submissionsCloseAt = body.submissionsCloseAt
      ? new Date(String(body.submissionsCloseAt))
      : null;
  }
  if (body.timezone !== undefined) {
    data.timezone = String(body.timezone).slice(0, 64);
  }
  if (body.blindReviewEnabled !== undefined) {
    data.blindReviewEnabled = Boolean(body.blindReviewEnabled);
  }

  if (body.status !== undefined) {
    if (!canArchiveConference(reviewer.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const status = body.status as ConferenceStatus;
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const archive = await prisma.archiveRecord.findUnique({
      where: { conferenceId: reviewer.conferenceId },
    });
    if (archive && status !== "ARCHIVED") {
      return NextResponse.json(
        {
          error: "Canonical Archive history exists and cannot be erased",
          code: "ARCHIVE_ROLLBACK_FORBIDDEN",
        },
        { status: 409 }
      );
    }
    data.status = status;
    data.archivedAt = status === "ARCHIVED" ? new Date() : null;
  }

  const updated = await prisma.conference.update({
    where: { id: reviewer.conferenceId },
    data,
  });

  return NextResponse.json({ ok: true, conference: updated });
}
