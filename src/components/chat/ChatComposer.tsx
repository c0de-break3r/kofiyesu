import { useRef, type ReactNode, type Ref } from "react";
import { t } from "@/i18n/en";
import {
  type ChatAttachment,
  CHAT_FILE_ACCEPT,
  CHAT_MAX_FILES,
  formatFileSize,
  isImageMime,
  isPdfMime,
} from "@/lib/chatAttachments";

interface Props {
  input: string;
  onInputChange: (value: string) => void;
  pendingFiles: ChatAttachment[];
  onPickFiles: (files: FileList | null) => void;
  onRemoveFile: (id: string) => void;
  onSend: () => void;
  isLoading: boolean;
  composerRef?: Ref<HTMLDivElement>;
  escalateBanner?: ReactNode;
  mailtoBanner?: ReactNode;
}

export function ChatComposer({
  input,
  onInputChange,
  pendingFiles,
  onPickFiles,
  onRemoveFile,
  onSend,
  isLoading,
  composerRef,
  escalateBanner,
  mailtoBanner,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = (input.trim().length > 0 || pendingFiles.length > 0) && !isLoading;

  return (
    <div
      ref={composerRef}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:px-6 md:pb-4"
      data-lenis-prevent
      data-lenis-prevent-wheel
    >
      {(escalateBanner || mailtoBanner) && (
        <div className="pointer-events-auto mx-auto w-full max-w-3xl space-y-2">
          {escalateBanner}
          {mailtoBanner}
        </div>
      )}

      <div className="pointer-events-auto mx-auto w-full max-w-3xl">
        {pendingFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className="glass-surface flex max-w-[min(100%,14rem)] items-center gap-2 rounded-xl border border-white/60 py-1.5 pr-1.5 pl-2 text-xs shadow-sm"
              >
                {isImageMime(file.mimeType) ? (
                  <img
                    src={file.previewUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-lg">
                    {isPdfMime(file.mimeType) ? "PDF" : "TXT"}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--text)]">{file.name}</p>
                  <p className="text-[var(--text-muted)]">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(file.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-black/5 hover:text-[var(--color-accent)]"
                  aria-label={t("chat-remove-file")}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="glass-surface flex items-end gap-1.5 rounded-2xl border border-white/60 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.1)] sm:gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={CHAT_FILE_ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => {
              onPickFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={isLoading || pendingFiles.length >= CHAT_MAX_FILES}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-[var(--text-muted)] transition hover:bg-black/5 hover:text-[var(--color-accent)] disabled:opacity-40"
            aria-label={t("chat-attach")}
            title={t("chat-attach-hint")}
          >
            +
          </button>
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
            rows={1}
            placeholder={t("chat-placeholder")}
            disabled={isLoading}
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border-0 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-[var(--text-muted)] focus:ring-0 sm:px-3"
          />
          <button
            type="button"
            disabled={!canSend}
            onClick={onSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-lg text-white transition disabled:opacity-40"
            aria-label={t("chat-send")}
          >
            ↑
          </button>
        </div>
        <p className="mt-1.5 hidden text-center text-[10px] text-[var(--text-muted)] sm:block">
          {t("chat-attach-hint")}
        </p>
      </div>
    </div>
  );
}
