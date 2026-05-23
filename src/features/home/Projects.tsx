import { Link } from "react-router-dom";
import { Tag } from "@/components/ui/Tag";
import { t } from "@/i18n/en";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { TagVariant } from "@/lib/tagVariants";

export function Projects() {
  const { previews } = useSiteContent();

  return (
    <section
      id="projects"
      className="relative w-full bg-[var(--surface-projects)] px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-xl">
          <span className="mb-2 inline-block rotate-[-4deg] rounded-md bg-[var(--color-accent)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {t("selected")}
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{t("projects")}</h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{t("projects-subtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {previews.map((preview) => (
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
      </div>
    </section>
  );
}
