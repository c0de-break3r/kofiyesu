import { Link } from "react-router-dom";
import { ProjectCard } from "@/components/ProjectCard";
import { getSelectedProjects } from "@/lib/projects";

export function SelectedProjects() {
  const projects = getSelectedProjects(3);

  return (
    <section className="w-full px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div className="max-w-xl">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
              Selected work
            </span>
            <h2 className="text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">
              Projects
            </h2>
          </div>
          <Link
            to="/projects"
            className="text-sm font-bold text-[var(--color-accent)] transition hover:text-[var(--color-accent-deep)]"
          >
            View all projects →
          </Link>
        </header>

        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-[var(--text-muted)]">
            No projects published yet — check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
