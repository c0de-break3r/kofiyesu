/**
 * Shared content types for the portfolio.
 *
 * All site content lives in `src/data/*` and renders directly — there is no
 * CMS, API, or database. To add a project or experience entry, append a typed
 * object to the relevant array in `src/data`. See README for instructions.
 */

export const PROJECT_CATEGORIES = [
  { id: "web", label: "Web Applications" },
  { id: "ai", label: "AI & Automation" },
  { id: "security", label: "Cybersecurity" },
  { id: "mobile", label: "Mobile" },
] as const;

export type CategoryId = (typeof PROJECT_CATEGORIES)[number]["id"];

export const PROJECT_STATUSES = [
  "live",
  "completed",
  "beta",
  "prototype",
  "in-development",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  live: "Live",
  completed: "Completed",
  beta: "Beta",
  prototype: "Prototype",
  "in-development": "In development",
};

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface Project {
  slug: string;
  title: string;
  category: CategoryId;
  status: ProjectStatus;
  /** Short one/two-line summary shown on cards. */
  summary: string;
  /** Optional year the project was built / shipped (only when verified). */
  year?: number;
  /** Card + hero screenshot. Omit to render a clean title fallback. */
  thumbnail?: string;
  /** Large hero screenshot on the detail page (falls back to thumbnail). */
  hero?: ProjectImage;
  /** Brief overview paragraph(s) shown first on the detail page. */
  overview?: string;
  /** The problem or idea behind the project. */
  problem?: string;
  /** Core functionality / what it does. */
  features?: string[];
  /** My specific contribution. */
  contribution?: string;
  /** Technology stack. */
  stack?: string[];
  /** Additional screenshots for the detail gallery. */
  gallery?: ProjectImage[];
  liveUrl?: string;
  sourceUrl?: string;
  /** Manual ordering; lower shows first. */
  sortOrder?: number;
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  role: string;
  /** Display period. Keep honest — do not fabricate ranges. */
  period: string;
  location?: string;
  summary?: string;
  responsibilities: string[];
  technologies?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  /** 1–2 sentence excerpt shown on the card. */
  excerpt: string;
  /** ISO date string (YYYY-MM-DD) for display sorting. */
  date: string;
  /** Read time estimate (minutes). */
  readingTime?: number;
  /** Tag / category label. */
  tag?: string;
  /** External URL where the full post lives (e.g. dev.to, personal blog). */
  url?: string;
}
