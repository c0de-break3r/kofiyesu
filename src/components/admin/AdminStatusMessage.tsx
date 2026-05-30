type AdminStatusMessageProps = {
  type: "success" | "error" | "info";
  message: string;
};

const styles: Record<AdminStatusMessageProps["type"], string> = {
  success: "border border-green-600/35 bg-green-500/15 text-green-700",
  error: "border border-red-600/35 bg-red-500/15 text-red-700",
  info: "border border-sky-600/35 bg-sky-500/15 text-sky-800",
};

export function AdminStatusMessage({ type, message }: AdminStatusMessageProps) {
  return (
    <p
      role="status"
      className={`rounded-lg px-3 py-2 text-sm font-semibold ${styles[type]}`}
    >
      {message}
    </p>
  );
}
