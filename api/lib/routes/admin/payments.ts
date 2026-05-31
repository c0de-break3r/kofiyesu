import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../../adminAuth.js";
import { isDatabaseConfigured, prisma } from "../../prisma.js";
import { paymentToApi } from "../../paymentSerializer.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminId = await requireAdminUserId(req);
  if (!adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: "Database not configured" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as {
    inquiry_id?: string;
    title?: string;
    amount_ghs?: number;
    description?: string;
  };

  const inquiryId = body.inquiry_id?.trim();
  const amountGhs = Number(body.amount_ghs);
  const title = body.title?.trim() || "Project payment";

  if (!inquiryId || !amountGhs || amountGhs <= 0) {
    return res.status(400).json({ error: "inquiry_id and amount_ghs required" });
  }

  const inquiry = await prisma.contactInquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) {
    return res.status(404).json({ error: "Inquiry not found" });
  }

  const payment = await prisma.payment.create({
    data: {
      inquiryId: inquiry.id,
      userId: inquiry.userId,
      userEmail: inquiry.userEmail,
      userName: inquiry.userName,
      title,
      description: body.description?.trim() || null,
      amountGhs,
      status: "pending",
    },
  });

  const siteUrl = process.env.SITE_URL?.trim() || "https://kofiyesu.com";
  const payLink = `${siteUrl}/pay/${payment.id}`;

  if (inquiry.userId) {
    const { appendAdminReplyToChat } = await import("../../publishAdminReply.js");
    const formatted = amountGhs.toLocaleString("en-GH", { minimumFractionDigits: 0 });
    await appendAdminReplyToChat({
      userId: inquiry.userId,
      conversationId: inquiry.conversationId,
      replyText: `Obed sent a payment request — **₵${formatted}** for ${title}. [Pay securely with Paystack](${payLink}) (card or Mobile Money).`,
    });
  }

  return res.status(201).json({
    payment: paymentToApi(payment),
    pay_link: payLink,
  });
}
