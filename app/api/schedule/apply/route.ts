import { NextResponse } from "next/server";
import { ApplicationPolicyError } from "@/lib/concept-design/lifecycle-disclosure-policy";
import {
  applyCanonicalScheduleProposal,
  ScheduleBaseConflictError,
  SchedulePolicyError,
  type ScheduleProposalAssignment,
} from "@/lib/concept-design/schedule-authority";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import { getSchedulePlanner } from "@/lib/schedule/auth";

export async function POST(request: Request) {
  if (!isImplementationGateEnabled("scheduleWrites")) {
    return NextResponse.json(
      { error: "Canonical schedule apply is not enabled" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const token = String(body.token ?? "");
  const expectedBaseFingerprint = String(body.expectedBaseFingerprint ?? "").trim();
  const assignments: ScheduleProposalAssignment[] = Array.isArray(body.assignments)
    ? body.assignments.map((row: unknown): ScheduleProposalAssignment => {
        const value = row as Record<string, unknown>;
        return {
          placementId: String(value.placementId ?? ""),
          submissionId: String(value.submissionId ?? ""),
        };
      })
    : [];

  if (!expectedBaseFingerprint) {
    return NextResponse.json(
      { error: "Expected schedule base fingerprint is required" },
      { status: 400 }
    );
  }
  if (assignments.some((row) => !row.placementId || !row.submissionId)) {
    return NextResponse.json({ error: "Invalid schedule proposal" }, { status: 400 });
  }

  const planner = await getSchedulePlanner(token);
  if (!planner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await applyCanonicalScheduleProposal({
      conferenceId: planner.conferenceId,
      expectedBaseFingerprint,
      assignments,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (
      error instanceof ScheduleBaseConflictError ||
      error instanceof SchedulePolicyError ||
      error instanceof ApplicationPolicyError
    ) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 409 }
      );
    }
    throw error;
  }
}
