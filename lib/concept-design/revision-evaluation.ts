import type { MigrationProvenance, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  consumeRevisionException,
  revealPeerAggregateForEvaluation,
} from "@/lib/concept-design/lifecycle-disclosure-policy";

export type RevisionSnapshotInput = {
  title: string;
  abstract: string;
  bio: string;
  technicalLevel: number;
  themeIds: string[];
};

export class CanonicalRevisionUnavailableError extends Error {
  readonly code = "CANONICAL_REVISION_REQUIRED";

  constructor(message = "An exact current revision is required for this operation") {
    super(message);
    this.name = "CanonicalRevisionUnavailableError";
  }
}

export class StaleRevisionHeadError extends Error {
  readonly code = "REVISION_STALE_HEAD";

  constructor(message = "The submission changed after this edit was loaded") {
    super(message);
    this.name = "StaleRevisionHeadError";
  }
}

export class RevisionCommandConflictError extends Error {
  readonly code = "REVISION_COMMAND_CONFLICT";

  constructor(message = "The revision command key is already associated with another submission") {
    super(message);
    this.name = "RevisionCommandConflictError";
  }
}

function normalizedThemeIds(themeIds: string[]): string[] {
  return [...new Set(themeIds)].sort();
}

function legacyThemeSnapshot(themeIds: string[]): string {
  return JSON.stringify(normalizedThemeIds(themeIds));
}

export function exactEvaluationKey(
  reviewerAccessId: string,
  submissionRevisionId: string
): string {
  return `${reviewerAccessId}:${submissionRevisionId}`;
}

async function establishRevisionTerms(
  tx: Prisma.TransactionClient,
  revisionId: string,
  themeIds: string[]
) {
  for (const themeId of normalizedThemeIds(themeIds)) {
    await tx.revisionTerm.upsert({
      where: {
        submissionRevisionId_themeId: {
          submissionRevisionId: revisionId,
          themeId,
        },
      },
      update: {},
      create: {
        submissionRevisionId: revisionId,
        themeId,
      },
    });
  }
}

export async function establishInitialRevision(
  tx: Prisma.TransactionClient,
  input: {
    submissionId: string;
    snapshot: RevisionSnapshotInput;
    provenance?: MigrationProvenance;
    observedAt?: Date | null;
  }
) {
  const existing = await tx.submissionRevision.findUnique({
    where: {
      submissionId_version: {
        submissionId: input.submissionId,
        version: 1,
      },
    },
  });

  const revision =
    existing ??
    (await tx.submissionRevision.create({
      data: {
        submissionId: input.submissionId,
        version: 1,
        title: input.snapshot.title,
        abstract: input.snapshot.abstract,
        bio: input.snapshot.bio,
        technicalLevel: input.snapshot.technicalLevel,
        themeIds: legacyThemeSnapshot(input.snapshot.themeIds),
        changedFields: JSON.stringify([]),
        provenance: input.provenance ?? "NATIVE",
        observedAt: input.observedAt ?? null,
      },
    }));

  await establishRevisionTerms(tx, revision.id, input.snapshot.themeIds);
  await tx.submission.update({
    where: { id: input.submissionId },
    data: { currentRevisionId: revision.id, abstractVersion: revision.version },
  });

  return revision;
}

