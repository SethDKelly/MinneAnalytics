import { PrismaClient } from "@prisma/client";
import {
  establishInitialTermState,
  recordTermState,
} from "../../lib/concept-design/vocabulary";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`004-B Vocabulary verification failed: ${message}`);
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const conference = await prisma.conference.create({
    data: { slug: `004-b-vocab-${suffix}`, name: "004-B Vocabulary verification" },
  });

  const theme = await prisma.$transaction(async (tx) => {
    const created = await tx.theme.create({
      data: {
        conferenceId: conference.id,
        slug: `stable-term-${suffix}`,
        name: "Initial label",
        source: "ADMIN",
      },
    });
    await establishInitialTermState(tx, {
      themeId: created.id,
      label: created.name,
      recordedByRef: "004-b-verifier",
    });
    return created;
  });

  await prisma.$transaction((tx) =>
    recordTermState(tx, {
      themeId: theme.id,
      label: "Corrected label",
      recordedByRef: "004-b-verifier",
    })
  );
  await prisma.$transaction((tx) =>
    recordTermState(tx, {
      themeId: theme.id,
      availability: "RETIRED",
      recordedByRef: "004-b-verifier",
    })
  );
  await prisma.$transaction((tx) =>
    recordTermState(tx, {
      themeId: theme.id,
      availability: "AVAILABLE",
      recordedByRef: "004-b-verifier",
    })
  );

  const current = await prisma.theme.findUniqueOrThrow({
    where: { id: theme.id },
    include: { currentTermState: true, termStates: { orderBy: { createdAt: "asc" } } },
  });

  assert(current.id === theme.id, "Term identity must remain stable across changes");
  assert(current.termStates.length === 4, "create/correct/retire/restore must preserve four states");
  assert(current.termStates[0].label === "Initial label", "initial wording must remain historical evidence");
  assert(current.termStates[1].label === "Corrected label", "correction must append rather than overwrite");
  assert(current.termStates[2].availability === "RETIRED", "retirement must be represented explicitly");
  assert(current.currentTermState?.availability === "AVAILABLE", "restoration must append an available current state");
  assert(current.name === "Corrected label" && current.removedAt === null, "Theme must remain a current-state compatibility projection");

  console.log("004-B Vocabulary TermState verification passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
