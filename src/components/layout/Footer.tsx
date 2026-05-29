import { social } from "@/content/social";

const labels: Record<string, string> = {
  mail: "Email",
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
};

export function Footer({
  withSocial = true,
  className = "",
}: {
  withSocial?: boolean;
  className?: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`relative w-full border-t border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-12 ${className}`}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        {withSocial ? (
          <nav className="flex flex-wrap justify-center gap-3" aria-label="Social links">
            {social.map((item) => (
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
