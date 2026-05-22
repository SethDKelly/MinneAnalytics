import { NextResponse } from "next/server";
import { loadDeckFileForCommittee, readDeckBytes } from "@/lib/decks";
import { canManageDeck, getReviewerByToken } from "@/lib/reviewer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const fileId = searchParams.get("fileId");

  if (!token || !fileId) {
    return NextResponse.json({ error: "Missing token or fileId" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer || !canManageDeck(reviewer.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = await loadDeckFileForCommittee(fileId, reviewer.conferenceId);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const buffer = await readDeckBytes(file.storagePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }
}
