import { fetchJson } from "@/lib/fetchJson";
import type { SiteAboutRow, SiteProjectRow } from "@/types/site";

type ProjectsResponse = { projects?: SiteProjectRow[] } | null;
type AboutResponse = { about?: SiteAboutRow | null } | null;

const PROJECTS_CACHE_KEY = "kofiyesu-site-projects";

let projectsRequest: Promise<ProjectsResponse> | null = null;
let aboutRequest: Promise<AboutResponse> | null = null;

type ProjectsCache = { projects: SiteProjectRow[]; at: number };

export function readCachedProjects(): SiteProjectRow[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PROJECTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectsCache;
    return Array.isArray(parsed.projects) ? parsed.projects : null;
  } catch {
    return null;
  }
}

export function writeCachedProjects(projects: SiteProjectRow[]) {
  if (typeof window === "undefined") return;
  try {
    const payload: ProjectsCache = { projects, at: Date.now() };
    sessionStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

/** Start site API fetches as early as possible (call from main.tsx). */
export function prefetchSiteContent() {
  if (typeof window === "undefined") return;

  projectsRequest ??= fetchJson<{ projects?: SiteProjectRow[] }>("/api/site/projects").then(
    (data) => {
      if (data?.projects) writeCachedProjects(data.projects);
      return data;
    },
  );
  aboutRequest ??= fetchJson<{ about?: SiteAboutRow | null }>("/api/site/about");
}

export function takePrefetchedProjects() {
  const request = projectsRequest;
  projectsRequest = null;
  return request;
}

export function takePrefetchedAbout() {
  const request = aboutRequest;
  aboutRequest = null;
  return request;
}
