import { useEffect, useState } from "react";
import { AdminActionBar } from "./AdminActionBar";
import { AdminField, AdminInput, AdminTextarea } from "./AdminField";
import { AdminServicesEditor } from "./AdminServicesEditor";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultAbout } from "@/content/about";
import type { SiteAboutRow, SiteService } from "@/types/site";

function splitIntro(intro: string | null | undefined) {
  const raw = intro?.trim() ?? "";
  const parts = raw.includes("\n\n") ? raw.split(/\n\n+/).filter(Boolean) : [raw];
  while (parts.length < 3) parts.push("");
  return [parts[0] ?? "", parts[1] ?? "", parts[2] ?? ""];
}

function joinIntro(p1: string, p2: string, p3: string) {
  return [p1, p2, p3].map((p) => p.trim()).filter(Boolean).join("\n\n");
}

function mergeServices(row: SiteAboutRow | null): SiteService[] {
  const defaultByName = Object.fromEntries(defaultAbout.services.map((s) => [s.name, s.info ?? ""]));
  const fromDb = row?.services?.filter((s) => s?.name?.trim()) ?? [];
  const list = fromDb.length ? fromDb : [...defaultAbout.services];
  return list.map((s) => ({
    name: s.name,
    info: s.info?.trim() || defaultByName[s.name] || "",
  }));
}

export function AdminAboutSection() {
  const { adminFetch } = useAdminApi();
  const { reload } = useSiteContent();
  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [intro1, setIntro1] = useState("");
  const [intro2, setIntro2] = useState("");
  const [intro3, setIntro3] = useState("");
  const [vision, setVision] = useState("");
  const [services, setServices] = useState<SiteService[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const applyRow = (row: SiteAboutRow | null) => {
    const [a, b, c] = splitIntro(row?.about_intro ?? defaultAbout.about_intro);
    setDisplayName(row?.display_name ?? "");
    setJobTitle(row?.job_title ?? defaultAbout.job_title);
    setLocation(row?.location ?? defaultAbout.location);
    setIntro1(a);
    setIntro2(b);
    setIntro3(c);
    setVision(row?.about_tagline ?? defaultAbout.about_tagline);
    setServices(mergeServices(row));
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

  const resetToDefaults = () => {
    if (!confirm("Reset all about fields to site defaults? Unsaved edits will be lost.")) return;
    applyRow(null);
    setError(null);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const servicesPayload = services
        .map((s) => ({ name: s.name.trim(), info: s.info?.trim() || "" }))
        .filter((s) => s.name);

      const res = await adminFetch("/api/admin/about", {
        method: "PATCH",
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          job_title: jobTitle.trim(),
          location: location.trim(),
          about_intro: joinIntro(intro1, intro2, intro3),
          about_tagline: vision.trim(),
          services: servicesPayload,
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

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-5"
        data-lenis-prevent
      >
        <div className="space-y-5">
        <div>
          <h2 className="text-lg font-black">About & vision</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Edit hero details, the three Background scroll paragraphs, your long-term vision, and service cards.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">Hero</p>
          <AdminField label="Display name">
            <AdminInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </AdminField>
          <AdminField label="Job title">
            <AdminInput value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </AdminField>
          <AdminField label="Location">
            <AdminInput value={location} onChange={(e) => setLocation(e.target.value)} />
          </AdminField>
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">Background (3 paragraphs)</p>
          <p className="text-xs text-[var(--text-muted)]">
            These cycle on scroll in the About section. Leave a field empty to skip it.
          </p>
          <AdminField label="Paragraph 1">
            <AdminTextarea rows={4} value={intro1} onChange={(e) => setIntro1(e.target.value)} />
          </AdminField>
          <AdminField label="Paragraph 2">
            <AdminTextarea rows={4} value={intro2} onChange={(e) => setIntro2(e.target.value)} />
          </AdminField>
          <AdminField label="Paragraph 3">
            <AdminTextarea rows={4} value={intro3} onChange={(e) => setIntro3(e.target.value)} />
          </AdminField>
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">Vision</p>
          <AdminField label="Long-term vision (tagline under Background)">
            <AdminTextarea rows={3} value={vision} onChange={(e) => setVision(e.target.value)} />
          </AdminField>
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--border)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">Services</p>
          <AdminServicesEditor services={services} onChange={setServices} />
        </div>
        </div>
      </div>

      <AdminActionBar
        error={error}
        success={saved ? "Saved — changes are live on the home page." : null}
        saving={saving}
        onSave={() => void save()}
        saveLabel="Save"
        extra={
          <button
            type="button"
            onClick={resetToDefaults}
            disabled={saving}
            className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--color-accent)] disabled:opacity-50"
          >
            Reset to defaults
          </button>
        }
      />
    </section>
  );
}
