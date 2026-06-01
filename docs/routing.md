# Routing

The app uses the [Next.js App Router](https://nextjs.org/docs/app): URLs map to files under `app/`, and dynamic segments appear as `[param]` folders.

## How URLs map to files

| URL | File | Rendering |
|-----|------|-----------|
| `/` | `app/page.tsx` | Server Component — public home |
| `/about` | `app/about/page.tsx` | Static facsimile page |
| `/upcoming` | `app/upcoming/page.tsx` | Lists conferences from DB |
| `/submit/data-tech-2027` | `app/submit/[slug]/page.tsx` | `slug` → conference lookup |
| `/submit/data-tech-2027/thanks` | `app/submit/[slug]/thanks/page.tsx` | Post-submit confirmation |
| `/review/{token}` | `app/review/[token]/page.tsx` | Validates reviewer token server-side |
| `/chair/{token}` | `app/chair/[token]/page.tsx` | Committee dashboard (`?archive=slug` for history) |
| `/admin/{token}` | `app/admin/[token]/page.tsx` | Site administrator |
| `/schedule/{token}` | `app/schedule/[token]/page.tsx` | Board-only schedule builder |
| `/presenter/{token}` | `app/presenter/[token]/page.tsx` | Presenter portal for one submission |
| `/archive/data-tech-2027` | `app/archive/[slug]/page.tsx` | Public deck library when published |

Global chrome (banner, header, footer) comes from `app/layout.tsx`.

Unknown paths use `app/not-found.tsx`. The archive uses `app/archive/[slug]/not-found.tsx` when published but empty.

## Dynamic segments

- **`[slug]`** — Conference identifier (`Conference.slug` in the database). The demo conference is `data-tech-2027`.
- **`[token]`** — Opaque secret issued at seed time or on submission (presenter). The server hashes the path segment and looks up `ReviewerAccess` or `Submission`; invalid or expired tokens return 404.
- **`[publicId]`** (API only) — Public deck download id (`DeckFile.publicId`), not the presenter/reviewer token.

## API routes (`app/api/**/route.ts`)

Browser pages call these Route Handlers for mutations and downloads. They enforce the same role rules as the UI (`lib/roles.ts`).

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/submissions` | Public abstract submission (rate limit + honeypot + submission window) |
| `PATCH` | `/api/admin/conference` | Admin: lifecycle, submission window |
| `POST` / `PATCH` / `DELETE` | `/api/admin/themes` | Admin: theme taxonomy |
| `POST` | `/api/scores` | Reviewer saves a score |
| `POST` | `/api/chair/program-status` | Board: approve / decline / backup |
| `POST` | `/api/chair/deck-status` | Committee deck workflow |
| `PATCH` | `/api/chair/deck-shareable` | Board: archive sharing flag |
| `PATCH` | `/api/chair/vip-registered` | Board/co-chair: VIP registration |
| `POST` | `/api/chair/publish-archive` | Board: publish/unpublish slide library |
| `GET` | `/api/chair/export` | CSV export (`?token=`) |
| `POST` | `/api/presenter/deck` | Deck upload (multipart) |
| `POST` | `/api/presenter/withdraw` | Presenter withdraw |
| `GET` | `/api/decks/download` | Committee deck file (`?token=&fileId=`) |
| `GET` | `/api/decks/public/[publicId]` | Public deck file when archive is live |
| `GET` / `POST` | `/api/schedule` | Load schedule state |
| `POST` | `/api/schedule/generate` | Auto-assign approved talks |
| `POST` | `/api/schedule/placement` | Drag-and-drop placement updates |

## Request flow (pages)

```
Browser → app/<route>/page.tsx (Server Component)
       → lib/* data loaders (Prisma)
       → HTML + client components ("use client" for forms, dashboards, schedule grid)
       → fetch("/api/...") on user actions
       → Route Handler → Prisma → JSON or file response
```

Private pages (`review`, `chair`, `schedule`, `presenter`) call `notFound()` when the token does not match a row in the database. There is no login screen—possession of the URL is the demo credential.

## Navigation in the UI

- **Site header** (`components/SiteHeader.tsx`): public links to About, Events, archive, Submit.
- **Chair dashboard** links to Review, Schedule (board), CSV export, and public archive when published.
- **Review panel** links back to Chair.

Tokens are **not** listed in the app; copy them from the terminal after `npm run db:seed` (see [Exploring the demo](exploring-the-demo.md) and [Exploring MUDAC](exploring-mudac-demo.md)).

## MinneMUDAC judging routes

| URL | File | Rendering |
|-----|------|-----------|
| `/mudac` | `app/mudac/page.tsx` | Public landing |
| `/mudac/{slug}/register` | `app/mudac/[slug]/register/page.tsx` | Judge registration |
| `/mudac/{slug}/register/thanks` | `app/mudac/[slug]/register/thanks/page.tsx` | Post-registration link |
| `/mudac/director/{token}` | `app/mudac/director/[token]/page.tsx` | Director dashboard |
| `/mudac/judge/{token}` | `app/mudac/judge/[token]/page.tsx` | Judge team list |
| `/mudac/judge/{token}/presentation/{id}` | `app/mudac/judge/[token]/presentation/[presentationId]/page.tsx` | Scorecard form |

### MUDAC API routes

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mudac/register` | Judge self-registration |
| `POST` | `/api/mudac/scorecards` | Judge save/submit scorecard |
| `PATCH` | `/api/mudac/director/event` | Director event settings |
| `POST/PATCH/DELETE` | `/api/mudac/director/criteria` | Scoring criteria |
| `POST/PATCH/DELETE` | `/api/mudac/director/teams` | Teams |
| `POST` | `/api/mudac/director/teams/generate-ids` | Bulk team ID generation |
| `POST/PATCH/DELETE` | `/api/mudac/director/panels` | Judge panels |
| `PATCH` | `/api/mudac/director/panel-slots` | Slot judge-type requirements |
| `POST/DELETE` | `/api/mudac/director/panel-assignments` | Assign judges to slots |
| `PATCH` | `/api/mudac/director/judges` | Revoke judge |
| `POST/DELETE` | `/api/mudac/director/presentations` | Team ↔ panel |
| `GET` | `/api/mudac/director/export` | Rankings CSV (`?token=`) |

Full MUDAC design: **[mudac-architecture.md](mudac-architecture.md)**.
