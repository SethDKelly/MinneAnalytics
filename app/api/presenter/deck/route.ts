import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";
import { saveDeckFile, validateDeckFile } from "@/lib/uploads";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { presenterTokenHash: hashToken(token) },
    include: { deckFiles: { orderBy: { version: "desc" }, take: 1 } },
  });

  if (!submission) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (submission.programStatus === "WITHDRAWN") {
    return NextResponse.json({ error: "Submission withdrawn" }, { status: 400 });
  }

  if (submission.programStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "Deck upload is only available after abstract approval" },
      { status: 403 }
    );
  }

  const validationError = validateDeckFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const nextVersion = (submission.deckFiles[0]?.version ?? 0) + 1;
  const saved = await saveDeckFile(submission.id, nextVersion, file);

  await prisma.deckFile.create({
    data: {
      submissionId: submission.id,
      version: nextVersion,
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

  return NextResponse.json({ ok: true, version: nextVersion });
}
