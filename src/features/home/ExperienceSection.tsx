import { useState } from "react";
import { Link } from "react-router-dom";
import { experience } from "@/data/experience";
import type { ExperienceEntry } from "@/data/types";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExperienceCard({ entry }: { entry: ExperienceEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = `exp-${entry.id}`;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--border-strong)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
      >
        <span className="flex-1">
          <span className="block text-base font-bold tracking-tight text-[var(--text)]">
            {entry.role}
          </span>
          <span className="mt-1 block font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {entry.organization} · {entry.period}
          </span>
        </span>
        <span
          className={`shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${
            open ? "rotate-180 text-[var(--color-accent)]" : ""
          }`}
        >
          <Chevron />
        </span>
      </button>

      <div
        id={panelId}
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 sm:px-6">
            {entry.summary ? (
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{entry.summary}</p>
            ) : null}
            <ul className="mt-3 space-y-2">
              {entry.responsibilities.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-[var(--text)]"
                >
                  <span
                    aria-hidden
                    className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {entry.technologies?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Top experience entries for the one-pager — expandable cards. Full timeline on /experience. */
export function ExperienceSection() {
  const shown = experience.slice(0, 3);

  return (
    <section id="experience" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
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
          <div className="mt-4 space-y-3">
            {shown.map((entry) => (
              <ExperienceCard key={entry.id} entry={entry} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
