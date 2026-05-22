# MinneAnalytics Conference Planning Demo

Prototype conference planning extension: public abstract submission, private committee review, board approval, presenter deck upload, schedule building, and a post-conference slide archive.

**Not affiliated with production [minneanalytics.org](https://minneanalytics.org/).**

## Who this repo is for

| Goal | Start here |
|------|------------|
| Run the app and explore the PoC | [Quick start](#quick-start) → [Explore the demo](docs/exploring-the-demo.md) |
| Understand URLs and API routes | [Routing](docs/routing.md) |
| Contribute code | [Developer docs](docs/README.md) |

## Prerequisites

- **Node.js 20+** (this project pins **Node 24 LTS** in `.nvmrc` / `.node-version`)
- **npm** (included with Node)

After installing Node, open a **new** terminal and confirm:

```bash
node --version
npm --version
```

### First-time machine setup (Windows)

Install Node.js LTS with [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/):

```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

Close and reopen your terminal (or restart Cursor) so `node` and `npm` are on your PATH.

### First-time machine setup (macOS)

**Option A — Homebrew (recommended)**

```bash
brew install node
```

**Option B — nvm** (matches `.nvmrc`)

```bash
# install nvm: https://github.com/nvm-sh/nvm#installing-and-updating
nvm install
nvm use
```

**Option C — Official installer**

Download the LTS installer from [nodejs.org](https://nodejs.org/).

### First-time machine setup (Linux)

**Option A — NodeSource (Debian / Ubuntu)**

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Option B — distro packages**

```bash
# Fedora / RHEL
sudo dnf install nodejs npm

# Arch
sudo pacman -S nodejs npm
```

**Option C — nvm** (matches `.nvmrc`)

```bash
# install nvm: https://github.com/nvm-sh/nvm#installing-and-updating
nvm install
nvm use
```

**Option D — fnm**

```bash
# install fnm: https://github.com/Schniz/fnm
fnm install
fnm use
```

## Quick start

Setup scripts copy `.env.example` → `.env`, install dependencies, apply the schema, and seed demo data (including **private URLs printed to the terminal**).

### Windows

```powershell
cd Minneanalytics
.\scripts\setup.ps1
npm run dev
```

### macOS / Linux

```bash
cd Minneanalytics
chmod +x scripts/setup.sh   # first time only
./scripts/setup.sh
npm run dev
```

### Manual setup (all platforms)

```bash
cd Minneanalytics
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Important:** After `npm run db:seed`, copy the **chair**, **review**, **schedule**, and **presenter** URLs from the terminal output. Tokens change every seed; old bookmarks will 404.

### Explore the proof of concept

Follow the guided walkthrough in **[docs/exploring-the-demo.md](docs/exploring-the-demo.md)** (public submit → committee score → chair approve → presenter deck → schedule → publish archive).

Short reference — roles and URL patterns:

| Role | Pages |
|------|--------|
| Public | `/`, `/about`, `/upcoming`, `/submit/data-tech-2027`, `/archive/data-tech-2027` (when published) |
| Board member | `/review/{token}` · `/chair/{token}` · `/schedule/{token}` |
| Co-chair | `/review/{token}` · `/chair/{token}` (no approve / no schedule) |
| Presenter | `/presenter/{token}` (from submit confirmation or seed output) |

How URLs map to code: **[docs/routing.md](docs/routing.md)**.

## Features

- Full submission form with multi-select degrees and 1–5 technical scale
- Optional co-presenter (1–2 presenters)
- Program status: Pending, Approved, Declined, Backup, Withdrawn (withdraw allowed after approval)
- **Board** (Dan Atkins, Sean Larson, Graeme Thickins, John Hogue): score, approve/decline/backup, deck review, schedule, publish archive
- **Co-chairs**: score and deck review only
- Scoring: 0.0–1.0 (0.1 steps) + notes; demo auto-scores on approve/decline
- Capacity widget: 8×8 − EOD − Graeme − sponsors → ~44 community target
- Deck workflow and post-conference archive with per-session non-shareable flag
- VIP event registration flag on approved talks
- Schedule builder: 8-room Data Tech grid, auto-generate, drag-and-drop

## Project structure

```
app/           Next.js App Router pages and API routes
components/    UI (forms, dashboards, layout, schedule)
lib/           Business logic (scoring, roles, schedule, decks)
prisma/        Schema and seed
docs/          Routing, architecture, demo walkthrough, contributing
scripts/       setup.ps1 / setup.sh
uploads/       Deck files (gitignored)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server at port 3000 |
| `npm run build` | Production build (`prisma generate` + Next.js) |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply Prisma schema to SQLite |
| `npm run db:seed` | Reset demo data and print new tokens |

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `file:./prisma/dev.db` | SQLite database |
| `UPLOAD_DIR` | `./uploads` | Presenter deck storage |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Links in email stubs |

See `.env.example` for production notes (PostgreSQL, object storage).

## Troubleshooting

| Problem | What to do |
|---------|------------|
| 404 on `/chair/...` or `/review/...` | Re-run `npm run db:seed` and use the new URLs from the terminal. |
| `prisma generate` EPERM (Windows) | Stop `npm run dev`, run `npx prisma generate`, restart dev. |
| Empty archive | Board must publish from chair Deck queue; decks need upload + Approved + Shareable. |
| No committee scores on seed talks | Approved/declined seed rows are auto-scored; pending rows need manual scoring at `/review/...`. |

More detail: [docs/development.md](docs/development.md).

## Production notes

For a real deployment, use PostgreSQL and object storage for deck files (see `.env.example`). Email stubs log to the server console in this demo. Do not deploy with real PII without HTTPS, proper auth, and a retention policy.

## Developer documentation

[docs/README.md](docs/README.md) — architecture, routing, local development, and contributing guidelines.
