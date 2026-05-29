import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Tag } from "@/components/ui/Tag";
import { ProjectCardSkeleton } from "@/components/ui/ProjectCardSkeleton";
import { t } from "@/i18n/en";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { TagVariant } from "@/lib/tagVariants";
import { tagLabels } from "@/lib/tagVariants";

export function Projects() {
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

  return (
    <section className="relative w-full scroll-mt-[calc(var(--height-header,4.5rem)+0.5rem)] bg-[var(--surface-projects)] px-6 pb-10 pt-10 md:pb-12 md:pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-xl md:mb-12">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {t("selected")}
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t("projects")}</h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{t("projects-subtitle")}</p>
        </div>

        {allTags.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                activeTag === null
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--color-accent)]"
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
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--color-accent)]"
                }`}
              >
                {tagLabels[tag as TagVariant] ?? tag}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loaded
            ? Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)
            : filtered.map((preview) => (
                <Link
                  key={preview.slug}
                  to={`/project/${preview.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-sm transition hover:border-[var(--color-accent)] hover:shadow-md"
                >
                  <div className="aspect-video overflow-hidden bg-zinc-800/20">
                    {preview.thumbnail ? (
                      <img
                        src={preview.thumbnail}
                        alt={preview.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="text-lg font-bold">{preview.title}</h3>
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
              ))}
        </div>

        {loaded && filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--text-muted)]">No projects match this filter.</p>
        ) : null}
      </div>
    </section>
  );
}
