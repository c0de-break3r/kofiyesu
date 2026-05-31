import { useEffect, useState } from "react";
import { AdminActionBar } from "./AdminActionBar";
import { AdminField, AdminInput, AdminTextarea } from "./AdminField";
import { AdminMediaUpload } from "./AdminMediaUpload";
import { ProjectCardPreviewMedia } from "@/features/projects/ProjectCardPreviewMedia";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSiteContent } from "@/hooks/useSiteContent";
import { buildProjectComponents, extractProjectFormFromComponents, mergeProjectComponents } from "@/lib/projectComponents";
import { parseCommaList } from "@/lib/parseCommaList";
import type { SiteFeatureRow, SiteProjectRow } from "@/types/site";

const emptyForm = () => ({
  slug: "",
  title: "",
  category_id: "",
  tech_stack: "",
  description: "",
  thumbnail_url: "",
  preview_video_url: "",
  showcase_video_url: "",
  showcase_video_caption: "",
  body_text: "",
  live_url: "",
  source_url: "",
  sort_order: 0,
  video_border: false,
  published: true,
});

const adminScrollClass =
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [scrollbar-color:color-mix(in_srgb,var(--color-accent)_40%,transparent)_transparent]";

export function AdminProjectsSection() {
  const { adminFetch } = useAdminApi();
  const { reload } = useSiteContent();
  const [projects, setProjects] = useState<SiteProjectRow[]>([]);
  const [features, setFeatures] = useState<SiteFeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const clearStatus = () => {
    setError(null);
    setSuccess(null);
    setInfo(null);
  };

  const flashInfo = (message: string) => {
    setInfo(message);
    setError(null);
    window.setTimeout(() => setInfo(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    const [projectsRes, featuresRes] = await Promise.all([
      adminFetch("/api/admin/projects"),
      adminFetch("/api/admin/features"),
    ]);
    if (projectsRes.ok) {
      const data = (await projectsRes.json()) as { projects: SiteProjectRow[] };
      setProjects(data.projects ?? []);
    }
    if (featuresRes.ok) {
      const data = (await featuresRes.json()) as { features: SiteFeatureRow[] };
      setFeatures(data.features ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const startNew = () => {
    setEditingId("new");
    setForm(emptyForm());
    clearStatus();
  };

  const formFromRow = (row: SiteProjectRow) => {
    const extracted = extractProjectFormFromComponents(row.components ?? []);
    return {
      slug: row.slug,
      title: row.title,
      category_id: row.category_id ?? "",
      tech_stack: (row.tech_stack ?? []).join(", "),
      description: row.description ?? "",
      thumbnail_url: row.thumbnail_url ?? "",
      preview_video_url: row.preview_video_url ?? "",
      showcase_video_url: row.showcase_video_url ?? extracted.showcase_video_url,
      showcase_video_caption: row.showcase_video_caption ?? extracted.showcase_video_caption,
      body_text: extracted.body_text,
      live_url: row.live_url ?? "",
      source_url: row.source_url ?? "",
      sort_order: row.sort_order ?? 0,
      video_border: row.video_border,
      published: row.published,
    };
  };

  const startEdit = (row: SiteProjectRow) => {
    setEditingId(row.id);
    setForm(formFromRow(row));
    clearStatus();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    clearStatus();
  };

  const save = async () => {
    if (!form.slug.trim() || !form.title.trim()) {
      setError("Slug and title are required.");
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const existingComponents =
        editingId !== "new" ? projects.find((p) => p.id === editingId)?.components : undefined;

      const payload = {
        slug: form.slug,
        title: form.title,
        category_id: form.category_id || null,
        tech_stack: parseCommaList(form.tech_stack),
        description: form.description,
        thumbnail_url: form.thumbnail_url || null,
        preview_video_url: form.preview_video_url || null,
        showcase_video_url: form.showcase_video_url || null,
        showcase_video_caption: form.showcase_video_caption || null,
        live_url: form.live_url || null,
        source_url: form.source_url || null,
        video_border: form.video_border,
        sort_order: form.sort_order,
        published: form.published,
        components:
          editingId === "new"
            ? buildProjectComponents({
                showcase_video_url: form.showcase_video_url,
                showcase_video_caption: form.showcase_video_caption,
                body_text: form.body_text,
              })
            : mergeProjectComponents(existingComponents ?? [], {
                showcase_video_url: form.showcase_video_url,
                showcase_video_caption: form.showcase_video_caption,
                body_text: form.body_text,
              }),
      };

      const isNew = editingId === "new";
      const res = await adminFetch(
        isNew ? "/api/admin/projects" : `/api/admin/projects?id=${editingId}`,
        {
          method: isNew ? "POST" : "PATCH",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }

      const data = (await res.json()) as { project?: SiteProjectRow };
      await load();
      await reload();

      if (data.project) {
        if (isNew) setEditingId(data.project.id);
        setForm(formFromRow(data.project));
      }

      setSuccess(isNew ? "Project created successfully." : "Project saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const res = await adminFetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      await load();
      await reload();
      if (editingId === id) cancelEdit();
      setSuccess(`“${title}” deleted successfully.`);
    } else {
      setError("Delete failed");
    }
  };

  const deleteEditing = () => {
    if (editingId && editingId !== "new") {
      const row = projects.find((p) => p.id === editingId);
      if (row) void remove(row.id, row.title);
    }
  };

  const set = <K extends keyof ReturnType<typeof emptyForm>>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (loading) {
    return (
      <div className="p-4 text-sm text-[var(--text-muted)] md:p-5">Loading projects…</div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div
        className={`${adminScrollClass} p-4 md:p-5 ${editingId ? "pb-28" : ""}`}
        data-lenis-prevent
        data-lenis-prevent-wheel
      >
        <div className="space-y-5">
        <div>
          <h2 className="text-lg font-black">Selected projects</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Add, edit, or delete portfolio projects. Upload a thumbnail and optional short preview video for the grid.
            Add a showcase video for the project detail page.
          </p>
        </div>

        {editingId ? (
          <div className="space-y-4 rounded-xl border border-[var(--border)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">{editingId === "new" ? "Create project" : "Edit project"}</p>
              {editingId !== "new" ? (
                <a
                  href={`/project/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[var(--color-accent)] hover:underline"
                >
                  View project page ↗
                </a>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Slug (URL)">
                <AdminInput
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  disabled={editingId !== "new"}
                  placeholder="my-project"
                />
              </AdminField>
              <AdminField label="Sort order">
                <AdminInput
                  type="number"
                  value={String(form.sort_order)}
                  onChange={(e) => set("sort_order", Number(e.target.value) || 0)}
                />
              </AdminField>
            </div>

            <AdminField label="Title">
              <AdminInput value={form.title} onChange={(e) => set("title", e.target.value)} />
            </AdminField>

            <AdminField label="Short description (card & hero)">
              <AdminTextarea
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="HTML allowed: <br/> for line breaks"
              />
            </AdminField>

            <AdminMediaUpload
              label="Thumbnail image"
              accept="image/*"
              value={form.thumbnail_url}
              onChange={(url) => set("thumbnail_url", url)}
              onError={setError}
              onSuccess={flashInfo}
              previewType="image"
            />

            <AdminMediaUpload
              label="Preview video (short clip for project grid)"
              hint="Optional. Shown on hover in Selected Work. MP4 or WebM, keep under ~15s for best UX."
              accept="video/mp4,video/webm,video/quicktime,video/*"
              uploadAs="video"
              value={form.preview_video_url}
              onChange={(url) => set("preview_video_url", url)}
              onError={setError}
              onSuccess={flashInfo}
              previewType="video"
            />

            <AdminMediaUpload
              label="Showcase video (project page)"
              hint="Main video on the project detail page (below the hero). MP4 or WebM recommended."
              accept="video/mp4,video/webm,video/quicktime,video/*"
              uploadAs="video"
              value={form.showcase_video_url}
              onChange={(url) => set("showcase_video_url", url)}
              onError={setError}
              onSuccess={flashInfo}
              previewType="video"
            />

            {(form.thumbnail_url || form.preview_video_url || form.showcase_video_url) && (
              <div className="space-y-4 rounded-xl border border-[var(--border)] p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Media preview
                </p>

                {(form.thumbnail_url || form.preview_video_url) && (
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)]">
                      Grid card (Selected Work)
                    </p>
                    <div className="group mt-2 max-w-sm overflow-hidden rounded-xl border border-[var(--border)]">
                      <ProjectCardPreviewMedia
                        title={form.title || "Project"}
                        thumbnail={form.thumbnail_url || undefined}
                        previewVideo={form.preview_video_url || undefined}
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                      {form.preview_video_url
                        ? "Hover (or tap on mobile) to play the short preview clip."
                        : "Add a preview video above for hover playback on the home grid."}
                    </p>
                  </div>
                )}

                {form.showcase_video_url ? (
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)]">
                      Showcase video (project page)
                    </p>
                    <video
                      src={form.showcase_video_url}
                      controls
                      playsInline
                      preload="metadata"
                      className="mt-2 max-h-52 w-full rounded-xl border border-[var(--border)] bg-black/5 object-contain"
                    />
                    {form.showcase_video_caption ? (
                      <p className="mt-2 text-xs text-[var(--text-muted)]">{form.showcase_video_caption}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            <AdminField label="Showcase video caption">
              <AdminInput
                value={form.showcase_video_caption}
                onChange={(e) => set("showcase_video_caption", e.target.value)}
              />
            </AdminField>

            <AdminField label="What I built (project page body)">
              <AdminTextarea
                rows={4}
                value={form.body_text}
                onChange={(e) => set("body_text", e.target.value)}
              />
            </AdminField>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Live URL">
                <AdminInput value={form.live_url} onChange={(e) => set("live_url", e.target.value)} />
              </AdminField>
              <AdminField label="Source URL">
                <AdminInput value={form.source_url} onChange={(e) => set("source_url", e.target.value)} />
              </AdminField>
            </div>

            <AdminField label="Category">
              <select
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm font-semibold"
              >
                <option value="">Uncategorized</option>
                {features.map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                One category per project. Manage filter options in the Features tab.
              </p>
            </AdminField>

            <AdminField label="Tech stack (comma-separated, shown on project page)">
              <AdminInput
                value={form.tech_stack}
                onChange={(e) => set("tech_stack", e.target.value)}
                placeholder="Node.js, PostgreSQL, React, Express.js"
              />
            </AdminField>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.video_border}
                  onChange={(e) => set("video_border", e.target.checked)}
                />
                Video border
              </label>
            </div>
          </div>
        ) : null}

        {!editingId ? (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3"
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--border)]">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-[var(--text-muted)]">
                      No img
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.title}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    /project/{p.slug}
                    {p.category?.label ? ` · ${p.category.label}` : ""}
                    {!p.published && " · draft"}
                    {p.preview_video_url && " · preview video"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="text-xs font-bold text-[var(--color-accent)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(p.id, p.title)}
                    className="text-xs font-bold text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {projects.length === 0 && !editingId && (
          <p className="text-sm text-[var(--text-muted)]">
            No projects in the database yet — the site uses static files until you create one here.
          </p>
        )}
        </div>
      </div>

      <AdminActionBar
        error={error}
        success={success}
        info={info}
        saving={saving}
        onSave={() => void (editingId ? save() : startNew())}
        saveLabel={editingId ? (editingId === "new" ? "Create" : "Save project") : "New project"}
        onDelete={editingId && editingId !== "new" ? deleteEditing : undefined}
        onCancel={editingId ? cancelEdit : undefined}
        onDismissError={() => setError(null)}
        onDismissSuccess={() => setSuccess(null)}
        onDismissInfo={() => setInfo(null)}
      />
    </section>
  );
}
