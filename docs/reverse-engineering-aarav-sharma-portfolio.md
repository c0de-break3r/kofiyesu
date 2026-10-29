# Reverse engineering: https://aarav-sharma-liart.vercel.app/ (for kofiyesu)

Analysis date: 2026-10-29 (live capture via REA: passive CDP inspection + controlled browser scenarios + static bundle analysis, no code execution).

## Identity note

The "Aarav Sharma" site is a **rebranded instance of Parth's portfolio template**
(GitHub `ksparth12`, personal site `parthh.in`, founder of Wensity).
Evidence: avatar asset is literally named `avatars/parth-founder-wensity.webp`,
every headline link points at `parthh.in` / `ui.wensity.com` / `rune.codes`, and
the maintenance prompt labels it "Template by Wensity UI".
robots meta is `noindex, follow` — consistent with a template demo deployment.

## Stack (observed, evidence-bound)

| Layer | Finding | Evidence |
|---|---|---|
| Framework | Next.js App Router, **Turbopack production builds** (`turbopack-*.js` runtime chunk, `?dpl=dpl_…` cache-busting on all assets), version string `16.2.9` in turbopack runtime (bundle), RSC flight data inline (`self.__next_f.push`) | `analyze_web_bundle` ev_64cfdd… fingerprint "Next.js (high, next-runtime)" in 8 chunks; `route: /_next/image` (Next Image optimizer present but not using remote domains) |
| React runtime | React 19-style RSC/dehydration; two **React error #418 hydration text mismatches** fired on load (server/client text differ) | scenario ev_4f94d8… page-errors ×2, repeated each load |
| Styling | **Tailwind 4** utility classes incl. arbitrary values (`[box-shadow:0_4px_10px_-4…]`, `bg-white/80`, font tokens like `var(--font-satoshi)`), single hashed CSS chunk | DOM capture `3abf53ae…`; carry-over classes |
| Animation | **framer-motion** (framerAppearId data attribute, SwitchLayoutGroupContext, projection/layout/drag internals) in its own 143 KB chunk | bundle grep `framer` in `source-12-53e6…js` |
| UI primitives | **Radix UI + shadcn-style components** (`data-slot`, `data-state="closed"`, tooltip/floating positioning code, 21 `radix-` hits), **lucide** icons | bundle grep in `source-1` (main 326 KB chunk) |
| Theme | **next-themes**: `<html class="light">` ↔ `class="dark"`, `color-scheme` style, localStorage key **`theme`**, system fallback, classStrategy | scenario ev_5500d6… (toggle → dark + storage capture), next-themes code signature in bundle |
| Theme bridge | `ThemeBridge` listens for postMessage `{type:"WENSITY_COLOR_SCHEME", value:"light"\|"dark"}` from the embedded promo iframe and applies it by writing to localStorage `theme` + re-dispatching a `StorageEvent` | bundle source-11 context |
| Fonts | **Cabinet Grotesk** (Regular/Medium/Bold/Extrabold, static woff2) + **Satoshi Variable** (+VariableItalic) — Fontshare fonts via next/font/local, `<link rel=preload>` from RSC | flight payload in `source-16` |
| Analytics | **@vercel/analytics** (`data-sdkn="@vercel/analytics/next" data-sdkv="2.0.1"`) self-deployed under `/af6166fe7419b85d/` with `/view`, `/event`, `/session` endpoints; script checks `navigator.webdriver \|\| UA.includes("Headless")` and bails → bots are dropped at the door | script.js export `050e35bf…`, bundle |
| Contributions | **react-github-calendar** (exact internals: `github-contributions-api.jogruber.de/v4/{user}?y=last`, forwardRef, labels/transformData/transformTotalCount/throwOnError) fetching client-side for `@ksparth12` | bundle source-1 context + scenario network ev_… 200 fetch |
| Cat cursor | oneko-style cat: custom component renders a 32×32 fixed div, `imageRendering:pixelated`, `backgroundImage:url(/oneko.gif)`, tracked via `mousemove` + rAF throttle, `zIndex:0x7fffffff`, `aria-hidden` | bundle source-1 oneko context |
| Metadata | Full set: title, description, application-name, author, keywords, creator, publisher, robots, complete OG + twitter summary_large_image; og image = night banner 1815×867; `MetadataBoundary`/`ViewportBoundary` components | flight payload in `source-14`/`source-13` |
| Others | `Analytics` wrapper, `ScrollToTop` client component, `PortfolioCustomizationProvider` ( Customize drawer ) | flight payload in `source-10` |

## Page anatomy (single scrolling page, hero-anchored card)

Captured DOM `3abf53ae…` (light & dark) + screenshot `76e19af…`:

