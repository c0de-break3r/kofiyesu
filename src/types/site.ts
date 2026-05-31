import type { ProjectComponent } from "./projects";
import type { ProjectContent, ProjectPreview } from "./content";
import { mergeProjectComponents, extractProjectFormFromComponents } from "@/lib/projectComponents";

function normalizeComponents(raw: unknown): ProjectComponent[] {
  return Array.isArray(raw) ? (raw as ProjectComponent[]) : [];
}

function showcaseFromRow(row: SiteProjectRow) {
  const fromColumns = {
    showcase_video_url: row.showcase_video_url?.trim() ?? "",
    showcase_video_caption: row.showcase_video_caption?.trim() ?? "",
  };
  if (fromColumns.showcase_video_url) return fromColumns;
  return extractProjectFormFromComponents(normalizeComponents(row.components));
}

export interface SiteFeatureRow {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteProjectRow {
  id: string;
  slug: string;
  title: string;
  theme: "light" | "dark";
  category_id: string | null;
  category: SiteFeatureRow | null;
  tech_stack: string[];
  description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  showcase_video_url: string | null;
  showcase_video_caption: string | null;
  live_url: string | null;
  source_url: string | null;
  video_border: boolean;
  components: ProjectComponent[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SitePricingPackageRow {
  id: string;
  slug: string;
  title: string;
  amount_ghs: number;
  description: string;
  highlights: string[];
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteService {
  name: string;
  info?: string;
}

export interface SiteAboutRow {
  id: string;
  display_name: string | null;
  job_title: string | null;
  about_intro: string | null;
  about_tagline: string | null;
  location: string | null;
  services: SiteService[];
  updated_at: string;
}

export const rowToPreview = (row: SiteProjectRow): ProjectPreview => ({
  title: row.title,
  slug: row.slug,
  thumbnail: row.thumbnail_url ?? "",
  previewVideo: row.preview_video_url ?? undefined,
  description: row.description?.replace(/<[^>]+>/g, " ").slice(0, 120) ?? "",
  categoryId: row.category_id,
  categoryLabel: row.category?.label ?? undefined,
  sortOrder: row.sort_order ?? 0,
});

export const rowToContent = (row: SiteProjectRow): ProjectContent => {
  const showcase = showcaseFromRow(row);
  const components = mergeProjectComponents(normalizeComponents(row.components), showcase);

  return {
    title: row.title,
    theme: "light",
    categoryLabel: row.category?.label ?? undefined,
    techStack: (row.tech_stack ?? []).filter(Boolean),
    description: row.description ?? undefined,
    videoBorder: row.video_border,
    live: row.live_url ?? undefined,
    source: row.source_url ?? undefined,
    components,
  };
};
