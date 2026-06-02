import { PrismaClient, ProgramStatus } from "@prisma/client";
import { generateToken, hashToken } from "../lib/tokens";
import { serializeDegrees } from "../lib/degrees";
import { autoPopulateDemoScores } from "../lib/demo-scores";
import { ensureScheduleGrid } from "../lib/schedule/grid";
import { backfillSubmissionRevisionsV1 } from "../lib/backfill-revisions";
import {
  computeChangedFields,
  revisionSnapshotFromSubmission,
  themeIdsFromJoin,
} from "../lib/submission-revision";
import { BOARD_MEMBER_NAMES } from "../lib/roles";

const prisma = new PrismaClient();

async function main() {
  await prisma.schedulePlacement.deleteMany();
  await prisma.scheduleSlot.deleteMany();
  await prisma.scheduleRoom.deleteMany();
  await prisma.score.deleteMany();
  await prisma.deckFile.deleteMany();
  await prisma.submissionTheme.deleteMany();
  await prisma.presenterFeedback.deleteMany();
  await prisma.submissionRevision.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.reviewerAccess.deleteMany();
  await prisma.conference.deleteMany();

  const openAt = new Date("2026-01-01T14:00:00Z");
  const closeAt = new Date("2027-06-01T05:00:00Z");

  const conference = await prisma.conference.create({
    data: {
      slug: "data-tech-2027",
      name: "Data Tech 2027",
      status: "ACTIVE",
      submissionsOpen: true,
      submissionsOpenAt: openAt,
      submissionsCloseAt: closeAt,
    },
  });

  const themeDefs = [
    { slug: "leadership", name: "Leadership & Culture", targetMin: 3, targetMax: 6, sortOrder: 1 },
    { slug: "ml-ops", name: "ML Ops & Engineering", targetMin: 4, targetMax: 8, sortOrder: 2 },
    { slug: "genai", name: "GenAI & LLMs", targetMin: 2, targetMax: 5, sortOrder: 3 },
    { slug: "analytics", name: "Analytics & BI", targetMin: 3, targetMax: 7, sortOrder: 4 },
    { slug: "finops", name: "FinOps & Strategy", targetMin: 2, targetMax: 4, sortOrder: 5 },
  ];
  const themeBySlug: Record<string, string> = {};
  for (const t of themeDefs) {
    const row = await prisma.theme.create({
      data: { conferenceId: conference.id, ...t },
    });
    themeBySlug[t.slug] = row.id;
  }

  const communityTheme = await prisma.theme.create({
    data: {
      conferenceId: conference.id,
      slug: "mlops-in-production",
      name: "MLOps in production",
      source: "PRESENTER",
      proposedAt: new Date(),
      sortOrder: 6,
    },
  });
  themeBySlug["mlops-in-production"] = communityTheme.id;

  const removedTheme = await prisma.theme.create({
    data: {
      conferenceId: conference.id,
      slug: "legacy-etl",
      name: "Legacy ETL",
      source: "PRESENTER",
      proposedAt: new Date(),
      removedAt: new Date(),
      sortOrder: 7,
    },
  });
  themeBySlug["legacy-etl"] = removedTheme.id;

  const archivedConference = await prisma.conference.create({
    data: {
      slug: "data-tech-2026",
      name: "Data Tech 2026",
      status: "ARCHIVED",
      archivedAt: new Date("2026-05-01T12:00:00Z"),
      submissionsOpen: false,
      decksPublished: true,
      decksPublishedAt: new Date("2026-05-15T12:00:00Z"),
    },
  });
  await prisma.submission.create({
    data: {
      conferenceId: archivedConference.id,
      presenterTokenHash: hashToken(generateToken()),
      programStatus: "APPROVED",
      approvedAt: new Date("2026-03-01"),
      firstName: "Casey",
      lastName: "Archive",
      degrees: serializeDegrees(["MS"]),
      jobTitle: "Data Architect",
      organization: "Legacy Corp",
      title: "Building a Modern Lakehouse (2026)",
      abstract:
        "Archived demo session from last year with enough text to satisfy validation rules for historical committee review.",
      technicalLevel: 4,
      bio: "Archived speaker bio for committee history demonstration purposes only.",
      email: "casey.archive@example.com",
      zipCode: "55401",
      phone: "612-555-0199",
      linkedinUrl: "https://www.linkedin.com/in/example",
      linkedinHasPhoto: true,
      themes: {
        create: [{ themeId: themeBySlug["analytics"] }],
      },
    },
  });

  const boardTokens: Record<string, string> = {};
  for (const name of BOARD_MEMBER_NAMES) {
    boardTokens[name] = generateToken();
  }
  const coChairAToken = generateToken();
  const coChairBToken = generateToken();
  const adminToken = generateToken();

  const accessRows: Array<{
    role: "ADMIN" | "BOARD" | "CHAIR";
    label: string;
    token: string;
  }> = [
    { role: "ADMIN", label: "Site Administrator", token: adminToken },
    ...BOARD_MEMBER_NAMES.map((name) => ({
      role: "BOARD" as const,
      label: name,
      token: boardTokens[name],
    })),
    { role: "CHAIR", label: "Conference Co-Chair A", token: coChairAToken },
    { role: "CHAIR", label: "Conference Co-Chair B", token: coChairBToken },
  ];

  for (const row of accessRows) {
    await prisma.reviewerAccess.create({
      data: {
        conferenceId: conference.id,
        role: row.role,
        label: row.label,
        tokenHash: hashToken(row.token),
      },
    });
  }

  const sampleTalks: Array<{
    firstName: string;
    lastName: string;
    title: string;
    abstract: string;
    technicalLevel: number;
    isSoftSkill?: boolean;
    programStatus?: ProgramStatus;
    degrees?: string[];
    themeSlugs?: string[];
  }> = [
    {
      firstName: "Alex",
      lastName: "Rivera",
      themeSlugs: ["ml-ops"],
      title: "Practical Feature Stores for Regional Retail",
      abstract:
        "This session walks through how a mid-size retailer built a feature store on open-source tooling, with lessons on governance, latency budgets, and team handoffs between analytics and engineering.",
      technicalLevel: 4,
      programStatus: "PENDING",
      degrees: ["MS"],
    },
    {
      firstName: "Jordan",
      lastName: "Kim",
      themeSlugs: ["leadership"],
      title: "Leading Data Teams Through Budget Uncertainty",
      abstract:
        "A soft-skills focused talk on communicating tradeoffs, protecting roadmap integrity, and keeping analysts engaged when sponsorship dollars shift quarter to quarter.",
      technicalLevel: 2,
      isSoftSkill: true,
      programStatus: "PENDING",
      degrees: ["MBA"],
    },
    {
      firstName: "Sam",
      lastName: "Okafor",
      themeSlugs: ["ml-ops", "genai"],
      title: "Real-Time Fraud Signals at the Edge",
      abstract:
        "We cover streaming ingestion, model deployment patterns, and how to validate alert precision without drowning operations in false positives.",
      technicalLevel: 5,
      programStatus: "PENDING",
      degrees: ["PhD"],
    },
    {
      firstName: "Morgan",
      lastName: "Lee",
      themeSlugs: ["analytics", "leadership"],
      title: "Executive Dashboards That Executives Actually Use",
      abstract:
        "Lessons from redesigning C-suite analytics around decisions, not charts — adoption patterns, narrative structure, and governance.",
      technicalLevel: 1,
      programStatus: "PENDING",
      degrees: ["MBA"],
    },
    {
      firstName: "Riley",
      lastName: "Chen",
      title: "Negotiating Cloud Contracts for Analytics Workloads",
      abstract:
        "FinOps and procurement tactics for data teams: unit economics, commit structures, and benchmarking vendor proposals.",
      technicalLevel: 2,
      programStatus: "PENDING",
    },
    {
      firstName: "Casey",
      lastName: "Nguyen",
      title: "Bridging Product and Data Science Roadmaps",
      abstract:
        "Operating rhythms, shared metrics, and prioritization frameworks when product managers and ML engineers plan together.",
      technicalLevel: 3,
      programStatus: "PENDING",
      degrees: ["MS", "MBA"],
    },
    {
      firstName: "Taylor",
      lastName: "Brooks",
      title: "Graph Models for Supply Chain Risk",
      abstract:
        "Building and evaluating graph neural networks on supplier networks with interpretability requirements for risk officers.",
      technicalLevel: 5,
      programStatus: "PENDING",
      degrees: ["PhD"],
    },
    {
      firstName: "Jamie",
      lastName: "Patel",
      title: "Ethical AI Review Boards in Practice",
      abstract:
        "How mid-market firms stood up lightweight review processes without slowing delivery — templates and case studies.",
      technicalLevel: 3,
      programStatus: "PENDING",
    },
    {
      firstName: "Quinn",
      lastName: "Hoffman",
      title: "Modernizing Legacy BI Without a Big Bang",
      abstract:
        "Incremental migration patterns from SSRS and Cognos to cloud semantic layers while keeping finance stakeholders whole.",
      technicalLevel: 4,
      programStatus: "PENDING",
      degrees: ["MS"],
      themeSlugs: ["ml-ops", "mlops-in-production"],
    },
    {
      firstName: "Avery",
      lastName: "Walsh",
      themeSlugs: ["leadership"],
      title: "Building Analytics Partnerships with HR",
      abstract:
        "People analytics programs that respect privacy, build trust, and still deliver workforce insights to leadership.",
      technicalLevel: 2,
      programStatus: "APPROVED",
    },
    {
      firstName: "Drew",
      lastName: "Santos",
      themeSlugs: ["genai", "ml-ops"],
      title: "Vector Search Patterns for Internal Knowledge Bases",
      abstract:
        "Embedding pipelines, chunking strategies, and evaluation harnesses for enterprise RAG on Confluence and SharePoint.",
      technicalLevel: 5,
      programStatus: "APPROVED",
      degrees: ["MS"],
    },
    {
      firstName: "Blake",
      lastName: "Foster",
      themeSlugs: ["leadership"],
      title: "Stakeholder Mapping for Analytics PMs",
      abstract:
        "Practical tools for identifying sponsors, resistors, and neutral parties before launching a high-visibility analytics initiative.",
      technicalLevel: 1,
      programStatus: "DECLINED",
    },
    {
      firstName: "Skyler",
      lastName: "Reed",
      title: "Hype-Driven AI Without a Business Case",
      abstract:
        "A cautionary walkthrough of pilots that never reached production — what went wrong and how committees spot weak proposals early.",
      technicalLevel: 2,
      programStatus: "DECLINED",
      themeSlugs: ["legacy-etl"],
    },
  ];

  const presenterTokens: string[] = [];

  for (const talk of sampleTalks) {
    const presenterToken = generateToken();
    presenterTokens.push(presenterToken);
    const programStatus = talk.programStatus ?? "PENDING";
    const submission = await prisma.submission.create({
      data: {
        conferenceId: conference.id,
        presenterTokenHash: hashToken(presenterToken),
        programStatus,
        approvedAt: programStatus === "APPROVED" ? new Date() : null,
        firstName: talk.firstName,
        lastName: talk.lastName,
        degrees: serializeDegrees(talk.degrees ?? ["MS"]),
        jobTitle: "Principal Data Scientist",
        organization: "Example Corp",
        title: talk.title,
        abstract: talk.abstract,
        technicalLevel: talk.technicalLevel,
        bio: "Speaker bio for demo seed data with enough length to validate forms.",
        email: `${talk.firstName.toLowerCase()}@example.com`,
        zipCode: "55401",
        phone: "612-555-0100",
        linkedinUrl: "https://www.linkedin.com/in/example",
        linkedinHasPhoto: true,
        hasCoPresenter: false,
        travelReimbursementRequired: false,
        isSoftSkill: talk.isSoftSkill ?? false,
        themes: {
          create: (talk.themeSlugs ?? ["analytics"]).map((slug) => ({
            themeId: themeBySlug[slug],
          })),
        },
      },
    });

    if (programStatus === "APPROVED" || programStatus === "DECLINED") {
      await autoPopulateDemoScores(submission.id, conference.id, programStatus);
    }
  }

  await ensureScheduleGrid(conference.id);

  const alexSubmission = await prisma.submission.findFirst({
    where: { conferenceId: conference.id, firstName: "Alex", lastName: "Rivera" },
  });
  const danAccess = await prisma.reviewerAccess.findFirst({
    where: { conferenceId: conference.id, label: "Dan Atkins" },
  });
  if (alexSubmission && danAccess) {
    await prisma.presenterFeedback.create({
      data: {
        submissionId: alexSubmission.id,
        reviewerAccessId: danAccess.id,
        kind: "ABSTRACT",
        body: "Please clarify how you measure model drift in production and add a sentence on expected audience prerequisites.",
        abstractVersion: alexSubmission.abstractVersion,
      },
    });
    await prisma.submission.update({
      where: { id: alexSubmission.id },
      data: { abstractReviewStatus: "FEEDBACK_PENDING" },
    });
  }

  const danToken = boardTokens["Dan Atkins"];

  console.log("\n=== MinneAnalytics Conference Demo — Seed Complete ===\n");
  console.log(`Conference: ${conference.name}`);
  console.log(`Submit form:  /submit/${conference.slug}\n`);

  console.log("Site administrator (conference settings, themes, submission window):");
  console.log(`  http://localhost:3000/admin/${adminToken}\n`);

  console.log("MinneAnalytics board (score + approve + decks + schedule):");
  for (const row of accessRows.filter((r) => r.role === "BOARD")) {
    console.log(`  ${row.label}: http://localhost:3000/chair/${row.token}`);
    console.log(`    Score abstracts: http://localhost:3000/review/${row.token}`);
  }

  console.log("\nConference co-chairs (score + decks only — no approval):");
  for (const row of accessRows.filter((r) => r.role === "CHAIR")) {
    console.log(`  ${row.label}: http://localhost:3000/chair/${row.token}`);
    console.log(`    Score abstracts: http://localhost:3000/review/${row.token}`);
  }

  console.log("\nSchedule builder (board only):");
  console.log(`  http://localhost:3000/schedule/${danToken}`);

  console.log("\nHistorical committee view (board):");
  console.log(`  http://localhost:3000/chair/${danToken}?archive=data-tech-2026`);

  console.log("\nWorkflow:");
  console.log("  0. Admin configures conference at /admin/{token}");
  console.log("  1. Board + co-chairs score at /review/{token}");
  console.log("  2. Board reviews rankings & decks at /chair/{token}; approves talks");
  console.log("  3. Co-chairs review rankings & decks at /chair/{token} (no approve)");
  console.log("  4. Board builds schedule at /schedule/{token}");
  console.log("  5. Chair Balance tab: theme gaps + technicality distribution");

  await backfillSubmissionRevisionsV1();

  if (alexSubmission) {
    const alexWithThemes = await prisma.submission.findUniqueOrThrow({
      where: { id: alexSubmission.id },
      include: { themes: true, scores: true },
    });
    const themeIds = themeIdsFromJoin(alexWithThemes.themes);
    const before = {
      title: alexWithThemes.title,
      abstract: alexWithThemes.abstract,
      bio: alexWithThemes.bio,
      technicalLevel: alexWithThemes.technicalLevel,
      themeIds,
    };
    const revisedAbstract =
      `${alexWithThemes.abstract}\n\n` +
      "Update (v2): We monitor drift with weekly PSI checks on key features and retrain thresholds documented in our MLOps runbook. Audience should be comfortable with Python and basic ML concepts.";
    const after = { ...before, abstract: revisedAbstract };
    const changedFields = computeChangedFields(before, after);
    const editAt = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: alexSubmission.id },
        data: {
          abstract: after.abstract,
          abstractVersion: 2,
          abstractReviewStatus: "REVISED",
          lastPresenterEditAt: editAt,
        },
      });
      await tx.submissionRevision.create({
        data: {
          submissionId: alexSubmission.id,
          version: 2,
          ...revisionSnapshotFromSubmission(
            {
              title: after.title,
              abstract: after.abstract,
              bio: after.bio,
              technicalLevel: after.technicalLevel,
            },
            themeIds
          ),
          changedFields: JSON.stringify(changedFields),
          changeNote: "Added drift monitoring and audience prerequisites per committee feedback.",
        },
      });
    });

    const staleAt = new Date(editAt.getTime() - 2 * 24 * 60 * 60 * 1000);
    const scorerAccess = await prisma.reviewerAccess.findMany({
      where: {
        conferenceId: conference.id,
        role: { in: ["BOARD", "CHAIR"] },
      },
      take: 3,
    });
    for (const access of scorerAccess) {
      const existing = alexWithThemes.scores.find(
        (s) => s.reviewerAccessId === access.id
      );
      if (existing) continue;
      await prisma.score.create({
        data: {
          submissionId: alexSubmission.id,
          reviewerAccessId: access.id,
          value: 0.72,
          notes: "Seed score before presenter v2 revision (demo stale scores).",
          createdAt: staleAt,
          updatedAt: staleAt,
        },
      });
    }
  }

  console.log("\nPresenter portal URLs (sample):");
  presenterTokens.slice(0, 3).forEach((t, i) => {
    console.log(`  Talk ${i + 1}: http://localhost:3000/presenter/${t}`);
  });
  console.log("  (Pending/backup talks: use presenter portal to edit abstract — Phase 1 revisions)");
  const alexIdx = sampleTalks.findIndex((t) => t.firstName === "Alex");
  if (alexIdx >= 0) {
    console.log(
      `  Alex Rivera (feedback + v2 revision / stale scores demo): http://localhost:3000/presenter/${presenterTokens[alexIdx]}`
    );
  }
  console.log(
    "  Lineage: Alex Rivera is at abstract v2 (REVISED) with sample committee scores predating the edit."
  );
  console.log("\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
