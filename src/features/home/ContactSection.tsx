import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { social } from "@/content/social";
import { whatsappContactUrl } from "@/content/payments";
import { t } from "@/i18n/en";

const labels: Record<string, string> = {
  mail: "Email",
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
};

export function ContactSection() {
  return (
    <section className="relative w-full scroll-mt-[calc(var(--height-header,4.5rem)+0.5rem)] bg-[var(--bg)] px-6 pb-10 pt-10 md:pb-12 md:pt-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {t("get-in-touch")}
          </span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t("contact-headline")}</h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{t("contact-subtitle")}</p>

          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Direct contact">
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
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          <Link to="/chat">
            <Button>{t("start-a-project")}</Button>
          </Link>
          <a href={whatsappContactUrl} target="_blank" rel="noreferrer">
            <Button variant="border">{t("whatsapp-cta")}</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
