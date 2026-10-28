import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

/** Closing contact section for the one-pager. */
export function ConnectSection() {
  return (
    <section id="connect" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            index="07"
            title="Let's connect"
            intro="Open to full-stack engineering, AI-powered applications, SaaS, automation, and security-focused work."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="grid gap-6 sm:grid-cols-2">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--color-accent)] md:p-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
                GitHub
              </p>
              <p className="mt-4 text-xl font-bold tracking-tight text-[var(--text)]">
                @c0de-break3r
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Code, active projects, and engineering updates
              </p>
              <span className="mt-5 inline-block font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] opacity-0 transition group-hover:opacity-100">
                Visit profile →
              </span>
            </a>

            <a
              href={`mailto:${profile.email}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--color-accent)] md:p-8"
            >
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Email
              </p>
              <p className="mt-4 text-xl font-bold tracking-tight text-[var(--text)]">
                {profile.email}
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                No forms, no tracking — direct to my inbox
              </p>
              <span className="mt-5 inline-block font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] opacity-0 transition group-hover:opacity-100">
                Compose mail →
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
