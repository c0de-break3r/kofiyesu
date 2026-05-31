import { useAuth, useUser } from "@clerk/clerk-react";
import { useCallback, useState } from "react";
import { openPaystackCheckout } from "@/lib/paystackClient";
import { readResponseJson } from "@/lib/readResponseJson";

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

        const initData = await readResponseJson<{ access_code: string; reference: string; error?: string }>(
          initRes,
        );
        if (!initRes.ok) {
          throw new Error(initData?.error ?? "Could not start payment");
        }
        if (!initData?.access_code) {
          throw new Error("Payment service returned an invalid response.");
        }

        const { reference } = await openPaystackCheckout(initData.access_code);

        const verifyRes = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference, payment_id: payment.id }),
        });

        const verifyData = await readResponseJson<{ payment: PaymentRow; error?: string }>(verifyRes);
        if (!verifyRes.ok) {
          throw new Error(verifyData?.error ?? "Payment verification failed");
        }
        if (!verifyData?.payment) {
          throw new Error("Payment verification returned an invalid response.");
        }

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
