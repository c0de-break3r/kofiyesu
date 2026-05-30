import { normalizeProjectTags, tagFilterKey } from "@/lib/normalizeProjectTags";

export type ProjectFeature = {
  id: string;
  label: string;
  match: string[];
};

/** Canonical portfolio features used for project filters. */
export const PROJECT_FEATURES: ProjectFeature[] = [
  {
    id: "web-applications",
    label: "Web Applications",
    match: [
      "web applications",
      "web application",
      "web-applications",
      "web-application",
      "web app",
      "web apps",
      "web based applications",
      "web-based applications",
    ],
  },
  {
    id: "mobile-applications",
    label: "Mobile Applications",
    match: [
      "mobile applications",
      "mobile application",
      "mobile-applications",
      "mobile-application",
      "mobile app",
      "mobile apps",
    ],
  },
  {
    id: "recon-automation-tools",
    label: "Recon Automation Tools",
    match: [
      "recon automation tools",
      "recon automation tool",
      "recon-automation-tools",
      "recon automation",
      "recon tools",
    ],
  },
];

function normalizeFeatureToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

function featureTokensEqual(a: string, b: string): boolean {
  const left = normalizeFeatureToken(a);
  const right = normalizeFeatureToken(b);
  if (left === right) return true;

  const singular = (value: string) => (value.endsWith("s") ? value.slice(0, -1) : value);
  if (singular(left) === singular(right)) return true;

  return left.includes(right) || right.includes(left);
}

function tagMatchesFeaturePattern(tag: string, pattern: string): boolean {
  return featureTokensEqual(tag, pattern);
}

/** True when any project tag matches a canonical feature definition. */
export function projectMatchesFeature(projectTags: string[] | undefined, featureId: string): boolean {
  const feature = PROJECT_FEATURES.find((entry) => entry.id === featureId);
  if (!feature) {
    const keys = normalizeProjectTags(projectTags).map(tagFilterKey);
    return keys.includes(featureId);
  }

  const tagKeys = normalizeProjectTags(projectTags).map(tagFilterKey);
  return tagKeys.some((tag) => feature.match.some((pattern) => tagMatchesFeaturePattern(tag, pattern)));
}

export function listMatchingFeatureIds(projectTags: string[] | undefined): string[] {
  return PROJECT_FEATURES.filter((feature) => projectMatchesFeature(projectTags, feature.id)).map(
    (feature) => feature.id,
  );
}

export function featureLabel(featureId: string): string {
  return PROJECT_FEATURES.find((feature) => feature.id === featureId)?.label ?? featureId;
}
