# MinneMUDAC judging demo — architecture

Isolated extension for student team judging at [MinneMUDAC](https://minneanalytics.org/minnemudac-2026/). It does **not** share Prisma models with the Data Tech conference (`Conference`, `Submission`, etc.).

For the conference planning demo, see [Architecture](architecture.md).

## Stack and auth

Same Next.js 15 + Prisma + Tailwind stack as the main app. Auth is **token-in-URL** (SHA-256 hash stored in the database):

| Role | Model | Route |
|------|-------|-------|
| Tournament director | `MudacDirectorAccess` | `/mudac/director/{token}` |
| Judge | `MudacJudge` | `/mudac/judge/{token}` |

Judges may self-register at `/mudac/{slug}/register` when `registrationOpen` is true and an optional registration code matches.

## Domain model

```
MudacEvent
├── MudacScoringCriterion[]     (flexible count, weighted max points)
├── MudacTeam[]                   (displayId, division)
├── MudacJudgePanel[]             (label, sort order)
│   ├── MudacPanelSlotRequirement[]  (slot index → judge type)
│   └── MudacPanelAssignment[]       (judge ↔ slot)
├── MudacJudge[]
├── MudacDirectorAccess[]
└── MudacPresentation[]           (one team per panel)
    └── MudacJudgeScorecard[]     (one per judge per presentation)
        └── MudacCriterionScore[]
```

### Divisions

`UNDERGRADUATE`, `GRADUATE`, `POST_GRADUATE` on `MudacTeam`.

### Event lifecycle

`MudacEventStatus`: `DRAFT` → `REGISTRATION_OPEN` → `JUDGING` → `LOCKED` → `ARCHIVED`.

`scoringLocked` blocks judge scorecard writes. Setting status to `LOCKED` also sets `scoringLocked`.

## Scoring pipeline

Implemented in `lib/mudac/scoring.ts` and `lib/mudac/aggregation.ts`:

```
Criterion scores (per judge)
  → Judge subtotal = Σ (value × weight)
  → Panel score = SUM or MEAN of judge subtotals (event.panelAggregateMode)
  → Division ranking (sort by panel score, or normalized / z-score view)
```

| Ranking display | Meaning |
|-----------------|--------|
| Panel aggregate | Raw panel score (sum or mean) |
| Judge-normalized | Panel aggregate using each judge’s % of max possible |
| Z-score | Standard score within division (for comparison) |

Incomplete panels (not all judges submitted) still appear in rankings with a **partial** flag.

## Director dashboard tabs

| Tab | Purpose |
|-----|---------|
| Setup | Status, registration, scoring lock, panel defaults |
| Criteria | Scoring rubric |
| Teams | Team IDs and divisions |
| Panels | Panel CRUD, slot types, judge assignment |
| Presentations | Team ↔ panel schedule |
| Scorecards | Matrix + judge drill-down |
| Rankings | Division leaderboards, CSV export |

## API routes (`app/api/mudac/`)

| Method | Path | Actor |
|--------|------|-------|
| `POST` | `/api/mudac/register` | Public |
| `POST` | `/api/mudac/scorecards` | Judge |
| `PATCH` | `/api/mudac/director/event` | Director |
| `POST/PATCH/DELETE` | `/api/mudac/director/criteria` | Director |
| `POST/PATCH/DELETE` | `/api/mudac/director/teams` | Director |
| `POST` | `/api/mudac/director/teams/generate-ids` | Director |
| `POST/PATCH/DELETE` | `/api/mudac/director/panels` | Director |
| `PATCH` | `/api/mudac/director/panel-slots` | Director |
| `POST/DELETE` | `/api/mudac/director/panel-assignments` | Director |
| `PATCH` | `/api/mudac/director/judges` | Director (revoke) |
| `POST/DELETE` | `/api/mudac/director/presentations` | Director |
| `GET` | `/api/mudac/director/export` | Director (CSV) |

## Key libraries

| Path | Role |
|------|------|
| `lib/mudac/auth.ts` | Token lookup, registration window |
| `lib/mudac/aggregation.ts` | Panel scores and rankings |
| `lib/mudac/aggregation-data.ts` | Prisma loaders for aggregation |
| `lib/mudac/team-ids.ts` | Sequential/random ID generation |
| `lib/mudac/panels.ts` | Panel creation with default slots |
| `lib/mudac/validation.ts` | Zod schemas |

## Security (demo)

- Rate limits on registration and score submission
- Honeypot on judge registration
- Judges cannot score teams outside their panel (enforced in API)
- Directors cannot score (separate token type)

Production would add SSO, audit logs, and real email — see [Roadmap](roadmap.md).
