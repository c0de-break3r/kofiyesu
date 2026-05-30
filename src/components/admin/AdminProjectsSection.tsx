import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AdminField, AdminInput, AdminTextarea } from "./AdminField";
import { AdminMediaUpload } from "./AdminMediaUpload";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSiteContent } from "@/hooks/useSiteContent";
import { buildProjectComponents, extractProjectFormFromComponents } from "@/lib/projectComponents";
import type { SiteProjectRow } from "@/types/site";

const emptyForm = () => ({
  slug: "",
  title: "",
  theme: "dark" as "light" | "dark",
  tags: "",
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

export function AdminProjectsSection() {
  const { adminFetch } = useAdminApi();
  const { reload } = useSiteContent();
  const [projects, setProjects] = useState<SiteProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const load = async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/projects");
    if (res.ok) {
      const data = (await res.json()) as { projects: SiteProjectRow[] };
      setProjects(data.projects ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const startNew = () => {
    setEditingId("new");
    setForm(emptyForm());
    setError(null);
  };

  const startEdit = (row: SiteProjectRow) => {
    const extracted = extractProjectFormFromComponents(row.components ?? []);
    setEditingId(row.id);
    setForm({
      slug: row.slug,
      title: row.title,
      theme: row.theme,
      tags: (row.tags ?? []).join(", "),
      description: row.description ?? "",
      thumbnail_url: row.thumbnail_url ?? "",
      preview_video_url: row.preview_video_url ?? "",
      showcase_video_url: extracted.showcase_video_url,
      showcase_video_caption: extracted.showcase_video_caption,
      body_text: extracted.body_text,
      live_url: row.live_url ?? "",
      source_url: row.source_url ?? "",
      sort_order: row.sort_order ?? 0,
      video_border: row.video_border,
      published: row.published,
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const save = async () => {
    if (!form.slug.trim() || !form.title.trim()) {
      setError("Slug and title are required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        theme: form.theme,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        description: form.description,
        thumbnail_url: form.thumbnail_url || null,
        preview_video_url: form.preview_video_url || null,
        live_url: form.live_url || null,
        source_url: form.source_url || null,
        video_border: form.video_border,
        sort_order: form.sort_order,
        published: form.published,
        components: buildProjectComponents({
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

      await load();
      await reload();
      cancelEdit();
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
    const res = await adminFetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      await load();
      await reload();
      if (editingId === id) cancelEdit();
    } else {
      setError("Delete failed");
    }
  };

  const set = <K extends keyof ReturnType<typeof emptyForm>>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading projects…</p>;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-black">Selected projects</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Add, edit, or delete portfolio projects. Upload a thumbnail and optional short preview video for the grid.
          Add a showcase video for the project detail page.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={startNew}>+ New project</Button>
        {editingId ? (
          <button type="button" onClick={cancelEdit} className="text-sm font-semibold text-[var(--text-muted)]">
            Cancel
          </button>
        ) : null}
      </div>

      {editingId ? (
        <div className="max-h-[70vh] space-y-4 overflow-y-auto rounded-xl border border-[var(--border)] p-4">
          <p className="text-sm font-bold">{editingId === "new" ? "Create project" : "Edit project"}</p>

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
            previewType="image"
          />

          <AdminMediaUpload
            label="Preview video (short clip for project grid)"
            hint="Optional. Shown on hover in Selected Work. Keep under ~15s for best UX."
            accept="video/*,image/*"
            value={form.preview_video_url}
            onChange={(url) => set("preview_video_url", url)}
            onError={setError}
            previewType="video"
          />

          <AdminMediaUpload
            label="Showcase video (project page)"
            hint="Main video on the project detail page."
            accept="video/*"
            value={form.showcase_video_url}
            onChange={(url) => set("showcase_video_url", url)}
            onError={setError}
            previewType="video"
          />

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

          <AdminField label="Theme">
            <select
              value={form.theme}
              onChange={(e) => set("theme", e.target.value as "light" | "dark")}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </AdminField>

          <AdminField label="Tags (comma-separated)">
            <AdminInput
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="react, node, postgresql"
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

          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : editingId === "new" ? "Create project" : "Save changes"}
          </Button>
        </div>
      ) : null}

      {error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p> : null}

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

      {projects.length === 0 && !editingId && (
        <p className="text-sm text-[var(--text-muted)]">
          No projects in the database yet — the site uses static files until you create one here.
        </p>
      )}
    </section>
  );
}
