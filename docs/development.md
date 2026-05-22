# Development guide

## Prerequisites

- **Node.js 20+** (project pins Node 24 LTS in `.nvmrc` / `.node-version`)
- **npm**

Verify after install:

```bash
node --version
npm --version
```

## First-time setup

### Automated

**Windows**

```powershell
.\scripts\setup.ps1
```

**macOS / Linux**

```bash
chmod +x scripts/setup.sh   # once
./scripts/setup.sh
```

### Manual

```bash
cp .env.example .env          # Windows: copy .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | Prisma SQLite path | `file:./prisma/dev.db` |
| `UPLOAD_DIR` | Deck file storage | `./uploads` |
| `NEXT_PUBLIC_APP_URL` | Links in email stubs | `http://localhost:3000` |

See `.env.example` for production notes (PostgreSQL, S3).

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint (Next.js config) |
| `npm run db:push` | Apply `prisma/schema.prisma` to the database |
| `npm run db:seed` | Wipe and reseed demo data; prints tokens |

## Database workflow

1. Edit `prisma/schema.prisma`.
2. Run `npm run db:push` to sync SQLite (no migration files in this demo).
3. Run `npm run db:seed` to reset demo content and get fresh reviewer/presenter URLs.

**Seed output** includes board, co-chair, schedule, and sample presenter links. Re-seed whenever you need clean tokens or updated sample talks.

### Prisma client on Windows

If `prisma generate` fails with `EPERM` on `query_engine-windows.dll.node`, stop the dev server (`npm run dev`) and run `npx prisma generate` or `npm run build` again.

### Do not commit

- `*.db` / `*.db-journal` under `prisma/`
- `.env`
- `uploads/`

## Exploring the demo

Evaluators and new contributors should follow **[exploring-the-demo.md](exploring-the-demo.md)** for a full proof-of-concept walkthrough (seed tokens, board vs co-chair, archive publish).

URL and file mapping: **[routing.md](routing.md)**.

## Demo workflow (manual QA checklist)

1. **Submit** — `/submit/data-tech-2027`; confirm thanks page and presenter link.
2. **Score** — `/review/{token}` (board or co-chair).
3. **Chair** — `/chair/{token}`: approve/decline (board), deck queue, VIP flag, CSV export, publish archive (board).
4. **Presenter** — `/presenter/{token}`: upload deck after approval, test withdraw.
5. **Schedule** — `/schedule/{token}` (board): generate grid, drag-and-drop.
6. **Archive** — After board publishes, visit `/archive/data-tech-2027`.

Approving or declining from the chair UI triggers demo auto-scoring (see [Architecture](architecture.md#scoring)).

## Adding a conference

Today the seed creates a single conference (`data-tech-2027`). To add another:

1. Extend `prisma/seed.ts` (or insert via Prisma Studio).
2. Ensure `Conference.slug` matches `/submit/[slug]` and `/archive/[slug]`.
3. Create `ReviewerAccess` rows with hashed tokens for that `conferenceId`.
4. Call `ensureScheduleGrid(conferenceId)` from `lib/schedule/grid.ts` for schedule support.

## Debugging tips

- **Stale Prisma types** — Run `npx prisma generate` after schema changes.
- **Empty schedule models** — `ensureScheduleGrid` must run; seed does this automatically.
- **Chair aggregate errors** — Usually missing scores or outdated client; re-seed and refresh.
- **Email** — Watch the terminal running `npm run dev` for `lib/email-stub` output.
