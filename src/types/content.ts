import type { ProjectComponent } from "./projects";

export interface ProjectContent {
  title: string;
  theme: "light" | "dark";
  tags: string[];
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
  tags?: string[];
  sortOrder?: number;
}
