import { useEffect, useState } from "react";
import { AdminActionBar } from "./AdminActionBar";
import { AdminStatusMessage } from "./AdminStatusMessage";
import { AdminField, AdminInput, AdminTextarea } from "./AdminField";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSiteContent } from "@/hooks/useSiteContent";
import { readResponseJson } from "@/lib/readResponseJson";
import { servicePackages } from "@/content/payments";
import type { SitePricingPackageRow } from "@/types/site";

const emptyForm = () => ({
  slug: "",
  title: "",
  amount_ghs: 0,
  description: "",
  highlights: [""],
  featured: false,
  sort_order: 0,
  published: true,
});

export function AdminPricingSection() {
  const { adminFetch } = useAdminApi();
  const { reload } = useSiteContent();
  const [packages, setPackages] = useState<SitePricingPackageRow[]>([]);
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
    setError(null);
    const res = await adminFetch("/api/admin/pricing");
    if (res.ok) {
      const data = await readResponseJson<{ packages: SitePricingPackageRow[] }>(res);
      setPackages(data?.packages ?? []);
      if (!data) setError("Could not read pricing data from the server.");
    } else {
      const data = await readResponseJson<{ error?: string }>(res);
      setError(data?.error ?? `Could not load packages (${res.status}).`);
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

  const startEdit = (row: SitePricingPackageRow) => {
    setEditingId(row.id);
    setForm({
      slug: row.slug,
      title: row.title,
      amount_ghs: row.amount_ghs,
      description: row.description,
      highlights: row.highlights.length ? [...row.highlights] : [""],
      featured: row.featured,
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

  const setHighlight = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.map((h, i) => (i === index ? value : h)),
    }));
  };

  const addHighlight = () => {
    setForm((f) => ({ ...f, highlights: [...f.highlights, ""] }));
  };

  const removeHighlight = (index: number) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("Title is required.");
      setSuccess(null);
      return;
    }
    if (!form.amount_ghs || form.amount_ghs <= 0) {
      setError("Amount (GH₵) is required.");
      setSuccess(null);
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        slug: form.slug.trim() || undefined,
        title: form.title.trim(),
        amount_ghs: form.amount_ghs,
        description: form.description.trim(),
        highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
        featured: form.featured,
        sort_order: form.sort_order,
        published: form.published,
      };

      const isNew = editingId === "new";
      const res = await adminFetch(
        isNew ? "/api/admin/pricing" : `/api/admin/pricing?id=${editingId}`,
        {
          method: isNew ? "POST" : "PATCH",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await readResponseJson<{ error?: string }>(res);
        throw new Error(data?.error ?? "Save failed");
      }

      const data = await readResponseJson<{ package?: SitePricingPackageRow }>(res);
      await load();
      await reload();

      if (isNew && data?.package?.id) {
        setEditingId(data.package.id);
      }

      setSuccess(isNew ? "Package created successfully." : "Package saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete package “${title}”?`)) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const res = await adminFetch(`/api/admin/pricing?id=${id}`, { method: "DELETE" });
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

  const seedDefaults = async () => {
    if (!confirm("Add default packages from the site template? Existing packages are kept.")) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      for (const [index, pkg] of servicePackages.entries()) {
        const exists = packages.some((p) => p.slug === pkg.id);
        if (exists) continue;
        const res = await adminFetch("/api/admin/pricing", {
          method: "POST",
          body: JSON.stringify({
            slug: pkg.id,
            title: pkg.title,
            amount_ghs: pkg.amountGhs,
            description: pkg.description,
            highlights: [...pkg.highlights],
            featured: "featured" in pkg && pkg.featured === true,
            sort_order: index,
            published: true,
          }),
        });
        if (!res.ok) {
          const data = await readResponseJson<{ error?: string }>(res);
          throw new Error(data?.error ?? "Could not seed package");
        }
      }
      await load();
      await reload();
      setSuccess("Default packages added.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof ReturnType<typeof emptyForm>>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (loading) {
    return <div className="p-4 text-sm text-[var(--text-muted)] md:p-5">Loading packages…</div>;
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-5"
        data-lenis-prevent
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-[var(--text-muted)]">
            Packages shown in Services & pricing on the home page. Slug is used for Paystack checkout.
          </p>
          {packages.length === 0 ? (
            <button
              type="button"
              onClick={() => void seedDefaults()}
              disabled={saving}
              className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--color-accent)] hover:border-[var(--color-accent)] disabled:opacity-50"
            >
              Load defaults
            </button>
          ) : null}
        </div>

        {error ? (
          <AdminStatusMessage type="error" message={error} onDismiss={() => setError(null)} />
        ) : null}
        {success ? (
          <AdminStatusMessage type="success" message={success} onDismiss={() => setSuccess(null)} />
        ) : null}

        <ul className="mb-6 space-y-2">
          {packages.map((pkg) => (
            <li
              key={pkg.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2"
            >
              <div>
                <p className="font-bold">{pkg.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  GH₵ {pkg.amount_ghs.toLocaleString("en-GH")} · {pkg.slug}
                  {pkg.featured ? " · popular" : ""}
                  {!pkg.published ? " · hidden" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(pkg)}
                  className="rounded-lg px-2 py-1 text-xs font-bold hover:bg-[var(--border)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(pkg.id, pkg.title)}
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
            <h3 className="font-black">{editingId === "new" ? "New package" : "Edit package"}</h3>
            <AdminField label="Title">
              <AdminInput value={form.title} onChange={(e) => set("title", e.target.value)} />
            </AdminField>
            <AdminField label="Slug (Paystack package id — auto from title if empty)">
              <AdminInput value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </AdminField>
            <AdminField label="Amount (GH₵)">
              <AdminInput
                type="number"
                min={1}
                value={form.amount_ghs || ""}
                onChange={(e) => set("amount_ghs", Number(e.target.value))}
              />
            </AdminField>
            <AdminField label="Description">
              <AdminTextarea
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </AdminField>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Highlights</p>
              {form.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <AdminInput
                    value={highlight}
                    onChange={(e) => setHighlight(index, e.target.value)}
                    placeholder="e.g. Video or async brief"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="shrink-0 rounded-lg px-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHighlight}
                className="text-xs font-bold text-[var(--color-accent)] hover:underline"
              >
                + Add highlight
              </button>
            </div>
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
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Mark as Popular
            </label>
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
        saveLabel={editingId ? "Save package" : "Add package"}
        saving={saving}
        onCancel={editingId ? cancelEdit : undefined}
      />
    </section>
  );
}
