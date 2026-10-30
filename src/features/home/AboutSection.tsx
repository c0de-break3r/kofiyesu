import { profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";

/** Interests, focus areas and engineering philosophy. (The about-me intro now
 *  lives in the hero.) */
export function AboutSection() {
  return (
    <section id="about" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Interests
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {profile.interests.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--text)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h3 className="mt-12 text-xl font-bold tracking-tight text-[var(--text)] md:text-2xl">
            What I'm focused on
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.focus.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--color-accent)]"
              >
                <span className="text-2xl" aria-hidden>
                  {f.icon}
                </span>
                <p className="mt-3 text-base font-bold text-[var(--text)]">{f.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className="mt-14 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 md:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Engineering &amp; security philosophy
            </p>
            <blockquote className="mt-4 text-balance text-xl font-bold leading-snug tracking-tight text-[var(--text)] md:text-2xl">
              &ldquo;{profile.philosophy.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
              {profile.philosophy.body}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
