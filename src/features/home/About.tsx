import { t } from "@/i18n/en";
import { contactEmail, social } from "@/content/social";
import { defaultAbout, defaultAboutIntroParagraphs, splitAboutIntro } from "@/content/about";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAboutScrollStory } from "@/hooks/useAboutScrollStory";
import { Button } from "@/components/ui/Button";

const github = social.find((s) => s.name === "github");

export function About() {
  const reducedMotion = useReducedMotion();
  const { aboutText } = useSiteContent();

  const introRaw = aboutText("about_intro", defaultAbout.about_intro);
  const paragraphSource = (() => {
    const parts = splitAboutIntro(introRaw);
    return parts.length > 0 ? parts : defaultAboutIntroParagraphs;
  })();

  const tagline = aboutText("about_tagline", defaultAbout.about_tagline);

  const { activeParagraph, opacities, barScale, animated } = useAboutScrollStory(
    paragraphSource.length,
    reducedMotion,
  );

  return (
    <section
      id="about-content"
      className="relative w-full scroll-mt-[calc(var(--height-header,4.5rem)+0.5rem)] overflow-hidden px-6 pb-10 pt-8 md:pb-14 md:pt-14"
    >
      <div className="relative z-10 mx-auto max-w-3xl">
        <div>
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {t("about")}
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Background</h2>

          {!animated ? (
            <div className="mt-4 space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
              {paragraphSource.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="relative mt-4 pl-4" aria-live="polite" aria-atomic="true">
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-[3px] overflow-hidden rounded-full">
                <div
                  aria-hidden
                  className="about-scroll-bar h-full w-full origin-top rounded-full bg-[var(--color-accent)]"
                  style={{ transform: `scaleY(${barScale})` }}
                />
              </div>
              <div className="relative grid min-h-[12rem] sm:min-h-[11rem]">
                {paragraphSource.map((paragraph, i) => (
                  <p
                    key={i}
                    aria-hidden={i !== activeParagraph}
                    className="about-scroll-paragraph col-start-1 row-start-1 text-base leading-relaxed text-[var(--text-muted)]"
                    style={{ opacity: opacities[i] }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {tagline ? (
            <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--text-muted)]">{tagline}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
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
      </div>
    </section>
  );
}
