import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { ProjectContent } from "@/types/content";
import { ProjectHero } from "@/features/projects/ProjectHero";
import { ProjectBlocks } from "@/features/projects/ProjectBlocks";
import { NextProject } from "@/features/projects/NextProject";
import { Footer } from "@/components/layout/Footer";
import { ProjectBackFab } from "@/components/layout/ProjectBackFab";
import { t } from "@/i18n/en";

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getProjectContent, previews } = useSiteContent();
  const [content, setContent] = useState<ProjectContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    void getProjectContent(slug).then((data) => {
      setContent(data);
      setNotFound(!data);
      setLoading(false);
    });
  }, [slug, getProjectContent]);

  const nextProject = useMemo(() => {
    if (!slug || !previews.length) return null;
    const idx = previews.findIndex((p) => p.slug === slug);
    if (idx === -1) return previews[0] ?? null;
    return previews[(idx + 1) % previews.length] ?? null;
  }, [slug, previews]);

  const isLight = content?.theme === "light";

  const projectDescription = useMemo(
    () => content?.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
    [content?.description],
  );

  useDocumentMeta({
    title: content ? `${content.title} — Obed Prince Kofi Yesu` : undefined,
    description: projectDescription,
    canonicalPath: slug ? `/project/${slug}` : "/",
  });

  if (loading) {
    return (
      <>
        <ProjectBackFab />
        <main id="main-content" className="min-h-screen px-6 py-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4">
          <div className="h-4 w-24 rounded bg-[var(--border)]" />
          <div className="h-12 w-2/3 rounded bg-[var(--border)]" />
          <div className="h-24 rounded bg-[var(--border)]" />
        </div>
      </main>
      </>
    );
  }

  if (notFound || !content) {
    return (
      <>
        <ProjectBackFab />
        <main id="main-content" className="min-h-screen px-6 py-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-4xl">
          <p className="text-lg font-bold">{t("project-not-found")}</p>
          <Link to="/#projects" className="mt-4 inline-block font-semibold text-[var(--color-accent)]">
            {t("back-to-work")}
          </Link>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
      <ProjectBackFab />
      <main
        id="main-content"
        className={`min-h-screen px-6 py-24 pt-20 md:pt-28 ${
        isLight ? "bg-zinc-100 text-zinc-900 [--text-muted:#52525b]" : "bg-zinc-950 text-zinc-50"
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <Link
          to="/#projects"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)] transition hover:opacity-80"
        >
          ← {t("back-to-work")}
        </Link>

        <div className="mt-8">
          <ProjectHero content={content} />
          <ProjectBlocks components={content.components} videoBorder={content.videoBorder} />
          {nextProject && slug !== nextProject.slug ? <NextProject project={nextProject} /> : null}
        </div>
      </div>
      <Footer withSocial={false} />
    </main>
    </>
  );
}
