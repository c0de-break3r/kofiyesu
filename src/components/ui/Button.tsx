import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "accent" | "border" | "ghost" | "glass";

const variantClass: Record<Variant, string> = {
  accent:
    "bg-[var(--color-accent)] text-white hover:brightness-110 shadow-sm",
  border:
    "border border-[var(--border)] bg-transparent text-[var(--text)] hover:border-[var(--color-accent)]",
  ghost: "bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]",
  glass:
    "glass-surface text-[var(--text)] transition hover:bg-white/50 hover:border-white/70",
};

export function Button({
  variant = "accent",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold transition ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
