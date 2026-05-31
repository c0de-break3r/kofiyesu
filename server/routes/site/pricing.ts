import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isDatabaseConfigured, prisma } from "../../../api/lib/prisma.js";
import { pricingPackageToApi } from "../../../api/lib/pricingSerializer.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    if (_req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!isDatabaseConfigured()) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(200).json({ packages: [] });
    }

    const rows = await prisma.sitePricingPackage.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({ packages: rows.map(pricingPackageToApi) });
  } catch (err) {
    console.error("[site/pricing] unhandled", err);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({ packages: [] });
  }
}
