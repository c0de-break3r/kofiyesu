import type { ChatMessageAttachmentView } from "@/lib/contactAi";
import { formatFileSize, isImageMime, isPdfMime } from "@/lib/chatAttachments";
import { t } from "@/i18n/en";

interface Props {
  role: "user" | "assistant";
  content: string;
  attachments?: ChatMessageAttachmentView[];
  canEdit?: boolean;
  isEditing?: boolean;
  editDraft?: string;
  onStartEdit?: () => void;
  onEditDraftChange?: (value: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

function formatContent(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function AttachmentList({
  attachments,
  variant,
}: {
  attachments: ChatMessageAttachmentView[];
  variant: "user" | "assistant";
}) {
  if (!attachments.length) return null;

  const muted = variant === "user" ? "text-[var(--text-muted)]" : "text-[var(--text-muted)]";
  const chipBg =
    variant === "user"
      ? "border border-[var(--border)] bg-[var(--bg-elevated)]"
      : "bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]";

  return (
    <div className="mb-2 flex flex-col gap-2">
      {attachments.map((att) =>
        isImageMime(att.mimeType) && att.previewUrl ? (
          <img
            key={att.id}
            src={att.previewUrl}
            alt={att.name}
            className="max-h-48 max-w-full rounded-xl object-contain"
          />
        ) : (
          <div
            key={att.id}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${chipBg}`}
          >
            <span className="font-bold">{isPdfMime(att.mimeType) ? "PDF" : "FILE"}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{att.name}</span>
            {att.size != null && <span className={muted}>{formatFileSize(att.size)}</span>}
          </div>
        ),
      )}
    </div>
  );
}

export function ChatMessage({
  role,
  content,
  attachments = [],
  canEdit,
  isEditing,
  editDraft = "",
  onStartEdit,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
}: Props) {
  const isUser = role === "user";
  const trimmed = content.trim();
  const isAttachmentPlaceholder = trimmed.startsWith("[Attached:");
  const hasText = trimmed.length > 0 && !isAttachmentPlaceholder;
  const showBubble = isEditing || hasText || (!isUser && attachments.length > 0);

  return (
    <div className={`group flex w-full flex-col ${isUser ? "items-end" : "items-start"}`}>
      {!isEditing && isUser && attachments.length > 0 && (
        <div className="mb-1.5 max-w-[min(100%,42rem)]">
          <AttachmentList attachments={attachments} variant="user" />
        </div>
      )}

      {showBubble ? (
        <div
          className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed ${
            isUser
              ? "rounded-br-md bg-[var(--color-accent)] text-white shadow-sm"
              : "rounded-bl-md bg-transparent text-[var(--text)]"
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editDraft}
                onChange={(e) => onEditDraftChange?.(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/60 focus:border-white"
                placeholder={t("chat-edit-placeholder")}
              />
              {attachments.length > 0 && (
                <p className="text-xs text-white/75">{t("chat-edit-attachments-hint")}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={!editDraft.trim()}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-accent)] disabled:opacity-50"
                >
                  {t("chat-save-edit")}
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10"
                >
                  {t("chat-cancel-edit")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {!isUser && attachments.length > 0 ? (
                <AttachmentList attachments={attachments} variant="assistant" />
              ) : null}
              {hasText ? (
                <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {canEdit && !isEditing && onStartEdit && (
        <button
          type="button"
          onClick={onStartEdit}
          className="mt-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)] transition hover:text-[var(--color-accent)] sm:opacity-0 sm:group-hover:opacity-100"
        >
          {t("chat-edit-message")}
        </button>
      )}
    </div>
  );
}

export function ChatTyping() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--chat-assistant)] px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:300ms]" />
      </div>
    </div>
  );
}
