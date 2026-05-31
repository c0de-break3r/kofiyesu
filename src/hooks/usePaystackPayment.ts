import { useAuth, useUser } from "@clerk/clerk-react";
import { useCallback, useState } from "react";
import { openPaystackCheckout } from "@/lib/paystackClient";

export type PaymentRow = {
  id: string;
  title: string;
  description: string | null;
  amount_ghs: number;
  status: string;
  currency: string;
  paystack_reference?: string | null;
};

interface UsePaystackPaymentOptions {
  onSuccess?: (payment: PaymentRow) => void;
  onError?: (message: string) => void;
}

export function usePaystackPayment({ onSuccess, onError }: UsePaystackPaymentOptions = {}) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [paying, setPaying] = useState(false);

  const pay = useCallback(
    async (payment: PaymentRow) => {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) {
        onError?.("Add an email to your account before paying.");
        return;
      }

      setPaying(true);
      try {
        const token = await getToken();
        if (!token) throw new Error("Sign in required");

        const initRes = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payment_id: payment.id, email }),
        });

        if (!initRes.ok) {
          const data = (await initRes.json()) as { error?: string };
          throw new Error(data.error ?? "Could not start payment");
        }

        const initData = (await initRes.json()) as { access_code: string; reference: string };
        const { reference } = await openPaystackCheckout(initData.access_code);

        const verifyRes = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference, payment_id: payment.id }),
        });

        if (!verifyRes.ok) {
          const data = (await verifyRes.json()) as { error?: string };
          throw new Error(data.error ?? "Payment verification failed");
        }

        const verifyData = (await verifyRes.json()) as { payment: PaymentRow };
        onSuccess?.(verifyData.payment);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Payment failed");
      } finally {
        setPaying(false);
      }
    },
    [getToken, onError, onSuccess, user],
  );

  return { pay, paying };
}
