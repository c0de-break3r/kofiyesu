import { useCallback, useEffect, useMemo, useState } from "react";
import staticPreviews from "@/content/projects/previews/en";
import { projectModules } from "@/content/projects";
import { fetchJson } from "@/lib/fetchJson";
import type { ProjectContent, ProjectPreview } from "@/types/content";
import { rowToContent, rowToPreview, type SiteAboutRow, type SiteProjectRow } from "@/types/site";
import { defaultAbout } from "@/content/about";

export function useSiteContent() {
  const [projects, setProjects] = useState<SiteProjectRow[]>([]);
  const [about, setAbout] = useState<SiteAboutRow | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [projectsData, aboutData] = await Promise.all([
      fetchJson<{ projects?: SiteProjectRow[] }>("/api/site/projects"),
      fetchJson<{ about?: SiteAboutRow | null }>("/api/site/about"),
    ]);

    if (projectsData?.projects?.length) setProjects(projectsData.projects);
    if (aboutData?.about) setAbout(aboutData.about);

    setLoaded(true);
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
    const defaultByName = Object.fromEntries(
      defaultAbout.services.map((s) => [s.name, s.info ?? ""]),
    );
    const fromDb = about?.services?.filter((s) => s?.name?.trim());
    const list = fromDb?.length ? fromDb : [...defaultAbout.services];
    return list.map((s) => ({
      name: s.name,
      info: s.info?.trim() || defaultByName[s.name] || "",
    }));
  }, [about]);

  return { previews, about, loaded, load, reload: load, getProjectContent, aboutText, services };
}
