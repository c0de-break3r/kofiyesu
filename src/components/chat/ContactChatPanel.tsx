import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth, useUser, SignInButton } from "@clerk/clerk-react";
import { BackIconLink } from "@/components/layout/BackIconLink";
import { Button } from "@/components/ui/Button";
import { ChatComposer } from "./ChatComposer";
import { ChatHistoryDrawer } from "./ChatHistoryDrawer";
import { ChatMessage, ChatTyping } from "./ChatMessage";
import { ChatProjectPayment } from "./ChatProjectPayment";
import { t } from "@/i18n/en";
import {
  type ChatMessage as ChatMsg,
  type ChatMessageAttachmentView,
  type RoutingResult,
  getWelcomeMessage,
  routeInquiryWithAi,
} from "@/lib/contactAi";
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
import { readResponseJson } from "@/lib/readResponseJson";
import { submitInquiry } from "@/lib/submitInquiry";
import { useAdminPanel } from "@/hooks/useAdminPanel";
import { usePaystackPayment, type PaymentRow } from "@/hooks/usePaystackPayment";
import { paymentDescriptionFromQuote, type ProjectQuote } from "@/lib/projectQuote";
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
  const [showEscalateBanner, setShowEscalateBanner] = useState(false);
  const [payingKey, setPayingKey] = useState<"deposit" | "full" | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const { pay, paying } = usePaystackPayment({
    onSuccess: () => {
      setPaySuccess(true);
      setPayError(null);
      setPayingKey(null);
    },
    onError: (msg) => {
      setPayError(msg);
      setPayingKey(null);
    },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const messagesEl = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const attachmentCacheRef = useRef<Map<string, ChatAttachment[]>>(new Map());
  const [editPendingFiles, setEditPendingFiles] = useState<ChatAttachment[]>([]);

  useEffect(() => {
    if (!showEscalateBanner) return;
    const timer = window.setTimeout(() => setShowEscalateBanner(false), 6000);
    return () => window.clearTimeout(timer);
  }, [showEscalateBanner]);

  const syncRemoteMessages = useCallback(async () => {
    if (!user?.id || !conversationId || isLoading) return;
    const loaded = await loadConversation(getToken, user.id, conversationId);
    if (!loaded) return;
    const remote = ensureMessageIds(loaded.messages);
    setMessages((prev) => {
      const hasUser = prev.some((m) => m.role === "user");
      if (remote.length === 0 && hasUser) return prev;
      if (
        remote.length === prev.length &&
        remote.every((m, i) => m.id === prev[i]?.id && m.content === prev[i]?.content)
      ) {
        return prev;
      }
      return remote.length > 0 || !hasUser ? remote : prev;
    });
  }, [conversationId, getToken, isLoading, user?.id]);

  useEffect(() => {
    if (!historyReady || !conversationId) return;
    void syncRemoteMessages();
    const interval = window.setInterval(() => void syncRemoteMessages(), 12000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncRemoteMessages();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [historyReady, conversationId, syncRemoteMessages]);

  const applyComposerPadding = useCallback(() => {
    const el = messagesEl.current;
    if (!el) return;

    if (adminOpen || !historyReady) {
      el.style.paddingBottom = adminOpen ? "1rem" : "";
      return;
    }

    const composer = composerRef.current;
    if (!composer) {
      el.style.paddingBottom = "7.5rem";
      return;
    }

    el.style.paddingBottom = `${composer.offsetHeight + 16}px`;
  }, [adminOpen, historyReady]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = messagesEl.current;
    if (!el) return;
    applyComposerPadding();
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, [applyComposerPadding]);

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
      setEditPendingFiles([]);
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

  useLayoutEffect(() => {
    applyComposerPadding();

    if (adminOpen || !historyReady) return;

    const composer = composerRef.current;
    if (!composer) return;

    const ro = new ResizeObserver(() => applyComposerPadding());
    ro.observe(composer);
    window.addEventListener("resize", applyComposerPadding);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applyComposerPadding);
    };
  }, [
    applyComposerPadding,
    historyReady,
    adminOpen,
    routing,
    paySuccess,
    payError,
    pendingFiles.length,
    messages.length,
    isLoading,
    showEscalateBanner,
  ]);

  const handleProjectPay = useCallback(
    async (quote: ProjectQuote, kind: "deposit" | "full") => {
      if (!isSignedIn || paying) return;
      const amountGhs =
        kind === "deposit" && quote.depositGhs != null ? quote.depositGhs : quote.totalGhs;
      const title =
        kind === "deposit"
          ? `${quote.projectTitle} — kickoff deposit`
          : `${quote.projectTitle} — project payment`;

      setPayError(null);
      setPaySuccess(false);
      setPayingKey(kind);
      try {
        const token = await getToken();
        if (!token) throw new Error("Sign in required");

        const res = await fetch("/api/payments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            amount_ghs: amountGhs,
            description: paymentDescriptionFromQuote(quote),
            user_email: user?.primaryEmailAddress?.emailAddress ?? null,
            user_name: user?.fullName ?? null,
          }),
        });

        const data = await readResponseJson<{ payment: PaymentRow; error?: string }>(res);
        if (!res.ok || !data?.payment) {
          throw new Error(data?.error ?? "Could not start payment");
        }

        await pay(data.payment);
      } catch (err) {
        setPayError(err instanceof Error ? err.message : t("chat-pay-error"));
        setPayingKey(null);
      }
    },
    [getToken, isSignedIn, pay, paying, user],
  );

  const persistConversation = useCallback(
    (next: ChatMsg[]) => {
      if (!user?.id || !conversationId) return;
      void saveConversation(getToken, user.id, conversationId, next);
      void refreshConversationList();
    },
    [conversationId, getToken, refreshConversationList, user?.id],
  );

  const runAssistantTurn = useCallback(
    async (
      contextMessages: ChatMsg[],
      userTextForInquiry: string,
      pendingAttachments?: ChatAttachment[],
    ) => {
      const result = await routeInquiryWithAi({
        messages: contextMessages,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userId: user?.id,
        userName: user?.fullName,
        pendingAttachments,
      });

      const finalMessages: ChatMsg[] = [
        ...contextMessages,
        { id: crypto.randomUUID(), role: "assistant", content: result.reply },
      ];
      setRouting(result);
      setShowEscalateBanner(Boolean(result.escalateToAdmin));
      setPayError(null);
      if (!result.showPaymentOptions) setPaySuccess(false);
      setMessages(finalMessages);
      persistConversation(finalMessages);

      if (shouldQueueInquiry(result.inquiryType, result, userTextForInquiry)) {
        await submitInquiry({
          inquiryType: result.inquiryType,
          message: userTextForInquiry,
          needsAdmin: result.escalateToAdmin ?? false,
          conversationId,
          userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
          userName: user?.fullName ?? null,
          getToken,
        });
      }

      return result;
    },
    [conversationId, getToken, persistConversation, user],
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

    if (userMessage.id && files.length > 0) {
      attachmentCacheRef.current.set(userMessage.id, [...files]);
    }

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setPendingFiles([]);
    setFileError(null);
    setIsLoading(true);
    setRouting(null);
    setShowEscalateBanner(false);
    setPayError(null);
    setPaySuccess(false);
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
    setShowEscalateBanner(Boolean(result.escalateToAdmin));
    if (!result.showPaymentOptions) setPaySuccess(false);
    setMessages(finalMessages);
    persistConversation(finalMessages);

    const inquiryBody = [text, files.length ? attachmentSummary(files) : ""].filter(Boolean).join("\n\n");
    if (shouldQueueInquiry(result.inquiryType, result, inquiryBody || displayContent)) {
      await submitInquiry({
        inquiryType: result.inquiryType,
        message: inquiryBody || displayContent,
        needsAdmin: result.escalateToAdmin ?? false,
        conversationId,
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
    const cached = attachmentCacheRef.current.get(msg.id);
    setEditPendingFiles(cached ? [...cached] : []);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
    setEditPendingFiles([]);
  };

  const handlePickEditFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setFileError(null);

    const slots = CHAT_MAX_FILES - editPendingFiles.length;
    if (slots <= 0) {
      setFileError(t("chat-max-files", { max: CHAT_MAX_FILES }));
      return;
    }

    const picked = Array.from(files).slice(0, slots);
    try {
      const next = await Promise.all(picked.map(readFileAsAttachment));
      setEditPendingFiles((prev) => [...prev, ...next]);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not attach file.");
    }
  };

  const handleRemoveEditFile = (id: string) => {
    setEditPendingFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) revokeAttachmentPreview(removed);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !conversationId) return;
    const text = editDraft.trim();
    const files = editPendingFiles;
    if (!text && files.length === 0) return;

    const idx = messages.findIndex((m) => m.id === editingId);
    if (idx < 0 || messages[idx].role !== "user") return;

    const attachmentViews = toMessageAttachments(files);
    const displayContent = text || attachmentSummary(files);

    const updatedUser: ChatMsg = {
      ...messages[idx],
      content: displayContent,
      attachments: attachmentViews.length ? attachmentViews : undefined,
    };

    if (updatedUser.id && files.length > 0) {
      attachmentCacheRef.current.set(updatedUser.id, [...files]);
    } else if (updatedUser.id) {
      attachmentCacheRef.current.delete(updatedUser.id);
    }

    const truncated = [...messages.slice(0, idx), updatedUser];
    setMessages(truncated);
    setEditingId(null);
    setEditDraft("");
    setEditPendingFiles([]);
    setIsLoading(true);
    setRouting(null);
    setShowEscalateBanner(false);

    await runAssistantTurn(truncated, displayContent, files.length > 0 ? files : undefined);
    setIsLoading(false);
  };

  const hasUserMessages = messages.some((m) => m.role === "user");
  const showEmptyHint =
    historyReady && !historyLoading && !hasUserMessages && !isLoading && messages.length === 0;

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

              {showEmptyHint && (
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
                    editFiles={editingId === msg.id ? editPendingFiles : undefined}
                    onPickEditFiles={(list) => void handlePickEditFiles(list)}
                    onRemoveEditFile={handleRemoveEditFile}
                    onSaveEdit={() => void handleSaveEdit()}
                    onCancelEdit={handleCancelEdit}
                  />
                ))}

              {historyReady && isLoading && <ChatTyping />}

              {historyReady && routing?.showPaymentOptions && routing.projectQuote && (
                <ChatProjectPayment
                  quote={routing.projectQuote}
                  payingKey={paying ? payingKey : null}
                  onPay={(kind) => void handleProjectPay(routing.projectQuote!, kind)}
                />
              )}

              {paySuccess && (
                <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {t("pay-success")}
                </p>
              )}

              {payError && (
                <p className="rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-600">
                  {payError}
                </p>
              )}
            </div>
          </div>

          {!adminOpen && historyReady && (
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
                showEscalateBanner ? (
                  <p className="glass-surface rounded-xl px-3 py-2 text-center text-sm font-semibold text-[var(--color-accent)] transition-opacity duration-500">
                    {t("chat-escalated")}
                  </p>
                ) : undefined
              }
            />
          )}
        </>
      )}
    </div>
  );
}
