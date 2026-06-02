# Conference demo — backlog implementation plan

Ideas **not** in scope for [Conference v2](conference-v2-implementation-plan.md) (`feature/conference-demo-v2`). Use this doc to capture enough design detail that a future branch can pick up work without re-discovering requirements.

When an item moves into active development, open an issue, add phases to a new implementation plan (or extend v3), and link back here.

---

## How to add backlog items

Each item should include:

1. **Problem** — What pain this solves.
2. **Proposal** — User-visible behavior at a high level.
3. **Dependencies** — What exists today in the demo (models, routes).
4. **Sketch** — Data model, routes, and UI surfaces (bullet level is fine).
5. **Open questions** — Decisions deferred until implementation.
6. **Relationship to v2** — What v2 already covers (if anything) so we do not duplicate.

---

## BL-1 — Room-based QR codes for in-room talk feedback

**Status:** Backlog  
**Suggested priority:** Post–v2; after schedule builder is stable for a live event day.

### Problem

Committee feedback during abstract review (v2 `PresenterFeedback`) and post-conference **email** feedback (`CALL_FOR_FEEDBACK` in v2 §4.8) do not capture **in-the-moment audience reaction** per session. Organizers want low-friction feedback tied to **where** attendees are sitting, without handing out links per talk.

### Proposal

1. **Per room QR code** for a conference — printable PNG/SVG or PDF sheet for door signage.
2. Attendee scans → mobile web form → rates/comments on the **talk currently in that room** (or pick from today’s sessions in that room if between slots).
3. Board/co-chair views aggregated feedback per talk, per room, and per time slot.
4. Optional export (CSV) for program committee retrospective.

### Dependencies (today)

| Asset | Location |
|-------|----------|
| `ScheduleRoom`, `ScheduleSlot`, `SchedulePlacement` | `prisma/schema.prisma` |
| Schedule builder UI | `components/schedule/ScheduleBuilder.tsx` |
| Conference slug + timezone | `Conference` model |
| Public routes pattern | e.g. `/decks/public/...` |

v2 **does not** implement attendee-facing feedback capture; `CALL_FOR_FEEDBACK` is board-triggered email only.

### Sketch

#### QR payload

Encode HTTPS URL, e.g.:

```text
https://{host}/feedback/{conferenceSlug}/room/{roomPublicId}
```

- `roomPublicId` — opaque id (cuid or short code), not sequential room sort order, so URLs are unguessable enough for a demo.
- Optional query `?slot=...` if QR is regenerated per session block (usually one QR per room per day is enough).

#### Data model (indicative)

```text
RoomFeedbackLink     roomId, conferenceId, publicId, active, createdAt
SessionFeedback      id, conferenceId, roomId, placementId?, submissionId,
                     slotId, rating (1–5), comment?, createdAt,
                     userAgent?, optionalEmail?
```

- Resolve “current talk” server-side: given `roomId` + `now()` in conference timezone, find `SchedulePlacement` for that room whose `slotId` matches the active slot window (may need slot start/end times on `ScheduleSlot` — today only `label` + `sortOrder`; **backlog may add `startsAt` / `endsAt` or map sortOrder to template times**).

#### Routes (indicative)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/feedback/{slug}/room/{publicId}` | Public mobile feedback form |
| `POST` | `/api/feedback/session` | Submit rating + comment (rate limit, honeypot) |
| `GET` | `/api/chair/room-feedback` | Board: aggregates by talk / room |
| `GET` | `/api/chair/room-feedback/qr` | Generate/download QR image per room (`?token=`) |

#### UI

- **Public:** Large touch targets, 1–5 stars or sliders, optional short comment, “Which talk?” dropdown only if auto-detect fails.
- **Chair:** New tab or section **Room feedback** — table of sessions with avg rating, comment count, link to raw comments; filter by room and day.
- **Admin/board:** “Print QR codes” — grid of rooms with download buttons.

#### Security & abuse (demo level)

- Rate limit by IP on `POST`.
- Honeypot field on public form.
- No login required for attendees (anonymous feedback default).
- Optional “Email (optional)” for follow-up — off by default in demo.

### Open questions

| # | Question | Notes |
|---|----------|--------|
| 1 | One QR per room per day vs per session? | One per room simplifies printing; session picker handles edge cases. |
| 2 | Auto-detect talk from schedule clock? | Requires slot timing model beyond sort order. |
| 3 | Show feedback to presenters? | Chair-only vs presenter portal summary. |
| 4 | Moderation? | Flag/spam hide before v1 of this feature ships. |
| 5 | QR generator library? | e.g. `qrcode` npm package server-side or client canvas. |

### Relationship to v2

| v2 feature | Overlap |
|------------|---------|
| Committee `PresenterFeedback` | Different audience (committee → presenter); keep separate tables. |
| `CALL_FOR_FEEDBACK` email | Complementary; email is async post-event, QR is in-room realtime. |
| Schedule builder | Required to know which talk is in which room; may need time fields. |

