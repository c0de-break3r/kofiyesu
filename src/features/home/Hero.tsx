import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { ScrollCue } from "@/components/layout/ScrollCue";
import { t } from "@/i18n/en";
import { useSiteContent } from "@/hooks/useSiteContent";
import { scrollToSectionHash } from "@/hooks/useHashScroll";
import { getCurrentYear } from "@/lib/currentYear";

export function Hero() {
  const navigate = useNavigate();
  const { aboutText } = useSiteContent();
  const year = getCurrentYear();

  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)]/90 md:from-[var(--room-bg)]/10 md:to-[var(--bg)]/85"
        aria-hidden
      />
      <div
        id="hero-content-inner"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-6 pb-24 pt-16 text-center md:items-start md:gap-6 md:pb-24 md:pt-[calc(var(--height-header,4.5rem)+1.5rem)] md:text-left"
      >
        <Logo size={72} className="md:hidden" linked />

        <div className="flex flex-col gap-3 md:gap-4">
          <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] md:justify-start">
            Portfolio
            <span className="hero-portfolio-dot" aria-hidden />
            <time dateTime={String(year)}>{year}</time>
          </p>
          <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight text-[var(--text)] sm:text-5xl xl:text-7xl">
            Obed Prince
            <br />
            Kofi Yesu
          </h1>
          <p className="inline-flex w-fit rotate-[-3deg] rounded-lg bg-[var(--color-accent)] px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--color-accent-deep)_30%,transparent)]">
            {aboutText("job_title", t("job-title"))}
          </p>
          <p className="text-sm font-semibold text-[var(--text-muted)]">
            {aboutText("location", t("location"))}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
          <Button onClick={() => navigate("/chat")}>{t("start-a-project")}</Button>
          <Button variant="glass" onClick={() => scrollToSectionHash("projects")}>
            {t("view-work")}
          </Button>
        </div>
      </div>
      <ScrollCue />
    </section>
  );
}
