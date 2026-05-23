import { useCallback, useEffect, useMemo, useState } from "react";
import staticPreviews from "@/content/projects/previews/en";
import { projectModules } from "@/content/projects";
import type { ProjectContent, ProjectPreview } from "@/types/content";
import { rowToContent, rowToPreview, type SiteAboutRow, type SiteProjectRow } from "@/types/site";

export function useSiteContent() {
  const [projects, setProjects] = useState<SiteProjectRow[]>([]);
  const [about, setAbout] = useState<SiteAboutRow | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const [projectsRes, aboutRes] = await Promise.all([
        fetch("/api/site/projects"),
        fetch("/api/site/about"),
      ]);

      if (projectsRes.ok) {
        const data = (await projectsRes.json()) as { projects?: SiteProjectRow[] };
        setProjects(data.projects ?? []);
      }

      if (aboutRes.ok) {
        const data = (await aboutRes.json()) as { about?: SiteAboutRow | null };
        setAbout(data.about ?? null);
      }
    } catch (err) {
      console.warn("[site-content] load failed", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const previews = useMemo<ProjectPreview[]>(() => {
    if (projects.length > 0) return projects.map(rowToPreview);
    return [...staticPreviews];
  }, [projects]);

  const getProjectContent = useCallback(
    async (slug: string): Promise<ProjectContent | null> => {
      const row = projects.find((p) => p.slug === slug);
      if (row) return rowToContent(row);

      const mod = projectModules[slug as keyof typeof projectModules];
      if (!mod?.default) return null;
      return mod.default as ProjectContent;
    },
    [projects],
  );

  const aboutText = useCallback(
    (key: keyof Pick<SiteAboutRow, "job_title" | "about_intro" | "about_tagline" | "location" | "display_name">, fallback: string) =>
      about?.[key] && String(about[key]).trim() ? String(about[key]) : fallback,
    [about],
  );

  const services = useMemo(() => {
    const fromDb = about?.services?.filter((s) => s?.name?.trim());
    if (fromDb?.length) return fromDb;
    return [
      { name: "Backend Development" },
      { name: "Web Application Pentesting" },
      { name: "Automation & Recon Tooling" },
      { name: "Mobile & Web Software" },
    ];
  }, [about]);

  return { previews, about, loaded, load, reload: load, getProjectContent, aboutText, services };
}
