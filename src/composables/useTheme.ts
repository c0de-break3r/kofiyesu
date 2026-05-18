import { ref, watch } from "vue";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "kofiyesu-theme";

const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
};

export const theme = ref<ThemeMode>(getStoredTheme() ?? getSystemTheme());

const applyTheme = (mode: ThemeMode) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", mode === "dark" ? "#363a3f" : "#e85d04");
  }
};

export const initTheme = () => {
  applyTheme(theme.value);

  if (typeof window !== "undefined") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        theme.value = e.matches ? "dark" : "light";
      }
    });
  }
};

watch(
  theme,
  (mode) => {
    applyTheme(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  },
  { immediate: false },
);

export const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
};

export const setTheme = (mode: ThemeMode) => {
  theme.value = mode;
};

export function useTheme() {
  return { theme, toggleTheme, setTheme };
}
