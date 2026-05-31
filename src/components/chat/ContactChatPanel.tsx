import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/Button";
import { ChatComposer } from "./ChatComposer";
import { ChatMessage, ChatTyping } from "./ChatMessage";
import { t } from "@/i18n/en";
import {
  type ChatMessage as ChatMsg,
  type ChatMessageAttachmentView,
  type RoutingResult,
  getWelcomeMessage,
  routeInquiryWithAi,
} from "@/lib/contactAi";
import { buildMailtoUrl, getInquiryRoute } from "@/content/contact";
import {
  type ChatAttachment,
  CHAT_MAX_FILES,
  attachmentSummary,
  readFileAsAttachment,
  revokeAttachmentPreview,
} from "@/lib/chatAttachments";
import { clearChatHistory, loadChatHistory, saveChatHistory } from "@/lib/chatHistory";
import { submitInquiry } from "@/lib/submitInquiry";
import { social } from "@/content/social";

function toMessageAttachments(files: ChatAttachment[]): ChatMessageAttachmentView[] {
  return files.map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size,
    previewUrl: f.previewUrl,
  }));
}

export function ContactChatPanel() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<ChatAttachment[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routing, setRouting] = useState<RoutingResult | null>(null);
  const messagesEl = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = messagesEl.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const welcomeMessages = useCallback((): ChatMsg[] => {
    const name = user?.firstName ?? user?.fullName ?? null;
    return [{ role: "assistant", content: getWelcomeMessage(name) }];
  }, [user]);

  useEffect(() => {
    if (!isSignedIn || !isLoaded || !user?.id) {
      setHistoryReady(false);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryReady(false);

    void loadChatHistory(getToken, user.id).then((stored) => {
      if (cancelled) return;
      if (stored.length > 0) {
        setMessages(stored);
      } else {
        setMessages(welcomeMessages());
      }
      setHistoryLoading(false);
      setHistoryReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isLoaded, user?.id, getToken, welcomeMessages]);

  useEffect(() => {
    if (!historyReady) return;
    scrollToBottom(historyLoading ? "auto" : "smooth");
  }, [messages, isLoading, routing, scrollToBottom, historyReady, historyLoading]);

  useEffect(() => {
    const el = messagesEl.current;
    const composer = composerRef.current;
    if (!el || !composer) return;

    const applyPadding = () => {
      el.style.paddingBottom = `${composer.offsetHeight + 12}px`;
    };

    applyPadding();
    const ro = new ResizeObserver(applyPadding);
    ro.observe(composer);
    window.addEventListener("resize", applyPadding);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applyPadding);
    };
  }, [routing, pendingFiles.length, isSignedIn]);

  const persistHistory = useCallback(
    (next: ChatMsg[]) => {
      if (!user?.id) return;
      void saveChatHistory(getToken, user.id, next);
    },
    [getToken, user?.id],
  );

  const handleClearHistory = async () => {
    if (!user?.id) return;
    await clearChatHistory(getToken, user.id);
    setRouting(null);
    setMessages(welcomeMessages());
    setFileError(null);
  };

  const handlePickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setFileError(null);

    const slots = CHAT_MAX_FILES - pendingFiles.length;
    if (slots <= 0) {
      setFileError(t("chat-max-files", { max: CHAT_MAX_FILES }));
      return;
    }

    const picked = Array.from(files).slice(0, slots);
    try {
      const next = await Promise.all(picked.map(readFileAsAttachment));
      setPendingFiles((prev) => [...prev, ...next]);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not attach file.");
    }
  };

  const handleRemoveFile = (id: string) => {
    setPendingFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) revokeAttachmentPreview(removed);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSend = async () => {
    if (!isSignedIn) return;
    const text = input.trim();
    const files = pendingFiles;
    if ((!text && files.length === 0) || isLoading) return;

    const attachmentViews = toMessageAttachments(files);
    const displayContent = text || attachmentSummary(files);
    const userMessage: ChatMsg = {
      role: "user",
      content: displayContent,
      attachments: attachmentViews.length ? attachmentViews : undefined,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setPendingFiles([]);
    setFileError(null);
    setIsLoading(true);
    setRouting(null);

    const result = await routeInquiryWithAi({
      messages: nextMessages,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      userId: user?.id,
      userName: user?.fullName,
      pendingAttachments: files,
    });

    files.forEach(revokeAttachmentPreview);

    const finalMessages: ChatMsg[] = [...nextMessages, { role: "assistant", content: result.reply }];
    setRouting(result);
    setMessages(finalMessages);
    persistHistory(finalMessages);

    const inquiryBody = [text, files.length ? attachmentSummary(files) : ""].filter(Boolean).join("\n\n");

    await submitInquiry({
      inquiryType: result.inquiryType,
      message: inquiryBody || displayContent,
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
  const showReadyState = historyReady && !historyLoading && !hasUserMessages && !isLoading;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isLoaded && (
        <p className="p-6 text-sm text-[var(--text-muted)]">{t("chat-loading")}</p>
      )}

      {isLoaded && !isSignedIn && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-8 text-center">
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

      {isSignedIn && (
        <>
          <div className="flex shrink-0 items-center justify-end px-4 pb-1 sm:px-6">
            {hasUserMessages && historyReady && (
              <button
                type="button"
                onClick={() => void handleClearHistory()}
                className="text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--color-accent)]"
              >
                {t("chat-clear-history")}
              </button>
            )}
          </div>

          <div
            ref={messagesEl}
            className="chat-messages-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
            data-chat-scroll
            data-lenis-prevent
            data-lenis-prevent-wheel
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
              {historyLoading && (
                <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                  {t("chat-history-loading")}
                </p>
              )}

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

              {fileError && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm font-semibold text-red-500">
                  {fileError}
                </p>
              )}

              {historyReady &&
                !showReadyState &&
                messages.map((msg, i) => (
                  <ChatMessage
                    key={`${i}-${msg.role}-${msg.content.slice(0, 24)}`}
                    role={msg.role}
                    content={msg.content}
                    attachments={msg.attachments}
                  />
                ))}

              {historyReady && !showReadyState && isLoading && <ChatTyping />}
            </div>
          </div>

          <ChatComposer
            composerRef={composerRef}
            input={input}
            onInputChange={setInput}
            pendingFiles={pendingFiles}
            onPickFiles={(list) => void handlePickFiles(list)}
            onRemoveFile={handleRemoveFile}
            onSend={() => void handleSend()}
            isLoading={isLoading || historyLoading}
            escalateBanner={
              routing?.escalateToAdmin ? (
                <p className="glass-surface rounded-xl px-3 py-2 text-center text-sm font-semibold text-[var(--color-accent)]">
                  {t("chat-escalated")}
                </p>
              ) : undefined
            }
            mailtoBanner={
              mailtoUrl ? (
                <a href={mailtoUrl} className="flex justify-center">
                  <Button variant="border">{t("chat-send-email")}</Button>
                </a>
              ) : undefined
            }
          />
        </>
      )}
    </div>
  );
}
