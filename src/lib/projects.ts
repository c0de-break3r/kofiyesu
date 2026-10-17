import { projects } from "@/data/projects";
import { PROJECT_CATEGORIES, type CategoryId, type Project } from "@/data/types";

/** All projects in display order. */
export function getAllProjects(): Project[] {
  return [...projects].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title),
  );
}

/** Projects in a category, or all when `category` is null. */
export function getProjectsByCategory(category: CategoryId | null): Project[] {
  const all = getAllProjects();
  return category ? all.filter((p) => p.category === category) : all;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The most recent projects for the home preview. */
export function getSelectedProjects(limit = 3): Project[] {
  return getAllProjects().slice(0, limit);
}

export function getCategoryLabel(id: CategoryId): string {
  return PROJECT_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Previous/next project for detail-page navigation. */
export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const all = getAllProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : all[all.length - 1] ?? null,
    next: idx < all.length - 1 ? all[idx + 1] : all[0] ?? null,
  };
}