### Suggested phases (when implemented)

1. Slot timing (or template time map) + “current session in room” resolver.
2. Public feedback form + `SessionFeedback` storage.
3. Chair aggregates + CSV export.
4. QR generation and print-friendly download page.
5. Docs, seed with sample feedback rows, exploring-the-demo walkthrough.

---

## BL-2 — Sched.com API integration (attendees, session choices, live seats)

**Status:** Backlog  
**Suggested priority:** After schedule builder has stable room/slot/placement model; may pair with [roadmap VIP/Eventbrite sync](roadmap.md#registration-system-integration-vip).  
**API reference:** [Sched API documentation](https://sched.com/api) (paid plans; API key from event control panel exports).

### Problem

The demo schedule (`ScheduleBuilder`) is **committee-authored**: approved talks are placed on an internal grid (`ScheduleRoom` × `ScheduleSlot`) with no link to **who plans to attend** each session. `ConferenceAttendee` in v2 (email reminders) is a local stub, not live registration data.

Organizers running events on **Sched** already have:

- Attendee profiles and **personal session choices** (`/api/user/sessions`, `/api/going/all`)
- Per-session **capacity**, **attendance lists**, and **waitlists** (`/api/session/seats` with `type=attendance|waitlist|all`)
- Session metadata including **seats** (capacity), venue/room, and times (`/api/session/list`, `/api/session/export`)

Without integration, the MinneAnalytics planner cannot reflect real-time fill levels, waitlist pressure, or attendee preference patterns when building or adjusting the program.

### Proposal

1. **Connect a conference** to a Sched event (`your-event.sched.com`) via stored API key and optional `site/sync` metadata (dates, venues, types).
2. **Sync sessions** between Sched and internal placements (mapping `session_key` ↔ `Submission` / `SchedulePlacement`).
3. **Pull attendee + session-choice data** on a schedule (and manual refresh) for near–real-time operations during the event.
4. Extend **`ScheduleBuilder`**:
   - **Room attendance map** — per room (and optionally per slot), visualize enrolled vs capacity, waitlist depth, check-in if returned by API.
   - **Attendee-aware scheduling aids** — surface conflicts, preference clusters, and “move talk to larger room” hints when waitlists grow.
5. Use attendee lists to support **preference-aware placement** (suggest swaps that reduce waitlist or align high-demand talks with room capacity), not only technical variety (`lib/schedule/balance.ts`).

### Dependencies (today)

| Asset | Location |
|-------|----------|
| `ScheduleBuilder`, `/api/schedule/*` | `components/schedule/`, `app/api/schedule/` |
| `ScheduleRoom`, `ScheduleSlot`, `SchedulePlacement` | `prisma/schema.prisma` |
| Auto-assign + variety | `lib/schedule/generate.ts`, `lib/schedule/balance.ts` |
| v2 `ConferenceAttendee` (stub) | v2 §4.8 — replace or mirror from Sched |

### Sched API surface (priority endpoints)

Base URL pattern: `https://{schedSubdomain}.sched.com/api/...`  
Constraints from Sched: **User-Agent required**, **&lt; 30 requests/minute** sustained, prefer **POST** where documented.

| Endpoint | Use in MinneAnalytics |
|----------|------------------------|
| [`/api/site/sync`](https://sched.com/api) | Event metadata, venues, types, last-modified cursor for incremental sync |
| [`/api/session/list`](https://sched.com/api) / [`/api/session/export`](https://sched.com/api) | Session catalog, times, `venue`/`address`, `seats` (capacity), `session_key` |
| [`/api/session/seats`](https://sched.com/api) | **Attendance** and **waitlist** per session (`type=attendance\|waitlist\|all`, `format=json`); check-in timestamps when enabled |
| [`/api/user/list`](https://sched.com/api) | Attendee roster (email, name, etc.) |
| [`/api/user/sessions`](https://sched.com/api) | Matrix of attendees × sessions they selected |
| [`/api/going/all`](https://sched.com/api) | All users’ schedules (JSON export) — alternative/complement to `user/sessions` |
| [`/api/session/add`](https://sched.com/api) / [`/api/session/mod`](https://sched.com/api) | Optional **push** internal placements to Sched (phase 2 sync) |

**Not in initial scope:** `AUTH:LOGIN` / `GOING:ADD` (mutate attendee schedules from our app)—read-first integration unless product explicitly wants two-way enrollment.

### Sketch

#### Configuration

```text
ConferenceSchedLink
  conferenceId, schedSubdomain, apiKeyEncrypted (env/secret store),
  lastSiteSyncAt, lastSessionSyncAt, lastAttendanceSyncAt,
  syncEnabled, createdAt
```

- API key in **environment** or admin-only config UI; never commit to repo.
- Demo mode: `SCHED_API_MODE=mock` serves JSON fixtures from `fixtures/sched/`.

#### Local cache (for UI + scheduling)

```text
SchedSessionMirror
  conferenceId, sessionKey, schedSessionId?, name,
  sessionStart, sessionEnd, venue, address, seatsCapacity,
  submissionId?, placementId?, rawJson, syncedAt

SchedSessionAttendance
  conferenceId, sessionKey, schedUserId?, email, name,
  listType (ATTENDANCE | WAITLIST), checkedInAt?, syncedAt

SchedUserMirror
  conferenceId, username, email, name, syncedAt

SchedUserSessionChoice
  conferenceId, username, sessionKey, syncedAt
```

Incremental sync: `session/list?since={epoch}` and per-session `session/seats` polled on a interval (e.g. 2–5 min in production UI; manual **Refresh from Sched** on schedule page).

#### ScheduleBuilder UI enhancements

| UI | Behavior |
|----|----------|
| **Room attendance map** | Grid or sidebar: each `ScheduleRoom` row shows current-slot session(s) with fill bar `enrolled / capacity`, waitlist count badge, color thresholds (green / amber / red) |
| **Placement cell tooltip** | On hover: attendance + waitlist counts, link “View list” (modal, PII board-only) |
| **Unscheduled / pool panel** | Optional sort by “predicted demand” from Sched historical or early enrollment on duplicate session_key |
| **Preference hints** | When dragging a talk: warn if many attendees with overlapping choices conflict with slot; suggest room with higher `seats` from Sched mirror |
| **Sync status bar** | Last sync time, error state, rate-limit backoff |

#### Server integration

| Module | Role |
|--------|------|
| `lib/sched/client.ts` | HTTP client: User-Agent, rate limiter, typed wrappers for seats/list/user/sessions |
| `lib/sched/sync.ts` | Orchestrate pull sync → upsert mirrors |
| `lib/sched/map-venues.ts` | Map Sched `venue`/`address` → `ScheduleRoom.name` (fuzzy match + manual overrides table) |
| `lib/sched/attendance-stats.ts` | Aggregates per room/slot/placement for heatmap + map |
| `lib/sched/scheduling-hints.ts` | Scoring function for “preference-aware” generate (extends or wraps `generate.ts`) |

#### Routes (indicative)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/admin/sched/connect` | Store subdomain + validate API key (`site/sync`) |
| `POST` | `/api/schedule/sched/sync` | Board: trigger sync (token auth) |
| `GET` | `/api/schedule/sched/attendance` | Room map + session stats for `ScheduleBuilder` |
| `GET` | `/api/schedule/sched/session/{key}/seats` | Board: attendance/waitlist detail modal |

### Open questions

| # | Question | Notes |
|---|----------|--------|
| 1 | Source of truth for grid? | **Internal placement** canonical; Sched mirror for attendance, or two-way sync? |
| 2 | Map Sched session → `Submission`? | By title match, manual link table, or push `session_key` from our id |
| 3 | Real-time vs polling? | Sched API is pull-based; “real-time” = short polling + manual refresh |
| 4 | PII in UI? | Attendee names/emails board-only; map shows counts only by default |
| 5 | Paid plan / API key per env? | Document requirement; mock mode for CI/local |
| 6 | Relation to v2 attendee email? | `ATTENDEE_REMINDER` could target `SchedUserMirror` instead of `ConferenceAttendee` |
| 7 | Waitlist → v2 email stub? | “Spot available” mail when promoted off waitlist (Sched manual today) |

### Relationship to v2

| v2 / other | Overlap |
|------------|---------|
| `ConferenceAttendee` + `ATTENDEE_REMINDER` | Sched becomes authoritative attendee list when linked |
| Phase 10 heatmaps | Room attendance map is complementary (live fill vs program composition) |
| BL-1 QR feedback | Could correlate in-room feedback with Sched check-in |
| `vipRegistered` | Still internal unless mapped from Sched ticket types |

### Suggested phases (when implemented)

1. Sched client + config + `site/sync` + `session/list` mirror; venue → room mapping UI.
2. `session/seats` sync + attendance aggregates; ScheduleBuilder fill bars.
3. `user/sessions` / `going/all` + preference-aware drag hints.
4. Room attendance map (full grid visualization).
5. Optional push `session/mod` when committee moves placements; docs + mock fixtures.

### Related links

- [Sched API — SESSION: SEATS](https://sched.com/api) (attendance, waitlist, `format=json`)
- [Sched API — USER: SESSIONS](https://sched.com/api) (attendee session choices)
- [Session attendance guide](https://sched.com/guide/session-attendance-enroll-and-withdraw/) (product behavior reference)

---

## BL-3 — (placeholder)

_Add the next backlog item here._

---

## Revision log

| Date | Change |
|------|--------|
| 2026-05-21 | Created backlog; BL-1 room QR codes for attendee talk feedback |
| 2026-05-21 | BL-2 Sched.com API: attendees, session choices, seats/waitlists, ScheduleBuilder room map |
