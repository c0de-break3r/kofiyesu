type AdminStatusMessageProps = {
  type: "success" | "error" | "info";
  message: string;
};

const styles: Record<AdminStatusMessageProps["type"], string> = {
  success: "bg-green-500/10 text-green-700",
  error: "bg-red-500/10 text-red-600",
  info: "bg-sky-500/10 text-sky-800",
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
