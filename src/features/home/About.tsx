import { type RefObject, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { t } from "@/i18n/en";
import { social } from "@/content/social";
import { defaultAbout, defaultAboutIntroParagraphs } from "@/content/about";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/Button";

const github = social.find((s) => s.name === "github");

function ScrollParagraph({
  index,
  total,
  progress,
  activeIndex,
  children,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  activeIndex: number;
  children: string;
}) {
  const step = 1 / total;
  const enter = index * step;
  const exit = (index + 1) * step;
  const blend = step * 0.22;

  const opacity = useTransform(
    progress,
    index === 0
      ? [0, exit - blend, exit, 1]
      : index === total - 1
        ? [0, enter, enter + blend, 1]
        : [0, enter, enter + blend, exit - blend, exit, 1],
    index === 0
      ? [1, 1, 0, 0]
      : index === total - 1
        ? [0, 0, 1, 1]
        : [0, 0, 1, 1, 0, 0],
  );

  const y = useTransform(
    progress,
    index === 0
      ? [0, exit - blend, exit, 1]
      : index === total - 1
        ? [0, enter, enter + blend, 1]
        : [0, enter, enter + blend, exit - blend, exit, 1],
    index === 0
      ? [0, 0, -28, -28]
      : index === total - 1
        ? [28, 28, 0, 0]
        : [28, 28, 0, 0, -28, -28],
  );

  return (
    <motion.p
      style={{ opacity, y }}
      aria-hidden={index !== activeIndex}
      className="col-start-1 row-start-1 text-base leading-relaxed text-[var(--text-muted)]"
    >
      {children}
    </motion.p>
  );
}

type AboutProps = {
  scrollRootRef?: RefObject<HTMLElement | null>;
};

export function About({ scrollRootRef }: AboutProps) {
  const reducedMotion = useReducedMotion();
  const { aboutText, services } = useSiteContent();
  const [activeParagraph, setActiveParagraph] = useState(0);

  const { scrollYProgress } = useScroll({
    target: scrollRootRef,
    offset: ["start 0.7", "end 0.25"],
  });

  const sideBarScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const sideGlowX = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);

  const introRaw = aboutText("about_intro", defaultAbout.about_intro);
  const paragraphs =
    introRaw.includes("\n\n") ? introRaw.split(/\n\n+/).filter(Boolean) : [introRaw];
  const displayParagraphs = paragraphs.length ? paragraphs : defaultAboutIntroParagraphs;

  const tagline = aboutText("about_tagline", defaultAbout.about_tagline);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reducedMotion || displayParagraphs.length <= 1) return;
    const next = Math.min(
      displayParagraphs.length - 1,
      Math.max(0, Math.floor(value * displayParagraphs.length)),
    );
    setActiveParagraph(next);
  });

  return (
    <section
      id="about-content"
      className="relative w-full scroll-mt-[calc(var(--height-header,4.5rem)+0.5rem)] overflow-hidden bg-[var(--bg)] px-6 pb-10 pt-10 md:pb-12 md:pt-12"
    >
      {!reducedMotion && scrollRootRef ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-4 top-0 z-0 w-1 origin-top rounded-full bg-[var(--color-accent)] md:left-[max(1.5rem,calc((100%-72rem)/2+0.5rem))]"
            style={{ scaleY: sideBarScale }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-1/4 z-0 h-72 w-72 rounded-full bg-[var(--color-accent)]/10 blur-3xl"
            style={{ x: sideGlowX }}
          />
        </>
      ) : null}

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {t("about")}
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Background</h2>

          {reducedMotion || !scrollRootRef || displayParagraphs.length <= 1 ? (
            <div className="mt-4 space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
              {displayParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div
              className="relative mt-4 grid min-h-[11rem] sm:min-h-[10rem]"
              aria-live="polite"
              aria-atomic="true"
            >
              {displayParagraphs.map((paragraph, i) => (
                <ScrollParagraph
                  key={i}
                  index={i}
                  total={displayParagraphs.length}
                  progress={scrollYProgress}
                  activeIndex={activeParagraph}
                >
                  {paragraph}
                </ScrollParagraph>
              ))}
            </div>
          )}

          {tagline ? (
            <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--text-muted)]">{tagline}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {github ? (
              <a href={github.url} target="_blank" rel="noreferrer">
                <Button variant="border">{t("view-github")}</Button>
              </a>
            ) : null}
            <a href="mailto:hello@kofiyesu.dev?subject=Resume%20request">
              <Button variant="border">{t("download-cv")}</Button>
            </a>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <li
              key={s.name}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold"
            >
              {s.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
