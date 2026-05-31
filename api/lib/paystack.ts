const PAYSTACK_BASE = "https://api.paystack.co";

import { createHmac } from "node:crypto";

export function paystackSecret(): string | null {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || null;
}

export function paystackConfigured(): boolean {
  return Boolean(paystackSecret());
}

export function ghsToPesewas(amountGhs: number): number {
  return Math.round(amountGhs * 100);
}

export function pesewasToGhs(pesewas: number): number {
  return pesewas / 100;
}

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export async function paystackRequest<T>(
  path: string,
  init: RequestInit & { body?: string } = {},
): Promise<PaystackResponse<T>> {
  const secret = paystackSecret();
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY not configured");

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const json = (await res.json()) as PaystackResponse<T>;
  if (!res.ok || !json.status) {
    throw new Error(json.message || `Paystack error ${res.status}`);
  }
  return json;
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(input: {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<InitializeResult> {
  const { data } = await paystackRequest<InitializeResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: ghsToPesewas(input.amountGhs),
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      channels: ["card", "mobile_money", "bank", "bank_transfer"],
    }),
  });
  return data;
}

export interface VerifyResult {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  customer?: { email?: string };
  metadata?: Record<string, unknown>;
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const { data } = await paystackRequest<VerifyResult>(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
  });
  return data;
}

export function verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  const secret = paystackSecret();
  if (!secret || !signature) return false;
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}
