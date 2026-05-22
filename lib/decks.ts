import { prisma } from "./db";
import { readFile } from "fs/promises";
import path from "path";

export type DeckQueueItem = {
  submissionId: string;
  title: string;
  presenters: string;
  organization: string;
  deckStatus: string | null;
  deckShareable: boolean;
  vipRegistered: boolean;
  deckFileId: string | null;
  deckPublicId: string | null;
  deckFilename: string | null;
  deckVersion: number | null;
  deckMimeType: string | null;
};

export async function getDeckQueue(conferenceId: string): Promise<DeckQueueItem[]> {
  const subs = await prisma.submission.findMany({
    where: {
      conferenceId,
      programStatus: "APPROVED",
    },
    include: {
      deckFiles: { orderBy: { version: "desc" }, take: 1 },
    },
    orderBy: { title: "asc" },
  });

  return subs.map((s) => {
    const file = s.deckFiles[0];
    const presenters = s.hasCoPresenter && s.coPresenterName
      ? `${s.firstName} ${s.lastName} & ${s.coPresenterName}`
      : `${s.firstName} ${s.lastName}`;
    return {
      submissionId: s.id,
      title: s.title,
      presenters,
      organization: s.organization,
      deckStatus: s.deckStatus,
      deckShareable: s.deckShareable,
      vipRegistered: s.vipRegistered,
      deckFileId: file?.id ?? null,
      deckPublicId: file?.publicId ?? null,
      deckFilename: file?.filename ?? null,
      deckVersion: file?.version ?? null,
      deckMimeType: file?.mimeType ?? null,
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
  const conference = await prisma.conference.findUnique({
    where: { slug: conferenceSlug },
  });
  if (!conference?.decksPublished) {
    return { conference: null, decks: [] as PublicDeckItem[] };
  }

  const subs = await prisma.submission.findMany({
    where: {
      conferenceId: conference.id,
      programStatus: "APPROVED",
      deckStatus: "APPROVED",
      deckShareable: true,
      deckFiles: { some: {} },
    },
    include: {
      deckFiles: { orderBy: { version: "desc" }, take: 1 },
    },
    orderBy: { title: "asc" },
  });

  const decks: PublicDeckItem[] = subs
    .filter((s) => s.deckFiles[0])
    .map((s) => {
      const f = s.deckFiles[0]!;
      const presenters =
        s.hasCoPresenter && s.coPresenterName
          ? `${s.firstName} ${s.lastName} & ${s.coPresenterName}`
          : `${s.firstName} ${s.lastName}`;
      return {
        publicId: f.publicId,
        title: s.title,
        presenters,
        organization: s.organization,
        filename: f.filename,
        mimeType: f.mimeType,
        uploadedAt: f.uploadedAt.toISOString(),
      };
    });

  return { conference, decks };
}

export async function loadDeckFileForCommittee(
  deckFileId: string,
  conferenceId: string
) {
  return prisma.deckFile.findFirst({
    where: {
      id: deckFileId,
      submission: { conferenceId },
    },
    include: { submission: true },
  });
}

export async function loadDeckFileForPublic(publicId: string) {
  const file = await prisma.deckFile.findUnique({
    where: { publicId },
    include: {
      submission: { include: { conference: true } },
    },
  });
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
  const resolved = path.isAbsolute(storagePath)
    ? storagePath
    : path.join(process.cwd(), storagePath);
  return readFile(resolved);
}
