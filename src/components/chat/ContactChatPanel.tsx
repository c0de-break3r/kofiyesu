import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser, SignInButton } from "@clerk/clerk-react";
import { BackIconLink } from "@/components/layout/BackIconLink";
import { Button } from "@/components/ui/Button";
import { ChatComposer } from "./ChatComposer";
import { ChatHistoryDrawer } from "./ChatHistoryDrawer";
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
import {
  type ChatConversationSummary,
  clearConversationMessages,
  createConversation,
  deleteConversation,
  ensureActiveConversation,
  ensureMessageIds,
  listConversations,
  loadConversation,
  saveConversation,
} from "@/lib/chatHistory";
import { shouldQueueInquiry } from "@/lib/inquiryQueue";
import { submitInquiry } from "@/lib/submitInquiry";
import { useAdminPanel } from "@/hooks/useAdminPanel";
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

function newUserMessage(content: string, attachments?: ChatMessageAttachmentView[]): ChatMsg {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
    attachments,
  };
}

export function ContactChatPanel() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const { open: adminOpen } = useAdminPanel();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<ChatAttachment[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routing, setRouting] = useState<RoutingResult | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const messagesEl = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = messagesEl.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const welcomeMessages = useCallback((): ChatMsg[] => {
    const name = user?.firstName ?? user?.fullName ?? null;
    return ensureMessageIds([{ role: "assistant", content: getWelcomeMessage(name) }]);
  }, [user]);

  const refreshConversationList = useCallback(async () => {
    if (!user?.id) return;
    const list = await listConversations(getToken, user.id);
    setConversations(list);
  }, [getToken, user?.id]);

  const applyConversation = useCallback(
    (id: string, loadedMessages: ChatMsg[], isEmpty: boolean) => {
      setConversationId(id);
      setEditingId(null);
      setEditDraft("");
      setRouting(null);
      if (isEmpty || loadedMessages.length === 0) {
        setMessages(welcomeMessages());
      } else {
        setMessages(ensureMessageIds(loadedMessages));
      }
    },
    [welcomeMessages],
  );

  const loadConversationById = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      setHistoryLoading(true);
      const loaded = await loadConversation(getToken, user.id, id);
      setHistoryLoading(false);
      if (!loaded) return;
      applyConversation(loaded.id, loaded.messages, loaded.messages.length === 0);
    },
    [applyConversation, getToken, user?.id],
  );

  useEffect(() => {
    if (!isSignedIn || !isLoaded || !user?.id) {
      setHistoryReady(false);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryReady(false);

    void (async () => {
      await refreshConversationList();
      const active = await ensureActiveConversation(getToken, user.id);
      if (cancelled) return;
      applyConversation(active.id, active.messages, active.messages.length === 0);
      setHistoryLoading(false);
      setHistoryReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isLoaded, user?.id, getToken, applyConversation, refreshConversationList]);

  useEffect(() => {
    if (!historyReady) return;
    scrollToBottom(historyLoading ? "auto" : "smooth");
  }, [messages, isLoading, routing, scrollToBottom, historyReady, historyLoading]);

  useEffect(() => {
    const el = messagesEl.current;
    if (!el) return;

    if (adminOpen) {
      el.style.paddingBottom = "1rem";
      return;
    }

    const composer = composerRef.current;
    if (!composer) return;

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
  }, [routing, pendingFiles.length, isSignedIn, historyOpen, adminOpen]);

  const persistConversation = useCallback(
    (next: ChatMsg[]) => {
      if (!user?.id || !conversationId) return;
      void saveConversation(getToken, user.id, conversationId, next);
      void refreshConversationList();
    },
    [conversationId, getToken, refreshConversationList, user?.id],
  );

  const runAssistantTurn = useCallback(
    async (contextMessages: ChatMsg[], userTextForInquiry: string) => {
      const result = await routeInquiryWithAi({
        messages: contextMessages,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userId: user?.id,
        userName: user?.fullName,
      });

      const finalMessages: ChatMsg[] = [
        ...contextMessages,
        { id: crypto.randomUUID(), role: "assistant", content: result.reply },
      ];
      setRouting(result);
      setMessages(finalMessages);
      persistConversation(finalMessages);

      if (shouldQueueInquiry(result.inquiryType, result)) {
        await submitInquiry({
          inquiryType: result.inquiryType,
          message: userTextForInquiry,
          needsAdmin: result.escalateToAdmin ?? false,
          userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
          userName: user?.fullName ?? null,
          getToken,
        });
      }

      return result;
    },
    [getToken, persistConversation, user],
  );

  const handleNewChat = async () => {
    if (!user?.id) return;
    const created = await createConversation(getToken, user.id);
    await refreshConversationList();
    applyConversation(created.id, [], true);
    setHistoryOpen(false);
  };

  const handleClearChat = async () => {
    if (!user?.id || !conversationId) return;
    await clearConversationMessages(getToken, user.id, conversationId);
    await refreshConversationList();
    applyConversation(conversationId, [], true);
    setHistoryOpen(false);
  };

  const handleDeleteChat = async () => {
    if (!user?.id || !conversationId) return;
    await deleteConversation(getToken, user.id, conversationId);
    const list = await listConversations(getToken, user.id);
    setConversations(list);
    if (list.length > 0) {
      await loadConversationById(list[0].id);
    } else {
      const created = await createConversation(getToken, user.id);
      await refreshConversationList();
      applyConversation(created.id, [], true);
    }
    setHistoryOpen(false);
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
    if (!isSignedIn || !conversationId) return;
    const text = input.trim();
    const files = pendingFiles;
    if ((!text && files.length === 0) || isLoading) return;

    const attachmentViews = toMessageAttachments(files);
    const displayContent = text || attachmentSummary(files);
    const userMessage = newUserMessage(
      displayContent,
      attachmentViews.length ? attachmentViews : undefined,
    );

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setPendingFiles([]);
    setFileError(null);
    setIsLoading(true);
    setRouting(null);
    setEditingId(null);

    const result = await routeInquiryWithAi({
      messages: nextMessages,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      userId: user?.id,
      userName: user?.fullName,
      pendingAttachments: files,
    });

    files.forEach(revokeAttachmentPreview);

    const finalMessages: ChatMsg[] = [
      ...nextMessages,
      { id: crypto.randomUUID(), role: "assistant", content: result.reply },
    ];
    setRouting(result);
    setMessages(finalMessages);
    persistConversation(finalMessages);

    const inquiryBody = [text, files.length ? attachmentSummary(files) : ""].filter(Boolean).join("\n\n");
    if (shouldQueueInquiry(result.inquiryType, result)) {
      await submitInquiry({
        inquiryType: result.inquiryType,
        message: inquiryBody || displayContent,
        needsAdmin: result.escalateToAdmin ?? false,
        userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
        userName: user?.fullName ?? null,
        getToken,
      });
    }

    setIsLoading(false);
  };

  const handleStartEdit = (msg: ChatMsg) => {
    if (msg.role !== "user" || !msg.id) return;
    setEditingId(msg.id);
    setEditDraft(msg.content.startsWith("[Attached:") ? "" : msg.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !conversationId) return;
    const text = editDraft.trim();
    if (!text) return;

    const idx = messages.findIndex((m) => m.id === editingId);
    if (idx < 0 || messages[idx].role !== "user") return;

    const updatedUser: ChatMsg = {
      ...messages[idx],
      content: text,
    };
    const truncated = [...messages.slice(0, idx), updatedUser];
    setMessages(truncated);
    setEditingId(null);
    setEditDraft("");
    setIsLoading(true);
    setRouting(null);

    await runAssistantTurn(truncated, text);
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
        <>
        <div className="shrink-0 px-4 pt-3 pb-2 sm:px-6">
          <BackIconLink to="/" ariaLabel={t("back-to-home")} />
        </div>
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
        </>
      )}

      {isSignedIn && (
        <>
          <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2 sm:px-6">
            <BackIconLink to="/" ariaLabel={t("back-to-home")} />
            <button
              type="button"
              onClick={() => {
                void refreshConversationList();
                setHistoryOpen(true);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              aria-label={t("chat-history")}
              title={t("chat-history")}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <ChatHistoryDrawer
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            conversations={conversations}
            activeId={conversationId}
            loading={historyLoading}
            onSelect={(id) => {
              void loadConversationById(id);
              setHistoryOpen(false);
            }}
            onNewChat={() => void handleNewChat()}
            onClearChat={() => void handleClearChat()}
            onDeleteChat={() => void handleDeleteChat()}
          />

          <div
            ref={messagesEl}
            className="chat-messages-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
            data-chat-scroll
            data-lenis-prevent
            data-lenis-prevent-wheel
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
              {historyLoading && !historyReady && (
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
                messages.map((msg) => (
                  <ChatMessage
                    key={msg.id ?? `${msg.role}-${msg.content.slice(0, 16)}`}
                    role={msg.role}
                    content={msg.content}
                    attachments={msg.attachments}
                    canEdit={msg.role === "user" && Boolean(msg.id) && !isLoading}
                    isEditing={editingId === msg.id}
                    editDraft={editDraft}
                    onStartEdit={() => handleStartEdit(msg)}
                    onEditDraftChange={setEditDraft}
                    onSaveEdit={() => void handleSaveEdit()}
                    onCancelEdit={() => {
                      setEditingId(null);
                      setEditDraft("");
                    }}
                  />
                ))}

              {historyReady && !showReadyState && isLoading && <ChatTyping />}
            </div>
          </div>

          {!adminOpen && (
            <ChatComposer
              composerRef={composerRef}
              input={input}
              onInputChange={setInput}
              pendingFiles={pendingFiles}
              onPickFiles={(list) => void handlePickFiles(list)}
              onRemoveFile={handleRemoveFile}
              onSend={() => void handleSend()}
              isLoading={isLoading || (historyLoading && !historyReady)}
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
          )}
        </>
      )}
    </div>
  );
}
