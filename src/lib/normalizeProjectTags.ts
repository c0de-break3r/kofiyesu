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

/** Case-insensitive key used for filter matching. */
export function tagFilterKey(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Human-readable label for filters and pills. */
export function tagDisplayLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (slugSet.has(lower)) return tagLabels[lower as TagVariant];
  if (labelToSlug.has(lower)) return tagLabels[labelToSlug.get(lower)!];

  return trimmed;
}

/** Canonical stored tag: known tech → slug; categories keep readable label. */
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

  return trimmed;
}

export function normalizeProjectTags(raw: string[] | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of raw ?? []) {
    const normalized = normalizeProjectTag(String(tag));
    if (!normalized) continue;
    const key = tagFilterKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

export function projectHasTag(projectTags: string[] | undefined, filterKey: string): boolean {
  return (projectTags ?? []).some((tag) => tagFilterKey(tag) === filterKey);
}

/** Category/feature tags used for home-page filters (excludes known tech slugs). */
export function isFeatureTag(raw: string): boolean {
  const normalized = normalizeProjectTag(raw);
  if (!normalized) return false;
  return !slugSet.has(normalized.toLowerCase());
}

export function featureTagsOnly(raw: string[] | null | undefined): string[] {
  return normalizeProjectTags(raw).filter(isFeatureTag);
}
