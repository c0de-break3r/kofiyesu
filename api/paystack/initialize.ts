import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { requireSignedInUserId } from "../lib/clerkAuth.js";
import { isDatabaseConfigured, prisma } from "../lib/prisma.js";
import { initializeTransaction, paystackConfigured } from "../lib/paystack.js";
import { paymentToApi } from "../lib/paymentSerializer.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = await requireSignedInUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Sign in required" });
  }

  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: "Database not configured" });
  }

  if (!paystackConfigured()) {
    return res.status(503).json({ error: "Paystack not configured" });
  }

  const body = req.body as { payment_id?: string; email?: string };
  const paymentId = body.payment_id?.trim();
  const email = body.email?.trim();

  if (!paymentId || !email) {
    return res.status(400).json({ error: "payment_id and email required" });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      OR: [{ userId }, { userId: null }],
      status: "pending",
    },
  });

  if (!payment) {
    return res.status(404).json({ error: "Payment not found or already completed" });
  }

  const reference = payment.paystackReference ?? `kfy_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const siteUrl = process.env.SITE_URL?.trim() || "https://kofiyesu.com";
  const callbackUrl = `${siteUrl}/pay/${payment.id}?verify=1`;

  try {
    const initialized = await initializeTransaction({
      email,
      amountGhs: Number(payment.amountGhs),
      reference,
      callbackUrl,
      metadata: {
        payment_id: payment.id,
        inquiry_id: payment.inquiryId,
        user_id: userId,
      },
    });

    const row = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        userId: payment.userId ?? userId,
        userEmail: email,
        paystackReference: initialized.reference,
        paystackAccessCode: initialized.access_code,
      },
    });

    return res.status(200).json({
      payment: paymentToApi(row),
      access_code: initialized.access_code,
      authorization_url: initialized.authorization_url,
      reference: initialized.reference,
    });
  } catch (err) {
    console.error("[paystack/initialize]", err);
    return res.status(502).json({
      error: err instanceof Error ? err.message : "Could not start payment",
    });
  }
}
