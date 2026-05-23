import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { t } from "@/i18n/en";
import { useSiteContent } from "@/hooks/useSiteContent";

export function Hero() {
  const navigate = useNavigate();
  const { aboutText } = useSiteContent();

  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--bg)]/20 via-transparent to-[var(--bg)]/90"
        aria-hidden
      />
      <div
        id="hero-content-inner"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-24 text-center md:items-start md:py-28 md:text-left"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Portfolio · {new Date().getFullYear()}
          </p>
          <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-7xl">
            Obed Prince
            <br />
            Kofi Yesu
          </h1>
          <p className="inline-flex w-fit rotate-[-3deg] rounded-lg bg-[var(--color-accent)] px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25">
            {aboutText("job_title", t("job-title"))}
          </p>
          <p className="text-sm font-semibold text-[var(--text-muted)]">
            {aboutText("location", t("location"))}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
          <Button onClick={() => navigate("/chat")}>{t("start-a-project")}</Button>
          <Button
            variant="border"
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t("view-work")}
          </Button>
        </div>
      </div>
    </section>
  );
}
