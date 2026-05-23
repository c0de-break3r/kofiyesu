import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AdminField, AdminInput, AdminTextarea } from "./AdminField";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { SiteAboutRow } from "@/types/site";

const emptyForm = () => ({
  display_name: "",
  job_title: "",
  about_intro: "",
  about_tagline: "",
  location: "",
  servicesText: "",
});

export function AdminAboutSection() {
  const { adminFetch } = useAdminApi();
  const { reload } = useSiteContent();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const applyRow = (row: SiteAboutRow | null) => {
    setForm({
      display_name: row?.display_name ?? "",
      job_title: row?.job_title ?? "",
      about_intro: row?.about_intro ?? "",
      about_tagline: row?.about_tagline ?? "",
      location: row?.location ?? "",
      servicesText: (row?.services ?? []).map((s) => s.name).join("\n"),
    });
  };

  const load = async () => {
    const res = await adminFetch("/api/admin/about");
    if (!res.ok) return;
    const data = (await res.json()) as { about: SiteAboutRow | null };
    applyRow(data.about);
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const services = form.servicesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const res = await adminFetch("/api/admin/about", {
        method: "PATCH",
        body: JSON.stringify({
          display_name: form.display_name,
          job_title: form.job_title,
          about_intro: form.about_intro,
          about_tagline: form.about_tagline,
          location: form.location,
          services,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }

      await load();
      await reload();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof ReturnType<typeof emptyForm>, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <section className="space-y-4">
      <p className="text-xs text-[var(--text-muted)]">Updates hero, about section, and services on the live site.</p>

      <AdminField label="Display name">
        <AdminInput value={form.display_name} onChange={(e) => set("display_name", e.target.value)} />
      </AdminField>
      <AdminField label="Job title (hero banner)">
        <AdminInput value={form.job_title} onChange={(e) => set("job_title", e.target.value)} />
      </AdminField>
      <AdminField label="Location">
        <AdminInput value={form.location} onChange={(e) => set("location", e.target.value)} />
      </AdminField>
      <AdminField label="About intro">
        <AdminTextarea rows={3} value={form.about_intro} onChange={(e) => set("about_intro", e.target.value)} />
      </AdminField>
      <AdminField label="About tagline">
        <AdminTextarea rows={2} value={form.about_tagline} onChange={(e) => set("about_tagline", e.target.value)} />
      </AdminField>
      <AdminField label="Services (one per line)">
        <AdminTextarea rows={5} value={form.servicesText} onChange={(e) => set("servicesText", e.target.value)} />
      </AdminField>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm font-semibold text-green-600">Saved — refresh home to see changes.</p>}

      <Button onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save about"}
      </Button>
    </section>
  );
}
