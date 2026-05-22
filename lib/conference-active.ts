import { prisma } from "./db";

export async function getConferenceOrThrow(conferenceId: string) {
  return prisma.conference.findUniqueOrThrow({ where: { id: conferenceId } });
}

export async function assertConferenceAcceptsMutations(conferenceId: string) {
  const conference = await getConferenceOrThrow(conferenceId);
  if (conference.status !== "ACTIVE") {
    throw new Error("Conference is not active");
  }
  return conference;
}
