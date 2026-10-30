/**
 * The three headline GitHub stats — Total Contributions, Current Streak and
 * Longest Streak — rendered with the real GitHub Streak Stats card from
 * streak-stats.demolab.com (the exact link provided).
 */
const STREAK_STATS_URL =
  "https://streak-stats.demolab.com?user=c0de-break3r&hide_border=true&background=0B1020&ring=A855F7&fire=FF4EC4&currStreakLabel=00E5FF&sideLabels=E2E8F0&dates=94A3B8&stroke=A855F7";

export function GitHubStats() {
  return (
    <div className="ghstats">
      <img
        src={STREAK_STATS_URL}
        alt="GitHub streak stats for c0de-break3r — total contributions, current streak and longest streak"
        loading="lazy"
        decoding="async"
        className="ghstats__image"
      />
    </div>
  );
}
