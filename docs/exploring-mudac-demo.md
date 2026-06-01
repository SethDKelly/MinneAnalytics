# Exploring the MinneMUDAC judging demo

Walkthrough for [MinneMUDAC 2026](https://minneanalytics.org/minnemudac-2026/) volunteer judging: tournament directors configure the event; judges score student teams; directors rank results by division.

This demo runs **alongside** the Data Tech conference planning flow. Use the header **MUDAC demo** link or open [/mudac](http://localhost:3000/mudac).

## Before you start

1. Complete [setup](../README.md#quick-start) and `npm run dev`.
2. Run `npm run db:seed`.
3. Copy URLs from the **MinneMUDAC Judging Demo** section in the terminal:

   ```
   Director:      http://localhost:3000/mudac/director/<token>
   Judge register: http://localhost:3000/mudac/minnemudac-2026/register
   Demo judges (Panel A): http://localhost:3000/mudac/judge/<token>
   ```

4. Demo registration code: **`volunteer`** (when registering a new judge).

Seed preloads **teams 01–03** on **Panel A**, three demo judges with submitted scorecards, and five scoring criteria.

## Suggested walkthrough (~15 minutes)

### 1. Tournament director — setup

| Step | Action |
|------|--------|
| 1 | Open the **director** URL from seed. |
| 2 | **Setup** tab — confirm status **Judging**, registration open, scoring not locked. |
| 3 | **Criteria** tab — review five default criteria (add/edit if desired). |
| 4 | **Teams** tab — note seeded teams `01`–`03` (undergraduate). |

### 2. Panels and judges

| Step | Action |
|------|--------|
| 1 | **Panels** tab — see **Panel A / B / C** with three slots each (academic, industry business, industry technical). |
| 2 | Confirm demo judges are assigned to **Panel A** slots. |
| 3 | Optional: open **Judge register** from [/mudac](http://localhost:3000/mudac), register a fourth judge, assign them on **Panels**. |

### 3. Presentations

| Step | Action |
|------|--------|
| 1 | **Presentations** tab — teams `01`–`03` assigned to Panel A. |
| 2 | Assign another team to Panel B if you created extra teams. |

### 4. Judge scoring

| Step | Action |
|------|--------|
| 1 | Open a **demo judge** URL from seed (Panel A). |
| 2 | Tap **Score** on team `01` (or **View / edit** if already submitted). |
| 3 | Adjust criterion scores — use sliders on a phone or number inputs on desktop. |
| 4 | **Save draft** or **Submit scorecard** — sticky footer on mobile. |
| 5 | Return to the team list and open another team. |

Judges only see **team ID** and **division**, not school names.

### 5. Rankings and export

| Step | Action |
|------|--------|
| 1 | Return to the **director** dashboard → **Scorecards** tab. |
| 2 | Expand **Details** on team `01` — see each judge’s criterion breakdown. |
| 3 | **Rankings** tab — undergraduate division should show `01` > `02` > `03` (seed data). |
| 4 | Toggle **Panel aggregate** (mean vs sum) and **Ranking display** (normalized, z-score). |
| 5 | Click **Export CSV** and open the downloaded file. |

### 6. Lock scoring (optional)

| Step | Action |
|------|--------|
| 1 | Director **Setup** — enable **Scoring locked** or set status **Locked**. |
| 2 | Judge portal — scorecards become read-only. |

## Roles at a glance

| Role | URL pattern | Can do |
|------|-------------|--------|
| Tournament director | `/mudac/director/{token}` | Criteria, teams, panels, presentations, rankings, CSV export |
| Judge | `/mudac/judge/{token}` | Score teams on assigned panel only |
| Judge (self-register) | `/mudac/{slug}/register` | Create account with optional registration code |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on director/judge URL | Re-run `npm run db:seed`; use fresh URLs from the terminal. |
| Registration rejected | Enable **Judge registration open** on director Setup; use code `volunteer` if required. |
| Cannot assign judge to slot | Judge **type** must match slot requirement (e.g. academic → academic slot). |
| Rankings empty | Assign teams on **Presentations**; ensure judges submitted scorecards. |
| Judge cannot save scores | Turn off **Scoring locked**; event status must not be Locked/Archived. |

## Next steps for developers

- [MUDAC architecture](mudac-architecture.md) — data model and aggregation
- [MUDAC implementation plan](mudac-implementation-plan.md) — delivery record (Phases 1–5 complete)
- [Routing](routing.md) — MUDAC routes and APIs
