import { useEffect, useState } from "react";
import { AdminActionBar } from "./AdminActionBar";
import { AdminStatusMessage } from "./AdminStatusMessage";
import { AdminField, AdminInput } from "./AdminField";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { SiteFeatureRow } from "@/types/site";

const emptyForm = () => ({
  label: "",
  slug: "",
  sort_order: 0,
  published: true,
});

export function AdminFeaturesSection() {
  const { adminFetch } = useAdminApi();
  const { reload } = useSiteContent();
  const [features, setFeatures] = useState<SiteFeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const clearStatus = () => {
    setError(null);
    setSuccess(null);
  };

  const load = async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/features");
    if (res.ok) {
      const data = (await res.json()) as { features: SiteFeatureRow[] };
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

  const startEdit = (row: SiteFeatureRow) => {
    setEditingId(row.id);
    setForm({
      label: row.label,
      slug: row.slug,
      sort_order: row.sort_order ?? 0,
      published: row.published,
    });
    clearStatus();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    clearStatus();
  };

  const save = async () => {
    if (!form.label.trim()) {
      setError("Label is required.");
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        label: form.label.trim(),
        slug: form.slug.trim() || undefined,
        sort_order: form.sort_order,
        published: form.published,
      };

      const isNew = editingId === "new";
      const res = await adminFetch(
        isNew ? "/api/admin/features" : `/api/admin/features?id=${editingId}`,
        {
          method: isNew ? "POST" : "PATCH",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }

      const data = (await res.json()) as { feature?: SiteFeatureRow };
      await load();
      await reload();

      if (isNew && data.feature?.id) {
        setEditingId(data.feature.id);
      }

      setSuccess(isNew ? "Feature created successfully." : "Feature saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, label: string) => {
    if (!confirm(`Delete feature “${label}”? Projects using it will become uncategorized.`)) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const res = await adminFetch(`/api/admin/features?id=${id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      await load();
      await reload();
      if (editingId === id) cancelEdit();
      setSuccess(`“${label}” deleted successfully.`);
    } else {
      setError("Delete failed");
    }
  };

  const set = <K extends keyof ReturnType<typeof emptyForm>>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (loading) {
    return <div className="p-4 text-sm text-[var(--text-muted)] md:p-5">Loading features…</div>;
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-5"
        data-lenis-prevent
      >
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          Features appear as filters above the projects section on the home page. Assign a category to each
          project in the Projects tab.
        </p>

        {error ? <AdminStatusMessage type="error" message={error} /> : null}
        {success ? <AdminStatusMessage type="success" message={success} /> : null}

        <ul className="mb-6 space-y-2">
          {features.map((feature) => (
            <li
              key={feature.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2"
            >
              <div>
                <p className="font-bold">{feature.label}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {feature.slug}
                  {!feature.published ? " · hidden" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(feature)}
                  className="rounded-lg px-2 py-1 text-xs font-bold hover:bg-[var(--border)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(feature.id, feature.label)}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {editingId ? (
          <div className="space-y-4 rounded-xl border border-[var(--border)] p-4">
            <h3 className="font-black">{editingId === "new" ? "New feature" : "Edit feature"}</h3>
            <AdminField label="Label (shown on filter pills)">
              <AdminInput value={form.label} onChange={(e) => set("label", e.target.value)} />
            </AdminField>
            <AdminField label="Slug (optional — auto-generated from label if empty)">
              <AdminInput value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </AdminField>
            <AdminField label="Sort order">
              <AdminInput
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </AdminField>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
              />
              Published (visible on home page)
            </label>
          </div>
        ) : null}
      </div>

      <AdminActionBar
        onSave={() => void (editingId ? save() : startNew())}
        saveLabel={editingId ? "Save feature" : "Add feature"}
        saving={saving}
        onCancel={editingId ? cancelEdit : undefined}
      />
    </section>
  );
}
