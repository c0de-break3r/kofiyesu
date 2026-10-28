import { Link } from "react-router-dom";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAllProjects } from "@/lib/projects";

/** Three deep-dive rows linking into the /project/:slug case studies. */
export function SelectedWorkSection() {
  const shown = getAllProjects().slice(0, 3);

  return (
    <section id="engineering" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            index="06"
            title="Selected engineering work"
            intro="The deeper story behind the builds — architecture, contribution, and outcomes."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {shown.map((project) => (
              <Link
                key={project.slug}
                to={`/project/${project.slug}`}
                className="group block px-6 py-7 transition hover:bg-[var(--surface-muted)] md:px-8"
              >
                <div className="flex flex-wrap items-baseline gap-x-4">
                  <h3 className="text-lg font-bold tracking-tight text-[var(--text)] transition-colors group-hover:text-[var(--color-accent)] md:text-xl">
                    {project.title}
                  </h3>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {project.year ? `${project.year} · ` : ""}
                    {project.summary}
                  </p>
                  <span className="ml-auto font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] opacity-0 transition group-hover:opacity-100">
                    Case study →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
