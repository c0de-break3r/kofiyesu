# Design: Hero rebuild, persisted theme toggle, entrance animations, oneko cat

Date: 2026-10-29 · Status: approved (design conversation)
Source inspiration: reverse-engineering findings for
`https://aarav-sharma-liart.vercel.app/` (see
`docs/reverse-engineering-aarav-sharma-portfolio.md`). Original art is drawn in
code (inline SVG) — no third-party assets.

## Goals

1. Same **theme-toggle mechanics** as the target: persisted light/dark choice,
   system-preference default, no first-paint flash, `theme-color` meta sync.
2. Same **hero composition** as the target: banner image card with overlaid
   quote, circular avatar overlapping the banner edge, name + `role • location`
   subtitle line, hook-bio, circular icon row (GitHub · Email · theme).
3. **Theme-swapped imagery** ("image"): AI/tech abstract banner that re-colors
   per theme with light and dark colorways.
4. Target-style **animation**: staggered hero entrance, section reveals,
   hover lifts, smooth theme crossfade. All respect `prefers-reduced-motion`.
5. **oneko-style cat cursor easter egg** as an original pixel-art cat
   (ownable, no licensing risk).

Non-goals: next-themes dependency, html-class strategy refactor, route
transitions, floating scroll-to-top button, live-dated section headers,
Header nav changes.

## 1. Theme system

- `index.html`: inline script before any module script.
  - Read `localStorage["theme"]`; else `matchMedia("(prefers-color-scheme: dark)")`
    (default dark when unknown — brand default).
  - Set `document.documentElement.dataset.theme` and update
    `<meta name="theme-color">` content before first paint.
- `src/hooks/useTheme.ts`:
  - Initial `useState` reads `documentElement.dataset.theme` (set by init
    script), keeps existing hook API (`theme`, `setTheme`, `toggle`).
  - Side effect: writes `data-theme` on `<html>`, persists `localStorage["theme"]`
    (`"light" | "dark"`), and syncs `<meta name="theme-color">`
    (dark `#0a0a0b`, light `#f6f7f8`).
  - While toggling, applies a transient `theming` class on `<html>` for
    ~300ms so token colors crossfade (then removes it).
- `src/index.css`:
  - New `[data-theme="light"]` token block:
    `--bg: #f6f7f8`, `--surface: #ffffff`, `--surface-muted: #eef0f2`,
    `--text: #131316`, `--text-muted: #565b62`,
    `--border: rgba(0,0,0,0.08)`, `--border-strong: rgba(0,0,0,0.16)`,
    `--color-accent: #0092a8`, `--color-accent-deep: #00778a`,
    `--color-accent-soft: rgba(0,146,168,0.12)`,
    `--color-secondary` stays magenta-family at a lightmode-adjusted value,
    `color-scheme: light` (all keys mirroring the dark `:root` block).
  - `html.theming, html.theming body` + key components get
    `transition: background-color 300ms ease, color 300ms ease,
    border-color 300ms ease` (deliberately scoped, not universal).
  - Banner colorway vars defined in both themes, next to the tokens (dark on
    `:root`, light on `[data-theme="light"]`): `--banner-bg`, `--banner-fog-1`,
    `--banner-fog-2`, `--banner-node`, `--banner-link`, `--banner-dot`,
    `--banner-scrim`. Dark: deep navy-black field, cyan/magenta nodes. Light:
    pale blue-gray field, darker cyan/ink nodes (detail in §2).

## 2. Hero rebuild (`src/features/home/HeroSection.tsx`)

Card layout (rounded-3xl, bordered, surface background, centered max-w-5xl):

1. **Banner** — `src/components/art/AbstractBanner.tsx`: inline SVG, aspect
   ~2.1:1, generative "AI abstract" composition (node-mesh polyline network,
   drifting particle dots, layered gradient fog). All colors resolve from the
   `--banner-*` vars (§1), so one SVG yields both theme colorways. Overlay
   gradient scrim bottom → banner quote. Autonomous motion: 2–3 node/particle
   groups drift via framer-motion `animate` loops, disabled under
   `useReducedMotion`.
2. **Quote** — italic display text over the banner, from `profile.tagline`
   (existing copy reuse, no new data invented).
3. **Avatar** — circular crop of `src/assets/images/portrait.webp` (full
   portrait, since cutout is for grid composition), absolute, overlapping the
   banner's bottom edge (left-anchored desktop, centered mobile), ring +
   shadow.
