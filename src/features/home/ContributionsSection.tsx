import { Reveal } from "@/components/ui/Reveal";
import streakSvg from "@/assets/stats/streak.svg";

/**
 * Contribution streak card (total contributions, current streak, longest
 * streak) as a locally committed asset so the site works offline and keeps
 * CSP img-src 'self'. Regenerate with `npm run stats:snapshot`.
 */
export function ContributionsSection() {
  return (
    <section id="contributions" className="w-full px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="overflow-x-auto rounded-2xl">
            <img
              src={streakSvg}
              alt="GitHub contribution streak for c0de-break3r"
              loading="lazy"
              decoding="async"
              className="mx-auto min-w-[560px] max-w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
