import { Link } from "react-router-dom";
import { ContactChatPanel } from "@/components/chat/ContactChatPanel";
import { isClerkConfigured } from "@/lib/clerk";
import { social } from "@/content/social";
import { t } from "@/i18n/en";
import { Button } from "@/components/ui/Button";

const mailLink = social.find((s) => s.name === "mail")?.url ?? "mailto:hello@kofiyesu.dev";

export function ChatPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex h-[calc(100dvh-72px-env(safe-area-inset-bottom,0px))] max-w-3xl flex-col px-4 pb-4 pt-6 sm:px-6 md:h-[calc(100dvh-5rem)] md:pb-6 md:pt-20"
    >
      <div className="mb-4 hidden shrink-0 md:block">
        <Link to="/" className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--color-accent)]">
          ← {t("back-to-home")}
        </Link>
        <h1 className="mt-3 text-xl font-black md:text-2xl">{t("chat-title")}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("chat-subtitle")}</p>
      </div>

      <div className="mb-4 shrink-0 md:hidden">
        <h1 className="text-lg font-black">{t("chat-title")}</h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{t("chat-subtitle")}</p>
      </div>

      {!isClerkConfigured ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 text-center text-sm text-[var(--text-muted)]">
          <p>{t("chat-guest-fallback")}</p>
          <a href={mailLink}>
            <Button>{t("chat-email-cta")}</Button>
          </a>
          <Link to="/" className="font-semibold text-[var(--color-accent)]">
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
