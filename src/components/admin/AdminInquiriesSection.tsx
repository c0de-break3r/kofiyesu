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
  admin_reply: string | null;
  admin_reply_at: string | null;
  user_email: string | null;
  user_name: string | null;
  intake: Record<string, unknown> | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type FilterTab = "all" | "new" | "urgent";

const statusLabel: Record<InquiryStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  replied: "Replied",
  archived: "Archived",
};

const typeMeta: Record<
  InquiryType,
  { label: string; className: string }
> = {
  collaboration: {
    label: "Project",
    className: "bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]",
  },
  security: {
    label: "Security",
    className: "bg-red-500/12 text-red-600 dark:text-red-400",
  },
  job: {
    label: "Job",
    className: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  },
  general: {
    label: "General",
    className: "bg-[var(--border)] text-[var(--text-muted)]",
  },
};

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "urgent", label: "Urgent" },
];

const scrollClass =
  "overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]";

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function clientName(item: Inquiry) {
  return item.user_name ?? item.user_email?.split("@")[0] ?? "Guest";
}

function clientInitial(item: Inquiry) {
  const name = clientName(item);
  return (name[0] ?? "?").toUpperCase();
}

export function AdminInquiriesSection() {
  const { adminFetch } = useAdminApi();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [payAmount, setPayAmount] = useState("");
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
    return { newCount, urgentCount, total: inquiries.length };
  }, [inquiries]);

  const filtered = useMemo(() => {
    let rows = inquiries;
    if (filter === "new") rows = rows.filter((i) => i.status === "new");
    else if (filter === "urgent") rows = rows.filter((i) => i.needs_admin);

    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter(
      (i) =>
        i.message.toLowerCase().includes(q) ||
        i.user_name?.toLowerCase().includes(q) ||
        i.user_email?.toLowerCase().includes(q),
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
        return window.matchMedia("(min-width: 768px)").matches ? rows[0].id : current;
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
    setReplyDraft(selected.reply_draft ?? selected.admin_reply ?? "");
    setPayAmount("");
    setSuccess(null);
  }, [selected]);

  const patchInquiry = async (patch: {
    status?: InquiryStatus;
    reply_draft?: string;
    publish_reply?: boolean;
    mark_reviewed?: boolean;
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
          reply_draft: patch.reply_draft ?? replyDraft,
          status: patch.status ?? selected.status,
          mark_reviewed: patch.mark_reviewed,
          publish_reply: patch.publish_reply,
        }),
      });
      if (!res.ok) {
        setError("Could not save");
        return;
      }
      const data = (await res.json()) as { inquiry: Inquiry };
      setInquiries((prev) => prev.map((i) => (i.id === data.inquiry.id ? data.inquiry : i)));
      setReplyDraft(data.inquiry.reply_draft ?? "");
      setSuccess(patch.successMessage ?? "Saved");
      window.setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError("Could not save");
    } finally {
      setSaving(false);
    }
  };

  const deleteInquiry = async () => {
    if (!selected || !confirm("Delete this inquiry?")) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/api/admin/inquiries?id=${encodeURIComponent(selected.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Could not delete");
        return;
      }
      const next = inquiries.filter((i) => i.id !== selected.id);
      setInquiries(next);
      setSelectedId(next[0]?.id ?? null);
      setSuccess("Deleted");
    } catch {
      setError("Could not delete");
    } finally {
      setSaving(false);
    }
  };

  const sendPayment = async () => {
    if (!selected) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setError("Enter amount in GHS");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/payments", {
        method: "POST",
        body: JSON.stringify({
          inquiry_id: selected.id,
          amount_ghs: amount,
          title: `Payment — ${clientName(selected)}`,
          description: selected.message.slice(0, 200),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Payment failed");
        return;
      }
      setPayAmount("");
      setSuccess("Payment link sent to chat");
      window.setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Payment failed");
    } finally {
      setSaving(false);
    }
  };

  const openEmail = () => {
    if (!selected?.user_email) return;
    const route = getInquiryRoute(selected.inquiry_type);
    const body =
      replyDraft.trim() ||
      `Hi${selected.user_name ? ` ${selected.user_name.split(" ")[0]}` : ""},\n\n`;
    window.location.href = buildMailtoUrl(route, body);
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--color-accent)]" />
        <p className="text-sm text-[var(--text-muted)]">Loading inbox…</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-2xl">
          ✦
        </div>
        <p className="font-bold">Inbox is empty</p>
        <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">
          Chat project requests and urgent messages will appear here.
        </p>
        <Button variant="border" className="mt-5" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
    );
  }

  const showListOnMobile = !selectedId;
  const showDetailOnMobile = Boolean(selectedId);

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--bg)]">
      <header
        className={`shrink-0 border-b border-[var(--border)] px-4 py-3 ${
          showDetailOnMobile ? "hidden md:block" : ""
        }`}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black tracking-tight">Inquiries</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {stats.total} total
              {stats.newCount > 0 ? (
                <span className="ml-1 font-semibold text-[var(--color-accent)]">
                  · {stats.newCount} new
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg px-2 py-1 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--color-accent)]"
          >
            Refresh
          </button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or message…"
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none ring-0 placeholder:text-[var(--text-muted)] focus:border-[var(--color-accent)]"
        />

        <div className="mt-2.5 flex gap-1.5">
          {filterTabs.map(({ id, label }) => {
            const count =
              id === "all"
                ? stats.total
                : id === "new"
                  ? stats.newCount
                  : stats.urgentCount;
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  active
                    ? "bg-[var(--color-accent)] text-white shadow-sm"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] ring-1 ring-[var(--border)] hover:ring-[var(--color-accent)]"
                }`}
              >
                {label}
                {count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`min-h-0 flex-col border-[var(--border)] md:flex md:w-64 md:shrink-0 md:border-r lg:w-72 ${
            showListOnMobile ? "flex flex-1" : "hidden md:flex"
          }`}
        >
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-[var(--text-muted)]">No matches.</p>
          ) : (
            <ul className={`min-h-0 flex-1 space-y-1 p-2 ${scrollClass}`} data-lenis-prevent>
              {filtered.map((item) => {
                const active = item.id === selectedId;
                const meta = typeMeta[item.inquiry_type];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`flex w-full gap-3 rounded-xl p-2.5 text-left transition ${
                        active
                          ? "bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] shadow-sm ring-1 ring-[var(--color-accent)]"
                          : "hover:bg-[var(--bg-elevated)]"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          active
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--border)] text-[var(--text-muted)]"
                        }`}
                      >
                        {clientInitial(item)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-sm font-bold">{clientName(item)}</span>
                          <time className="shrink-0 text-[10px] font-medium text-[var(--text-muted)]">
                            {formatWhen(item.created_at)}
                          </time>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[var(--text-muted)]">
                          {item.message}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.className}`}>
                            {meta.label}
                          </span>
                          {item.status === "new" ? (
                            <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                              New
                            </span>
                          ) : null}
                          {item.needs_admin ? (
                            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                              Urgent
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {selected ? (
          <div
            className={`min-h-0 min-w-0 flex-col md:flex md:flex-1 ${
              showDetailOnMobile ? "flex flex-1" : "hidden md:flex"
            }`}
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-3 py-2 md:hidden">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg px-2 py-1 text-sm font-bold text-[var(--color-accent)]"
              >
                ← Back
              </button>
              <span className="truncate text-sm font-bold">{clientName(selected)}</span>
            </div>

            <div className={`min-h-0 flex-1 p-4 ${scrollClass}`} data-lenis-prevent>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-lg font-black text-[var(--color-accent)]">
                    {clientInitial(selected)}
                  </span>
                  <div>
                    <p className="text-base font-black">{clientName(selected)}</p>
                    {selected.user_email ? (
                      <a
                        href={`mailto:${selected.user_email}`}
                        className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
                      >
                        {selected.user_email}
                      </a>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)]">No email on file</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${typeMeta[selected.inquiry_type].className}`}
                  >
                    {typeMeta[selected.inquiry_type].label}
                  </span>
                  <span className="rounded-full bg-[var(--border)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)]">
                    {statusLabel[selected.status]}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-sm">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message}</p>
                <p className="mt-3 text-[10px] font-medium text-[var(--text-muted)]">
                  {formatWhen(selected.created_at)}
                  {selected.needs_admin ? " · Flagged urgent" : ""}
                </p>
              </div>

              {selected.admin_reply ? (
                <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Sent to chat
                  </p>
                  <p className="mt-1 text-sm">{selected.admin_reply}</p>
                </div>
              ) : null}

              <label className="mt-4 block">
                <span className="text-xs font-bold text-[var(--text-muted)]">Reply as Obed</span>
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  rows={4}
                  placeholder="Your message appears in the visitor's chat…"
                  className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                />
              </label>

              <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-3">
                <p className="text-xs font-bold text-[var(--text-muted)]">Request payment (GHS)</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="500"
                    className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--color-accent)]"
                  />
                  <Button
                    type="button"
                    variant="border"
                    disabled={saving || !payAmount}
                    onClick={() => void sendPayment()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>

            <footer className="shrink-0 space-y-2 border-t border-[var(--border)] bg-[var(--bg-elevated)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {error ? (
                <AdminStatusMessage type="error" message={error} onDismiss={() => setError(null)} />
              ) : null}
              {success ? (
                <AdminStatusMessage type="success" message={success} onDismiss={() => setSuccess(null)} />
              ) : null}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={saving || !replyDraft.trim()}
                  onClick={() => void patchInquiry({ publish_reply: true, status: "replied", successMessage: "Sent" })}
                >
                  {saving ? "…" : "Send to chat"}
                </Button>
                {selected.user_email ? (
                  <Button variant="border" className="shrink-0" onClick={openEmail}>
                    Email
                  </Button>
                ) : null}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void patchInquiry({
                      mark_reviewed: true,
                      status: "reviewed",
                      successMessage: "Marked reviewed",
                    })
                  }
                  className="flex-1 rounded-lg py-2 text-xs font-bold text-[var(--text-muted)] transition hover:bg-[var(--border)] disabled:opacity-50"
                >
                  Reviewed
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void patchInquiry({ status: "archived", successMessage: "Archived" })}
                  className="flex-1 rounded-lg py-2 text-xs font-bold text-[var(--text-muted)] transition hover:bg-[var(--border)] disabled:opacity-50"
                >
                  Archive
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void deleteInquiry()}
                  className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </footer>
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center p-8 text-sm text-[var(--text-muted)] md:flex">
            Select an inquiry
          </div>
        )}
      </div>
    </section>
  );
}
