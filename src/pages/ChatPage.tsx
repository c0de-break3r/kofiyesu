import { BackIconLink } from "@/components/layout/BackIconLink";
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
      data-chat-page
      className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[var(--bg)] md:pt-[var(--height-header,5rem)]"
    >
      {!isClerkConfigured && (
        <div className="shrink-0 px-4 pt-3 pb-2 sm:px-6">
          <BackIconLink to="/" ariaLabel={t("back-to-home")} />
        </div>
      )}

      {!isClerkConfigured ? (
        <div className="mx-auto flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 py-8 text-center text-sm text-[var(--text-muted)] sm:px-6">
          <h1 className="text-xl font-black text-[var(--text)] md:text-2xl">{t("chat-title")}</h1>
          <p>{t("chat-guest-fallback")}</p>
          <a href={mailLink}>
            <Button>{t("chat-email-cta")}</Button>
          </a>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <ContactChatPanel />
        </div>
      )}
    </main>
  );
}
