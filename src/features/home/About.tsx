import { t } from "@/i18n/en";
import { social } from "@/content/social";
import { defaultAbout, defaultAboutIntroParagraphs } from "@/content/about";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/Button";

const github = social.find((s) => s.name === "github");

export function About() {
  const { aboutText, services } = useSiteContent();

  const introRaw = aboutText("about_intro", defaultAbout.about_intro);
  const introParagraphs =
    introRaw.includes("\n\n") ? introRaw.split(/\n\n+/).filter(Boolean) : [introRaw];

  const tagline = aboutText("about_tagline", defaultAbout.about_tagline);

  return (
    <section id="about-content" className="relative w-full scroll-mt-[calc(var(--height-header,4.5rem)+0.5rem)] bg-[var(--bg)] px-6 pb-10 pt-10 md:pb-12 md:pt-12">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {t("about")}
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Background</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
            {(introParagraphs.length ? introParagraphs : defaultAboutIntroParagraphs).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {tagline ? (
            <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--text-muted)]">{tagline}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {github ? (
              <a href={github.url} target="_blank" rel="noreferrer">
                <Button variant="border">{t("view-github")}</Button>
              </a>
            ) : null}
            <a href="mailto:hello@kofiyesu.dev?subject=Resume%20request">
              <Button variant="border">{t("download-cv")}</Button>
            </a>
          </div>
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
