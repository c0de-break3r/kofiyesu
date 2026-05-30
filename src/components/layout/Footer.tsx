import { social } from "@/content/social";
import { getCurrentYear } from "@/lib/currentYear";

const labels: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
};

const footerSocial = social.filter((item) => item.name !== "mail" && item.name !== "github");

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
      className={`relative w-full border-t border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-12 ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        {withSocial && footerSocial.length > 0 ? (
          <nav className="flex flex-wrap justify-center gap-3" aria-label="Social links">
            {footerSocial.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target={item.name === "mail" ? undefined : "_blank"}
                rel={item.name === "mail" ? undefined : "noreferrer"}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {labels[item.name]}
              </a>
            ))}
          </nav>
        ) : null}
        <p className="text-center text-sm text-[var(--text-muted)]">
          © {year} Obed Prince Kofi Yesu
        </p>
      </div>
    </footer>
  );
}
