import { NextResponse } from "next/server";
import type { DeckStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
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

  if (!submission.deckStatus && deckStatus !== "SUBMITTED") {
    return NextResponse.json({ error: "No deck uploaded yet" }, { status: 400 });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { deckStatus },
  });

  return NextResponse.json({ ok: true });
}
