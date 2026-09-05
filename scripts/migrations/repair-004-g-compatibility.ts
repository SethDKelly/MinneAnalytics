import { PrismaClient } from "@prisma/client";
import { repairConferenceCompatibilityProjections } from "../../lib/concept-design/compatibility-repair";

const prisma = new PrismaClient();

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const all = process.argv.includes("--all");
  const conferenceId = argValue("--conference-id");

  if (!apply) {
    throw new Error(
      "Compatibility repair is a write operation. Re-run with --apply after confirming the target scope."
    );
  }
  if ((all && conferenceId) || (!all && !conferenceId)) {
    throw new Error("Specify exactly one of --conference-id <id> or --all.");
  }

  const conferenceIds = all
    ? (await prisma.conference.findMany({ select: { id: true }, orderBy: { createdAt: "asc" } })).map(
        (conference) => conference.id
      )
    : [conferenceId as string];

  const results = [];
  for (const id of conferenceIds) {
    const exists = await prisma.conference.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new Error(`Conference not found: ${id}`);
    results.push(await repairConferenceCompatibilityProjections(id));
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "canonical-to-compatibility-repair",
        results,
        nextStep:
          "Validate compatibility parity before setting MINNE_V0_SEMANTIC_READS=false. Canonical writer authority remains enabled.",
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
