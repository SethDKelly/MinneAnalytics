# Roadmap

Enhancements not yet in the demo. For what is already built, see [Architecture](architecture.md) and [Exploring the demo](exploring-the-demo.md).

Open an issue or PR and reference a roadmap item by name when you start work.

## Security and identity

### Structured identity (SSO)

Replace long-lived committee URL tokens with organizational sign-in (e.g. Entra, Okta). Map IdP groups to `BOARD` / `CHAIR` per conference. Keep presenter magic links or time-limited tokens. Add session expiry, logout, and rotation.

### Blind and conflict-aware scoring

Optional per-conference blind scoring (hide identity until score is submitted). Track conflicts of interest per reviewer; block or flag scoring; surface exclusions on the chair dashboard.

**v2 scope (planned):** [conference-v2-implementation-plan.md](conference-v2-implementation-plan.md) §4.6 — mask name/company/email on `/review` with explicit reveal; hide committee scores on `/chair` until the approver has scored the talk. Full COI registry remains roadmap-only.

## Presenter and communications

### Abstract revision workflow

Let presenters edit abstracts while `PENDING` (or `BACKUP`), with revision history and optional chair notification. Lock after approval unless the board unlocks.

**Implementation plan:** [conference-v2-implementation-plan.md](conference-v2-implementation-plan.md) on branch `feature/conference-demo-v2` (presenter edits, presenter-visible committee feedback, revision lineage, rescoring queue).

### Real email and calendar

Replace `lib/email-stub.ts` console output with SendGrid, SES, or similar. Optional calendar invites for approvals and deck deadlines. Keep a stub mode for local dev (`EMAIL_MODE=stub`).

**v2 scope (planned):** [conference-v2-implementation-plan.md](conference-v2-implementation-plan.md) §4.8 — global templates (deck call, deck reminder, decline rounds, attendee reminder, feedback), board send UI on chair, per-conference batch history and deduplicated decline waves. Production SMTP still deferred; stub + DB audit in v2.

### Presenter portal enhancements

Show selected themes and technical level on `/presenter/[token]`. Optional messaging about intended audience.

## Operations and integrations

### Registration system integration (VIP)

Sync `vipRegistered` from Eventbrite, Cvent, or webhooks by presenter email instead of manual chair toggles.

**Sched.com (broader):** Attendee roster, session choices, live attendance/waitlists, and room attendance map in `ScheduleBuilder` — see [conference-backlog.md](conference-backlog.md) (BL-2) and [Sched API](https://sched.com/api).

### Committee activity audit log

Append-only log of program/deck/archive/score changes with board activity view and export.

## Platform scale

### Multi-conference public home (partial today)

`/upcoming` lists conferences from the database. Still to do: dynamic home page highlights, additional seeded events, and admin UI to create new conferences (today requires seed/DB).

### Production data layer

PostgreSQL for Prisma in production, S3-compatible deck storage, optional malware scan on upload. See `.env.example`.

### Analytics and reporting API

JSON reporting API beyond CSV export; pagination and scheduled exports for large events.

### Mobile-friendly committee review

Responsive, touch-oriented review and chair flows for in-person committee meetings; simplified schedule view on small screens.

### In-room talk feedback (QR per room)

Attendees scan a room-specific QR code to rate and comment on the session in that room. Board views aggregates. Not in v2 — see [conference-backlog.md](conference-backlog.md) (BL-1).

## Suggested priority

1. Production data layer (if deploying beyond localhost)
2. Real email and SSO (operational readiness)
3. Audit log and abstract revisions (governance)
4. VIP registration sync and mobile review (events operations)
