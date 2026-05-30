import { useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import { aboutProgress } from "@/animations/transitions/about";

export function paragraphOpacity(index: number, total: number, progress: number): number {
  if (total <= 0) return 1;
  const seg = 1 / total;
  const start = index * seg;
  const end = (index + 1) * seg;
  if (progress < start || progress >= end) return 0;
  return 1 - (progress - start) / seg;
}

/** Paragraph cross-fade driven by GSAP ScrollTrigger (`aboutProgress` on `#about`). */
export function useAboutScrollStory(paragraphCount: number, reducedMotion: boolean) {
  const [progress, setProgress] = useState(0);
  const [activeParagraph, setActiveParagraph] = useState(0);

  useEffect(() => {
    if (reducedMotion || paragraphCount <= 1) {
      setProgress(reducedMotion ? 1 : 0);
      setActiveParagraph(0);
      return;
    }

    const update = () => {
      const nextProgress = aboutProgress.value;
      setProgress(nextProgress);
      setActiveParagraph(
        Math.min(paragraphCount - 1, Math.max(0, Math.floor(nextProgress * paragraphCount))),
      );
    };

    update();
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, [paragraphCount, reducedMotion]);

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
    animated: !reducedMotion && paragraphCount > 1,
  };
}
