import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getLenis } from "@/hooks/useScroll";

const VALID_SECTIONS = new Set(["about", "projects", "contact"]);

export function useHashScroll(enabled: boolean) {
  const location = useLocation();

  useEffect(() => {
    if (!enabled || location.pathname !== "/") return;

    const hash = location.hash.replace("#", "");
    if (!hash || !VALID_SECTIONS.has(hash)) return;

    const scrollToHash = () => {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(`#${hash}`, { immediate: false });
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }
    };

    const timer = window.setTimeout(scrollToHash, 100);
    return () => window.clearTimeout(timer);
  }, [enabled, location.pathname, location.hash]);
}

export function scrollToSectionHash(section: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `#${section}`);
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(`#${section}`);
    return;
  }
  document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
}
