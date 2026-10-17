import { Link } from "react-router-dom";
import { getCategoryLabel } from "@/lib/projects";
import { STATUS_LABELS, type Project } from "@/data/types";

const statusClass: Record<Project["status"], string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-50 text-slate-600 border-slate-200",
  beta: "bg-amber-50 text-amber-700 border-amber-200",
  prototype: "bg-sky-50 text-sky-700 border-sky-200",
  "in-development": "bg-orange-50 text-orange-700 border-orange-200",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/project/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[0_18px_40px_-24px_rgba(27,29,33,0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-muted)]">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center">
            <span className="text-lg font-bold tracking-tight text-[var(--text-muted)]">
              {project.title}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[var(--color-accent)]">{getCategoryLabel(project.category)}</span>
          <span
            className={`ml-auto rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${statusClass[project.status]}`}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-[var(--text)] transition-colors group-hover:text-[var(--color-accent)]">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
          {project.summary}
        </p>
      </div>
    </Link>
  );
}