1. **Hero card** — mountain banner (day/dark swaps to night photo) with an
   italic banner quote ("Build the systems, polish the details, and make the
   product feel inevitable."), overlapping circular avatar in front:
   `parth-founder-wensity.webp`, h1 name, subtitle `21 • Founder of Rune & Wensity`,
   a short bio with bolded lead sentence and inline links, 4 circular icon
   buttons (Call, GitHub, LinkedIn, theme toggle) + "Template by Wensity UI"
   pill behind them.
2. **Professional Experience** — h2 + cards with h3 links (Intel Corporation
   with `/icons/intel.svg`).
3. **Proof of Work** — 6 project cards, each pairing
   `images/project-images/{rune,old-portfolio,wensity-ui,new-portfolio,runehub,runecareer}.png`
   with a matching `images/backgrounds/project-bg-*-waves.webp` card artwork.
4. **Blogs** — 3 article entries cross-linked to `parthh.in` and
   `rune.codes/hub/tech-trends/…` posts.
5. **Currently Building** — Wensity + Rune h4 cards with logos.
6. **GitHub Contributions ● @ksparth12** — the react-github-calendar block.
7. **Stack I use** — grid of `/tech-icons/*.svg` items defined as a data
   array (`{name, category: "framework"|"database"|…, icon, color:"bg-gray-500"}`)
   — across JS/TS/Java/Python/SQL/React/Next/Express/Node/FastAPI/Tailwind/
   MongoDB/PostgreSQL/Redis/Git/Docker/Azure/… including OSes like Nix OS.
8. **Selected Engineering Work ● {live date}** — dated h2 highlighting Rune /
   RuneHub / RuneLearn.
9. **Let's connect** — mailto `hello@parthh.in`, book-call link, GitHub,
   LinkedIn, and a final "Build faster with Wensity UI" promo card.
10. **Footer** — `© {currentYear} {name}. Template by Wensity` (currentYear via
    `new Date().getFullYear()`).

## Interactive behaviors verified by scenarios

- **Theme toggle**: click → `class` light↔dark, `color-scheme` swap, banner
  artwork switches (banner-day ↔ banner-night), localStorage `theme` persisted.
  Dark mode is full neutrals-black with a diagonal pinstripe page texture
  (visible in dark screenshot `f0113a6f…`).
- **Customize**: opens a right-side drawer with inputs for **Name / Age / Title
  / Banner quote** backed by `PortfolioCustomizationProvider` React context
  (merge of defaults + initial values, functional updater). Nothing spilled to
  sessionStorage (empty after edit) — in-memory. Classic template-preview
  gimmick (visitors can live-edit the identity fields).
- **ScrollToTop** client component (name surfaced by flight data).
- **Wensity theme broadcast**: embedded promo panel can steer the page's dark
  mode via `postMessage` + storage event replay (cross-iframe template UX).

## Bugs observed (useful cautions)

- React **#418 hydration mismatch twice on every load**; visible symptom in the
  light screenshot: the hero bio sentence renders a duplicated
  "…without losing technical quality or visual product polish." — server data
  contains a stray copied sentence fragment.
- Compressed total JS ≈ 1.5 MB across 19 scripts for one page; several 300 KB
  chunks load eagerly on the landing view.

## Transferable ideas for kofiyesu (React 19 + Vite + Tailwind 4 + framer-motion)

1. **Hero-quality bar**: banner image with an overlaid italic quote + circular
   avatar breaking the card edge + one-line bio with bolded hook. Cheap to
   build in Tailwind, high visual payoff (screenshots in /tmp/opencode/).
2. **next-themes pattern without Next**: the theme contract is just
   `<html class="dark">` + `color-scheme` + localStorage key; kofiyesu can copy
   it with a 30-line hook; keep the pre-hydration inline script to avoid theme
   flash (this site ships one in `<head>`).
3. **oneko cat cursor**: 32px pixelated gif + rAF-throttled cursor tracking,
   `aria-hidden="true"`, `pointer-events:none`, `image-rendering:pixelated`.
   Include `prefers-reduced-motion` respect (kofiyesu already ships framer-motion
   — the same guard).
4. **react-github-calendar** — not React-19-verified; verify locally or wrap in
   an error boundary with a skeleton fallback (their code throws when the API
   fails: `throwOnError` off by default avoids UI breakage).
5. **Tech-stack data model**: single array `{name, category, icon, color}`
   rendered as an icon grid; mirrors kofiyesu's local `/tech-icons` assets and
   keeps sections data-driven.
6. **Live-dated section headers** ("Selected Engineering Work ● October 29,
   2026") give the page a fresher feel; the target's hydration mismatch shows
   why this deserves `suppressHydrationWarning` or client-only rendering.
   For kofiyesu (Vite SPA) there's no SSR anyway — just render client-side.
7. **Analytics**: @vercel/analytics + a bot check that bails in Headless/webdriver.
   kofiyesu currently ships Sentry; Vercel Analytics is one `<Analytics />`
   script-equivalent away on Vercel.
8. **ScrollToTop** affordance is worth adding (name + smooth-scroll top).
9. **SEO completeness**: title/description/OG/twitter with a proper banner
   image at 1815×867 — kofiyesu's PWA manifest should pair with the same OG
   target size for a coherent preview card.

## Evidence ledger

- Live page target: ev_29da1e75… list_browser_targets
- Load+settle scenario (DOM/accessibility/screenshot, no JS bodies):
  ev_4f94d8e6… (224 events, 2 React #418 page-errors)
- Customize click scenario: ev_ef587c1b… (drawer inputs captured)
- Theme toggle scenario: ev_5500d63a… (dark class + localStorage `theme`)
- Static bundle analysis (19/19 scripts parsed, 407823 AST nodes, Next+React
  fingerprints, no source maps in production): ev_64cfdd45… and recheck
  ev_2728fc3c…
- Script export w/ manifest (digest-verified): ev_7f863e2b…,
  manifest sha 7b545953… at /tmp/opencode/aarav-scripts/manifest.json
- Passive inspect w/ script sources: ev_7f41fa6e…

Unknowns / limitations: production bundle is minified with no source maps
(`fetch_source_maps` returned none); module-internal package versions beyond
React/motion/next-themes formations are inferred from signatures, not pinned
manifests; server-side Next file structure is not directly observable; the
`16.2.9` string is found in the Turbopack runtime chunk (framework version is
a bounded inference).
