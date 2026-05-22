# Roadmap

Enhancements not yet in the demo. For what is already built, see [Architecture](architecture.md) and [Exploring the demo](exploring-the-demo.md).

Open an issue or PR and reference a roadmap item by name when you start work.

## Security and identity

### Structured identity (SSO)

Replace long-lived committee URL tokens with organizational sign-in (e.g. Entra, Okta). Map IdP groups to `BOARD` / `CHAIR` per conference. Keep presenter magic links or time-limited tokens. Add session expiry, logout, and rotation.

### Blind and conflict-aware scoring

Optional per-conference blind scoring (hide identity until score is submitted). Track conflicts of interest per reviewer; block or flag scoring; surface exclusions on the chair dashboard.

## Presenter and communications

### Abstract revision workflow

Let presenters edit abstracts while `PENDING` (or `BACKUP`), with revision history and optional chair notification. Lock after approval unless the board unlocks.

### Real email and calendar

Replace `lib/email-stub.ts` console output with SendGrid, SES, or similar. Optional calendar invites for approvals and deck deadlines. Keep a stub mode for local dev (`EMAIL_MODE=stub`).

### Presenter portal enhancements

Show selected themes and technical level on `/presenter/[token]`. Optional messaging about intended audience.

## Operations and integrations

### Registration system integration (VIP)

Sync `vipRegistered` from Eventbrite, Cvent, or webhooks by presenter email instead of manual chair toggles.

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

## Suggested priority

1. Production data layer (if deploying beyond localhost)
2. Real email and SSO (operational readiness)
3. Audit log and abstract revisions (governance)
4. VIP registration sync and mobile review (events operations)
