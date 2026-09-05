import { NextResponse } from "next/server";
import { assertConferenceAcceptsMutations } from "@/lib/conference-active";
import {
  hasApplicationCapability,
  reviewerActorRef,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  PublicationHeadConflictError,
  PublicationPolicyError,
  setDeckArchivePublication,
  usesExactPublicationAuthorization,
} from "@/lib/concept-design/publication-public-access";
import { prisma } from "@/lib/db";
import { canPublishDeckArchive, getReviewerByToken } from "@/lib/reviewer";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const publish = body.publish !== false;

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canonicalWrites =
    isImplementationGateEnabled("publicationWrites") ||
    (await usesExactPublicationAuthorization(reviewer.conferenceId));

  if (canonicalWrites) {
    const capability = publish ? "PUBLISH_MATERIAL" : "UNPUBLISH_MATERIAL";
    if (!hasApplicationCapability(reviewer.role, capability)) {
      return NextResponse.json(
        { error: `${capability} capability required` },
        { status: 403 }
      );
    }

    try {
      const result = await setDeckArchivePublication({
        conferenceId: reviewer.conferenceId,
        publish,
        actorRef: reviewerActorRef(reviewer.id),
      });
      return NextResponse.json({
        ok: true,
        decksPublished: result.decksPublished,
        publicationTransitions: result.transitioned,
      });
    } catch (error) {
      if (
        error instanceof PublicationPolicyError ||
        error instanceof PublicationHeadConflictError
      ) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 409 }
        );
      }
      throw error;
    }
  }

  if (!canPublishDeckArchive(reviewer.role)) {
    return NextResponse.json({ error: "Board access required" }, { status: 403 });
  }

  try {
    await assertConferenceAcceptsMutations(reviewer.conferenceId);
  } catch {
    return NextResponse.json({ error: "Conference is not active" }, { status: 403 });
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
