import { Link } from "react-router-dom";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { getSelectedProjects } from "@/lib/projects";

/** Featured project cards for the one-pager — everything else lives on /projects. */
export function ProofOfWorkSection() {
  const shown = getSelectedProjects(6);

  return (
    <section id="work" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            index="02"
            title="Proof of work"
            intro="Selected products spanning ecommerce, developer tooling, mobility, and security."
            trailing={
              <Link
                to="/projects"
                className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] transition hover:text-[var(--color-accent-deep)]"
              >
                All projects →
              </Link>
            }
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="grid gap-6 sm:grid-cols-2">
            {shown.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
