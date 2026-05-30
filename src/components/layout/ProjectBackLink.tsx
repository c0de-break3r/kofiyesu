import { BackIconLink } from "@/components/layout/BackIconLink";
import { t } from "@/i18n/en";

export function ProjectBackLink({ className = "" }: { className?: string }) {
  return <BackIconLink to="/#projects" ariaLabel={t("back-to-work")} className={className} />;
}
