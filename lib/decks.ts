import { prisma } from "./db";
import { readFile } from "fs/promises";
import path from "path";
import { getDataDir } from "./config";
import {
  getExactPublicDeckArchive,
  loadExactDeckFileForPublic,
} from "./concept-design/publication-public-access";
import {
  deliverableReadinessLabel,
  getSemanticConferenceSubmissions,
  type DeliverableReadiness,
} from "./concept-design/semantic-reads";

export type DeckQueueItem = {
  submissionId: string;
  title: string;
  presenters: string;
  organization: string;
  readiness: DeliverableReadiness;
  readinessLabel: string;
  shareEligible: boolean;
  publicationAvailability: "published" | "unpublished";
  vipRegistered: boolean;
  deckFileId: string | null;
  deckPublicId: string | null;
  deckFilename: string | null;
  deckVersion: number | null;
  deckMimeType: string | null;
  // Compatibility aliases retained for old external/client shapes during 004-F.
  deckStatus: string | null;
  deckShareable: boolean;
};

export async function getDeckQueue(conferenceId: string): Promise<DeckQueueItem[]> {
  const submissions = await getSemanticConferenceSubmissions(conferenceId);
  return submissions
    .filter((submission) => submission.semantic.participation.effective)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((submission) => {
      const artifact = submission.deliverables[0]?.currentArtifact ?? null;
      const presenters =
        submission.hasCoPresenter && submission.coPresenterName
          ? `${submission.firstName} ${submission.lastName} & ${submission.coPresenterName}`
          : `${submission.firstName} ${submission.lastName}`;
      return {
        submissionId: submission.id,
        title: submission.title,
        presenters,
        organization: submission.organization,
        readiness: submission.semantic.deliverable.readiness,
        readinessLabel: deliverableReadinessLabel(submission.semantic.deliverable.readiness),
        shareEligible: submission.semantic.sharing.eligible,
        publicationAvailability: submission.semantic.publication.availability,
        vipRegistered: submission.vipRegistered,
        deckFileId: artifact?.id ?? null,
        deckPublicId: artifact?.publicId ?? null,
        deckFilename: artifact?.filename ?? null,
        deckVersion: artifact?.version ?? null,
        deckMimeType: artifact?.mimeType ?? null,
        deckStatus: submission.deckStatus,
        deckShareable: submission.semantic.sharing.eligible,
      };
    });
}

export type PublicDeckItem = {
  publicId: string;
  title: string;
  presenters: string;
  organization: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;
};

export async function getPublicDeckArchive(conferenceSlug: string) {
  const exact = await getExactPublicDeckArchive(conferenceSlug);
  if (exact.exactMode) {
    return {
      conference: exact.conference,
      decks: exact.decks as PublicDeckItem[],
    };
  }

  // Read rollback is permitted only for conferences that have never crossed the
  // irreversible PublicationPolicyCutover floor established by 004-E.
  const conference =
    exact.conference ??
    (await prisma.conference.findUnique({ where: { slug: conferenceSlug } }));
  if (!conference?.decksPublished) {
    return { conference: null, decks: [] as PublicDeckItem[] };
  }

  const submissions = await prisma.submission.findMany({
    where: {
      conferenceId: conference.id,
      programStatus: "APPROVED",
      deckStatus: "APPROVED",
      deckShareable: true,
      deckFiles: { some: {} },
    },
    include: { deckFiles: { orderBy: { version: "desc" }, take: 1 } },
    orderBy: { title: "asc" },
  });

  const decks: PublicDeckItem[] = submissions
    .filter((submission) => submission.deckFiles[0])
    .map((submission) => {
      const file = submission.deckFiles[0]!;
      const presenters =
        submission.hasCoPresenter && submission.coPresenterName
          ? `${submission.firstName} ${submission.lastName} & ${submission.coPresenterName}`
          : `${submission.firstName} ${submission.lastName}`;
      return {
        publicId: file.publicId,
        title: submission.title,
        presenters,
        organization: submission.organization,
        filename: file.filename,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt.toISOString(),
      };
    });

  return { conference, decks };
}

export async function loadDeckFileForCommittee(
  deckFileId: string,
  conferenceId: string
) {
  return prisma.deckFile.findFirst({
    where: { id: deckFileId, submission: { conferenceId } },
    include: { submission: true },
  });
}

export async function loadDeckFileForPublic(publicId: string) {
  const exact = await loadExactDeckFileForPublic(publicId);
  if (exact.exactMode) return exact.file;

  const file =
    exact.file ??
    (await prisma.deckFile.findUnique({
      where: { publicId },
      include: { submission: { include: { conference: true } } },
    }));
  if (!file) return null;
  const { submission } = file;
  if (
    !submission.conference.decksPublished ||
    !submission.deckShareable ||
    submission.programStatus !== "APPROVED" ||
    submission.deckStatus !== "APPROVED"
  ) {
    return null;
  }
  return file;
}

export async function readDeckBytes(storagePath: string): Promise<Buffer> {
  const base = getDataDir();
  const resolved = path.isAbsolute(storagePath)
    ? storagePath
    : path.join(base, storagePath);
  return readFile(resolved);
}
