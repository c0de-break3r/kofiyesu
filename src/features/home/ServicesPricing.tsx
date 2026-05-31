import { Link } from "react-router-dom";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/Button";
import { formatGhs, currencyName, currencyCode } from "@/content/payments";
import { usePaystackPayment } from "@/hooks/usePaystackPayment";
import { useSiteContent } from "@/hooks/useSiteContent";
import { t } from "@/i18n/en";
import { useState } from "react";

export function ServicesPricing() {
  const { isSignedIn, getToken } = useAuth();
  const { pricingPackages } = useSiteContent();
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { pay, paying } = usePaystackPayment({
    onSuccess: () => setError(null),
    onError: (msg) => setError(msg),
  });

  const startPackage = async (packageSlug: string) => {
    setActiveId(packageSlug);
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ package_id: packageSlug }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Could not create payment");
      }

      const data = (await res.json()) as {
        payment: {
          id: string;
          title: string;
          amount_ghs: number;
          status: string;
          description: string | null;
          currency: string;
        };
      };
      await pay(data.payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setActiveId(null);
    }
  };

  return (
    <section
      id="services-pricing"
      className="relative w-full scroll-mt-[calc(var(--height-header,4.5rem)+0.5rem)] bg-[var(--bg)] px-6 py-12 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
          {t("pricing-eyebrow")}
        </span>
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t("pricing-title")}</h2>
        <p className="mt-3 max-w-2xl text-base text-[var(--text-muted)]">
          {t("pricing-subtitle")} All prices in {currencyName} ({currencyCode}).
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pricingPackages.map((pkg) => (
            <article
              key={pkg.id}
              className={`flex flex-col rounded-2xl border p-5 transition ${
                pkg.featured
                  ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_6%,transparent)] shadow-[0_12px_40px_color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)]"
              }`}
            >
              {pkg.featured ? (
                <span className="mb-2 w-fit rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Popular
                </span>
              ) : null}
              <h3 className="text-lg font-black">{pkg.title}</h3>
              <p className="mt-2 text-2xl font-black tabular-nums text-[var(--color-accent)]">
                {formatGhs(pkg.amount_ghs)}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">{pkg.description}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-[var(--text-muted)]">
                {pkg.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-[var(--color-accent)]">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
              {isSignedIn ? (
                <Button
                  className="mt-5 w-full"
                  variant={pkg.featured ? "accent" : "border"}
                  disabled={paying && activeId === pkg.slug}
                  onClick={() => void startPackage(pkg.slug)}
                >
                  {paying && activeId === pkg.slug ? t("pay-processing") : t("pay-now")}
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button className="mt-5 w-full" variant={pkg.featured ? "accent" : "border"}>
                    {t("pricing-sign-in-pay")}
                  </Button>
                </SignInButton>
              )}
            </article>
          ))}
        </div>

        {error ? (
          <p className="mt-4 text-center text-sm font-semibold text-red-600">{error}</p>
        ) : null}

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          {t("pricing-custom")}{" "}
          <Link to="/chat" className="font-bold text-[var(--color-accent)]">
            {t("start-a-project")}
          </Link>
        </p>
      </div>
    </section>
  );
}
