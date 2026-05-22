# Contributing

Thank you for improving the MinneAnalytics conference planning demo. This project is a prototype for local evaluation and extension—not the production MinneAnalytics site.

## Before you start

1. Read [Development](development.md) and get `npm run dev` working.
2. Skim [Architecture](architecture.md) for roles and statuses; read [Routing](routing.md) for the App Router layout.
3. Run through [Exploring the demo](exploring-the-demo.md) once with fresh seed tokens.

## Making changes

### Where to edit

| Change | Start here |
|--------|------------|
| Data model | `prisma/schema.prisma` → `npm run db:push` |
| Demo data / tokens | `prisma/seed.ts` |
| Role permissions | `lib/roles.ts` |
| Submission validation | `lib/validation.ts`, `app/api/submissions/route.ts` |
| Scoring rules | `lib/scoring-scale.ts`, `lib/scoring.ts`, `app/api/scores/route.ts` |
| Chair / deck / VIP / archive APIs | `app/api/chair/*`, `lib/decks.ts` |
| Chair UI | `components/ChairDashboard.tsx`, `app/chair/[token]/page.tsx` |
| Review UI | `components/ReviewPanel.tsx`, `app/review/[token]/page.tsx` |
| Schedule | `lib/schedule/*`, `components/schedule/*`, `app/api/schedule/*` |
| Public shell | `components/SiteHeader.tsx`, `app/page.tsx`, static pages under `app/` |
| Styling / tokens | `app/globals.css`, `tailwind.config.ts` |

Prefer extending existing `lib/` helpers over duplicating logic in Route Handlers.

### Code style

- **TypeScript** throughout; match existing naming and import paths (`@/lib/...`).
- **Server vs client** — Keep `"use client"` only where interactivity requires it; fetch data in Server Components when possible.
- **Permissions** — Enforce in API routes with `lib/roles.ts` / `lib/reviewer.ts`, not only in the UI.
- **Scores** — Use `roundScore` / `isValidScore` from `lib/scoring-scale.ts` for any new scoring input.
- **Comments** — Only for non-obvious business rules; avoid narrating obvious code.

### Database changes

1. Update `prisma/schema.prisma`.
2. Run `npm run db:push`.
3. Update `prisma/seed.ts` if demo data should reflect the change.
4. Regenerate client: `npx prisma generate` (or `npm run build`).

### Testing your branch

```bash
npm run lint
npm run build
```

Manually exercise the flow affected by your change (see [Development → Demo workflow](development.md#demo-workflow-manual-qa)).

We do not require automated tests for every change today; meaningful manual checks on chair, review, presenter, or schedule flows are expected.

## Pull requests

- Use a clear title and short description of **why** the change is needed.
- Keep diffs focused; avoid unrelated refactors.
- Do not commit secrets, `.env`, SQLite databases, or files under `uploads/`.
- If you add environment variables, document them in `.env.example` and [Development](development.md).

## Security reminders

- Store only hashed tokens (`lib/tokens.ts`), never raw tokens in the database.
- Do not log presenter or reviewer tokens in production code paths.
- Treat seeded data as fictional; do not use real PII in commits or screenshots.

## Questions

For behavior aligned with MinneAnalytics governance (board vs co-chair, capacity rules, deck workflow), refer to [Architecture](architecture.md). For setup issues, see [Development](development.md).
