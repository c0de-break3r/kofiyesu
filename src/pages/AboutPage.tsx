import { Footer } from "@/components/layout/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { profile } from "@/data/profile";
import portraitImage from "@/assets/images/portrait-cutout.webp";

export default function AboutPage() {
  useDocumentMeta({
    title: "About — Obed Prince Kofi Yesu",
    description: profile.intro,
    canonicalPath: "/about",
  });

  return (
    <main id="main-content" className="pt-[var(--height-header)]">
      <div className="mx-auto w-full max-w-3xl px-6 py-14 md:py-20">
        <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-8">
          <div className="shrink-0">
            <img
              src={portraitImage}
              alt={`Portrait of ${profile.name}`}
              width={944}
              height={1666}
              loading="eager"
              decoding="async"
              className="h-40 w-auto rounded-2xl object-cover object-top drop-shadow-sm sm:h-48"
            />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
              About
            </span>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              {profile.title}
            </p>
          </div>
        </header>

        <div className="mt-10 space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
          {profile.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">
            What I work on
          </h2>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
            {profile.expertise.map((item) => (
              <div key={item.title} className="bg-[var(--surface)] p-5">
                <dt className="text-sm font-bold text-[var(--text)]">{item.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">Technologies</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-12 flex flex-wrap gap-3">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-deep)]"
          >
            GitHub
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {profile.email}
          </a>
        </section>
      </div>

      <Footer />
    </main>
  );
}