4. **Name + subtitle** — `h1` `profile.name`; mono muted line
   `Software Engineer • Accra, Ghana` (first `·`-segment of `profile.title` +
   `profile.location`).
5. **Hook bio** — `profile.introHook` (bold lead sentence) + `profile.intro`
   as supporting sentence. Copy drafted from existing profile content only —
   no invented credentials/results.
6. **Circular icon row** — GitHub (`profile.github`), Email
   (`mailto:profile.email`), `ThemeToggleButton`. Circular 32–36px buttons,
   border + muted icon, hover lift + accent border.
7. Existing **Email me / Proof of work** pill CTAs remain under the bio.
8. **Layout**: mobile stacks (avatar centered); md+ mirrors target proportions.

## 3. Animations

- `src/components/ui/HeroIntro.tsx` — stagger container
  (`staggerChildren`), per-child `y: 10 → 0`, opacity; banner
  `scale: 0.98 → 1`; avatar spring pop. `useReducedMotion` → static render.
- Sections: keep existing `Reveal`; verify every home section uses it,
  add where missing.
- Hovers: circular buttons `translateY(-2px)` + accent border via CSS.
- Theme swap crossfade as in §1.
- No route-level `AnimatePresence` (out of scope).

## 4. Oneko cat (`src/components/Oneko/`)

- `src/components/Oneko/sprite.tsx` — original pixel-cat SVG frames drawn in
  code (shared pixel grid, e.g. 16×16 logical units scaled to 32px):
  6-frame walk cycle (tail, legs, ear), idle sit frame, blink. Cyan collar as
  brand accent. Frames are data, rendered by one SVG component via `frame`
  prop; `image-rendering: pixelated` equivalent via `shape-rendering: crispEdges`.
- `src/components/Oneko/Oneko.tsx` — behavior:
  - Fixed 32px div, `pointer-events: none`, `aria-hidden`, `z-index: 2147483647`.
  - `mousemove` on `window` (passive) stores target; rAF loop steps toward it
    (≤ 24px/frame), flips `scaleX` by direction; frame advances on a 250ms
    cadence while moving.
  - Sits after ~4s without movement; resumes on move.
  - Visibility rules:
    - No fine pointer (`(pointer: fine)` fails) or touch-only device → the
      component renders nothing.
    - `prefers-reduced-motion: reduce` on a desktop-class device → renders a
      static sitting cat resting in the bottom-left corner instead of the
      moving one (no listeners, no loop).
    - Otherwise → active cat as described above.
  - Component-local state only; adds nothing to the main bundle except the
    small component (no external sprite asset).

## 5. Files

| File | Change |
| --- | --- |
| `index.html` | theme init script |
| `src/index.css` | light tokens, `--banner-*` colorways, `.theming` transitions |
| `src/hooks/useTheme.ts` | persistence, meta sync, theming-class crossfade |
| `src/data/profile.ts` | add `introHook` (bold lead sentence; quote stays `profile.tagline`) |
| `src/features/home/HeroSection.tsx` | rebuild per §2 |
| `src/components/ui/HeroIntro.tsx` | new (stagger container for hero entrance, §3) |
| `src/components/art/AbstractBanner.tsx` | new |
| `src/components/Oneko/Oneko.tsx` (+ `sprite.tsx`) | new per §4 |
| `src/components/ThemeToggleButton.tsx` | new (sun/moon crossfade, aria-label switching) |
| `src/App.tsx` | mounts `<Oneko />` |
| Header / MobileNav | unchanged |

## 6. Verification

1. `npm run typecheck` and `npm run build` — clean.
2. Dev server + REA browser scenario: screenshots in light/dark (banner, hero
   composition, cat), toggle persistence across reload, `theme-color` meta
   value per theme, oneko visible on synthetic mouse move, no motion under
   emulated `prefers-reduced-motion`.
3. Manual pass: profile copy stays accurate (only the new `introHook` added),
   no console errors; light-mode visual check across the remaining home
   sections for the token sweep described in the risks below.

## Risks / mitigations

- **Light-mode contrast of existing dark-first components** (prose colors are
  var-driven mostly, but some hard-coded `text-black/…`, `bg-white/…`,
  `rgba(0,0,0,…)` values exist across sections) → during implementation, sweep
  home sections and replace literal colors with tokens where the palette flip
  visibly breaks; keep reach limited to visible defects.
- **SVG-in-JSX vs tree-shaking**: banner/cat frames are small (few KB);
  acceptable inline.
- **Portrait crop**: portrait.webp full-frame circle-crop needs
  `object-position` tuned; fallback to `portrait-cutout.png` if framing fails.
