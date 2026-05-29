import type { MudacJudgeType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getNextPanelSortOrder } from "@/lib/mudac/queries";

const DEFAULT_SLOT_TYPES: MudacJudgeType[] = [
  "ACADEMIC",
  "INDUSTRY_BUSINESS",
  "INDUSTRY_TECHNICAL",
];

export async function createPanelWithSlots(
  eventId: string,
  label: string,
  judgesPerPanel: number
) {
  const sortOrder = await getNextPanelSortOrder(eventId);

  return prisma.$transaction(async (tx) => {
    const panel = await tx.mudacJudgePanel.create({
      data: { eventId, label, sortOrder },
    });

    for (let slotIndex = 0; slotIndex < judgesPerPanel; slotIndex++) {
      const judgeType =
        DEFAULT_SLOT_TYPES[slotIndex] ?? "GENERAL";
      await tx.mudacPanelSlotRequirement.create({
        data: { panelId: panel.id, slotIndex, judgeType },
      });
    }

    return panel;
  });
}

export async function ensurePanelSlotCount(panelId: string, judgesPerPanel: number) {
  const existing = await prisma.mudacPanelSlotRequirement.findMany({
    where: { panelId },
    orderBy: { slotIndex: "asc" },
  });

  if (existing.length === judgesPerPanel) return;

  if (existing.length > judgesPerPanel) {
    const toRemove = existing.filter((s) => s.slotIndex >= judgesPerPanel);
    for (const slot of toRemove) {
      await prisma.mudacPanelAssignment.deleteMany({
        where: { panelId, slotIndex: slot.slotIndex },
      });
      await prisma.mudacPanelSlotRequirement.delete({ where: { id: slot.id } });
    }
    return;
  }

  for (let slotIndex = existing.length; slotIndex < judgesPerPanel; slotIndex++) {
    await prisma.mudacPanelSlotRequirement.create({
      data: {
        panelId,
        slotIndex,
        judgeType: DEFAULT_SLOT_TYPES[slotIndex] ?? "GENERAL",
      },
    });
  }
}
