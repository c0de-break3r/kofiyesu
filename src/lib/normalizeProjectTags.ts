import { tagLabels, type TagVariant } from "@/lib/tagVariants";

const slugSet = new Set<string>(Object.keys(tagLabels));

const labelToSlug = new Map<string, TagVariant>(
  Object.entries(tagLabels).map(([slug, label]) => [label.toLowerCase(), slug as TagVariant]),
);

const aliases: Record<string, TagVariant> = {
  "node.js": "node",
  nodejs: "node",
  postgres: "postgresql",
  "postgre sql": "postgresql",
  js: "javascript",
  ts: "javascript",
  "next.js": "next",
  nextjs: "next",
  "react.js": "react",
  "three.js": "three",
  threejs: "three",
};

/** Map admin input (slug or display name) to a filter slug when possible. */
export function normalizeProjectTag(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (slugSet.has(lower)) return lower;
  if (labelToSlug.has(lower)) return labelToSlug.get(lower)!;
  if (aliases[lower]) return aliases[lower];

  const compact = lower.replace(/\s+/g, "").replace(/\./g, "");
  if (slugSet.has(compact)) return compact;
  if (aliases[compact]) return aliases[compact];

  return lower.replace(/\s+/g, "-");
}

export function normalizeProjectTags(raw: string[] | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of raw ?? []) {
    const normalized = normalizeProjectTag(String(tag));
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      out.push(normalized);
    }
  }
  return out;
}
