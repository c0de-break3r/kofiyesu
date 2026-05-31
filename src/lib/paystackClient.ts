declare global {
  interface Window {
    PaystackPop?: new () => {
      resumeTransaction: (
        accessCode: string,
        callbacks?: {
          onSuccess?: (response: { reference: string; trans?: string; status?: string }) => void;
          onCancel?: () => void;
        },
      ) => void;
    };
  }
}

let loadPromise: Promise<NonNullable<typeof window.PaystackPop>> | null = null;

export function loadPaystackPop(): Promise<NonNullable<typeof window.PaystackPop>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack is browser-only"));
  }
  if (window.PaystackPop) {
    return Promise.resolve(window.PaystackPop);
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-paystack-inline="true"]');
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.PaystackPop) resolve(window.PaystackPop);
        else reject(new Error("Paystack failed to load"));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.dataset.paystackInline = "true";
    script.onload = () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error("PaystackPop missing"));
    };
    script.onerror = () => reject(new Error("Could not load Paystack"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function openPaystackCheckout(accessCode: string): Promise<{ reference: string }> {
  const PaystackPop = await loadPaystackPop();
  const popup = new PaystackPop();

  return new Promise((resolve, reject) => {
    popup.resumeTransaction(accessCode, {
      onSuccess: (response) => resolve({ reference: response.reference }),
      onCancel: () => reject(new Error("Payment cancelled")),
    });
  });
}

export function paystackPublicKey(): string | undefined {
  return import.meta.env.VITE_PAYSTACK_PUBLIC_KEY?.trim() || undefined;
}

export function isPaystackClientConfigured(): boolean {
  return Boolean(paystackPublicKey());
}
