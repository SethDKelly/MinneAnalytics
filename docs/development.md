# Development guide

## Prerequisites

- **Node.js 20+** (project pins Node 24 LTS in `.nvmrc` / `.node-version`)
- **npm**

Verify after install:

```bash
node --version
npm --version
```

**First-time Node.js install** — expand your operating system (same options as the [project README](../README.md#prerequisites)):

<details>
<summary><strong>Windows</strong></summary>

```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

Restart your terminal so `node` and `npm` are on your PATH.

</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
brew install node
```

Or use [nvm](https://github.com/nvm-sh/nvm) / the [nodejs.org](https://nodejs.org/) installer — see the README for all options.

</details>

<details>
<summary><strong>Linux</strong></summary>

Use your distro packages, [NodeSource](https://github.com/nodesource/distributions), [nvm](https://github.com/nvm-sh/nvm), or [fnm](https://github.com/Schniz/fnm) — see the README for commands.

</details>

## First-time setup

Scripts copy `.env.example` → `.env`, install dependencies, apply the schema, and seed demo data (tokens print to the terminal).

**Select your operating system:**

<details>
<summary><strong>Windows</strong></summary>

**Automated (recommended)**

```powershell
.\scripts\setup.ps1
npm run dev
```

**Manual**

```powershell
copy .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

If `prisma generate` fails with `EPERM` on `query_engine-windows.dll.node`, stop `npm run dev`, run `npx prisma generate`, then restart dev.

</details>

<details>
<summary><strong>macOS</strong></summary>

**Automated (recommended)**

```bash
chmod +x scripts/setup.sh   # once
./scripts/setup.sh
npm run dev
```

**Manual**

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

</details>

<details>
<summary><strong>Linux</strong></summary>

**Automated (recommended)**

```bash
chmod +x scripts/setup.sh   # once
./scripts/setup.sh
npm run dev
```

**Manual**

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

</details>

Open [http://localhost:3000](http://localhost:3000) after setup.

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

### Do not commit

- `*.db` / `*.db-journal` under `prisma/`
- `.env`
- `uploads/`

## Exploring the demo

Evaluators and new contributors should follow **[exploring-the-demo.md](exploring-the-demo.md)** for a full proof-of-concept walkthrough (seed tokens, board vs co-chair, archive publish).

URL and file mapping: **[routing.md](routing.md)**.

## Demo workflow (manual QA checklist)

1. **Admin** (optional) — `/admin/{token}`: submission window, blind review toggle, themes.
2. **Submit** — `/submit/data-tech-2027`; themes + optional propose tag; confirm thanks page and presenter link.
3. **Score** — `/review/{token}`: blind identity, needs score / needs rescore / scored; revision history; committee feedback.
4. **Chair** — `/chair/{token}`: program (heatmaps, sponsor filter, revision badges), Balance tab, Communications (board), deck queue, CSV export, publish archive (board).
5. **Presenter** — `/presenter/{token}`: edit abstract on pending/backup; upload deck when approved; withdraw.
6. **Schedule** — `/schedule/{token}` (board): generate grid, drag-and-drop.
7. **Archive** — After board publishes, visit `/archive/data-tech-2027`.

Seed highlights: **Alex Rivera** at abstract v2 with stale scores (rescoring demo); **Avery Walsh** sponsor session; decline email round 1 pre-sent. Approving or declining from the chair UI triggers demo auto-scoring (see [Architecture](architecture.md#scoring)).

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
