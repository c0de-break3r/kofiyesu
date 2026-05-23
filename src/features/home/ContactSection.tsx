import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { t } from "@/i18n/en";

export function ContactSection() {
  return (
    <section id="contact" className="w-full px-6 py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black">{t("contact")}</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
            Start with a quick intake, then chat with the assistant about projects, pentesting, or collaboration.
          </p>
        </div>
        <Link to="/chat">
          <Button>{t("start-a-project")}</Button>
        </Link>
      </div>
    </section>
  );
}
