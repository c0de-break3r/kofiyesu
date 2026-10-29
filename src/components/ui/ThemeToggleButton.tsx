import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "@/hooks/useTheme";

/**
 * Light/dark switch — a normal-size round icon button shared with the menu and
 * hero quick-links. The theme change itself spreads outward from the centre of
 * the screen via the View Transitions API (see `vt-scale` in index.css).
 */
export function ThemeToggleButton({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => toggle()}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`icon-btn ${className}`}
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </button>
  );
}
