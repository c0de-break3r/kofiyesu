import { useEffect, useState } from "react";

/**
 * Returns `true` once the window has scrolled past `threshold` pixels.
 * Used to make the header blend into the background at the top of the page
 * and reveal itself as a floating rounded bar on scroll.
 */
export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
