import { Link } from "react-router-dom";
import { Tag } from "@/components/ui/Tag";
import { t } from "@/i18n/en";
import type { ProjectPreview } from "@/types/content";
import type { TagVariant } from "@/lib/tagVariants";

interface Props {
  project: ProjectPreview;
}

export function NextProject({ project }: Props) {
  return (
    <Link
      to={`/project/${project.slug}`}
      className="group mt-16 flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] transition hover:border-[var(--color-accent)] md:flex-row"
    >
      <div className="aspect-video w-full shrink-0 bg-zinc-100 md:aspect-auto md:w-2/5">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 p-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
          {t("next-project")}
        </span>
        <h3 className="text-2xl font-black">{project.title}</h3>
        {project.tags?.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <li key={tag}>
                <Tag variant={tag as TagVariant} />
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-sm text-[var(--text-muted)]">{project.description}</p>
      </div>
    </Link>
  );
}
