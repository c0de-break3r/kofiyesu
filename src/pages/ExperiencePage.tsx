import { Footer } from "@/components/layout/Footer";
import { TechStackCard } from "@/components/ui/TechStackCard";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { experience } from "@/data/experience";

export default function ExperiencePage() {
  useDocumentMeta({
    title: "Experience — Obed Prince Kofi Yesu",
    description:
      "Professional experience of Obed Prince Kofi Yesu — cybersecurity, IT support, and software engineering work.",
    canonicalPath: "/experience",
  });

  return (
    <main id="main-content" className="pt-[var(--height-header)]">
      <div className="mx-auto w-full max-w-3xl px-6 py-14 md:py-20">
        <header className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            Background
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Experience
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
            Formal, hands-on professional roles. Products I have built independently are listed
            under{" "}
            <a href="/projects" className="font-semibold text-[var(--color-accent)] hover:underline">
              Projects
            </a>
            .
          </p>
        </header>

        <ol className="mt-12 space-y-12 border-l border-[var(--border)] pl-6 md:pl-8">
          {experience.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full bg-[var(--color-accent)] ring-4 ring-[var(--bg)] md:-left-[2.1rem]"
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
                  {entry.role}
                </h2>
                <span className="text-sm font-semibold text-[var(--text-muted)]">
                  {entry.organization}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {entry.period}
                {entry.location ? ` · ${entry.location}` : ""}
              </p>
              {entry.summary ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  {entry.summary}
                </p>
              ) : null}

              <ul className="mt-4 space-y-2">
                {entry.responsibilities.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed text-[var(--text)]">
                    <span aria-hidden className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {entry.technologies?.length ? (
                <TechStackCard
                  label="Tools & tech"
                  technologies={entry.technologies}
                  className="mt-5"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <Footer />
    </main>
  );
}
