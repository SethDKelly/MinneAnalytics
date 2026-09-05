import { NextResponse } from "next/server";
import { ApplicationPolicyError } from "@/lib/concept-design/lifecycle-disclosure-policy";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import {
  applyCanonicalManualPlacement,
  SchedulePolicyError,
} from "@/lib/concept-design/schedule-authority";
import { prisma } from "@/lib/db";
import { getSchedulePlanner } from "@/lib/schedule/auth";

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const placementId = String(body.placementId ?? "");
  const submissionId =
    body.submissionId === null || body.submissionId === undefined
      ? null
      : String(body.submissionId);

  const planner = await getSchedulePlanner(token);
  if (!planner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isImplementationGateEnabled("scheduleWrites")) {
    try {
      await applyCanonicalManualPlacement({
        conferenceId: planner.conferenceId,
        placementId,
        submissionId,
      });
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (error instanceof SchedulePolicyError || error instanceof ApplicationPolicyError) {
        const status = error.code.endsWith("NOT_FOUND") ? 404 : 409;
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status }
        );
      }
      throw error;
    }
  }

  const target = await prisma.schedulePlacement.findFirst({
    where: { id: placementId, conferenceId: planner.conferenceId },
    include: { slot: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Placement not found" }, { status: 404 });
  }
  if (target.slot.slotType !== "SESSION") {
    return NextResponse.json(
      { error: "Only session slots accept talks" },
      { status: 400 }
    );
  }

  if (submissionId === null) {
    await prisma.schedulePlacement.update({
      where: { id: placementId },
      data: { submissionId: null },
    });
    return NextResponse.json({ ok: true });
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      conferenceId: planner.conferenceId,
      programStatus: "APPROVED",
    },
  });
  if (!submission) {
    return NextResponse.json(
      { error: "Approved talk not found" },
      { status: 404 }
    );
  }

  const occupantId = target.submissionId;
  const sourcePlacement = await prisma.schedulePlacement.findFirst({
    where: { submissionId, conferenceId: planner.conferenceId },
  });

  await prisma.$transaction(async (tx) => {
    if (sourcePlacement && sourcePlacement.id !== placementId) {
      if (occupantId && occupantId !== submissionId) {
        await tx.schedulePlacement.update({
          where: { id: sourcePlacement.id },
          data: { submissionId: occupantId },
        });
        await tx.schedulePlacement.update({
          where: { id: placementId },
          data: { submissionId },
        });
      } else {
        await tx.schedulePlacement.update({
          where: { id: sourcePlacement.id },
          data: { submissionId: null },
        });
        await tx.schedulePlacement.update({
          where: { id: placementId },
          data: { submissionId },
        });
      }
    } else {
      if (occupantId && occupantId !== submissionId) {
        await tx.schedulePlacement.update({
          where: { id: placementId },
          data: { submissionId: null },
        });
      }
      await tx.schedulePlacement.updateMany({
        where: { submissionId, conferenceId: planner.conferenceId },
        data: { submissionId: null },
      });
      await tx.schedulePlacement.update({
        where: { id: placementId },
        data: { submissionId },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
