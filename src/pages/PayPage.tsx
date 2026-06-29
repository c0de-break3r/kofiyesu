import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAuth, useUser, SignInButton } from "@clerk/clerk-react";
import { BackIconLink } from "@/components/layout/BackIconLink";
import { Button } from "@/components/ui/Button";
import { formatGhs, currencyName, currencyCode } from "@/content/payments";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { t } from "@/i18n/en";

export type PaymentRow = {
  id: string;
  title: string;
  description: string | null;
  amount_ghs: number;
  status: string;
  currency: string;
  paystack_reference?: string | null;
};

export function PayPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [searchParams] = useSearchParams();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [payment, setPayment] = useState<PaymentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDocumentMeta({
    title: payment ? `Pay ${formatGhs(payment.amount_ghs)} — Obed Prince Kofi Yesu` : undefined,
    canonicalPath: paymentId ? `/pay/${paymentId}` : "/pay",
  });

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      setError("Invalid payment link");
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/payments?id=${encodeURIComponent(paymentId)}`, { headers });
        if (!res.ok) {
          if (!cancelled) setError("Payment not found");
          return;
        }
        const data = (await res.json()) as { payment: PaymentRow };
        if (!cancelled) setPayment(data.payment);

        if (searchParams.get("verify") === "1" && token && data.payment.status === "pending") {
          // Paystack verification removed
        }
      } catch {
        if (!cancelled) setError("Could not load payment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paymentId, getToken, searchParams]);

  const pageClass =
    "min-h-screen bg-[var(--bg)] px-6 py-24 pt-20 md:pt-28 pb-[calc(72px+env(safe-area-inset-bottom))]";

  if (loading) {
    return (
      <main id="main-content" className={pageClass}>
        <div className="mx-auto max-w-md animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded bg-[var(--border)]" />
          <div className="h-24 rounded-xl bg-[var(--border)]" />
        </div>
      </main>
    );
  }

  if (error && !payment) {
    return (
      <main id="main-content" className={pageClass}>
        <div className="mx-auto max-w-md space-y-4">
          <BackIconLink to="/" ariaLabel={t("back-to-home")} />
          <p className="font-bold text-red-600">{error}</p>
          <Link to="/chat" className="text-sm font-semibold text-[var(--color-accent)]">
            Back to chat
          </Link>
        </div>
      </main>
    );
  }

  if (!payment) return null;

  const paid = payment.status === "paid";

  return (
    <main id="main-content" className={pageClass}>
      <div className="mx-auto max-w-md">
        <BackIconLink to="/chat" ariaLabel={t("back-to-home")} />

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
            Secure payment
          </p>
          <h1 className="mt-2 text-2xl font-black">{payment.title}</h1>
          {payment.description ? (
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{payment.description}</p>
          ) : null}

          <p className="mt-6 text-3xl font-black tabular-nums">{formatGhs(payment.amount_ghs)}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {currencyName} ({currencyCode})
          </p>

          {paid ? (
            <div className="mt-6 rounded-xl bg-emerald-500/10 px-4 py-3 text-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {t("pay-success")}
            </div>
          ) : !isSignedIn ? (
            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-[var(--text-muted)]">{t("pay-sign-in")}</p>
              <SignInButton mode="modal">
                <Button className="w-full">{t("chat-sign-in")}</Button>
              </SignInButton>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <Button className="w-full" disabled>
                Paystack integration removed
              </Button>
              <p className="text-center text-[10px] text-[var(--text-muted)]">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}