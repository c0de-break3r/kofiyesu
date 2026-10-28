import { Link } from "react-router-dom";
import { experience } from "@/data/experience";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

/** Top experience entries for the one-pager — full timeline lives on /experience. */
export function ExperienceSection() {
  const shown = experience.slice(0, 3);

  return (
    <section id="experience" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            index="01"
            title="Experience"
            trailing={
              <Link
                to="/experience"
                className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] transition hover:text-[var(--color-accent-deep)]"
              >
                Full timeline →
              </Link>
            }
          />
        </Reveal>

        <Reveal delay={0.08}>
          <ol className="space-y-8 border-l border-[var(--border)] pl-6">
            {shown.map((entry) => (
              <li key={entry.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full bg-[var(--color-accent)] ring-4 ring-[var(--bg)]"
                />
                <h3 className="text-lg font-bold tracking-tight text-[var(--text)]">
                  {entry.role}
                </h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {entry.organization} · {entry.period}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
                  {entry.summary ?? entry.responsibilities[0]}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
