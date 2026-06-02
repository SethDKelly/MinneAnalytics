import { NextResponse } from "next/server";
import { getCommunicationsOverview } from "@/lib/conference-email-data";
import { canSetProgramStatus, getReviewerByToken } from "@/lib/reviewer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canSetProgramStatus(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  const templates = await getCommunicationsOverview(reviewer.conferenceId);
  return NextResponse.json({ templates });
}
