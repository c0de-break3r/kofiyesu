# Design — kofiyesu one-page portfolio rebuild (Wensity-style)

Date: 2026-10-28 · Branch: `feature/one-page-rebuild` · Owner: c0de-break3r <y3suh4xn3twork@gmail.com>

## Goal

Rebuild `/` of the kofiyesu portfolio (React 19 · Vite 7 · Tailwind CSS v4) as a
premium one-page scroll in the same structure and feel as the Wensity UI
portfolio seen at https://aarav-sharma-liart.vercel.app — using the
**rea-uncensored fork** as the reverse-engineering tool for the reference site —
then deploy to **https://kofiyesu.vercel.app** (Vercel project `kofiyesu`,
account `bornblix`).

All code is written fresh in this repository. All content belongs to
Obed Prince Kofi Yesu and is sourced from this repo's data modules, filled from
the https://github.com/c0de-break3r/c0de-break3r profile README where gaps exist.

## Decisions (confirmed with owner)

1. Deploy target: existing `kofiyesu` Vercel project → kofiyesu.vercel.app.
   (aarav-sharma-liart.vercel.app is third-party and cannot be deployed into.)
2. Fidelity: same structure & feel — not a pixel replica.
3. Content: existing `src/data/*` is the source of truth; special-repo README fills gaps.
4. Approach: rebuild in this repo; keep stack; no template adoption; no stack change.

## Non-goals

- No blog section (no blog content exists).
- No 3D hero, no new backend, no CMS, no auth (site stays frontend-only).
- No copying of the reference site's code chunks, CSS files, images, or fonts.
- No changes to `vercel.json` (rewrites + security headers remain as-is).

## Phase 1 — REA reverse-engineering (reference extraction)

1. Mirror `https://aarav-sharma-liart.vercel.app` with wget (robots-respecting,
   span `/_next` chunk + CSS + font + image hosts) into
   `Portfolio/Freelancing/aarav-liart-mirror/` (kept outside this repository).
2. Run the fork CLI:
   `rea analyze-javascript-application aarav-liart-mirror --json`
3. Extract and record findings in a summary MD (`aarav-liart-rea-analysis-summary.md`,
   same folder): section order, palette tokens (CSS custom properties), typography
   families and weights, animation library + reveal patterns, card/image treatment,
   spacing rhythm.
4. Store nothing ripped: fonts come from `@fontsource` (Space Grotesk, JetBrains Mono);
   icon grid uses simple-icons/devicon CDNs only where CSP permits, otherwise
   locally committed SVGs.

## Phase 2 — Information architecture

### New `/` (one-page scroll, anchor nav)

| # | Section | Content source |
| --- | --- | --- |
| 1 | Hero — tagline "Build with purpose. Automate with intent. Secure by design.", name, role, portrait, CTAs (email, GitHub), socials row | `profile.ts` + special repo |
| 2 | Professional Experience — 3 most recent roles with dates + one-liners | `experience.ts` |
| 3 | Proof of Work — 4–6 featured project cards (cover, blurb, tags, link) | `projects.ts` |
| 4 | Currently Building — focus areas: Software Engineering · AI & Automation · Cybersecurity · SaaS | special repo |
| 5 | GitHub Contributions — stat + streak cards as **locally committed images** (keeps CSP `img-src 'self'` intact; regenerate manually when wanted) | special repo stat URLs, downloaded once |
| 6 | Stack I Use — icon grid from `profile.technologies` (reuse `TechStackCard`) | `profile.ts` |
| 7 | Selected Engineering Work — 3 deep-dive rows linking to `/project/:slug` | `projects.ts` |
| 8 | Let's connect — footer cards (GitHub, email), copyright, credit line "Template by Wensity UI" | profile + attribution (honesty) |

### Sub-pages (kept, restyled to the new theme; data unchanged)

- `/projects` (filterable list), `/project/:slug` (case studies),
  `/experience` (timeline), `/about` (bio, portrait, expertise, links).
- The home page's section links anchor-scroll on `/` and also keep deep links
  to the matching sub-pages.

## Phase 3 — Design system (single source)

- Tokens defined once in `src/index.css` as Tailwind v4 `@theme` variables:
  - `--background: #0A0A0B` (near-black), surfaces `#111113`/`#17171A`
  - accent `#00E5FF` cyan (profile accent); secondary `#FF44CD` used sparingly
  - text scale zinc-100 → zinc-500; borders `rgba(255,255,255,.08)`
  - display font: **Space Grotesk**; mono labels: **JetBrains Mono** (eyebrow
    "01 — Experience" style section headers)
- Motion: `framer-motion` (new dependency) — scroll-reveal (`whileInView`),
  magnetic hover on CTAs, gentle image parallax. Respect `prefers-reduced-motion`.
- Layout rhythm: max-w ~1100px column, generous vertical padding, subtle grid/noise background.

## Phase 4 — Data additions (typed, additive)

- `profile.ts`: `tagline`, `currentlyBuilding[]` (name, description, url) where applicable,
  `socials[]`.
- `projects.ts`: ensure `cover`/`featured` fields exist (neutral gradient covers
  generated in CSS where no real asset exists — no third-party images).
- `experience.ts`: unchanged (top-3 slice for home).

## Phase 5 — Verification & deploy

1. `npm run typecheck` (tsc -b) — zero errors.
2. `npm run build` → `dist/` — success.
3. `npm run dev` visual pass: every home section present, anchors scroll,
   links work, reduced-motion honored, dark theme consistent across sub-pages.
4. Optional sanity: run the fork's analyzer on `dist/` to confirm no parse errors.
5. Deploy: `vercel deploy --prod` (runs owner-approved; existing `vercel.json`
   rewrites + CSP headers preserved).
6. Post-deploy: HTTP 200 + section spot-check via curl; owner visually reviews.

## Risks / notes

- Contribution cards go stale (static images) — acceptable; regeneration is a
  scripted download, not a runtime dependency.
- CSP forbids remote forms — contact remains mailto/link-based (as today).
- Wensity UI attribution retained in footer out of honesty, not license proof.
- The Turo rule applies here: this reference mirror is for study only.
