# Exploring the proof of concept

This guide is for anyone running the demo locally—evaluators, product owners, or new developers who want to see end-to-end behavior before reading the code.

## Before you start

1. Complete [setup](../README.md#quick-start) through `npm run dev`.
2. Run `npm run db:seed` (or use `scripts/setup.ps1` / `scripts/setup.sh`, which seed automatically).
3. **Copy the URLs printed in the terminal.** They look like:

   ```
   Dan Atkins: http://localhost:3000/chair/<long-token>
     Score abstracts: http://localhost:3000/review/<long-token>
   ```

   Each board member gets their own token; co-chairs get chair + review URLs; schedule uses a board token (seed prints Dan Atkins’s schedule link).

4. Open [http://localhost:3000](http://localhost:3000). A prototype banner appears at the top of every page.

Seed output includes a **site administrator** URL at `/admin/{token}` (separate from board/co-chair tokens).

## Suggested walkthrough (~20 minutes)

### 0. Site administration (optional)

| Step | Action |
|------|--------|
| 1 | Open the **admin** URL from seed output. |
| 2 | Review submission window dates and open/closed toggle. |
| 3 | Toggle **Bias-reduced (blind) review** if you need legacy visible scoring for comparison. |
| 4 | Adjust theme targets (min/max approved counts) on the taxonomy list. |
| 5 | After testing, use **Archive conference** only on a throwaway seed—not the main Data Tech 2027 demo unless you re-seed. |

### 1. Public site and submission

| Step | Action |
|------|--------|
| 1 | Browse `/`, `/about`, `/upcoming` from the header. |
| 2 | Open **Submit a Talk** → `/submit/data-tech-2027` (pick up to three **themes**). |
| 3 | Submit a test abstract (required fields only is fine). |
| 4 | On the thanks page, copy the **presenter portal** link (`/presenter/...`). |

The new talk appears as **Pending** in committee views. Email content is stubbed to the dev server terminal.

### 2. Committee scoring

| Step | Action |
|------|--------|
| 1 | Open a **review** URL from seed (board or co-chair). |
| 2 | Score pending talks with the 0.0–1.0 slider (0.1 steps) and optional notes. |
| 3 | Notice **needs score** vs **scored by you** sections. |
| 4 | **Blind review (default):** presenter name/org/email are hidden; committee averages appear only after you save a score. Use **Reveal identity** only for conflict checks. |
| 5 | Expand a scored talk → **View revision history** for version snapshots and field diffs. **Alex Rivera** is seeded at v2 with stale committee scores. |
| 6 | Open **Needs rescore** for talks you scored before a presenter edit; save again to pin your score to the current version. Committee averages use only current-version scores. |

Seed data already includes **approved** and **declined** talks with auto-generated committee scores (high for approved, low for declined).

### 3. Chair dashboard (program + decks)

Open a **chair** URL (board member recommended first).

**Program tab**

- With blind review on: **Awaiting your score** (no email or committee scores) then **Scored by you** (sorted by average). Link to the review page to unlock a row.
- Each row shows **vN**, lineage summary (e.g. “2 of 5 scored v2”), and **Mark revision reviewed** (board) when status is Updated.
- Committee averages include only scores at the current abstract version.
- With blind review off (admin toggle): all talks sorted by average score.
- Filter by **theme**.
- **Theme coverage** panel shows approved vs target counts per theme.
- **Board only:** Approve, Mark backup, Decline (saturation warning if a theme is over target—confirm to proceed).
- Promote **backup** → approved.
- **VIP event registration** toggle on approved talks.
- Capacity widget shows slot targets (8×8 grid minus EOD/Graeme/sponsors).

**Balance tab**

- Theme gap summary and **technicality balance** histogram for approved talks (vs planning targets).

**History tab** (board)

- Open archived conferences (e.g. **Data Tech 2026**) via `?archive=data-tech-2026` for read-only review.

**Deck queue tab**

- Approved sessions only.
- Download uploaded decks (after a presenter uploads).
- Mark deck Reviewed / Approved / Concern.
- **Board:** non-shareable flag, publish/unpublish post-conference archive.

Try **Export CSV** from the header.

### 4. Board vs co-chair

| Capability | Board (`/chair/{board-token}`) | Co-chair (`/chair/{chair-token}`) |
|------------|--------------------------------|-----------------------------------|
| Score at `/review/...` | Yes | Yes |
| Approve / decline / backup | Yes | No (UI hidden) |
| Deck review | Yes | Yes |
| VIP registration | Yes | Yes |
| Publish archive | Yes | No |
| Schedule builder | Yes | No (404 or unauthorized) |

Open a co-chair chair URL to confirm approval buttons are absent and messaging explains board-only approval.

### 5. Presenter portal

Use the presenter link from step 1 (or a seed sample link).

| Program status | What to try |
|----------------|-------------|
| Pending | View status; optional withdraw. |
| Approved (seed has examples) | Upload PDF/PPTX deck; withdraw still allowed with confirmation. |

After upload, return to **Deck queue** on chair and mark the deck through the workflow.

### 6. Schedule builder (board)

Open the **schedule** URL from seed (board only).

1. Click **Generate schedule** — assigns approved talks across rooms/time with variety balancing.
2. Drag talks between cells and the unscheduled pool; drop on occupied cells swaps assignments.

### 7. Post-conference archive

1. On chair **Deck queue**, ensure at least one approved talk has an uploaded deck marked **Approved** and **Shareable**.
2. Click **Publish archive**.
3. Visit `/archive/data-tech-2027` (header link or home page).
4. Download a deck via **View / download**.

Mark a session **non-shareable** and confirm it disappears from the public list while the archive stays published.

## What seed preloads

- **Conferences:** Data Tech 2027 (`ACTIVE`, open CFP) and Data Tech 2026 (`ARCHIVED`, for History tab)
- **Theme taxonomy** on 2027 with target min/max counts
- **~12 sample abstracts** on 2027 (mix of pending, approved, declined with demo scores; themes on talks)
- **Site admin** token at `/admin/...` (submission window + themes + archive action)
- **Four board members** + **two co-chairs** with fresh tokens each seed
- **Empty schedule grid** ready for generate/drag

Re-running `npm run db:seed` **wipes** submissions and tokens; save new URLs from the terminal.

## Troubleshooting exploration

| Issue | Fix |
|-------|-----|
| 404 on `/review/...` or `/chair/...` | Token from an old seed; re-run `npm run db:seed` and use new URLs. |
| Chair shows zero scores | Re-seed; approved/declined seed rows get auto-scores, pending need manual scoring. |
| Archive empty | Publish from chair + shareable deck with file + deck status Approved. |
| Upload fails | Talk must be **Approved**; check `UPLOAD_DIR` exists (created on first upload). |
| Prisma EPERM on Windows | Stop `npm run dev`, run `npx prisma generate`, restart dev. |

## Next steps for developers

- [Routing](routing.md) — file map and API list
- [Architecture](architecture.md) — roles, statuses, security model
- [Contributing](contributing.md) — code conventions
- [Roadmap](roadmap.md) — planned enhancements
