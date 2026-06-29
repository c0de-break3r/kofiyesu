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
import { staticFeatures } from "@/content/features";
import { projectModules } from "@/content/projects";
import { fetchJson } from "@/lib/fetchJson";
import {
  takePrefetchedAbout,
  takePrefetchedFeatures,
  takePrefetchedProjects,
  readCachedFeatures,
  readCachedProjects,
  writeCachedFeatures,
  writeCachedProjects,
} from "@/lib/prefetchSiteContent";
import type { ProjectContent, ProjectPreview } from "@/types/content";
import { rowToContent, rowToPreview, type SiteAboutRow, type SiteFeatureRow, type SitePricingPackageRow, type SiteProjectRow } from "@/types/site";
import { defaultAbout } from "@/content/about";
import { servicePackages } from "@/content/payments";

type SiteDataSource = "loading" | "api" | "static";

type SiteContentContextValue = {
  previews: ProjectPreview[];
  projects: SiteProjectRow[];
  features: SiteFeatureRow[];
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
  pricingPackages: SitePricingPackageRow[];
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

function staticPricingPackages(): SitePricingPackageRow[] {
  return servicePackages.map((pkg, index) => ({
    id: pkg.id,
    slug: pkg.id,
    title: pkg.title,
    amount_ghs: pkg.amountGhs,
    description: pkg.description,
    highlights: [...pkg.highlights],
    featured: "featured" in pkg && pkg.featured === true,
    sort_order: index,
    published: true,
  }));
}

function SiteContentProviderInner({ children }: { children: ReactNode }) {
  const cachedProjects = readCachedProjects();
  const cachedFeatures = readCachedFeatures();
  const [projects, setProjects] = useState<SiteProjectRow[]>(() => cachedProjects ?? []);
  const [features, setFeatures] = useState<SiteFeatureRow[]>(() => cachedFeatures ?? []);
  const [about, setAbout] = useState<SiteAboutRow | null>(null);
  const [pricingPackages, setPricingPackages] = useState<SitePricingPackageRow[]>([]);
  const [loaded, setLoaded] = useState(() => cachedProjects !== null && cachedFeatures !== null);
  const [source, setSource] = useState<SiteDataSource>(() =>
    cachedProjects !== null && cachedFeatures !== null ? "api" : "loading",
  );

  const load = useCallback(async () => {
    const projectsPromise =
      takePrefetchedProjects() ?? fetchJson<{ projects?: SiteProjectRow[] }>("/api/site/projects");
    const featuresPromise =
      takePrefetchedFeatures() ?? fetchJson<{ features?: SiteFeatureRow[] }>("/api/site/features");
    const aboutPromise =
      takePrefetchedAbout() ?? fetchJson<{ about?: SiteAboutRow | null }>("/api/site/about");
    const pricingPromise =
      fetchJson<{ packages?: SitePricingPackageRow[] }>("/api/site/pricing");

    void aboutPromise.then((aboutData) => {
      if (aboutData !== null) setAbout(aboutData.about ?? null);
    });

    void pricingPromise.then((pricingData) => {
      if (pricingData !== null) {
        const rows = pricingData.packages ?? [];
        setPricingPackages(rows.length ? rows : staticPricingPackages());
      }
    });

    const [projectsData, featuresData] = await Promise.all([projectsPromise, featuresPromise]);

    if (projectsData !== null && featuresData !== null) {
      const rows = projectsData.projects ?? [];
      const featureRows = featuresData.features ?? [];
      setProjects(rows);
      setFeatures(featureRows);
      writeCachedProjects(rows);
      writeCachedFeatures(featureRows);
      setSource("api");
    } else if (import.meta.env.DEV) {
      setSource("static");
    } else {
      setProjects([]);
      setFeatures([]);
      setSource("api");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const previews = useMemo<ProjectPreview[]>(() => {
    if (source === "loading") return [];
    if (source === "api") {
      return [...projects]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map(rowToPreview);
    }
    return [...staticPreviews];
  }, [source, projects]);

  const publishedFeatures = useMemo<SiteFeatureRow[]>(() => {
    if (source === "loading") return [];
    if (source === "api") {
      return [...features]
        .filter((f) => f.published)
        .sort((a, b) => a.sort_order - b.sort_order);
    }
    return [...staticFeatures];
  }, [source, features]);

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
    // Since we don't store services in the database, we always use the default services.
    const list = [...defaultAbout.services];
    return list.map((s) => ({
      name: s.name,
      info: s.info?.trim() || defaultByName[s.name] || "",
    }));
  }, []);

  const publishedPricing = useMemo<SitePricingPackageRow[]>(() => {
    const list = pricingPackages.length ? pricingPackages : staticPricingPackages();
    return [...list]
      .filter((p) => p.published)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [pricingPackages]);

  const value = useMemo<SiteContentContextValue>(
    () => ({
      previews,
      projects,
      features: publishedFeatures,
      about,
      loaded,
      load,
      reload: load,
      getProjectContent,
      aboutText,
      services,
      pricingPackages: publishedPricing,
    }),
    [previews, projects, publishedFeatures, about, loaded, load, getProjectContent, aboutText, services, publishedPricing],
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
