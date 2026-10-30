import { profile } from "@/data/profile";
import { GhanaFlag } from "@/components/ui/GhanaFlag";
import { QuickLinks } from "@/components/ui/QuickLinks";
import portraitImage from "@/assets/images/portrait-cutout.webp";

/** Masthead for the one-page home: philosophy statement, CTAs, portrait. */
export function HeroSection() {
  const heroImage = profile.heroImage;

  return (
    <section className="relative isolate flex w-full items-center overflow-hidden px-6 pb-20 pt-14 md:min-h-[calc(100dvh-var(--height-header))] md:pb-28 md:pt-20">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--color-accent)_10%,transparent),transparent_70%)]"
      />
      {heroImage ? (
        <>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          {/* Theme-aware overlay so text stays readable on top of the photo. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[var(--bg)] opacity-75 dark:opacity-70"
          />
        </>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
          <div className="flex items-center" title="Accra, Ghana">
            <GhanaFlag />
          </div>

          <h1 className="text-balance text-4xl font-bold leading-[1.04] tracking-tight text-[var(--text)] sm:text-5xl xl:text-6xl">
            {profile.name}
          </h1>

          <p className="max-w-xl font-mono text-sm leading-relaxed text-[var(--color-accent)]">
            {profile.tagline}
          </p>

          <div className="max-w-xl space-y-3 text-base leading-relaxed text-[var(--text-muted)]">
            {profile.bio.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <QuickLinks className="mt-2 md:justify-start" />
        </div>

        <div className="relative mx-auto w-full max-w-[320px] md:mx-0 md:max-w-[400px]">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 translate-y-6 scale-90 rounded-full bg-[radial-gradient(55%_55%_at_50%_45%,color-mix(in_srgb,var(--color-accent)_20%,transparent),transparent_70%)] blur-2xl"
          />
          <img
            src={portraitImage}
            alt={`Portrait of ${profile.name}`}
            width={944}
            height={1666}
            loading="eager"
            decoding="async"
            className="mx-auto block h-auto w-full max-w-[280px] drop-shadow-[0_24px_48px_rgba(0,0,0,0.6)] md:max-w-[380px]"
          />
        </div>
      </div>
    </section>
  );
}
