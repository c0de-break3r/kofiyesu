#!/usr/bin/env node
/**
 * Generates a zero-dependency themed "GitHub at a glance" SVG from the public
 * GitHub REST API and writes it to src/assets/stats/github-snapshot.svg.
 *
 * Run: bun scripts/fetch-github-snapshot.mjs   (or: npm run stats:snapshot)
 * Re-run whenever you want to refresh the committed snapshot.
 *
 * The output is committed locally so the site keeps CSP img-src 'self'
 * and never depends on rate-limited third-party services at runtime.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const USERNAME = "c0de-break3r";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../src/assets/stats/github-snapshot.svg");

const bg = "#0a0a0b";
const surface = "#111113";
const border = "#232327";
const text = "#f4f4f5";
const muted = "#9ba0a6";
const accent = "#00e5ff";
const mono = "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace";

const esc = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const user = await gh(`/users/${USERNAME}`);
const repos = await gh(`/users/${USERNAME}/repos?per_page=100&sort=pushed`);
const events = await gh(`/users/${USERNAME}/events/public?per_page=100`).catch(() => []);

const now = Date.now();
const days30 = 30 * 24 * 60 * 60 * 1000;
const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
const active30 =
  events.filter((e) => now - Date.parse(e.created_at) < days30).length ?? 0;

const langCounts = {};
for (const r of repos) {
  if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
}
const topLangs = Object.entries(langCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

const lastPush = repos
  .map((r) => r.pushed_at && Date.parse(r.pushed_at))
  .filter(Boolean)
  .sort((a, b) => b - a)[0];
const lastPushLabel = lastPush ? new Date(lastPush).toISOString().slice(0, 10) : "—";

const snapshotDate = new Date().toISOString().slice(0, 10);

const W = 1080;
const H = 330;
const stat = (x, label, value) => `
    <g transform="translate(${x}, 96)">
      <text x="0" y="0" font-family="${mono}" font-size="12" letter-spacing="3" fill="${muted}">${esc(String(label).toUpperCase())}</text>
      <text x="0" y="52" font-family="${mono}" font-weight="700" font-size="52" fill="${text}">${esc(String(value))}</text>
    </g>`;

const langPills = topLangs
  .map(
    ([name, count], i) => `
    <g transform="translate(${24 + i * 205}, 218)">
      <rect width="190" height="36" rx="8" fill="${surface}" stroke="${border}" />
      <text x="16" y="24" font-family="${mono}" font-size="14" fill="${text}">${esc(name)}</text>
      <text x="174" y="24" text-anchor="end" font-family="${mono}" font-size="14" fill="${accent}">${count}</text>
    </g>`,
  )
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub snapshot for ${esc(USERNAME)}">
  <rect width="${W}" height="${H}" rx="16" fill="${bg}" stroke="${border}" />
  <text x="24" y="52" font-family="${mono}" font-size="14" letter-spacing="3" fill="${accent}">GITHUB — @${esc(USERNAME)}</text>
  <text x="${W - 24}" y="52" text-anchor="end" font-family="${mono}" font-size="12" fill="${muted}">snapshot ${esc(snapshotDate)}</text>
  <line x1="24" y1="72" x2="${W - 24}" y2="72" stroke="${border}" />
${stat(24, "Public repos", user.public_repos ?? "—")}${stat(300, "Stars earned", totalStars)}${stat(576, "Followers", user.followers ?? "—")}${stat(852, "Events / 30d", active30)}
  <text x="24" y="206" font-family="${mono}" font-size="12" letter-spacing="3" fill="${muted}">TOP LANGUAGES (REPO COUNT)</text>
${langPills}
  <text x="24" y="296" font-family="${mono}" font-size="12" fill="${muted}">last push ${esc(lastPushLabel)} · full history at github.com/${esc(USERNAME)}</text>
</svg>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);
console.log(`wrote ${OUT}`);
