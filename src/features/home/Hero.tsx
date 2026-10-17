import { Button } from "@/components/ui/Button";
import { ScrollCue } from "@/components/layout/ScrollCue";
import { t } from "@/i18n/en";
import { useSiteContent } from "@/hooks/useSiteContent";
import { scrollToSectionHash } from "@/hooks/useHashScroll";
import { getCurrentYear } from "@/lib/currentYear";
import portraitImage from "@/assets/images/portrait-cutout.webp";

export function Hero() {
  const { aboutText } = useSiteContent();
  const year = getCurrentYear();

  return (
    <section
      id="hero"
      className="relative flex w-full items-center overflow-hidden px-6 pb-16 pt-10 md:min-h-[calc(100dvh-var(--height-header,4.5rem))] md:pb-20 md:pt-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_85%_15%,color-mix(in_srgb,var(--color-accent)_12%,transparent),transparent_70%)]"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
        <div className="flex flex-col items-center gap-5 text-center md:order-1 md:items-start md:gap-6 md:text-left">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {t("hero-eyebrow")}
            <span className="hero-portfolio-dot" aria-hidden />
            <time dateTime={String(year)}>{year}</time>
          </p>

          <h1 className="text-balance text-4xl font-black leading-[1.03] tracking-tight text-[var(--text)] sm:text-5xl xl:text-6xl">
            I turn ambitious ideas into digital products that work.
          </h1>

          <p className="text-balance text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-accent-deep)]">
            {aboutText("job_title", t("job-title"))}
          </p>

          <p className="max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
            {t("hero-intro")}
          </p>

          <div className="mt-1 flex flex-wrap justify-center gap-3 md:justify-start">
            <Button onClick={() => scrollToSectionHash("projects")}>{t("explore-work")}</Button>
            <Button variant="border" onClick={() => scrollToSectionHash("contact")}>
              {t("let-connect")}
            </Button>
          </div>

          <p className="text-sm font-semibold text-[var(--text-muted)]">
            {aboutText("location", t("location"))}
          </p>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[340px] md:order-2 md:mx-0 md:max-w-[440px]">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 translate-y-6 scale-90 rounded-full bg-[radial-gradient(55%_55%_at_50%_45%,color-mix(in_srgb,var(--color-accent)_28%,transparent),transparent_70%)] blur-2xl"
          />
          <img
            src={portraitImage}
            alt="Portrait of Obed Prince Kofi Yesu"
            width={944}
            height={1666}
            loading="eager"
            decoding="async"
            className="mx-auto block h-auto w-full max-w-[300px] drop-shadow-[0_30px_45px_rgba(10,13,20,0.28)] md:max-w-[420px]"
          />
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
