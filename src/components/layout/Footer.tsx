import { profile } from "@/data/profile";
import { getCurrentYear } from "@/lib/currentYear";
import { QuickLinks } from "@/components/ui/QuickLinks";

export function Footer({
  withSocial = true,
  className = "",
}: {
  withSocial?: boolean;
  className?: string;
}) {
  const year = getCurrentYear();

  return (
    <footer
      className={`relative w-full border-t border-[var(--border)] bg-[var(--surface)] px-6 py-12 ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        {withSocial ? <QuickLinks workHref="/#work" /> : null}
        <p className="text-center text-sm text-[var(--text-muted)]">
          © {year} {profile.name}
        </p>
        <p className="text-center font-mono text-[0.65rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
          Build with purpose · Automate with intent · Secure by design
        </p>
      </div>
    </footer>
  );
}
