import { useEffect, useMemo, useState, type RefObject } from "react";
import { getLenis } from "@/hooks/useScroll";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Maps #about scroll position to 0–1 (matches prior Framer offset: start 72%, end 22%). */
export function computeAboutScrollProgress(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const startLine = vh * 0.72;
  const endLine = vh * 0.22;
  const range = rect.height - (startLine - endLine);
  if (range <= 0) return rect.top <= startLine ? 1 : 0;
  return clamp((startLine - rect.top) / range, 0, 1);
}

export function paragraphOpacity(index: number, total: number, progress: number): number {
  if (total <= 0) return 1;
  const seg = 1 / total;
  const start = index * seg;
  const end = (index + 1) * seg;
  if (progress < start || progress >= end) return 0;
  return 1 - (progress - start) / seg;
}

export function useAboutScrollStory(
  scrollRootRef: RefObject<HTMLElement | null> | undefined,
  paragraphCount: number,
  reducedMotion: boolean,
) {
  const [progress, setProgress] = useState(0);
  const [activeParagraph, setActiveParagraph] = useState(0);

  useEffect(() => {
    const el = scrollRootRef?.current;
    if (!el || reducedMotion || paragraphCount <= 1) {
      setProgress(0);
      setActiveParagraph(0);
      return;
    }

    const update = () => {
      const nextProgress = computeAboutScrollProgress(el);
      setProgress(nextProgress);
      setActiveParagraph(
        Math.min(paragraphCount - 1, Math.max(0, Math.floor(nextProgress * paragraphCount))),
      );
    };

    update();
    const lenis = getLenis();
    lenis?.on("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      lenis?.off("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollRootRef, paragraphCount, reducedMotion]);

  const opacities = useMemo(
    () =>
      Array.from({ length: paragraphCount }, (_, index) =>
        reducedMotion || paragraphCount <= 1 ? 1 : paragraphOpacity(index, paragraphCount, progress),
      ),
    [paragraphCount, progress, reducedMotion],
  );

  return {
    progress,
    activeParagraph,
    opacities,
    barScale: reducedMotion ? 1 : progress,
    animated: !reducedMotion && paragraphCount > 1 && Boolean(scrollRootRef),
  };
}
