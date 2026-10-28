import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { profile } from "@/data/profile";
import snapshotSvg from "@/assets/stats/github-snapshot.svg";
import streakSvg from "@/assets/stats/streak.svg";

/**
 * GitHub activity cards as locally committed assets (regenerate with
 * `npm run stats:snapshot`) so the site works offline and keeps CSP img-src 'self'.
 */
export function ContributionsSection() {
  return (
    <section id="contributions" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader
            index="04"
            title="GitHub at a glance"
            intro="Public activity snapshot generated from the GitHub API. See the live calendar on profile."
            trailing={
              <a
                href={`${profile.github}?tab=overview`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] transition hover:text-[var(--color-accent-deep)]"
              >
                Live profile →
              </a>
            }
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="space-y-6">
            <img
              src={snapshotSvg}
              alt={`GitHub snapshot for ${profile.github.replace("https://github.com/", "@")}`}
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl"
            />
            <div className="overflow-x-auto rounded-2xl">
              <img
                src={streakSvg}
                alt="GitHub contribution streak for c0de-break3r"
                loading="lazy"
                decoding="async"
                className="mx-auto min-w-[560px] max-w-full"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
