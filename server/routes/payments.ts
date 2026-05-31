import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSignedInUserId } from "../../api/lib/clerkAuth.js";
import { isDatabaseConfigured, prisma } from "../../api/lib/prisma.js";
import { paymentToApi } from "../../api/lib/paymentSerializer.js";

const PACKAGE_AMOUNTS: Record<string, { title: string; amountGhs: number; description: string }> = {
  discovery: {
    title: "Discovery session",
    amountGhs: 150,
    description: "30-min scoping call — goals, timeline, and fit.",
  },
  deposit: {
    title: "Project kickoff deposit",
    amountGhs: 500,
    description: "Reserve a build slot and start discovery documentation.",
  },
  audit: {
    title: "Security review",
    amountGhs: 800,
    description: "Focused app or API security assessment with written findings.",
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: "Database not configured" });
  }

  const userId = await requireSignedInUserId(req);

  if (req.method === "GET") {
    const paymentId = typeof req.query.id === "string" ? req.query.id : undefined;

    if (paymentId) {
      const row = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          OR: userId ? [{ userId }, { userId: null }] : [{ userId: null }],
        },
      });
      if (!row) return res.status(404).json({ error: "Payment not found" });
      return res.status(200).json({ payment: paymentToApi(row) });
    }

    if (!userId) {
      return res.status(401).json({ error: "Sign in required" });
    }

    const rows = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return res.status(200).json({ payments: rows.map(paymentToApi) });
  }

  if (req.method === "POST") {
    if (!userId) {
      return res.status(401).json({ error: "Sign in required" });
    }

    const body = req.body as {
      package_id?: string;
      inquiry_id?: string;
      title?: string;
      amount_ghs?: number;
      description?: string;
      user_email?: string | null;
      user_name?: string | null;
    };

    let title = body.title?.trim();
    let description = body.description?.trim() || null;
    let amountGhs = body.amount_ghs;
    let packageId = body.package_id?.trim() || null;

    if (body.package_id && PACKAGE_AMOUNTS[body.package_id]) {
      const pkg = PACKAGE_AMOUNTS[body.package_id];
      title = pkg.title;
      description = pkg.description;
      amountGhs = pkg.amountGhs;
      packageId = body.package_id;
    }

    if (!title || !amountGhs || amountGhs <= 0) {
      return res.status(400).json({ error: "Invalid payment details" });
    }

    const row = await prisma.payment.create({
      data: {
        userId,
        inquiryId: body.inquiry_id || null,
        userEmail: body.user_email ?? null,
        userName: body.user_name ?? null,
        title,
        description,
        amountGhs,
        packageId,
        status: "pending",
      },
    });

    return res.status(201).json({ payment: paymentToApi(row) });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export { PACKAGE_AMOUNTS };
