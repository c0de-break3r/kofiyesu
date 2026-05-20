import { ref, computed, readonly } from "vue";
import staticPreviews from "../content/projects/previews";
import { projectModules } from "../content/projects";
import type { ProjectContent, ProjectPreview } from "../content/types";
import {
  type SiteAboutRow,
  type SiteProjectRow,
  rowToContent,
  rowToPreview,
} from "../lib/siteContentTypes";

const projects = ref<SiteProjectRow[]>([]);
const about = ref<SiteAboutRow | null>(null);
const loaded = ref(false);
const loading = ref(false);

let loadPromise: Promise<void> | null = null;

export async function loadSiteContent(force = false) {
  if (loadPromise && !force) return loadPromise;

  loading.value = true;
  loadPromise = (async () => {
    try {
      const [projectsRes, aboutRes] = await Promise.all([
        fetch("/api/site/projects"),
        fetch("/api/site/about"),
      ]);

      if (projectsRes.ok) {
        const data = (await projectsRes.json()) as { projects?: SiteProjectRow[] };
        projects.value = data.projects ?? [];
      }

      if (aboutRes.ok) {
        const data = (await aboutRes.json()) as { about?: SiteAboutRow | null };
        about.value = data.about ?? null;
      }
    } catch (err) {
      console.warn("[site-content] load failed", err);
    } finally {
      loaded.value = true;
      loading.value = false;
    }
  })();

  return loadPromise;
}

export function useSiteContent() {
  const previews = computed<ProjectPreview[]>(() => {
    if (projects.value.length > 0) {
      return projects.value.map(rowToPreview);
    }
    return [...staticPreviews];
  });

  const getProjectContent = async (slug: string): Promise<ProjectContent | null> => {
    const row = projects.value.find((p) => p.slug === slug);
    if (row) return rowToContent(row);

    const mod = projectModules[slug as keyof typeof projectModules];
    if (!mod?.default) return null;
    return mod.default as ProjectContent;
  };

  const aboutText = (key: keyof Pick<SiteAboutRow, "job_title" | "about_intro" | "about_tagline" | "location" | "display_name">, fallback: string) =>
    computed(() => {
      const value = about.value?.[key];
      return value && String(value).trim() ? String(value) : fallback;
    });

  const services = computed(() => {
    const fromDb = about.value?.services?.filter((s) => s?.name?.trim());
    if (fromDb?.length) return fromDb;
    return [
      { name: "Backend Development" },
      { name: "Offensive Security & Pentesting" },
      { name: "Automation & Tooling" },
      { name: "Mobile & Web Software" },
    ];
  });

  return {
    projects: readonly(projects),
    about: readonly(about),
    loaded: readonly(loaded),
    loading: readonly(loading),
    previews,
    services,
    loadSiteContent,
    getProjectContent,
    aboutText,
    refresh: () => loadSiteContent(true),
  };
}
