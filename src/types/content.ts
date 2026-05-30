import type { TagVariant } from "@/lib/tagVariants";
import type { ProjectComponent } from "./projects";

export type { TagVariant };

export interface ProjectContent {
  title: string;
  theme: "light" | "dark";
  tags: TagVariant[];
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
  tags?: TagVariant[];
}
