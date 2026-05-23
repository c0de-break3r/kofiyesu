import { t } from "@/i18n/en";
import { useSiteContent } from "@/hooks/useSiteContent";

export function About() {
  const { aboutText, services } = useSiteContent();

  return (
    <section id="about" className="relative w-full px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {t("about")}
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Background</h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
            {aboutText(
              "about_intro",
              "I'm a Software Engineer and Cybersecurity Practitioner based in Ghana. I build production backend systems and security automation.",
            )}
          </p>
          <p className="mt-4 text-sm font-medium text-[var(--text-muted)]">
            {aboutText("about_tagline", "")}
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <li
              key={s.name}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold"
            >
              {s.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
