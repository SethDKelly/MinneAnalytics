import { NextResponse } from "next/server";
import {
  CoverageTargetValidationError,
  EFFECTIVE_PARTICIPATION_COUNT_MEASURE,
  normalizeThemeCoverageBounds,
  setThemeCoverageTarget,
  THEME_COVERAGE_DIMENSION,
} from "@/lib/concept-design/coverage-targets";
import {
  hasApplicationCapability,
  reviewerActorRef,
} from "@/lib/concept-design/lifecycle-disclosure-policy";
import {
  establishInitialTermState,
  recordTermState,
} from "@/lib/concept-design/vocabulary";
import { prisma } from "@/lib/db";
import { getReviewerByToken } from "@/lib/reviewer";
import { slugifyThemeName } from "@/lib/themes";

function capabilityDenied(message: string) {
  return NextResponse.json(
    { error: message, code: "CAPABILITY_DENIED" },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const name = String(body.name ?? "").trim();

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasApplicationCapability(reviewer.role, "MANAGE_VOCABULARY")) {
    return capabilityDenied("Vocabulary management is not permitted");
  }

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim() || slugifyThemeName(name);
  let bounds;
  try {
    bounds = normalizeThemeCoverageBounds(body.targetMin, body.targetMax);
  } catch (error) {
    if (error instanceof CoverageTargetValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    throw error;
  }
  if (bounds && !hasApplicationCapability(reviewer.role, "MANAGE_COVERAGE_TARGETS")) {
    return capabilityDenied("Coverage target management is not permitted");
  }

  const maxOrder = await prisma.theme.aggregate({
    where: { conferenceId: reviewer.conferenceId },
    _max: { sortOrder: true },
  });
  const actorRef = reviewerActorRef(reviewer.id);

  const theme = await prisma.$transaction(async (tx) => {
    const created = await tx.theme.create({
      data: {
        conferenceId: reviewer.conferenceId,
        name,
        slug,
        source: "ADMIN",
        targetMin: 0,
        targetMax: 0,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
    await establishInitialTermState(tx, {
      themeId: created.id,
      label: created.name,
      recordedByRef: actorRef,
    });
    await setThemeCoverageTarget(tx, {
      conferenceId: reviewer.conferenceId,
      themeId: created.id,
      targetMin: bounds?.lowerBound ?? 0,
      targetMax: bounds?.upperBound ?? 0,
    });
    return tx.theme.findUniqueOrThrow({
      where: { id: created.id },
      include: { currentTermState: true },
    });
  });

  return NextResponse.json({ ok: true, theme });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const token = String(body.token ?? "");
  const themeId = String(body.themeId ?? "");

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.theme.findFirst({
    where: { id: themeId, conferenceId: reviewer.conferenceId },
    include: { currentTermState: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  const name = body.name !== undefined ? String(body.name).trim() : undefined;
  if (name !== undefined && !name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const availability =
    body.removed === true
      ? ("RETIRED" as const)
      : body.removed === false
        ? ("AVAILABLE" as const)
        : undefined;
  const source = body.source === "ADMIN" ? ("ADMIN" as const) : undefined;
  const vocabularyChange = name !== undefined || availability !== undefined || source !== undefined;
  const coverageChange = body.targetMin !== undefined || body.targetMax !== undefined;

  if (vocabularyChange && !hasApplicationCapability(reviewer.role, "MANAGE_VOCABULARY")) {
    return capabilityDenied("Vocabulary management is not permitted");
  }
  if (coverageChange && !hasApplicationCapability(reviewer.role, "MANAGE_COVERAGE_TARGETS")) {
    return capabilityDenied("Coverage target management is not permitted");
  }

  const currentTarget = coverageChange
    ? await prisma.coverageTarget.findUnique({
        where: {
          conferenceId_dimensionKey_bucketRef_measureKey: {
            conferenceId: reviewer.conferenceId,
            dimensionKey: THEME_COVERAGE_DIMENSION,
            bucketRef: themeId,
            measureKey: EFFECTIVE_PARTICIPATION_COUNT_MEASURE,
          },
        },
      })
    : null;

  const resolvedMin =
    body.targetMin !== undefined
      ? body.targetMin
      : currentTarget?.lowerBound ?? 0;
  const resolvedMax =
    body.targetMax !== undefined
      ? body.targetMax
      : currentTarget?.upperBound ?? 0;
  if (coverageChange) {
    try {
      normalizeThemeCoverageBounds(resolvedMin, resolvedMax);
    } catch (error) {
      if (error instanceof CoverageTargetValidationError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        );
      }
      throw error;
    }
  }

  const actorRef = reviewerActorRef(reviewer.id);
  const theme = await prisma.$transaction(async (tx) => {
    if (source !== undefined) {
      await tx.theme.update({ where: { id: themeId }, data: { source } });
    }
    if (coverageChange) {
      await setThemeCoverageTarget(tx, {
        conferenceId: reviewer.conferenceId,
        themeId,
        targetMin: resolvedMin,
        targetMax: resolvedMax,
      });
    }
    if (name !== undefined || availability !== undefined) {
      await recordTermState(tx, {
        themeId,
        label: name,
        availability,
        recordedByRef: actorRef,
      });
    }
    return tx.theme.findUniqueOrThrow({
      where: { id: themeId },
      include: { currentTermState: true },
    });
  });

  return NextResponse.json({ ok: true, theme });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const themeId = searchParams.get("themeId");

  if (!token || !themeId) {
    return NextResponse.json({ error: "Missing token or themeId" }, { status: 400 });
  }

  const reviewer = await getReviewerByToken(token);
  if (!reviewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasApplicationCapability(reviewer.role, "MANAGE_VOCABULARY")) {
    return capabilityDenied("Vocabulary management is not permitted");
  }

  const existing = await prisma.theme.findFirst({
    where: { id: themeId, conferenceId: reviewer.conferenceId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await recordTermState(tx, {
      themeId,
      availability: "RETIRED",
      recordedByRef: reviewerActorRef(reviewer.id),
    });
  });
  return NextResponse.json({ ok: true, softRemoved: true });
}
