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

interface Props {
  fixed?: boolean;
}

export function ContactChatPanel({ fixed }: Props) {
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

  const shellClass = fixed
    ? "flex min-h-0 flex-1 flex-col"
    : "flex flex-col gap-4";

  return (
    <div className={shellClass}>
      {!isLoaded && (
        <p className="p-6 text-sm text-[var(--text-muted)]">{t("chat-loading")}</p>
      )}

      {isLoaded && !isSignedIn && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="max-w-sm text-sm text-[var(--text-muted)]">{t("chat-sign-in-required")}</p>
          <SignInButton mode="modal">
            <Button>{t("chat-sign-in")}</Button>
          </SignInButton>
        </div>
      )}

      {isSignedIn && phase === "intake" && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-6">
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
        <>
          <div
            ref={messagesEl}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-5"
          >
            <p className="text-center text-xs text-[var(--text-muted)]">{t("intake-done-hint")}</p>
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {isLoading && <ChatTyping />}
            <div ref={bottomRef} />
          </div>

          {(routing?.escalateToAdmin || mailtoUrl) && (
            <div className="shrink-0 space-y-2 border-t border-[var(--border)] px-4 py-3">
              {routing?.escalateToAdmin && (
                <p className="rounded-lg bg-orange-500/10 px-3 py-2 text-center text-sm font-semibold text-[var(--color-accent)]">
                  {t("chat-escalated")}
                </p>
              )}
              {mailtoUrl && (
                <a href={mailtoUrl} className="flex justify-center">
                  <Button variant="border">{t("chat-send-email")}</Button>
                </a>
              )}
            </div>
          )}

          <div className="shrink-0 border-t border-[var(--border)] p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                rows={2}
                placeholder={t("chat-placeholder")}
                disabled={isLoading}
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="button"
                disabled={!input.trim() || isLoading}
                onClick={() => void handleSend()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-lg text-white transition disabled:opacity-40"
                aria-label={t("chat-send")}
              >
                ↑
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
