type AdminStatusMessageProps = {
  type: "success" | "error" | "info";
  message: string;
  onDismiss?: () => void;
};

const styles: Record<AdminStatusMessageProps["type"], string> = {
  success: "border border-green-600/35 bg-green-500/15 text-green-700",
  error: "border border-red-600/35 bg-red-500/15 text-red-700",
  info: "border border-sky-600/35 bg-sky-500/15 text-sky-800",
};

export function AdminStatusMessage({ type, message, onDismiss }: AdminStatusMessageProps) {
  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${styles[type]}`}
    >
      <span className="min-w-0 flex-1">{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="shrink-0 rounded p-0.5 opacity-70 transition hover:opacity-100"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
