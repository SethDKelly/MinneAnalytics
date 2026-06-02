import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { clientIp, checkRateLimit } from "@/lib/rate-limit";
import { getSubmissionWindowState } from "@/lib/submission-window";
import { findOrCreatePresenterTheme, themeOptionFromRow } from "@/lib/themes";

const proposeSchema = z.object({
  conferenceSlug: z.string().min(1),
  name: z.string().min(2).max(80),
  proposedBySubmissionId: z.string().optional(),
  website: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`theme-propose:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limit.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = proposeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join("; ") },
      { status: 400 }
    );
  }

  if (String(parsed.data.website ?? "").trim()) {
    return NextResponse.json({ error: "Rejected" }, { status: 400 });
  }

  const conference = await prisma.conference.findUnique({
    where: { slug: parsed.data.conferenceSlug },
  });
  if (!conference) {
    return NextResponse.json({ error: "Conference not found" }, { status: 404 });
  }

  const window = getSubmissionWindowState(conference);
  if (!window.open) {
    return NextResponse.json({ error: window.message }, { status: 403 });
  }

  const theme = await findOrCreatePresenterTheme({
    conferenceId: conference.id,
    name: parsed.data.name,
    proposedBySubmissionId: parsed.data.proposedBySubmissionId,
  });

  return NextResponse.json({
    ok: true,
    theme: themeOptionFromRow(theme),
  });
}
