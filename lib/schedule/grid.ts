import { prisma } from "@/lib/db";
import {
  DEFAULT_ROOMS,
  DEFAULT_SLOT_TEMPLATE,
  templateMatchesExisting,
} from "./template";

async function createRooms(conferenceId: string) {
  await prisma.scheduleRoom.createMany({
    data: DEFAULT_ROOMS.map((name, i) => ({
      conferenceId,
      name,
      sortOrder: i,
    })),
  });
}

async function createSlots(conferenceId: string) {
  await prisma.scheduleSlot.createMany({
    data: DEFAULT_SLOT_TEMPLATE.map((s, i) => ({
      conferenceId,
      label: s.label,
      slotType: s.slotType,
      sortOrder: i,
    })),
  });
}

async function resyncSlots(conferenceId: string) {
  await prisma.schedulePlacement.deleteMany({ where: { conferenceId } });
  await prisma.scheduleSlot.deleteMany({ where: { conferenceId } });
  await createSlots(conferenceId);
}

export async function ensureScheduleGrid(conferenceId: string) {
  if (!prisma.scheduleRoom || !prisma.scheduleSlot || !prisma.schedulePlacement) {
    throw new Error(
      "Schedule models are unavailable. Run: npx prisma generate && npm run db:push"
    );
  }

  const existingRooms = await prisma.scheduleRoom.count({
    where: { conferenceId },
  });

  if (existingRooms === 0) {
    await createRooms(conferenceId);
  }

  const existingSlots = await prisma.scheduleSlot.findMany({
    where: { conferenceId },
    select: { label: true, sortOrder: true },
  });

  if (existingSlots.length === 0) {
    await createSlots(conferenceId);
  } else if (!templateMatchesExisting(existingSlots)) {
    await resyncSlots(conferenceId);
  }

  const rooms = await prisma.scheduleRoom.findMany({
    where: { conferenceId },
    orderBy: { sortOrder: "asc" },
  });
  const slots = await prisma.scheduleSlot.findMany({
    where: { conferenceId },
    orderBy: { sortOrder: "asc" },
  });

  const existingPlacements = await prisma.schedulePlacement.findMany({
    where: { conferenceId },
    select: { slotId: true, roomId: true },
  });
  const existingKeys = new Set(
    existingPlacements.map((p) => `${p.slotId}:${p.roomId}`)
  );

  const toCreate: { conferenceId: string; slotId: string; roomId: string }[] = [];
  for (const slot of slots) {
    for (const room of rooms) {
      const key = `${slot.id}:${room.id}`;
      if (!existingKeys.has(key)) {
        toCreate.push({
          conferenceId,
          slotId: slot.id,
          roomId: room.id,
        });
      }
    }
  }

  if (toCreate.length > 0) {
    await prisma.schedulePlacement.createMany({ data: toCreate });
  }
}

export async function loadScheduleState(conferenceId: string) {
  await ensureScheduleGrid(conferenceId);

  const [conference, rooms, slots, placements, approved] = await Promise.all([
    prisma.conference.findUniqueOrThrow({ where: { id: conferenceId } }),
    prisma.scheduleRoom.findMany({
      where: { conferenceId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.scheduleSlot.findMany({
      where: { conferenceId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.schedulePlacement.findMany({
      where: { conferenceId },
      include: {
        submission: {
          select: {
            id: true,
            title: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            organization: true,
            technicalLevel: true,
            isSoftSkill: true,
            degrees: true,
          },
        },
        slot: true,
        room: true,
      },
    }),
    prisma.submission.findMany({
      where: { conferenceId, programStatus: "APPROVED" },
      select: {
        id: true,
        title: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        organization: true,
        technicalLevel: true,
        isSoftSkill: true,
        degrees: true,
        schedulePlacement: { select: { id: true } },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  const unscheduled = approved
    .filter((s) => !s.schedulePlacement)
    .map(({ schedulePlacement: _, ...rest }) => rest);

  return {
    conference,
    rooms,
    slots,
    placements,
    unscheduled,
    approvedCount: approved.length,
  };
}
