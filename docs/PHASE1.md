# Phase 1 — Deploy fixes & CMS content

## 1. Apply schema & seed (Neon)

See [DATABASE.md](./DATABASE.md). From the project root:

```bash
npm run db:push
npm run db:seed
```

This sets:

- **About** — name, job title, intro, tagline, location, services
- **Projects** — KhelianCart, Recon Automation Toolkit, API Pentest Workflows

Re-running the seed is safe (upserts on `slug` / `site_about`).

## 2. Vercel environment variables

| Variable | Where |
|----------|--------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Client |
| `VITE_CLERK_ADMIN_USER_IDS` | Client |
| `DATABASE_URL` | Server (Neon **pooled** Postgres URI for Prisma) |
| `CLERK_SECRET_KEY` | Server |
| `CLERK_ADMIN_USER_IDS` | Server (same IDs as `VITE_`) |
| `GEMINI_API_KEY` | Server (chat) |
| `GEMINI_MODEL` | Optional (`gemini-3-flash-preview`) |
| `VITE_CLOUDINARY_*` | Client (admin media uploads) |
| `RESEND_API_KEY` | Optional (urgent inquiry email) |
| `ADMIN_NOTIFY_EMAIL` | Optional |

Remove legacy `SUPABASE_*` and `VITE_SUPABASE_*` from Vercel if present.

## 3. Local development

```bash
npm install
npm run dev:api   # Vite + /api routes (not plain npm run dev)
```

Open http://localhost:3000 — tap once to unlock audio.

## 4. Deploy

```bash
npm run build
git push
```

Verify on production:

- Home shows **3 projects** and about copy (not empty API)
- No Clerk `useAuth` errors in console
- Audio starts after first click
- Sign in as admin → **✎** button opens CMS (Projects / About / Inquiries)

## 5. Thumbnails

- KhelianCart: `/public/thumbnails/kheliancart.webp`
- Other seeded projects use `/meta/logo-avatar.png` until you upload images in admin (Cloudinary).

Replace thumbnails in **Admin → Projects** when `VITE_CLOUDINARY_*` is set.
