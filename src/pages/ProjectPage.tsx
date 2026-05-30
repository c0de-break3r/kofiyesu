import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { ProjectContent } from "@/types/content";
import { ProjectHero } from "@/features/projects/ProjectHero";
import { ProjectBlocks } from "@/features/projects/ProjectBlocks";
import { NextProject } from "@/features/projects/NextProject";
import { ProjectPreviewVideo } from "@/features/projects/ProjectPreviewVideo";
import { ProjectBackLink } from "@/components/layout/ProjectBackLink";
import { t } from "@/i18n/en";

const projectPageClass =
  "min-h-screen bg-white px-6 py-24 pt-20 text-[var(--text)] md:pt-28 [--bg:#ffffff] [--bg-elevated:#fafafa] [--border:rgba(26,29,33,0.08)] [--text:#1a1d21] [--text-muted:#6b7280]";

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

  const projectPreview = useMemo(
    () => (slug ? previews.find((p) => p.slug === slug) : undefined),
    [slug, previews],
  );

  const nextProject = useMemo(() => {
    if (!slug || !previews.length) return null;
    const idx = previews.findIndex((p) => p.slug === slug);
    if (idx === -1) return previews[0] ?? null;
    return previews[(idx + 1) % previews.length] ?? null;
  }, [slug, previews]);

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
      <main id="main-content" className={projectPageClass}>
        <div className="mx-auto max-w-4xl space-y-6">
          <ProjectBackLink />
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-2/3 rounded bg-[var(--border)]" />
            <div className="h-24 rounded bg-[var(--border)]" />
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !content) {
    return (
      <main id="main-content" className={projectPageClass}>
        <div className="mx-auto max-w-4xl space-y-4">
          <ProjectBackLink />
          <p className="text-lg font-bold">{t("project-not-found")}</p>
          <Link to="/#projects" className="inline-block font-semibold text-[var(--color-accent)]">
            {t("projects")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className={projectPageClass}>
      <div className="mx-auto max-w-4xl">
        <ProjectBackLink className="mb-8" />
        {projectPreview?.previewVideo ? (
          <div className="mb-8">
            <ProjectPreviewVideo
              src={projectPreview.previewVideo}
              poster={projectPreview.thumbnail || undefined}
              title={content.title}
            />
          </div>
        ) : null}
        <ProjectHero content={content} />
        <ProjectBlocks components={content.components} videoBorder={content.videoBorder} />
        {nextProject && slug !== nextProject.slug ? <NextProject project={nextProject} /> : null}
      </div>
    </main>
  );
}
