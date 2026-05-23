import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { AdminField, AdminInput, AdminTextarea } from "./AdminField";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSiteContent } from "@/hooks/useSiteContent";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import type { SiteProjectRow } from "@/types/site";

const emptyForm = () => ({
  slug: "",
  title: "",
  theme: "dark" as "light" | "dark",
  tags: "",
  description: "",
  thumbnail_url: "",
  live_url: "",
  source_url: "",
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
    setEditingId(row.id);
    setForm({
      slug: row.slug,
      title: row.title,
      theme: row.theme,
      tags: (row.tags ?? []).join(", "),
      description: row.description ?? "",
      thumbnail_url: row.thumbnail_url ?? "",
      live_url: row.live_url ?? "",
      source_url: row.source_url ?? "",
      published: row.published,
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const onThumbnailPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isCloudinaryConfigured()) {
      setError("Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET");
      return;
    }
    try {
      setSaving(true);
      const url = await uploadImageToCloudinary(file);
      setForm((f) => ({ ...f, thumbnail_url: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
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
        live_url: form.live_url || null,
        source_url: form.source_url || null,
        published: form.published,
        components: [],
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

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    setSaving(true);
    const res = await adminFetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      await load();
      await reload();
    } else {
      setError("Delete failed");
    }
  };

  const set = <K extends keyof ReturnType<typeof emptyForm>>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading projects…</p>;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={startNew}>New project</Button>
        {editingId && (
          <button type="button" onClick={cancelEdit} className="text-sm font-semibold text-[var(--text-muted)]">
            Cancel
          </button>
        )}
      </div>

      {editingId ? (
        <div className="space-y-3 rounded-xl border border-[var(--border)] p-4">
          <AdminField label="Slug">
            <AdminInput value={form.slug} onChange={(e) => set("slug", e.target.value)} disabled={editingId !== "new"} />
          </AdminField>
          <AdminField label="Title">
            <AdminInput value={form.title} onChange={(e) => set("title", e.target.value)} />
          </AdminField>
          <AdminField label="Theme">
            <select
              value={form.theme}
              onChange={(e) => set("theme", e.target.value as "light" | "dark")}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </AdminField>
          <AdminField label="Tags (comma-separated)">
            <AdminInput value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="node, react, postgresql" />
          </AdminField>
          <AdminField label="Description (HTML allowed)">
            <AdminTextarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </AdminField>
          <AdminField label="Thumbnail URL">
            <AdminInput value={form.thumbnail_url} onChange={(e) => set("thumbnail_url", e.target.value)} />
            <input type="file" accept="image/*" onChange={(e) => void onThumbnailPick(e)} className="mt-2 text-xs" />
          </AdminField>
          <AdminField label="Live URL">
            <AdminInput value={form.live_url} onChange={(e) => set("live_url", e.target.value)} />
          </AdminField>
          <AdminField label="Source URL">
            <AdminInput value={form.source_url} onChange={(e) => set("source_url", e.target.value)} />
          </AdminField>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
            Published
          </label>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : editingId === "new" ? "Create project" : "Update project"}
          </Button>
        </div>
      ) : null}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <ul className="space-y-2">
        {projects.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-bold">{p.title}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                /{p.slug}
                {!p.published && " · draft"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => startEdit(p)} className="text-xs font-bold text-[var(--color-accent)]">
                Edit
              </button>
              <button type="button" onClick={() => void remove(p.id)} className="text-xs font-bold text-red-500">
                Del
              </button>
            </div>
          </li>
        ))}
      </ul>

      {projects.length === 0 && !editingId && (
        <p className="text-sm text-[var(--text-muted)]">No DB projects — site uses static content files.</p>
      )}
    </section>
  );
}
