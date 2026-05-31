import { useCallback, useEffect, useMemo, useState } from "react";
import { getInquiryRoute, buildMailtoUrl, type InquiryType } from "@/content/contact";
import { useAdminApi } from "@/hooks/useAdminApi";
import { Button } from "@/components/ui/Button";
import { AdminStatusMessage } from "./AdminStatusMessage";

export type InquiryStatus = "new" | "reviewed" | "replied" | "archived";

export type Inquiry = {
  id: string;
  inquiry_type: InquiryType;
  message: string;
  needs_admin: boolean;
  status: InquiryStatus;
  admin_notes: string | null;
  reply_draft: string | null;
  user_email: string | null;
  user_name: string | null;
  intake: Record<string, unknown> | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type FilterTab = "all" | "new" | "urgent" | InquiryType;

const statusLabel: Record<InquiryStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  replied: "Replied",
  archived: "Archived",
};

const statusClass: Record<InquiryStatus, string> = {
  new: "bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)]",
  reviewed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  replied: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  archived: "bg-[var(--border)] text-[var(--text-muted)]",
};

const typeMeta: Record<InquiryType, { label: string; icon: string; accent: string }> = {
  collaboration: {
    label: "Collaboration",
    icon: "◆",
    accent: "text-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]",
  },
  security: {
    label: "Security",
    icon: "⬡",
    accent: "text-violet-600 bg-violet-500/10 dark:text-violet-400",
  },
  job: {
    label: "Job",
    icon: "◎",
    accent: "text-sky-600 bg-sky-500/10 dark:text-sky-400",
  },
  general: {
    label: "General",
    icon: "○",
    accent: "text-[var(--text-muted)] bg-[var(--border)]",
  },
};

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "urgent", label: "Urgent" },
  { id: "collaboration", label: "Projects" },
  { id: "security", label: "Security" },
  { id: "job", label: "Jobs" },
];

