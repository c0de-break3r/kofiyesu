import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import staticPreviews from "@/content/projects/previews/en";
import { projectModules } from "@/content/projects";
import { fetchJson } from "@/lib/fetchJson";
import { takePrefetchedAbout, takePrefetchedProjects, readCachedProjects, writeCachedProjects } from "@/lib/prefetchSiteContent";
import type { ProjectContent, ProjectPreview } from "@/types/content";
import { rowToContent, rowToPreview, type SiteAboutRow, type SiteProjectRow } from "@/types/site";
import { defaultAbout } from "@/content/about";

type SiteDataSource = "loading" | "api" | "static";

type SiteContentContextValue = {
  previews: ProjectPreview[];
  about: SiteAboutRow | null;
  loaded: boolean;
  load: () => Promise<void>;
  reload: () => Promise<void>;
  getProjectContent: (slug: string) => Promise<ProjectContent | null>;
  aboutText: (
    key: keyof Pick<SiteAboutRow, "job_title" | "about_intro" | "about_tagline" | "location" | "display_name">,
    fallback: string,
  ) => string;
  services: { name: string; info: string }[];
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

function SiteContentProviderInner({ children }: { children: ReactNode }) {
  const cachedProjects = readCachedProjects();
  const [projects, setProjects] = useState<SiteProjectRow[]>(() => cachedProjects ?? []);
  const [about, setAbout] = useState<SiteAboutRow | null>(null);
  const [loaded, setLoaded] = useState(() => cachedProjects !== null);
  const [source, setSource] = useState<SiteDataSource>(() =>
    cachedProjects !== null ? "api" : "loading",
  );

  const load = useCallback(async () => {
    const projectsPromise =
      takePrefetchedProjects() ?? fetchJson<{ projects?: SiteProjectRow[] }>("/api/site/projects");
    const aboutPromise =
      takePrefetchedAbout() ?? fetchJson<{ about?: SiteAboutRow | null }>("/api/site/about");

    void aboutPromise.then((aboutData) => {
      if (aboutData !== null) setAbout(aboutData.about ?? null);
    });

    const projectsData = await projectsPromise;

    if (projectsData !== null) {
      const rows = projectsData.projects ?? [];
      setProjects(rows);
      writeCachedProjects(rows);
      setSource("api");
    } else if (import.meta.env.DEV) {
      setSource("static");
    } else {
      setProjects([]);
      setSource("api");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const previews = useMemo<ProjectPreview[]>(() => {
    if (source === "loading") return [];
    if (source === "api") return projects.map(rowToPreview);
    return [...staticPreviews];
  }, [source, projects]);

  const getProjectContent = useCallback(
    async (slug: string): Promise<ProjectContent | null> => {
      if (source === "api") {
        const row = projects.find((p) => p.slug === slug);
        return row ? rowToContent(row) : null;
      }

      if (source === "static") {
        const mod = projectModules[slug as keyof typeof projectModules];
        if (mod?.default) return mod.default as ProjectContent;
      }

      return null;
    },
    [source, projects],
  );

  const aboutText = useCallback(
    (
      key: keyof Pick<SiteAboutRow, "job_title" | "about_intro" | "about_tagline" | "location" | "display_name">,
      fallback: string,
    ) => (about?.[key] && String(about[key]).trim() ? String(about[key]) : fallback),
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

  const value = useMemo<SiteContentContextValue>(
    () => ({
      previews,
      about,
      loaded,
      load,
      reload: load,
      getProjectContent,
      aboutText,
      services,
    }),
    [previews, about, loaded, load, getProjectContent, aboutText, services],
  );

  return createElement(SiteContentContext.Provider, { value }, children);
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  return createElement(SiteContentProviderInner, null, children);
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}
