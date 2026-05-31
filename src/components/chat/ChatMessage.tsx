interface Props {
  role: "user" | "assistant";
  content: string;
}

function formatContent(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export function ChatMessage({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed ${
          isUser
            ? "rounded-br-md bg-[var(--color-accent)] text-white shadow-sm"
            : "rounded-bl-md bg-transparent text-[var(--text)]"
        }`}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
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
