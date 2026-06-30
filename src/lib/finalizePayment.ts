import { prisma } from "./prisma";
import { appendAdminReplyToChat } from "./publishAdminReply";

export async function finalizePayment(paymentId: string, paidAtIso?: string) {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "paid",
      paidAt: paidAtIso ? new Date(paidAtIso) : new Date(),
    },
  });

  if (payment.inquiryId) {
    await prisma.contactInquiry.update({
      where: { id: payment.inquiryId },
      data: { status: "reviewed" },
    });
  }

  if (payment.userId) {
    const amount = Number(payment.amountGhs).toLocaleString("en-GH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    let conversationId: string | null | undefined;
    if (payment.inquiryId) {
      const inquiry = await prisma.contactInquiry.findUnique({
        where: { id: payment.inquiryId },
        select: { conversationId: true },
      });
      conversationId = inquiry?.conversationId;
    }

    await appendAdminReplyToChat({
      userId: payment.userId,
      conversationId,
      replyText: `Payment received — **₵${amount}** for ${payment.title}. Thanks! Obed will follow up on next steps.`,
    });
  }

  return payment;
}
