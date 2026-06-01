import { Button } from "@/components/ui/Button";
import { formatGhs } from "@/content/payments";
import { t } from "@/i18n/en";
import type { ProjectQuote } from "@/lib/projectQuote";

interface Props {
  quote: ProjectQuote;
  payingKey: "deposit" | "full" | null;
  onPay: (kind: "deposit" | "full") => void;
}

export function ChatProjectPayment({ quote, payingKey, onPay }: Props) {
  const passThroughTotal = quote.passThroughCosts.reduce((s, i) => s + i.amountGhs, 0);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
        {t("chat-project-payment-title")}
      </p>
      <h3 className="mt-1 text-lg font-black">{quote.projectTitle}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{quote.summary}</p>

      <section className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {t("chat-project-requirements")}
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-[var(--text)]">
          {quote.requirements.map((req) => (
            <li key={req}>{req}</li>
          ))}
        </ul>
      </section>

      {quote.passThroughCosts.length > 0 && (
        <section className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {t("chat-project-passthrough")}
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {quote.passThroughCosts.map((item) => (
              <li
                key={item.label}
                className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.label}</p>
                  {item.note ? <p className="text-xs text-[var(--text-muted)]">{item.note}</p> : null}
                </div>
                <p className="shrink-0 font-semibold tabular-nums">{formatGhs(item.amountGhs)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right text-xs text-[var(--text-muted)]">
            {t("chat-project-passthrough-subtotal")}: {formatGhs(passThroughTotal)}
          </p>
        </section>
      )}

      <section className="mt-4 space-y-1 border-t border-[var(--border)] pt-4 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-[var(--text-muted)]">{t("chat-project-labor")}</span>
          <span className="font-semibold tabular-nums">{formatGhs(quote.laborGhs)}</span>
        </div>
        <div className="flex justify-between gap-2 text-base">
          <span className="font-bold">{t("chat-project-total")}</span>
          <span className="font-black tabular-nums text-[var(--color-accent)]">
            {formatGhs(quote.totalGhs)}
          </span>
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {quote.depositGhs != null && quote.depositGhs < quote.totalGhs && (
          <Button
            className="flex-1"
            variant="accent"
            disabled={payingKey !== null}
            onClick={() => onPay("deposit")}
          >
            {payingKey === "deposit"
              ? t("pay-processing")
              : t("chat-project-pay-deposit", { amount: formatGhs(quote.depositGhs) })}
          </Button>
        )}
        <Button
          className="flex-1"
          variant={quote.depositGhs != null ? "border" : "accent"}
          disabled={payingKey !== null}
          onClick={() => onPay("full")}
        >
          {payingKey === "full" ? t("pay-processing") : t("chat-project-pay-full", { amount: formatGhs(quote.totalGhs) })}
        </Button>
      </div>

      <p className="mt-3 text-center text-[10px] text-[var(--text-muted)]">{t("chat-packages-hint")}</p>
    </div>
  );
}
