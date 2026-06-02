import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeDegrees } from "@/lib/degrees";
import { clientIp, checkRateLimit } from "@/lib/rate-limit";
import { sendEmailStub } from "@/lib/email-stub";
import { generateToken, hashToken } from "@/lib/tokens";
import { getSubmissionWindowState } from "@/lib/submission-window";
import { revisionSnapshotFromSubmission } from "@/lib/submission-revision";
import { resolveThemeIdsForSubmit, slugifyThemeName } from "@/lib/themes";
import { submissionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limit = checkRateLimit(`submit:${ip}`);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Too many submissions. Try again in ${limit.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const form = await request.formData();

    if (String(form.get("website") ?? "").trim()) {
      return NextResponse.json({ error: "Submission rejected" }, { status: 400 });
    }
    const degrees = JSON.parse(String(form.get("degrees") ?? "[]"));
    const themeIds = JSON.parse(String(form.get("themeIds") ?? "[]"));
    const proposedThemeName = String(form.get("proposedThemeName") ?? "").trim() || undefined;
    const coDegreesRaw = form.get("coPresenterDegrees");
    const hasCoPresenter = form.get("hasCoPresenter") === "true";

    const payload = {
      conferenceSlug: String(form.get("conferenceSlug") ?? ""),
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      degrees,
      jobTitle: String(form.get("jobTitle") ?? ""),
      organization: String(form.get("organization") ?? ""),
      title: String(form.get("title") ?? ""),
      abstract: String(form.get("abstract") ?? ""),
      technicalLevel: form.get("technicalLevel"),
      bio: String(form.get("bio") ?? ""),
      email: String(form.get("email") ?? ""),
      zipCode: String(form.get("zipCode") ?? ""),
      phone: String(form.get("phone") ?? ""),
      linkedinUrl: String(form.get("linkedinUrl") ?? ""),
      linkedinHasPhoto: form.get("linkedinHasPhoto") === "true",
      hasCoPresenter,
      coPresenterName: hasCoPresenter ? String(form.get("coPresenterName") ?? "") : undefined,
      coPresenterEmail: hasCoPresenter ? String(form.get("coPresenterEmail") ?? "") : undefined,
      coPresenterDegrees: hasCoPresenter && coDegreesRaw
        ? JSON.parse(String(coDegreesRaw))
        : undefined,
      coPresenterJobTitle: hasCoPresenter
        ? String(form.get("coPresenterJobTitle") ?? "")
        : undefined,
      coPresenterOrganization: hasCoPresenter
        ? String(form.get("coPresenterOrganization") ?? "")
        : undefined,
      coPresenterBio: hasCoPresenter ? String(form.get("coPresenterBio") ?? "") : undefined,
      coPresenterLinkedinUrl: hasCoPresenter
        ? String(form.get("coPresenterLinkedinUrl") ?? "")
        : undefined,
      coPresenterLinkedinHasPhoto: hasCoPresenter
        ? form.get("coPresenterLinkedinHasPhoto") === "true"
        : undefined,
      travelRestriction: String(form.get("travelRestriction") ?? "") || undefined,
      travelReimbursementRequired: form.get("travelReimbursementRequired") === "true",
      additionalInfo: String(form.get("additionalInfo") ?? "") || undefined,
      themeIds: Array.isArray(themeIds) ? themeIds.map(String) : [],
    };

    const parsed = submissionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join("; ") },
        { status: 400 }
      );
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

    let resolvedThemeIds: string[];
    try {
      resolvedThemeIds = await resolveThemeIdsForSubmit(
        conference.id,
        parsed.data.themeIds,
        proposedThemeName
      );
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid theme selection" },
        { status: 400 }
      );
    }

    const validThemes = await prisma.theme.findMany({
      where: {
        conferenceId: conference.id,
        id: { in: resolvedThemeIds },
        removedAt: null,
      },
    });
    if (validThemes.length !== resolvedThemeIds.length) {
      return NextResponse.json({ error: "Invalid theme selection" }, { status: 400 });
    }

    const presenterToken = generateToken();
    const d = parsed.data;

    const submission = await prisma.$transaction(async (tx) => {
      const created = await tx.submission.create({
        data: {
          conferenceId: conference.id,
          presenterTokenHash: hashToken(presenterToken),
          abstractVersion: 1,
          abstractReviewStatus: "CURRENT",
          firstName: d.firstName,
          lastName: d.lastName,
          degrees: serializeDegrees(d.degrees),
          jobTitle: d.jobTitle,
          organization: d.organization,
          title: d.title,
          abstract: d.abstract,
          technicalLevel: d.technicalLevel,
          bio: d.bio,
          email: d.email,
          zipCode: d.zipCode,
          phone: d.phone,
          linkedinUrl: d.linkedinUrl,
          linkedinHasPhoto: d.linkedinHasPhoto,
          hasCoPresenter: d.hasCoPresenter,
          coPresenterName: d.hasCoPresenter ? d.coPresenterName : null,
          coPresenterEmail: d.hasCoPresenter ? d.coPresenterEmail : null,
          coPresenterDegrees: d.hasCoPresenter
            ? serializeDegrees(d.coPresenterDegrees ?? ["None"])
            : null,
          coPresenterJobTitle: d.hasCoPresenter ? d.coPresenterJobTitle : null,
          coPresenterOrganization: d.hasCoPresenter ? d.coPresenterOrganization : null,
          coPresenterBio: d.hasCoPresenter ? d.coPresenterBio : null,
          coPresenterLinkedinUrl: d.hasCoPresenter ? d.coPresenterLinkedinUrl : null,
          coPresenterLinkedinHasPhoto: d.hasCoPresenter
            ? (d.coPresenterLinkedinHasPhoto ?? false)
            : null,
          travelRestriction: d.travelRestriction ?? null,
          travelReimbursementRequired: d.travelReimbursementRequired,
          additionalInfo: d.additionalInfo ?? null,
          themes: {
            create: resolvedThemeIds.map((themeId) => ({ themeId })),
          },
        },
      });

      if (proposedThemeName) {
        await tx.theme.updateMany({
          where: {
            conferenceId: conference.id,
            slug: slugifyThemeName(proposedThemeName),
          },
          data: { proposedBySubmissionId: created.id },
        });
      }

      await tx.submissionRevision.create({
        data: {
          submissionId: created.id,
          version: 1,
          ...revisionSnapshotFromSubmission(created, resolvedThemeIds),
        },
      });
      return created;
    });

    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    sendEmailStub({
      to: d.email,
      subject: `Submission received — ${d.title}`,
      template: "submission-confirmation",
      body: `Hi ${d.firstName},\n\nWe received your presentation "${d.title}". Track status and upload your deck after approval:\n\n${base}/presenter/${presenterToken}\n\nThank you,\nMinneAnalytics`,
    });

    return NextResponse.json({
      id: submission.id,
      presenterToken,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
