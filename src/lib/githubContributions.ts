import { useMemo } from "react";

export type ContributionDay = { date: Date; count: number; level: number };
export type ContributionWeek = ContributionDay[];
export type ContributionData = {
  weeks: ContributionWeek[];
  total: number;
  currentStreak: number;
  longestStreak: number;
};

/** Deterministic PRNG so the generated history is stable across renders. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

/**
 * Builds a GitHub-shaped year of contribution activity entirely in the
 * browser (no network, CSP-safe). Because there is no backend to read the
 * live GitHub API, the counts are generated deterministically — the shape and
 * stats are illustrative, not the real history.
 */
export function generateContributions(seed = 20260531): ContributionData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start on the Sunday 52 weeks before the current week → 53 full columns.
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - 7 * 52);

  const rng = makeRng(seed);
  const weeks: ContributionWeek[] = [];
  let total = 0;

  for (let w = 0; w < 53; w++) {
    const col: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      let count = 0;
      if (date <= today) {
        const weekend = d === 0 || d === 6;
        const r = rng();
        count = r < 0.3 ? 0 : Math.floor(r * r * (weekend ? 9 : 18));
      }
      total += count;
      col.push({ date, count, level: levelFor(count) });
    }
    weeks.push(col);
  }

  const flat = weeks.flat().filter((x) => x.date <= today);
  let longestStreak = 0;
  let run = 0;
  for (const day of flat) {
    if (day.count > 0) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }
  let currentStreak = 0;
  for (let i = flat.length - 1; i >= 0; i--) {
    if (flat[i].count > 0) currentStreak += 1;
    else break;
  }

  return { weeks, total, currentStreak, longestStreak };
}

/** Memoized accessor shared by the heatmap and the stats card. */
export function useGitHubContributions(): ContributionData {
  return useMemo(() => generateContributions(), []);
}
