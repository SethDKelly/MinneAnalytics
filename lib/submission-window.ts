import type { ConferenceStatus } from "@prisma/client";

export type SubmissionWindowState = {
  open: boolean;
  message: string;
};

export type SubmissionWindowConference = {
  status: ConferenceStatus;
  submissionsOpen: boolean;
  submissionsOpenAt: Date | null;
  submissionsCloseAt: Date | null;
  timezone: string;
};

export function getSubmissionWindowState(
  conference: SubmissionWindowConference
): SubmissionWindowState {
  if (conference.status === "ARCHIVED") {
    return { open: false, message: "This conference has been archived. Submissions are closed." };
  }
  if (conference.status === "DRAFT") {
    return { open: false, message: "This conference is not open for submissions yet." };
  }
  if (!conference.submissionsOpen) {
    return { open: false, message: "Submissions are closed by the site administrator." };
  }

  const now = new Date();
  if (conference.submissionsOpenAt && now < conference.submissionsOpenAt) {
    return {
      open: false,
      message: `Submissions open ${conference.submissionsOpenAt.toLocaleString("en-US", { timeZone: conference.timezone })}.`,
    };
  }
  if (conference.submissionsCloseAt && now > conference.submissionsCloseAt) {
    return {
      open: false,
      message: `Submissions closed ${conference.submissionsCloseAt.toLocaleString("en-US", { timeZone: conference.timezone })}.`,
    };
  }

  return { open: true, message: "" };
}
