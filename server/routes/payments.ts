import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSignedInUserId } from "../../api/lib/clerkAuth.js";
import { isDatabaseConfigured, prisma } from "../../api/lib/prisma.js";
import { paymentToApi } from "../../api/lib/paymentSerializer.js";
import { fallbackPackageAmounts } from "../../api/lib/defaultPricingPackages.js";

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

    if (body.package_id) {
      const dbPkg = await prisma.sitePricingPackage.findFirst({
        where: { slug: body.package_id, published: true },
      });
      if (dbPkg) {
        title = dbPkg.title;
        description = dbPkg.description;
        amountGhs = Number(dbPkg.amountGhs);
        packageId = dbPkg.slug;
      } else if (fallbackPackageAmounts[body.package_id]) {
        const pkg = fallbackPackageAmounts[body.package_id];
        title = pkg.title;
        description = pkg.description;
        amountGhs = pkg.amountGhs;
        packageId = body.package_id;
      } else {
        return res.status(400).json({ error: "Unknown package" });
      }
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
