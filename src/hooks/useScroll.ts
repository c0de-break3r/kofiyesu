import { useEffect, useRef } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getReducedMotionPreference } from "@/hooks/useReducedMotion";

let lenisInstance: Lenis | null = null;

const handleScroll = () => {
  ScrollTrigger.update();
};

const handleRefresh = () => {
  lenisInstance?.resize();
};

export function getLenis() {
  return lenisInstance;
}

export function useScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reducedMotion = getReducedMotionPreference();

    const tick = (time: number) => {
      lenisRef.current?.raf(time * 1000);
    };

    if (lenisRef.current) {
      lenisRef.current.destroy();
      lenisRef.current.off("scroll", handleScroll);
    }

    lenisRef.current = new Lenis({
      lerp: reducedMotion ? 1 : 0.08,
      smoothWheel: !reducedMotion,
      prevent: (node) =>
        Boolean(
          node instanceof Element &&
            node.closest("[data-lenis-prevent], [data-lenis-prevent-wheel]"),
        ),
    });
    lenisInstance = lenisRef.current;
    lenisRef.current.on("scroll", handleScroll);
    document.documentElement.classList.add("lenis");

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (value !== undefined && lenisRef.current) {
          lenisRef.current.scrollTo(value, { immediate: reducedMotion });
        }
        return lenisRef.current?.scroll ?? 0;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    ScrollTrigger.addEventListener("refresh", handleRefresh);

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      gsap.ticker.remove(tick);
      lenisRef.current?.off("scroll", handleScroll);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      lenisInstance = null;
      document.documentElement.classList.remove("lenis");
    };
  }, []);
}
