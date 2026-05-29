import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

type Inquiry = {
  id: string;
  inquiry_type: string;
  message: string;
  needs_admin: boolean;
  user_email: string | null;
  user_name: string | null;
  intake: Record<string, unknown> | null;
  created_at: string;
};

export function AdminInquiriesSection() {
  const { getToken } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    const token = await getToken();
    if (!token) return;
    const res = await fetch("/api/admin/inquiries", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("Failed to load inquiries");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { inquiries?: Inquiry[] };
    setInquiries(data.inquiries ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [getToken]);

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Loading inquiries…</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  if (inquiries.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">No inquiries yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {inquiries.map((item) => (
        <li
          key={item.id}
          className={`rounded-xl border p-3 text-sm ${
            item.needs_admin ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)]" : "border-[var(--border)]"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-[var(--color-accent)]">{item.inquiry_type}</span>
            {item.needs_admin && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] px-2 py-0.5 text-[10px] font-bold uppercase">
                Urgent
              </span>
            )}
            <time className="ml-auto text-[10px] text-[var(--text-muted)]">
              {new Date(item.created_at).toLocaleString()}
            </time>
          </div>
          {(item.user_name || item.user_email) && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {item.user_name}
              {item.user_email ? ` · ${item.user_email}` : ""}
            </p>
          )}
          {item.intake && Object.keys(item.intake).length > 0 && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--bg)] p-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
              {JSON.stringify(item.intake, null, 2)}
            </pre>
          )}
          <p className="mt-2 whitespace-pre-wrap">{item.message}</p>
        </li>
      ))}
    </ul>
  );
}
