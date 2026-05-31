import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSignedInUserId } from "../lib/clerkAuth.js";
import { isDatabaseConfigured, prisma } from "../lib/prisma.js";
import { paystackConfigured, verifyTransaction } from "../lib/paystack.js";
import { paymentToApi } from "../lib/paymentSerializer.js";
import { finalizePayment } from "../lib/finalizePayment.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: "Database not configured" });
  }

  if (!paystackConfigured()) {
    return res.status(503).json({ error: "Paystack not configured" });
  }

  const body = req.body as { reference?: string; payment_id?: string };
  const reference = body.reference?.trim();
  const paymentId = body.payment_id?.trim();

  if (!reference && !paymentId) {
    return res.status(400).json({ error: "reference or payment_id required" });
  }

  const userId = await requireSignedInUserId(req);

  try {
    let payment =
      paymentId &&
      (await prisma.payment.findFirst({
        where: { id: paymentId },
      }));

    if (!payment && reference) {
      payment = await prisma.payment.findFirst({
        where: { paystackReference: reference },
      });
    }

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (userId && payment.userId && payment.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const ref = reference || payment.paystackReference;
    if (!ref) {
      return res.status(400).json({ error: "No Paystack reference" });
    }

    const verified = await verifyTransaction(ref);
    if (verified.status !== "success") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: verified.status === "abandoned" ? "abandoned" : "failed" },
      });
      return res.status(400).json({ error: "Payment not successful", status: verified.status });
    }

    const updated = await finalizePayment(payment.id, verified.paid_at);
    return res.status(200).json({ payment: paymentToApi(updated), verified: true });
  } catch (err) {
    console.error("[paystack/verify]", err);
    return res.status(502).json({
      error: err instanceof Error ? err.message : "Verification failed",
    });
  }
}
