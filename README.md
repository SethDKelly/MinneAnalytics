# MinneAnalytics Conference Planning Demo

Prototype conference planning extension: public abstract submission, private chair/scorer review, core approval, presenter deck upload, and program capacity tracking.

**Not affiliated with production [minneanalytics.org](https://minneanalytics.org/).**

## Requirements

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for phased scope and status.

## Prerequisites

- Node.js 20+ (this project pins **Node 24 LTS** in `.nvmrc` / `.node-version`)
- npm (included with Node)

### First-time machine setup (Windows)

Node.js LTS can be installed with:

```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

Then open a **new** terminal so `node` and `npm` are on your PATH.

## Quick start

```powershell
cd Minneanalytics
.\scripts\setup.ps1    # copies .env, npm install, db push, seed
npm run dev
```

Or manually:

```bash
copy .env.example .env   # Windows: copy
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
| Submit abstract | `/submit/data-tech-2027` |
| Scorer / co-chair | `/review/{token}` |
| Program chair | `/chair/{token}` |
| Core approver | `/chair/{token}` (CORE role — Approve / Promote) |
| Presenter | `/presenter/{token}` (from confirmation page after submit) |
| Schedule builder | `/schedule/{token}` (chair / core — seed prints URL) |

## Features (implemented)

- Full submission form with multi-select degrees and 1–5 technical scale
- Optional co-presenter (1–2 presenters)
- Program status: Pending, Approved, Declined, Backup, Withdrawn
- Presenter withdraw **including after approval**
- Backup → Approved promotion (core only)
- Chair scoring: 0.0–1.0 slider (0.1 increments) + notes, once per reviewer, aggregated and sorted
- Capacity widget: 8×8 − EOD − Graeme − sponsors → ~44 community target
- Deck upload after approval; deck statuses: Submitted, Reviewed, Approved, Concern
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

## Next steps (Phase 6–7)

- Deck download for chairs
- CSV export
- Rate limiting on public form
- Additional facsimile pages (About, Upcoming)
