import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/Button";
import { ChatIntakeFlow } from "./ChatIntakeFlow";
import { ChatMessage, ChatTyping } from "./ChatMessage";
import { t } from "@/i18n/en";
import {
  type ChatMessage as ChatMsg,
  type RoutingResult,
  getWelcomeMessage,
  routeInquiryWithAi,
} from "@/lib/contactAi";
import { buildMailtoUrl, getInquiryRoute } from "@/content/contact";
import {
  type ChatIntakeData,
  INTAKE_SESSION_KEY,
  formatIntakeMessage,
  intakeContextForAi,
  intakeNeedsAdmin,
} from "@/lib/chatIntake";
import { submitInquiry } from "@/lib/submitInquiry";
import { clearIntakeDraft } from "@/lib/intakeDraft";
import { social } from "@/content/social";

export function ContactChatPanel() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  const [phase, setPhase] = useState<"intake" | "chat">("intake");
  const [intakeData, setIntakeData] = useState<ChatIntakeData | null>(null);
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [routing, setRouting] = useState<RoutingResult | null>(null);
  const messagesEl = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(INTAKE_SESSION_KEY) === "1") {
      setPhase("chat");
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    const name = user?.firstName ?? user?.fullName ?? null;
    if (intakeData) {
      const route = getInquiryRoute(intakeData.projectType);
      setMessages([
        { role: "assistant", content: t("chat-welcome-intake", { type: route.label.toLowerCase() }) },
      ]);
    } else {
      setMessages([{ role: "assistant", content: getWelcomeMessage(name) }]);
    }
  }, [isSignedIn, user, intakeData, phase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, phase]);

  const handleIntakeComplete = async (intake: ChatIntakeData) => {
    setIntakeSubmitting(true);
    setIntakeError(null);

    const saved = await submitInquiry({
      inquiryType: intake.projectType,
      message: formatIntakeMessage(intake),
      needsAdmin: intakeNeedsAdmin(intake),
      intake,
      userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
      userName: user?.fullName ?? null,
      getToken,
    });

    setIntakeSubmitting(false);
    if (!saved.ok) {
      setIntakeError("Could not save your intake. Try again.");
      return;
    }

    setIntakeData(intake);
    sessionStorage.setItem(INTAKE_SESSION_KEY, "1");
    clearIntakeDraft();
    setPhase("chat");
  };

  const handleSend = async () => {
    if (!isSignedIn || phase !== "chat") return;
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setRouting(null);

    const result = await routeInquiryWithAi({
      messages: nextMessages,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      userId: user?.id,
      userName: user?.fullName,
      intakeContext: intakeData ? intakeContextForAi(intakeData) : undefined,
    });

    setRouting(result);
    setMessages((m) => [...m, { role: "assistant", content: result.reply }]);

    await submitInquiry({
      inquiryType: result.inquiryType,
      message: text,
      needsAdmin: result.escalateToAdmin ?? false,
      userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
      userName: user?.fullName ?? null,
      getToken,
    });

    setIsLoading(false);
  };

  const mailtoUrl = useMemo(() => {
    if (!routing?.showEmailCta && !routing?.escalateToAdmin) return null;
    const route = getInquiryRoute(routing.inquiryType);
    const userMsgs = messages.filter((m) => m.role === "user").map((m) => m.content);
    return buildMailtoUrl(route, userMsgs.join("\n\n"));
  }, [routing, messages]);

  const hasUserMessages = messages.some((m) => m.role === "user");
  const showReadyState = phase === "chat" && !hasUserMessages && !isLoading;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isLoaded && (
        <p className="p-6 text-sm text-[var(--text-muted)]">{t("chat-loading")}</p>
      )}

      {isLoaded && !isSignedIn && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-xl font-black md:text-2xl">{t("chat-title")}</h1>
          <p className="max-w-sm text-sm text-[var(--text-muted)]">{t("chat-sign-in-required")}</p>
          <SignInButton mode="modal">
            <Button>{t("chat-sign-in")}</Button>
          </SignInButton>
          <p className="text-xs text-[var(--text-muted)]">{t("chat-guest-fallback")}</p>
          <a href={social.find((s) => s.name === "mail")?.url ?? "mailto:hello@kofiyesu.com"}>
            <Button variant="border">{t("chat-email-cta")}</Button>
          </a>
        </div>
      )}

      {isSignedIn && phase === "intake" && (
        <div
          className="mx-auto flex w-full max-w-xl flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 md:py-8"
          data-lenis-prevent
        >
          <div className="mb-6 shrink-0">
            <h1 className="text-xl font-black md:text-2xl">{t("chat-title")}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t("chat-subtitle")}</p>
          </div>
          {intakeSubmitting && (
            <p className="text-center text-sm text-[var(--text-muted)]">{t("intake-submitting")}</p>
          )}
          {intakeError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm font-semibold text-red-500">
              {intakeError}
            </p>
          )}
          {!intakeSubmitting && !intakeError && <ChatIntakeFlow onComplete={handleIntakeComplete} />}
        </div>
      )}

      {isSignedIn && phase === "chat" && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            ref={messagesEl}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            data-lenis-prevent
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
              {showReadyState && (
                <div className="flex flex-col items-center justify-center py-10 text-center sm:py-16">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-2xl">
                    ✦
                  </div>
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{t("chat-ready-title")}</h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
                    {t("chat-ready-subtitle")}
                  </p>
                </div>
              )}
              {!showReadyState &&
                messages.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
              {!showReadyState && isLoading && <ChatTyping />}
              <div ref={bottomRef} />
            </div>
          </div>

          {(routing?.escalateToAdmin || mailtoUrl) && (
            <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg)]">
              <div className="mx-auto max-w-3xl space-y-2 px-4 py-3 sm:px-6">
                {routing?.escalateToAdmin && (
                  <p className="rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] px-3 py-2 text-center text-sm font-semibold text-[var(--color-accent)]">
                    {t("chat-escalated")}
                  </p>
                )}
                {mailtoUrl && (
                  <a href={mailtoUrl} className="flex justify-center">
                    <Button variant="border">{t("chat-send-email")}</Button>
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg)] pb-[env(safe-area-inset-bottom,0px)]">
            <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3 sm:px-6 sm:py-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                rows={1}
                placeholder={t("chat-placeholder")}
                disabled={isLoading}
                className="max-h-40 min-h-[48px] flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="button"
                disabled={!input.trim() || isLoading}
                onClick={() => void handleSend()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-lg text-white transition disabled:opacity-40"
                aria-label={t("chat-send")}
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
