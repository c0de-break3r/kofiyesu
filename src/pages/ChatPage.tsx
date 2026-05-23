import { Link } from "react-router-dom";
import { ContactChatPanel } from "@/components/chat/ContactChatPanel";
import { isClerkConfigured } from "@/lib/clerk";
import { t } from "@/i18n/en";

export function ChatPage() {
  return (
    <main className="mx-auto flex h-[calc(100dvh-4.5rem)] max-w-3xl flex-col px-4 pb-6 pt-20 sm:px-6">
      <div className="mb-4 shrink-0">
        <Link to="/" className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--color-accent)]">
          ← {t("back-to-home")}
        </Link>
        <h1 className="mt-3 text-xl font-black md:text-2xl">{t("chat-title")}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("chat-subtitle")}</p>
      </div>

      {!isClerkConfigured ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-muted)]">
          <p>{t("chat-clerk-missing")}</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-[var(--color-accent)]">
            {t("back-to-home")}
          </Link>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-lg">
          <ContactChatPanel fixed />
        </div>
      )}
    </main>
  );
}
