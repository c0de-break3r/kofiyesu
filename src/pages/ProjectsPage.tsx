import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { Footer } from "@/components/layout/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getProjectsByCategory } from "@/lib/projects";
import { PROJECT_CATEGORIES, type CategoryId } from "@/data/types";

export default function ProjectsPage() {
  const [active, setActive] = useState<CategoryId | null>(null);

  useDocumentMeta({
    title: "Projects — Obed Prince Kofi Yesu",
    description:
      "Software projects by Obed Prince Kofi Yesu — web applications, AI and automation tools, and security work.",
    canonicalPath: "/projects",
  });

  const filtered = useMemo(() => getProjectsByCategory(active), [active]);

  return (
    <main id="main-content" className="pt-[var(--height-header)]">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <header className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            Work
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Projects
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
            A collection of software I have designed and built — web applications, AI and
            automation tools, and security-focused work.
          </p>
        </header>

        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          <FilterChip label="All" active={active === null} onClick={() => setActive(null)} />
          {PROJECT_CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={c.label}
              active={active === c.id}
              onClick={() => setActive(c.id)}
            />
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <p className="mt-16 text-center text-sm text-[var(--text-muted)]">
            No projects in this category yet — check back soon.
          </p>
        )}
      </div>

      <Footer />
    </main>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
      }`}
    >
      {label}
    </button>
  );
}
