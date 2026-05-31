import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ProjectCardSkeleton } from "@/components/ui/ProjectCardSkeleton";
import { t } from "@/i18n/en";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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
  const { previews, features, loaded } = useSiteContent();
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);

  const sortedPreviews = useMemo(
    () => [...previews].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [previews],
  );

  const sortedFeatures = useMemo(
    () => [...features].sort((a, b) => a.sort_order - b.sort_order),
    [features],
  );

  const filtered = useMemo(() => {
    if (!activeFeatureId) return sortedPreviews;
    return sortedPreviews.filter((project) => project.categoryId === activeFeatureId);
  }, [sortedPreviews, activeFeatureId]);

  useEffect(() => {
    if (!activeFeatureId) return;
    const stillValid = sortedPreviews.some((project) => project.categoryId === activeFeatureId);
    if (!stillValid) setActiveFeatureId(null);
  }, [sortedPreviews, activeFeatureId]);

  const activeFeatureLabel = sortedFeatures.find((f) => f.id === activeFeatureId)?.label;

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

        {sortedFeatures.length > 0 ? (
          <FilterRow
            className="mb-8 flex flex-wrap items-center gap-2"
            {...(animate
              ? {
                  initial: "hidden",
                  animate: "visible",
                  variants: headerReveal,
                  transition: { ...revealTransition, delay: 0.08 },
                }
              : {})}
          >
            <span className="mr-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {t("filter-feature")}
            </span>
            <button
              type="button"
              onClick={() => setActiveFeatureId(null)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                activeFeatureId === null
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm shadow-[color-mix(in_srgb,var(--color-accent-deep)_25%,transparent)]"
                  : "glass-surface border-transparent text-[var(--text-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
              }`}
            >
              {t("filter-all")}
            </button>
            {sortedFeatures.map((feature) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => setActiveFeatureId(feature.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                  activeFeatureId === feature.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm shadow-[color-mix(in_srgb,var(--color-accent-deep)_25%,transparent)]"
                    : "glass-surface border-transparent text-[var(--text-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
                }`}
              >
                {feature.label}
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
                      <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{preview.description}</p>
                    </div>
                  </Link>
                </CardItem>
              ))}
        </CardGrid>

        {loaded && sortedPreviews.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--text-muted)]">
            No projects published yet. Add and publish projects in the admin CMS.
          </p>
        ) : loaded && activeFeatureId && filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No projects in {activeFeatureLabel ?? "this feature"} yet.
            </p>
            <button
              type="button"
              onClick={() => setActiveFeatureId(null)}
              className="mt-3 text-sm font-bold text-[var(--color-accent)] hover:underline"
            >
              {t("filter-all")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
