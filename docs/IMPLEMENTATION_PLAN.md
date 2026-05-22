# MinneAnalytics Conference Planning Demo — Implementation Plan

Prototype extension to the MinneAnalytics experience for conference chairs, scorers, and presenters. Built as a self-hosted Next.js application with a local SQLite database for demos.

## Goals

- Public MinneAnalytics-style shell and presentation submission form
- Private token URLs for chair/co-chair scoring (0–1 + notes)
- Chair dashboard: aggregated scores, sorting, capacity planning, status management
- Core manual approval; backup → approved promotion
- Presenter portal: withdraw (including after approval), deck upload after approval
- Deck workflow: Submitted → Reviewed → Approved / Concern

## Architecture

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma |
| Styling | Tailwind CSS (MinneAnalytics navy `#202659`) |
| Validation | Zod |
| Auth (demo) | Unguessable URL tokens (hashed server-side) |

## Program & deck status

**Program:** `PENDING` | `APPROVED` | `DECLINED` | `BACKUP` | `WITHDRAWN`  
**Deck:** `SUBMITTED` | `REVIEWED` | `APPROVED` | `CONCERN` (only when program is `APPROVED`)

## Phases

### Phase 0 — Foundation ✅ (this sprint)

- [x] Implementation plan document
- [x] Next.js project scaffold
- [x] Prisma schema, migrations, seed (demo conference + reviewer tokens)
- [x] Shared layout (header, nav, footer) matching MinneAnalytics branding
- [x] Environment and README for local run

**Exit criteria:** `npm run dev` serves home page; database seeded with demo tokens printed to console/README.

---

### Phase 1 — Public submission ✅ (this sprint)

- [x] Conference submission form with all required fields
- [x] Multi-select degrees (primary + co-presenter)
- [x] Technical level 1–5
- [x] Conditional co-presenter block
- [x] API: create submission → `PENDING`, issue presenter token
- [x] Confirmation page with presenter portal link

**Exit criteria:** Submitters can complete form and receive a presenter link.

---

### Phase 2 — Abstract scoring ✅ (this sprint)

- [x] `/review/[token]` scorer UI: list submissions, 0–1 + notes (one score per reviewer)
- [x] Server-side token validation
- [x] Unique constraint: one score per submission per reviewer

**Exit criteria:** Scorer token opens working scoring interface.

---

### Phase 3 — Chair dashboard ✅ (this sprint)

- [x] `/chair/[token]` full submission list with aggregate score (sum + average)
- [x] Sort by aggregate descending
- [x] Set `DECLINED`, `BACKUP`
- [x] Capacity widget (64 − 6 EOD − 4 Graeme − sponsors range → ~44 community target)
- [x] Count approved / backup / pending

**Exit criteria:** Chair can rank talks and mark declined/backup.

---

### Phase 4 — Core approval & backups ✅ (this sprint)

- [x] Core role token: manual **Approve** on `PENDING` and **Promote** on `BACKUP`
- [x] Approved count updates capacity meter
- [x] Deck portal unlocked on approve

**Exit criteria:** Top-ranked pending talks can be approved; backups promoted.

---

### Phase 5 — Presenter portal ✅ (this sprint)

- [x] `/presenter/[token]` status view
- [x] Withdraw from `PENDING`, `BACKUP`, or `APPROVED` (with confirmation)
- [x] Deck upload (PDF/PPTX) when `APPROVED`
- [x] Deck status transitions for chairs on deck review UI

**Exit criteria:** Approved presenter uploads deck; can withdraw after approval.

---

### Phase 5b — Schedule auto-builder ✅ (this sprint)

- [x] Data Tech–style grid: 8 rooms, morning registration (8:00), kickoff/Applied AI (9:00), 30-minute session rows, breaks/lunch/networking
- [x] `/schedule/{token}` for chair/core planners
- [x] **Generate schedule** — balances technical level (1–5) variety per time row
- [x] Unscheduled pool + drag-and-drop into cells / back to pool
- [x] Swap when dropping onto occupied cell
- [x] Variety color legend (business → technical)

**Exit criteria:** Planners generate a balanced draft and manually adjust via drag-and-drop.

---

### Phase 6 — Deck chair review (partial)

- [x] Per-submission deck status buttons (Reviewed / Approved / Concern) on chair dashboard
- [ ] Dedicated deck queue filter on chair view
- [ ] File download for chairs

**Exit criteria:** Chairs process all submitted decks without leaving chair UI.

---

### Phase 7 — Polish & demo hardening (follow-up)

- [ ] Additional static pages (About, Upcoming) as facsimile
- [ ] CSV export of submissions + scores
- [ ] Rate limiting / honeypot on public form
- [ ] Email stubs (approval + presenter link)
- [ ] Production Postgres + S3 for files

---

## Demo URLs (after seed)

| Role | Path | Notes |
|------|------|-------|
| Home | `/` | Facsimile landing |
| Submit | `/submit/data-tech-2027` | Public form |
| Scorer | `/review/{token}` | From seed |
| Chair | `/chair/{token}` | From seed |
| Core | `/chair/{token}` with `CORE` role | Approve / promote |
| Presenter | `/presenter/{token}` | Per submission |

Tokens are printed when running `npm run db:seed`.

## Slot capacity formula (chair widget)

```
raw_slots     = rooms × sessions_per_room  (default 8 × 8 = 64)
after_trim    = raw_slots - eod_trim - graeme  (default 64 - 6 - 4 = 54)
community_target = after_trim - sponsor_slots  (sponsors default 7–11 → ~44)
```

Sponsor sessions tracked separately via `isSponsorSession` flag (optional on submission).

## Security notes (demo)

- Store only `SHA-256(token)` in database
- Do not log presenter/reviewer tokens in production
- Mark UI as prototype; do not deploy with real PII without HTTPS and retention policy

## References

- Live site reference: [minneanalytics.org](https://minneanalytics.org/)
- Requirements threads: submission fields, scoring, statuses, withdraw-after-approval, multi-select degrees, backup promotion
