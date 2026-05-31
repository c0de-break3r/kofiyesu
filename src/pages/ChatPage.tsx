import { ContactChatPanel } from "@/components/chat/ContactChatPanel";
import { isClerkConfigured } from "@/lib/clerk";
import { social } from "@/content/social";
import { t } from "@/i18n/en";
import { Button } from "@/components/ui/Button";

const mailLink = social.find((s) => s.name === "mail")?.url ?? "mailto:hello@kofiyesu.com";

export function ChatPage() {
  return (
    <main
      id="main-content"
      className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-6 sm:px-6 md:pb-12 md:pt-20"
    >
      <div className="mb-4 hidden shrink-0 md:block">
        <h1 className="text-xl font-black md:text-2xl">{t("chat-title")}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("chat-subtitle")}</p>
      </div>

      <div className="mb-4 shrink-0 md:hidden">
        <h1 className="text-lg font-black">{t("chat-title")}</h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{t("chat-subtitle")}</p>
      </div>

      {!isClerkConfigured ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 text-center text-sm text-[var(--text-muted)]">
          <p>{t("chat-guest-fallback")}</p>
          <a href={mailLink}>
            <Button>{t("chat-email-cta")}</Button>
          </a>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-lg">
          <ContactChatPanel />
        </div>
      )}
    </main>
  );
}
