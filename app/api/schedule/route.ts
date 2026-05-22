import { NextResponse } from "next/server";
import { parseDegreesJson } from "@/lib/degrees";
import { getSchedulePlanner } from "@/lib/schedule/auth";
import { loadScheduleState } from "@/lib/schedule/grid";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const planner = await getSchedulePlanner(token);
  if (!planner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await loadScheduleState(planner.conferenceId);

  return NextResponse.json({
    conferenceName: state.conference.name,
    rooms: state.rooms.map((r) => ({ id: r.id, name: r.name })),
    slots: state.slots.map((s) => ({
      id: s.id,
      label: s.label,
      slotType: s.slotType,
    })),
    placements: state.placements.map((p) => ({
      id: p.id,
      slotId: p.slotId,
      roomId: p.roomId,
      submission: p.submission
        ? {
            id: p.submission.id,
            title: p.submission.title,
            firstName: p.submission.firstName,
            lastName: p.submission.lastName,
            jobTitle: p.submission.jobTitle,
            organization: p.submission.organization,
            technicalLevel: p.submission.technicalLevel,
            isSoftSkill: p.submission.isSoftSkill,
            degrees: parseDegreesJson(p.submission.degrees),
          }
        : null,
    })),
    unscheduled: state.unscheduled.map((s) => ({
      id: s.id,
      title: s.title,
      firstName: s.firstName,
      lastName: s.lastName,
      jobTitle: s.jobTitle,
      organization: s.organization,
      technicalLevel: s.technicalLevel,
      isSoftSkill: s.isSoftSkill,
      degrees: parseDegreesJson(s.degrees),
    })),
    approvedCount: state.approvedCount,
  });
}
