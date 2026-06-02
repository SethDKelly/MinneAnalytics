import type {
  AbstractReviewStatus,
  ProgramStatus,
  Submission,
  SubmissionTheme,
} from "@prisma/client";

export const EDITABLE_REVISION_FIELDS = [
  "title",
  "abstract",
  "bio",
  "technicalLevel",
  "themes",
] as const;

export type EditableRevisionField = (typeof EDITABLE_REVISION_FIELDS)[number];

export function canPresenterEditSubmission(submission: {
  programStatus: ProgramStatus;
  abstractReviewStatus: AbstractReviewStatus;
}): boolean {
  if (submission.programStatus === "WITHDRAWN") return false;
  if (submission.programStatus === "DECLINED") return false;
  if (submission.programStatus === "APPROVED") return false;
  if (
    submission.programStatus === "PENDING" ||
    submission.programStatus === "BACKUP"
  ) {
    return true;
  }
  return submission.abstractReviewStatus === "FEEDBACK_PENDING";
}

export function themeIdsFromJoin(themes: SubmissionTheme[]): string[] {
  return themes.map((t) => t.themeId).sort();
}

export function computeChangedFields(
  before: {
    title: string;
    abstract: string;
    bio: string;
    technicalLevel: number;
    themeIds: string[];
  },
  after: {
    title: string;
    abstract: string;
    bio: string;
    technicalLevel: number;
    themeIds: string[];
  }
): EditableRevisionField[] {
  const changed: EditableRevisionField[] = [];
  if (before.title !== after.title) changed.push("title");
  if (before.abstract !== after.abstract) changed.push("abstract");
  if (before.bio !== after.bio) changed.push("bio");
  if (before.technicalLevel !== after.technicalLevel) changed.push("technicalLevel");
  const a = [...before.themeIds].sort().join(",");
  const b = [...after.themeIds].sort().join(",");
  if (a !== b) changed.push("themes");
  return changed;
}

export function revisionSnapshotFromSubmission(
  submission: Pick<
    Submission,
    "title" | "abstract" | "bio" | "technicalLevel"
  >,
  themeIds: string[]
) {
  return {
    title: submission.title,
    abstract: submission.abstract,
    bio: submission.bio,
    technicalLevel: submission.technicalLevel,
    themeIds: JSON.stringify([...themeIds].sort()),
    changedFields: JSON.stringify([]),
  };
}
