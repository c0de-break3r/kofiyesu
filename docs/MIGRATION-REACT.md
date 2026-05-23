# Vue → React + Tailwind + Prisma (Neon)

## Stack

| Before | After |
|--------|--------|
| Vue 3 | React 19 + React Router |
| SCSS | Tailwind CSS v4 |
| Supabase JS client | Prisma → Neon Postgres |
| `@clerk/vue` | `@clerk/clerk-react` |
| Custom history routing | `react-router-dom` |

## Preserved (redesign)

- Hero CTAs: Start a project → `/chat`, View work → `#projects`
- Editorial projects grid with tags + subtitle
- Hero-only 3D canvas (Three.js modules unchanged)
- Chat 4-step intake + Gemini + urgent email
- Admin inquiries panel
- Urbanist typography, accent orange `#e85d04`, light/dark themes

## Setup

1. **Neon**: Create project, copy pooled `DATABASE_URL` into `.env.local`
2. **Prisma**: `npm run db:push`
3. **Clerk / Gemini / Resend**: see `.env.example`
4. **Install & dev**: `npm install && npm run dev:api`

## Project layout (React)

```
src/
  main.tsx          # entry
  App.tsx           # routes + theme
  index.css         # Tailwind v4 + design tokens
  pages/            # Home, Chat, Project
  features/home/    # Hero, About, Projects, Contact
  components/       # layout, chat, admin, three, ui
  hooks/            # useSiteContent, useTheme, useAdminPanel
  three/            # unchanged WebGL scene
  api/              # Vercel serverless (Prisma)
```

## Notes

- Legacy `.vue` files removed; TypeScript build includes only `.ts` / `.tsx`
- Full admin CMS UI (projects/about editors) can be extended in `AdminPanel`
- GSAP/Lenis scroll and Howler sounds: wire incrementally via `lib/scrollState` and `features/sounds/soundState`
