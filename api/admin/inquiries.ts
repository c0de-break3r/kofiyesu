import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../lib/adminAuth.js";
import { isDatabaseConfigured, prisma } from "../lib/prisma.js";
import { inquiryToApi } from "../lib/serializers.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const adminId = await requireAdminUserId(req);
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!isDatabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const rows = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.status(200).json({ inquiries: rows.map(inquiryToApi) });
  } catch (err) {
    console.error("[admin/inquiries] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