export async function appendCanonicalRevision(input: {
  submissionId: string;
  expectedRevisionId?: string | null;
  commandKey?: string | null;
  requireExpectedHead?: boolean;
  snapshot: RevisionSnapshotInput;
  changedFields: string[];
  changeNote?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    if (input.commandKey) {
      const replay = await tx.submissionRevision.findUnique({
        where: { commandKey: input.commandKey },
      });
      if (replay) {
        if (replay.submissionId !== input.submissionId) {
          throw new RevisionCommandConflictError();
        }
        return { revision: replay, replayed: true };
      }
    }

    const submission = await tx.submission.findUnique({
      where: { id: input.submissionId },
      include: { currentRevision: true },
    });
    if (!submission?.currentRevisionId || !submission.currentRevision) {
      throw new CanonicalRevisionUnavailableError();
    }

    if (input.requireExpectedHead && !input.expectedRevisionId) {
      throw new StaleRevisionHeadError("An expected revision head is required");
    }
    if (
      input.expectedRevisionId &&
      input.expectedRevisionId !== submission.currentRevisionId
    ) {
      throw new StaleRevisionHeadError();
    }

    const themeIds = normalizedThemeIds(input.snapshot.themeIds);
    const nextVersion = submission.currentRevision.version + 1;
    const revision = await tx.submissionRevision.create({
      data: {
        submissionId: input.submissionId,
        predecessorRevisionId: submission.currentRevision.id,
        version: nextVersion,
        title: input.snapshot.title,
        abstract: input.snapshot.abstract,
        bio: input.snapshot.bio,
        technicalLevel: input.snapshot.technicalLevel,
        themeIds: legacyThemeSnapshot(themeIds),
        changedFields: JSON.stringify(input.changedFields),
        changeNote: input.changeNote?.trim() || null,
        commandKey: input.commandKey || null,
        provenance: "NATIVE",
      },
    });

    await establishRevisionTerms(tx, revision.id, themeIds);
    await tx.submissionTheme.deleteMany({ where: { submissionId: input.submissionId } });
    await tx.submission.update({
      where: { id: input.submissionId },
      data: {
        currentRevisionId: revision.id,
        title: input.snapshot.title,
        abstract: input.snapshot.abstract,
        bio: input.snapshot.bio,
        technicalLevel: input.snapshot.technicalLevel,
        abstractVersion: revision.version,
        abstractReviewStatus: "REVISED",
        lastPresenterEditAt: new Date(),
        themes: {
          create: themeIds.map((themeId) => ({ themeId })),
        },
      },
    });
    await consumeRevisionException(
      tx,
      input.submissionId,
      submission.currentRevision.id
    );

    return { revision, replayed: false };
  });
}

export async function recordCanonicalEvaluation(input: {
  submissionId: string;
  reviewerAccessId: string;
  value: number;
  notes?: string | null;
  revealPeerAggregate?: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    const submission = await tx.submission.findUnique({
      where: { id: input.submissionId },
      include: {
        currentRevision: true,
        conference: {
          select: { id: true, blindReviewEnabled: true },
        },
      },
    });
    if (!submission?.currentRevisionId || !submission.currentRevision) {
      throw new CanonicalRevisionUnavailableError();
    }

    const key = exactEvaluationKey(
      input.reviewerAccessId,
      submission.currentRevisionId
    );

    const evaluation = await tx.score.upsert({
      where: { exactEvaluationKey: key },
      create: {
        submissionId: input.submissionId,
        reviewerAccessId: input.reviewerAccessId,
        submissionRevisionId: submission.currentRevisionId,
        exactEvaluationKey: key,
        value: input.value,
        notes: input.notes ?? null,
        scoredAbstractVersion: submission.currentRevision.version,
      },
      update: {
        value: input.value,
        notes: input.notes ?? null,
        submissionRevisionId: submission.currentRevisionId,
        scoredAbstractVersion: submission.currentRevision.version,
      },
    });

    let disclosureMode: "not-requested" | "ordinary-visible" | "legacy-unknown" | "revealed" =
      "not-requested";
    if (input.revealPeerAggregate) {
      const reviewer = await tx.reviewerAccess.findUnique({
        where: { id: input.reviewerAccessId },
        select: { id: true, conferenceId: true, createdAt: true },
      });
      if (!reviewer || reviewer.conferenceId !== submission.conferenceId) {
        throw new Error("Evaluation reviewer is outside the submission context");
      }
      const disclosure = await revealPeerAggregateForEvaluation(tx, {
        conference: submission.conference,
        reviewer,
        submissionId: submission.id,
        revision: submission.currentRevision,
      });
      disclosureMode = disclosure.mode;
    }

    return {
      evaluation,
      revisionId: submission.currentRevisionId,
      revisionVersion: submission.currentRevision.version,
      disclosureMode,
    };
  });
}