const scrollClass =
  "overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [scrollbar-color:color-mix(in_srgb,var(--color-accent)_40%,transparent)_transparent]";

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function ListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-[var(--border)] p-3">
          <div className="h-3 w-24 rounded bg-[var(--border)]" />
          <div className="mt-2 h-3 w-full rounded bg-[var(--border)]" />
          <div className="mt-1 h-3 w-2/3 rounded bg-[var(--border)]" />
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        highlight
          ? "border-[color-mix(in_srgb,var(--color-accent)_35%,var(--border))] bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]"
          : "border-[var(--border)] bg-[var(--bg)]"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p
        className={`mt-0.5 text-xl font-black tabular-nums ${highlight ? "text-[var(--color-accent)]" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

export function AdminInquiriesSection() {
  const { adminFetch } = useAdminApi();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [status, setStatus] = useState<InquiryStatus>("new");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const newCount = inquiries.filter((i) => i.status === "new").length;
    const urgentCount = inquiries.filter((i) => i.needs_admin && i.status !== "archived").length;
    const pendingCount = inquiries.filter((i) => i.status === "new" || i.status === "reviewed").length;
    return { newCount, urgentCount, pendingCount, total: inquiries.length };
  }, [inquiries]);

  const filtered = useMemo(() => {
    let rows = inquiries;
    if (filter === "new") rows = rows.filter((i) => i.status === "new");
    else if (filter === "urgent") rows = rows.filter((i) => i.needs_admin);
    else if (filter !== "all") rows = rows.filter((i) => i.inquiry_type === filter);

    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter(
      (i) =>
        i.message.toLowerCase().includes(q) ||
        i.user_name?.toLowerCase().includes(q) ||
        i.user_email?.toLowerCase().includes(q) ||
        i.inquiry_type.includes(q),
    );
  }, [inquiries, filter, search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/inquiries");
      if (!res.ok) {
        setError("Failed to load inquiries");
        return;
      }
      const data = (await res.json()) as { inquiries?: Inquiry[] };
      const rows = data.inquiries ?? [];
      setInquiries(rows);
      setSelectedId((current) => {
        if (rows.length === 0) return null;
        if (current && rows.some((r) => r.id === current)) return current;
        return rows[0].id;
      });
    } catch {
      setError("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selected) return;
    setAdminNotes(selected.admin_notes ?? "");
    setReplyDraft(selected.reply_draft ?? "");
    setStatus(selected.status);
    setSuccess(null);
  }, [selected]);

  const patchInquiry = async (patch: {
    mark_reviewed?: boolean;
    status?: InquiryStatus;
    admin_notes?: string;
    reply_draft?: string;
    successMessage?: string;
  }) => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await adminFetch("/api/admin/inquiries", {
        method: "PATCH",
        body: JSON.stringify({
          id: selected.id,
          admin_notes: patch.admin_notes ?? adminNotes,
          reply_draft: patch.reply_draft ?? replyDraft,
          status: patch.status ?? status,
          mark_reviewed: patch.mark_reviewed,
        }),
      });
      if (!res.ok) {
        setError("Could not save inquiry");
        return;
      }
      const data = (await res.json()) as { inquiry: Inquiry };
      setInquiries((prev) => prev.map((i) => (i.id === data.inquiry.id ? data.inquiry : i)));
      setStatus(data.inquiry.status);
      setAdminNotes(data.inquiry.admin_notes ?? "");
      setReplyDraft(data.inquiry.reply_draft ?? "");
      setSuccess(patch.successMessage ?? "Saved");
      window.setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError("Could not save inquiry");
    } finally {
      setSaving(false);
    }
  };

  const deleteInquiry = async () => {
    if (!selected || !confirm("Delete this inquiry permanently?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/inquiries?id=${encodeURIComponent(selected.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Could not delete inquiry");
        return;
      }
      const next = inquiries.filter((i) => i.id !== selected.id);
      setInquiries(next);
      setSelectedId(next[0]?.id ?? null);
      setSuccess("Deleted");
    } catch {
      setError("Could not delete inquiry");
    } finally {
      setSaving(false);
    }
  };

  const copyEmail = async () => {
    if (!selected?.user_email) return;
    try {
      await navigator.clipboard.writeText(selected.user_email);
      setSuccess("Email copied");
      window.setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError("Could not copy email");
    }
  };

  const openReplyMail = () => {
    if (!selected) return;
    const route = getInquiryRoute(selected.inquiry_type);
    const body = replyDraft.trim() || `Hi${selected.user_name ? ` ${selected.user_name.split(" ")[0]}` : ""},\n\n`;
    window.location.href = buildMailtoUrl(route, body);
    void patchInquiry({ status: "replied", mark_reviewed: true, successMessage: "Marked as replied" });
  };

  if (loading) {
    return (
      <section className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b border-[var(--border)] px-4 py-3 md:px-5">
          <div className="h-5 w-32 animate-pulse rounded bg-[var(--border)]" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="max-h-[40vh] border-b border-[var(--border)] md:max-h-none md:w-[38%] md:border-b-0 md:border-r">
            <ListSkeleton />
          </div>
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-[var(--text-muted)]">
            Loading inquiries…
          </div>
        </div>
      </section>
    );
  }

  if (inquiries.length === 0) {
    return (
      <section className="flex h-full min-h-0 flex-col p-4 md:p-5">
        <h2 className="text-lg font-black">Inquiries</h2>
        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-6 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-xl">
            ✦
          </div>
          <p className="text-sm font-bold">Inbox is clear</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--text-muted)]">
            Real project requests, hires, and urgent messages from chat appear here — casual Q&A stays in
            chat only.
          </p>
          <Button variant="border" className="mt-4" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 md:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Inquiries</h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Business requests routed from chat
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatCard label="New" value={stats.newCount} highlight={stats.newCount > 0} />
          <StatCard label="Urgent" value={stats.urgentCount} highlight={stats.urgentCount > 0} />
          <StatCard label="Pending" value={stats.pendingCount} />
        </div>

        <div className="mt-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages, names, emails…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
          {filterTabs.map(({ id, label }) => {
            const count =
              id === "all"
                ? inquiries.length
                : id === "new"
                  ? stats.newCount
                  : id === "urgent"
                    ? stats.urgentCount
                    : inquiries.filter((i) => i.inquiry_type === id).length;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                  filter === id
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--bg)] text-[var(--text-muted)] hover:bg-[var(--border)]"
                }`}
              >
                {label}
                {count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex max-h-[42vh] min-h-0 shrink-0 flex-col border-b border-[var(--border)] md:max-h-none md:w-[38%] md:shrink-0 md:border-b-0 md:border-r lg:w-[36%]">
          <p className="shrink-0 px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Inbox · {filtered.length}
          </p>
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">No matches for this filter.</p>
          ) : (
            <ul className={`min-h-0 flex-1 space-y-2 px-2 pb-3 ${scrollClass}`} data-lenis-prevent>
              {filtered.map((item) => {
                const meta = typeMeta[item.inquiry_type];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-xl border p-3 text-left text-sm transition duration-200 ${
                        item.id === selectedId
                          ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] shadow-sm"
                          : "border-[var(--border)] bg-[var(--bg)] hover:border-[color-mix(in_srgb,var(--color-accent)_40%,var(--border))] hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${meta.accent}`}
                        >
                          <span aria-hidden>{meta.icon}</span>
                          {meta.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusClass[item.status]}`}
                        >
                          {statusLabel[item.status]}
                        </span>
                        {item.needs_admin && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-bold uppercase text-red-600">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
                        {item.message}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] font-semibold text-[var(--text-muted)]">
                          {item.user_name ?? item.user_email ?? "Guest"}
                        </span>
                        <time className="shrink-0 text-[10px] font-semibold text-[var(--text-muted)]">
                          {formatWhen(item.created_at)}
                        </time>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {selected ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className={`min-h-0 flex-1 px-4 py-4 md:px-5 ${scrollClass}`} data-lenis-prevent>
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${typeMeta[selected.inquiry_type].accent}`}
                    >
                      {typeMeta[selected.inquiry_type].icon} {typeMeta[selected.inquiry_type].label}
                    </span>
                    {selected.needs_admin && (
                      <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold uppercase text-red-600">
                        Needs Obed
                      </span>
                    )}
                  </div>
                  <time className="text-[11px] font-semibold text-[var(--text-muted)]">
                    {formatWhen(selected.created_at)}
                  </time>
                </div>

                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  {getInquiryRoute(selected.inquiry_type).description}
                </p>

                {(selected.user_name || selected.user_email) && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      Client
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{selected.user_name ?? "Guest"}</p>
                      {selected.user_email ? (
                        <>
                          <a
                            href={`mailto:${selected.user_email}`}
                            className="text-sm font-semibold text-[var(--color-accent)]"
                          >
                            {selected.user_email}
                          </a>
                          <button
                            type="button"
                            onClick={() => void copyEmail()}
                            className="rounded-lg border border-[var(--border)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                          >
                            Copy
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    Message
                  </p>
                  <p className="mt-1 whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                {selected.intake && Object.keys(selected.intake).length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      Intake data
                    </p>
                    <pre className="max-h-32 overflow-auto rounded-xl bg-[var(--bg)] p-3 text-[10px] leading-relaxed text-[var(--text-muted)]">
                      {JSON.stringify(selected.intake, null, 2)}
                    </pre>
                  </div>
                )}

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InquiryStatus)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[var(--color-accent)]"
                  >
                    {(Object.keys(statusLabel) as InquiryStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {statusLabel[s]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    Admin notes
                  </span>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes — not sent to client…"
                    className="mt-1 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    Reply draft
                  </span>
                  <textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    rows={4}
                    placeholder="Email reply to the client…"
                    className="mt-1 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                </label>
              </div>
            </div>

            <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.08)] md:px-5">
              <div className="space-y-2">
                {error ? <AdminStatusMessage type="error" message={error} /> : null}
                {success ? <AdminStatusMessage type="success" message={success} /> : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Button className="w-full px-4" disabled={saving} onClick={() => void patchInquiry({})}>
                  {saving ? "…" : "Save"}
                </Button>
                <Button
                  variant="border"
                  className="w-full px-3 text-xs sm:text-sm"
                  disabled={saving}
                  onClick={() =>
                    void patchInquiry({
                      mark_reviewed: true,
                      status: "reviewed",
                      successMessage: "Marked reviewed",
                    })
                  }
                >
                  Review
                </Button>
                <Button
                  variant="border"
                  className="w-full px-3 text-xs sm:text-sm"
                  disabled={saving}
                  onClick={openReplyMail}
                >
                  Reply via email
                </Button>
                <Button
                  variant="border"
                  className="w-full px-3 text-xs sm:text-sm"
                  disabled={saving}
                  onClick={() => void patchInquiry({ status: "archived", successMessage: "Archived" })}
                >
                  Archive
                </Button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void deleteInquiry()}
                  className="col-span-2 w-full rounded-full border border-red-500/40 bg-red-500/5 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-500/15 disabled:opacity-50 sm:col-span-1"
                >
                  Delete
                </button>
              </div>
            </footer>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-[var(--text-muted)]">
            Select an inquiry
          </div>
        )}
      </div>
    </section>
  );
}
