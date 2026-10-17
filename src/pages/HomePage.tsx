import { Link } from "react-router-dom";
import { Hero } from "@/features/home/Hero";
import { SelectedProjects } from "@/features/home/SelectedProjects";
import { ContactSection } from "@/features/home/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { profile } from "@/data/profile";
import { experience } from "@/data/experience";

function Expertise() {
  return (
    <section className="w-full bg-[var(--surface-muted)] px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 max-w-xl">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            What I do
          </span>
          <h2 className="text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">
            Technical focus
          </h2>
        </header>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {profile.expertise.map((item) => (
            <div key={item.title} className="bg-[var(--surface)] p-6 md:p-8">
              <h3 className="text-lg font-bold tracking-tight text-[var(--text)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperiencePreview() {
  return (
    <section className="w-full px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
              Background
            </span>
            <h2 className="text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">
              Experience
            </h2>
          </div>
          <Link
            to="/experience"
            className="text-sm font-bold text-[var(--color-accent)] transition hover:text-[var(--color-accent-deep)]"
          >
            Full timeline →
          </Link>
        </header>

        <ol className="space-y-8 border-l border-[var(--border)] pl-6">
          {experience.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full bg-[var(--color-accent)] ring-4 ring-[var(--bg)]"
              />
              <h3 className="text-lg font-bold tracking-tight text-[var(--text)]">{entry.role}</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">
                {entry.organization} · {entry.period}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {entry.responsibilities[0]}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function HomePage() {
  useDocumentMeta({
    title: `${profile.name} — Software Engineer`,
    description: profile.intro,
    canonicalPath: "/",
  });

  return (
    <div id="main-content" className="relative">
      <Hero />
      <SelectedProjects />
      <Expertise />
      <ExperiencePreview />
      <ContactSection />
      <Footer />
    </div>
  );
}
