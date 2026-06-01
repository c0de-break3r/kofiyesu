# Kofiyesu — Portfolio (kofiyesu.com)

Personal portfolio for **Obed Prince Kofi Yesu**: interactive 3D home scene, project case studies, AI chat intake, admin CMS, and Paystack payments (GHS).

Built with **React 19**, **TypeScript**, **Vite 7**, and **Tailwind CSS v4**. Motion via **GSAP** and **Lenis**, 3D via **Three.js**, audio via **Howler**. GLSL shaders compile through **vite-plugin-glsl**.

## Scripts

| Command | Description |
| -------- | ------------ |
| `npm run dev` | Vite dev server on port **3000** (frontend only) |
| `npm run dev:full` | Vercel dev — frontend + `/api` routes |
| `npm run build` | Prisma generate, typecheck, production bundle → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Typecheck (`tsc -b`) |
| `npm run db:push` | Apply schema locally (dev) |
| `npm run db:migrate` | Apply migrations (`prisma migrate deploy`) |
| `npm run db:baseline` | One-time: mark existing migrations applied (after `db push` history) |
| `npm run db:seed` | Seed CMS defaults (features, projects, pricing, about) |
| `npm run db:studio` | Prisma Studio |

## Environment

Copy `.env.example` → `.env` and fill in values. Required for full production:

- **Clerk** — auth, chat, admin CMS
- **Neon `DATABASE_URL`** — CMS, inquiries, chat history, payments
- **Gemini** — AI chat replies
- **Paystack** — GHS checkout
- **Cloudinary** — admin media uploads (optional for read-only site)
- **Sentry** — error monitoring (optional)

See `.env.example` for the full list.

## Architecture

| Area | Path |
| ------ | ----- |
| Pages & features | `src/pages/`, `src/features/` |
| 3D scene | `src/three/` |
| Admin CMS | `src/components/admin/` |
| API router (Vercel) | `api/index.ts` → `server/routes/` |
| Prisma schema | `prisma/schema.prisma` |
| Static content (seed / dev fallback) | `src/content/` |

## Deploy

Production deploys via **Vercel Git integration** — push to `main`. The build runs `prisma migrate deploy` then `npm run build`. Set all env vars in the Vercel project dashboard to match `.env.example`.

If migrate deploy fails with **P3005** (database not empty), the DB was previously synced with `db push`. Run once locally against production:

```bash
npm run db:baseline
npm run db:migrate
```

## Content

- **Production**: CMS data from Neon (`SiteProject`, `SiteFeature`, `SiteAbout`).
- **Local dev**: Falls back to static files in `src/content/` when the API is unavailable.
- **Seed**: `npm run db:seed` upserts default features, projects, pricing packages, and about copy.
