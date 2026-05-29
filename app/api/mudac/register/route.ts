import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canRegisterForEvent } from "@/lib/mudac/auth";
import { emailMudacJudgeRegistered } from "@/lib/mudac/email";
import { verifyRegistrationCode } from "@/lib/mudac/registration-code";
import { mudacJudgeRegistrationSchema } from "@/lib/mudac/validation";
import { clientIp, checkRateLimit } from "@/lib/rate-limit";
import { generateToken, hashToken } from "@/lib/tokens";

function judgePortalUrl(request: Request, token: string): string {
  const origin = new URL(request.url).origin;
  return `${origin}/mudac/judge/${token}`;
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limit = checkRateLimit(`mudac-register:${ip}`);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${limit.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = mudacJudgeRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join("; ") },
        { status: 400 }
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ error: "Registration rejected" }, { status: 400 });
    }

    const event = await prisma.mudacEvent.findUnique({
      where: { slug: parsed.data.eventSlug },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const reg = canRegisterForEvent(event);
    if (!reg.ok) {
      return NextResponse.json({ error: reg.message }, { status: 403 });
    }

    if (
      !verifyRegistrationCode(
        parsed.data.registrationCode ?? "",
        event.registrationCodeHash
      )
    ) {
      return NextResponse.json({ error: "Invalid registration code" }, { status: 403 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.mudacJudge.findUnique({
      where: { eventId_email: { eventId: event.id, email } },
    });
    if (existing && !existing.revokedAt) {
      return NextResponse.json(
        { error: "This email is already registered for this event" },
        { status: 409 }
      );
    }

    const token = generateToken();
    const tokenHash = hashToken(token);

    if (existing?.revokedAt) {
      await prisma.mudacJudge.update({
        where: { id: existing.id },
        data: {
          name: parsed.data.name.trim(),
          affiliation: parsed.data.affiliation?.trim() || null,
          judgeType: parsed.data.judgeType,
          tokenHash,
          revokedAt: null,
          registeredAt: new Date(),
        },
      });
    } else {
      await prisma.mudacJudge.create({
        data: {
          eventId: event.id,
          name: parsed.data.name.trim(),
          email,
          affiliation: parsed.data.affiliation?.trim() || null,
          judgeType: parsed.data.judgeType,
          tokenHash,
        },
      });
    }

    const portalUrl = judgePortalUrl(request, token);
    emailMudacJudgeRegistered({
      email,
      name: parsed.data.name.trim(),
      eventName: event.name,
      judgePortalUrl: portalUrl,
    });

    return NextResponse.json({ ok: true, token, portalUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
