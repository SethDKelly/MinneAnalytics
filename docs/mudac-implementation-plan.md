# MinneMUDAC judging demo — implementation plan

Branch: `feature/mudac-demo` · **Status: MVP complete (Phases 1–5)**

Prototype for [MinneMUDAC 2026](https://minneanalytics.org/minnemudac-2026/): volunteer judges score student team presentations across flexible criteria; tournament directors configure the event, review panel scorecards, and rank teams by division.

This demo **coexists** with the existing Data Tech conference planning flow. Shared infrastructure (Next.js, Prisma, Tailwind, `lib/tokens.ts`, validation patterns) is reused; **domain models and routes are separate** under `/mudac/*` so conference code stays untouched.

| Doc | Purpose |
|-----|---------|
| [Exploring MUDAC](exploring-mudac-demo.md) | Evaluator walkthrough (~15 min) |
| [MUDAC architecture](mudac-architecture.md) | Data model, APIs, aggregation |
| [Routing](routing.md#minnemudac-judging-routes) | URL and Route Handler map |

### Delivery summary

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Schema, director Setup / Criteria / Teams | Done (`7aeab59`) |
| 2 | Judge registration, panels, assignments | Done (`3627906`) |
| 3 | Presentations, scorecards, scoring lock | Done (`bf2a1f2`) |
| 4 | Aggregation, Rankings, Scorecards tabs, CSV | Done (`bbef4f6`) |
| 5 | Docs, landing polish, mobile scorecards | Done (`e576d22`) |

---

## Goals

| Actor | Needs |
|-------|--------|
| **Judge** (volunteer) | Self-register securely, receive a personal link, score assigned teams on N criteria, see only their panel’s teams |
| **Tournament director** | Configure criteria, panels, judge slots/types, team IDs and divisions; monitor scorecards; view aggregated and normalized rankings |
| **Student team** | Represented by a display ID (e.g. `07`); no login required for MVP |

Non-goals for MVP: student self-registration, real SSO, payment, or integration with MinneAnalytics production WordPress.

---

## Domain overview

```
MudacEvent (e.g. minnemudac-2026)
├── ScoringCriterion[]     (flexible count, ordered, max points each)
├── Division[]             (UNDERGRADUATE, GRADUATE, POST_GRADUATE + custom)
├── Team[]                 (displayId, division, optional name/school)
├── JudgePanel[]           (label, judgesPerPanel, slot type requirements)
│   └── PanelAssignment[]  (judge ↔ panel, slot index, judge type)
└── Presentation[]         (team scored by one panel at one time)
    └── JudgeScorecard[]   (one per judge on that panel)
        └── CriterionScore[] (value per criterion)
```

### Aggregation pipeline

```
Criterion scores  →  Judge subtotal (sum or weighted sum per scorecard)
                 →  Panel aggregate (sum / mean of judge subtotals; configurable)
                 →  Team presentation total
                 →  Division ranking (directors choose normalization)
```

Directors can switch normalization without re-entering scores:

- **Raw panel total** — sum of judge subtotals
- **Panel average** — mean of judge subtotals (default when panel size varies)
- **Per-judge normalized** — each judge’s subtotal ÷ max possible for that judge
- **Division z-score** — compare team totals within division (Rankings tab toggle)

---

## Roles and permissions

| Role | Auth | Capabilities |
|------|------|--------------|
| `MUDAC_DIRECTOR` | Long-lived admin token (`/mudac/director/{token}`) | Full event config, team/panel CRUD, view all scorecards, rankings, export |
| `MUDAC_JUDGE` | Personal token after self-registration (`/mudac/judge/{token}`) | Score assigned panel’s teams only; edit own scorecards until event locked |

Enforce in **`lib/mudac/roles.ts`** and every `app/api/mudac/**` route (mirror `lib/roles.ts` pattern).

---

## Authentication and judge registration

Volunteer judges are unknown ahead of time; registration must be low-friction but not spoofable.

### Recommended flow (MVP)

1. Director opens **Registration settings** → toggles `registrationOpen`, optional **registration code** (shared secret, e.g. printed at volunteer desk).
2. Judge visits **`/mudac/{slug}/register`**.
3. Form: name, email, affiliation, **judge type** (academic / industry-business / industry-technical / general), optional preferred panel.
4. Server validates registration window + code, creates `MudacJudge` with hashed token, sends **magic link** via email stub (`lib/email-stub.ts` → console in dev).
5. Judge clicks link → **`/mudac/judge/{token}`** (session = possession of URL, same as conference demo).

### Security properties

- Tokens: `generateToken()` + `hashToken()` — only hash stored in DB.
- Rate limit registration and score POSTs (reuse pattern from `app/api/submissions`).
- Honeypot field on registration form.
- Judges cannot guess team IDs outside their panel (API checks `PanelAssignment`).
- Director can **revoke** a judge token and **lock** scoring when presentations end.

### Phase 2 (optional)

- Email OTP instead of long-lived URL for day-of login.
- Entra / Google for returning directors only.

---

## Data model (Prisma additions)

New enums and models; **no changes** to `Conference` / `Submission`.

```prisma
enum MudacEventStatus {
  DRAFT
  REGISTRATION_OPEN
  JUDGING
  LOCKED
  ARCHIVED
}

enum MudacDivision {
  UNDERGRADUATE
  GRADUATE
  POST_GRADUATE
}

enum MudacJudgeType {
  ACADEMIC
  INDUSTRY_BUSINESS
  INDUSTRY_TECHNICAL
  GENERAL
}

enum MudacIdGenerationMode {
  SEQUENTIAL   // start, end, increment
  RANDOM       // unique random in range
}

enum MudacPanelAggregateMode {
  SUM
  MEAN
}

model MudacEvent {
  id                    String   @id @default(cuid())
  slug                  String   @unique
  name                  String
  status                MudacEventStatus @default(DRAFT)
  registrationOpen      Boolean  @default(false)
  registrationCodeHash  String?  // optional bcrypt/SHA of shared code
  judgesPerPanel        Int      @default(3)
  panelAggregateMode    MudacPanelAggregateMode @default(MEAN)
  idGenerationMode      MudacIdGenerationMode @default(SEQUENTIAL)
  teamIdStart           Int      @default(1)
  teamIdEnd             Int      @default(99)
  teamIdIncrement       Int      @default(1)
  teamIdPadWidth        Int      @default(2)   // "07" vs "7"
  scoringLocked         Boolean  @default(false)
  // relations: criteria, divisions, teams, panels, judges, directors, presentations
}

model MudacScoringCriterion {
  id          String @id @default(cuid())
  eventId     String
  sortOrder   Int
  name        String
  description String?
  maxPoints   Int    @default(10)
  weight      Float  @default(1.0)   // 1.0 = unweighted
  @@unique([eventId, sortOrder])
}

model MudacTeam {
  id          String @id @default(cuid())
  eventId     String
  displayId   String          // "07" — unique per event
  division    MudacDivision
  name        String?         // optional school/team label for directors
  @@unique([eventId, displayId])
}

model MudacJudgePanel {
  id          String @id @default(cuid())
  eventId     String
  label       String          // "Panel A", "Room 101"
  sortOrder   Int
}

// Required judge-type mix per panel (flexible slots)
model MudacPanelSlotRequirement {
  id          String @id @default(cuid())
  panelId     String
  slotIndex   Int             // 0..judgesPerPanel-1
  judgeType   MudacJudgeType  // expected type for this seat
  @@unique([panelId, slotIndex])
}

model MudacJudge {
  id            String @id @default(cuid())
  eventId       String
  name          String
  email         String
  affiliation   String?
  judgeType     MudacJudgeType
  tokenHash     String @unique
  revokedAt     DateTime?
  registeredAt  DateTime @default(now())
  @@unique([eventId, email])
}

model MudacPanelAssignment {
  id        String @id @default(cuid())
  panelId   String
  judgeId   String
  slotIndex Int
  @@unique([panelId, slotIndex])
  @@unique([panelId, judgeId])
}

model MudacDirectorAccess {
  id        String @id @default(cuid())
  eventId   String
  label     String
  tokenHash String @unique
}

model MudacPresentation {
  id        String   @id @default(cuid())
  eventId   String
  panelId   String
  teamId    String
  scheduledAt DateTime?
  @@unique([eventId, teamId])   // one panel scores each team (MVP)
}

model MudacJudgeScorecard {
  id              String @id @default(cuid())
  presentationId  String
  judgeId         String
  submittedAt     DateTime?
  notes           String?
  @@unique([presentationId, judgeId])
}

model MudacCriterionScore {
  id           String @id @default(cuid())
  scorecardId  String
  criterionId  String
  value        Float
  @@unique([scorecardId, criterionId])
}
```

**Flexibility notes**

- Criteria count = rows in `MudacScoringCriterion` (director adds/removes/reorders).
- Panel size = `judgesPerPanel` + optional per-slot type requirements.
- Team ID = `displayId` string with configurable pad width; generation helper respects sequential or random mode.

---

## Business logic (`lib/mudac/`)

| Module | Responsibility |
|--------|----------------|
| `roles.ts` | Director capability labels |
| `auth.ts` | Token lookup, registration window, panel ID helper |
| `registration-code.ts` | Optional shared registration code hash/verify |
| `email.ts` | Judge registration magic-link email stub |
| `validation.ts` | Zod schemas (registration, scorecards) |
| `constants.ts` | Division, status, judge-type labels |
| `team-ids.ts` | Generate IDs (sequential/random), validate uniqueness |
| `panels.ts` | Create panels with default slot types |
| `scoring.ts` | Criterion validation, judge subtotal, scoring lock |
| `aggregation.ts` | Panel totals, division rankings, CSV helper |
| `aggregation-data.ts` | Prisma bundle for aggregation views |
| `queries.ts` | Prisma loaders for dashboards and judge queue |

### Scoring rules

- Each criterion: `0 ≤ value ≤ maxPoints` (integer or 0.5 steps — director-configurable later).
- Judge subtotal: `Σ (value × weight)` or simple sum if weights unused.
- Panel complete when all assigned judges have `submittedAt` set on scorecards.
- Incomplete panels shown separately in director views; rankings can exclude or flag incomplete.

---

## UI and routing

### Public / judge

| URL | Purpose |
|-----|---------|
| `/mudac` | Landing — link to MinneMUDAC 2026 demo event |
| `/mudac/minnemudac-2026/register` | Judge self-registration |
| `/mudac/minnemudac-2026/register/thanks` | “Check your email” + copy link in dev |
| `/mudac/judge/{token}` | Judge home: assigned panel, teams to score |
| `/mudac/judge/{token}/presentation/{presentationId}` | Scorecard form (mobile-friendly) |

### Director

| URL | Purpose |
|-----|---------|
| `/mudac/director/{token}` | Director dashboard (tabs below) |

**Director tabs**

1. **Setup** — event status, registration open/close, registration code, lock scoring
2. **Criteria** — add/edit/reorder criteria (name, max points, weight)
3. **Teams** — division filter, bulk ID generation (start/end/increment or random), manual add
4. **Panels** — create panels, set slot judge types, assign registered judges to slots
5. **Presentations** — assign team → panel (drag or table)
6. **Scorecards** — matrix: panels × teams; drill into individual judge scorecards
7. **Rankings** — division leaderboard with panel aggregate mode toggle + CSV export

### API routes (`app/api/mudac/`)

| Method | Path | Actor |
|--------|------|-------|
| `POST` | `/api/mudac/register` | Public |
| `PATCH` | `/api/mudac/director/event` | Director |
| `POST/PATCH/DELETE` | `/api/mudac/director/criteria` | Director |
| `POST/PATCH/DELETE` | `/api/mudac/director/teams` | Director |
| `POST` | `/api/mudac/director/teams/generate-ids` | Director |
| `POST/PATCH/DELETE` | `/api/mudac/director/panels` | Director |
| `PATCH` | `/api/mudac/director/panel-slots` | Director |
| `POST/DELETE` | `/api/mudac/director/panel-assignments` | Director |
| `PATCH` | `/api/mudac/director/judges` | Director (revoke) |
| `POST/DELETE` | `/api/mudac/director/presentations` | Director |
| `POST` | `/api/mudac/scorecards` | Judge |
| `GET` | `/api/mudac/director/export` | Director (CSV) |

---

## Key user flows

### Director prepares event

```mermaid
flowchart LR
  A[Create event seed] --> B[Define 5 criteria]
  B --> C[Generate team IDs by division]
  C --> D[Create panels + slot types]
  D --> E[Open registration]
  E --> F[Assign judges to panels]
  F --> G[Map teams to panels]
  G --> H[Set status JUDGING]
```

### Judge scores a team

```mermaid
flowchart LR
  R[Register] --> L[Magic link]
  L --> H[Judge home]
  H --> T[Open team 07]
  T --> S[Enter criterion scores]
  S --> V[Submit scorecard]
  V --> H
```

### Director ranks teams

```mermaid
flowchart LR
  P[All panel scorecards] --> A[Aggregate per team]
  A --> N[Normalize within division]
  N --> K[Rankings tab + export]
```

---

## Seed data (MinneMUDAC 2026)

After `npm run db:seed`, the **MinneMUDAC Judging Demo** block prints:

| Item | Demo value |
|------|------------|
| Event slug | `minnemudac-2026` |
| Status | `JUDGING` |
| Registration | Open; code **`volunteer`** |
| Criteria | 5 defaults (problem, analytics, impact, clarity, Q&A) |
| Panels | A, B, C — 3 slots each (academic / industry business / industry technical) |
| Teams | `01`, `02`, `03` undergraduate on **Panel A** |
| Judges | Alex Academic, Blake Business, Casey Technical — assigned to Panel A |
| Scorecards | All three judges submitted scores for teams 01–03 (ranking demo) |
| Director | One token at `/mudac/director/{token}` |

Public event context: [MinneMUDAC 2026](https://minneanalytics.org/minnemudac-2026/) at St. Catherine University, October 17, 2026; data client The Food Group (food insecurity). Team school names are optional director-only labels, not shown to judges.

---

## Implementation phases

### Phase 1 — Foundation (schema + director setup) — complete

- [x] Prisma models + `npm run db:push`
- [x] `lib/mudac/*` core helpers
- [x] Director token route + **Setup / Criteria / Teams** tabs
- [x] Team ID generation API
- [x] Seed `minnemudac-2026`

**Verified:** Director defines criteria, generates teams by division, copies director URL from seed.

### Phase 2 — Panels and registration — complete

- [x] Panel CRUD + slot type requirements
- [x] Judge registration (public form + email stub link)
- [x] Director **Panels** tab: assign judges to slots
- [x] Revoke judge token

**Verified:** New volunteer registers at `/mudac/minnemudac-2026/register` and appears in panel assignment UI.

### Phase 3 — Scoring — complete

- [x] Presentations (team ↔ panel)
- [x] Judge dashboard + scorecard form
- [x] `POST /api/mudac/scorecards` with validation
- [x] Scoring lock via `scoringLocked` and status `LOCKED`

**Verified:** Three judges score each team on all criteria; director sees scorecards on Presentations tab.

### Phase 4 — Aggregation and rankings — complete

- [x] `lib/mudac/aggregation.ts` + `aggregation-data.ts`
- [x] Director **Scorecards** tab (matrix + judge drill-down)
- [x] **Rankings** tab per division (mean/sum, normalized, z-score)
- [x] CSV export (`GET /api/mudac/director/export`)

**Verified:** Undergraduate rankings show teams `01` > `02` > `03` from seed data.

### Phase 5 — Polish and docs — complete

- [x] `/mudac` landing page + header nav entry
- [x] `docs/exploring-mudac-demo.md` walkthrough
- [x] `docs/mudac-architecture.md` + architecture/routing cross-links
- [x] Mobile-friendly scorecard (sliders, ± buttons, sticky submit bar)

## Implemented UI (`components/`)

| Component | Role |
|-----------|------|
| `MudacDirectorDashboard.tsx` | Director tabs (7) |
| `MudacDirectorPanelsTab.tsx` | Panel and judge assignment |
| `MudacDirectorPresentationsTab.tsx` | Team ↔ panel scheduling |
| `MudacDirectorScorecardsTab.tsx` | Scorecard matrix + details |
| `MudacDirectorRankingsTab.tsx` | Division leaderboards + export |
| `MudacJudgeRegistrationForm.tsx` | Public judge signup |
| `MudacJudgeScorecardForm.tsx` | Criterion scoring (tablet UX) |

---

## Reuse from conference demo

| Existing | MUDAC use |
|----------|-----------|
| `lib/tokens.ts` | Judge and director tokens |
| `lib/scoring.ts` | `aggregateScores` for panel means |
| `lib/email-stub.ts` | Registration magic links |
| `lib/validation.ts` + Zod | Form schemas |
| `components/SiteHeader.tsx` | Add “MUDAC demo” nav link |
| Rate limit / honeypot patterns | Registration endpoint |

Do **not** extend `ReviewerRole` or `Conference` — keep MUDAC isolated.

---

## Director UI sketches (behavior)

### Criteria editor

| # | Name | Max pts | Weight |
|---|------|---------|--------|
| 1 | Problem understanding | 10 | 1.0 |
| 2 | Analytical approach | 10 | 1.0 |
| … | + Add criterion | | |

### Team ID generator

- Mode: Sequential / Random  
- Start: `1` · End: `99` · Increment: `1` · Pad width: `2`  
- Division: Undergraduate · Count: `8` → creates `01`–`08` (or configured range)

### Rankings (undergraduate)

| Rank | Team | Panel | Judges | Panel avg | Status |
|------|------|-------|--------|-----------|--------|
| 1 | 07 | A | 3/3 | 42.3 | Complete |
| 2 | 03 | B | 2/3 | 39.1 | Partial |

---

## Open decisions (resolved for MVP)

| Question | Decision (implemented) |
|----------|-------------------------|
| Can one team be scored by multiple panels? | No — `@@unique([eventId, teamId])` on `MudacPresentation` |
| Weighted criteria? | Stored on `MudacScoringCriterion.weight`; editable on Criteria tab |
| Judge edits after submit? | Allowed until `scoringLocked` or status `LOCKED` / `ARCHIVED` |
| Registration without email? | Email required; magic link via email stub + thanks page URL |
| Anonymous teams to judges? | Yes — display ID + division only on scorecard |

---

## Testing checklist

Manual QA covered during implementation:

- [x] Register judge with wrong code → 403
- [x] Judge cannot POST scores for team not on their panel → 403
- [x] Criterion value above max → 400
- [x] Panel with fewer than `judgesPerPanel` submissions → **partial** in rankings
- [x] Sequential ID generation respects pad width and collision
- [x] Lock scoring → judge POST returns 403
- [x] CSV export matches Rankings tab (panel aggregate mode)

Re-run after schema changes: `npm run lint`, `npm run build`, `npm run db:seed`.

---

## Documentation deliverables

| File | Status |
|------|--------|
| `docs/mudac-implementation-plan.md` | This document (plan + completion record) |
| `docs/exploring-mudac-demo.md` | Done |
| `docs/mudac-architecture.md` | Done |
| `docs/routing.md` (MUDAC section) | Done |
| `docs/architecture.md` (MUDAC cross-link) | Done |
| Seed console output | Director, register URL, demo judge URLs |

---

## Post-MVP (not in this branch)

Possible follow-ups (production or later sprints):

- SSO / Entra for directors; email OTP for judges
- Real SMTP instead of `lib/email-stub.ts`
- Student team portal (view-only status)
- Audit log of score changes
- Additional seeded divisions (graduate / post-graduate teams at scale)
- Drag-and-drop presentation scheduling
- Automated tests (API + aggregation unit tests)

Conference-demo backlog remains in **[roadmap.md](roadmap.md)** (separate from MUDAC).
