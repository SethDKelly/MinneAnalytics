import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import { prisma } from "@/lib/db";
import { getSubmissionByPresenterToken } from "@/lib/presenter-auth";
import {
  canPresenterEditSubmission,
  computeChangedFields,
  revisionSnapshotFromSubmission,
  themeIdsFromJoin,
} from "@/lib/submission-revision";
import { presenterSubmissionEditSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = presenterSubmissionEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join("; ") },
      { status: 400 }
    );
  }

  const submission = await getSubmissionByPresenterToken(parsed.data.token);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canPresenterEditSubmission(submission)) {
    return NextResponse.json(
      { error: "This submission cannot be edited in its current status" },
      { status: 403 }
    );
  }

  try {
    await assertConferenceAcceptsMutations(submission.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
  }

  const validThemes = await prisma.theme.findMany({
    where: {
      conferenceId: submission.conferenceId,
      id: { in: parsed.data.themeIds },
    },
  });
  if (validThemes.length !== parsed.data.themeIds.length) {
    return NextResponse.json({ error: "Invalid theme selection" }, { status: 400 });
  }

  const before = {
    title: submission.title,
    abstract: submission.abstract,
    bio: submission.bio,
    technicalLevel: submission.technicalLevel,
    themeIds: themeIdsFromJoin(submission.themes),
  };
  const after = {
    title: parsed.data.title,
    abstract: parsed.data.abstract,
    bio: parsed.data.bio,
    technicalLevel: parsed.data.technicalLevel,
    themeIds: [...parsed.data.themeIds].sort(),
  };

  const changedFields = computeChangedFields(before, after);
  if (changedFields.length === 0) {
    return NextResponse.json({ error: "No changes to save" }, { status: 400 });
  }

  const nextVersion = submission.abstractVersion + 1;

  await prisma.$transaction(async (tx) => {
    await tx.submissionTheme.deleteMany({ where: { submissionId: submission.id } });
    await tx.submission.update({
      where: { id: submission.id },
      data: {
        title: after.title,
        abstract: after.abstract,
        bio: after.bio,
        technicalLevel: after.technicalLevel,
        abstractVersion: nextVersion,
        abstractReviewStatus: "REVISED",
        lastPresenterEditAt: new Date(),
        themes: {
          create: after.themeIds.map((themeId) => ({ themeId })),
        },
      },
    });
    await tx.submissionRevision.create({
      data: {
        submissionId: submission.id,
        version: nextVersion,
        ...revisionSnapshotFromSubmission(
          {
            title: after.title,
            abstract: after.abstract,
            bio: after.bio,
            technicalLevel: after.technicalLevel,
          },
          after.themeIds
        ),
        changedFields: JSON.stringify(changedFields),
        changeNote: parsed.data.changeNote?.trim() || null,
      },
    });
  });

  return NextResponse.json({
    ok: true,
    abstractVersion: nextVersion,
    abstractReviewStatus: "REVISED",
  });
}
