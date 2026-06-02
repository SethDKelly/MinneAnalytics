import { NextResponse } from "next/server";
import type { ConferenceStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  canArchiveConference,
  canManageConferenceSettings,
  getReviewerByToken,
} from "@/lib/reviewer";

const STATUSES: ConferenceStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canManageConferenceSettings(reviewer.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
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
    data.status = status;
    data.archivedAt = status === "ARCHIVED" ? new Date() : null;
  }

  const updated = await prisma.conference.update({
    where: { id: reviewer.conferenceId },
    data,
  });

  return NextResponse.json({ ok: true, conference: updated });
}
