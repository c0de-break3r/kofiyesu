import { computed, ref, watch } from "vue";

/** User preference stored in localStorage. */
export type ThemePreference = "light" | "dark" | "system";

/** Applied theme on `document.documentElement` (`data-theme`). */
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "kofiyesu-theme";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === "system") return getSystemTheme();
  return preference;
};

const getStoredPreference = (): ThemePreference | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return null;
};

export const themePreference = ref<ThemePreference>(getStoredPreference() ?? "system");

/** Resolved light/dark used for styling (`data-theme`). */
export const resolvedTheme = computed(() => resolveTheme(themePreference.value));

/** @deprecated Use `themePreference` or `resolvedTheme` — kept for existing components. */
export const theme = resolvedTheme;

const applyResolvedTheme = (mode: ResolvedTheme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.classList.remove("light", "dark");
  root.classList.add(mode);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", mode === "dark" ? "#363a3f" : "#e85d04");
  }
};

const onSystemThemeChange = () => {
  if (themePreference.value === "system") {
    applyResolvedTheme(getSystemTheme());
  }
};

let systemMediaQuery: MediaQueryList | null = null;

export const initTheme = (defaultPreference: ThemePreference = "system") => {
  themePreference.value = getStoredPreference() ?? defaultPreference;
  applyResolvedTheme(resolveTheme(themePreference.value));

  if (typeof window === "undefined") return;

  systemMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  systemMediaQuery.addEventListener("change", onSystemThemeChange);
};

watch(themePreference, (preference) => {
  localStorage.setItem(STORAGE_KEY, preference);
  applyResolvedTheme(resolveTheme(preference));
});

export const setTheme = (preference: ThemePreference) => {
  themePreference.value = preference;
};

export const toggleTheme = () => {
  setTheme(resolvedTheme.value === "light" ? "dark" : "light");
};

export function useTheme() {
  return {
    theme: resolvedTheme,
    themePreference,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
