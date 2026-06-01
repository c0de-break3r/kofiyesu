import { useRef } from "react";
import type { ChatMessageAttachmentView } from "@/lib/contactAi";
import {
  CHAT_FILE_ACCEPT,
  CHAT_MAX_FILES,
  formatFileSize,
  isImageMime,
  isPdfMime,
  type ChatAttachment,
} from "@/lib/chatAttachments";
import { t } from "@/i18n/en";

interface Props {
  role: "user" | "assistant";
  content: string;
  attachments?: ChatMessageAttachmentView[];
  canEdit?: boolean;
  isEditing?: boolean;
  editDraft?: string;
  editFiles?: ChatAttachment[];
  onStartEdit?: () => void;
  onEditDraftChange?: (value: string) => void;
  onPickEditFiles?: (files: FileList | null) => void;
  onRemoveEditFile?: (id: string) => void;
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

  const muted = "text-[var(--text-muted)]";
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

function EditAttachmentPicker({
  files,
  onPick,
  onRemove,
}: {
  files: ChatAttachment[];
  onPick: (files: FileList | null) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = files.length < CHAT_MAX_FILES;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="relative flex max-w-[min(100%,10rem)] items-center gap-2 rounded-xl border border-white/30 bg-white/10 py-1 pr-1 pl-1.5"
        >
          {isImageMime(file.mimeType) ? (
            <img
              src={file.previewUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">
              {isPdfMime(file.mimeType) ? "PDF" : "FILE"}
            </span>
          )}
          <div className="min-w-0 flex-1 pr-6">
            <p className="truncate text-[11px] font-semibold text-white">{file.name}</p>
            <p className="text-[10px] text-white/70">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/30 text-xs text-white hover:bg-black/50"
            aria-label={t("chat-remove-file")}
          >
            ×
          </button>
        </div>
      ))}

      {canAdd ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={CHAT_FILE_ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => {
              onPick(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/40 bg-white/5 text-2xl font-light text-white transition hover:border-white hover:bg-white/10"
            aria-label={t("chat-attach")}
            title={t("chat-attach-hint")}
          >
            +
          </button>
        </>
      ) : null}
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
  editFiles = [],
  onStartEdit,
  onEditDraftChange,
  onPickEditFiles,
  onRemoveEditFile,
  onSaveEdit,
  onCancelEdit,
}: Props) {
  const isUser = role === "user";
  const trimmed = content.trim();
  const isAttachmentPlaceholder = trimmed.startsWith("[Attached:");
  const hasText = trimmed.length > 0 && !isAttachmentPlaceholder;
  const canSaveEdit = Boolean(editDraft.trim() || editFiles.length > 0);
  const showBubble =
    isEditing || hasText || (!isUser && attachments.length > 0) || (isUser && isEditing);

  return (
    <div className={`group flex w-full flex-col ${isUser ? "items-end" : "items-start"}`}>
      {!isEditing && isUser && attachments.length > 0 && (
        <div className="mb-1.5 max-w-[min(100%,42rem)]">
          <AttachmentList attachments={attachments} variant="user" />
        </div>
      )}

      {isEditing && isUser && onPickEditFiles && onRemoveEditFile && (
        <div className="mb-1.5 max-w-[min(100%,42rem)]">
          <EditAttachmentPicker
            files={editFiles}
            onPick={onPickEditFiles}
            onRemove={onRemoveEditFile}
          />
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
              {isUser && editFiles.length === 0 && attachments.length > 0 && !attachments[0]?.previewUrl ? (
                <p className="text-xs text-white/75">{t("chat-edit-attachments-hint")}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={!canSaveEdit}
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
      ) : isEditing && isUser ? (
        <div className="max-w-[min(100%,42rem)] rounded-2xl rounded-br-md bg-[var(--color-accent)] px-4 py-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={!canSaveEdit}
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
