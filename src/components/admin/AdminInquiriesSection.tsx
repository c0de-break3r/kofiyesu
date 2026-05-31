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

type FilterTab = "all" | "new" | "urgent" | InquiryType;

const statusLabel: Record<InquiryStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  replied: "Replied",
  archived: "Archived",
};

const typeLabel: Record<InquiryType, string> = {
  collaboration: "Project",
  security: "Security",
  job: "Job",
  general: "General",
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
  "overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function ListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border border-[var(--border)] p-3">
          <div className="h-3 w-20 rounded bg-[var(--border)]" />
          <div className="mt-2 h-3 w-full rounded bg-[var(--border)]" />
        </div>
      ))}
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
  const [payAmount, setPayAmount] = useState("500");
  const [payTitle, setPayTitle] = useState("Project kickoff deposit");
  const [payDescription, setPayDescription] = useState("");
  const [payLink, setPayLink] = useState<string | null>(null);

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
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;
        return isDesktop ? rows[0].id : null;
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
    setPayLink(null);
  }, [selected]);

  const patchInquiry = async (patch: {
    mark_reviewed?: boolean;
    status?: InquiryStatus;
    admin_notes?: string;
    reply_draft?: string;
    publish_reply?: boolean;
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
          publish_reply: patch.publish_reply,
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

  const sendReplyToChat = () => {
    if (!replyDraft.trim()) {
      setError("Write a reply before sending to chat.");
      return;
    }
    void patchInquiry({ publish_reply: true, successMessage: "Sent to chat" });
  };

  const openReplyMail = () => {
    if (!selected) return;
    const route = getInquiryRoute(selected.inquiry_type);
    const body = replyDraft.trim() || `Hi${selected.user_name ? ` ${selected.user_name.split(" ")[0]}` : ""},\n\n`;
    window.location.href = buildMailtoUrl(route, body);
  };

  const requestPayment = async () => {
    if (!selected) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount in GHS");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await adminFetch("/api/admin/payments", {
        method: "POST",
        body: JSON.stringify({
          inquiry_id: selected.id,
          amount_ghs: amount,
          title: payTitle.trim() || "Project payment",
          description: payDescription.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not create payment");
        return;
      }
      const data = (await res.json()) as { pay_link: string };
      setPayLink(data.pay_link);
      setSuccess("Payment link sent to chat");
      window.setTimeout(() => setSuccess(null), 4000);
    } catch {
      setError("Could not create payment");
    } finally {
      setSaving(false);
    }
  };

  const copyPayLink = async () => {
    if (!payLink) return;
    try {
      await navigator.clipboard.writeText(payLink);
      setSuccess("Pay link copied");
      window.setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError("Could not copy link");
    }
  };

  const selectInquiry = (id: string) => setSelectedId(id);
  const backToList = () => setSelectedId(null);

  const filterCount = (id: FilterTab) => {
    if (id === "all") return inquiries.length;
    if (id === "new") return stats.newCount;
    if (id === "urgent") return stats.urgentCount;
    return inquiries.filter((i) => i.inquiry_type === id).length;
  };

  if (loading) {
    return (
      <section className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b border-[var(--border)] px-4 py-3">
          <div className="h-5 w-24 animate-pulse rounded bg-[var(--border)]" />
        </div>
        <ListSkeleton />
      </section>
    );
  }

  if (inquiries.length === 0) {
    return (
      <section className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-sm font-bold">No inquiries yet</p>
        <p className="mt-1 max-w-xs text-xs text-[var(--text-muted)]">
          Project requests and urgent chat messages show up here.
        </p>
        <Button variant="border" className="mt-4" onClick={() => void load()}>
          Refresh
        </Button>
      </section>
    );
  }

  const showListOnMobile = !selectedId;
  const showDetailOnMobile = Boolean(selectedId);

  return (
    <section className="flex h-full min-h-0 flex-col">
      {/* Toolbar — list view on mobile; always visible on desktop */}
      <header
        className={`shrink-0 border-b border-[var(--border)] px-3 py-2.5 md:px-4 ${
          showDetailOnMobile ? "hidden md:block" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-black md:text-lg">Inbox</h2>
            <p className="text-[11px] text-[var(--text-muted)] md:text-xs">
              {stats.total} total
              {stats.newCount > 0 ? (
                <span className="text-[var(--color-accent)]"> · {stats.newCount} new</span>
              ) : null}
              {stats.urgentCount > 0 ? (
                <span className="text-red-600"> · {stats.urgentCount} urgent</span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--text-muted)] transition hover:bg-[var(--border)] hover:text-[var(--color-accent)]"
          >
            Refresh
          </button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className={`${fieldClass} mt-2.5`}
        />

        <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
          {filterTabs.map(({ id, label }) => {
            const count = filterCount(id);
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  active
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--bg)] text-[var(--text-muted)] ring-1 ring-[var(--border)]"
                }`}
              >
                {label}
                {count > 0 && id !== "all" ? ` ${count}` : ""}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 md:flex-row">
        {/* List */}
        <aside
          className={`min-h-0 flex-col border-[var(--border)] md:flex md:w-[min(100%,280px)] md:shrink-0 md:border-r lg:w-72 ${
            showListOnMobile ? "flex flex-1" : "hidden md:flex"
          }`}
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">No matches.</p>
          ) : (
            <ul className={`min-h-0 flex-1 space-y-1 p-2 ${scrollClass}`} data-lenis-prevent>
              {filtered.map((item) => {
                const active = item.id === selectedId;
                const client = item.user_name ?? item.user_email ?? "Guest";
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectInquiry(item.id)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                        active
                          ? "bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] ring-1 ring-[var(--color-accent)]"
                          : "hover:bg-[var(--bg)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {item.status === "new" ? (
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                                aria-label="New"
                              />
                            ) : null}
                            {item.needs_admin ? (
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
                                aria-label="Urgent"
                              />
                            ) : null}
                            <span className="truncate text-sm font-bold">{client}</span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[var(--text-muted)]">
                            {item.message}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <time className="text-[10px] font-semibold text-[var(--text-muted)]">
                            {formatWhen(item.created_at)}
                          </time>
                          <span className="text-[10px] font-bold text-[var(--text-muted)]">
                            {typeLabel[item.inquiry_type]}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Detail */}
        {selected ? (
          <div
            className={`min-h-0 min-w-0 flex-col md:flex md:flex-1 ${
              showDetailOnMobile ? "flex flex-1" : "hidden md:flex"
            }`}
          >
            {/* Mobile detail header */}
            <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-3 py-2 md:hidden">
              <button
                type="button"
                onClick={backToList}
                className="rounded-lg px-2 py-1.5 text-sm font-bold text-[var(--color-accent)]"
              >
                ← Inbox
              </button>
              <span className="truncate text-sm font-bold">
                {selected.user_name ?? selected.user_email ?? "Inquiry"}
              </span>
            </div>

            <div className={`min-h-0 flex-1 px-3 py-3 md:px-4 md:py-4 ${scrollClass}`} data-lenis-prevent>
              <div className="space-y-3 md:space-y-4">
                <div className="hidden items-start justify-between gap-2 md:flex">
                  <div>
                    <p className="text-base font-black">
                      {selected.user_name ?? "Guest"}
                    </p>
                    {selected.user_email ? (
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <a
                          href={`mailto:${selected.user_email}`}
                          className="text-sm font-semibold text-[var(--color-accent)]"
                        >
                          {selected.user_email}
                        </a>
                        <button
                          type="button"
                          onClick={() => void copyEmail()}
                          className="text-[11px] font-bold text-[var(--text-muted)] underline-offset-2 hover:text-[var(--color-accent)] hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right text-[11px] font-semibold text-[var(--text-muted)]">
                    <p>{formatWhen(selected.created_at)}</p>
                    <p className="mt-0.5">
                      {typeLabel[selected.inquiry_type]} · {statusLabel[selected.status]}
                    </p>
                  </div>
                </div>

                {/* Mobile client + meta */}
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 md:hidden">
                  {selected.user_email ? (
                    <a
                      href={`mailto:${selected.user_email}`}
                      className="text-sm font-semibold text-[var(--color-accent)]"
                    >
                      {selected.user_email}
                    </a>
                  ) : (
                    <p className="text-sm font-bold">{selected.user_name ?? "Guest"}</p>
                  )}
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    {typeLabel[selected.inquiry_type]} · {statusLabel[selected.status]}
                    {selected.needs_admin ? " · Urgent" : ""}
                  </p>
                </div>

                <div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message}</p>
                </div>

                {selected.intake && Object.keys(selected.intake).length > 0 ? (
                  <details className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                    <summary className="cursor-pointer text-xs font-bold text-[var(--text-muted)]">
                      Intake data
                    </summary>
                    <pre className="mt-2 max-h-28 overflow-auto text-[10px] leading-relaxed text-[var(--text-muted)]">
                      {JSON.stringify(selected.intake, null, 2)}
                    </pre>
                  </details>
                ) : null}

                <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)] p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
                    Request payment
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    Creates a Paystack link and posts it in the visitor&apos;s chat.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { amount: "150", title: "Discovery session" },
                      { amount: "500", title: "Project kickoff deposit" },
                      { amount: "800", title: "Security review" },
                    ].map((preset) => (
                      <button
                        key={preset.amount}
                        type="button"
                        onClick={() => {
                          setPayAmount(preset.amount);
                          setPayTitle(preset.title);
                        }}
                        className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-bold transition hover:border-[var(--color-accent)]"
                      >
                        GH₵ {preset.amount}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-bold text-[var(--text-muted)]">Amount (GHS)</span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className={fieldClass}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-bold text-[var(--text-muted)]">Title</span>
                      <input
                        type="text"
                        value={payTitle}
                        onChange={(e) => setPayTitle(e.target.value)}
                        className={fieldClass}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-bold text-[var(--text-muted)]">Description (optional)</span>
                      <input
                        type="text"
                        value={payDescription}
                        onChange={(e) => setPayDescription(e.target.value)}
                        placeholder="What this payment covers…"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="text-sm"
                      disabled={saving}
                      onClick={() => void requestPayment()}
                    >
                      {saving ? "…" : "Send payment request"}
                    </Button>
                    {payLink ? (
                      <button
                        type="button"
                        onClick={() => void copyPayLink()}
                        className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold transition hover:border-[var(--color-accent)]"
                      >
                        Copy pay link
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                    Posts to chat when the visitor signed in; you can always copy the pay link.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-bold text-[var(--text-muted)]">Status</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as InquiryStatus)}
                      className={fieldClass}
                    >
                      {(Object.keys(statusLabel) as InquiryStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-xs font-bold text-[var(--text-muted)]">Notes (internal)</span>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      placeholder="Private notes…"
                      className={`${fieldClass} resize-y`}
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-xs font-bold text-[var(--text-muted)]">Reply to visitor</span>
                    <textarea
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      rows={3}
                      placeholder="Sent to the user's chat as Obed…"
                      className={`${fieldClass} resize-y`}
                    />
                  </label>

                  {selected.admin_reply ? (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 sm:col-span-2">
                      Sent to chat {selected.admin_reply_at ? formatWhen(selected.admin_reply_at) : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:px-4">
              {error ? (
                <AdminStatusMessage type="error" message={error} onDismiss={() => setError(null)} />
              ) : null}
              {success ? (
                <AdminStatusMessage type="success" message={success} onDismiss={() => setSuccess(null)} />
              ) : null}

              <div className="mt-2 flex gap-2">
                <Button className="flex-1" disabled={saving || !replyDraft.trim()} onClick={sendReplyToChat}>
                  {saving ? "…" : "Send to chat"}
                </Button>
                <Button variant="border" className="flex-1" disabled={saving} onClick={() => void patchInquiry({})}>
                  Save
                </Button>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={openReplyMail}
                  className="flex-1 rounded-lg py-2 text-xs font-bold text-[var(--text-muted)] transition hover:bg-[var(--border)] disabled:opacity-50"
                >
                  Email visitor
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void patchInquiry({
                      mark_reviewed: true,
                      status: "reviewed",
                      successMessage: "Reviewed",
                    })
                  }
                  className="flex-1 rounded-lg py-2 text-xs font-bold text-[var(--text-muted)] transition hover:bg-[var(--border)] disabled:opacity-50"
                >
                  Mark reviewed
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
                  className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
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
