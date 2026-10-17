import { Link } from "react-router-dom";
import { profile } from "@/data/profile";
import portraitImage from "@/assets/images/portrait-cutout.webp";

export function Hero() {
  return (
    <section className="relative flex w-full items-center overflow-hidden px-6 pb-16 pt-12 md:min-h-[calc(100dvh-var(--height-header))] md:pb-24 md:pt-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1fr_0.85fr] md:gap-14">
        <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {profile.location}
            <span className="hero-portfolio-dot" aria-hidden />
          </p>

          <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight text-[var(--text)] sm:text-5xl xl:text-6xl">
            {profile.name}
          </h1>

          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {profile.title}
          </p>

          <p className="max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
            {profile.intro}
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              to="/projects"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-deep)]"
            >
              View my work
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              More about me
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[320px] md:mx-0 md:max-w-[400px]">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 translate-y-6 scale-90 rounded-full bg-[radial-gradient(55%_55%_at_50%_45%,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_70%)] blur-2xl"
          />
          <img
            src={portraitImage}
            alt={`Portrait of ${profile.name}`}
            width={944}
            height={1666}
            loading="eager"
            decoding="async"
            className="mx-auto block h-auto w-full max-w-[280px] drop-shadow-[0_24px_40px_rgba(27,29,33,0.18)] md:max-w-[380px]"
          />
        </div>
      </div>
    </section>
  );
}
