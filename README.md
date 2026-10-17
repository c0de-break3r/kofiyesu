# KofiYesu.com — Portfolio

A lightweight, frontend-only personal portfolio for **Obed Prince Kofi Yesu** —
software engineer (AI & automation, cybersecurity). It showcases projects,
documents professional experience, and links out to GitHub/email.

Built with **React 19**, **TypeScript**, **Vite 7**, **Tailwind CSS v4**, and
**React Router 7**. All content lives in the repository as typed data — no CMS,
database, authentication, or API.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Vite dev server on port **3000** |
| `npm run build` | Typecheck + production bundle → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Typecheck (`tsc -b`) |

## Site structure

| Route | Page |
| ----- | ---- |
| `/` | Home — compact hero, selected projects, technical focus, experience preview, contact |
| `/projects` | All projects with category filtering |
| `/project/:slug` | Individual project case study |
| `/experience` | Vertical timeline of professional roles |
| `/about` | Bio, portrait, expertise, technologies, links |

## Editing content

Everything is plain TypeScript in `src/data/`. Edit a file, add assets if
needed, commit, and push — the site redeploys automatically.

### Add a project

1. Open `src/data/projects.ts` and append a new object to the `projects` array.
2. Add only fields you can verify. Every field except `slug`, `title`,
   `category`, `status`, and `summary` is optional.
3. Drop screenshots into `src/assets/images/projects/<slug>/` and import them at
   the top of `projects.ts` (e.g. `import shot from "@/assets/images/projects/my-app/shot-0.webp";`),
   then reference them via `thumbnail`, `hero`, or `gallery`. A project with no
   screenshot renders a clean title card — never add a fake image.

```ts
{
  slug: "my-app",
  title: "My App",
  category: "web",           // web | ai | security | mobile
  status: "live",            // live | completed | beta | prototype | in-development
  year: 2026,
  summary: "One or two lines shown on the card.",
  overview: "What the project is.",
  problem: "The idea or problem behind it.",
  features: ["Core capability", "Another capability"],
  contribution: "What you specifically built.",
  stack: ["TypeScript", "React"],
  thumbnail: shot,
  liveUrl: "https://my-app.example.com",
  sourceUrl: "https://github.com/c0de-break3r/my-app",
  sortOrder: 3,              // lower shows first
}
```

The `/projects` grid, category filters, the home "Selected work" preview, and
the `/project/my-app` detail page all render automatically from this entry.

### Add experience

Open `src/data/experience.ts` and append an entry to the `experience` array.
Keep dates accurate — if a full range isn't documented, show only what is.
Formal roles go here; independently built products belong in `projects.ts`.

```ts
{
  id: "company-role",
  organization: "Company",
  role: "Position title",
  period: "Jan 2026 – Present",
  location: "City, Country",
  summary: "One-line context.",
  responsibilities: ["Concrete, verified responsibility."],
  technologies: ["Tool", "Skill"],
}
```

### Edit your profile

`src/data/profile.ts` is the single source of truth for your name, title,
location, hero intro, biography, expertise, technologies, and contact links
(email + GitHub). Update it and the whole site follows.

## Deploy

Production deploys through **Vercel Git integration** — push to `main`. The
build runs `npm run build` and Vercel serves the static SPA (client-side routes
fall back to `index.html` via `vercel.json`). No database or environment
variables are required to build.

### Optional: Sentry error monitoring

Sentry is entirely optional and env-gated. It is loaded dynamically and only if
a DSN is set — so it stays out of the initial bundle when unused. To enable it,
set in the Vercel project:

- `VITE_SENTRY_DSN` — client DSN
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` — source-map upload at build time (optional)

See `.env.example` for the full list.
