import { Reveal } from "@/components/ui/Reveal";
import { GitHubContributions } from "@/components/ui/GitHubContributions";
import { GitHubStats } from "@/components/ui/GitHubStats";
import { useGitHubContributions } from "@/lib/githubContributions";

/**
 * GitHub contribution activity: a native-style heatmap with the headline
 * stats (total contributions, current streak, longest streak) beneath it.
 * Fully client-side, theme-aware and responsive.
 */
export function ContributionsSection() {
  const data = useGitHubContributions();

  return (
    <section id="contributions" className="w-full px-6 py-16 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Reveal>
          <GitHubContributions data={data} />
        </Reveal>
        <Reveal delay={0.08}>
          <GitHubStats />
        </Reveal>
      </div>
    </section>
  );
}
