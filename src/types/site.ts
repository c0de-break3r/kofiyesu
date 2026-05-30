import type { ProjectComponent } from "./projects";
import { normalizeProjectTags } from "@/lib/normalizeProjectTags";
import type { ProjectContent, ProjectPreview } from "./content";

export interface SiteProjectRow {
  id: string;
  slug: string;
  title: string;
  theme: "light" | "dark";
  tags: string[];
  tech_stack: string[];
  description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  live_url: string | null;
  source_url: string | null;
  video_border: boolean;
  components: ProjectComponent[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
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
  tags: normalizeProjectTags(row.tags as string[]),
  sortOrder: row.sort_order ?? 0,
});

export const rowToContent = (row: SiteProjectRow): ProjectContent => ({
  title: row.title,
  theme: "light",
  tags: normalizeProjectTags(row.tags as string[]),
  techStack: (row.tech_stack ?? []).filter(Boolean),
  description: row.description ?? undefined,
  videoBorder: row.video_border,
  live: row.live_url ?? undefined,
  source: row.source_url ?? undefined,
  components: row.components ?? [],
});
