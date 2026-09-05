import type {
  DeckStatus,
  MigrationProvenance,
  ProgramStatus,
  SelectionDisposition,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { aggregateScores, EMPTY_AGGREGATE } from "@/lib/scoring";
import { isImplementationGateEnabled } from "@/lib/concept-design/implementation-gates";
import { programStatusFromCanonical } from "@/lib/concept-design/selection-participation-deliverable";

const DECK_DELIVERABLE_KIND = "deck";
const DECK_ARCHIVE_SURFACE = "deck-archive";

export type SemanticReadSource = "canonical" | "compatibility-fallback";
export type ParticipationReason =
  | "selected"
  | "reserve"
  | "not-selected"
  | "withdrawn"
  | "undecided";
export type DeliverableReadiness =
  | "not-required"
  | "not-provided"
  | "awaiting-review"
  | "concern"
  | "ready";
export type EvaluationApplicability =
  | "never-evaluated"
  | "current-revision"
  | "revision-changed"
  | "legacy-subject-unknown";

export type SemanticSubmissionState = {
  readSource: SemanticReadSource;
  revision: {
    currentRevisionRef: string | null;
    ordinal: number;
  };
  selection: {
    disposition: SelectionDisposition | null;
    decisionRef: string | null;
    decidedAt: string | null;
  };
  withdrawal: {
    withdrawn: boolean;
    withdrawalRef: string | null;
    withdrawnAt: string | null;
  };
  participation: {
    effective: boolean;
    reason: ParticipationReason;
  };
  evaluation: {
    currentRevisionEvaluationCount: number;
    aggregate: { count: number; sum: number; average: number };
  };
  deliverable: {
    requirementRef: string | null;
    currentArtifactVersionRef: string | null;
    versionOrdinal: number | null;
    readiness: DeliverableReadiness;
    assessmentRef: string | null;
  };
  sharing: {
    eligible: boolean;
    changeRef: string | null;
    provenance: MigrationProvenance | "LEGACY_COMPATIBILITY";
  };
  publication: {
    publicationRef: string | null;
    materialRef: string | null;
    availability: "published" | "unpublished";
  };
};

export type CompatibilityReadParity = {
  storedProgramStatus: ProgramStatus;
  projectedProgramStatus: ProgramStatus;
  programStatusMatches: boolean;
  storedAbstractVersion: number;
  projectedAbstractVersion: number;
  abstractVersionMatches: boolean;
  storedDeckStatus: DeckStatus | null;
  projectedDeckStatus: DeckStatus | null;
  deckStatusMatches: boolean;
  storedDeckShareable: boolean;
  projectedDeckShareable: boolean;
  deckShareableMatches: boolean;
};

function dispositionFromCompatibility(status: ProgramStatus): SelectionDisposition | null {
  if (status === "APPROVED") return "SELECTED";
  if (status === "BACKUP") return "RESERVE";
  if (status === "DECLINED") return "NOT_SELECTED";
  return null;
}

function participationReason(
  disposition: SelectionDisposition | null,
  withdrawn: boolean
): ParticipationReason {
  if (withdrawn) return "withdrawn";
  if (disposition === "SELECTED") return "selected";
  if (disposition === "RESERVE") return "reserve";
  if (disposition === "NOT_SELECTED") return "not-selected";
  return "undecided";
}

function deliverableReadiness(input: {
  effectivelyParticipating: boolean;
  requirementId: string | null;
  artifactId: string | null;
  assessmentDisposition: "CONCERN" | "READY" | null;
}): DeliverableReadiness {
  if (!input.effectivelyParticipating && !input.requirementId) return "not-required";
  if (!input.artifactId) return "not-provided";
  if (!input.assessmentDisposition) return "awaiting-review";
  return input.assessmentDisposition === "READY" ? "ready" : "concern";
}

export function deckStatusFromReadiness(readiness: DeliverableReadiness): DeckStatus | null {
  if (readiness === "ready") return "APPROVED";
  if (readiness === "concern") return "CONCERN";
  if (readiness === "awaiting-review") return "SUBMITTED";
  return null;
}

export function selectionLabel(disposition: SelectionDisposition | null): string {
  if (disposition === "SELECTED") return "Selected";
  if (disposition === "RESERVE") return "Reserve";
  if (disposition === "NOT_SELECTED") return "Not selected";
  return "Undecided";
}

export function participationLabel(state: SemanticSubmissionState["participation"]): string {
  if (state.reason === "withdrawn") return "Withdrawn";
  return state.effective ? "Participating" : "Not participating";
}

export function deliverableReadinessLabel(readiness: DeliverableReadiness): string {
  if (readiness === "not-required") return "Not required";
  if (readiness === "not-provided") return "Awaiting deck";
  if (readiness === "awaiting-review") return "Awaiting review";
  if (readiness === "concern") return "Changes requested";
  return "Ready";
}

export async function getSemanticConferenceSubmissions(conferenceId: string) {
  const canonicalReads = isImplementationGateEnabled("semanticReads");
  const submissions = await prisma.submission.findMany({
    where: { conferenceId },
    include: {
      currentRevision: {
        include: {
          revisionTerms: {
            include: { theme: { select: { name: true, removedAt: true } } },
          },
        },
      },
      currentSelectionDecision: true,
      withdrawal: true,
      currentShareEligibilityChange: true,
      scores: true,
      revisions: { orderBy: { version: "desc" }, take: 1 },
      themes: {
        select: { themeId: true, theme: { select: { name: true, removedAt: true } } },
      },
      deliverables: {
        where: { kindKey: DECK_DELIVERABLE_KIND },
        take: 1,
        include: {
          currentArtifact: {
            include: {
              currentAssessment: true,
              publications: {
                where: { publicSurfaceKey: DECK_ARCHIVE_SURFACE },
                take: 1,
                include: { currentState: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return submissions.map((submission) => {
    const canonicalRevision = submission.currentRevision;
    const useCanonical = canonicalReads && Boolean(canonicalRevision);
    const disposition = useCanonical
      ? submission.currentSelectionDecision?.disposition ?? null
      : dispositionFromCompatibility(submission.programStatus);
    const withdrawn = useCanonical
      ? Boolean(submission.withdrawal)
      : submission.programStatus === "WITHDRAWN";
    const effective = disposition === "SELECTED" && !withdrawn;
    const currentRevisionId = useCanonical ? canonicalRevision?.id ?? null : null;
    const ordinal = useCanonical
      ? canonicalRevision?.version ?? submission.abstractVersion
      : submission.abstractVersion;
    const evaluationHistory = submission.scores;
    const currentScores = useCanonical && currentRevisionId
      ? evaluationHistory.filter((score) => score.submissionRevisionId === currentRevisionId)
      : evaluationHistory.filter(
          (score) => score.scoredAbstractVersion === submission.abstractVersion
        );
    const deliverable = submission.deliverables[0] ?? null;
    const artifact = useCanonical ? deliverable?.currentArtifact ?? null : null;
    const assessment = artifact?.currentAssessment ?? null;
    const readiness = useCanonical
      ? deliverableReadiness({
          effectivelyParticipating: effective,
          requirementId: deliverable?.id ?? null,
          artifactId: artifact?.id ?? null,
          assessmentDisposition: assessment?.disposition ?? null,
        })
      : submission.deckStatus === "APPROVED"
        ? "ready"
        : submission.deckStatus === "CONCERN"
          ? "concern"
          : submission.deckStatus
            ? "awaiting-review"
            : effective
              ? "not-provided"
              : "not-required";
    const sharingEligible = useCanonical
      ? submission.currentShareEligibilityChange?.eligible ?? submission.deckShareable
      : submission.deckShareable;
    const publication = artifact?.publications[0] ?? null;
    const published = Boolean(
      useCanonical && publication?.currentState?.availability === "PUBLISHED"
    );
    const projectedProgramStatus = programStatusFromCanonical({ disposition, withdrawn });
    const projectedDeckStatus = deckStatusFromReadiness(readiness);
    const exactAggregate = aggregateScores(currentScores.map((score) => score.value));
    const semantic: SemanticSubmissionState = {
      readSource: useCanonical ? "canonical" : "compatibility-fallback",
      revision: { currentRevisionRef: currentRevisionId, ordinal },
      selection: {
        disposition,
        decisionRef: useCanonical ? submission.currentSelectionDecision?.id ?? null : null,
        decidedAt: useCanonical
          ? submission.currentSelectionDecision?.decidedAt?.toISOString() ?? null
          : null,
      },
      withdrawal: {
        withdrawn,
        withdrawalRef: useCanonical ? submission.withdrawal?.id ?? null : null,
        withdrawnAt: useCanonical
          ? submission.withdrawal?.withdrawnAt?.toISOString() ?? null
          : submission.withdrawnAt?.toISOString() ?? null,
      },
      participation: {
        effective,
        reason: participationReason(disposition, withdrawn),
      },
      evaluation: {
        currentRevisionEvaluationCount: currentScores.length,
        aggregate: currentScores.length > 0 ? exactAggregate : EMPTY_AGGREGATE,
      },
      deliverable: {
        requirementRef: useCanonical ? deliverable?.id ?? null : null,
        currentArtifactVersionRef: useCanonical ? artifact?.id ?? null : null,
        versionOrdinal: useCanonical ? artifact?.version ?? null : null,
        readiness,
        assessmentRef: useCanonical ? assessment?.id ?? null : null,
      },
      sharing: {
        eligible: sharingEligible,
        changeRef: useCanonical ? submission.currentShareEligibilityChange?.id ?? null : null,
        provenance: useCanonical
          ? submission.currentShareEligibilityChange?.provenance ?? "LEGACY_COMPATIBILITY"
          : "LEGACY_COMPATIBILITY",
      },
      publication: {
        publicationRef: useCanonical ? publication?.id ?? null : null,
        materialRef: useCanonical ? artifact?.id ?? null : null,
        availability: published ? "published" : "unpublished",
      },
    };
    const compatibility: CompatibilityReadParity = {
      storedProgramStatus: submission.programStatus,
      projectedProgramStatus,
      programStatusMatches: submission.programStatus === projectedProgramStatus,
      storedAbstractVersion: submission.abstractVersion,
      projectedAbstractVersion: ordinal,
      abstractVersionMatches: submission.abstractVersion === ordinal,
      storedDeckStatus: submission.deckStatus,
      projectedDeckStatus,
      deckStatusMatches:
        submission.deckStatus === projectedDeckStatus || submission.deckStatus === "REVIEWED",
      storedDeckShareable: submission.deckShareable,
      projectedDeckShareable: sharingEligible,
      deckShareableMatches: submission.deckShareable === sharingEligible,
    };
    const canonicalThemes = useCanonical && canonicalRevision
      ? canonicalRevision.revisionTerms.map((term) => ({
          themeId: term.themeId,
          theme: term.theme,
        }))
      : submission.themes;

    return {
      ...submission,
      title: useCanonical && canonicalRevision ? canonicalRevision.title : submission.title,
      abstract: useCanonical && canonicalRevision ? canonicalRevision.abstract : submission.abstract,
      bio: useCanonical && canonicalRevision ? canonicalRevision.bio : submission.bio,
      technicalLevel:
        useCanonical && canonicalRevision
          ? canonicalRevision.technicalLevel
          : submission.technicalLevel,
      abstractVersion: ordinal,
      programStatus: projectedProgramStatus,
      deckStatus: projectedDeckStatus,
      deckShareable: sharingEligible,
      themes: canonicalThemes,
      scores: currentScores,
      evaluationHistory,
      semantic,
      compatibility,
    };
  });
}

export type SemanticConferenceSubmission = Awaited<
  ReturnType<typeof getSemanticConferenceSubmissions>
>[number];

export function evaluationApplicabilityForReviewer(
  submission: SemanticConferenceSubmission,
  reviewerAccessId: string
): {
  state: EvaluationApplicability;
  evaluationRef: string | null;
  subjectRevisionRef: string | null;
  value: number | null;
  notes: string | null;
} {
  const currentRevisionRef = submission.semantic.revision.currentRevisionRef;
  const evaluations = submission.evaluationHistory.filter(
    (score) => score.reviewerAccessId === reviewerAccessId
  );
  const exact = currentRevisionRef
    ? evaluations.find((score) => score.submissionRevisionId === currentRevisionRef)
    : undefined;
  if (exact) {
    return {
      state: "current-revision",
      evaluationRef: exact.id,
      subjectRevisionRef: exact.submissionRevisionId,
      value: exact.value,
      notes: exact.notes,
    };
  }
  const any = evaluations[0];
  if (!any) {
    return {
      state: "never-evaluated",
      evaluationRef: null,
      subjectRevisionRef: null,
      value: null,
      notes: null,
    };
  }
  if (!any.submissionRevisionId) {
    return {
      state: "legacy-subject-unknown",
      evaluationRef: any.id,
      subjectRevisionRef: null,
      value: any.value,
      notes: any.notes,
    };
  }
  return {
    state: "revision-changed",
    evaluationRef: any.id,
    subjectRevisionRef: any.submissionRevisionId,
    value: any.value,
    notes: any.notes,
  };
}

export async function getSemanticCapacitySnapshot(conferenceId: string) {
  const [conference, pool, submissions] = await Promise.all([
    prisma.conference.findUniqueOrThrow({ where: { id: conferenceId } }),
    prisma.capacityPool.findUnique({
      where: { conferenceId_key: { conferenceId, key: "program-slots" } },
      include: { allocations: { where: { releasedAt: null } } },
    }),
    getSemanticConferenceSubmissions(conferenceId),
  ]);

  const limit =
    pool?.limitUnits ??
    Math.max(
      0,
      conference.rooms * conference.sessionsPerRoom - conference.eodTrim - conference.graemeSlots
    );
  const committed = pool
    ? pool.allocations.reduce((sum, allocation) => sum + allocation.unitsApplied, 0)
    : submissions.filter((submission) => submission.semantic.participation.effective).length;
  const selectedCommunity = submissions.filter(
    (submission) =>
      submission.semantic.participation.effective && !submission.isSponsorSession
  ).length;
  const reserve = submissions.filter(
    (submission) => submission.semantic.selection.disposition === "RESERVE"
  ).length;
  const undecided = submissions.filter(
    (submission) =>
      submission.semantic.selection.disposition === null &&
      !submission.semantic.withdrawal.withdrawn
  ).length;
  const sponsorSessions = submissions.filter(
    (submission) =>
      submission.semantic.participation.effective && submission.isSponsorSession
  ).length;

  return {
    totalSlots: limit,
    approved: selectedCommunity,
    backup: reserve,
    pending: undecided,
    sponsorSessions,
    remaining: Math.max(0, limit - committed),
    committed,
    source: pool ? ("capacity-ledger" as const) : ("compatibility-fallback" as const),
  };
}
