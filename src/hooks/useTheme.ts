import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "theme";
const THEMING_CLASS = "theming";
const CROSSFADE_MS = 300;
const META_COLORS: Record<Theme, string> = {
  light: "#faf9f7",
  dark: "#141110",
};

const listeners = new Set<() => void>();
let current: Theme | null = null;
let crossfadeTimer = 0;

function readStoredTheme(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.dataset.theme;
    if (attr === "light" || attr === "dark") return attr;
  }
  return "light";
}

function getSnapshot(): Theme {
  if (current === null) current = readStoredTheme();
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

function paint(theme: Theme) {
  const docEl = document.documentElement;
  docEl.dataset.theme = theme;
  docEl
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", META_COLORS[theme]);
}

function persist(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage unavailable */
  }
}

function apply(next: Theme) {
  current = next;
  persist(next);
  emit();
}

/**
 * Toggle the theme using the View Transitions API so the new palette spreads
 * outward from the centre of the screen (see the `vt-scale` mask animation in
 * index.css). Falls back to a brief colour crossfade where the API is missing.
 */
function toggleTheme() {
  const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
  const docEl = document.documentElement;

  if (typeof document.startViewTransition !== "function") {
    docEl.classList.add(THEMING_CLASS);
    window.clearTimeout(crossfadeTimer);
    crossfadeTimer = window.setTimeout(
      () => docEl.classList.remove(THEMING_CLASS),
      CROSSFADE_MS,
    );
    paint(next);
    apply(next);
    return;
  }

  document.startViewTransition(() => {
    paint(next);
    apply(next);
  });
}

/**
 * Persisted theme state shared across every consumer (module-level store so
 * the theme toggle and any other reader stay in sync). The inline index.html
 * script seeds `data-theme` before first paint; this hook keeps it,
 * localStorage["theme"], and the theme-color meta consistent.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light" as Theme);

  const setTheme = useCallback((next: Theme) => {
    if (next === getSnapshot()) return;
    toggleTheme();
  }, []);

  const toggle = useCallback(() => {
    toggleTheme();
  }, []);

  return { theme, setTheme, toggle };
}
