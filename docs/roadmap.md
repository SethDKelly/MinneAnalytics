# Roadmap

Enhancements **not yet** in the demo. For what is already built, see [Architecture](architecture.md) and [Exploring the demo](exploring-the-demo.md).

Open an issue or PR and reference a roadmap item by name when you start work.

## Security and identity

### Structured identity (SSO)

Replace long-lived committee URL tokens with organizational sign-in (e.g. Entra, Okta). Map IdP groups to `BOARD` / `CHAIR` per conference. Keep presenter magic links or time-limited tokens. Add session expiry, logout, and rotation.

### Conflict-of-interest registry

The demo supports **bias-reduced (blind) review** (hide presenter identity until scored; optional reveal) and hides committee aggregates on chair until the viewer has a current-version score. A full COI registry—declared conflicts per reviewer, block or flag scoring, exclusions on the chair dashboard—is not implemented.

## Presenter and communications

### Unlock approved abstracts

Presenters can edit **pending** and **backup** talks with revision history; **approved** talks are locked in the demo. Allow the board to unlock an approved talk for edits (with rescoring rules unchanged).

### Production email and calendar

Template-based sends (deck call, decline rounds, attendee reminder, etc.) are implemented with **stub delivery** and per-conference send audit on the chair **Communications** tab. Replace `lib/email-stub.ts` with SendGrid, SES, or similar. Optional calendar invites for approvals and deck deadlines. Keep `EMAIL_MODE=stub` for local dev.

### Presenter portal enhancements

Show selected themes and technical level more prominently on `/presenter/[token]`. Optional messaging about intended audience.

## Operations and integrations

### Registration system integration (VIP)

Sync `vipRegistered` from Eventbrite, Cvent, or webhooks by presenter email instead of manual chair toggles.

### Sched.com integration

Connect a conference to a [Sched](https://sched.com/api) event: sync sessions, pull attendee session choices and per-session attendance/waitlists, and extend **ScheduleBuilder** with room fill bars and a room attendance map. `ConferenceAttendee` today is a local stub for email previews; Sched would become the authoritative roster when linked.

### Committee activity audit log

Append-only log of program/deck/archive/score/email changes with board activity view and export.

## Platform scale

### Multi-conference public home (partial today)

`/upcoming` lists conferences from the database. Still to do: dynamic home page highlights, additional seeded events, and admin UI to create new conferences (today requires seed/DB).

### Production data layer

PostgreSQL for Prisma in production, S3-compatible deck storage, optional malware scan on upload. See `.env.example`.

### Analytics and reporting API

JSON reporting API beyond CSV export; pagination and scheduled exports for large events.

### In-room talk feedback (QR per room)

Attendees scan a **room-specific QR code** to rate and comment on the session in that room; board views aggregates per talk, room, and slot. Complements committee `PresenterFeedback` (review → presenter) and post-event email templates—different audience and timing. Likely needs slot start/end times (or a template time map) to resolve “current talk in room.”

## Suggested priority

1. Production data layer (if deploying beyond localhost)
2. Real email and SSO (operational readiness)
3. Audit log and COI registry (governance)
4. VIP registration sync and Sched integration (events operations)
5. In-room QR feedback and presenter portal polish (attendee experience)
