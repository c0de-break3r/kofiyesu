import { Button } from "@/components/ui/Button";
import { chatPackages } from "@/content/chatPackages";
import { formatGhs } from "@/content/payments";
import { t } from "@/i18n/en";

interface Props {
  payingPackageId: string | null;
  onPay: (packageId: string) => void;
}

export function ChatPackageOptions({ payingPackageId, onPay }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
        {t("chat-packages-title")}
      </p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{t("chat-packages-hint")}</p>
      <ul className="mt-4 grid gap-3">
        {chatPackages.map((pkg) => (
          <li
            key={pkg.id}
            className={`rounded-xl border p-4 ${
              pkg.featured
                ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_6%,transparent)]"
                : "border-[var(--border)]"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">{pkg.title}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{pkg.description}</p>
              </div>
              <p className="text-lg font-black tabular-nums text-[var(--color-accent)]">
                {formatGhs(pkg.amountGhs)}
              </p>
            </div>
            <ul className="mt-2 list-inside list-disc text-xs text-[var(--text-muted)]">
              {pkg.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <Button
              className="mt-3 w-full sm:w-auto"
              variant={pkg.featured ? "accent" : "border"}
              disabled={payingPackageId !== null}
              onClick={() => onPay(pkg.id)}
            >
              {payingPackageId === pkg.id ? t("pay-processing") : t("pay-now")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
