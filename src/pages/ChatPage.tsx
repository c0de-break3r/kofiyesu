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
      className="flex min-h-[100dvh] flex-col bg-[var(--bg)] pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-0 md:pt-[var(--height-header,5rem)]"
    >
      <div className="shrink-0 px-4 pt-4 sm:px-6">
        <BackIconLink to="/" ariaLabel={t("back-to-home")} />
      </div>

      {!isClerkConfigured ? (
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-8 text-center text-sm text-[var(--text-muted)] sm:px-6">
          <h1 className="text-xl font-black text-[var(--text)] md:text-2xl">{t("chat-title")}</h1>
          <p>{t("chat-guest-fallback")}</p>
          <a href={mailLink}>
            <Button>{t("chat-email-cta")}</Button>
          </a>
        </div>
      ) : (
        <ContactChatPanel />
      )}
    </main>
  );
}
