# Hero Rebuild, Persisted Theme, Animations & Oneko — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the kofiyesu hero in the Aarav-target composition (banner card → overlapping avatar → name/hook → circular icon row), add a persisted light/dark theme system with crossfade, staggered framer-motion entrance animations, and an original pixel-cat cursor easter egg — per `docs/superpowers/specs/2026-10-29-hero-theme-animations-design.md`.

**Architecture:** Token-based theming (`[data-theme="light"]` overrides in `src/index.css`; every component already reads `--bg/--surface/--text/…`, so sections adapt automatically). A module-level theme store behind `useTheme` (via `useSyncExternalStore`) so multiple consumers stay in sync; an inline `index.html` script sets `data-theme` + `theme-color` before first paint (Vite SPA → no SSR mismatch). The banner is one inline-SVG component recolored by `--banner-*` vars, the cat is pixel-grid data rendered by a tiny SVG component.

**Tech Stack:** React 19, TypeScript, Vite 7, Tailwind CSS v4, framer-motion ^14.7.1 (already installed). No new dependencies.

## Global Constraints

- No new npm dependencies; nothing outside the existing stack.
- All artwork is original inline SVG drawn in code — no stock/licensed/third-party assets.
- Theme storage: `localStorage["theme"]`, values only `"light" | "dark"`; recursion-free init; brand default = dark.
- `<meta name="theme-color">`: dark `#0a0a0b`, light `#f6f7f8`.
- Copy derives from existing `src/data/profile.ts` content only; the only new field is `introHook`.
- `src/components/layout/Header.tsx` and `MobileNav.tsx` are NOT modified.
- Every animation honors `prefers-reduced-motion`.
- Testing: the repo has no unit-test runner. Per-task gate is `npm run typecheck` (must exit 0). End-to-end gate is `npm run build` + REA browser scenario (Task 8).
- Deploy: Vercel deploys on push to `main`, so `git push` happens ONLY in Task 8 after verification.
- Pre-flight (already verified 2026-10-29): all seven home sections (`ProofOfWorkSection`, `CurrentlyBuildingSection`, `SelectedWorkSection`, `StackSection`, `ConnectSection`, `ContributionsSection`, `ExperienceSection`) already wrap content in the `Reveal` component — no section animation task needed.

---

### Task 1: Theme tokens, banner colorways & crossfade CSS

**Files:**
- Modify: `src/index.css`
- Modify: `docs/superpowers/specs/2026-10-29-hero-theme-animations-design.md` (one-line §1 amendment, matches how CSS actually implements the scoped crossfade)

**Interfaces:**
- Consumes: `data-theme="light"` attribute on `<html>` (written by Task 2).
- Produces: CSS variables `--bg --surface --surface-muted --text --text-muted --border --border-strong --color-accent --color-accent-deep --color-accent-soft --color-secondary --banner-bg --banner-fog-1 --banner-fog-2 --banner-node --banner-link --banner-dot --banner-scrim --grid-line` in both colorways, and the `html.theming` transient class behavior used by Task 2's `useTheme`.

- [ ] **Step 1: Add light tokens + banner colorways + crossfade to `src/index.css`**

In `@layer base`, immediately after the first `:root { ... }` block (which ends with `--height-header: 4.5rem;` then `}`), insert:

```css
  [data-theme="light"] {
    --bg: #f6f7f8;
    --surface: #ffffff;
    --surface-muted: #eef0f2;
    --text: #131316;
    --text-muted: #565b62;
    --border: rgba(0, 0, 0, 0.08);
    --border-strong: rgba(0, 0, 0, 0.16);
    --color-accent: #0092a8;
    --color-accent-deep: #00778a;
    --color-accent-soft: rgba(0, 146, 168, 0.12);
    --color-secondary: #d21f9b;
    --banner-bg: #e9eef3;
    --banner-fog-1: rgba(0, 146, 168, 0.18);
    --banner-fog-2: rgba(210, 31, 155, 0.12);
    --banner-node: #00778a;
    --banner-link: rgba(0, 119, 138, 0.35);
    --banner-dot: rgba(0, 119, 138, 0.55);
    --banner-scrim: rgba(10, 13, 20, 0.55);
    --grid-line: rgba(19, 19, 22, 0.05);
    color-scheme: light;
  }

  /* Applied only for ~300ms after a theme toggle (Task 2 adds/removes it);
     removed right after, so there is no standing per-element transition cost. */
  html.theming,
  html.theming *,
  html.theming *::before,
  html.theming *::after {
    transition:
      background-color 300ms ease,
      color 300ms ease,
      border-color 300ms ease,
      fill 300ms ease,
      stroke 300ms ease;
  }
```

