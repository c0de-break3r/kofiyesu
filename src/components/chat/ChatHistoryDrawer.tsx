import { Button } from "@/components/ui/Button";
import { t } from "@/i18n/en";
import type { ChatConversationSummary } from "@/lib/chatHistory";

interface Props {
  open: boolean;
  onClose: () => void;
  conversations: ChatConversationSummary[];
  activeId: string | null;
  loading?: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
}

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function ChatHistoryDrawer({
  open,
  onClose,
  conversations,
  activeId,
  loading,
  onSelect,
  onNewChat,
  onClearChat,
  onDeleteChat,
}: Props) {
  const active = conversations.find((c) => c.id === activeId);

  return (
    <div
      className={`fixed inset-0 z-[100] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label={t("chat-close-history")}
        onClick={onClose}
      />

      <aside
        className={`absolute top-0 right-0 flex h-full w-full max-w-sm flex-col border-l border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-history-title"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <h2 id="chat-history-title" className="text-lg font-black">
            {t("chat-history-title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[var(--text-muted)] transition hover:bg-black/5 hover:text-[var(--text)]"
            aria-label={t("chat-close-history")}
          >
            ×
          </button>
        </div>

        <div className="border-b border-[var(--border)] p-4">
          <Button className="w-full" onClick={onNewChat}>
            {t("chat-new-chat")}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3" data-lenis-prevent>
          {loading && (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">{t("chat-history-loading")}</p>
          )}

          {!loading && conversations.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">{t("chat-no-history")}</p>
          )}

          {!loading &&
            conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onSelect(conv.id)}
                  className={`mb-2 w-full rounded-xl border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]"
                      : "border-[var(--border)] bg-[var(--bg)] hover:border-[color-mix(in_srgb,var(--color-accent)_35%,var(--border))]"
                  }`}
                >
                  <p className="truncate text-sm font-bold text-[var(--text)]">{conv.title}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{conv.preview}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {formatWhen(conv.updatedAt)}
                  </p>
                </button>
              );
            })}
        </div>

        {active && (
          <div className="shrink-0 space-y-2 border-t border-[var(--border)] p-4">
            <p className="truncate text-xs font-semibold text-[var(--text-muted)]">{active.title}</p>
            <Button variant="border" className="w-full" onClick={onClearChat}>
              {t("chat-clear-chat")}
            </Button>
            <button
              type="button"
              onClick={onDeleteChat}
              className="w-full rounded-full border border-red-500/30 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-500/10"
            >
              {t("chat-delete-chat")}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
