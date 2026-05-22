import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canPublishDeckArchive, getReviewerByToken } from "@/lib/reviewer";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const publish = body.publish !== false;

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canPublishDeckArchive(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  await prisma.conference.update({
    where: { id: reviewer.conferenceId },
    data: {
      decksPublished: publish,
      decksPublishedAt: publish ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, decksPublished: publish });
}
