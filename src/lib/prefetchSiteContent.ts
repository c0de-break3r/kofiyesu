import { fetchJson } from "@/lib/fetchJson";
import type { SiteAboutRow, SiteProjectRow } from "@/types/site";

type ProjectsResponse = { projects?: SiteProjectRow[] } | null;
type AboutResponse = { about?: SiteAboutRow | null } | null;

let projectsRequest: Promise<ProjectsResponse> | null = null;
let aboutRequest: Promise<AboutResponse> | null = null;

/** Start site API fetches as early as possible (call from main.tsx). */
export function prefetchSiteContent() {
  if (typeof window === "undefined") return;

  projectsRequest ??= fetchJson<{ projects?: SiteProjectRow[] }>("/api/site/projects");
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
