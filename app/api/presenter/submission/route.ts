import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import {
  appendCanonicalRevision,
  CanonicalRevisionUnavailableError,
  RevisionCommandConflictError,
  StaleRevisionHeadError,
} from "@/lib/concept-design/revision-evaluation";
import { getRevisionEligibility } from "@/lib/concept-design/lifecycle-disclosure-policy";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import { prisma } from "@/lib/db";
import { getSubmissionByPresenterToken } from "@/lib/presenter-auth";
import {
  canPresenterEditSubmission,
  computeChangedFields,
  revisionSnapshotFromSubmission,
  themeIdsFromJoin,
} from "@/lib/submission-revision";
import { resolveThemeIdsForSubmit } from "@/lib/themes";
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

  const lifecycleWrites = isImplementationGateEnabled("lifecycleDisclosureWrites");
  if (lifecycleWrites) {
    if (!isImplementationGateEnabled("revisionEvaluationWrites")) {
      return NextResponse.json(
        {
          error: "004-D revision policy requires canonical Revision writes",
          code: "DEPENDENCY_GATE_REQUIRED",
        },
        { status: 409 }
      );
    }
    const eligibility = await getRevisionEligibility(submission);
    if (!eligibility.allowed) {
      return NextResponse.json(
        { error: eligibility.message, code: eligibility.code },
        { status: 403 }
      );
    }
  } else {
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
  }

  let resolvedThemeIds: string[];
  try {
    resolvedThemeIds = await resolveThemeIdsForSubmit(
      submission.conferenceId,
      parsed.data.themeIds,
      parsed.data.proposedThemeName,
      submission.id
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid theme selection" },
      { status: 400 }
    );
  }

  const validThemes = await prisma.theme.findMany({
    where: {
      conferenceId: submission.conferenceId,
      id: { in: resolvedThemeIds },
      removedAt: null,
    },
  });
  if (validThemes.length !== resolvedThemeIds.length) {
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
    themeIds: [...resolvedThemeIds].sort(),
  };

  const changedFields = computeChangedFields(before, after);
  if (changedFields.length === 0) {
    return NextResponse.json({ error: "No changes to save" }, { status: 400 });
  }

  if (isImplementationGateEnabled("revisionEvaluationWrites")) {
    try {
      const result = await appendCanonicalRevision({
        submissionId: submission.id,
        expectedRevisionId: submission.currentRevisionId,
        commandKey: request.headers.get("Idempotency-Key")?.trim() || null,
        requireExpectedHead: true,
        snapshot: after,
        changedFields,
        changeNote: parsed.data.changeNote?.trim() || null,
      });
      return NextResponse.json({
        ok: true,
        submissionRevisionId: result.revision.id,
        abstractVersion: result.revision.version,
        abstractReviewStatus: "REVISED",
        replayed: result.replayed,
      });
    } catch (error) {
      if (
        error instanceof StaleRevisionHeadError ||
        error instanceof CanonicalRevisionUnavailableError ||
        error instanceof RevisionCommandConflictError
      ) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 409 }
        );
      }
      throw error;
    }
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
          create: resolvedThemeIds.map((themeId) => ({ themeId })),
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
