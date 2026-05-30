import { useEffect, useState } from "react";
import { getLenis } from "@/hooks/useScroll";

/** True once the user has scrolled past the hero (desktop header shows logo + solid bar). */
export function useHeaderScroll(enabled: boolean) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setScrolledPastHero(false);
      return;
    }

    const update = () => {
      const lenisScroll = getLenis()?.scroll ?? 0;
      const scrollY = lenisScroll || window.scrollY;
      setScrolledPastHero(scrollY > 64);
    };

    update();

    const lenis = getLenis();
    lenis?.on("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      lenis?.off("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return scrolledPastHero;
}
