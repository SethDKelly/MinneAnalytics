import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  DeliverableHeadConflictError,
  recordProvidedDeckArtifact,
} from "@/lib/concept-design/selection-participation-deliverable";
import { hashToken } from "@/lib/tokens";
import {
  removeSavedDeckFile,
  saveDeckFile,
  validateDeckFile,
} from "@/lib/uploads";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { presenterTokenHash: hashToken(token) },
    include: {
      conference: { include: { archiveRecord: true } },
      deckFiles: { orderBy: { version: "desc" }, take: 1 },
      currentSelectionDecision: true,
      withdrawal: true,
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lifecycleWrites = isImplementationGateEnabled("lifecycleDisclosureWrites");
  if (lifecycleWrites) {
    if (!isImplementationGateEnabled("selectionParticipationWrites")) {
      return NextResponse.json(
        {
          error: "004-D Deliverable policy requires canonical participation writes",
          code: "DEPENDENCY_GATE_REQUIRED",
        },
        { status: 409 }
      );
    }
    if (
      submission.conference.archiveRecord ||
      submission.conference.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          error: "Deck upload is only available during live operation",
          code: submission.conference.archiveRecord ? "CONTEXT_ARCHIVED" : "CONTEXT_NOT_LIVE",
        },
        { status: 403 }
      );
    }
  }

  const canonicalWrites = isImplementationGateEnabled("selectionParticipationWrites");
  if (canonicalWrites) {
    const effectivelyParticipating =
      submission.currentSelectionDecision?.disposition === "SELECTED" &&
      !submission.withdrawal;
    if (!effectivelyParticipating) {
      return NextResponse.json(
        { error: "Deck upload requires current effective participation" },
        { status: 403 }
      );
    }
  } else {
    if (submission.programStatus === "WITHDRAWN") {
      return NextResponse.json({ error: "Submission withdrawn" }, { status: 400 });
    }
    if (submission.programStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Deck upload is only available after abstract approval" },
        { status: 403 }
      );
    }
  }

  const validationError = validateDeckFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const provisionalVersion = (submission.deckFiles[0]?.version ?? 0) + 1;
  const saved = await saveDeckFile(submission.id, provisionalVersion, file);

  try {
    if (canonicalWrites) {
      const artifact = await recordProvidedDeckArtifact({
        submissionId: submission.id,
        filename: saved.filename,
        storagePath: saved.storagePath,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
      });
      return NextResponse.json({ ok: true, version: artifact.version });
    }

    await prisma.deckFile.create({
      data: {
        submissionId: submission.id,
        version: provisionalVersion,
        filename: saved.filename,
        storagePath: saved.storagePath,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
      },
    });

    await prisma.submission.update({
      where: { id: submission.id },
      data: { deckStatus: "SUBMITTED" },
    });

    return NextResponse.json({ ok: true, version: provisionalVersion });
  } catch (error) {
    await removeSavedDeckFile(saved.storagePath).catch(() => undefined);
    if (error instanceof DeliverableHeadConflictError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 409 }
      );
    }
    throw error;
  }
}
