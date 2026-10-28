# kofiyesu One-Page Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/` of the kofiyesu portfolio as a premium one-page scroll in the Wensity UI template aesthetic, using rea-uncensored as the RE tool for reference extraction, then push to GitHub and deploy to kofiyesu.vercel.app.

**Architecture:** Dark one-pager built from fresh components in `src/features/home/`, driven entirely by typed data in `src/data/*`. New design tokens live once in `src/index.css` (Tailwind v4 `@theme` + `:root` vars). Framer-motion supplies scroll reveals. Existing sub-pages keep their routes and data, inheriting the dark theme via shared tokens.

**Tech Stack:** React 19 · Vite 7 · Tailwind CSS v4 · framer-motion · @fontsource-variable (Space Grotesk, JetBrains Mono) · react-router-dom v7.

## Global Constraints

- All commits authored by `c0de-break3r <y3suh4xn3twork@gmail.com>` (repo-local git config already set).
- Dark-first design: bg `#0a0a0b`, surface `#111113`, accent `#00e5ff`, mono labels. No light-theme branch needed.
- CSP stays `img-src 'self' data: blob:` — no remote images; stat cards and fonts must be locally committed/bundled. Attribution "Template by Wensity UI" stays in the footer.
- No copying of reference-site code/CSS/images/fonts. Mirror + analysis live outside the repo in `../Freelancing/aarav-liart-mirror/`.
- Verification per task: `bun run typecheck` (tsc -b) zero errors; `bun run build` success at milestones; `npm run dev` manual pass at the end.
- Repo has no test framework — typecheck + build + visual check is the agreed test cycle (spec).
- Deploy gate: production deploy runs only after build is green and the owner said push.

## File map

- Modify: `src/index.css` (new tokens, fonts, helpers)
- Modify: `index.html` (head cleanup: fonts, theme colors, data-theme="dark", drop stale `#fff`-era markup + dead `/api/site/*` prefetch script)
- Modify: `vite.config.ts` (PWA manifest colors only)
- Modify: `src/data/profile.ts` (add `tagline`, `currentlyBuilding`)
- Modify: `src/components/ProjectCard.tsx` (dark status chips)
- Modify: `src/components/layout/Footer.tsx` (credit line)
- Create: `src/components/ui/SectionHeader.tsx`, `src/components/ui/Reveal.tsx`
- Create: `src/features/home/HeroSection.tsx`, `ExperienceSection.tsx`, `ProofOfWorkSection.tsx`, `CurrentlyBuildingSection.tsx`, `ContributionsSection.tsx`, `StackSection.tsx`, `SelectedWorkSection.tsx`, `ConnectSection.tsx`
- Rewrite: `src/pages/HomePage.tsx`
- Remove superseded consumers: `src/features/home/Hero.tsx`, `SelectedProjects.tsx`, `ContactSection.tsx` (only HomePage used them; delete after rewrite)
- Create: `src/assets/stats/*.png` (downloaded contribution cards, committed)
- Create: `docs/superpowers/plans/2026-10-28-kofiyesu-onepage-rebuild.md` (this file)
- Outside repo: `../Freelancing/aarav-liart-mirror/` + `aarav-liart-rea-analysis-summary.md` (REA phase)

### Task 1: REA reference extraction (informational, parallel)

- [x] wget-mirror `https://aarav-sharma-liart.vercel.app` (robots on, depth 2, assets) into `../Freelancing/aarav-liart-mirror/`
- [ ] Run fork CLI: `rea analyze-javascript-application ../Freelancing/aarav-liart-mirror --json > ../Freelancing/aarav-liart-rea-analysis.json`
- [ ] Write `../Freelancing/aarav-liart-rea-analysis-summary.md` (section order, tokens observed, motion patterns)
- [ ] Note: no commit (files live outside the repo)

### Task 2: Dependencies + design system (index.css)

- [x] `bun add framer-motion @fontsource-variable/space-grotesk @fontsource-variable/jetbrains-mono`
- [ ] Rewrite `src/index.css`: fonts imports, `@theme` (sans/mono/accent), `:root` dark vars, focus/selection, `.eyebrow`, `.bg-grid`, scrollbar, anchor `scroll-margin-top`
- [ ] `bun run typecheck` → 0 errors; commit `feat: dark one-page design system tokens and fonts`

### Task 3: Data additions + misc theme cleanup

- [ ] `profile.ts`: add `tagline` (Build with purpose. Automate with intent. Secure by design.), `currentlyBuilding[]` (CineFlow, Barbers Eazy Connect, Africana Mobility, DocxBase, SOCANA AI — name, description, focus tags, honest "in development")
- [ ] `index.html`: `data-theme="dark"`, theme-color/Tile `#0a0a0b`, remove Urbanist preloads + stale API prefetch script, keep favicon/manifest
- [ ] `vite.config.ts`: manifest `theme_color: "#00e5ff"`, `background_color: "#0a0a0b"`
- [ ] `ProjectCard.tsx`: dark status chips (`bg-emerald-400/10 text-emerald-300 border-emerald-400/20` pattern ×5)
- [ ] typecheck; commit `feat: content + meta updates for dark one-pager`

### Task 4: Primitives + home sections

- [ ] `SectionHeader.tsx` — props `{ index: string; title: string; children? }` → mono eyebrow `01 — EXPERIENCE` + h2
- [ ] `Reveal.tsx` — framer-motion `whileInView` fade/24px-rise wrapper, `useReducedMotion` respected; exports `Reveal({children, delay, className})`
- [ ] `HeroSection.tsx` — location eyebrow + dot, tagline quote, name h1, title mono line, CTAs (mailto + `#work`), GitHub/Email socials, portrait + cyan glow, `.bg-grid` backdrop
- [ ] `ExperienceSection.tsx` — `experience.slice(0,3)` timeline (org, role, period, first responsibility)
- [ ] `ProofOfWorkSection.tsx` — `getSelectedProjects(6)` grid of existing `ProjectCard`
- [ ] `CurrentlyBuildingSection.tsx` — `profile.currentlyBuilding` mini-cards
- [ ] `ContributionsSection.tsx` — imported locally committed stat images (stats/streak/top-langs), fallback <noscript>-safe
- [ ] `StackSection.tsx` — `TechStackCard` with site tech list
- [ ] `SelectedWorkSection.tsx` — 3 deep-dive rows → `/project/:slug`
- [ ] `ConnectSection.tsx` — GitHub + Email cards
- [ ] Rewrite `HomePage.tsx` composing all sections + `Footer`; delete superseded `Hero.tsx`/`SelectedProjects.tsx`/`ContactSection.tsx`
- [ ] typecheck + build; commit `feat: one-page home sections in Wensity-style dark theme`

### Task 5: Footer credit + final polish

- [ ] `Footer.tsx`: add "Template by Wensity UI" credit line · keep copy/idempotent
- [ ] Reuse check: no dangling imports of removed components
- [ ] typecheck + build + `npm run dev` manual anchor/theme pass; commit `feat: footer attribution + final polish`

### Task 6: REA summary of reference (from Task 1 artifacts)

- [ ] Write summary MD, cite tokens/motion observations; no repo commit

### Task 7: Push + deploy

- [ ] Push `feature/one-page-rebuild` to origin (c0de-break3r identity)
- [ ] Merge to `main` (ff or merge commit) and push → production via Git→Vercel integration if connected
- [ ] If project not git-connected: `vercel deploy --prod --yes` from repo (project `kofiyesu`)
- [ ] Verify: `curl -s -o /dev/null -w '%{http_code}' https://kofiyesu.vercel.app` → 200 + spot-check section markup
