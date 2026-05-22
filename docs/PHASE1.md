# Phase 1 — Deploy fixes & CMS content

## 1. Apply CMS seed to Supabase

From the project root (with [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project):

```bash
supabase db push
```

This runs `20260522120000_seed_site_content.sql`, which sets:

- **About** — name, job title, tagline, location, four services
- **Projects** — KhelianCart, Recon Automation Toolkit, API Pentest Workflows

Re-running the migration is safe (upserts on `slug` / updates `site_about`).

## 2. Vercel environment variables

| Variable | Where |
|----------|--------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Client |
| `VITE_CLERK_ADMIN_USER_IDS` | Client |
| `VITE_SUPABASE_URL` | Client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client |
| `SUPABASE_URL` | Server (same as above) |
| `SUPABASE_ANON_KEY` | Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (admin writes) |
| `CLERK_SECRET_KEY` | Server |
| `CLERK_ADMIN_USER_IDS` | Server (same IDs as `VITE_`) |
| `GEMINI_API_KEY` | Server (chat) |
| `GEMINI_MODEL` | Optional (`gemini-3-flash-preview`) |

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
- Admin **✎** → Projects / About / Inquiries

## 5. Thumbnails

- KhelianCart: `/public/thumbnails/kheliancart.webp`
- Other seeded projects use `/meta/logo-avatar.png` until you upload images in admin (Cloudinary).

Replace thumbnails in **Admin → Projects** when `VITE_CLOUDINARY_*` is set.
