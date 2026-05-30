import { useEffect, useState } from "react";
import { getLenis } from "@/hooks/useScroll";

/** True once scroll passes threshold (desktop header glass bar). */
export function useHeaderScroll(enabled: boolean, threshold = 64) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setScrolledPastHero(false);
      return;
    }

    const update = () => {
      const lenisScroll = getLenis()?.scroll ?? 0;
      const scrollY = lenisScroll || window.scrollY;
      setScrolledPastHero(scrollY > threshold);
    };

    update();

    const lenis = getLenis();
    lenis?.on("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      lenis?.off("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, threshold]);

  return scrolledPastHero;
}
