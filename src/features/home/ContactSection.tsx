import { profile } from "@/data/profile";

export function ContactSection() {
  return (
    <section className="w-full bg-[var(--surface-muted)] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          Contact
        </span>
        <h2 className="text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">
          Get in touch
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
          I'm always happy to talk about software, security, and the ideas in between.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-deep)]"
          >
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
