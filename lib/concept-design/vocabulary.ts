import type { MigrationProvenance, Prisma, TermAvailability } from "@prisma/client";

export async function establishInitialTermState(
  tx: Prisma.TransactionClient,
  input: {
    themeId: string;
    label: string;
    availability?: TermAvailability;
    recordedByRef?: string | null;
    provenance?: MigrationProvenance;
    observedAt?: Date | null;
  }
) {
  const theme = await tx.theme.findUnique({
    where: { id: input.themeId },
    include: { currentTermState: true },
  });
  if (!theme) throw new Error("Theme/Term not found");
  if (theme.currentTermState) return theme.currentTermState;

  const state = await tx.termState.create({
    data: {
      themeId: theme.id,
      label: input.label.trim(),
      availability: input.availability ?? "AVAILABLE",
      recordedByRef: input.recordedByRef ?? null,
      recordedAt: input.provenance === "NATIVE" || !input.provenance ? new Date() : null,
      provenance: input.provenance ?? "NATIVE",
      observedAt: input.observedAt ?? null,
    },
  });
  await tx.theme.update({
    where: { id: theme.id },
    data: { currentTermStateId: state.id },
  });
  return state;
}

export async function recordTermState(
  tx: Prisma.TransactionClient,
  input: {
    themeId: string;
    label?: string;
    availability?: TermAvailability;
    recordedByRef?: string | null;
  }
) {
  const theme = await tx.theme.findUnique({
    where: { id: input.themeId },
    include: { currentTermState: true },
  });
  if (!theme) throw new Error("Theme/Term not found");

  const label = (input.label ?? theme.currentTermState?.label ?? theme.name).trim();
  const availability =
    input.availability ??
    theme.currentTermState?.availability ??
    (theme.removedAt ? "RETIRED" : "AVAILABLE");

  if (
    theme.currentTermState?.label === label &&
    theme.currentTermState.availability === availability
  ) {
    return theme.currentTermState;
  }

  const state = await tx.termState.create({
    data: {
      themeId: theme.id,
      label,
      availability,
      recordedByRef: input.recordedByRef ?? null,
      recordedAt: new Date(),
      predecessorStateId: theme.currentTermStateId,
      provenance: "NATIVE",
    },
  });

  await tx.theme.update({
    where: { id: theme.id },
    data: {
      currentTermStateId: state.id,
      name: label,
      removedAt: availability === "RETIRED" ? new Date() : null,
    },
  });

  return state;
}