In the existing `:root` block (dark default), append these vars just before its closing `}`:

```css
    --banner-bg: #0a0d14;
    --banner-fog-1: rgba(0, 229, 255, 0.16);
    --banner-fog-2: rgba(255, 68, 205, 0.12);
    --banner-node: #00e5ff;
    --banner-link: rgba(0, 229, 255, 0.35);
    --banner-dot: rgba(0, 229, 255, 0.7);
    --banner-scrim: rgba(6, 8, 12, 0.62);
    --grid-line: rgba(255, 255, 255, 0.035);
```

Replace the `.bg-grid` rule so the grid lines are tokenized (dark look unchanged):

```css
  .bg-grid {
    background-image: linear-gradient(
        to right,
        var(--grid-line) 1px,
        transparent 1px
      ),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 56px 56px;
  }
```

Keep `html { color-scheme: dark; }` as-is (the light block's `color-scheme: light` wins by specificity: attribute selector `(0,1,0)` > element `(0,0,1)`).

- [ ] **Step 2: Amend the spec's §1 crossfade line to match implementation**

In `docs/superpowers/specs/2026-10-29-hero-theme-animations-design.md`, replace:

```
  - `html.theming, html.theming body` + key components get
    `transition: background-color 300ms ease, color 300ms ease,
    border-color 300ms ease` (deliberately scoped, not universal).
```

with:

```
  - A transient `theming` class on `<html>` for ~300ms applies color
    transitions (`background-color, color, border-color, fill, stroke`) across
    the tree and is removed immediately after, so there is no standing
    per-element transition cost.
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exits 0 (CSS isn't typechecked; this is the per-task smoke gate).

- [ ] **Step 4: Commit**

```bash
git add src/index.css docs/superpowers/specs/2026-10-29-hero-theme-animations-design.md
git commit -m "feat(theme): light palette tokens, banner colorways, toggle crossfade"
```

---

### Task 2: Persisted theme system (no-flash init script + shared store)

**Files:**
- Modify: `index.html` (insert script after the `msapplication-TileColor` meta, line ~56)
- Modify: `src/hooks/useTheme.ts` (full rewrite)

**Interfaces:**
- Consumes: `--theming` CSS class + `[data-theme]` tokens from Task 1.
- Produces: hook API unchanged for consumers: `useTheme() => { theme: "light" | "dark", setTheme(theme), toggle() }` — now shared-state (multiple components see the same value). `theme_color` meta values: dark `#0a0a0b`, light `#f6f7f8`.

- [ ] **Step 1: Add the no-flash init script to `index.html`**

Immediately after the `<meta name="msapplication-TileColor" content="#0a0a0b" />` line, insert:

```html
    <script>
      (function () {
        var theme = "dark";
        try {
          var stored = localStorage.getItem("theme");
          if (stored === "light" || stored === "dark") {
            theme = stored;
          } else if (window.matchMedia) {
            var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            var light = window.matchMedia("(prefers-color-scheme: light)").matches;
            if (light && !dark) theme = "light";
          }
        } catch (e) {
          /* storage blocked — keep brand default */
        }
        document.documentElement.dataset.theme = theme;
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0a0b" : "#f6f7f8");
      })();
    </script>
```

Leave `data-theme="dark"` on the `<html>` tag (it's the no-JS/first-paint default; the script overrides it).

- [ ] **Step 2: Rewrite `src/hooks/useTheme.ts`**

Replace the entire file with:

```ts
import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "theme";
const THEMING_CLASS = "theming";
const CROSSFADE_MS = 300;
const META_COLORS: Record<Theme, string> = {
  dark: "#0a0a0b",
  light: "#f6f7f8",
};

const listeners = new Set<() => void>();
let current: Theme | null = null;
let crossfadeTimer = 0;

function getSnapshot(): Theme {
  if (current === null) {
    current =
      typeof document !== "undefined" && document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark";
  }
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function syncDocument(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", META_COLORS[theme]);
}

/**
 * Persisted theme state shared across every consumer (module-level store so
 * the hero's ThemeToggleButton and any other reader stay in sync). The
 * inline index.html script seeds `data-theme` before first paint; this hook
 * keeps it, localStorage["theme"], and the theme-color meta consistent.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as Theme);

  const setTheme = useCallback((next: Theme) => {
    if (next === getSnapshot()) return;
    current = next;
    syncDocument(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable */
    }
    emit();
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    current = next;
    const docEl = document.documentElement;
    docEl.classList.add(THEMING_CLASS);
    window.clearTimeout(crossfadeTimer);
    crossfadeTimer = window.setTimeout(
      () => docEl.classList.remove(THEMING_CLASS),
      CROSSFADE_MS,
    );
    syncDocument(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable */
    }
    emit();
  }, []);

  return { theme, setTheme, toggle };
}
```

Note: `App.tsx` currently calls `useTheme()` merely to write `data-theme`; that call becomes redundant and is removed in Task 5 when App is edited anyway (the store + init script own the attribute from now on).

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 4: Dev-server smoke test of the init script**

```bash
npm run dev &          # port 3000; leave running or CI-equivalent
sleep 2
curl -s http://localhost:3000 | grep -c 'localStorage.getItem("theme")'
kill %1
```
Expected output: `1` (the inline script is present in the served HTML shell). If the port is busy, expect to see Vite fail and restart on another port — use whichever URL Vite prints.

- [ ] **Step 5: Commit**

```bash
git add index.html src/hooks/useTheme.ts
git commit -m "feat(theme): persisted theme store with no-flash inline init"
```

---

### Task 3: ThemeToggleButton (animated sun/moon)

**Files:**
- Create: `src/components/ThemeToggleButton.tsx`

**Interfaces:**
- Consumes: `useTheme()` from Task 2 (`{ theme, toggle }`).
- Produces: `<ThemeToggleButton />` — circular 36px button matching the hero icon row classes (reused by Task 6); renders nothing else.

- [ ] **Step 1: Create the component**

```tsx
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

const buttonClasses =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]";

/** Animated light/dark switch: sun-moon crossfade, aria-label tracks target. */
export function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={buttonClasses}
    >
      {reduceMotion ? (
        <span key={theme} className="inline-flex">
          {isDark ? <MoonIcon /> : <SunIcon />}
        </span>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: isDark ? 90 : -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: isDark ? -90 : 90, scale: 0.6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="inline-flex"
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/ThemeToggleButton.tsx
git commit -m "feat(theme): animated sun/moon toggle button"
```

---

### Task 4: AbstractBanner (theme-aware inline-SVG art)

**Files:**
- Create: `src/components/art/AbstractBanner.tsx`

**Interfaces:**
- Consumes: `--banner-*` vars from Task 1. `--color-secondary` for the magenta node subset.
- Produces: `<AbstractBanner className="..." />` — SVG with `viewBox="0 0 1050 500"` (~2.1:1), fills from CSS vars so the SVG recolors on theme toggle (the `.theming` transition covers `fill`). Used by Task 6.

Note on `var()` in SVG: presentation attributes (`fill="…"`) don't resolve CSS vars — every var-driven color MUST go through React's `style` prop (React maps `fill`/`stopColor` to CSS properties, where `var()` works).

- [ ] **Step 1: Create the component**

```tsx
import { motion, useReducedMotion } from "framer-motion";

const NODES: Array<[number, number]> = [
  [60, 120], [180, 60], [300, 140], [200, 260], [90, 330], [360, 320],
  [430, 90], [520, 220], [640, 60], [700, 300], [760, 160], [880, 110],
  [930, 260], [1010, 60], [820, 380], [600, 420], [300, 430], [760, 430],
  [140, 470], [480, 440],
];

const LINKS: Array<[number, number]> = [
  [0, 1], [1, 2], [0, 3], [2, 3], [3, 4], [2, 5], [5, 6], [5, 7], [6, 8],
  [7, 9], [8, 10], [9, 10], [10, 11], [11, 12], [11, 13], [9, 14], [14, 15],
  [5, 16], [15, 16], [14, 17], [15, 17], [4, 18], [7, 19], [9, 15], [10, 13],
];

/** Node indexes rendered in the secondary (magenta-family) color. */
const MAGENTA = new Set([3, 9, 14, 17, 4]);

const DOTS: Array<[number, number, number]> = [
  [30, 80, 1.5], [250, 30, 1], [140, 210, 1.2], [340, 200, 1.5], [410, 400, 1],
  [560, 130, 1.2], [610, 250, 1], [680, 200, 1.5], [720, 40, 1], [830, 220, 1.2],
  [900, 340, 1], [980, 180, 1.5], [130, 380, 1], [220, 440, 1.2], [500, 320, 1],
  [660, 380, 1.5], [760, 60, 1], [870, 30, 1.2], [950, 440, 1], [400, 250, 1],
  [690, 340, 1.2], [260, 320, 1.5], [520, 40, 1], [1020, 380, 1],
];

/**
 * "AI abstract" banner: node mesh + gradient fog + particle dots, all recolor
 * per theme via --banner-* vars (dark: navy-black field, cyan/magenta; light:
 * pale blue-gray field, darker cyan/ink). Slow drift via framer-motion,
 * static under prefers-reduced-motion.
 */
export function AbstractBanner({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  const mesh = (
    <g>
      {LINKS.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={NODES[a][0]}
          y1={NODES[a][1]}
          x2={NODES[b][0]}
          y2={NODES[b][1]}
          strokeWidth={1.5}
          style={{ stroke: "var(--banner-link)" }}
        />
      ))}
      {NODES.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={6} style={{ fill: "var(--banner-node)" }} opacity={0.22} />
          <circle
            cx={x}
            cy={y}
            r={3.2}
            style={{ fill: MAGENTA.has(i) ? "var(--color-secondary)" : "var(--banner-node)" }}
          />
        </g>
      ))}
    </g>
  );

  const particles = (
    <g>
      {DOTS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} style={{ fill: "var(--banner-dot)" }} />
      ))}
    </g>
  );

  return (
    <svg
      viewBox="0 0 1050 500"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Abstract neural-network artwork"
      focusable="false"
      className={className}
    >
      <defs>
        <radialGradient id="kofi-fog-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--banner-fog-1)", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "var(--banner-fog-1)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id="kofi-fog-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--banner-fog-2)", stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: "var(--banner-fog-2)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <rect width="1050" height="500" style={{ fill: "var(--banner-bg)" }} />
      <circle cx="200" cy="150" r="260" fill="url(#kofi-fog-a)" />
      <circle cx="800" cy="330" r="300" fill="url(#kofi-fog-b)" />
      <circle cx="540" cy="80" r="180" fill="url(#kofi-fog-a)" />

      <motion.g
        animate={reduceMotion ? { x: 0, y: 0 } : { x: [0, 14, 0], y: [0, -8, 0] }}
        transition={reduceMotion ? undefined : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        {mesh}
      </motion.g>
      <motion.g
        animate={reduceMotion ? { x: 0, y: 0 } : { x: [0, -10, 0], y: [0, 12, 0] }}
        transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        {particles}
      </motion.g>
    </svg>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/art/AbstractBanner.tsx
git commit -m "feat(home): theme-aware abstract AI banner (inline SVG)"
```

---

### Task 5: Oneko pixel-cat easter egg

**Files:**
- Create: `src/components/Oneko/sprite.tsx`
- Create: `src/components/Oneko/Oneko.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `<Oneko />` mounted in `App.tsx`; `OnekoSprite({ rows })` with `WALK_FRAMES: string[][]` (6), `SIT: string[]`, `SIT_BLINK: string[]`. Also removes the now-redundant `useTheme()` call from App (Task 2's init script owns the attribute).

Pixel-grid char palette: `.` transparent, `K` ink `#131316`, `W` body `#f4f4f5`, `S` shade `#9ba0a6`, `A` collar `#00b8d4`. Grids are 16×16 (rendered at 32px → crisp 2px pixels). Cat faces RIGHT; walking left flips with `scaleX(-1)`.

- [ ] **Step 1: Create `src/components/Oneko/sprite.tsx`**

```tsx
const PALETTE: Record<string, string> = {
  K: "#131316",
  W: "#f4f4f5",
  S: "#9ba0a6",
  A: "#00b8d4",
};

/** Overlay layers left-to-right; later layers win where not "." */
function compose(...layers: string[][]): string[] {
  const [base, ...rest] = layers;
  return base.map((row, y) => {
    let acc = row;
    for (const layer of rest) {
      const layerRow = layer[y];
      if (!layerRow) continue;
      let next = "";
      for (let x = 0; x < 16; x++) {
        const c = layerRow[x];
        next += c && c !== "." ? c : (acc[x] ?? ".");
      }
      acc = next;
    }
    return acc;
  });
}

/* Body: head + ears + torso + collar, no tail/legs. Faces right. */
const BODY = [
  "..........K..K..",
  "..........KK.KK.",
  ".........KKKKKKK",
  ".........KWWWWWK",
  ".........KWKWWKK",
  ".........KWWWWWK",
  "..KKKKKKKKKKKKKK",
  "..KWWWWWWWAA....",
  "..KWWWWWWWWK....",
  "..KSSWWWWWWK....",
  "..KKKKKKKKKK....",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const TAIL_UP = [
  "................",
  "................",
  "................",
  "................",
  "................",
  ".K..............",
  "K...............",
  "K...............",
  ".K..............",
  ".K..............",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const TAIL_DOWN = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  ".K..............",
  ".K..............",
  "KK..............",
  "................",
  "................",
  "................",
  "................",
];

const LEGS_STAND = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "....K....K......",
  "....K....K......",
  "...K......K.....",
  "................",
  "................",
];

const LEGS_A = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "...K......K.....",
  "..K.......K.....",
  ".K.........K....",
  "................",
  "................",
];

const LEGS_B = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "....K....K......",
  ".....K..K.......",
  "......K.K.......",
  "................",
  "................",
];

/* Sitting pose: upright cat, tail wrapped along the ground. */
const SIT_BODY = [
  "..........K..K..",
  "..........KK.KK.",
  ".........KKKKKKK",
  ".........KWWWWWK",
  ".........KWKWWKK",
  ".........KWWWWWK",
  "..KKKKKKKKKKKKKK",
  "....KKKKKAAWWK..",
  "...KWWWWWWKW....",
  "...KWWWWWWKW....",
  "...KWWWWWWKW....",
  "...KKKKKKKKKK...",
  ".KKKKKKKK.KKK...",
  "...........KKK..",
  "................",
  "................",
];

const EYES_CLOSED = [
  "................",
  "................",
  "................",
  "................",
  "...........S..S.",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

/** 6-frame walk cycle: tail up/down halves × stand/A/B strides. */
export const WALK_FRAMES: string[][] = [
  compose(BODY, TAIL_UP, LEGS_STAND),
  compose(BODY, TAIL_UP, LEGS_A),
  compose(BODY, TAIL_UP, LEGS_B),
  compose(BODY, TAIL_DOWN, LEGS_STAND),
  compose(BODY, TAIL_DOWN, LEGS_A),
  compose(BODY, TAIL_DOWN, LEGS_B),
];

export const SIT: string[] = SIT_BODY;
export const SIT_BLINK: string[] = compose(SIT_BODY, EYES_CLOSED);

/** Renders one 16×16 char-grid frame as crisp 1×1 rects. */
export function OnekoSprite({ rows }: { rows: string[] }) {
  const cells: Array<{ x: number; y: number; fill: string }> = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < 16; x++) {
      const fill = PALETTE[row[x]];
      if (fill) cells.push({ x, y, fill });
    }
  });
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      style={{ shapeRendering: "crispEdges" }}
      aria-hidden="true"
    >
      {cells.map((c) => (
        <rect key={`${c.x}:${c.y}`} x={c.x} y={c.y} width={1} height={1} fill={c.fill} />
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Create `src/components/Oneko/Oneko.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { OnekoSprite, SIT, SIT_BLINK, WALK_FRAMES } from "./sprite";

type Mode = "active" | "static" | "off";
type Pose = "walk" | "sit";

const WALK_MS = 250; // sprite frame cadence while moving
const SIT_AFTER_MS = 4000; // sit after ~4s idle
const STEP_PX = 12; // max cursor-chase step per frame

function detectMode(): Mode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "off";
  if (!window.matchMedia("(pointer: fine)").matches) return "off";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "static" : "active";
}

/**
 * Original pixel-cat cursor companion. Behaves like the target's oneko:
 * walks the cursor at topmost z-index, hides on touch devices, and rests as
 * a static sitter when prefers-reduced-motion is on.
 */
export function Oneko() {
  const [mode, setMode] = useState<Mode>(detectMode);
  const [pose, setPose] = useState<Pose>("sit");
  const [dir, setDir] = useState<1 | -1>(1);
  const [frame, setFrame] = useState(0);
  const [blink, setBlink] = useState(false);

  const dirRef = useRef<1 | -1>(1);
  const poseRef = useRef<Pose>("sit");
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "off") return;
    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(pointer: fine)"),
    ];
    const recheck = () => setMode(detectMode());
    queries.forEach((q) => q.addEventListener("change", recheck));
    return () => queries.forEach((q) => q.removeEventListener("change", recheck));
  }, [mode]);

  useEffect(() => {
    if (mode !== "active") return;
    const el = elRef.current;
    if (!el) return;

    const start = { x: window.innerWidth / 2, y: window.innerHeight - 48 };
    let { x, y } = start;
    const target = { ...start };
    let lastMove = performance.now();
    let lastFrame = 0;
    let raf = 0;

    const place = () => {
      el.style.transform = `translate3d(${x - 16}px, ${y - 24}px, 0)`;
    };
    place();

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      lastMove = performance.now();
      if (poseRef.current !== "walk") {
        poseRef.current = "walk";
        setPose("walk");
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dx = target.x - x;
      const dy = target.y - y;
      const dist = Math.hypot(dx, dy);
      const idle = now - lastMove;

      if (dist > 2 && idle < SIT_AFTER_MS) {
        const s = Math.min(STEP_PX, dist);
        x += (dist > 0 ? (dx / dist) * s : 0);
        y += (dist > 0 ? (dy / dist) * s : 0);
        place();
        const nextDir: 1 | -1 = dx < -2 ? -1 : dx > 2 ? 1 : dirRef.current;
        if (nextDir !== dirRef.current) {
          dirRef.current = nextDir;
          setDir(nextDir);
        }
        if (now - lastFrame >= WALK_MS) {
          lastFrame = now;
          setFrame((f) => (f + 1) % WALK_FRAMES.length);
        }
        if (poseRef.current !== "walk") {
          poseRef.current = "walk";
          setPose("walk");
        }
      } else if (poseRef.current === "walk" && (dist <= 2 || idle >= SIT_AFTER_MS)) {
        poseRef.current = "sit";
        setPose("sit");
        setFrame((f) => (f + 1) % WALK_FRAMES.length); // warm next departure
      }
    };
    raf = requestAnimationFrame(step);

    const blinkLoop = window.setInterval(() => {
      if (poseRef.current !== "sit") return;
      setBlink(true);
      window.setTimeout(() => setBlink(false), 180);
    }, 3800);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.clearInterval(blinkLoop);
    };
  }, [mode]);

  if (mode === "off") return null;

  if (mode === "static") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-3 left-3 z-[2147483647] h-8 w-8 select-none"
      >
        <OnekoSprite rows={SIT} />
      </div>
    );
  }

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[2147483647] h-8 w-8 select-none"
    >
      <div className="h-full w-full" style={{ transform: `scaleX(${dir})` }}>
        {pose === "walk" ? (
          <OnekoSprite rows={WALK_FRAMES[frame % WALK_FRAMES.length]} />
        ) : (
          <OnekoSprite rows={blink ? SIT_BLINK : SIT} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Mount it in `src/App.tsx` (and drop the redundant `useTheme()` call)**

Add import next to the other component imports:

```tsx
import { Oneko } from "@/components/Oneko/Oneko";
```

Delete these two lines (the init script + store own the attribute now):

```tsx
import { useTheme } from "@/hooks/useTheme";
```
and inside `App()`, the call `  useTheme();`

Mount the cat after `<MobileNav />`:

```tsx
      <MobileNav />
      <Oneko />
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/Oneko/sprite.tsx src/components/Oneko/Oneko.tsx src/App.tsx
git commit -m "feat(easter-egg): oneko pixel-cat cursor companion"
```

---

### Task 6: Hero rebuild (profile hook, HeroIntro stagger, target composition)

**Files:**
- Modify: `src/data/profile.ts` (add `introHook`)
- Create: `src/components/ui/HeroIntro.tsx`
- Modify: `src/features/home/HeroSection.tsx` (full rewrite)
- Modify: `src/index.css` (delete the now-unused `.hero-portfolio-dot` rules)

**Interfaces:**
- Consumes: `<AbstractBanner />` (Task 4), `<ThemeToggleButton />` (Task 3, same circular classes), `profile` data.
- Produces: rebuilt `HeroSection` (`<HeroIntro>` + variants `heroIntroItem`, `heroIntroBanner`, `heroIntroAvatar` exported from `HeroIntro.tsx`); `profile.introHook: string`.

- [ ] **Step 1: Add `introHook` to `src/data/profile.ts`**

Insert directly after the `title` field (line ~11):

```ts
  /** Bold lead sentence for the hero hook; supporting line is `intro`. */
  introHook:
    "From idea to shipped product — full-stack web apps, AI-driven features, and secure engineering.",
```

(Copy is derived from existing bio/expertise content — nothing invented.)

- [ ] **Step 2: Create `src/components/ui/HeroIntro.tsx`**

```tsx
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const heroIntroItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.6, 0.35, 1] } },
};

export const heroIntroBanner: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: [0.21, 0.6, 0.35, 1] } },
};

export const heroIntroAvatar: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.15 },
  },
};

/** Hero entrance container: staggered children, static under reduced motion. */
export function HeroIntro({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Rewrite `src/features/home/HeroSection.tsx`**

Replace the entire file with:

```tsx
import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import portraitImage from "@/assets/images/portrait.webp";
import { AbstractBanner } from "@/components/art/AbstractBanner";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import {
  HeroIntro,
  heroIntroAvatar,
  heroIntroBanner,
  heroIntroItem,
} from "@/components/ui/HeroIntro";

const iconButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]";

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

/** "Software Engineer · AI & Automation · Cybersecurity" → "Software Engineer" */
function firstTitleSegment(title: string): string {
  return title.split("·")[0]?.trim() || title;
}

/** Target-style hero card: banner+quote, overlapping avatar, hook, icon row. */
export function HeroSection() {
  const role = firstTitleSegment(profile.title);

  return (
    <section className="relative isolate flex w-full items-center justify-center overflow-hidden px-4 pb-24 pt-10 md:min-h-[calc(100dvh-var(--height-header))] md:pb-28 md:pt-16">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--color-accent)_10%,transparent),transparent_70%)]"
      />

      <HeroIntro className="w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--text)_35%,transparent)]">
        <motion.div variants={heroIntroBanner}>
          <div className="relative">
            <AbstractBanner className="block h-auto w-full" />

            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--banner-scrim)_50%,transparent)] to-[var(--banner-scrim)]"
            />
            <p className="absolute right-5 bottom-7 left-5 font-mono text-xs tracking-wide text-white/90 italic md:bottom-8 md:left-8 md:text-base">
              “{profile.tagline}”
            </p>

            <motion.div variants={heroIntroAvatar} className="absolute bottom-0 left-6 md:left-10">
              <img
                src={portraitImage}
                alt={`Portrait of ${profile.name}`}
                width={512}
                height={512}
                loading="eager"
                decoding="async"
                className="h-24 w-24 translate-y-1/2 rounded-full border-4 border-[var(--surface)] object-cover object-[center_20%] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] md:h-28 md:w-28"
              />
            </motion.div>
          </div>
        </motion.div>

        <div className="flex flex-col items-center gap-5 px-6 pt-16 pb-8 text-center md:items-start md:px-10 md:pb-10 md:text-left">
          <motion.div
            variants={heroIntroItem}
            className="flex flex-col items-center gap-2 md:items-start"
          >
            <h1 className="text-balance text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl">
              {profile.name}
            </h1>
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--text-muted)] uppercase">
              {role} • {profile.location}
            </p>
          </motion.div>

          <motion.p
            variants={heroIntroItem}
            className="max-w-2xl text-base font-bold text-[var(--text)]"
          >
            {profile.introHook}
          </motion.p>

          <motion.p
            variants={heroIntroItem}
            className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]"
          >
            {profile.intro}
          </motion.p>

          <motion.div
            variants={heroIntroItem}
            className="flex items-center gap-3"
            aria-label="Social and theme controls"
          >
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
              className={iconButton}
            >
              <GitHubIcon />
            </a>
            <a href={`mailto:${profile.email}`} aria-label="Email" className={iconButton}>
              <MailIcon />
            </a>
            <ThemeToggleButton />
          </motion.div>

          <motion.div
            variants={heroIntroItem}
            className="mt-1 flex flex-wrap justify-center gap-3 md:justify-start"
          >
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-[var(--bg)] transition hover:bg-[var(--color-accent-deep)]"
            >
              Email me
            </a>
            <a
              href="#work"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-6 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Proof of work
            </a>
          </motion.div>
        </div>
      </HeroIntro>
    </section>
  );
}
```

- [ ] **Step 4: Delete the unused dot animation from `src/index.css`**

The rebuilt hero no longer uses `.hero-portfolio-dot`. Remove from `@layer base`:

```css
  .hero-portfolio-dot {
    display: inline-block;
    width: 0.45em;
    height: 0.45em;
    border-radius: 50%;
    background: var(--color-accent);
    animation: hero-portfolio-dot-pulse 2.4s ease-in-out infinite;
  }

  @keyframes hero-portfolio-dot-pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
