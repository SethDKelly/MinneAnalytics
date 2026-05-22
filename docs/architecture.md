# Architecture

Prototype conference-planning extension built on Next.js. It is **not** affiliated with production [minneanalytics.org](https://minneanalytics.org/).

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma (demo); PostgreSQL noted for production |
| Styling | Tailwind CSS (brand navy `#202659`) |
| Validation | Zod (`lib/validation.ts`) |
| Auth (demo) | Unguessable URL tokens, stored as SHA-256 hashes |

## Repository layout

```
app/              Pages and Route Handlers (public + private token routes)
components/       React UI (forms, dashboards, layout, schedule grid)
lib/              Business logic shared by pages and APIs
prisma/           Schema, seed script
uploads/          Deck file storage (gitignored)
scripts/          setup.ps1 / setup.sh for first-time bootstrap
```

Server Components load data in `app/**/page.tsx`; mutating actions go through `app/api/**` Route Handlers. Shared logic lives in `lib/` so pages stay thin.

## Roles and permissions

Governance is enforced in **`lib/roles.ts`** and re-exported from **`lib/reviewer.ts`**. API routes call these helpers before updating data.

| Role | `ReviewerRole` | Score | Approve / decline / backup | Deck review | Publish archive | Schedule |
|------|----------------|-------|----------------------------|-------------|-----------------|----------|
| MinneAnalytics board | `BOARD` | Yes | Yes | Yes | Yes | Yes |
| Conference co-chair | `CHAIR` | Yes | No | Yes | No | No |

Board member names used in seed data are listed in `BOARD_MEMBER_NAMES` in `lib/roles.ts`.

## Program and deck status

**Program** (`ProgramStatus` on `Submission`):

- `PENDING` — awaiting committee review
- `APPROVED` — on program; presenter may upload decks
- `DECLINED` — not selected
- `BACKUP` — alternate; board may promote to `APPROVED`
- `WITHDRAWN` — presenter withdrew (allowed even after approval)

**Deck** (`DeckStatus`, only when program is `APPROVED`):

- `SUBMITTED` → `REVIEWED` → `APPROVED` or `CONCERN`

Additional submission flags:

- `deckShareable` — board can exclude a session from the public post-conference archive
- `vipRegistered` — board/co-chairs track VIP event registration for approved talks

## Scoring

- Committee scores are **0.0–1.0** in **0.1** steps (`lib/scoring-scale.ts`).
- One score per submission per reviewer (`Score` unique constraint).
- Aggregates (sum, average, count) are computed in `lib/scoring.ts` and used to sort the chair dashboard.

**Demo behavior:** When the board sets a talk to `APPROVED` or `DECLINED` (or seed creates one), `lib/demo-scores.ts` auto-fills scores for all reviewers: **0.8–1.0** for approved, **0.0–0.3** for declined. This keeps ranking demos consistent without manual scoring every row.

## Capacity planning

The chair dashboard capacity widget (`lib/capacity.ts`) uses per-conference settings on `Conference`:

```
raw_slots          = rooms × sessions_per_room     (default 8 × 8 = 64)
after_trim         = raw_slots - eod_trim - graeme_slots   (default 54)
community_target   ≈ after_trim - sponsor_slots    (sponsors default 7–11 → ~44)
```

Sponsor sessions are tracked with `isSponsorSession` on `Submission`.

## Schedule builder

Data Tech–style grid: registration, kickoff, eight rooms, 30-minute session rows, breaks/lunch/networking.

- Template and grid sync: `lib/schedule/template.ts`, `lib/schedule/grid.ts`
- Auto-assign with technical variety per time row: `lib/schedule/generate.ts`, `lib/schedule/balance.ts`
- Board-only access: `lib/schedule/auth.ts`
- UI: `components/schedule/ScheduleBuilder.tsx`

## Post-conference deck archive

When `Conference.decksPublished` is true, `/archive/[slug]` lists approved sessions that are shareable, have deck status `APPROVED`, and include an uploaded file. Public download uses opaque `DeckFile.publicId` at `/api/decks/public/[publicId]`. Committee download uses `/api/decks/download` with a reviewer token.

## Authentication model (demo)

| Actor | Token storage | Lookup |
|-------|---------------|--------|
| Presenter | `Submission.presenterTokenHash` | `lib/tokens.ts` `hashToken()` |
| Reviewer | `ReviewerAccess.tokenHash` | `getReviewerByToken()` in `lib/reviewer.ts` |

Tokens are generated in `prisma/seed.ts` and printed to the console. **Do not** log tokens in production or commit them to the repo.

## Routes

See **[routing.md](routing.md)** for the full App Router file map, dynamic segments (`[slug]`, `[token]`), and API Route Handler list.

Summary:

| Path | Access |
|------|--------|
| `/`, `/about`, `/upcoming` | Public |
| `/submit/[slug]` | Public submission form |
| `/archive/[slug]` | Public when archive published |
| `/review/[token]` | Board + co-chairs (scoring) |
| `/chair/[token]` | Board + co-chairs (program + decks) |
| `/schedule/[token]` | Board only |
| `/presenter/[token]` | Presenter (per submission) |

To walk through these URLs in order, see **[exploring-the-demo.md](exploring-the-demo.md)**.

## Email and abuse controls (demo)

- **Email:** `lib/email-stub.ts` logs intended messages to the server console (submission confirmation, abstract approval).
- **Submissions:** In-memory rate limit per IP (`lib/rate-limit.ts`) and honeypot field `website` on the public form.

## Production gaps (intentional)

This repo targets local demos. For a real deployment you would typically:

- Replace SQLite with PostgreSQL (`DATABASE_URL` in `.env.example`)
- Store deck files in object storage instead of `UPLOAD_DIR`
- Replace token-in-URL auth with proper identity, HTTPS, and audit logging
- Wire real email delivery and durable rate limiting
