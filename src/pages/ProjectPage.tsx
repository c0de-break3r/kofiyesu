import { Link, useParams } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getAdjacentProjects, getCategoryLabel, getProjectBySlug } from "@/lib/projects";
import { STATUS_LABELS } from "@/data/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
        {children}
      </div>
    </section>
  );
}

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;
  const { next } = getAdjacentProjects(slug ?? "");

  useDocumentMeta({
    title: project ? `${project.title} — Obed Prince Kofi Yesu` : "Project — Obed Prince Kofi Yesu",
    description: project?.summary,
    canonicalPath: slug ? `/project/${slug}` : "/",
  });

  if (!project) {
    return (
      <main id="main-content" className="pt-[var(--height-header)]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <Link to="/projects" className="text-sm font-bold text-[var(--color-accent)] hover:underline">
            ← Back to projects
          </Link>
          <p className="mt-8 text-lg font-bold text-[var(--text)]">Project not found.</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            This project may have been renamed or removed.
          </p>
        </div>
      </main>
    );
  }

  const hero = project.hero ?? (project.thumbnail ? { src: project.thumbnail, alt: project.title } : null);

  return (
    <main id="main-content" className="pt-[var(--height-header)]">
      <article className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
        <Link to="/projects" className="text-sm font-bold text-[var(--color-accent)] hover:underline">
          ← Back to projects
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
            <span className="text-[var(--color-accent)]">{getCategoryLabel(project.category)}</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--text-muted)]">{STATUS_LABELS[project.status]}</span>
            {project.year ? <span className="text-[var(--text-muted)]">· {project.year}</span> : null}
          </div>
          <h1 className="mt-3 text-balance text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{project.summary}</p>
        </header>

        {hero ? (
          <img
            src={hero.src}
            alt={hero.alt}
            loading="eager"
            decoding="async"
            className="mt-8 aspect-[16/10] w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] object-cover"
          />
        ) : null}

        {project.liveUrl || project.sourceUrl ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-deep)]"
              >
                View live
              </a>
            ) : null}
            {project.sourceUrl ? (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Source code
              </a>
            ) : null}
          </div>
        ) : null}

        {project.overview ? <Section title="Overview">{project.overview}</Section> : null}
        {project.problem ? <Section title="The idea">{project.problem}</Section> : null}

        {project.features?.length ? (
          <Section title="What it does">
            <ul className="space-y-2">
              {project.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {project.contribution ? <Section title="My contribution">{project.contribution}</Section> : null}

        {project.stack?.length ? (
          <section className="mt-10">
            <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">Technology stack</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {project.gallery?.length ? (
          <section className="mt-10">
            <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">More screenshots</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {project.gallery.map((image) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] object-cover"
                />
              ))}
            </div>
          </section>
        ) : null}

        {next ? (
          <Link
            to={`/project/${next.slug}`}
            className="group mt-14 flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--color-accent)]"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              Next project
            </span>
            <span className="text-xl font-black text-[var(--text)]">{next.title}</span>
            <span className="text-sm text-[var(--text-muted)]">{next.summary}</span>
          </Link>
        ) : null}
      </article>
    </main>
  );
}
