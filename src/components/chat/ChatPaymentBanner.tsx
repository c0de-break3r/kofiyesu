import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { formatGhs } from "@/content/payments";
import { usePaystackPayment, type PaymentRow } from "@/hooks/usePaystackPayment";
import { t } from "@/i18n/en";

interface Props {
  payments: PaymentRow[];
  onPaid?: () => void;
}

export function ChatPaymentBanner({ payments, onPaid }: Props) {
  const pending = payments.filter((p) => p.status === "pending");
  const { pay, paying } = usePaystackPayment({
    onSuccess: () => onPaid?.(),
  });

  if (!pending.length) return null;

  return (
    <div className="space-y-2">
      {pending.map((p) => (
        <div
          key={p.id}
          className="glass-surface rounded-xl border border-[color-mix(in_srgb,var(--color-accent)_25%,var(--border))] px-3 py-3"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
            {t("pay-request-title")}
          </p>
          <p className="mt-1 text-sm font-bold">{p.title}</p>
          <p className="text-lg font-black tabular-nums">{formatGhs(p.amount_ghs)}</p>
          <div className="mt-2 flex gap-2">
            <Button className="flex-1 text-sm" disabled={paying} onClick={() => void pay(p)}>
              {paying ? t("pay-processing") : t("pay-now")}
            </Button>
            <Link to={`/pay/${p.id}`} className="flex-1">
              <Button variant="border" className="w-full text-sm">
                Details
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
