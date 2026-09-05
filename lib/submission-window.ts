import type { ConferenceStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  observeOfferAvailability,
  PROPOSAL_OFFER_WINDOW_KEY,
} from "@/lib/concept-design/lifecycle-disclosure-policy";

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

/**
 * Compatibility-only synchronous projection retained for external callers that have not
 * yet loaded the canonical AvailabilityWindow/Archive relations. First-party UI uses
 * getProposalOfferAvailability below.
 */
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
      message: `Submissions open ${conference.submissionsOpenAt.toLocaleString("en-US", {
        timeZone: conference.timezone,
      })}.`,
    };
  }
  if (conference.submissionsCloseAt && now >= conference.submissionsCloseAt) {
    return {
      open: false,
      message: `Submissions closed ${conference.submissionsCloseAt.toLocaleString("en-US", {
        timeZone: conference.timezone,
      })}.`,
    };
  }
  return { open: true, message: "" };
}

export async function getProposalOfferAvailability(
  conferenceId: string,
  now = new Date()
) {
  const conference = await prisma.conference.findUnique({
    where: { id: conferenceId },
    include: {
      archiveRecord: true,
      availabilityWindows: {
        where: { opportunityKey: PROPOSAL_OFFER_WINDOW_KEY },
        take: 1,
      },
    },
  });
  if (!conference) return null;
  const state = observeOfferAvailability(
    conference,
    conference.availabilityWindows[0] ?? null,
    now
  );
  return {
    conference,
    state,
    window: conference.availabilityWindows[0] ?? null,
  };
}
