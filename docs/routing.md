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
| `GET` | `/api/themes` | Selectable theme list for submit/edit (`?slug=`) |
| `POST` | `/api/themes/propose` | Propose community theme (rate limit) |
| `PATCH` | `/api/presenter/submission` | Presenter abstract edit + revision snapshot |
| `PATCH` | `/api/admin/conference` | Admin: lifecycle, submission window, blind review toggle |
| `POST` / `PATCH` / `DELETE` | `/api/admin/themes` | Admin: theme taxonomy |
| `POST` | `/api/scores` | Reviewer saves a score (sets `scoredAbstractVersion`) |
| `POST` | `/api/review/feedback` | Committee feedback to presenter |
| `GET` | `/api/review/submissions/{id}/identity` | Reveal presenter identity (blind review) |
| `GET` | `/api/review/submissions/{id}/revisions` | Revision history + diffs |
| `POST` | `/api/chair/program-status` | Board: approve / decline / backup |
| `POST` | `/api/chair/deck-status` | Committee deck workflow |
| `PATCH` | `/api/chair/deck-shareable` | Board: archive sharing flag |
| `PATCH` | `/api/chair/vip-registered` | Board/co-chair: VIP registration |
| `PATCH` | `/api/chair/sponsor-session` | Board: sponsor session flag |
| `GET` | `/api/chair/email-templates` | Board: template list + send history |
| `GET` | `/api/chair/email-templates/{key}/preview` | Board: merge preview |
| `GET` | `/api/chair/email-templates/{key}/recipients` | Board: eligible recipients |
| `POST` | `/api/chair/email-templates/{key}/send` | Board: send batch (stub) |
| `POST` | `/api/chair/abstract-review` | Board: acknowledge presenter revision |
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
- **Chair dashboard** links to Review, Schedule (board), CSV export, Communications tab (board), and public archive when published.
- **Review panel** links back to Chair.

Tokens are **not** listed in the app; copy them from the terminal after `npm run db:seed` (see [Exploring the demo](exploring-the-demo.md)).
