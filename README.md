# MinneAnalytics Conference Planning Demo

Prototype conference planning extension: public abstract submission, private chair/scorer review, core approval, presenter deck upload, and program capacity tracking.

**Not affiliated with production [minneanalytics.org](https://minneanalytics.org/).**

## Requirements

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for phased scope and status.

## Prerequisites

- Node.js 20+ (this project pins **Node 24 LTS** in `.nvmrc` / `.node-version`)
- npm (included with Node)

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

The seed command prints **private reviewer URLs** and sample **presenter portal** links in the terminal. Save them for demo sessions.

## Demo flows

| Role | URL pattern |
|------|-------------|
| Public home | `/` |
| About / events | `/about` · `/upcoming` |
| Post-conference decks | `/archive/data-tech-2027` (after board publishes) |
| Submit abstract | `/submit/data-tech-2027` |
| Board member | `/review/{token}` (score) · `/chair/{token}` (approve, decks, publish archive) · `/schedule/{token}` |
| Conference co-chair | `/review/{token}` (score) · `/chair/{token}` (decks, no approval) |
| Presenter | `/presenter/{token}` (from confirmation page after submit) |

## Features (implemented)

- Full submission form with multi-select degrees and 1–5 technical scale
- Optional co-presenter (1–2 presenters)
- Program status: Pending, Approved, Declined, Backup, Withdrawn
- Presenter withdraw **including after approval**
- Backup → Approved promotion (core only)
- **Board** (Dan Atkins, Sean Larson, Graeme Thickins, John Hogue): score, approve/decline/backup, deck review, schedule
- **Co-chairs** (1–2 per conference): score and deck review only
- Scoring: 0.0–1.0 slider (0.1 increments) + notes, once per reviewer, aggregated and sorted
- Capacity widget: 8×8 − EOD − Graeme − sponsors → ~44 community target
- Deck upload after approval; deck statuses: Submitted, Reviewed, Approved, Concern
- **Post-conference archive**: board publishes `/archive/{slug}`; per-session **non-shareable** flag excludes decks from the public library
- Chair **deck queue** tab with committee download; CSV export; submission rate limit + honeypot
- **Schedule builder**: 8-room grid (Data Tech layout), auto-generate with technical/variety balance per time row, drag-and-drop adjustments

## Project structure

```
app/           Next.js routes (public, review, chair, presenter, API)
components/    UI (form, dashboards, layout)
lib/           DB, validation, tokens, capacity math
prisma/        Schema, seed
docs/          Implementation plan
uploads/       Deck files (gitignored)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Apply Prisma schema to SQLite |
| `npm run db:seed` | Reset demo data and print tokens |

## Environment

| Variable | Default |
|----------|---------|
| `DATABASE_URL` | `file:./prisma/dev.db` |
| `UPLOAD_DIR` | `./uploads` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (email stub links) |

## Production notes

For a real deployment, use PostgreSQL and object storage for deck files (see comments in `.env.example`). Email stubs log to the server console in this demo.
