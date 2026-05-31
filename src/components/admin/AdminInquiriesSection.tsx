import { useCallback, useEffect, useState } from "react";
import { getInquiryRoute, buildMailtoUrl, type InquiryType } from "@/content/contact";
import { useAdminApi } from "@/hooks/useAdminApi";
import { Button } from "@/components/ui/Button";

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

const statusLabel: Record<InquiryStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  replied: "Replied",
  archived: "Archived",
};

const statusClass: Record<InquiryStatus, string> = {
  new: "bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)]",
  reviewed: "bg-blue-500/10 text-blue-700",
  replied: "bg-emerald-500/10 text-emerald-700",
  archived: "bg-[var(--border)] text-[var(--text-muted)]",
};

export function AdminInquiriesSection() {
  const { adminFetch } = useAdminApi();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [status, setStatus] = useState<InquiryStatus>("new");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

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
  }, [selected]);

  const patchInquiry = async (patch: {
    mark_reviewed?: boolean;
    status?: InquiryStatus;
    admin_notes?: string;
    reply_draft?: string;
  }) => {
    if (!selected) return;
    setSaving(true);
    setError(null);
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
    } catch {
      setError("Could not delete inquiry");
    } finally {
      setSaving(false);
    }
  };

  const openReplyMail = () => {
    if (!selected) return;
    const route = getInquiryRoute(selected.inquiry_type);
    const body = replyDraft.trim() || `Hi${selected.user_name ? ` ${selected.user_name.split(" ")[0]}` : ""},\n\n`;
    window.location.href = buildMailtoUrl(route, body);
    void patchInquiry({ status: "replied", mark_reviewed: true });
  };

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading inquiries…</p>;
  if (error && inquiries.length === 0) return <p className="text-sm text-red-500">{error}</p>;

  if (inquiries.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--text-muted)]">
          No business inquiries yet. Only collaboration, security, job, or urgent messages from chat are
          listed here — general Q&A stays in chat history only.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="text-xs text-[var(--text-muted)]">
        Business inquiries from chat (projects, websites, collaboration, security, jobs). Casual questions
        are not listed.
      </p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <ul className="max-h-40 shrink-0 space-y-2 overflow-y-auto overscroll-contain border-b border-[var(--border)] pb-3">
        {inquiries.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                item.id === selectedId
                  ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_6%,transparent)]"
                  : "border-[var(--border)] hover:border-[color-mix(in_srgb,var(--color-accent)_35%,var(--border))]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase text-[var(--color-accent)]">
                  {item.inquiry_type}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
                {item.needs_admin && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
                    Urgent
                  </span>
                )}
                <time className="ml-auto text-[10px] text-[var(--text-muted)]">
                  {new Date(item.created_at).toLocaleString()}
                </time>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">{item.message}</p>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain">
          <div>
            {(selected.user_name || selected.user_email) && (
              <p className="text-sm font-bold text-[var(--text)]">
                {selected.user_name}
                {selected.user_email ? (
                  <a
                    href={`mailto:${selected.user_email}`}
                    className="ml-2 font-semibold text-[var(--color-accent)]"
                  >
                    {selected.user_email}
                  </a>
                ) : null}
              </p>
            )}
            {selected.intake && Object.keys(selected.intake).length > 0 && (
              <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--bg)] p-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
                {JSON.stringify(selected.intake, null, 2)}
              </pre>
            )}
            <p className="mt-3 whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
              {selected.message}
            </p>
          </div>

          <label className="block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InquiryStatus)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm font-semibold"
            >
              {(Object.keys(statusLabel) as InquiryStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Admin notes
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes…"
              className="mt-1 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Reply draft
            <textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              rows={4}
              placeholder="Email reply to the client…"
              className="mt-1 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button disabled={saving} onClick={() => void patchInquiry({})}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              variant="border"
              disabled={saving}
              onClick={() => void patchInquiry({ mark_reviewed: true, status: "reviewed" })}
            >
              Mark reviewed
            </Button>
            <Button variant="border" disabled={saving} onClick={openReplyMail}>
              Reply
            </Button>
            <Button
              variant="border"
              disabled={saving}
              onClick={() => void patchInquiry({ status: "archived" })}
            >
              Archive
            </Button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void deleteInquiry()}
              className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
