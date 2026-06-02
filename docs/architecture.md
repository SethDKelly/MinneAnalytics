# Architecture

Prototype conference-planning extension built on Next.js. It is **not** affiliated with production [minneanalytics.org](https://minneanalytics.org/).

## Capability overview

| Area | Behavior |
|------|----------|
| Public CFP | Submit with themes, optional community theme proposal, rate limit + honeypot |
| Blind review | Hide presenter identity and committee averages until the reviewer has a current-version score; optional reveal |
| Scoring | 0.0–1.0 in 0.1 steps; versioned scores; rescoring queue after presenter edits |
| Revisions | Presenter edits on pending/backup; immutable revision history; board acknowledges updates |
| Committee feedback | Messages from reviewers to presenters (separate from private score notes) |
| Chair program | Approve/decline/backup, theme gaps, coverage + technicality heatmaps, sponsor sessions, CSV export |
| Communications | Global email templates, batch send audit, deduplicated decline rounds (stub delivery) |
| Decks & archive | Upload workflow, shareable flag, public slide library |
| Schedule | 8-room grid, auto-generate, drag-and-drop |
| Admin | Submission window, theme taxonomy, blind review toggle, conference lifecycle |

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

| Role | `ReviewerRole` | Score | Approve / decline / backup | Deck review | Publish archive | Schedule | Admin panel | Submission window | Themes | Archive lifecycle |
|------|----------------|-------|----------------------------|-------------|-----------------|----------|-------------|-------------------|--------|-------------------|
| Site administrator | `ADMIN` | No | No | No | No | No | Yes | Yes | Yes | Yes |
| MinneAnalytics board | `BOARD` | Yes | Yes | Yes | Yes | Yes | No | No | No | View history |
| Conference co-chair | `CHAIR` | Yes | No | Yes | No | No | No | No | No | No |

One token grants one role. The same person may hold separate tokens (e.g. board + admin).

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
- `isSponsorSession` — board flags sponsor sessions; counted in capacity widget

## Conference lifecycle

`Conference.status`: `DRAFT`, `ACTIVE`, or `ARCHIVED` (with optional `archivedAt`).

- **ACTIVE** — committee may score, approve, and manage decks; mutations enforced via `lib/conference-active.ts`.
- **ARCHIVED** — read-only committee view; submissions closed. Board (and admin) can open historical data at `/chair/{token}?archive={slug}`.
- **DRAFT** — not open for public submission (enforced with submission window logic).

Site administrators set lifecycle, submission windows, and **blind review** at `/admin/{token}` (`app/api/admin/conference`).

## Submission windows

Per conference: `submissionsOpen`, `submissionsOpenAt`, `submissionsCloseAt`, and `timezone`.

- Public form and `POST /api/submissions` use `lib/submission-window.ts`.
- Closed CFP shows `components/SubmitClosed.tsx` instead of the form.
- Committee can still review pending talks after the window closes.

## Themes

`Theme` rows per conference (slug, name, `targetMin` / `targetMax` approved counts). Presenters select up to three at submit (`SubmissionTheme` join). Admins manage taxonomy at `/admin/{token}` (`app/api/admin/themes`).

**Community proposals:** `Theme.source` is `ADMIN` or `PRESENTER`. Presenters may propose a new tag on submit or edit (`POST /api/themes/propose`, deduped by slug). Soft-remove via `removedAt` hides a tag from pickers but keeps historical labels on chair views.

Chair dashboard:

- Theme filter on the Program tab
- **Theme coverage** panel (`lib/theme-stats.ts`, `components/ThemeGapPanel.tsx`)
- **Theme coverage heatmap** and **technicality heatmap** (`lib/chair-heatmaps.ts`, `components/ThemeCoverageHeatmap.tsx`, `components/TechnicalityHeatmap.tsx`)
- Approve saturation warning (`409` + confirm) when approving past theme targets (`app/api/chair/program-status`)

## Technicality balance

`lib/program-balance.ts` compares approved talks by `technicalLevel` (1–5) against default percentage targets. Shown on the chair **Balance** tab (`components/TechnicalityBalance.tsx`). Complements schedule row variety in `lib/schedule/balance.ts`.

## Scoring

- Committee scores are **0.0–1.0** in **0.1** steps (`lib/scoring-scale.ts`).
- One score per submission per reviewer (`Score` unique constraint).
- Each score stores `scoredAbstractVersion` — the abstract version when the reviewer last scored.
- Aggregates for ranking use **current-version scores only** (`lib/rescoring.ts` `aggregateCurrentVersion`): scores where `scoredAbstractVersion === submission.abstractVersion`.
- Review queue partitions into **needs score**, **needs rescore** (stale version), and **scored at current version** (`partitionReviewerQueue`).

**Blind review:** `Conference.blindReviewEnabled` (default `true`). Review and chair UIs hide presenter identity and committee aggregates until the viewer has a current-version score. Optional **Reveal identity** calls `GET /api/review/submissions/{id}/identity` (logged in demo). Implementation: `lib/review-blind.ts`.

**Demo behavior:** When the board sets a talk to `APPROVED` or `DECLINED` (or seed creates one), `lib/demo-scores.ts` auto-fills scores for all reviewers: **0.8–1.0** for approved, **0.0–0.3** for declined. This keeps ranking demos consistent without manual scoring every row.

## Abstract revisions and committee feedback

- `Submission.abstractVersion` increments on each presenter save that changes tracked fields; immutable rows in `SubmissionRevision`.
- `AbstractReviewStatus`: `CURRENT`, `FEEDBACK_PENDING`, `REVISED`, `ACKNOWLEDGED` — drives presenter edit policy and chair badges.
- Presenter edits via `PATCH /api/presenter/submission` (`lib/submission-revision.ts`, `components/PresenterSubmissionEditor.tsx`). Approved talks are locked in the demo.
- Committee → presenter messages in `PresenterFeedback` (distinct from private `Score.notes`); `POST /api/review/feedback` with stub email (`lib/email-stub.ts`).
- Revision history for committee: `GET /api/review/submissions/{id}/revisions` (`lib/revision-history.ts`); board may **Mark revision reviewed** via `POST /api/chair/abstract-review`.

## Capacity planning

The chair dashboard capacity widget (`lib/capacity.ts`) uses per-conference settings on `Conference`:

```
raw_slots          = rooms × sessions_per_room     (default 8 × 8 = 64)
after_trim         = raw_slots - eod_trim - graeme_slots   (default 54)
community_target   ≈ after_trim - sponsor_slots    (sponsors default 7–11 → ~44)
```

Sponsor sessions are tracked with `isSponsorSession` on `Submission`. Board toggles the flag from the chair Program tab (`PATCH /api/chair/sponsor-session`); capacity widget counts flagged sessions against `sponsorMin` / `sponsorMax`.

## Board communications

Global `EmailTemplate` rows (deck call, decline, attendee reminder, etc.). Per-conference send audit:

- `ConferenceEmailBatch` — one row per Send action (decline supports multiple **rounds**).
- `EmailSendRecord` — one row per recipient; unique per `(conference, template, round, submission|attendee)` for deduplication.
- `ConferenceAttendee` — stub attendee list for reminder template previews.

Board UI: chair **Communications** tab (`components/ChairCommunicationsTab.tsx`). Send logic: `lib/email-send.ts`, `lib/email-templates.ts`. Delivery is `lib/email-stub.ts` (console only in demo).

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
| `/chair/[token]` | Board + co-chairs (program + decks + communications for board) |
| `/schedule/[token]` | Board only |
| `/presenter/[token]` | Presenter (per submission) |
| `/admin/[token]` | Site administrator |

To walk through these URLs in order, see **[exploring-the-demo.md](exploring-the-demo.md)**.

## Historical committee review

Distinct from the **public** slide archive at `/archive/[slug]`:

- Authenticated board (and admin) browse archived conferences via the chair **History** tab or `?archive={slug}`.
- Read-only: no approve, score, or deck mutations on archived events.
- Seed includes **Data Tech 2026** (`ARCHIVED`) for demo.

## Email and abuse controls (demo)

- **Email:** `lib/email-stub.ts` logs intended messages to the server console (submission confirmation, abstract approval, presenter feedback, template batch sends).
- **Submissions:** In-memory rate limit per IP (`lib/rate-limit.ts`) and honeypot field `website` on the public form.

## CSV export

`GET /api/chair/export` (board/co-chairs) builds rows via `lib/export-build.ts`: program/deck flags, abstract version and review status, theme names/sources, presenter feedback summary, email send history, and per-reviewer scores with version markers (`!` when stale).

## Production and roadmap

This repo targets local demos. Deployment typically requires PostgreSQL, object storage, SSO, and real email—see [Roadmap](roadmap.md) and `.env.example`.
