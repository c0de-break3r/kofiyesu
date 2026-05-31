import type { Payment } from "@prisma/client";

export const paymentToApi = (row: Payment) => ({
  id: row.id,
  inquiry_id: row.inquiryId,
  user_id: row.userId,
  user_email: row.userEmail,
  user_name: row.userName,
  title: row.title,
  description: row.description,
  amount_ghs: Number(row.amountGhs),
  currency: row.currency || "GHS",
  status: row.status,
  package_id: row.packageId,
  paystack_reference: row.paystackReference,
  paid_at: row.paidAt?.toISOString() ?? null,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});
