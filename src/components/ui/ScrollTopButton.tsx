import { FiArrowUp } from "react-icons/fi";
import { useScrolled } from "@/hooks/useScrolled";

/**
 * Floating "scroll to top" affordance. Appears in the bottom-right corner once
 * the visitor has scrolled down, replacing the old navbar border reveal.
 */
export function ScrollTopButton() {
  const visible = useScrolled(400);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      className={`scroll-top ${visible ? "scroll-top--visible" : ""}`}
    >
      <FiArrowUp aria-hidden />
    </button>
  );
}
