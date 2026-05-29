import { useEffect, useState } from "react";
import { getLenis } from "@/hooks/useScroll";

export function useHeaderScroll(enabled: boolean) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setScrolledPastHero(false);
      return;
    }

    const update = () => {
      const about = document.getElementById("about");
      if (!about) {
        setScrolledPastHero(false);
        return;
      }

      const { top, bottom } = about.getBoundingClientRect();
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const heroOffset = isLandscape ? window.innerHeight * 0.225 : 0;
      const enteredAbout = top - heroOffset < 0;
      const leftAbout = bottom - 36 < 0;

      setScrolledPastHero(enteredAbout && !leftAbout);
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
