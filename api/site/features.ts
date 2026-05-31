import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isDatabaseConfigured, prisma } from "../lib/prisma.js";
import { featureToApi } from "../lib/serializers.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    if (_req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!isDatabaseConfigured()) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(200).json({ features: [] });
    }

    const rows = await prisma.siteFeature.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({ features: rows.map(featureToApi) });
  } catch (err) {
    console.error("[site/features] unhandled", err);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({ features: [] });
  }
}
