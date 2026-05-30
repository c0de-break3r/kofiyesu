import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Tag } from "@/components/ui/Tag";
import { ProjectCardSkeleton } from "@/components/ui/ProjectCardSkeleton";
import { t } from "@/i18n/en";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { TagVariant } from "@/lib/tagVariants";
import { tagLabels } from "@/lib/tagVariants";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const headerReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const cardReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function Projects() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.12 });
  const { previews, loaded } = useSiteContent();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    previews.forEach((p) => p.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [previews]);

  const filtered = useMemo(() => {
    if (!activeTag) return previews;
    return previews.filter((p) => p.tags?.includes(activeTag as TagVariant));
  }, [previews, activeTag]);

  const animate = !reducedMotion && inView;
  const revealTransition = reducedMotion ? { duration: 0 } : { duration: 0.65, ease: REVEAL_EASE };

  const HeaderBlock = reducedMotion ? "div" : motion.div;
  const FilterRow = reducedMotion ? "div" : motion.div;
  const CardGrid = reducedMotion ? "div" : motion.div;
  const CardItem = reducedMotion ? "div" : motion.div;

  return (
    <section
      ref={sectionRef}
      id="projects-content"
      className="relative w-full scroll-mt-[calc(var(--height-header,4.5rem)+0.5rem)] overflow-hidden px-6 pb-10 pt-6 md:pb-14 md:pt-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--color-accent)_4%,var(--surface-projects))_18%,var(--surface-projects)_45%,color-mix(in_srgb,var(--color-accent)_6%,var(--surface-projects))_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-accent)_35%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-1/4 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--color-accent-deep)_6%,transparent)] blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <HeaderBlock
          className="mb-10 max-w-xl md:mb-12"
          {...(animate
            ? {
                initial: "hidden",
                animate: "visible",
                variants: headerReveal,
                transition: revealTransition,
              }
            : {})}
        >
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {t("selected")}
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t("projects")}</h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{t("projects-subtitle")}</p>
        </HeaderBlock>

        {allTags.length > 0 ? (
          <FilterRow
            className="mb-8 flex flex-wrap gap-2"
            {...(animate
              ? {
                  initial: "hidden",
                  animate: "visible",
                  variants: headerReveal,
                  transition: { ...revealTransition, delay: 0.08 },
                }
              : {})}
          >
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                activeTag === null
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm shadow-[color-mix(in_srgb,var(--color-accent-deep)_25%,transparent)]"
                  : "glass-surface border-transparent text-[var(--text-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
              }`}
            >
              {t("filter-all")}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                  activeTag === tag
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm shadow-[color-mix(in_srgb,var(--color-accent-deep)_25%,transparent)]"
                    : "glass-surface border-transparent text-[var(--text-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
                }`}
              >
                {tagLabels[tag as TagVariant] ?? tag}
              </button>
            ))}
          </FilterRow>
        ) : null}

        <CardGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loaded
            ? Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)
            : filtered.map((preview, i) => (
                <CardItem
                  key={preview.slug}
                  {...(animate
                    ? {
                        initial: "hidden",
                        animate: "visible",
                        variants: cardReveal,
                        transition: { ...revealTransition, delay: 0.12 + i * 0.06 },
                      }
                    : {})}
                >
                  <Link
                    to={`/project/${preview.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_45%,var(--border))] hover:shadow-[0_12px_40px_color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
                  >
                    <div className="relative aspect-video overflow-hidden bg-[color-mix(in_srgb,var(--color-accent)_6%,var(--surface-projects))]">
                      {preview.thumbnail ? (
                        <img
                          src={preview.thumbnail}
                          alt={preview.title}
                          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
                            preview.previewVideo ? "group-hover:opacity-0" : ""
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          {preview.title}
                        </div>
                      )}
                      {preview.previewVideo ? (
                        <video
                          src={preview.previewVideo}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
                        />
                      ) : null}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,color-mix(in_srgb,var(--text)_8%,transparent))] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h3 className="text-lg font-bold transition-colors group-hover:text-[var(--color-accent)]">
                        {preview.title}
                      </h3>
                      {preview.tags?.length ? (
                        <ul className="flex flex-wrap gap-1.5">
                          {preview.tags.slice(0, 3).map((tag) => (
                            <li key={tag}>
                              <Tag variant={tag as TagVariant} />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{preview.description}</p>
                    </div>
                  </Link>
                </CardItem>
              ))}
        </CardGrid>

        {loaded && filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--text-muted)]">No projects match this filter.</p>
        ) : null}
      </div>
    </section>
  );
}
