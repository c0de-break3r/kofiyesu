import { t } from "@/i18n/en";
import { contactEmail, social } from "@/content/social";
import { defaultAbout, defaultAboutIntroParagraphs, splitAboutIntro } from "@/content/about";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/Button";

const github = social.find((s) => s.name === "github");

export function About() {
  const { aboutText } = useSiteContent();

  const introRaw = aboutText("about_intro", defaultAbout.about_intro);
  const parts = splitAboutIntro(introRaw);
  const paragraphSource = parts.length > 0 ? parts : defaultAboutIntroParagraphs;
  const tagline = aboutText("about_tagline", defaultAbout.about_tagline);

  return (
    <section
      id="about-content"
      className="relative w-full scroll-mt-[calc(var(--height-header,4.5rem)+0.5rem)] px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
          {t("about")}
        </span>
        <h2 className="text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">
          Background
        </h2>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
          {paragraphSource.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {tagline ? (
          <p className="mt-6 border-l-2 border-[var(--color-accent)] pl-4 text-sm font-medium leading-relaxed text-[var(--text-muted)]">
            {tagline}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {github ? (
            <a href={github.url} target="_blank" rel="noreferrer">
              <Button variant="border">{t("view-github")}</Button>
            </a>
          ) : null}
          <a href={`mailto:${contactEmail}?subject=Resume%20request`}>
            <Button variant="border">{t("download-cv")}</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
