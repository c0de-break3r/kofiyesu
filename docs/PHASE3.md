# Phase 3 — Chat intake & urgent lead email

## What shipped

1. **Structured intake** (`/chat`) — 4 steps before free chat:
   - Project type (collaboration / security / job / general)
   - Timeline
   - Budget (optional)
   - Summary + optional “urgent” flag

2. **Server-side inquiries** — `POST /api/inquiries` (Clerk Bearer token):
   - Saves to `contact_inquiries` via service role
   - Stores `intake` JSON on the row

3. **Admin email** — when `needs_admin` is true (urgent checkbox, or ASAP + security/collaboration):
   - Sends via [Resend](https://resend.com) if `RESEND_API_KEY` + `ADMIN_NOTIFY_EMAIL` are set

4. **Smarter chat** — Gemini prompt includes intake context so visitors are not asked to repeat basics.

## Database

```bash
npm run db:push
```

Applies `20260523120000_inquiry_intake.sql` (`intake` jsonb column).

## Vercel env (add to Phase 1 set)

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key (server) |
| `ADMIN_NOTIFY_EMAIL` | Your inbox for urgent leads |
| `ADMIN_NOTIFY_FROM` | Optional verified sender (default Resend onboarding address) |

Verify a domain in Resend for production (`from` must match).

## Verify locally

```bash
npm run dev:api
```

1. Sign in → open `/chat`
2. Complete intake → chat unlocks (session remembers intake until tab closes)
3. Mark urgent → check Supabase row `needs_admin = true`
4. With Resend configured → email arrives at `ADMIN_NOTIFY_EMAIL`
5. Admin panel → Inquiries shows intake line + message

## Intake session

`sessionStorage` key `kofiyesu-chat-intake-done` skips intake until the tab is closed. Clear site data to test intake again.