```

and inside the existing `@media (prefers-reduced-motion: reduce)` block, remove:

```css
    .hero-portfolio-dot {
      animation: none;
      opacity: 1;
    }
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: exits 0. If `portrait.webp`'s import differs in width/height typing, keep the literal `width={512} height={512}` (Vite serves webp without dimension types — these attrs are plain numbers, no type conflict).

- [ ] **Step 6: Commit**

```bash
git add src/data/profile.ts src/components/ui/HeroIntro.tsx src/features/home/HeroSection.tsx src/index.css
git commit -m "feat(home): rebuild hero in target composition with staggered entrance"
```

---

### Task 7: Light-mode color sweep

**Files:**
- Modify: `src/components/ui/Button.tsx:11-13` (glass variant hover)
- Modify: `src/components/pwa/PwaInstallPrompt.tsx:18,52,70` (white-alpha bands)

Pre-verified sweep results (2026-10-29): hardcoded colors elsewhere are black-alpha shadows (`ProjectCard.tsx:17`, `MobileNav.tsx:60`) which work in both themes; `glass-surface` is referenced but never defined in `index.css` (dead class — leave the class name, it's harmless, fixing it is out of scope).

- [ ] **Step 1: Fix `Button.tsx` glass hover**

In `variantClass.glass`, replace:

```ts
  glass:
    "glass-surface text-[var(--text)] transition hover:bg-white/50 hover:border-white/70",
```

with (text-mix keeps the dark look ≈ near-white alpha ≈ original, and flips to ink-alpha on light):

```ts
  glass:
    "glass-surface text-[var(--text)] transition hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:border-[color-mix(in_srgb,var(--text)_40%,transparent)]",
```

(Accepted small dark-mode delta: hover border drops from 70% white to ~40% white-band)

- [ ] **Step 2: Fix `PwaInstallPrompt.tsx`**

Line 18 — replace `border-white/60`:

```tsx
      <div className="glass-surface overflow-hidden rounded-2xl border border-white/60 shadow-[0_16px_48px_rgb(0_0_0_0.12)]">
```

with:

```tsx
      <div className="glass-surface overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--text)_35%,transparent)] shadow-[0_16px_48px_rgb(0_0_0_0.12)]">
```

Lines 52 and 70 — replace both occurrences of `bg-white/40` with:

```tsx
bg-[color-mix(in_srgb,var(--text)_5%,transparent)]
```

(e.g. `className="flex gap-2 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--text)_5%,transparent)] px-4 py-3"`)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Button.tsx src/components/pwa/PwaInstallPrompt.tsx
git commit -m "fix(theme): tokenize remaining light-mode-breaking white-alpha colors"
```

---

### Task 8: End-to-end verification + push

**Files:**
- No file changes expected (fix loop only if verification fails)

**Interfaces:**
- Consumes: everything above, fully wired.

- [ ] **Step 1: Full typecheck + production build**

```bash
npm run typecheck && npm run build
```
Expected: both exit 0; `dist/` emitted.

- [ ] **Step 2: REA browser scenario battery (dev server on port 3000)**

Start the dev server, then using the established REA Code Mode workflow (`tools.rea.*` with a background Chrome + remote-debugging port, connect-mode scenario):

1. **Dark default**: screenshot `/` hero → banner art dark colorway, card composition, avatar overlap, icon row.
2. **Toggle to light**: click the theme button (or `document.querySelector('button[aria-label^="Switch to light"]')`) → screenshot → whole page flips (tokens propagate to all sections), banner recolors, sun icon shows.
3. **Persistence**: reload with `localStorage.theme === "light"` (set via scenario script before reload) → site still light; `theme-color` meta content is `#f6f7f8`. Then delete the key, reload → follows `prefers-color-scheme` (dark default).
4. **Oneko**: synthetic `mousemove` sequence across the viewport → cat div (32px, `z-index 2147483647`) translates toward the cursor, walk frames cycle; idle 4.5s → sits.
5. **Reduced motion**: emulate `prefers-reduced-motion: reduce`, reload → static sitting cat bottom-left, no banner drift, hero renders statically.
6. **Console**: no errors/warnings across the pass.
7. **Light-mode sweep**: scroll through all home sections on light → contrast defects (if any) get fixed in a follow-up commit before pushing.

- [ ] **Step 3: Push to GitHub (deploys Vercel)**

Only after every step above passes:

```bash
git push origin main
```

Expected: pushed; Vercel build triggered by the hook.

---

## Self-review checklist (completed during planning)

- **Spec coverage:** §1 theme system → Tasks 1–2; §2 hero composition → Task 6 (banner dependency Task 4); §3 animations → Task 6 (`HeroIntro`) + pre-verified section Reveal usage; §4 oneko → Task 5; §5 files table → every row has a task (`HeroIntro.tsx`: Task 6; sweep of literal colors: Task 7); §6 verification → Task 8. No gaps.
- **Placeholders:** none — every code step contains the complete code; every run step has an exact command and expected result.
- **Type consistency:** `useTheme()` signature identical across Tasks 2/3/6; `WALK_FRAMES`/`SIT`/`SIT_BLINK` exports match imports in Task 5; variant names `heroIntroItem/heroIntroBanner/heroIntroAvatar` match between HeroIntro.tsx and HeroSection.tsx; `--banner-*` names identical in Task 1 CSS and Task 4 SVG.
