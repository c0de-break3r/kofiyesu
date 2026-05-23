export type { ProjectContent, ProjectPreview } from "@/types/content";
export type { TagVariant } from "@/lib/tagVariants";
export type { ProjectComponent } from "@/types/projects";

import { projectIds } from "./projects/index";

export type ProjectId = (typeof projectIds)[number];

export interface SkillContent {
  name: string;
  bullets: string[];
}
