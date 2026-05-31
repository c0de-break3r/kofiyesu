import type { ProjectComponent } from "./projects";

export interface ProjectContent {
  title: string;
  theme: "light" | "dark";
  categoryLabel?: string;
  techStack?: string[];
  description?: string;
  videoBorder?: boolean;
  live?: string;
  source?: string;
  components?: ProjectComponent[];
}

export interface ProjectPreview {
  title: string;
  slug: string;
  thumbnail: string;
  previewVideo?: string;
  description: string;
  categoryId?: string | null;
  categoryLabel?: string;
  sortOrder?: number;
}
