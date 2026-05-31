import type { SiteFeatureRow } from "@/types/site";

/** Static features for local dev when API is unavailable. */
export const staticFeatures: SiteFeatureRow[] = [
  {
    id: "static-web-application",
    slug: "web-application",
    label: "Web Application",
    sort_order: 0,
    published: true,
  },
  {
    id: "static-mobile-application",
    slug: "mobile-application",
    label: "Mobile Application",
    sort_order: 1,
    published: true,
  },
  {
    id: "static-recon-automation-tool",
    slug: "recon-automation-tool",
    label: "Recon Automation Tool",
    sort_order: 2,
    published: true,
  },
];

export const staticFeatureBySlug = Object.fromEntries(staticFeatures.map((f) => [f.slug, f]));
