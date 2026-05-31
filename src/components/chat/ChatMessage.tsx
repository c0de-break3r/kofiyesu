import type { ChatMessageAttachmentView } from "@/lib/contactAi";
import { formatFileSize, isImageMime, isPdfMime } from "@/lib/chatAttachments";
import { t } from "@/i18n/en";

interface Props {
  role: "user" | "assistant";
  content: string;
  attachments?: ChatMessageAttachmentView[];
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

  const muted = variant === "user" ? "text-white/80" : "text-[var(--text-muted)]";
  const chipBg =
    variant === "user"
      ? "bg-white/15"
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

export function ChatMessage({ role, content, attachments = [] }: Props) {
  const isUser = role === "user";
  const hasText = content.trim().length > 0;

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed ${
          isUser
            ? "rounded-br-md bg-[var(--color-accent)] text-white shadow-sm"
            : "rounded-bl-md bg-transparent text-[var(--text)]"
        }`}
      >
        <AttachmentList attachments={attachments} variant={isUser ? "user" : "assistant"} />
        {hasText ? (
          <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
        ) : attachments.length > 0 && isUser ? (
          <p className="text-sm text-white/90">{t("chat-sent-attachments")}</p>
        ) : null}
      </div>
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
