import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isDatabaseConfigured, prisma } from "../../prisma.js";
import { paystackConfigured, verifyTransaction, verifyWebhookSignature } from "../../paystack.js";
import { finalizePayment } from "../../finalizePayment.js";

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isDatabaseConfigured() || !paystackConfigured()) {
    return res.status(503).json({ error: "Not configured" });
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["x-paystack-signature"] as string | undefined;

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event?: string;
      data?: { reference?: string; status?: string; paid_at?: string };
    };

    if (event.event !== "charge.success") {
      return res.status(200).json({ ok: true, ignored: event.event });
    }

    const reference = event.data?.reference;
    if (!reference) {
      return res.status(400).json({ error: "Missing reference" });
    }

    const payment = await prisma.payment.findFirst({
      where: { paystackReference: reference },
    });

    if (!payment) {
      return res.status(200).json({ ok: true, unknown: reference });
    }

    if (payment.status === "paid") {
      return res.status(200).json({ ok: true, already: true });
    }

    const verified = await verifyTransaction(reference);
    if (verified.status === "success") {
      await finalizePayment(payment.id, verified.paid_at);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[paystack/webhook]", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
